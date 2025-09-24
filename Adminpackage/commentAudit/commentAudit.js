// Adminpackage/commentAudit/commentAudit.js
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
        CommList: [], //评论数据
        commid: '',
        DataList: [],
        swiperImg: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(e) {
        let id = e.id
        console.log('传过来的id：', id)
        this.setData({
            Id: id
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        this.setData({
            CommList: [], //评论数据
        })
        this.getCommInfo()
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    // 查询评论
    getCommInfo() {
        let Id = this.data.Id
        db.collection('Comments')
            .where({
                '_id': Id
            })
            .get({
                success: res => {
                    console.log('查询评论成功：', res)
                    if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
                        this.setData({
                            CommList: res.data,
                            commid: res.data[0].CommId
                        })
                        this.getDataInfo()
                    }
                },
                fail: err => {
                    console.log('查询评论失败：', err)
                }
            })
    },

    //查询信息
    getDataInfo() {
        let Id = this.data.commid
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
                                            // 返回
                                            wx.navigateBack({
                                                delta: 1
                                            })
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
        db.collection('Comments').doc(Id).update({
            data: {
                CommPublish: true,
                Auditor: auditor,
                CommPublishTime: formatTime(new Date()),
            },
            success: res => {
                if (res.errMsg == "document.update:ok" && res.stats.updated > 0) {
                    // 发布成功，返回审核列表
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
    },

    //撤回评论
    RevPublishing() {
        let Id = this.data.Id
        db.collection('Comments').doc(Id).update({
            data: {
                CommPublish: false,
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
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})