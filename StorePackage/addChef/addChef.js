// StorePackage/addChef/addChef.js
const db = wx.cloud.database()
const {
	formatTime
} = require("../../utils/util.js")
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		storeId: '',
		storeName: '',
		bossPhone: '',
		longitude: '',
        latitude: '',
        Address:'',
		chefName: '',
		chefCuisine: '',
		chefImg: [],
		chefImgFileID: [],
		ischefImg: true,
		cuisineImg: [],
		cuisineImgFileID: [],
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		let storeId = options.id
		console.log('传过来的id：', storeId)
		this.setData({
		  storeId
		})
		this.getStore()
	},


	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {},

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
					console.log('查询商店成功', res, res.data[0]._openid, )
					if (res.errMsg == "collection.get:ok") {
						this.setData({
							storeId: res.data[0]._id,
							storeName: res.data[0].storeName,
							bossPhone: res.data[0].bossPhone,
							longitude: res.data[0].longitude,
                            latitude: res.data[0].latitude,
                            Address: res.data[0].Address,
						})
					}
				},
				fail: err => {
					console.log('查询商店失败', err)
				}
			})
	},

	/**
	 * 获取输入框数据
	 */
	inputData(e) {
		let id = e.currentTarget.dataset.id
		let value = e.detail.value
		if (id == 'name') {
			this.setData({
				chefName: value
			})
		}
		if (id == 'cuisine') {
			this.setData({
				chefCuisine: value
			})
		}
	},

	/**
	 * 选择厨师图片
	 */
	chefImg() {
		wx.chooseImage({
			count: 1, //张数
			sizeType: ['compressed'], //压缩图
			sourceType: ['album'], //从相册选择
			success: res => { //chooseImage-success方法，返回类型是数组
				this.setData({
					chefImg: res.tempFilePaths,
					ischefImg: false
				})
			},
			fail: err => {
				console.log('获取图片失败', err)
				wx.showToast({
					title: '网络错误！获取图片失败',
					icon: 'none',
					duration: 1000
				})
			}
		});
	},

	/**
	 * 大图预览
	 */
	PWchefImg(e) {
		wx.previewImage({ //大图预览,需要的类型是数组
			urls: this.data.chefImg,
			current: e.currentTarget.dataset.url
		});
	},

	/**
	 * 删除照片
	 */
	DEchefImg(e) {
		this.data.chefImg.splice(e.currentTarget.dataset.index, 1);
		this.setData({
			ischefImg: true,
			chefImg: this.data.chefImg
		})
	},


	/**
	 * 选择菜系图片
	 */
	cuisineImg() {
		wx.chooseImage({
			count: 5, //张数
			sizeType: ['compressed'], //压缩图
			sourceType: ['album'], //从相册选择
			success: res => { //chooseImage-success方法，返回类型是数组
				if (this.data.cuisineImg.length != 0) {
					this.setData({
						cuisineImg: this.data.cuisineImg.concat(res.tempFilePaths)
					})
				} else {
					this.setData({
						cuisineImg: res.tempFilePaths
					})
				}
			},
			fail: err => {
				console.log('获取图片失败', err)
				wx.showToast({
					title: '网络错误！获取图片失败',
					icon: 'none',
					duration: 1000
				})
			}
		});
	},

	/**
	 * 大图预览
	 */
	PWcuisineImg(e) {
		wx.previewImage({ //大图预览,需要的类型是数组
			urls: this.data.cuisineImg,
			current: e.currentTarget.dataset.url
		});
	},

	/**
	 * 删除照片
	 */
	DEcuisineImg(e) {
		this.data.cuisineImg.splice(e.currentTarget.dataset.index, 1);
		this.setData({
			cuisineImg: this.data.cuisineImg
		})
	},

	//取消按钮
	closeBtn() {
		wx.navigateBack({
			delta: 1,
		})
	},

	/**
	 * 确认提交按钮
	 */
	confirmBtn(e) {
		let chefImg = this.data.chefImg
		let cuisineImg = this.data.cuisineImg
		let name = this.data.chefName
		let cuisine = this.data.chefCuisine

		if (name == "") {
			wx.showToast({
				title: '请填写名字！',
				duration: 1000,
				icon: "none"
			})
		} else if (cuisine == "") {
			wx.showToast({
				title: '请填写菜系！',
				duration: 1000,
				icon: "none"
			})
		} else if (chefImg.length == 0) {
			wx.showToast({
				title: '请上传厨师图片！',
				duration: 1000,
				icon: "none"
			})
		} else if (cuisineImg.length == 0) {
			wx.showToast({
				title: '请上传菜系图片！',
				duration: 1000,
				icon: "none"
			})
		} else {
			// 跳转
			this.addchefImg()
		}
	},

	/**
	 * 上传厨师图片
	 */
	addchefImg() {
		let chefImgFileID = [] //把图片以数组保存
		wx.showLoading({
			title: '上传中...',
			mask: true,
		})
		for (let i = 0; i < this.data.chefImg.length; i++) {
			let fileName = this.data.chefImg[i];
			let cloudPath = "chefImg/" + Date.now() + Math.floor(Math.random(0, 1) * 10000000) + '.jpg';
			wx.cloud.uploadFile({
					cloudPath,
					filePath: fileName,
				})
				.then(res => {
					wx.hideLoading()
					console.log('上传厨师图片成功：', res)
					chefImgFileID.push(res.fileID)
					if (chefImgFileID.length == this.data.chefImg.length) {
						this.setData({
							chefImgFileID: chefImgFileID,
						})
						this.addcuisineImg()
					}

				})
				.catch(err => {
					wx.hideLoading()
					console.log('上传厨师图片失败：', err)
					wx.showToast({
						title: '上传厨师图片失败！',
						icon: 'none',
						duration: 1000,
					})
				})
		}
	},

	/**
	 * 上传菜系图片
	 */
	addcuisineImg() {
		let cuisineImgFileID = [] //把图片以数组保存
		wx.showLoading({
			title: '上传中...',
			mask: true,
		})
		for (let i = 0; i < this.data.cuisineImg.length; i++) {
			let fileName = this.data.cuisineImg[i];
			let cloudPath = "chefCuisineImg/" + Date.now() + Math.floor(Math.random(0, 1) * 10000000) + '.jpg';
			wx.cloud.uploadFile({
					cloudPath,
					filePath: fileName,
				})
				.then(res => {
					wx.hideLoading()
					console.log('上传菜系图片成功：', res)
					cuisineImgFileID.push(res.fileID)
					if (cuisineImgFileID.length == this.data.cuisineImg.length) {
						this.setData({
							cuisineImgFileID: cuisineImgFileID,
						})
						this.Submit()
					}

				})
				.catch(err => {
					wx.hideLoading()
					console.log('上传菜系图片失败：', err)
					wx.showToast({
						title: '上传菜系图片失败！',
						icon: 'none',
						duration: 1000,
					})
				})
		}
	},

	/**
	 * 添加数据
	 */
	Submit() {
		wx.showLoading({
			title: '添加中...',
			mask: true,
		})
		let longitude = Number(this.data.longitude)
		let latitude = Number(this.data.latitude)
		db.collection('ChefList')
			.add({
				data: {
                    forbidden: false,
					storeId: this.data.storeId,
					storeName: this.data.storeName,
                    bossPhone: this.data.bossPhone,
                    Address:this.data.Address,
					longitude:longitude,
					latitude:latitude,
					location: db.Geo.Point(longitude, latitude),
					chefName: this.data.chefName,
					chefCuisine: this.data.chefCuisine,
					chefImg: this.data.chefImgFileID,
					cuisineImg: this.data.cuisineImgFileID,
					addTime: formatTime(new Date())
				},
				success: res => {
					if (res.errMsg == "collection.add:ok") {
						console.log('添加厨师成功：', res.errMsg)
						//添加成功，返回
						wx.navigateBack({
							delta: 1,
						})
					}
				},
				fail: err => {
					console.log('添加厨师失败：', err)
					let imgFileIDArray = this.data.chefImgFileID.concat(this.data.cuisineImgFileID)
					console.log('添加厨师失败，要删除的图片：', imgFileIDArray)
					wx.cloud.deleteFile({
						fileList: imgFileIDArray, //deleteFile的fileList是数组才能删除
						success: res => {
							if (res.errMsg == "cloud.deleteFile:ok") {
								wx.showToast({
									title: '添加失败！',
									icon: 'none',
									duration: 1000,
								})
							}
						},
						fail: err => {
							wx.showToast({
								title: '添加失败！',
								icon: 'none',
								duration: 1000,
							})
						}
					})
				}
			})
	},
})