// Adminpackage/storeScore/storeScore.js
const app = getApp()
const db = wx.cloud.database()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		goodstotal: 0,
		goodspage: 0,
		cheftotal: 0,
		chefpage: 0,
		type: 'swiper',
		swiperNav: true,
		coverNav: false,
		goodsNav: false,
		chefNav: false,
		nothing: false,
		storeId: '',
		storeId: '',
		StoreInfo: '',
		bannerImg: [],
		coverImg: [],
		goodsList: [],
		chefList: [],

		default_score: 0,
		score: 0,
		score_text_arr: ['一星', '二星', '三星', '四星', '五星'],
		score_text: "",
		score_img_arr: [],
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		let storeId = options.id
		console.log('接收的商店_id：', storeId)
		this.setData({
			storeId
		})
		this.getStore()
		this._default_score(this.data.default_score);
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		let type = this.data.type
		if (type == 'swiper') {
			this.setData({
				bannerImg: [],
			})
			this.getStore()
		}
		if (type == 'cover') {
			this.setData({
				coverImg: [],
				swiperNav: false,
				coverNav: true,
				goodsNav: false,
				chefNav: false,
			})
			this.getStore()
		}
		if (type == 'goods') {
			this.setData({
				swiperNav: false,
				coverNav: false,
				goodsNav: true,
				chefNav: false,
				goodsList: [],
				goodstotal: 0,
				goodspage: 0,
			})
			this.goodsCount()
			let page = this.data.goodspage
			this.getGoods(page)
		}
		if (type == 'chef') {
			this.setData({
				swiperNav: false,
				coverNav: false,
				goodsNav: false,
				chefNav: true,
				chefList: [],
				cheftotal: 0,
				chefpage: 0,
			})
			this.chefCount()
			let page = this.data.chefpage
			this.getChef(page)
		}
	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() {
		//清除缓存

	},
	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {

	},

	// 切换
	ChangeTab(e) {
		let type = e.currentTarget.dataset.type
		if (type == 'swiper') {
			//恢复初始值
			this.setData({
				swiperNav: true,
				coverNav: false,
				goodsNav: false,
				chefNav: false,
				type: type,
			})
			this.getStore()
		}
		if (type == 'cover') {
			//恢复初始值
			this.setData({
				swiperNav: false,
				coverNav: true,
				goodsNav: false,
				chefNav: false,
				type: type,
				coverImg: [],

			})
			this.getStore()
		}
		if (type == 'goods') {
			//恢复初始值
			this.setData({
				swiperNav: false,
				coverNav: false,
				goodsNav: true,
				chefNav: false,
				type: type,
				goodsList: [],
				goodstotal: 0,
				goodspage: 0,
			})
			this.goodsCount()
			let page = 0
			this.getGoods(page)

		}
		if (type == 'chef') {
			//恢复初始值
			this.setData({
				swiperNav: false,
				coverNav: false,
				goodsNav: false,
				chefNav: true,
				type: type,
				chefList: [],
				cheftotal: 0,
				chefpage: 0,
			})
			this.chefCount()
			let page = 0
			this.getChef(page)
		}
	},

	/**
	 * 查询商店信息
	 */
	getStore() {
		let storeId = this.data.storeId
		db.collection('StoreList').where({
				'_id': storeId
			})
			.get({
				success: res => {
					console.log('查询商店成功', res)
					if (res.errMsg == "collection.get:ok") {
						this.setData({
							StoreInfo: res.data,
							bannerImg: res.data[0].bannerImg,
							coverImg: res.data[0].coverImg,
							score: res.data[0].score,
						})
						let score = res.data[0].score;
						this._default_score(score);
					}
				},
				fail: err => {
					console.log('查询商店失败', err)
				}
			})
	},

	// 查询商品总条数
	goodsCount() {
		let storeId = this.data.storeId
		db.collection('GoodsList')
			.where({
				'storeId': storeId
			})
			.count({
				success: res => {
					console.log('查询商品总条数成功', res.total)
					if (res.errMsg == "collection.count:ok") {
						this.setData({
							goodstotal: res.total,
						})
					}
				},
				fail: err => {
					console.log('查询商品总条数失败', err)
				}
			})
	},
	/**
	 * 商品列表
	 */
	getGoods(page) {
		let storeId = this.data.storeId
		let goodsList = this.data.goodsList
		db.collection('GoodsList').where({
				'storeId': storeId
			})
			.skip(page)
			.limit(10)
			.orderBy('addTime', 'desc')
			.get({
				success: res => {
					if (res.errMsg == "collection.get:ok") {
						let data = res.data
						if (data.length > 0) {
							for (let i = 0; i < data.length; i++) {
								goodsList.push(data[i])
							}
							this.setData({
								goodsList: goodsList,
								nothing: false,
							})
						} else {
							this.setData({
								nothing: true,
							})
						}
					}
				},
				fail: err => {
					console.log('查询商品列表失败', err)
				}
			})
	},

	// 查询厨师总条数
	chefCount() {
		let storeId = this.data.storeId
		db.collection('ChefList')
			.where({
				'storeId': storeId
			})
			.count({
				success: res => {
					console.log('查询厨师总条数成功', res.total)
					if (res.errMsg == "collection.count:ok") {
						this.setData({
							cheftotal: res.total,
						})
					}
				},
				fail: err => {
					console.log('查询厨师总条数失败', err)
				}
			})
	},

	/**
	 * 厨师列表
	 */
	getChef(page) {
		let storeId = this.data.storeId
		let chefList = this.data.chefList
		db.collection('ChefList').where({
				'storeId': storeId
			})
			.skip(page)
			.limit(10)
			.orderBy('addTime', 'desc')
			.get({
				success: res => {
					if (res.errMsg == "collection.get:ok") {
						let data = res.data
						if (data.length > 0) {
							for (let i = 0; i < data.length; i++) {
								chefList.push(data[i])
							}
							this.setData({
								chefList: chefList,
								nothing: false,
							})
						} else {
							this.setData({
								nothing: true,
							})
						}
					}
				},
				fail: err => {
					console.log('查询厨师列表失败', err)
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
			let storeId = this.data.storeId
			db.collection('StoreList').doc(storeId).update({
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
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {
		let type = this.data.type
		if (type == 'goods') {
			let total = this.data.goodstotal
			console.log('触底的商品条数', total)
			let page = this.data.goodspage
			console.log('触底商品page', page)
			let List = this.data.goodsList
			if (List.length < total) {
				page = List.length
				this.getGoods(page)
			} else {
				wx.showToast({
					title: '看到底了哟！',
					icon: 'none',
					duration: 1000,
				})
			}
		}
		if (type == 'chef') {
			let total = this.data.cheftotal
			console.log('触底的厨师条数', total)
			let page = this.data.chefpage
			console.log('触底厨师page', page)
			let List = this.data.chefList
			if (List.length < total) {
				page = List.length
				this.getChef(page)
			} else {
				wx.showToast({
					title: '看到底了哟！',
					icon: 'none',
					duration: 1000,
				})
			}
		}
	},
})