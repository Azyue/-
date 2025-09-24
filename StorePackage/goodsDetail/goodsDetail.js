// StorePackage/goodsDetail/goodsDetail.js
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
        UserLogin: false,
        hasCollection: false,
        Id: '',
        openId: '',
        DataList: [],
        swiperImg: [],

        CommPage: 0, //评论页数
        CoomTotal: 0, //评论条数
        CommList: [], //评论数据
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let Id = options.id
        console.log('传过来的id', Id)

        // 获取全局变量
        app.isLogin()
        let UserLogin = app.globalData.UserLogin
        console.log('全局登录状态', UserLogin)
        this.setData({
            Id,
            UserLogin,
            openId: app.globalData.openid
        })
        this.getDataInfo()

        if (UserLogin) {
            this.hasCollection()
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function (options) {
        this.getCommCount()
        let CommPage = this.data.CommPage
        this.getCommInfo(CommPage)
    },


    //查询信息
    getDataInfo() {
        let Id = this.data.Id
        db.collection('GoodsList').where({
                '_id': Id
            })
            .get({
                success: res => {
                    console.log('查询商品成功：', res)
                    if (res.errMsg == "collection.get:ok") {
                        this.setData({
                            DataList: res.data,
                            swiperImg: res.data[0].detailImg,
                        })
                    }
                },
                fail: err => {
                    console.log('查询商品失败：', err)
                }
            })
    },

    // 大图预览商品详情照片
    ViewDImage(e) {
        console.log('点击图片', e, )
        wx.previewImage({
            urls: this.data.swiperImg,
            current: e.currentTarget.dataset.url
        });
    },


    // 检查自己是否已经收藏
    hasCollection() {
        let openId = app.globalData.openid
        let Id = this.data.Id
        db.collection('Collections')
            .where({
                '_openid': openId,
                'storeId': Id
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
                            CollectionType: 'goods',
                            storeId: this.data.Id,
                            storeName: this.data.DataList[0].storeName,
                            coverImg: this.data.DataList[0].coverImg,
                            goodsName: this.data.DataList[0].goodsName,
                            Price: this.data.DataList[0].Price,
                            PriceUnit: this.data.DataList[0].PriceUnit,
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

    // 查询评论总数
    getCommCount() {
        let Id = this.data.Id
        db.collection('Comments').where({
                'CommPublish': true,
                'CommId': Id
            })
            .count({
                success: res => {
                    console.log('查询评论总条数成功：', res)
                    if (res.errMsg == "collection.count:ok") {
                        this.setData({
                            CommTotal: res.total
                        })
                    }
                },
                fail: err => {
                    console.log('查询评论总条数失败：', err)
                }
            })
    },


    // 查询评论
    getCommInfo(CommPage) {
        this.setData({
            CommList: [], //评论数据
        })
        let Id = this.data.Id
        db.collection('Comments').where({
                'CommPublish': true,
                'CommId': Id
            })
            .orderBy('CommTime', 'desc')
            .skip(CommPage)
            .limit(10)
            .get({
                success: res => {
                    console.log('查询评论成功：', res)
                    if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
                        let data = res.data
                        let list = []
                        for (let i = 0; i < data.length; i++) {
                            list.push(data[i])
                        }
                        this.setData({
                            CommList: list,
                        })
                    }
                },
                fail: err => {
                    console.log('查询评论失败：', err)
                }
            })
    },

    // 大图预览评论详情照片
    preViewMedia(e) {
        console.log('大图预览：', e)
        let type = e.currentTarget.dataset.pic.includes('.jpg') ? 'image' : 'video'
        const sources = [{
            url: e.currentTarget.dataset.pic, // 当前预览资源的url链接
            current: e.currentTarget.dataset.index, // 当前显示的资源序号
            poster: e.currentTarget.dataset.pic, // 当前视频封面
            type: type, // 当前预览的文件类型
        }];
        wx.previewMedia({
            sources, // 需要预览的资源列表
            success(res) {
                console.log('大图预览成功:', res)
            },
            fail(res) {
                console.log('大图预览失败:', res)
            }
        });
    },

    // 跳转到店铺
    goStore(e) {
        let id = e.currentTarget.dataset.id
        let url = '../../StorePackage/storeDetail/storeDetail'
        wx.navigateTo({
            url: `${url}?id=${id}`,
        })

    },

    // 跳转到评论
    goComment(e) {
        console.log('跳转到评论', e.currentTarget.dataset.id)
        if (this.data.UserLogin) {
            let id = e.currentTarget.dataset.id
            let url = '../../pages/comment/comment'
            wx.navigateTo({
                url: `${url}?id=${id}`,
            })
        } else {
            wx.showToast({
                title: '请先登录后再评论！',
                icon: 'none',
                duration: 1000,
            })
        }
    },


    // 删除评论
    deleteComm(e) {
        let Id = e.currentTarget.dataset.id
        console.log("要删除评论的id：", Id)
        let img = e.currentTarget.dataset.img
        console.log('要删除的评论图片：', img, typeof img)
        let vide = e.currentTarget.dataset.vide
        console.log('要删除的评论视频：', vide, typeof vide)
        wx.showModal({
            title: "温馨提示",
            content: "删除后将无法恢复！",
            success: res => {
                if (res.confirm) {
                    wx.showLoading({
                        title: '正在删除...'
                    })
                    let imgArr = img.concat(vide)
                    console.log('要删除的视频/图片：', imgArr, typeof imgArr)
                    wx.cloud.deleteFile({
                        fileList: imgArr, //deleteFile的fileList是数组才能删除
                        success: res => {
                            wx.hideLoading()
                            console.log('评论图片删除成功：', res)
                            if (res.errMsg == "cloud.deleteFile:ok") {
                                db.collection('Comments').doc(Id).remove({
                                    success: res => {
                                        console.log("删除评论成功：", res)
                                        if (res.errMsg == 'document.remove:ok' && res.stats.removed > 0) {
                                            wx.showToast({
                                                title: '删除评论成功',
                                                mask: true,
                                                icon: 'success',
                                                duration: 750
                                            })
                                            this.getCommCount()
                                            let CommPage = this.data.CommPage
                                            this.getCommInfo(CommPage) //刷新数据
                                        }
                                    },
                                    fail: err => {
                                        wx.showToast({
                                            title: '网络错误,操作失败！',
                                            mask: true,
                                            icon: 'none',
                                            duration: 1000
                                        })
                                    }
                                })
                            }
                        },
                        fail: err => {
                            wx.hideLoading()
                            console.log('评论图片删除失败：', err)
                            wx.showToast({
                                title: '网络错误,操作失败！',
                                mask: true,
                                icon: 'none',
                                duration: 1000
                            })
                        }
                    })
                }
            }
        })

    },

    /**
     * 用户点击右上角分享
     */
    //分享给朋友

    onShareAppMessage: function (option) {
        let shareTitle = this.data.DataList[0].goodsName
        let shareImg = this.data.DataList[0].coverImg[0]
        let shaerId = this.data.DataList[0]._id
        let shareobj = {
            title: shareTitle, //分享的标题
            path: '/StorePackage/goodsDetail/goodsDetail?id=' + shaerId, //好友点击分享之后跳转的页面
            imageUrl: shareImg, //分享的图片
        }
        return shareobj //一定要返回对象
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let CommPage = this.data.CommPage
        let total = this.data.CommTotal
        let list = this.data.CommList
        if (list.length < total) {
            CommPage = list.length
            this.getCommInfo(CommPage)
        } else {
            wx.showToast({
                title: '看到底了哟！',
                icon: 'none',
                duration: 1000,
            })
        }
    },
})