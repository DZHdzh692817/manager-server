/**
 * 用户管理模块
*/
const router = require('koa-router')()
const User = require('./../models/userSchema')
const Counter = require('./../models/counterSchema')
const util = require('./../utils/util')
const jwt = require('jsonwebtoken')
const md5 = require('md5')
//一级路由
router.prefix('/users')
//用户登录
router.post('/login', async (ctx)=>{
    try {
        const { userName, userPwd } = ctx.request.body;
        /**
         * 返回数据库指定字段，有三种方式
         * 1. 'userId userName userEmail state role deptId roleList'
         * 2. {userId:1,_id:0}
         * 3. select('userId')
         */
        const res = await User.findOne({
            userName,
            userPwd
        },'userId userName userEamil state role deptId roleList');//只返回userId userName....
        const data = res._doc;
        //console.log('data=>', data);

        const token = jwt.sign({
            data,
        },'txc', {expiresIn: '1h'});//代表一个小时过期 {expiresIn: 30}代表30秒 1d一天
        
        if(res) {
            data.token = token
            ctx.body = util.success(data)
        } else {
            ctx.body = util.fail("账号或密码不正确")
        }
    } catch (error) {
        ctx.body = util.fail(error)
    }
})

//用户列表
router.get('/list', async (ctx) => {
    const { userId, userName, state } = ctx.request.query;
    const { page, skipIndex } = util.pager(ctx.request.query);
    let params = {}
    if(userId) {
        params.userId = userId;
    }
    if(userName) {
        params.userName = userName;
    }
    if(state && state != '0') {
        params.state = state;
    }
    try {
        //根据条件查询所有用户列表并过滤掉_id userPwd
        const query = User.find(params, {_id:0, userPwd: 0});
        //之后再分页 跟mysql不同
        const list = await query.skip(skipIndex).limit(page.pageSize);
        //统计
        const total = await User.countDocuments(params);
        ctx.body = util.success({
            page:{
                ...page,
                total
            },
            list
        })
    } catch (error) {
        ctx.body = util.fail(`查询异常:${error.stack}`)
    }
    
})
//用户删除/批量删除
router.post('/delete', async (ctx, next) => {
    //待删除的用户id数组
    const { userIds } = ctx.request.body;
    //或or
    // User.undateMany({
    //     $or: [
    //         { userId: 10001 },
    //         { userId: 10002 }
    //     ]
    // })//改成离职就行了
    const res = await User.updateMany(
        {
            userId: {
                $in: userIds
                // $in: [
                //     1001,
                //     1002,
                // ]
            },
        },
        { state: 2 }
    )
    //是否大于0
    if(res.matchedCount) {
        ctx.body = util.success(res, `共删除成功${res.matchedCount}条`);
        return ;
    }
    ctx.body = util.fail('删除失败');
})
//用户新增/编辑
router.post('/operate', async (ctx) => {
    //console.log(ctx.request.body.params);
    const { action, userId, userName, userEmail, mobile, state, job, roleList, deptId } = ctx.request.body.params;
    
    //新增add
    if(action == 'add') {
        if(!userName || !userName || !deptId) {
            ctx.body = util.fail('参数错误', util.CODE.PARAM_ERROR)
            return ;
        }
        //验证是否重复
        const res = await User.findOne({$or:[{userName},{userEmail}]}, '_id userName userEmail')//返回这几个字段
        if(res) {
            ctx.body = util.fail(`用户已经重复了,信息如下：${res.userName} - ${res.userEmail}`)
        } else {
            //mongodb不可以自动实现自增长的，要手动新增一个表counters
            const doc = await Counter.findOneAndUpdate({_id:'userId'}, {$inc:{sequence_value:1}},{new: true})//自增加1
            //console.log('doc=>', doc)
            try {
                const user = new User({
                    userId: doc.sequence_value,
                    userName,
                    userPwd: md5('123456'),
                    userEmail,
                    mobile,
                    state,
                    role: 1,//角色0系统管理员 1普通用户 默认1
                    roleList,
                    job,
                    deptId
                })
                user.save();
                ctx.body = util.success('', '用户创建成功')
            } catch (error) {
                ctx.body = util.fail(error.stack, '用户创建失败');
            }
        }
    } else {
        //编辑edit
        if(!deptId) {//只判断部门是否为空
            ctx.body = util.fail('部门不能为空', util.CODE.PARAM_ERROR)
            return ;
        }
        try {
            const res = await User.findOneAndUpdate({userId},{mobile, state, job, roleList, deptId})
            ctx.body = util.success(res, '更新成功')
        } catch (error) {
            ctx.body = util.fail(error.stack, '更新失败')
        }
        
    }

})

// router.get('/bar', function (ctx, next) {
//   ctx.body = 'this is a users/bar response'
// })

module.exports = router
