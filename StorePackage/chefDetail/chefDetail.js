// StorePackage/chefDetail/chefDetail.js
const db = wx.cloud.database()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		UserLogin: false,
		hasCollection: false,
		Id: '',
		DataList: [],
		swiperImg: [],
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		let Id = options.id
		console.log('传过来的id', Id)
		this.setData({
			Id,
		})
		this.getDataInfo()
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function (options) {},


	//查询信息
	getDataInfo() {
		let Id = this.data.Id
		console.log('需要查询的id：', Id)
		db.collection('ChefList').where({
				'_id': Id
			})
			.get({
				success: res => {
					console.log('查询成功：', res)
					if (res.errMsg == "collection.get:ok") {
						this.setData({
							DataList: res.data,
							swiperImg: res.data[0].cuisineImg,
						})
					}
				},
				fail: err => {
					console.log('查询失败', err)
				}
			})
	},

		// 预览照片
		ViewImage(e) {
			console.log('点击图片', e, )
			wx.previewImage({
				urls: this.data.swiperImg,
				current: e.currentTarget.dataset.url
			});
		},

	// 打电话预约
	CallPhone(e) {
		console.log('点击了拨打电话', e, e.currentTarget.dataset.phone)
		let phoneNumber = e.currentTarget.dataset.phone
		wx.showModal({
			title: '温馨提示',
			content: `是否拨打${phoneNumber}号码？`,
			confirmText: '确定拨打',
			confirmColor: '#0081ff',
			cancelText: '取消',
			cancelColor: '#acb5bd',
			success: res => {
				if (res.confirm) {
					wx.makePhoneCall({
						phoneNumber: phoneNumber,
						success: res => {},
						fail: err => {
							console.log(err)
						}
					})
				}
			},
			fail: err => {
				console.log(err)
			}
		})

	},

	// 跳转到店铺
	goStore(e) {
		let id = e.currentTarget.dataset.id
		let url = '../../StorePackage/storeDetail/storeDetail'
		wx.navigateTo({
			url: `${url}?id=${id}`,
		})

	},

	/**
	 * 用户点击右上角分享
	 */
	//分享给朋友
	onShareAppMessage: function () {
		var share_title = this.data.DataList[0].goodsName
		return {
			title: share_title,
		}
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {},
})