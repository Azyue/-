// Adminpackage/storeAudit/storeAudit.js
const db = wx.cloud.database()
const {
    formatTime
} = require("../../utils/util.js")

Page({

    /**
     * 页面的初始数据
     */
    data: {
        Id: '',
        StatusList: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (e) {
        let id = e.id
        //console.log('从商店管理传过来的id', id)
        this.setData({
            Id: id
        })
        this.getStore(id)
    },

    // 查询店铺信息
    getStore(id) {
        wx.showLoading({
            title: '查询中...',
            mask: true
        })
        db.collection('StoreList').where({
            '_id': id
        }).get({
            success: res => {
                wx.hideLoading()
                console.log('查询店铺成功：', res)
                if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
                    this.setData({
                        StatusList: res.data
                    })
                }
            },
            fail: res => {
                wx.hideLoading()
                console.log('查询店铺失败：', res)
            }
        })
    },


    // 删除确认提示
    deleteshowModal() {
        wx.showModal({
            title: '温馨提示！',
            content: '是否确定删除?',
            confirmText: '删除',
            confirmColor: '#ff0080',
            mask: true,
            success: res => {
                if (res.confirm) {
                    // 跳转删除
                    this.Delete()
                }
            }
        })
    },


    // 删除信息
    Delete() {
        wx.showLoading({
            title: '正在删除...',
            mask: true
        })
        let Id = this.data.Id
        db.collection('StoreList').doc(Id).remove({
            success: res => {
                wx.hideLoading()
                if (res.errMsg == "document.remove:ok" && res.stats.removed > 0) {
                    //返回
                    wx.navigateBack({
                        delta: 1,
                    })
                }
            },
            fail: err => {
                wx.hideLoading()
                wx.showToast({
                    title: '删除失败！',
                    icon: 'none',
                    duration: 1000,
                })
            }
        })
    },

    // 打电话
    CallPhone(e) {
        let phoneNumber = e.currentTarget.dataset.phone
        wx.showModal({
            title: '温馨提示',
            content: `是否拨打${phoneNumber}号码？`,
            confirmText: '拨打',
            confirmColor: '#0081ff',
            success: res => {
                if (res.confirm) {
                    wx.makePhoneCall({
                        phoneNumber: phoneNumber,
                    })
                }
            },
            fail: err => {
                console.log(err)
            }
        })
    },


    // 发布按钮
    DoPublishing() {
        wx.showModal({
            title: '温馨提示！',
            content: `确定通过审核吗?`,
            confirmText: '通过',
            confirmColor: '#0081ff',
            success: res => {
                if (res.confirm) {
                    // 发布
                    this.publish()
                }
            }
        })
    },

    // 发布
    publish() {
        let Id = this.data.Id
        let userInfo = wx.getStorageSync('UserInfo')
        let auditor = userInfo[0].nickName
        db.collection('StoreList').doc(Id).update({
            data: {
                Audit: true,
                Merchants: true,
                Auditor: auditor,
                AuditTime: formatTime(new Date()),
            },
            success: res => {
                if (res.errMsg == "document.update:ok" && res.stats.updated > 0) {
                    // 返回
                    wx.navigateBack({
                        delta: 1
                    })
                }
            },
            fail: err => {
                wx.showToast({
                    title: '通过审核失败！',
                    icon: 'none',
                    duration: 1000
                })
            }
        })
    }
})