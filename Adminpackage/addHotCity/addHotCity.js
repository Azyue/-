// Adminpackage/addHotCity/addHotCity.js
const db = wx.cloud.database()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		cityName: '',
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {},


	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {},

	/**
	 * 获取输入框数据
	 */
	inputData(e) {
		let value = e.detail.value
		this.setData({
			cityName: value
		})
	},

	//取消按钮
	closeInput() {
		wx.navigateBack({
			delta: 1,
		})
	},

	/**
	 * 确认提交按钮
	 */
	confirmSubmit(e) {
		let name = this.data.cityName
		if (name == "") {
			wx.showToast({
				title: '请填写城市名称！',
				duration: 1000,
				icon: "none"
			})
		} else {
			this.addData()
		}
	},

	/**
	 * 添加数据
	 */
	addData() {
		wx.showLoading({
			title: '添加中...',
			mask: true,
		})
		db.collection('HotCity')
			.add({
				data: {
					cityName: this.data.cityName,
				},
				success: res => {
					wx.hideLoading()
					if (res.errMsg == "collection.add:ok") {
						console.log('添加成功：', res.errMsg)
						wx.navigateBack({
							delta: 1,
						})
					}
				},
				fail: err => {
					wx.hideLoading()
					console.log('添加失败：', err)
					wx.showToast({
						title: '网络错误，添加失败！',
						icon: 'none',
						duration: 1000,
					})

				}
			})
	},
})