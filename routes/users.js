/**
 * 用户管理模块
*/
const router = require('koa-router')()
const User = require('./../models/userSchema')
const util = require('./../utils/util')
//一级路由
router.prefix('/users')

router.post('/login', async (ctx)=>{
    try {
        const { userName, userPwd } = ctx.request.body;
        const res = await User.findOne({userName,userPwd})
        if(res) {
            ctx.body = util.success(res)
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
