// StorePackage/storeDetail/storeDetail.js
const app = getApp()
const db = wx.cloud.database()
const {
    formatTime
} = require("../../utils/util.js")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        goodstotal: 0,
        goodspage: 0,
        cheftotal: 0,
        chefpage: 0,
        UserLogin: false,
        hasCollection: false, // 收藏状态，默认为否
        storeId: '', //店铺id
        bossPhone: '', //店铺电话
        storeName: '', //分享时的标题
        storeIntro: '', //店铺简介
        Address: '', //店铺地址
        StoreInfo: [],
        bannerImg: [],
        goodsList: [],
        chefList: [],
        longitude: "",
        latitude: "",
        Distance: '',
        type: 'goods',
        goodsNav: false,
        chefNav: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let storeId = options.id
        console.log('传过来的店铺id', storeId)
        app.isLogin() // 获取全局变量
        let UserLogin = app.globalData.UserLogin
        console.log('全局登录状态', UserLogin)
        this.setData({
            storeId,
            UserLogin,
        })
        this.getStoreInfo()

        if (UserLogin) {
            this.hasCollection()
        }

        let myCity = wx.getStorageSync('MyCity');
        if (myCity) {
            this.setData({
                longitude: myCity.longitude,
                latitude: myCity.latitude,
            })
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function (options) {},

    // 切换导航栏
    ChangeTab(e) {
        let type = e.currentTarget.dataset.type
        if (type == 'goods') {
            //恢复初始值
            this.setData({
                goodsNav: true,
                chefNav: false,
                type: type,
                goodsList: [],
                goodstotal: 0,
                goodspage: 0,
            })
            this.goodsCount()
            let gpage = 0
            this.getGoods(gpage)

        }
        if (type == 'chef') {
            //恢复初始值
            this.setData({
                goodsNav: false,
                chefNav: true,
                type: type,
                chefList: [],
                cheftotal: 0,
                chefpage: 0,
            })
            this.chefCount()
            let cpage = 0
            this.getChef(cpage)
        }
    },

    //查询商店信息
    getStoreInfo() {
        let storeId = this.data.storeId
        console.log('查询店铺的id', storeId)
        db.collection('StoreList').where({
                '_id': storeId
            })
            .get({
                success: res => {
                    console.log('查询商家成功', res)
                    if (res.errMsg == "collection.get:ok") {
                        let lat1 = this.data.latitude
                        let lng1 = this.data.longitude //自己的位置
                        let lat2 = res.data[0].latitude
                        let lng2 = res.data[0].longitude //商店的位置
                        var radLat1 = lat1 * Math.PI / 180.0
                        var radLat2 = lat2 * Math.PI / 180.0
                        var a = radLat1 - radLat2
                        var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0
                        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)))
                        s = s * 6378.137 // 地球半径;
                        s = Math.round(s * 10000) / 10000
                        let Distance = s.toFixed(2)
                        this.setData({
                            Distance,
                            StoreInfo: res.data,
                            bannerImg: res.data[0].bannerImg,
                            bossPhone: res.data[0].bossPhone,
                            storeName: res.data[0].storeName,
                            storeIntro: res.data[0].storeIntro,
                            Address: res.data[0].Address,
                            goodsNav: true,
                            chefNav: false,
                        })
                        this.goodsCount()
                        let gpage = this.data.goodspage
                        this.getGoods(gpage)
                    }
                },
                fail: err => {
                    console.log('查询商家失败', err)
                }
            })
    },

    // 查询商品总条数
    goodsCount() {
        let storeId = this.data.storeId
        db.collection('GoodsList')
            .where({
                'storeId': storeId
            })
            .count({
                success: res => {
                    console.log('查询商品总条数成功', res.total)
                    if (res.errMsg == "collection.count:ok") {
                        this.setData({
                            goodstotal: res.total,
                        })
                    }
                },
                fail: err => {
                    console.log('查询商品总条数失败', err)
                }
            })
    },
    /**
     * 商品列表
     */
    getGoods(gpage) {
        let storeId = this.data.storeId
        console.log('查询商品的id：', storeId)
        db.collection('GoodsList').where({
                'storeId': storeId
            })
            .skip(gpage)
            .limit(10)
            .orderBy('score', 'desc')
            .get({
                success: res => {
                    console.log('查询商品列表成功：', res)
                    if (res.errMsg == "collection.get:ok") {
                        let data = res.data
                        if (data.length > 0) {
                            let list = []
                            for (let i = 0; i < data.length; i++) {
                                list.push(data[i])
                            }
                            this.setData({
                                goodsList: list,
                                nothing: false,
                            })
                        } else {
                            wx.showToast({
                                title: '暂时没有商品数据',
                                icon: 'none',
                                duration: 800,
                            })
                        }
                    }
                },
                fail: err => {
                    console.log('查询商品列表失败', err)
                }
            })
    },

    // 查询厨师总条数
    chefCount() {
        let storeId = this.data.storeId
        db.collection('ChefList')
            .where({
                'storeId': storeId
            })
            .count({
                success: res => {
                    console.log('查询厨师总条数成功', res.total)
                    if (res.errMsg == "collection.count:ok") {
                        this.setData({
                            cheftotal: res.total,
                        })
                    }
                },
                fail: err => {
                    console.log('查询厨师总条数失败', err)
                }
            })
    },

    /**
     * 厨师列表
     */
    getChef(cpage) {
        let storeId = this.data.storeId
        db.collection('ChefList').where({
                'storeId': storeId
            })
            .skip(cpage)
            .limit(10)
            .orderBy('score', 'desc')
            .get({
                success: res => {
                    console.log('查询厨师列表成功：', res)
                    if (res.errMsg == "collection.get:ok") {
                        let data = res.data
                        if (data.length > 0) {
                            let list = []
                            for (let i = 0; i < data.length; i++) {
                                list.push(data[i])
                            }
                            this.setData({
                                chefList: list,
                                nothing: false,
                            })
                        } else {
                            wx.showToast({
                                title: '暂时没有厨师数据',
                                icon: 'none',
                                duration: 800,
                            })
                        }
                    }
                },
                fail: err => {
                    console.log('查询厨师列表失败', err)
                }
            })
    },


    // 检查自己是否已经收藏
    hasCollection() {
        let storeId = this.data.storeId
        let openId = app.globalData.openid
        db.collection('Collections')
            .where({
                'storeId': storeId,
                '_openid': openId
            })
            .count({
                success: res => {
                    if (res.errMsg == "collection.count:ok") {
                        if (res.total > 0) {
                            console.log("已收藏")
                            this.setData({
                                hasCollection: true // 已收藏
                            })
                        }
                    }
                },
                fail: err => {
                    console.log("检查是否已收藏失败", err)
                }
            })
    },

    // 收藏
    addCollection() {
        if (this.data.UserLogin) {
            // 检查登录状态
            if (this.data.hasCollection) {
                wx.showToast({
                    title: '已收藏',
                    duration: 1000,
                    icon: 'none'
                })
                return
            } else {
                // 未收藏，开始收藏
                db.collection('Collections')
                    .add({
                        data: {
                            CollectionType: 'store',
                            storeId: this.data.storeId,
                            coverImg: this.data.StoreInfo[0].coverImg,
                            storeName: this.data.storeName,
                            Address: this.data.Address,
                            CollectionTime: formatTime(new Date())
                        },
                        success: res => {
                            if (res.errMsg == "collection.add:ok") {
                                this.setData({
                                    hasCollection: true
                                })
                                wx.showToast({
                                    title: '收藏成功',
                                    mask: true,
                                    duration: 1000,
                                    icon: 'success'
                                })
                            }
                        },
                        fail: err => {
                            console.log("收藏失败", err)
                            wx.showToast({
                                title: '网络错误！收藏失败',
                                duration: 1000,
                                icon: 'none'
                            })
                        }
                    })
            }
        } else {
            wx.showToast({
                title: '请先登录后再收藏！',
                icon: 'none',
                duration: 1000,
            })
        }
    },

    // 跳转到商品详情页
    goGoodsDetail(e) {
        let id = e.currentTarget.dataset.id
        let url = '../../StorePackage/goodsDetail/goodsDetail'
        wx.navigateTo({
            url: `${url}?id=${id}`,
        })
    },
    // 跳转到厨师详情页
    goChefDetail(e) {
        let id = e.currentTarget.dataset.id
        let url = '../../StorePackage/chefDetail/chefDetail'
        wx.navigateTo({
            url: `${url}?id=${id}`,
        })
    },

    // 导航
    navRoad() {
        wx.openLocation({
            latitude: this.data.StoreInfo[0].latitude,
            longitude: this.data.StoreInfo[0].longitude,
            name: this.data.storeName,
            address: this.data.Address,
            scale: 17
        })
    },

    // 打电话预约
    CallPhone(e) {
        console.log('点击了拨打电话', e, e.currentTarget.dataset.phone)
        let phoneNumber = e.currentTarget.dataset.phone
        wx.showModal({
            title: '温馨提示',
            content: `是否拨打${phoneNumber}号码？`,
            confirmText: '确定拨打',
            confirmColor: '#0081ff',
            cancelText: '取消',
            cancelColor: '#acb5bd',
            success: res => {
                if (res.confirm) {
                    wx.makePhoneCall({
                        phoneNumber: phoneNumber,
                        success: res => {},
                        fail: err => {
                            console.log(err)
                        }
                    })
                }
            },
            fail: err => {
                console.log(err)
            }
        })

    },

    /**
     * 用户点击右上角分享
     */
    //分享给朋友

    onShareAppMessage: function (option) {
        let shareTitle = this.data.StoreInfo[0].storeName
        let shareImg = this.data.StoreInfo[0].coverImg[0]
        let shaerId = this.data.StoreInfo[0]._id
        let shareobj = {
            title: shareTitle + '，欢迎您的光临', //分享的标题
            path: '/StorePackage/storeDetail/storeDetail?id=' + shaerId, //好友点击分享之后跳转的页面
            imageUrl: shareImg, //分享的图片
        }
        return shareobj //一定要返回对象
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let type = this.data.type
        if (type == 'goods') {
            let total = this.data.goodstotal
            console.log('触底的商品条数', total)
            let page = this.data.goodspage
            console.log('触底商品page', page)
            let List = this.data.goodsList
            if (List.length < total) {
                gpage = List.length
                this.getGoods(gpage)
            } else {
                wx.showToast({
                    title: '看到底了哟！',
                    icon: 'none',
                    duration: 1000,
                })
            }
        }
        if (type == 'chef') {
            let total = this.data.cheftotal
            console.log('触底的厨师条数', total)
            let page = this.data.chefpage
            console.log('触底厨师page', page)
            let List = this.data.chefList
            if (List.length < total) {
                cpage = List.length
                this.getChef(cpage)
            } else {
                wx.showToast({
                    title: '看到底了哟！',
                    icon: 'none',
                    duration: 1000,
                })
            }
        }
    },
})