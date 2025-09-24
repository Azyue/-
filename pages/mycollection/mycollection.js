// pages/mycollection/mycollection.js
var app = getApp();
const db = wx.cloud.database()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        ClloctionsList: [],
        openId: '',
        total: 0, // 默认数据总数
        page: 0, // 默认查询第一页
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onLoad: function () {
        //初始化数据
        this.setData({
            ClloctionsList: [],
            total: 0, // 默认数据总数
            page: 0, // 默认查询第一页
        })
        let openId = app.globalData.openid
        let page = this.data.page
        this.setData({
            openId: openId
        })
        this.DocCount(openId)
        this.GetMyClloctions(openId, page)

    },

    // 查询数据总数
    DocCount(openId) {
        db.collection('Collections').where({
                '_openid': openId, // 根据全局openid去收藏表里查询自己的收藏
            })
            .count({
                success: res => {
                    //console.log('查询数据总数成功',res.total)
                    if (res.errMsg == "collection.count:ok") {
                        this.setData({
                            total: res.total
                        })
                    } else {}
                },
                fail: err => {}
            })
    },

    // 获取收藏数据
    GetMyClloctions(openId, page) {
        wx.showLoading({
            title: '加载中...'
        })
        db.collection('Collections')
            .where({
                '_openid': openId, // 根据全局openid去收藏表里查询自己的收藏
            })
            .orderBy('CollectionTime', 'asc')
            .skip(page)
            .limit(10)
            .get({
                success: res => {
                    wx.hideLoading()
                    console.log('查询收藏成功', res)
                    if (res.errMsg == "collection.get:ok") {
                        let data = res.data
                        let list = []
                        for (let i = 0; i < data.length; i++) {
                            list.push(data[i])
                        }
                        this.setData({
                            page: page,
                            ClloctionsList: list,
                        })
                    } else {
                        wx.showToast({
                            title: '网络错误,请返回重新打开',
                            mask: true,
                            icon: 'none',
                            duration: 1000
                        })
                    }
                },
                fail: err => {
                    wx.hideLoading()
                    wx.showToast({
                        title: '网络错误,请返回重新打开',
                        mask: true,
                        icon: 'none',
                        duration: 1000
                    })
                }
            })
    },

    // 点击选择
    goDetail(e) {
        wx.showActionSheet({
            itemList: ['查看详情', '删除该收藏'],
            success: res => {
                if (res.tapIndex == 0) {
                    this.Navigate(e)
                }
                if (res.tapIndex == 1) {
                    wx.showModal({
                        title: "删除提示",
                        content: "是否要删除本条收藏？",
                        confirmText: '确定',
                        confirmColor: '#FA805C',
                        cancelText: '取消',
                        cancelColor: '#7CCD7D',
                        success: res => {
                            if (res.confirm) {
                                this.DeleteCollection(e)
                            }
                        },
                        fail: err => {}
                    })
                }
            },
            fail: res => {}
        })

    },

    // 跳转函数
    Navigate: function (e) {
        let Id = e.currentTarget.dataset.id
        let key = e.currentTarget.dataset.key
        if (key == 'store') {
            // 检查该收藏是否有效
            db.collection('StoreList').where({
                '_id': Id
            }).count({
                success: res => {
                    if (res.errMsg == 'collection.count:ok' && res.total > 0) {
                        wx.navigateTo({
                            url: '../../StorePackage/storeDetail/storeDetail?id=' + e.currentTarget.dataset.id,
                        })
                    } else {
                        wx.showToast({
                            title: '该收藏的链接已失效,相关内容已经被管理员删除!请自己删除本条收藏',
                            mask: true,
                            icon: 'none',
                            duration: 2000
                        })
                    }
                },
                fail: err => {
                    wx.showToast({
                        title: '网络错误,请返回重新打开',
                        mask: true,
                        icon: 'none',
                        duration: 1000
                    })
                }
            })
        }

        if (key == 'goods') {
            // 检查该收藏是否有效
            db.collection('GoodsList').where({
                '_id': Id
            }).count({
                success: res => {
                    if (res.errMsg == 'collection.count:ok' && res.total > 0) {
                        wx.navigateTo({
                            url: '../../StorePackage/goodsDetail/goodsDetail?id=' + e.currentTarget.dataset.id,
                        })
                    } else {
                        wx.showToast({
                            title: '该收藏的链接已失效,相关内容已经被管理员删除!请自己删除本条收藏',
                            mask: true,
                            icon: 'none',
                            duration: 2000
                        })
                    }
                },
                fail: err => {
                    wx.showToast({
                        title: '网络错误,请返回重新打开',
                        mask: true,
                        icon: 'none',
                        duration: 1000
                    })
                }
            })
        }
    },

    // 删除该收藏
    DeleteCollection(e) {
        wx.showLoading({
            title: '正在删除...'
        })
        let doc = e.currentTarget.dataset.doc
        const db = wx.cloud.database()
        db.collection('Collections').where({
            _id: doc
        }).remove({
            success: res => {
                wx.hideLoading()
                if (res.errMsg == 'collection.remove:ok' && res.stats.removed > 0) {
                    //设置初始值
                    this.setData({
                        total: 0,
                        page: 0,
                        ClloctionsList: []
                    })
                    let openId = this.data.openId
                    let page = this.data.page
                    this.DocCount()
                    this.GetMyClloctions(openId, page) // 删除成功，刷新列表
                } else {
                    wx.showToast({
                        title: '抱歉,删除失败!',
                        mask: true,
                        icon: 'none',
                        duration: 1000
                    })
                }
            },
            fail: err => {
                wx.hideLoading()
                wx.showToast({
                    title: '网络错误,请返回重新打开',
                    mask: true,
                    icon: 'none',
                    duration: 1000
                })
            }
        })
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let openId = this.data.openId
        let total = this.data.total
        //console.log('触底的条数', total)
        let page = this.data.page
        //console.log('触底page', page)
        let ClloctionsList = this.data.ClloctionsList
        if (ClloctionsList.length < total) {
            page = ClloctionsList.length
            this.GetMyClloctions(openId, page)
        } else {
            wx.showToast({
                icon: "none",
                title: '没有数据了哟',
                duration: 1000,
            })
        }
    },

})