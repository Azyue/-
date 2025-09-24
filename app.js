App({
  globalData: {
    userInfo: {},
    openid: null,
    UserLogin: false, //用户登录状态
    maxDistance:Number(50000) //以自己为中心的最远距离(m)
  },

  //App onLaunch方法小程序一启动，就会最先执行
  onLaunch() {
    wx.cloud.init({
      env: 'zzy-cloud1-5gmdkrh19f662968', //云开发环境id
      traceUser: true,
    })
    this.getOpenid();
    this.isLogin()
  },

  // 获取用户openid
  getOpenid: function () {
    var app = this;
    var openidStor = wx.getStorageSync('openid');
    if (openidStor) {
      console.log('本地获取openid成功：', openidStor);
      app.globalData.openid = openidStor;
    } else {
      wx.cloud.callFunction({
        name: 'getOpenid',
        success(res) {
          console.log('云函数获取openid成功：', res.result)
          var openid = res.result.openid;
          wx.setStorageSync('openid', openid)
          app.globalData.openid = openid;
        },
        fail(res) {
          console.log('云函数获取失败', res)
        }
      })
    }
  },
  
  //检测是否登录
  isLogin() {
    console.log('app.isLogin执行了')
    var userInfo = wx.getStorageSync('UserInfo') // 获取缓存的用户信息
    if (userInfo != "") {
      console.log('app.isLogin走if,已登录')
      this.globalData.userInfo = userInfo[0]
      this.globalData.UserLogin = true
    } else {
	  console.log('app.isLogin走else，未登录')
	  this.globalData.userInfo = null
      this.globalData.UserLogin = false
	}
  },
})