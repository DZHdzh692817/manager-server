const router = require('koa-router')()
const Menu = require('./../models/menuSchema')
const util = require('./../utils/util')

//一级路由
router.prefix('/menu');

//菜单列表查询
router.get('/list', async (ctx) => {
    const { menuName, menuState } = ctx.request.query;
    const params = {}
    if(menuName) {
        params.menuName = menuName;
    }
    if(menuState) {
        params.menuState = menuState;
    }
    let rootList = await Menu.find(params) || [];

    const permissionList = util.getTreeMenu(rootList, null, [])
    ctx.body = util.success(permissionList);
})

//二级路由
//新增菜单 、编辑菜单、删除菜单
router.post('/operate', async (ctx) => {
    const { _id, action, menuForm } = ctx.request.body;
    let res,info;
    try {
        if(action == 'add') {
            res = await Menu.create(menuForm);//create
            info = '创建成功';
        }else if(action == 'edit') {
            menuForm.updateTime = new Date();
            res = await Menu.findByIdAndUpdate(menuForm._id, menuForm);
            info = '编辑成功';
        } else {
            res = await Menu.findByIdAndRemove(_id);
            await Menu.deleteMany({ parentId: { $all: [_id] } });//删除_id下面的的数据 关联的子数组
            info = '删除成功';
        }
        ctx.body = util.success('', info);
    } catch (error) {
        ctx.body = util.fail(error.stack);
    }
    
})


module.exports = router