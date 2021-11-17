/**
 * 用户管理模块
*/
const router = require('koa-router')()
const User = require('./../models/userSchema')
const util = require('./../utils/util')
const jwt = require('jsonwebtoken')
//一级路由
router.prefix('/users')

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

// router.get('/', function (ctx, next) {
//   ctx.body = 'this is a users response!'
// })

// router.get('/bar', function (ctx, next) {
//   ctx.body = 'this is a users/bar response'
// })

module.exports = router
