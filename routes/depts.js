const router = require('koa-router')()
const Dept = require('./../models/deptSchema')
const util = require('./../utils/util')

//一级路由
router.prefix('/dept');

router.get('/list', async (ctx) => {
    let { deptName } = ctx.request.query;
    let params = {};
    if(deptName) {
        params.deptName = deptName;
    }
    let rootList = await Dept.find(params);
    if (deptName) {
        ctx.body = util.success(rootList);
    } else {
        let tressList = getTreeDept(rootList, null, [])
        ctx.body = util.success(tressList)
    }
})

// 递归拼接树形列表
function getTreeDept(rootList, id, list) {
    for (let i = 0; i < rootList.length; i++) {
        let item = rootList[i]
        if (String(item.parentId.slice().pop()) == String(id)) {
            list.push(item._doc)
        }
    }
    list.map(item => {
        item.children = []
        getTreeDept(rootList, item._id, item.children)
        if (item.children.length == 0) {
            delete item.children;
        }
    })
    return list;
}

//部门操作 创建 编辑 删除
router.post('/operate', async (ctx) => {
    const {_id, action, deptForm } = ctx.request.body;
    let res, info;
    try {
        if(action == 'create') {
            res = await Dept.create(deptForm);
            info = '创建成功';
        } else if(action == 'edit') {
            res = await Dept.findByIdAndUpdate(deptForm._id, deptForm);
            info = '编辑成功';
        } else if(action == 'delete') {
            res = await Dept.findByIdAndRemove(_id);
            await Dept.deleteMany({parentId: { $all: [_id]} });//删除所有的
            info = '删除成功';
        }
        ctx.body = util.success('', info);
    } catch (error) {
        ctx.body = util.fail(error.stack);
    }
    
})



module.exports = router;