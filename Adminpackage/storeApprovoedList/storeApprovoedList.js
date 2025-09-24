// Adminpackage/storeApprovoedList/storeApprovoedList.js
var app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    DataList: [],
    total: 0,
    page: 0, // 默认查询第一页
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('onLoad执行了', )
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    console.log('onShow执行了', )
    //恢复初始数据
    this.setData({
      DataList: [],
      total: 0,
      page: 0,
    })
    this.queryCount()
    let page = this.data.page
    this.query(page)
  },

  // 查询数据总数
  queryCount() {
    wx.showLoading({
      title: '查询中...',
    })
    db.collection('StoreList')
      .where({
        'Audit': true
      })
      .count({
        success: res => {
          wx.hideLoading()
          console.log('查询总条数成功', res.total)
          if (res.errMsg == "collection.count:ok") {
            this.setData({
              total: res.total, //已发布条数
            })
          }
        },
        fail: err => {
          wx.hideLoading()
          console.log('查询总条数失败', err)
          wx.showToast({
            title: '查询失败！',
            icon: 'none',
            duration: 1000,
          })
        }
      })
  },

  // 查询未发布
  query(page) {
    let DataList = this.data.DataList
    db.collection('StoreList')
      .where({
        'Audit': true
      })
      .skip(page) //从page数之后的数开始加载
      .limit(10)
      .orderBy('AuditTime', 'desc')
      .get({
        success: res => {
          wx.hideLoading()
          console.log('获取审核通过成功', res.data.length)
          if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
            let data = res.data
            for (let i = 0; i < data.length; i++) {
              DataList.push(data[i])
            }
            this.setData({
              DataList: DataList,
            })

          } else {
            wx.showToast({
              title: '暂时没有审核通过的数据哦',
              icon: 'none',
              duration: 1000
            })
          }
        },
        fail: err => {
          wx.hideLoading()
          console.log('查询审核通过失败', err)
        }
      })
  },

  // 点击跳转到已发布页
  Navigate: function (e) {
    let id = e.currentTarget.dataset.id
    var url = '../storeApprovoed/storeApprovoed'
    wx.navigateTo({
      url: `${url}?id=${id}`,
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let page = this.data.page
    //console.log('触底page', page)
    let total = this.data.total
    //console.log('触底的已发布条数', total)
    let DataList = this.data.DataList
    if (DataList.length < total) {
      page = DataList.length
      //console.log('触底重新去查询已发布的page', page)
      this.query(page)
    } else {
      wx.showToast({
        title: '看到底了哟！',
        icon: 'none',
        duration: 1000,
      })
    }

  },
})