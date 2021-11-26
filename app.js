const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const log4js = require('./utils/log-4')
const router = require('koa-router')()

const jwt = require('jsonwebtoken')
const koajwt = require('koa-jwt')//jwt中间件
const util = require('./utils/util')
const users = require('./routes/users')
const menus = require('./routes/menus')
const roles = require('./routes/roles')

// error handler
onerror(app)

require('./config/db')

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
// app.use(async (ctx, next) => {
//   const start = new Date()
//   await next()
//   const ms = new Date() - start
//   console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
// })
// app.use(async (ctx, next) => {
//   log4js.info(`log output`)
// })

// logger
app.use(async (ctx, next) => {
    log4js.info(`get params:${JSON.stringify(ctx.request.query)}`)
    log4js.info(`post params:${JSON.stringify(ctx.request.body)}`)
    await next().catch((err) => {
        if (err.status == '401') {
            ctx.status = 200;
            ctx.body = util.fail('Token认证失败', util.CODE.AUTH_ERROR)
        } else {
            throw err;
        }
    })
})

app.use(koajwt({secret: 'txc'}).unless({
    path: [/^\/api\/users\/login/]
}))//拦截 登录不用拦截

router.prefix("/api")

router.use(users.routes(), users.allowedMethods())
router.use(menus.routes(), menus.allowedMethods())
router.use(roles.routes(), roles.allowedMethods())
app.use(router.routes(), router.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  //console.error('server error', err, ctx)
  log4js.error(`${err.stack}`)
});

module.exports = app
