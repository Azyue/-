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
				'Audit': false
			})
			.count({
				success: res => {
					wx.hideLoading()
					console.log('查询总条数成功', res.total)
					if (res.errMsg == "collection.count:ok") {
						this.setData({
							total: res.total, //待审核条数
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
	// 查询待审核数据
	query(page) {
		let DataList = this.data.DataList
		db.collection('StoreList')
			.where({
				'Audit': false
			})
			.skip(page) //从page数之后的数开始加载
			.limit(10)
			.orderBy('ApplyTime', 'desc')
			.get({
				success: res => {
					wx.hideLoading()
					console.log('获取审核通过成功', res.data.length)
					if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
						console.log('走-if', )
						let data = res.data
						for (let i = 0; i < data.length; i++) {
							DataList.push(data[i])
						}
						this.setData({
							DataList: DataList,
						})

					} else {
						console.log('走-else', )
						wx.showToast({
							title: '暂时没有等待审核的数据哦',
							icon: 'none',
							duration: 1000
						})
					}
				},
				fail: err => {
					wx.hideLoading()
					console.log('审核通过-fail', err)
				}
			})
	},

	// 点击跳转到审核页
	Navigate: function (e) {
		let id = e.currentTarget.dataset.id
		var url = '../storeAudit/storeAudit'

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
		let dataList = this.data.dataList
		if (dataList.length < total) {
			page = dataList.length
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