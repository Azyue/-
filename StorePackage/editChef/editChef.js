// StorePackage/editChef/editChef.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
	Id:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id
	//console.log('传过来的id', id)
	this.setData({
		Id:id
	})

  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
	let id = this.data.Id
	this.queryInfo(id)

  },
  	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() {
		//清除缓存
		wx.removeStorageSync('BefChefName')
		wx.removeStorageSync('BefCuisine')
		wx.removeStorageSync('BefCImgFileId')
		wx.removeStorageSync('BefCuImgFileId')
	},

  /**
   * 查询信息
   */
  queryInfo(id) {
    wx.showLoading({
      title: '加载中...'
    })
    db.collection('ChefList').where({
      _id: id
    }).get({
      success: res => {
        console.log('edit查询到的数据', res.data)
        wx.hideLoading()
        if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
            let data = res.data[0]
            this.setData({
              id: data._id,
			  chefName: data.chefName,
			  chefCuisine: data.chefCuisine,
			  chefImg: data.chefImg,
			  cuisineImg: data.cuisineImg,
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
      url: './chefName/chefName?id=' + e.currentTarget.dataset.id,
    })
  },
  navigateToPrice(e) {
    wx.navigateTo({
      url: './chefCuisine/chefCuisine?id=' + e.currentTarget.dataset.id,
    })
  },
  navigateTocImg(e) {
    wx.navigateTo({
      url: './chefImg/chefImg?id=' + e.currentTarget.dataset.id,
    })
  },
  navigateTodImg(e) {
    wx.navigateTo({
      url: './cuisineImg/cuisineImg?id=' + e.currentTarget.dataset.id,
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