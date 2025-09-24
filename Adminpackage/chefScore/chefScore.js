// Adminpackage/chefScore/chefScore.js
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Id: '',
    default_score: 0,
    score: 0,
    score_text_arr: ['一星', '二星', '三星', '四星', '五星'],
    score_text: "",
	score_img_arr: [],
	storeName:'',
	score: '',
	chefImg: [],
	cuisineImg: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let Id = options.id
    this.setData({
      Id
    })
    this.getinfo()
    this._default_score(this.data.default_score);
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
  // 获取数据
  getinfo() {
    wx.showLoading({
      title: '查询中...'
    })
    let Id = this.data.Id
    db.collection('ChefList')
      .where({
        '_id': Id,
      })
      .get({
        success: res => {
          wx.hideLoading()
          console.log('查询厨师成功', res.errMsg, res.data.length, res)
          if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
            let data = res.data[0]
            this.setData({
				storeName:data.storeName,
              chefName: data.chefName,
              chefCuisine: data.chefCuisine,
              chefImg: data.chefImg,
              cuisineImg: data.cuisineImg,
              score: data.score,
            })
            let score = res.data[0].score;
            this._default_score(score);
          }
        },
        fail: err => {
          wx.hideLoading()
          console.log('查询订单失败', err)
          wx.showToast({
            title: '网络错误！查询失败',
            duration: 1000,
            icon: 'none',
            mask: true
          })
        }
      })
  },

  //初始化星的数量
  _default_score: function (tauch_score = 0) {
    var score_img = [];
    var score = 0;
    for (let i = 0; i < 5; i++) {
      if (i < tauch_score) {
        score_img[i] = "/images/star_on.png"
        score = i;
      } else {
        score_img[i] = "/images/star_off.png"
      }
    }
    this.setData({
      score_img_arr: score_img,
      score_text: this.data.score_text_arr[score]
    });
  },

  //获取评分
  onScore: function (e) {
    var score = e.currentTarget.dataset.score
    console.log('选择的评分：', score)
    this._default_score(score)
    this.setData({
      score: score,
    })
  },

  //提交评分
  SubmitScore() {
    console.log('提交评分', this.data.score)
    if (this.data.score != 0) {
      let Id = this.data.Id
      db.collection('ChefList').doc(Id).update({
        data: {
          score: Number(this.data.score),
        },
        success: res => {
          console.log('评分成功', res.errMsg, res.stats.updated)
          if (res.errMsg == "document.update:ok" && res.stats.updated > 0) {
            wx.showToast({
              title: '感谢您的评分',
              icon: 'none',
              duration: 700,
            })
          }
        },
        fail: err => {
          console.log('评分失败', err)
          wx.showToast({
            title: '网络错误，操作失败！',
            icon: 'none',
            mask: true,
            duration: 1000,
          })
        }
      })
    } else {
      wx.showToast({
        title: '忙碌的世界，每个人都希望得到他人的肯定，请选择一个评分吧',
        icon: 'none',
        duration: 1000,
      })
    }
  },

  	/**
	 * 封面大图预览
	 */
	PWCoverImg(e) {
		wx.previewImage({ //大图预览,需要的类型是数组
			urls: this.data.chefImg,
			current: e.currentTarget.dataset.url
		});
	},

	/**
	 * 详情大图预览
	 */
	PWDeatailImg(e) {
		wx.previewImage({ //大图预览,需要的类型是数组
			urls: this.data.cuisineImg,
			current: e.currentTarget.dataset.url
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})