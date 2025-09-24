// StorePackage/addGoods/addGoods.js
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
        AddressName: '',
        Address: '',
        GoodsName: '',
        Price: '',
        PriceUnit: '',
        coverImg: [],
        CoverImgFileID: [],
        isCoverImg: true,
        detailImg: [],
        DetailImgFileID: [],
        isDetailImg: true,

        // 价格选择列表，多列选择
        PriceList: [
            ['', '元/份', '元/斤', '元/个', '元'],
        ],
        PriceSelected: [0], // 选择器记忆

        // 菜系选择列表，多列选择
        CuisineList: [],
        CuisineSelected: [],
        Cuisine: '',
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
        this.getSysCuisine()
    },


    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {},

    //获取系统菜系
    getSysCuisine() {
        db.collection('SysCuisine').where({})
            .get({
                success: res => {
                    console.log('获取提供的菜系成功：', res, )
                    let CuisineDataList = []
                    if (res.errMsg == "collection.get:ok") {
                        let data = res.data
                        for (let i = 0; i < data.length; i++) {
                            CuisineDataList.push(
                                data[i].cuisineName
                            )
                        }
                        console.log('显示提供的菜系：', CuisineDataList, )
                        this.setData({
                            CuisineList: CuisineDataList,
                        })
                    }
                },
                fail: err => {
                    console.log('获取提供的菜系失败：', err)
                }
            })
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
                    console.log('查询商店成功', res, res.data[0]._openid, )
                    if (res.errMsg == "collection.get:ok") {
                        this.setData({
                            storeId: res.data[0]._id,
                            bossPhone: res.data[0].bossPhone,
                            storeName: res.data[0].storeName,
                            longitude: res.data[0].longitude,
                            latitude: res.data[0].latitude,
                            AddressName: res.data[0].AddressName,
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
        if (id == 'goods') {
            this.setData({
                GoodsName: value
            })
        }
        if (id == 'price') {
            this.setData({
                Price: value
            })
        }
    },

    /**
     * 添加价格单位
     */
    PriceChange(e) {
        let PriceList = this.data.PriceList
        let value = e.detail.value
        let unit = value[0]
        if (unit == 0) {
            unit = ''
        } else {
            unit = PriceList[0][unit]
        }
        let PriceUnit = `${unit}`

        this.setData({
            PriceUnit,
            PriceSelected: value,
        })
    },

    /**
     * 添加商品，设置商品价格
     */
    CuisineChange(e) {
        console.log('选择了菜系：', e)
        let key = e.currentTarget.dataset.key
        let value = e.detail.value
        console.log('选择了菜系key：', key)
        console.log('选择了菜系value：', value)
        this.setData({
            Cuisine: key[value],
            CuisineSelected: value,
        })
    },

    /**
     * 选择封面图片
     */
    CoverImg() {
        wx.chooseImage({
            count: 1, //张数
            sizeType: ['compressed'], //压缩图
            sourceType: ['album'], //从相册选择
            success: res => { //chooseImage-success方法，返回类型是数组
                this.setData({
                    coverImg: res.tempFilePaths,
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
     * 封面大图预览
     */
    PWCoverImg(e) {
        wx.previewImage({ //大图预览,需要的类型是数组
            urls: this.data.coverImg,
            current: e.currentTarget.dataset.url
        });
    },

    /**
     * 删除封面照片
     */
    DECoverImg(e) {
        this.data.coverImg.splice(e.currentTarget.dataset.index, 1);
        this.setData({
            isCoverImg: true,
            coverImg: this.data.coverImg
        })
    },


    /**
     * 选择详情图片
     */
    DetailImg() {
        wx.chooseImage({
            count: 5, //张数
            sizeType: ['compressed'], //压缩图
            sourceType: ['album'], //从相册选择
            success: res => { //chooseImage-success方法，返回类型是数组
                if (this.data.detailImg.length != 0) {
                    this.setData({
                        detailImg: this.data.detailImg.concat(res.tempFilePaths)
                    })
                } else {
                    this.setData({
                        detailImg: res.tempFilePaths
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
     * 详情大图预览
     */
    PWDeatailImg(e) {
        wx.previewImage({ //大图预览,需要的类型是数组
            urls: this.data.detailImg,
            current: e.currentTarget.dataset.url
        });
    },

    /**
     * 删除详情照片
     */
    DEDetailImg(e) {
        this.data.detailImg.splice(e.currentTarget.dataset.index, 1);
        this.setData({
            isDetailImg: true,
            detailImg: this.data.detailImg
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
        let coverImg = this.data.coverImg
        let detailImg = this.data.detailImg
        let name = this.data.GoodsName
        let price = this.data.Price

        if (name == "") {
            wx.showToast({
                title: '请填写商品名！',
                duration: 1000,
                icon: "none"
            })
        } else if (price == "") {
            wx.showToast({
                title: '请设置商品价格！',
                duration: 1000,
                icon: "none"
            })
        } else if (coverImg.length == 0) {
            wx.showToast({
                title: '请上传封面图片！',
                duration: 1000,
                icon: "none"
            })
        } else if (detailImg.length == 0) {
            wx.showToast({
                title: '请上传详情图片！',
                duration: 1000,
                icon: "none"
            })
        } else {
            // 跳转
            this.addCoverImg()
        }
    },

    /**
     * 上传封面图片
     */
    addCoverImg() {
        let CoverImgFileID = [] //把图片以数组保存
        wx.showLoading({
            title: '上传中...',
            mask: true,
        })
        for (let i = 0; i < this.data.coverImg.length; i++) {
            let fileName = this.data.coverImg[i];
            let cloudPath = "CoverImg/" + Date.now() + Math.floor(Math.random(0, 1) * 10000000) + '.jpg';
            wx.cloud.uploadFile({
                    cloudPath,
                    filePath: fileName,
                })
                .then(res => {
                    wx.hideLoading()
                    console.log('上传封面图片成功：', res)
                    CoverImgFileID.push(res.fileID)
                    if (CoverImgFileID.length == this.data.coverImg.length) {
                        this.setData({
                            CoverImgFileID: CoverImgFileID,
                        })
                        this.addDetailImg()
                    }

                })
                .catch(err => {
                    wx.hideLoading()
                    console.log('上传封面图片失败：', err)
                    wx.showToast({
                        title: '上传封面图片失败！',
                        icon: 'none',
                        duration: 1000,
                    })
                })
        }
    },

    /**
     * 上传详情图片
     */
    addDetailImg() {
        let DetailImgFileID = [] //把图片以数组保存
        wx.showLoading({
            title: '上传中...',
            mask: true,
        })
        for (let i = 0; i < this.data.detailImg.length; i++) {
            let fileName = this.data.detailImg[i];
            let cloudPath = "GoodsImg/" + Date.now() + Math.floor(Math.random(0, 1) * 10000000) + '.jpg';
            wx.cloud.uploadFile({
                    cloudPath,
                    filePath: fileName,
                })
                .then(res => {
                    wx.hideLoading()
                    console.log('上传详情图片成功：', res)
                    DetailImgFileID.push(res.fileID)
                    if (DetailImgFileID.length == this.data.detailImg.length) {
                        this.setData({
                            DetailImgFileID: DetailImgFileID,
                        })
                        this.addGoods()
                    }

                })
                .catch(err => {
                    wx.hideLoading()
                    console.log('上传详情图片失败：', err)
                    wx.showToast({
                        title: '上传详情图片失败！',
                        icon: 'none',
                        duration: 1000,
                    })
                })
        }
    },

    /**
     * 添加商品
     */
    addGoods() {
        wx.showLoading({
            title: '添加中...',
            mask: true,
        })
        let longitude = Number(this.data.longitude)
        let latitude = Number(this.data.latitude)
        db.collection('GoodsList')
            .add({
                data: {
                    forbidden: false,
                    cuisine: this.data.Cuisine,
                    storeId: this.data.storeId,
                    storeName: this.data.storeName,
                    bossPhone: this.data.bossPhone,
                    AddressName: this.data.AddressName,
                    Address: this.data.Address,
                    longitude: longitude,
                    latitude: latitude,
                    location: db.Geo.Point(longitude, latitude),
                    goodsName: this.data.GoodsName,
                    Price: this.data.Price,
                    PriceUnit: this.data.PriceUnit,
                    coverImg: this.data.CoverImgFileID,
                    detailImg: this.data.DetailImgFileID,
                    addTime: formatTime(new Date())
                },
                success: res => {
                    if (res.errMsg == "collection.add:ok") {
                        console.log('添加商品成功：', res.errMsg)
                        //添加成功，返回选择商品页面
                        wx.navigateBack({
                            delta: 1,
                        })
                    }
                },
                fail: err => {
                    console.log('添加商品失败：', err)
                    let imgFileIDArray = this.data.CoverImgFileID.concat(this.data.DetailImgFileID)
                    console.log('添加商品失败，要删除的图片：', imgFileIDArray)
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