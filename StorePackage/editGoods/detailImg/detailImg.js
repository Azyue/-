// StorePackage/editGoods/detailImg/detailImg.js
const app = getApp()
const db = wx.cloud.database()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		Id: '',
		imgList: [],
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		let Id = options.id
		this.setData({
			Id
		})
		this.queryInfo()
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {},

	//查询信息
	queryInfo() {
		let Id = this.data.Id
		db.collection('GoodsList').where({
				_id: Id
			})
			.get()
			.then(res => {
				console.log('查询信息成功', res)
				if (res.errMsg == "collection.get:ok") {
					this.setData({
						imgList: res.data[0].detailImg,
					})
				}
			})
	},

	// 选择照片
	ChooseImage() {
		wx.chooseImage({
			count: 5, //可选择图片数
			sizeType: ['compressed'], //压缩图
			sourceType: ['album'], //从相册选择
			success: (res) => {
				if (this.data.imgList.length != 0) {
					this.setData({
						imgList: this.data.imgList.concat(res.tempFilePaths)
					})
				} else {
					this.setData({
						imgList: res.tempFilePaths
					})
				}
			}
		});
	},

	// 预览照片
	ViewImage(e) {
		let imgl = this.data.imgList
		console.log('预览照片', imgl)
		console.log('点击照片', e, )
		wx.previewImage({
			urls: this.data.imgList,
			current: e.currentTarget.dataset.url
		});
	},

	// 删除照片
	DelImg(e) {
		console.log('点击了X删除图片，图片的index', e.currentTarget.dataset.index, '要删除的图片', e.currentTarget.dataset.img)
		if (e.currentTarget.dataset.img.includes('http://') || e.currentTarget.dataset.img.includes('wxfile://')) {
			this.data.imgList.splice(e.currentTarget.dataset.index, 1);
			this.setData({
				imgList: this.data.imgList
			})
		} else {
			wx.showModal({
				title: '提示',
				content: '确定要删除这张照片吗？',
				cancelText: '取消',
				confirmText: '确定',
				success: res => {
					if (res.confirm) {
						let DelImg = [] //把图片以数组保存
						DelImg.push(e.currentTarget.dataset.img)
						console.log('要删除的图片：', DelImg)
						wx.cloud.deleteFile({
							fileList: DelImg, //deleteFile的fileList是数组才能删除
							success: res => {
								if (res.errMsg == "cloud.deleteFile:ok") {
									console.log('删除单张已上传的图片成功！', res)
									let imgID = e.currentTarget.dataset.img
									console.log('删除图片地址：', imgID)
									const _ = db.command
									let Id = this.data.Id
									db.collection('GoodsList').doc(Id).update({
										data: {
											detailImg: _.pull(imgID)
										},
										success: res => {
											if (res.errMsg == "document.update:ok" && res.stats.updated > 0) {
												console.log('清除单图数据成功', res.stats.updated)
												this.queryInfo() //刷新
											}
										},
										fail: err => {
											console.log('清除单图数据失败', err)
											wx.showToast({
												title: '删除图片失败！',
												icon: 'none',
												mask: true,
												duration: 1500
											})
										}
									})
								}
							},
							fail: err => {
								console.log('删除已上传的单图片失败！', err)
							}
						})
					}
				}
			})
		}
	},


	// 提交信息前进行数据校验
	confirmSubmit(e) {
		let ImgList = this.data.imgList
		console.log('提交按钮里的ImgList', ImgList, 'ImgList类型：', typeof ImgList)

		// 图片为空时报错
		if (ImgList.length == 0) {
			wx.showToast({
				title: '图片不能为空,最少需要一张',
				icon: 'none',
				mask: true,
				duration: 1000
			})
			return;
		}
		// 上传图片
		this.UploadImages()
	},


	// 上传图片
	UploadImages() {
		for (let i = 0; i < this.data.imgList.length; i++) {
			const fileName = this.data.imgList[i]; //this.data.imgList是数组类型，把imgList转换字符串fileName
			console.log('imgList：', this.data.imgList, 'imgList的类型：', typeof this.data.imgList)
			console.log('fileName：', fileName, 'fileName的类型：', typeof fileName)
			if (fileName.includes('http://') || fileName.includes('wxfile://')) {
				wx.showLoading({
					title: '上传图片...',
					mask: true
				})
				const cloudPath = "GoodsImg/" + Date.now() + Math.floor(Math.random(0, 1) * 10000000) + '.jpg'; // HouseImg/后面的内容为图片名称
				wx.cloud.uploadFile({
						cloudPath,
						filePath: fileName, //filePath需要字符串才能上传
					})
					.then(res => {
						wx.hideLoading()
						console.log('图片上传成功，返回的fileID：', res, res.fileID)
						console.log('fileID的类型：', typeof res.fileID)
						const _ = db.command
						let imgFileID = res.fileID
						let Id = this.data.Id
						console.log('imgFileID类型：', typeof imgFileID, imgFileID)
						db.collection('GoodsList').doc(Id).update({
							data: {
								detailImg: _.push(
									imgFileID,
								)
							},
							success: res => {
								if (res.errMsg == "document.update:ok" && res.stats.updated > 0) {
									console.log('修改数据成功', res.stats.updated)
									wx.showToast({
										title: '添加成功',
										icon: "success",
										mask: true,
										duration: 1000
									})
									this.queryInfo() //刷新
								}
							},
							fail: err => {
								console.log('修改详情图失败', err)
								wx.cloud.deleteFile({
									fileList: imgFileID, //deleteFile的fileList是数组才能删除
									success: res => {
										if (res.errMsg == "cloud.deleteFile:ok") {
											console.log('删除已上传的图片成功！', res)
											wx.showToast({
												title: '修改失败！请稍后再试',
												icon: 'none',
												mask: true,
												duration: 1000,
											})
										}
									},
									fail: err => {
										console.log('删除已上传的图片失败！', err)
									}
								})
							}
						})
					})
					.catch(err => {
						// uploadFile上传图片失败
						wx.hideLoading()
						console.log('上传图片失败！', err)
						wx.showToast({
							title: '上传图片失败！',
							icon: 'none',
							mask: true,
							duration: 1000,
						})
					})
			} else {
				wx.showToast({
					title: '没有选择新图片！',
					icon: 'none',
					mask: true,
					duration: 1000,
				})
			}
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