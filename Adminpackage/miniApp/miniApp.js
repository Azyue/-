// Adminpackage/miniApp/miniApp.js
const db = wx.cloud.database()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        bannerImg: [],
        CuisineList: [],
        CityList: [],
        infoID:'',
        allContent: false,
        registerStore: false,

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
        this.getHomeBanner()
        this.getCuisine()
        this.getHotCity()
        this.getSysMiniInfo()
    },

    //获取轮播图
    getHomeBanner() {
        db.collection('HomeBanner')
            .get({
                success: res => {
                    console.log('获取轮播图成功', res, )
                    if (res.errMsg == "collection.get:ok") {
                        this.setData({
                            bannerImg: res.data[0].bannerImg,
                        })
                    }
                },
                fail: err => {
                    console.log('获取轮播图失败', err)
                }
            })
    },
    //获取菜系
    getCuisine() {
        db.collection('SysCuisine')
            .get({
                success: res => {
                    console.log('获取菜系成功', res, )
                    if (res.errMsg == "collection.get:ok") {
                        this.setData({
                            CuisineList: res.data,
                        })
                    }
                },
                fail: err => {
                    console.log('获取菜系失败', err)
                }
            })
    },

    //获取城市
    getHotCity() {
        db.collection('HotCity')
            .get({
                success: res => {
                    console.log('获取热门城市成功：', res, )
                    if (res.errMsg == "collection.get:ok") {
                        this.setData({
                            CityList: res.data,
                        })
                    }
                },
                fail: err => {
                    console.log('获取热门城市失败：', err)
                }
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
                            infoID:res.data[0]._id,
                            allContent: res.data[0].allContent,
                            registerStore: res.data[0].registerStore,
                        })
                    }
                },
                fail: err => {
                    console.log('获取程序服务失败：', err)
                }
            })
    },
    //添加轮播图
    addBanner() {
        wx.navigateTo({
            url: '../addBanner/addBanner',
        })
    },

    //添加菜系
    addCuisine() {
        wx.navigateTo({
            url: '../addCuisine/addCuisine',
        })
    },

    //热门城市
    addHotCity() {
        wx.navigateTo({
            url: '../addHotCity/addHotCity',
        })
    },


    /**
     * 长按菜系
     */
    ClongPress(e) {
        let id = e.currentTarget.dataset.id.trim()
        console.log('长按获取的id', id)
        let name = e.currentTarget.dataset.name
        console.log('长按获取的name', name)
        let img = e.currentTarget.dataset.img
        console.log('长按获取的img', img, typeof img)

        wx.showActionSheet({
            itemList: ['删除'],
            success: res => {
                if (res.tapIndex === 0) {
                    this.deleteC(id, name, img)
                }
            },
            fail: err => {}
        })
    },
    // 删除提示
    deleteC(id, name, img) {
        wx.showModal({
            title: '温馨提醒',
            content: `确定删除 ${name} ? 删除后将不可恢复！`,
            confirmText: '确定删除',
            confirmColor: '#ff0080',
            cancelText: '取消',
            mask: true,
            success: res => {
                if (res.confirm) {
                    // 跳转删除
                    this.deleteSudoku(id, img)
                }
            }
        })
    },

    // 删除功能
    deleteSudoku(id, img) {
        wx.showLoading({
            title: '删除中...',
            mask: true
        })
        console.log('要删除的图片：', img)
        wx.cloud.deleteFile({
            fileList: img, //deleteFile的fileList是数组才能删除
            success: res => {
                console.log('走deleteFile的success', res.errMsg)
                wx.hideLoading()
                if (res.errMsg == "cloud.deleteFile:ok") {
                    console.log('要删除的菜系ID：', id, typeof (id))

                    db.collection('SysCuisine').doc(id)
                        .remove({
                            success: res => {
                                if (res.errMsg == "document.remove:ok" && res.stats.removed > 0) {
                                    wx.showToast({
                                        title: '删除成功',
                                        icon: "success",
                                        duration: 1000,
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
                console.log('走deleteFile的fail', err)
                wx.hideLoading()
                wx.showToast({
                    title: '删除图片失败',
                    icon: 'none',
                    duration: 1000,
                })
            }
        })
    },



    /**
     * 长按城市
     */
    HlongPress(e) {
        console.log(e)
        let id = e.currentTarget.dataset.id.trim()
        let name = e.currentTarget.dataset.name
        console.log('长按获取的name', name)
        wx.showActionSheet({
            itemList: ['删除'],
            success: res => {
                if (res.tapIndex === 0) {
                    this.deleteHtips(id, name)
                }
            },
            fail: err => {}
        })
    },

    // 删除提示
    deleteHtips(id, name) {
        wx.showModal({
            title: '温馨提醒',
            content: `确定删除 ${name} ? 删除后将不可恢复！`,
            confirmText: '确定删除',
            confirmColor: '#ff0080',
            cancelText: '取消',
            mask: true,
            success: res => {
                if (res.confirm) {
                    // 跳转删除
                    this.deleteCity(id)
                }
            }
        })
    },

    // 删除功能
    deleteCity(id) {
        wx.showLoading({
            title: '删除中...',
            mask: true
        })
        console.log('要删除的城市ID：', id, typeof (id))
        db.collection('HotCity').doc(id)
            .remove({
                success: res => {
                    wx.hideLoading()
                    console.log('删除城市成功：', res)
                    if (res.errMsg == "document.remove:ok" && res.stats.removed > 0) {
                        wx.showToast({
                            title: '删除成功',
                            icon: "success",
                            duration: 1000,
                        })
                        this.onShow()
                    }
                },
                fail: err => {
                    wx.hideLoading()
                    console.log('删除城市失败：', err)
                    wx.showToast({
                        title: '删除失败！',
                        icon: 'none',
                        duration: 1000,
                    })
                }
            })
    },

    // 所有内容
    allContent(e) {
        console.log('点击了所有内容', e)
        let Id = this.data.infoID
        let value = e.detail.value
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        if (Id == '') {
            db.collection('SysMiniInfo')
                .add({
                    data: {
                        allContent: true,
                        registerStore: false
                    },
                    success: res => {
                        wx.hideLoading()
                        if (res.errMsg == "collection.add:ok") {
                            console.log('添加表成功：', res.errMsg)
                            wx.showToast({
                                title: '关闭内容成功',
                                icon: 'success',
                                mask: true,
                                duration: 1000
                            })
                            this.getSysMiniInfo()
                        }
                    },
                    fail: err => {
                        wx.hideLoading()
                        console.log('添加表失败：', err)
                        wx.showToast({
                            title: '网络错误，操作失败！',
                            icon: 'none',
                            duration: 1000,
                        })

                    }
                })
        } else {
            db.collection('SysMiniInfo').doc(Id).update({
                data: {
                    allContent: value,
                },
                success: res => {
                    wx.hideLoading()
                    if (res.errMsg == "document.update:ok" && res.stats.updated > 0) {
                        console.log('更新内容成功', res)
                        if (value == true) {
                            this.setData({
                                allContent: true,
                            })
                            wx.showToast({
                                title: '关闭内容成功',
                                icon: 'success',
                                mask: true,
                                duration: 1000
                            })
                        } else {
                            this.setData({
                                allContent: false,
                            })
                            wx.showToast({
                                title: '开启内容成功',
                                icon: 'success',
                                mask: true,
                                duration: 1000
                            })
                        }

                    }
                },
                fail: err => {
                    wx.hideLoading()
                    console.log('更新内容失败', err)
                    wx.showToast({
                        title: '网络错误，操作失败！',
                        icon: 'none',
                        mask: true,
                        duration: 1500
                    })
                }
            })
        }

    },

    //店铺入驻
    registerStore(e) {
        console.log('点击了店铺入驻', e)
        let Id = this.data.infoID
        let value = e.detail.value
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        if (Id == '') {
            db.collection('SysMiniInfo')
                .add({
                    data: {
                        allContent: false,
                        registerStore: true
                    },
                    success: res => {
                        wx.hideLoading()
                        if (res.errMsg == "collection.add:ok") {
                            console.log('添加表成功：', res.errMsg)
                            wx.showToast({
                                title: '关闭入驻成功',
                                icon: 'success',
                                mask: true,
                                duration: 1000
                            })
                            this.getSysMiniInfo()
                        }
                    },
                    fail: err => {
                        wx.hideLoading()
                        console.log('添加表失败：', err)
                        wx.showToast({
                            title: '网络错误，操作失败！',
                            icon: 'none',
                            duration: 1000,
                        })

                    }
                })
        } else {
            db.collection('SysMiniInfo').doc(Id).update({
                data: {
                    registerStore: value,
                },
                success: res => {
                    wx.hideLoading()
                    if (res.errMsg == "document.update:ok" && res.stats.updated > 0) {
                        console.log('更新入驻成功', res)
                        if (value == true) {
                            this.setData({
                                registerStore: true,
                            })
                            wx.showToast({
                                title: '关闭入驻成功',
                                icon: 'success',
                                mask: true,
                                duration: 1000
                            })
                        } else {
                            this.setData({
                                registerStore: false,
                            })
                            wx.showToast({
                                title: '开启入驻成功',
                                icon: 'success',
                                mask: true,
                                duration: 1000
                            })
                        }

                    }
                },
                fail: err => {
                    wx.hideLoading()
                    console.log('更新入驻失败', err)
                    wx.showToast({
                        title: '网络错误，操作失败！',
                        icon: 'none',
                        mask: true,
                        duration: 1500
                    })
                }
            })
        }

    },

})