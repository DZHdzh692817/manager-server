const mongoose = require('mongoose')
const roleSchema = mongoose.Schema({
    roleName: String,
    remark: String,
    permissionList: {
        checkedKeys: [],//选中的子菜单
        halfCheckedKeys: [],//半选中的主菜单
    },
    createTime: {
        type: Date,
        default: Date.now()
    },
    updateTime: {
        type: Date,
        default: Date.now()
    },
})

module.exports = mongoose.model("roles",roleSchema,"roles")