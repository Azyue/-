// Adminpackage/commentList/commentList.js
const db = wx.cloud.database()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        CommPage: 0, //评论页数
        CoomTotal: 0, //评论条数
        CommList: [], //评论数据
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

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
            CommPage: 0, //评论页数
            CoomTotal: 0, //评论条数
            CommList: [], //评论数据
        })
        this.getCommCount()
        let CommPage = this.data.CommPage
        this.getCommInfo(CommPage)
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

    // 查询评论总数
    getCommCount() {
        let Id = this.data.Id
        db.collection('Comments')
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
        let Id = this.data.Id
        let CommList = this.data.CommList
        db.collection('Comments')
            .orderBy('CommTime', 'desc')
            .skip(CommPage)
            .limit(10)
            .get({
                success: res => {
                    console.log('查询评论成功：', res)
                    if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
                        let data = res.data
                        for (let i = 0; i < data.length; i++) {
                            CommList.push(data[i])
                        }
                        this.setData({
                            CommList: CommList,
                        })
                    }
                },
                fail: err => {
                    console.log('查询评论失败：', err)
                }
            })
    },

    // 跳转到评论详情
    goCommentDetail(e) {
        console.log('跳转到评论详情', e.currentTarget.dataset.id)
        let id = e.currentTarget.dataset.id
        let url = '../commentAudit/commentAudit'
        wx.navigateTo({
            url: `${url}?id=${id}`,
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
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
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

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})