// pages/me/me.js
const app = getApp();
const db = wx.cloud.database()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        UserLogin: false,
        admin: false,
        userInfo: null,
        registerStore: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // console.log('个人中心的onLoad执行了')
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        // console.log('个人中心的onShow执行了')
        var userInfo = wx.getStorageSync('UserInfo') // 获取缓存的登录信息
        if (userInfo != "") {
            this.setData({
                UserLogin: true,
                userInfo: userInfo[0]
            })
            this.IsAdmin()
            console.log('已登录', )
        } else {
            this.setData({
                admin: false,
                UserLogin: false,
                userInfo: null
            })
            console.log('未登录', )
        }
        this.getSysMiniInfo()
    },


    // 检查是否为管理员
    IsAdmin() {
        console.log('检查是否为管理员', )
        let openId = app.globalData.openid
        db.collection('UserList').where({
                '_openid': openId, //根据全局的openid去检查该用户是否未管理员
                'admin': true,
            }).count()
            .then(res => {
                if (res.total > 0) {
                    this.setData({
                        admin: true,
                    })
                    console.log('是管理员', )
                } else {
                    this.setData({
                        admin: false,
                    })
                    console.log('不是管理员', )
                }
            })
            .catch(err => {
                console.log('检查是否为管理员失败：', err)
            })
    },

    //获取程序配置
    getSysMiniInfo() {
        db.collection('SysMiniInfo')
            .get({
                success: res => {
                    console.log('获取程序服务成功：', res, )
                    if (res.errMsg == "collection.get:ok") {
                        this.setData({
                            registerStore: res.data[0].registerStore,
                        })
                    }
                },
                fail: err => {
                    console.log('获取程序服务失败：', err)
                }
            })
    },

    // 去登录
    goLogin() {
        wx.navigateTo({
            url: '../login/login',
        })
    },

    // 后台入口
    stagedoor() {
        if (this.data.admin) {
            // 管理员跳转到管理员页面
            wx.navigateTo({
                url: '../../Adminpackage/adminHome/adminHome'
            })
        } else {
            wx.showToast({
                title: '你还不是管理员！',
                icon: 'none',
                mask: true,
                duration: 1000
            })
        }
    },

    /**
     * 跳转到我的收藏
     */
    MyCollection(e) {
        let UserLogin = this.data.UserLogin
        if (UserLogin) {
            wx.navigateTo({
                url: '../mycollection/mycollection',
            })
        } else {
            // 提示登录
            wx.showToast({
                title: '请先登录！',
                icon: 'none',
                mask: true,
                duration: 1000,
            })
        }
    },

    /**
     * 跳转到成为商家
     */
    RegisterStore() {
        let UserLogin = this.data.UserLogin
        if (UserLogin) {
            let openId = app.globalData.openid
            db.collection('StoreList').where({
                    'addType': 'only',
                    '_openid': openId,
                    'Merchants': true
                })
                .count({
                    success: res => {
                        if (res.errMsg == "collection.count:ok" && res.total > 0) {
                            wx.navigateTo({
                                url: '../../StorePackage/myStore/myStore',
                            })
                        } else {
                            wx.navigateTo({
                                url: '../../StorePackage/registerStore/registerStore',
                            })
                        }
                    }
                })
        } else {
            // 提示登录
            wx.showToast({
                title: '请先登录！',
                icon: 'none',
                mask: true,
                duration: 1000,
            })
        }
    },

    // 清除数据退出
    exit() {
        let UserLogin = this.data.UserLogin
        if (UserLogin) {
            wx.showToast({
                title: '退出登录成功',
                icon: 'success',
                mask: true,
                duration: 1000,
            })
            this.setData({
                userInfo: null,
                UserLogin: false,
                admin: false,
            })
            wx.removeStorageSync('UserInfo')
            //更新全局状态
            app.globalData({
                userInfo: null,
                UserLogin: false,
            })
        } else {
            // 提示登录
            wx.showToast({
                title: '请先登录！',
                icon: 'none',
                mask: true,
                duration: 1000,
            })
        }
    },
})