/**
 * 数据库连接
*/ 
const mongoose = require('mongoose')
const config = require('./index')
const log4js = require('./../utils/log-4')

// https://mongoosejs.com/docs/index.html 查看文档已经更新了
//main().catch(err => console.log(err));
main().catch(err => log4js.error('****数据库连接失败****'));

async function main() {
    log4js.info('****数据库连接成功****')
    await mongoose.connect(config.URL);
}
// mongoose.connect('',{
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })

