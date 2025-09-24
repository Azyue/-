// Adminpackage/storeManageAdd/storeManageAdd.js
const db = wx.cloud.database();
const {
    formatTime
} = require("../../utils/util.js")

Page({

    /**
     * 页面的初始数据
     */
    data: {
        SelfId: '', //商家自己id
        clear: false, //一键清除键
        StoreInfo: [],
        bossName: '',
        bossPhone: '',
        storeName: '',
        storeIntro: '',
        storeLongitude: '',
        storeLatitude: '',
        storeAddress: {},

        // 渲染输入框
        InputList: [{
                'id': 'bossName',
                'title': '姓名:',
                'placeholder': '填写姓名',
                'type': 'text',
                'maxlength': 10
            },
            {
                'id': 'bossPhone',
                'title': '电话:',
                'placeholder': '填写电话',
                'type': 'number',
                'maxlength': 11
            },
            {
                'id': 'storeName',
                'title': '店铺名字:',
                'placeholder': '填写店铺名',
                'type': 'text',
                'maxlength': 20
            },
            {
                'id': 'storeIntro',
                'title': '店铺简介:',
                'placeholder': '填写店铺简介',
                'type': 'textarea',
                'maxlength': 100
            },
        ],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (e) {},

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
            storeAddress: {},
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
                title: '请填写店铺名字！',
                duration: 1000,
                icon: "none"
            })
        } else if (storeIntro == "") {
            wx.showToast({
                title: '请填写店铺简介！',
                duration: 1000,
                icon: "none"
            })
        } else if (latitude == "" && longitude == "") {
            wx.showToast({
                title: '请选择店铺地址！',
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
        db.collection('StoreList')
            .add({
                data: {
                    addType: 'admin',
                    adder:nickName,
                    Audit: false, //审核状态
                    forbidden: false,
                    Merchants: false,
                    nickName: nickName,
                    bossName: bossName,
                    bossPhone: bossPhone,
                    storeName: storeName,
                    storeIntro: storeIntro,
                    bannerImg: [],
                    coverImg: [],
                    feat: '',
                    cuisine: '',
                    Price: '',
                    AddressName: this.data.storeAddress.name,
                    Address: this.data.storeAddress.address,
                    longitude: longitude,
                    latitude: latitude,
                    location: db.Geo.Point(longitude, latitude),
                    ApplyTime: formatTime(new Date())
                },
                success: res => {
                    console.log('提交申请成功', res.errMsg)
                    if (res.errMsg == "collection.add:ok") {
                        wx.showModal({
                            title: '温馨提示',
                            content: '提交成功,请耐心等待审核',
                            showCancel:false,
                            confirmText:'返回',
                            complete: (res) => {
                              if (res.confirm) {
                                  wx.navigateBack({
                                      delta: 1
                                  })
                              }
                            }
                          })
                    } else {
                        wx.showToast({
                            title: '提交失败！请稍后再试',
                            icon: 'none',
                            duration: 1000,
                        })
                    }
                },
                fail: err => {
                    console.log('提交申请失败', err)
                    wx.showToast({
                        title: '提交失败！请稍后再试',
                        icon: 'none',
                        duration: 1000,
                    })
                }
            })
    },
})