// StorePackage/editChef/chefImg/chefImg.js
const db = wx.cloud.database()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		id: '',
		coverImg: [],
		isChooseImg: true, // 默认显示选择图片按钮
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		let id = options.id
		this.queryInfo(id) // 根据传过来的id查询详细信息
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
		wx.removeStorageSync('BefCImgFileId')
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
						coverImg: data.chefImg,
						isChooseImg: false,
					})
					wx.setStorageSync('BefCImgFileId', data.chefImg)
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
	 * 选择图片
	 */
	chooseImg() {
		wx.chooseImage({
			count: 1, //张数
			sizeType: ['compressed'], //压缩图
			sourceType: ['album'], //从相册选择
			success: res => {
				this.setData({
					isChooseImg: false,
					coverImg: res.tempFilePaths
				})
			},
			fail: err => {}
		});
	},

	/**
	 * 大图预览
	 */
	previewImg(e) {
		wx.previewImage({
			urls: this.data.coverImg,
			current: e.currentTarget.dataset.url
		});
	},

	/**
	 * 删除照片
	 */
	deleteImg(e) {
		console.log('点击了X删除图片', )
		this.setData({
			isChooseImg: true,
			coverImg: ''
		})
	},

	/**
	 * 确认提交按钮
	 */
	confirmSubmit(e) {
		var befCImgFileId = wx.getStorageSync('BefCImgFileId')
		let coverImg = this.data.coverImg
		if (coverImg.length == 0) {
			wx.showToast({
				title: '请上传图片！',
				duration: 1000,
				icon: "none"
			})
		} else if (coverImg[0] == befCImgFileId[0]) {
			wx.showToast({
				title: '好像什么也没变哦！',
				icon: 'none',
				duration: 1000,
			})
		} else {
			let id = e.currentTarget.dataset.id
			this.editImg(id)
		}
	},

	/**
	 * 修改图片
	 */
	editImg(id) {
		let imgFileID = []
		wx.showLoading({
			title: '修改中...',
			mask: true,
		})
		for (let i = 0; i < this.data.coverImg.length; i++) {
			const fileName = this.data.coverImg[i];
			let cloudPath = "chefImg/" + Date.now() + Math.floor(Math.random(0, 1) * 10000000) + '.jpg';
			wx.cloud.uploadFile({
				cloudPath,
				filePath: fileName,
			}).then(res => {
				wx.hideLoading()
				imgFileID.push(res.fileID)
				db.collection('ChefList').doc(id).update({
					data: {
						chefImg: imgFileID,
					},
					success: res => {
						console.log('走修改图片update-success', res.errMsg)
						if (res.errMsg == "document.update:ok") {
							var beforeImgFileId = wx.getStorageSync('BefCImgFileId')
							wx.cloud.deleteFile({
								fileList: beforeImgFileId, //删除之前图片
								success: res => {
									if (res.errMsg == "cloud.deleteFile:ok") {
										wx.hideLoading()
										//清除缓存
										wx.removeStorageSync('BefchefImg')
										wx.showToast({
											title: '修改成功',
											icon: "success",
											duration: 1000,
										})
										//修改成功，返回
										wx.navigateBack({
											delta: 1
										})
									}
								},
								fail: err => {
									wx.hideLoading()
									wx.showToast({
										title: '修改失败！',
										icon: 'none'
									})
								}
							})
						}
					},
					fail: err => {
						wx.hideLoading()
						wx.showToast({
							title: '修改失败！',
							icon: 'none',
							duration: 1000,
						})
					}
				})
			}).catch(err => {
				wx.hideLoading()
				wx.showToast({
					title: '图片上传失败！',
					icon: 'none',
					duration: 1000,
				})
			})
		}
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