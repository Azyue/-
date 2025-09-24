// StorePackage/myStore/myStore.js
const app = getApp()
const db = wx.cloud.database()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        goodstotal: 0,
        goodspage: 0,
        cheftotal: 0,
        chefpage: 0,
        type: 'swiper',
        swiperNav: true,
        coverNav: false,
        storeNav: false,
        goodsNav: false,
        chefNav: false,
        nothing: false,
        forbidden: false,
        storeId: '',
        StoreInfo: '',
        Price: '',
        storeIntro: '',
        feat: '',
        cuisine: '',
        bannerImg: [],
        coverImg: [],
        goodsList: [],
        chefList: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        let type = this.data.type
        if (type == 'swiper') {
            this.setData({
                bannerImg: [],
            })
            this.getStore()
        }
        if (type == 'cover') {
            this.setData({
                coverImg: [],
                swiperNav: false,
                coverNav: true,
                storeNav: false,
                goodsNav: false,
                chefNav: false,
            })
            this.getStore()
        }
        if (type == 'store') {
            this.setData({
                Price: '',
                storeIntro: '',
                feat: '',
                cuisine: '',
                swiperNav: false,
                coverNav: false,
                storeNav: true,
                goodsNav: false,
                chefNav: false,
            })
            this.getStore()
        }
        if (type == 'goods') {
            this.setData({
                swiperNav: false,
                coverNav: false,
                storeNav: false,
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
                storeNav: false,
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

    // 切换导航栏
    ChangeTab(e) {
        let type = e.currentTarget.dataset.type
        if (type == 'swiper') {
            //恢复初始值
            this.setData({
                swiperNav: true,
                coverNav: false,
                storeNav: false,
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
                storeNav: false,
                goodsNav: false,
                chefNav: false,
                type: type,
                coverImg: [],
            })
            this.getStore()
        }
        if (type == 'store') {
            this.setData({
                Price: '',
                storeIntro: '',
                feat: '',
                cuisine: '',
                swiperNav: false,
                coverNav: false,
                storeNav: true,
                goodsNav: false,
                chefNav: false,
                type: type,
            })
            this.getStore()
        }
        if (type == 'goods') {
            //恢复初始值
            this.setData({
                swiperNav: false,
                coverNav: false,
                storeNav: false,
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
                storeNav: false,
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
        let openId = app.globalData.openid
        db.collection('StoreList').where({
                '_openid': openId,
                'addType': 'only'
            })
            .get({
                success: res => {
                    console.log('查询商店成功', res, res.data[0]._openid, )
                    if (res.errMsg == "collection.get:ok") {
                        this.setData({
                            storeId: res.data[0]._id,
                            StoreInfo: res.data,
                            Price: res.data[0].Price,
                            storeIntro: res.data[0].storeIntro,
                            feat: res.data[0].feat,
                            cuisine: res.data[0].cuisine,
                            bannerImg: res.data[0].bannerImg,
                            coverImg: res.data[0].coverImg,
                            forbidden: res.data[0].forbidden,
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
            .skip(page) //从某条开始加载
            .limit(20) //每次加载20条
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
            .skip(page) //从某条开始加载
            .limit(20) //每次加载20条
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
     * 添加轮播图
     */
    addSwiper() {
        let url = '/StorePackage/addBanner/addBanner'
        let id = this.data.storeId
        wx.navigateTo({
            url: `${url}?id=${id}`,
        })
    },

    /**
     * 添加封面
     */
    addCoverImg() {
        let url = '/StorePackage/addCover/addCover'
        let id = this.data.storeId
        wx.navigateTo({
            url: `${url}?id=${id}`,
        })
    },

    /**
     * 添加商品
     */
    addGoods() {
        let url = '../addGoods/addGoods'
        let id = this.data.storeId
        wx.navigateTo({
            url: `${url}?id=${id}`,
        })
    },

    /**
     * 添加厨师
     */
    addChef() {
        let url = '../addChef/addChef'
        let id = this.data.storeId
        wx.navigateTo({
            url: `${url}?id=${id}`,
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
            itemList: ['修改', '删除'],
            success: res => {
                if (res.tapIndex === 0) {
                    //修改模式
                    wx.navigateTo({
                        url: '../editGoods/editGoods?id=' + id,
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
            itemList: ['修改', '删除'],
            success: res => {
                if (res.tapIndex === 0) {
                    wx.navigateTo({
                        url: '../editChef/editChef?id=' + id,
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

    /**
     * 获取输入框数据
     */
    InputData(e) {
        let key = e.currentTarget.dataset.key
        let value = e.detail.value
        if (key == 'cuisine') {
            this.setData({
                cuisine: value
            })
        }

        if (key == 'Price') {
            this.setData({
                Price: value
            })
        }
        if (key == 'storeIntro') {
            this.setData({
                storeIntro: value
            })
        }
        if (key == 'feat') {
            this.setData({
                feat: value
            })
        }
    },

    // 修改按钮
    addfeatBtn() {
        this.SubmitFeatData()
    },
    addCuisineBtn() {
        this.SubmitcuisineData()
    },
    addAvgBtn() {
        this.SubmitPriceData()
    },
    addIntroBtn() {
        this.SubmitIntroData()
    },

    // 上传数据
    SubmitFeatData() {
        let storeId = this.data.storeId
        let feat = this.data.feat
        db.collection('StoreList').doc(storeId).update({
            data: {
                feat: feat,
            },
            success: res => {
                console.log('修改特色成功', res.errMsg)
                if (res.errMsg == "document.update:ok") {
                    wx.showToast({
                        title: '修改成功',
                        icon: "success",
                        duration: 1000,
                    })
                }
            },
            fail: err => {
                console.log('修改特色失败', err)
                wx.showToast({
                    title: '修改失败！请稍后再试',
                    icon: 'none',
                    duration: 1000,
                })
            }
        })
    },

    SubmitPriceData() {
        let storeId = this.data.storeId
        let Price = this.data.Price
        db.collection('StoreList').doc(storeId).update({
            data: {
                Price: Price,
            },
            success: res => {
                console.log('修改人均消费成功', res.errMsg)
                if (res.errMsg == "document.update:ok") {
                    wx.showToast({
                        title: '修改成功',
                        icon: "success",
                        duration: 1000,
                    })
                }
            },
            fail: err => {
                console.log('修改人均消费失败', err)
                wx.showToast({
                    title: '修改失败！请稍后再试',
                    icon: 'none',
                    duration: 1000,
                })
            }
        })
    },

    SubmitIntroData() {
        let storeId = this.data.storeId
        let storeIntro = this.data.storeIntro
        db.collection('StoreList').doc(storeId).update({
            data: {
                storeIntro: storeIntro,
            },
            success: res => {
                console.log('修改简介成功', res.errMsg)
                if (res.errMsg == "document.update:ok") {
                    wx.showToast({
                        title: '修改成功',
                        icon: "success",
                        duration: 1000,
                    })
                }
            },
            fail: err => {
                console.log('修改简介失败', err)
                wx.showToast({
                    title: '修改失败！请稍后再试',
                    icon: 'none',
                    duration: 1000,
                })
            }
        })
    },

    SubmitcuisineData() {
        let storeId = this.data.storeId
        let cuisine = this.data.cuisine
        db.collection('StoreList').doc(storeId).update({
            data: {
                cuisine: cuisine
            },
            success: res => {
                console.log('修改菜系成功', res.errMsg)
                if (res.errMsg == "document.update:ok") {
                    wx.showToast({
                        title: '修改成功',
                        icon: "success",
                        duration: 1000,
                    })
                }
            },
            fail: err => {
                console.log('修改菜系失败', err)
                wx.showToast({
                    title: '修改失败！请稍后再试',
                    icon: 'none',
                    duration: 1000,
                })
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