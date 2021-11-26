const router = require('koa-router')()
const Role = require('./../models/roleSchema')
const util = require('./../utils/util')

//一级路由
router.prefix('/roles');

//查询所有角色列表
router.get('/allList', async (ctx) => {
    try {
        const list = await Role.find({}, "_id, roleName");
        ctx.body = util.success(list)
    } catch (error) {
        ctx.body = util.fail(`查询失败:${error.stack}`)
    }
    
})

//按页获取角色列表
router.get('/list', async (ctx) => {
    const { roleName } = ctx.request.query;
    const { page, skipIndex } = util.pager(ctx.request.query);
    try {
        let params = {}
        if(roleName) {
            params.roleName = roleName;
        }
        const query = Role.find(params);
        const list = await query.skip(skipIndex).limit(page.pageSize);
        const total = await Role.countDocuments(params);
        ctx.body = util.success({
            list,
            page:{
                ...page,
                total
            }
        })
    } catch (error) {
        ctx.body = util.fail(`查询失败:${error.stack}`)
    }
})

//角色操作 创建 编辑 删除
router.post('/operate', async (ctx) => {
    //const { _id, roleName, remark, action } = ctx.request.body;
    const {_id, roleForm, action } = ctx.request.body;
    let res,info;
    try {
        if(action == 'create') {
            res = await Role.create(roleForm);
            info = '创建成功'
        } else if(action == 'edit') {
            if(roleForm._id) {
                res = await Role.findByIdAndUpdate(roleForm._id, {
                    roleName: roleForm.roleName,
                    remark: roleForm.remark,
                    update: new Date()
                });
                info = '编辑成功'
            } else {
                ctx.body = util.success(`_id不能为空`);
                return ;
            }
        } else {
            if(_id) {
                res = await Role.findByIdAndRemove(_id);
                info = '删除成功'
            } else {
                ctx.body = util.success(`_id不能为空`);
                return ;
            }
            
        }
        ctx.body = util.success(res, info);
    } catch (error) {
        ctx.body = util.success(error.stack);
    }
})

//配置权限
router.post('/update/permission', async (ctx) => {
    const {_id, permissionList} = ctx.request.body;
    try {
        let res = await Role.findByIdAndUpdate(_id, {
            permissionList,
            update: new Date()
        });
        ctx.body = util.success(res, '权限设置成功');
    } catch (error) {
        ctx.body = util.fail('权限设置失败');
    }
})

module.exports = router