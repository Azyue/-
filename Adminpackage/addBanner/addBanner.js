// StorePackage/addBanner/addBanner.js
const app = getApp()
const db = wx.cloud.database()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        ID: '', //数据表Id
        imgList: [], //显示图片
        imgUpList:[],//上传图片
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            imgUpList:[]
        })
        this.getHomeBanner()
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {},

    //获取轮播图
    getHomeBanner() {
        db.collection('HomeBanner')
            .get()
            .then(res => {
                console.log('获取首页轮播图成功', res)
                if (res.errMsg == "collection.get:ok") {
                    this.setData({
                        ID: res.data[0]._id,
                        imgList: res.data[0].bannerImg,
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
                        imgList: this.data.imgList.concat(res.tempFilePaths),
                        imgUpList: this.data.imgUpList.concat(res.tempFilePaths)
                    })
                    console.log("选择的图片：",res,res.tempFilePaths)
                } else {
                    this.setData({
                        imgList: res.tempFilePaths,
                        imgUpList: res.tempFilePaths
                    })
                    console.log("选择的图片：",res.tempFilePaths)
                }
            }
        });
    },

    // 预览照片
    ViewImage(e) {
        let imgl = this.data.imgList
        console.log('预览照片', imgl)
        wx.previewImage({
            urls: this.data.imgList,
            current: e.currentTarget.dataset.url
        });
    },

    // 删除照片
    DelImg(e) {
        console.log('点击了X删除图片，图片的index：', e.currentTarget.dataset.index, '要删除的图片：', e.currentTarget.dataset.img)
        if (e.currentTarget.dataset.img.includes('http://') || e.currentTarget.dataset.img.includes('wxfile://')) {
            this.data.imgList.splice(e.currentTarget.dataset.index, 1);
            this.data.imgUpList.splice(e.currentTarget.dataset.upindex, 1);
            this.setData({
                imgList: this.data.imgList,
                imgUpList: this.data.imgUpList
            })
        } else {
            wx.showModal({
                title: '提示',
                content: '确定要删除这张照片吗？',
                cancelText: '取消',
                confirmText: '确定',
                success: res => {
                    if (res.confirm) {
                        wx.showLoading({
                            title: '删除中...',
                            mask: true
                        })
                        let DelImg = [] //把图片以数组保存
                        DelImg.push(e.currentTarget.dataset.img)
                        console.log('要删除的图片：', DelImg, typeof DelImg)
                        wx.cloud.deleteFile({
                            fileList: DelImg, //deleteFile的fileList是数组才能删除
                            success: res => {
                                if (res.errMsg == "cloud.deleteFile:ok") {
                                    console.log('删除图片存储成功：', res)
                                    let imgID = e.currentTarget.dataset.img
                                    console.log('删除数据库图片地址：', imgID)
                                    let ID = this.data.ID
                                    const _ = db.command
                                    db.collection('HomeBanner').doc(ID).update({
                                        data: {
                                            bannerImg: _.pull(imgID)
                                        },
                                        success: res => {
                                            if (res.errMsg == "document.update:ok" && res.stats.updated > 0) {
                                                console.log('删除单图数据库地址成功：', res.stats.updated)
                                                wx.hideLoading()
                                                this.onLoad()
                                            }
                                        },
                                        fail: err => {
                                            wx.hideLoading()
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
                                wx.hideLoading()
                                console.log('删除已上传的单图片失败！', err)
                            }
                        })
                    }
                }
            })
        }
    },

    // 提交信息前进行数据校验
    Submit(e) {
        let imgUpList = this.data.imgUpList
        console.log('提交按钮里的ImgUpList', imgUpList, 'ImgUpList类型：', typeof imgUpList)

        // 图片为空时报错
        if (imgUpList.length == 0) {
            wx.showToast({
                title: '图片不能为空,最少需要一张',
                icon: 'none',
                mask: true,
                duration: 1000
            })
        }else{
        // 上传图片
        this.UploadImages()
        }

    },

    // 上传图片
    UploadImages() {
        let ID = this.data.ID
        let imgFileArr = []
        const _ = db.command
        for (let i = 0; i < this.data.imgUpList.length; i++) {
            const fileName = this.data.imgUpList[i]; //this.data.imgUpList是数组类型，把imgUpList转换字符串fileName
            console.log('fileName：', fileName, 'fileName的类型：', typeof fileName)
            if (fileName.includes('http://') || fileName.includes('wxfile://')) {
                wx.showLoading({
                    title: '上传图片...',
                    mask: true
                })
                const cloudPath = "HomeBannerImg/" + Date.now() + Math.floor(Math.random(0, 1) * 10000000) + '.jpg';
                wx.cloud.uploadFile({
                        cloudPath,//云存储路径地址
                        filePath: fileName, //云存储文件名，filePath需要字符串才能上传
                    })
                    .then(res => {
                        wx.hideLoading()
                        console.log('图片上传成功，返回的fileID：', res.fileID, "类型：", typeof res.fileID)
                        imgFileArr.push(res.fileID)
                        console.log('imgFileArr：', imgFileArr, "类型：", typeof imgFileArr)
                        if (imgFileArr.length == this.data.imgUpList.length) {
                            if (ID == '') {
                                db.collection('HomeBanner')
                                    .add({
                                        data: {
                                            bannerImg:imgFileArr,
                                        },
                                        success: res => {
                                            wx.hideLoading()
                                            if (res.errMsg == "collection.add:ok") {
                                                console.log('添加成功：', res.errMsg)
                                                wx.showToast({
                                                    title: '添加成功！',
                                                    icon: "success",
                                                    mask: true,
                                                    duration: 1000
                                                })
                                                this.onLoad()
                                            }
                                        },
                                        fail: err => {
                                            wx.hideLoading()
                                            console.log('添加失败：', err)
                                            wx.cloud.deleteFile({
                                                fileList: imgFileArr, //deleteFile的fileList是数组才能删除
                                                success: res => {
                                                    if (res.errMsg == "cloud.deleteFile:ok") {
                                                        wx.showToast({
                                                            title: '添加失败！请稍后再试',
                                                            icon: 'none',
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
                            } else {
                                db.collection('HomeBanner').doc(ID).update({
                                    data: {
                                        bannerImg: _.push(
                                            imgFileArr,
                                        )
                                    },
                                    success: res => {
                                        if (res.errMsg == "document.update:ok" && res.stats.updated > 0) {
                                            console.log('更新成功：', res.stats.updated)
                                            wx.showToast({
                                                title: '更新成功！',
                                                icon: "success",
                                                mask: true,
                                                duration: 1000
                                            })
                                            this.onLoad()
                                        }
                                    },
                                    fail: err => {
                                        console.log('更新失败：', err)
                                        wx.cloud.deleteFile({
                                            fileList: imgFileArr, //deleteFile的fileList是数组才能删除
                                            success: res => {
                                                if (res.errMsg == "cloud.deleteFile:ok") {
                                                    console.log('删除已上传的图片成功！', res)
                                                    wx.showToast({
                                                        title: '更新失败！请稍后再试',
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
                            }
                        }
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