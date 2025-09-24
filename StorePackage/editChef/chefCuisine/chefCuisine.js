// StorePackage/editChef/chefCuisine/chefCuisine.js
const db = wx.cloud.database()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		chefCuisine: '',
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
		//清除缓存
		wx.removeStorageSync('BefCuisine')
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
				wx.hideLoading()
				if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
					let data = res.data[0]
					this.setData({
						id: data._id,
						chefCuisine: data.chefCuisine,
					})
					wx.setStorageSync('BefCuisine', data.chefCuisine)
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
			chefCuisine: value
		})
	},

	/**
	 * 确认提交按钮
	 */
	confirmSubmit(e) {
		let chefCuisine = this.data.chefCuisine
		var BefCuisine = wx.getStorageSync('BefCuisine')
		if (chefCuisine.length == 0) {
			wx.showToast({
				title: '请填写菜系！',
				duration: 1000,
				icon: "none"
			})
		} else if (chefCuisine == BefCuisine) {
			wx.showToast({
				title: '好像什么也没变哦！',
				icon: 'none',
				duration: 1000,
			})
		} else {
			let id = e.currentTarget.dataset.id
			this.editName(id, chefCuisine)
		}
	},

	/**
	 * 修改名字
	 */
	editName(id, chefCuisine) {
		db.collection('ChefList').doc(id).update({
			data: {
				chefCuisine: chefCuisine,
			},
			success: res => {
				if (res.errMsg == "document.update:ok") {
					//清除缓存
					wx.removeStorageSync('BefCuisine')
					wx.showToast({
						title: '修改成功！',
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