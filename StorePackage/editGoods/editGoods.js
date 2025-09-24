// Adminpackage/editGoods/editGoods.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    GoodsId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id
    //console.log('传过来的id', id)
    this.setData({
      GoodsId: id
    })

  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    let id = this.data.GoodsId
    this.queryInfo(id)

  },
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
        console.log('edit查询到的数据', res.data)
        wx.hideLoading()
        if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
          let data = res.data[0]
          this.setData({
            id: data._id,
            cuisine:data.cuisine,
            goodsName: data.goodsName,
            Price: data.Price,
            PriceUnit:data.PriceUnit,
            coverImg: data.coverImg,
            detailImg: data.detailImg,
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
   * 跳转
   */
  navigateToName(e) {
    wx.navigateTo({
      url: './goodsName/goodsName?id=' + e.currentTarget.dataset.id,
    })
  },
  navigateToPrice(e) {
    wx.navigateTo({
      url: './goodsPrice/goodsPrice?id=' + e.currentTarget.dataset.id,
    })
  },
  navigateToCuisine(e){
    wx.navigateTo({
      url: './goodsCuisine/goodsCuisine?id=' + e.currentTarget.dataset.id,
    })
  },
  navigateTocImg(e) {
    wx.navigateTo({
      url: './coverImg/coverImg?id=' + e.currentTarget.dataset.id,
    })
  },
  navigateTodImg(e) {
    wx.navigateTo({
      url: './detailImg/detailImg?id=' + e.currentTarget.dataset.id,
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