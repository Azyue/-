// Adminpackage/storeApprovoed/storeApprovoed.js
var app = getApp();
const db = wx.cloud.database()
const {
    formatTime
} = require("../../utils/util.js")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        superAdmin: false,
        goodstotal: 0,
        goodspage: 0,
        cheftotal: 0,
        chefpage: 0,
        type: 'swiper',
        swiperNav: true,
        coverNav: false,
        goodsNav: false,
        chefNav: false,
        nothing: false,
        forbiddenSwitch: false,
        storeId: '',
        StoreInfo: '',
        bannerImg: [],
        coverImg: [],
        goodsList: [],
        chefList: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let storeId = options.id
        this.setData({
            storeId
        })
        this.getStore()
        this.adminInfo()
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        let type = this.data.type
        if (type == 'swiper') {
            this.setData({
                bannerImg: [],
                StoreInfo: '',
            })
            this.getStore()
        }
        if (type == 'cover') {
            this.setData({
                coverImg: [],
                swiperNav: false,
                coverNav: true,
                goodsNav: false,
                chefNav: false,
            })
            this.getStore()
        }
        if (type == 'goods') {
            this.setData({
                swiperNav: false,
                coverNav: false,
                goodsNav: true,
                chefNav: false,
                goodsList: [],
                goodstotal: 0,
                goodspage: 0,
            })
            this.goodsCount()
            let page = this.data.goodspage
            this.getGoods(page)
        }
        if (type == 'chef') {
            this.setData({
                swiperNav: false,
                coverNav: false,
                goodsNav: false,
                chefNav: true,
                chefList: [],
                cheftotal: 0,
                chefpage: 0,
            })
            this.chefCount()
            let page = this.data.chefpage
            this.getChef(page)
        }
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
        //清除缓存

    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    //检查是否为超级管理员，按权限显示模块
    adminInfo() {
        let openId = app.globalData.openid
        //console.log('全局openid', openId)
        wx.showLoading({
            title: '正在验证...',
            mask: true
        })
        db.collection('UserList').where({
            '_openid': openId, //根据全局openid检查该管理员是否未超级管理员
            'admin': true,
        }).field({
            '_openid': true,
            'level': true
        }).get({
            success: res => {
                wx.hideLoading()
                //console.log('查询成功')
                if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
                    //console.log('level', res.data[0].level)
                    //console.log('openid', res.data[0]._openid)
                    if (res.data[0].level === 2 && res.data[0]._openid === openId) {
                        console.log('是超级管理员')
                        this.setData({
                            superAdmin: true, //是超级管理员
                        })
                    } else {
                        console.log('是普通管理员')
                        this.setData({
                            superAdmin: false, //不是超级管理员
                        })
                    }
                }
            },
            fail: err => {
                wx.hideLoading()
            }
        })
    },

    // 切换
    ChangeTab(e) {
        let type = e.currentTarget.dataset.type
        if (type == 'swiper') {
            //恢复初始值
            this.setData({
                swiperNav: true,
                coverNav: false,
                goodsNav: false,
                chefNav: false,
                type: type,
            })
            this.getStore()
        }
        if (type == 'cover') {
            //恢复初始值
            this.setData({
                swiperNav: false,
                coverNav: true,
                goodsNav: false,
                chefNav: false,
                type: type,
                coverImg: [],

            })
            this.getStore()
        }
        if (type == 'goods') {
            //恢复初始值
            this.setData({
                swiperNav: false,
                coverNav: false,
                goodsNav: true,
                chefNav: false,
                type: type,
                goodsList: [],
                goodstotal: 0,
                goodspage: 0,
            })
            this.goodsCount()
            let page = 0
            this.getGoods(page)

        }
        if (type == 'chef') {
            //恢复初始值
            this.setData({
                swiperNav: false,
                coverNav: false,
                goodsNav: false,
                chefNav: true,
                type: type,
                chefList: [],
                cheftotal: 0,
                chefpage: 0,
            })
            this.chefCount()
            let page = 0
            this.getChef(page)
        }
    },

    /**
     * 查询商店信息
     */
    getStore() {
        let storeId = this.data.storeId
        db.collection('StoreList').where({
                '_id': storeId
            })
            .get({
                success: res => {
                    console.log('查询商店成功', res)
                    if (res.errMsg == "collection.get:ok") {
                        this.setData({
                            StoreInfo: res.data,
                            forbiddenSwitch: res.data[0].forbidden,
                            bannerImg: res.data[0].bannerImg,
                            coverImg: res.data[0].coverImg,
                        })
                    }
                },
                fail: err => {
                    console.log('查询商店失败', err)
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
    getGoods(page) {
        let storeId = this.data.storeId
        let goodsList = this.data.goodsList
        db.collection('GoodsList').where({
                'storeId': storeId
            })
            .skip(page)
            .limit(10)
            .orderBy('addTime', 'desc')
            .get({
                success: res => {
                    if (res.errMsg == "collection.get:ok") {
                        let data = res.data
                        if (data.length > 0) {
                            for (let i = 0; i < data.length; i++) {
                                goodsList.push(data[i])
                            }
                            this.setData({
                                goodsList: goodsList,
                                nothing: false,
                            })
                        } else {
                            this.setData({
                                nothing: true,
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
    getChef(page) {
        let storeId = this.data.storeId
        let chefList = this.data.chefList
        db.collection('ChefList').where({
                'storeId': storeId
            })
            .skip(page)
            .limit(10)
            .orderBy('addTime', 'desc')
            .get({
                success: res => {
                    if (res.errMsg == "collection.get:ok") {
                        let data = res.data
                        if (data.length > 0) {
                            for (let i = 0; i < data.length; i++) {
                                chefList.push(data[i])
                            }
                            this.setData({
                                chefList: chefList,
                                nothing: false,
                            })
                        } else {
                            this.setData({
                                nothing: true,
                            })
                        }
                    }
                },
                fail: err => {
                    console.log('查询厨师列表失败', err)
                }
            })
    },

    /**
     * 店铺长按
     */
    longPressStore(e) {
        let id = e.currentTarget.dataset.id
        console.log('长按获取的_id：', id)
        wx.showActionSheet({
            itemList: ['评分', '修改'],
            success: res => {
                if (res.tapIndex === 0) {
                    //评分模式
                    wx.navigateTo({
                        url: '../storeScore/storeScore?id=' + id,
                    })
                }
                if (res.tapIndex === 1) {
                    //修改模式
                    wx.navigateTo({
                        url: '../editStore/editStore?id=' + id,
                    })
                }
            },
            fail: err => {
                //console.log('点击了取消')
            }
        })
    },

    /**
     * 商品长按
     */
    longPressGoods(e) {
        let id = e.currentTarget.dataset.id
        console.log('长按获取的id', id)
        let name = e.currentTarget.dataset.name
        console.log('长按获取的name', name)
        let img = e.currentTarget.dataset.img
        console.log('长按获取的img', img)
        let dimg = e.currentTarget.dataset.dimg
        console.log('长按获取的dimg', dimg)
        wx.showActionSheet({
            itemList: ['评分', '删除'],
            success: res => {
                if (res.tapIndex === 0) {
                    //评分模式
                    wx.navigateTo({
                        url: '../goodsScore/goodsScore?id=' + id,
                    })
                }
                if (res.tapIndex === 1) {
                    //删除模式
                    this.deleteGoods(id, name, img, dimg)
                }
            },
            fail: err => {
                //console.log('点击了取消')
            }
        })
    },

    // 删除商品
    deleteGoods(id, name, img, dimg) {
        wx.showModal({
            title: '温馨提醒',
            content: `确定删除 ${name} ? 删除后将不可恢复！`,
            confirmText: '确定删除',
            confirmColor: '#ff0080',
            cancelText: '取消',
            mask: true,
            success: res => {
                if (res.confirm) {
                    // 点击确认
                    wx.showLoading({
                        title: '删除中...',
                        mask: true
                    })
                    let imgArr = img.concat(dimg)
                    wx.cloud.deleteFile({
                        fileList: imgArr,
                        success: res => {
                            wx.hideLoading()
                            if (res.errMsg == "cloud.deleteFile:ok") {
                                db.collection('GoodsList').doc(id).remove({
                                    success: res => {
                                        if (res.errMsg == "document.remove:ok" && res.stats.removed > 0) {
                                            wx.showToast({
                                                title: '删除成功',
                                                icon: "success",
                                                duration: 1000,
                                            })
                                            //设置初始值
                                            this.setData({
                                                goodstotal: 0,
                                                goodspage: 0,
                                                goodsList: []
                                            })
                                            this.onShow()
                                        }
                                    },
                                    fail: err => {
                                        wx.showToast({
                                            title: '删除失败！',
                                            icon: 'none',
                                            duration: 1000,
                                        })
                                    }
                                })
                            }
                        },
                        fail: err => {
                            wx.hideLoading()
                            wx.showToast({
                                title: '删除图片失败',
                                icon: 'none',
                                duration: 1000,
                            })
                        }
                    })
                }
            }
        })
    },

    /**
     * 厨师长按
     */
    longPressChef(e) {
        let id = e.currentTarget.dataset.id
        console.log('长按获取的id', id)
        let name = e.currentTarget.dataset.name
        console.log('长按获取的name', name)
        let img = e.currentTarget.dataset.img
        console.log('长按获取的img', img)
        let cimg = e.currentTarget.dataset.cimg
        console.log('长按获取的cimg', cimg)

        wx.showActionSheet({
            itemList: ['评分', '删除'],
            success: res => {
                if (res.tapIndex === 0) {
                    //评分模式
                    wx.navigateTo({
                        url: '../chefScore/chefScore?id=' + id,
                    })
                }
                if (res.tapIndex === 1) {
                    //删除模式
                    this.deleteChef(id, name, img, cimg)
                }
            },
            fail: err => {}
        })
    },

    // 删除厨师
    deleteChef(id, name, img, cimg) {
        wx.showModal({
            title: '温馨提醒',
            content: `确定删除 ${name} ? 删除后将不可恢复！`,
            confirmText: '确定删除',
            confirmColor: '#ff0080',
            cancelText: '取消',
            mask: true,
            success: res => {
                if (res.confirm) {
                    // 点击确认
                    wx.showLoading({
                        title: '删除中...',
                        mask: true
                    })
                    let imgArr = img.concat(cimg)
                    wx.cloud.deleteFile({
                        fileList: imgArr,
                        success: res => {
                            wx.hideLoading()
                            if (res.errMsg == "cloud.deleteFile:ok") {
                                db.collection('ChefList').doc(id).remove({
                                    success: res => {
                                        if (res.errMsg == "document.remove:ok" && res.stats.removed > 0) {
                                            wx.showToast({
                                                title: '删除成功',
                                                icon: "success",
                                                duration: 1000,
                                            })
                                            //设置初始值
                                            this.setData({
                                                cheftotal: 0,
                                                chefpage: 0,
                                                chefList: []
                                            })
                                            this.onShow()
                                        }
                                    },
                                    fail: err => {
                                        wx.showToast({
                                            title: '删除失败！',
                                            icon: 'none',
                                            duration: 1000,
                                        })
                                    }
                                })
                            }
                        },
                        fail: err => {
                            wx.hideLoading()
                            wx.showToast({
                                title: '删除图片失败',
                                icon: 'none',
                                duration: 1000,
                            })
                        }
                    })
                }
            }
        })
    },

    // 打电话
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

    // 禁用状态
    forbidden(e) {
        let Id = this.data.storeId
        console.log('点击了switch', e)
        let value = e.detail.value
        if (value) {
            console.log('修改为true')
            wx.showLoading({
                title: '加载中...',
                mask: true
            })
            db.collection('StoreList').doc(Id).update({
                data: {
                    forbidden: true,
                    ForbiddenTime: formatTime(new Date())
                },
                success: res => {
                    wx.hideLoading()
                    if (res.errMsg == "document.update:ok" && res.stats.updated > 0) {
                        console.log('禁用店铺成功', res)
                        this.forbiddenAllGoods()
                    }
                },
                fail: err => {
                    wx.hideLoading()
                    console.log('禁用失败', err)
                    wx.showToast({
                        title: '网络错误，禁用失败！',
                        icon: 'none',
                        mask: true,
                        duration: 1500
                    })
                }
            })
        } else {
            wx.showLoading({
                title: '加载中...',
                mask: true
            })
            console.log('修改为flase')
            db.collection('StoreList').doc(Id).update({
                data: {
                    forbidden: false,
                },
                success: res => {
                    wx.hideLoading()
                    if (res.errMsg == "document.update:ok" && res.stats.updated > 0) {
                        console.log('解除禁用店铺成功', res)
                        this.OpenforbiddenAllGoods()
                    }
                },
                fail: err => {
                    wx.hideLoading()
                    console.log('解除禁用失败', err)
                    wx.showToast({
                        title: '网络错误，解除禁用失败！',
                        icon: 'none',
                        mask: true,
                        duration: 1500
                    })
                }
            })
        }
    },

    //禁用该店铺下所有的商品
    forbiddenAllGoods() {
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        let storeId = this.data.storeId
        db.collection('GoodsList').where({
                'storeId': storeId
            })
            .get({
                success: res => {
                    console.log('查询商品列表成功：', res)
                    if (res.errMsg == "collection.get:ok") {
                        let data = res.data
                        if (data.length > 0) {
                            for (let i = 0; i < data.length; i++) {
                                db.collection('GoodsList').doc(data[i]._id).update({
                                    data: {
                                        forbidden: true,
                                    },
                                    success: res => {
                                        console.log('禁用商品成功：', res)
                                        console.log('i：', i, 'data.length：', data.length)
                                        if (res.errMsg == "document.update:ok" && i == data.length - 1) {
                                            wx.hideLoading()
                                            this.forbiddenAllchef()
                                        }
                                    },
                                    fail: err => {
                                        wx.hideLoading()
                                        wx.showToast({
                                            title: '禁用商品失败！',
                                            icon: 'none',
                                            duration: 1000,
                                        })
                                    }
                                })

                            }
                        } else {
                            wx.hideLoading()
                            this.forbiddenAllchef()
                        }
                    }
                },
                fail: err => {
                    console.log('查询商品列表失败', err)
                }
            })
    },

    //禁用该店铺下所有的厨师
    forbiddenAllchef() {
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        let storeId = this.data.storeId
        db.collection('ChefList').where({
                'storeId': storeId
            })
            .get({
                success: res => {
                    console.log('查询商品列表成功：', res)
                    if (res.errMsg == "collection.get:ok") {
                        let data = res.data
                        if (data.length > 0) {
                            for (let i = 0; i < data.length; i++) {
                                db.collection('ChefList').doc(data[i]._id).update({
                                    data: {
                                        forbidden: true,
                                    },
                                    success: res => {
                                        console.log('禁用厨师成功：', res)
                                        console.log('i：', i, 'data.length：', data.length)
                                        if (res.errMsg == "document.update:ok" && i == data.length - 1) {
                                            wx.hideLoading()
                                            this.setData({
                                                forbiddenSwitch: true, //显示状态
                                            })
                                            wx.showToast({
                                                title: '禁用成功',
                                                icon: 'success',
                                                duration: 700
                                            })
                                        }
                                    },
                                    fail: err => {
                                        wx.hideLoading()
                                        wx.showToast({
                                            title: '禁用厨师失败！',
                                            icon: 'none',
                                            duration: 1000,
                                        })
                                    }
                                })

                            }
                        } else {
                            wx.hideLoading()
                            this.setData({
                                forbiddenSwitch: true, //显示状态
                            })
                            wx.showToast({
                                title: '禁用成功',
                                icon: 'success',
                                duration: 700
                            })
                        }
                    }
                },
                fail: err => {
                    console.log('查询商品列表失败', err)
                }
            })
    },

    //解除禁用该店铺下所有的商品
    OpenforbiddenAllGoods() {
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        let storeId = this.data.storeId
        db.collection('GoodsList').where({
                'storeId': storeId
            })
            .get({
                success: res => {
                    console.log('查询商品列表成功：', res)
                    if (res.errMsg == "collection.get:ok") {
                        let data = res.data
                        if (data.length > 0) {
                            for (let i = 0; i < data.length; i++) {
                                db.collection('GoodsList').doc(data[i]._id).update({
                                    data: {
                                        forbidden: false,
                                    },
                                    success: res => {
                                        console.log('解除禁用商品成功：', res)
                                        console.log('i：', i, 'data.length：', data.length)
                                        if (res.errMsg == "document.update:ok" && i == data.length - 1) {
                                            wx.hideLoading()
                                            this.OpenforbiddenAllchef()
                                        }
                                    },
                                    fail: err => {
                                        wx.hideLoading()
                                        wx.showToast({
                                            title: '解除禁用商品失败！',
                                            icon: 'none',
                                            duration: 1000,
                                        })
                                    }
                                })

                            }
                        } else {
                            wx.hideLoading()
                            this.OpenforbiddenAllchef()
                        }
                    }
                },
                fail: err => {
                    console.log('查询商品列表失败', err)
                }
            })
    },

    //禁用该店铺下所有的商品
    OpenforbiddenAllchef() {
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        let storeId = this.data.storeId
        db.collection('ChefList').where({
                'storeId': storeId
            })
            .get({
                success: res => {
                    console.log('查询商品列表成功：', res)
                    if (res.errMsg == "collection.get:ok") {
                        let data = res.data
                        if (data.length > 0) {
                            for (let i = 0; i < data.length; i++) {
                                db.collection('ChefList').doc(data[i]._id).update({
                                    data: {
                                        forbidden: false,
                                    },
                                    success: res => {
                                        console.log('解除禁用厨师成功：', res)
                                        console.log('i：', i, 'data.length：', data.length)
                                        if (res.errMsg == "document.update:ok" && i == data.length - 1) {
                                            wx.hideLoading()
                                            this.setData({
                                                forbiddenSwitch: false, //显示状态
                                            })
                                            wx.showToast({
                                                title: '解除禁用成功',
                                                icon: 'success',
                                                duration: 700
                                            })
                                        }
                                    },
                                    fail: err => {
                                        wx.hideLoading()
                                        wx.showToast({
                                            title: '解除禁用厨师失败！',
                                            icon: 'none',
                                            duration: 1000,
                                        })
                                    }
                                })

                            }
                        }
                    } else {
                        wx.hideLoading()
                        this.setData({
                            forbiddenSwitch: false, //显示状态
                        })
                        wx.showToast({
                            title: '解除禁用成功',
                            icon: 'success',
                            duration: 700
                        })
                    }
                },
                fail: err => {
                    console.log('查询商品列表失败', err)
                }
            })
    },

    // 删除确认提示
    deleteshowModal() {
        if (this.data.superAdmin == true) {
            wx.showModal({
                title: '危险提示！',
                content: '此操作将删除该店铺下所有内容！',
                confirmText: '删除',
                confirmColor: '#ff0080',
                mask: true,
                success: res => {
                    if (res.confirm) {
                        // 跳转删除
                        this.DeleteStore()
                    }
                }
            })
        } else {
            wx.showToast({
                title: '没有权限！',
                icon: 'none',
                duration: 700,
            })
        }
    },

    //删除店铺
    DeleteStore() {
        wx.showLoading({
            title: '删除中...',
            mask: true
        })
        let imgArr = this.data.bannerImg.concat(this.data.coverImg)
        wx.cloud.deleteFile({
            fileList: imgArr,
            success: res => {
                console.log('查询店铺成功：', res)
                if (res.errMsg == "cloud.deleteFile:ok") {
                    db.collection('StoreList').doc(this.data.storeId).remove({
                        success: res => {
                            console.log('删除店铺成功：', res)
                            if (res.errMsg == "document.remove:ok" && res.stats.removed > 0) {
                                wx.hideLoading()
                                this.deleteAllGoods()
                            }
                        },
                        fail: err => {
                            wx.hideLoading()
                            wx.showToast({
                                title: '删除店铺失败！',
                                icon: 'none',
                                duration: 1000,
                            })
                        }
                    })
                }
            },
            fail: err => {
                wx.hideLoading()
                console.log('查询店铺失败：', err)
                wx.showToast({
                    title: '删除店铺图片失败',
                    icon: 'none',
                    duration: 1000,
                })
            }
        })
    },

    //删除该店铺下所有商品
    deleteAllGoods() {
        wx.showLoading({
            title: '删除中...',
            mask: true
        })
        let storeId = this.data.storeId
        db.collection('GoodsList').where({
                'storeId': storeId
            })
            .get({
                success: res => {
                    console.log('查询商品列表成功：', res)
                    if (res.errMsg == "collection.get:ok") {
                        let data = res.data
                        if (data.length > 0) {
                            for (let i = 0; i < data.length; i++) {
                                let imgArr = data[i].detailImg.concat(data[i].coverImg)
                                wx.cloud.deleteFile({
                                    fileList: imgArr,
                                    success: res => {
                                        if (res.errMsg == "cloud.deleteFile:ok") {
                                            db.collection('GoodsList').doc(data[i]._id).remove({
                                                success: res => {
                                                    console.log('删除商品成功：', res)
                                                    console.log('i：', i, 'data.length：', data.length)
                                                    if (res.errMsg == "document.remove:ok" && i == data.length - 1) {
                                                        wx.hideLoading()
                                                        this.deleteGoodsComment()
                                                    }
                                                },
                                                fail: err => {
                                                    wx.hideLoading()
                                                    wx.showToast({
                                                        title: '删除商品失败！',
                                                        icon: 'none',
                                                        duration: 1000,
                                                    })
                                                }
                                            })
                                        }
                                    },
                                    fail: err => {
                                        wx.hideLoading()
                                        wx.showToast({
                                            title: '删除商品图片失败',
                                            icon: 'none',
                                            duration: 1000,
                                        })
                                    }
                                })
                            }

                        } else {
                            wx.hideLoading()
                            this.deleteAllChef()
                        }
                    }
                },
                fail: err => {
                    console.log('查询商品列表失败', err)
                }
            })
    },

    //删除该商品的评论
    deleteGoodsComment() {
        wx.showLoading({
            title: '删除中...',
            mask: true
        })
        let storeId = this.data.storeId
        db.collection('Comments').where({
                'CommId': storeId
            })
            .get({
                success: res => {
                    console.log('查询商品评论成功：', res)
                    if (res.errMsg == "collection.get:ok") {
                        let data = res.data
                        if (data.length > 0) {
                            for (let i = 0; i < data.length; i++) {
                                let imgArr = data[i].detailImg.concat(data[i].coverImg)
                                wx.cloud.deleteFile({
                                    fileList: imgArr,
                                    success: res => {
                                        if (res.errMsg == "cloud.deleteFile:ok") {
                                            db.collection('Comments').doc(data[i]._id).remove({
                                                success: res => {
                                                    console.log('删除评论成功：', res)
                                                    console.log('i：', i, 'data.length：', data.length)
                                                    if (res.errMsg == "document.remove:ok" && i == data.length - 1) {
                                                        wx.hideLoading()
                                                        this.deleteAllChef()
                                                    }
                                                },
                                                fail: err => {
                                                    wx.hideLoading()
                                                    wx.showToast({
                                                        title: '删除评论失败！',
                                                        icon: 'none',
                                                        duration: 1000,
                                                    })
                                                }
                                            })
                                        }
                                    },
                                    fail: err => {
                                        wx.hideLoading()
                                        wx.showToast({
                                            title: '删除评论图片失败',
                                            icon: 'none',
                                            duration: 1000,
                                        })
                                    }
                                })
                            }

                        } else {
                            wx.hideLoading()
                            this.deleteAllChef()
                        }
                    }
                },
                fail: err => {
                    console.log('查询商品评论失败', err)
                }
            })
    },

    //删除该店铺下的所有厨师
    deleteAllChef() {
        wx.showLoading({
            title: '删除中...',
            mask: true
        })
        let storeId = this.data.storeId
        db.collection('ChefList').where({
                'storeId': storeId
            })
            .get({
                success: res => {
                    console.log('查询厨师列表成功：', res)
                    if (res.errMsg == "collection.get:ok") {
                        let data = res.data
                        if (data.length > 0) {
                            for (let i = 0; i < data.length; i++) {
                                let imgArr = data[i].chefImg.concat(data[i].cuisineImg)
                                wx.cloud.deleteFile({
                                    fileList: imgArr,
                                    success: res => {
                                        if (res.errMsg == "cloud.deleteFile:ok") {
                                            db.collection('ChefList').doc(data[i]._id).remove({
                                                success: res => {
                                                    console.log('删除厨师成功：', res)
                                                    console.log('i：', i, 'data.length：', data.length)
                                                    if (res.errMsg == "document.remove:ok" && i == data.length - 1) {
                                                        wx.hideLoading()
                                                        wx.showModal({
                                                            title: '温馨提示',
                                                            content: '已成功将该店铺和关联的商品/厨师等所有数据删除',
                                                            showCancel: false,
                                                            confirmText: '返回',
                                                            complete: (res) => {
                                                                if (res.confirm) {
                                                                    wx.navigateBack({
                                                                        delta: 1
                                                                    })
                                                                }
                                                            }
                                                        })
                                                    }
                                                },
                                                fail: err => {
                                                    wx.hideLoading()
                                                    wx.showToast({
                                                        title: '删除厨师失败！',
                                                        icon: 'none',
                                                        duration: 1000,
                                                    })
                                                }
                                            })
                                        }
                                    },
                                    fail: err => {
                                        wx.hideLoading()
                                        wx.showToast({
                                            title: '删除厨师图片失败',
                                            icon: 'none',
                                            duration: 1000,
                                        })
                                    }
                                })
                            }

                        } else {
                            wx.hideLoading()
                            wx.showModal({
                                title: '温馨提示',
                                content: '已成功将该店铺和关联的商品/厨师等所有数据删除',
                                showCancel: false,
                                confirmText: '返回',
                                complete: (res) => {
                                    if (res.confirm) {
                                        wx.navigateBack({
                                            delta: 1
                                        })
                                    }
                                }
                            })
                        }
                    }
                },
                fail: err => {
                    console.log('查询厨师列表失败', err)
                }
            })
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
                page = List.length
                this.getGoods(page)
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
                page = List.length
                this.getChef(page)
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