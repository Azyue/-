// Adminpackage/editStore/editStore.js
const db = wx.cloud.database();
const {
    formatTime
} = require("../../utils/util.js")

Page({

    /**
     * 页面的初始数据
     */
    data: {
        storeId: '',
        storeId: '',
        bossName: '',
        bossPhone: '',
        storeName: '',
        storeIntro: '',
        Price: '',
        cuisine: '',
        feat: '',
        storeLongitude: '',
        storeLatitude: '',
        AddressName: '',
        clear: false,
        Address: '',
        mender: '',
        editTime: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let storeId = options.id
        this.setData({
            storeId
        })
        this.getStore()
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        console.log('onShow执行', )
    },

    // 查询店铺
    getStore() {
        let storeId = this.data.storeId
        db.collection('StoreList').where({
                '_id': storeId,
            })
            .get({
                success: res => {
                    console.log('查询店铺成功', res)
                    if (res.errMsg == "collection.get:ok") {
                        this.setData({
                            storeId: res.data[0]._id,
                            bossName: res.data[0].bossName,
                            bossPhone: res.data[0].bossPhone,
                            storeName: res.data[0].storeName,
                            storeIntro: res.data[0].storeIntro,
                            Price: res.data[0].Price,
                            cuisine: res.data[0].cuisine,
                            feat: res.data[0].feat,
                            storeLatitude: res.data[0].latitude,
                            storeLongitude: res.data[0].longitude,
                            AddressName: res.data[0].AddressName,
                            clear: true,
                            Address: res.data[0].Address,
                            ApplyTime: res.data[0].ApplyTime,
                            mender: res.data[0].mender,
                            editTime: res.data[0].editTime,
                        })
                    }
                },
                fail: err => {
                    console.log('查询已提交申请的商家失败', err)
                }
            })
    },

    /**
     * 获取输入框数据
     */
    InputData(e) {
        let key = e.currentTarget.dataset.key
        let value = e.detail.value
        if (key == 'bossName') {
            this.setData({
                bossName: value
            })
        }
        if (key == 'bossPhone') {
            this.setData({
                bossPhone: value
            })
        }
        if (key == 'storeName') {
            this.setData({
                storeName: value
            })
        }
        if (key == 'storeIntro') {
            this.setData({
                storeIntro: value
            })
        }
        if (key == 'Price') {
            this.setData({
                Price: value
            })
        }
        if (key == 'cuisine') {
            this.setData({
                cuisine: value
            })
        }
        if (key == 'feat') {
            this.setData({
                feat: value
            })
        }
    },

    // 选择地址
    chooseLocation() {
        wx.chooseLocation({
            success: res => {
                console.log('选择地区成功：', res)
                this.setData({
                    clear: true, //一键清除键
                    storeAddress: res,
                    storeLatitude: res.latitude,
                    storeLongitude: res.longitude
                })
            },
            fail: err => {
                console.log('选择地区失败：', err);
                wx.showModal({
                    title: "申请授权位置信息",
                    content: "需要手动打开获取位置信息，如还是不能使用，请关闭5G模式，再重试！",
                    confirmText: "去设置",
                    success: res => {
                        if (res.confirm) {
                            wx.openSetting()
                        }
                    }
                })
            }
        })
    },

    // 一键清除位置信息
    clearAddress() {
        this.setData({
            AddressName: '',
            storeLongitude: '',
            storeLatitude: '',
            clear: false, //一键清除键
        })
    },

    /**
     * 确认提交按钮
     */
    Submit(e) {
        let bossName = this.data.bossName
        let bossPhone = this.data.bossPhone
        let storeName = this.data.storeName
        let storeIntro = this.data.storeIntro
        let latitude = Number(this.data.storeLatitude)
        let longitude = Number(this.data.storeLongitude)
        console.log('确认提交按钮里的位置信息：', latitude, longitude, typeof latitude, typeof longitude)
        if (bossName == "") {
            wx.showToast({
                title: '请输入姓名！',
                duration: 1000,
                icon: "none"
            })
        } else if (bossPhone == "") {
            wx.showToast({
                title: '请输入电话！',
                duration: 1000,
                icon: "none"
            })
        } else if (bossPhone.length != 11) {
            wx.showToast({
                title: '请输入11位电话号！',
                duration: 1000,
                icon: "none"
            })
        } else if (storeName == "") {
            wx.showToast({
                title: '请填写商店名字！',
                duration: 1000,
                icon: "none"
            })
        } else if (storeIntro == "") {
            wx.showToast({
                title: '请填写商店简介！',
                duration: 1000,
                icon: "none"
            })
        } else if (latitude == "" && longitude == "") {
            wx.showToast({
                title: '请选择商店地址！',
                duration: 1000,
                icon: "none"
            })
        } else {
            this.SubmitData(bossName, bossPhone, storeName, storeIntro, latitude, longitude)
        }
    },

    // 上传数据
    SubmitData(bossName, bossPhone, storeName, storeIntro, latitude, longitude) {
        let userInfo = wx.getStorageSync('UserInfo')
        let nickName = userInfo[0].nickName
        let storeId = this.data.storeId
        db.collection('StoreList').doc(storeId).update({
            data: {
                mender: nickName,
                bossName: bossName,
                bossPhone: bossPhone,
                storeName: storeName,
                storeIntro: storeIntro,
                Price: this.data.Price,
                cuisine: this.data.cuisine,
                feat: this.data.feat,
                AddressName: this.data.AddressName,
                Address: this.data.Address,
                longitude: longitude,
                latitude: latitude,
                location: db.Geo.Point(longitude, latitude),
                editTime: formatTime(new Date()),
            },
            success: res => {
                console.log('提交申请成功', res.errMsg)
                if (res.errMsg == "document.update:ok") {
                    wx.showToast({
                        title: '修改成功',
                        icon: "success",
                        duration: 1000,
                    })
                    // 提交成功，刷新
                    this.getStore()
                }
            },
            fail: err => {
                console.log('提交申请失败', err)
                wx.showToast({
                    title: '修改失败！请稍后再试',
                    icon: 'none',
                    duration: 1000,
                })
            }
        })
    },
})