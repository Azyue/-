// StorePackage/editGoods/Price/Price.js
const db = wx.cloud.database()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        Price:'',
        PriceUnit:'',
        // 价格选择列表，多列选择
        PriceList: [
            ['','元/份', '元/斤', '元/个', '元'],
        ],
        PriceSelected: [0], // 选择器记忆
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let id = options.id
        this.queryInfo(id)
        this.setData({
            id: id
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
    },

    /**
     * 查询信息
     */
    queryInfo(id) {
        wx.showLoading({
            title: '加载中...'
        })
        db.collection('GoodsList').where({
            _id: id
        }).get({
            success: res => {
                wx.hideLoading()
                if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
                    let data = res.data[0]
                    this.setData({
                        id: data._id,
                        Price: data.Price,
                        PriceUnit:data.PriceUnit,

                    })
                }
            },
            fail: err => {
                wx.hideLoading()
                wx.showToast({
                    title: '网络错误!加载失败',
                    duration: 1000,
                    icon: 'none'
                })
            }
        })
    },

    /**
     * 获取输入框数据
     */
    inputData(e) {
        let value = e.detail.value
        this.setData({
            Price: value
        })
    },
    /**
     * 添加价格单位
     */
    PriceChange(e) {
        let PriceList = this.data.PriceList
        let value = e.detail.value
        let unit = value[0]
        if (unit == 0) {
            unit = ''
        } else {
            unit = PriceList[0][unit]
        }
        let PriceUnit = `${unit}`
        this.setData({
            PriceUnit,
            PriceSelected: value,
        })
    },

    /**
     * 确认提交按钮
     */
    confirmSubmit(e) {
        let price = this.data.Price
        if (price.length == 0) {
            wx.showToast({
                title: '请填写商品价格！',
                duration: 1000,
                icon: "none"
            })
        } else {
            let id = e.currentTarget.dataset.id
            this.editName(id, price)
        }
    },

    /**
     * 修改名字
     */
    editName(id, price) {
        db.collection('GoodsList').doc(id).update({
            data: {
                Price: price,
                PriceUnit:this.data.PriceUnit,
            },
            success: res => {
                if (res.errMsg == "document.update:ok") {
                    wx.showToast({
                        title: '修改价格成功！',
                        icon: 'success',
                        duration: 1000,
                    })
                    //修改成功，返回
                    wx.navigateBack({
                        delta: 1
                    })
                }
            },
            fail: err => {
                wx.showToast({
                    title: '修改失败',
                    icon: 'none',
                    duration: 1000,
                })
            }
        })
    },

    /**
     * 取消按钮
     */
    close() {
        wx.navigateBack({
            delta: 1
        })
    },
})