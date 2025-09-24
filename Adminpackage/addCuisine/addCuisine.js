// Adminpackage/addCuisine/addCuisine.js
const app = getApp()
const db = wx.cloud.database()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		cuisineName: '',
		cuisineImg: [],
		cuisineImgID: [],
		isCoverImg: true,
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
			cuisineName: value
		})
	},

	/**
	 * 选择图片
	 */
	CoverImg() {
		wx.chooseImage({
			count: 1, //张数
			sizeType: ['compressed'], //压缩图
			sourceType: ['album'], //从相册选择
			success: res => { //chooseImage-success方法，返回类型是数组
				this.setData({
					cuisineImg: res.tempFilePaths,
					isCoverImg: false
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
	PWCoverImg(e) {
		wx.previewImage({ //大图预览,需要的类型是数组
			urls: this.data.cuisineImg,
			current: e.currentTarget.dataset.url
		});
	},

	/**
	 * 删除图片
	 */
	DECoverImg(e) {
		this.data.cuisineImg.splice(e.currentTarget.dataset.index, 1);
		this.setData({
			isCoverImg: true,
			cuisineImg: this.data.cuisineImg
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
		let cuisineImg = this.data.cuisineImg
		let name = this.data.cuisineName
		if (name == "") {
			wx.showToast({
				title: '请填写菜系名称！',
				duration: 1000,
				icon: "none"
			})
		} else if (cuisineImg.length == 0) {
			wx.showToast({
				title: '请上传图标图片！',
				duration: 1000,
				icon: "none"
			})
		} else {
			this.addImg()
		}
	},

	/**
	 * 上传图片
	 */
	addImg() {
		wx.showLoading({
			title: '上传中...',
			mask: true,
		})
		let cuisineImgFileID = []
		for (let i = 0; i < this.data.cuisineImg.length; i++) {
			let fileName = this.data.cuisineImg[i];
			let cloudPath = "SysCuisineImg/" + Date.now() + Math.floor(Math.random(0, 1) * 10000000) + '.jpg';
			wx.cloud.uploadFile({
					cloudPath,
					filePath: fileName,
				})
				.then(res => {
					wx.hideLoading()
					console.log('上传图片成功：', res)
					cuisineImgFileID.push(res.fileID)
					if (cuisineImgFileID.length == this.data.cuisineImg.length) {
						this.setData({
							cuisineImgID: cuisineImgFileID,
						})
						this.addData()
					}

				})
				.catch(err => {
					wx.hideLoading()
					console.log('上传图片失败：', err)
					wx.showToast({
						title: '上传图片失败！',
						icon: 'none',
						duration: 1000,
					})
				})
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
		db.collection('SysCuisine')
			.add({
				data: {
					cuisineImg: this.data.cuisineImgID,
					cuisineName: this.data.cuisineName,
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
					let img = this.data.cuisineImgID
					console.log('添加失败，要删除的图片：', img)
					wx.cloud.deleteFile({
						fileList: img, //deleteFile的fileList是数组才能删除
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