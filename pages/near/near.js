// pages/near/near.js
const app = getApp();
const db = wx.cloud.database()
const _ = db.command
Page({

    /**
     * 页面的初始数据
     */
    data: {
        longitude: "",
        latitude: "",
        searchData: '',
        clear: false,
        sortBol: true,
        StoreList: [],
        markers: [],
        changeMap: false,  //地图大小改变
        position: 'relative',
        width: '100%',
        height: '50vh', //动态改变地图大小
        centerLongitude: '', //滑动后的经纬度
        centerLatitude: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {},

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {},
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

        db.collection('SysMiniInfo')
            .get({
                success: res => {
                    console.log('获取程序配置成功', res, )
                    wx.stopPullDownRefresh() //停止下拉
                    wx.hideNavigationBarLoading() //隐藏标题栏加载
                    if (res.data[0].allContent === true) {
                        console.log('已关闭所有内容展示')
                        this.setData({
                            markers: [],
                            StoreList: [],
                        })
                    } else {
                        wx.showToast({
                            title: '刷新中...',
                            icon: 'loading',
                            duration: 800,
                        })
                        let myCity = wx.getStorageSync('MyCity');
                        if (myCity != '') {
                            this.setData({
                                clear: false,
                                markers: [],
                                StoreList: [],
                                longitude: myCity.longitude,
                                latitude: myCity.latitude,
                            })
                            this.getNearStore()
                        } else {
                            wx.showToast({
                                title: '请先在首页选择地区！',
                                icon: 'none',
                                duration: 1000,
                            })
                        }
                    }
                },
                fail: err => {
                    wx.stopPullDownRefresh() //停止下拉
                    wx.hideNavigationBarLoading() //隐藏标题栏加载
                    console.log('获取程序配置失败', err)
                }
            })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {},

    // 显示附近店铺在地图上
    getNearStore() {
        let longitude = this.data.longitude //自己的位置
        let latitude = this.data.latitude
        db.collection('StoreList').where({
                Audit: true,
                forbidden: false,
                location: _.geoNear({
                    geometry: db.Geo.Point(longitude, latitude),
                    minDistance: 0,
                    maxDistance: app.globalData.maxDistance, //以自己为中心的最远距离（m）
                }),
            })
            .get()
            .then(res => {
                wx.stopPullDownRefresh() //停止下拉
                wx.hideNavigationBarLoading() //隐藏标题栏加载
                console.log('获取附近店铺成功：', res, res.data.length)
                if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
                    let data = res.data;
                    // 加入地图markers
                    let result = [];
                    for (let i = 0; i < data.length; i++) {
                        result.push({
                            iconPath: data[i].coverImg[0], // 图标
                            id: data[i]._id,
                            latitude: data[i].latitude, //商家位置
                            longitude: data[i].longitude,
                            width: 30, // 图标大小
                            height: 30,
                            callout: { // 气泡
                                content: `${data[i].storeName}`,
                                color: '#fff',
                                bgColor: '#efb336',
                                fontSize: 10,
                                textAlign: 'center',
                                borderRadius: 5,
                                borderWidth: 1,
                                borderColor: '#fff',
                                padding: 5,
                                display: 'ALWAYS',
                            }
                        });
                    }
                    // 加入卡片列表
                    let StoreDataList = []
                    for (let i = 0; i < data.length; i++) {
                        let lat1 = this.data.latitude
                        let lng1 = this.data.longitude //自己的位置
                        let lat2 = data[i].latitude
                        let lng2 = data[i].longitude //商店的位置
                        var radLat1 = lat1 * Math.PI / 180.0
                        var radLat2 = lat2 * Math.PI / 180.0
                        var a = radLat1 - radLat2
                        var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0
                        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)))
                        s = s * 6378.137 // 地球半径;
                        s = Math.round(s * 10000) / 10000
                        let Distance = s.toFixed(2)
                        console.log('计算距离：', Distance)
                        StoreDataList.push(({
                            Distance: Distance,
                            _id: data[i]._id,
                            _openid: data[i]._openid,
                            storeName: data[i].storeName,
                            coverImg: data[i].coverImg,
                            Address: data[i].Address,
                            feat: data[i].feat,
                            cuisine: data[i].cuisine,
                            score: data[i].score,
                            Price: data[i].Price
                        }))
                    }
                    console.log('加入列表：', StoreDataList)
                    console.log('加入markers：', result)
                    this.setData({
                        StoreList: StoreDataList,
                        markers: result,
                    });
                } else {
                    wx.showToast({
                        title: '暂时没有新数据！',
                        icon: 'none',
                        duration: 1000,
                    })
                }
            })
            .catch(err => {
                wx.stopPullDownRefresh() //停止下拉
                wx.hideNavigationBarLoading() //隐藏标题栏加载
                console.log('获取附近店铺失败：', err)
            })
    },

    // 地图滑动
    regionchangeMap(e) {
        console.log('地图滑动的类型：', e.type)
        if (e.type == 'end') {
            console.log('停止后的经纬度：', e.detail.centerLocation)
            this.setData({
                markers: [],
                StoreList: [],
                centerLongitude: e.detail.centerLocation.longitude,
                centerLatitude: e.detail.centerLocation.latitude
            })
            this.regionchangeMapGetNearShowMap()
        }
    },

    // 地图滑动显示附近店铺在地图上
    regionchangeMapGetNearShowMap() {
        let longitude = this.data.centerLongitude //滑动的位置
        let latitude = this.data.centerLatitude
        db.collection('StoreList').where({
                Audit: true,
                forbidden: false,
                location: _.geoNear({
                    geometry: db.Geo.Point(longitude, latitude),
                    minDistance: 0,
                    maxDistance: app.globalData.maxDistance, //以自己为中心的最远距离（m）
                }),
            })
            .get()
            .then(res => {
                console.log('滑动地图获取附近店铺成功：', res, res.data.length)
                if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
                    let data = res.data;
                    // 滑动加入地图markers
                    let result = [];
                    for (let i = 0; i < data.length; i++) {
                        result.push({
                            iconPath: data[i].coverImg[0], // 图标
                            id: data[i]._id,
                            latitude: data[i].latitude, //商家位置
                            longitude: data[i].longitude,
                            width: 30, // 图标大小
                            height: 30,
                            callout: { // 气泡
                                content: `${data[i].storeName}`,
                                color: '#fff',
                                bgColor: '#efb336',
                                fontSize: 10,
                                textAlign: 'center',
                                borderRadius: 5,
                                borderWidth: 1,
                                borderColor: '#fff',
                                padding: 5,
                                display: 'ALWAYS',
                            }
                        });
                    }
                    // 滑动加入列表
                    let StoreDataList = []
                    for (let i = 0; i < data.length; i++) {
                        let lat1 = this.data.latitude
                        let lng1 = this.data.longitude //自己的位置
                        let lat2 = data[i].latitude
                        let lng2 = data[i].longitude //商店的位置
                        var radLat1 = lat1 * Math.PI / 180.0
                        var radLat2 = lat2 * Math.PI / 180.0
                        var a = radLat1 - radLat2
                        var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0
                        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)))
                        s = s * 6378.137 // 地球半径;
                        s = Math.round(s * 10000) / 10000
                        let Distance = s.toFixed(2)
                        console.log('计算距离：', Distance)
                        StoreDataList.push(({
                            Distance: Distance,
                            _id: data[i]._id,
                            _openid: data[i]._openid,
                            storeName: data[i].storeName,
                            coverImg: data[i].coverImg,
                            Address: data[i].Address,
                            feat: data[i].feat,
                            cuisine: data[i].cuisine,
                            score: data[i].score,
                            Price: data[i].Price
                        }))
                    }
                    console.log('滑动加入列表：', StoreDataList)
                    console.log('滑动加入markers：', result)
                    this.setData({
                        StoreList: StoreDataList,
                        markers: result,
                    });
                } else {
                    wx.showToast({
                        title: '暂时没有新数据！',
                        icon: 'none',
                        duration: 1000,
                    })
                }
            })
            .catch(err => {
                console.log('滑动地图获取附近店铺失败：', err)
            })
    },

    // 动态改变地图大小
    changeMap() {
        let changeMap = this.data.changeMap
        console.log('点击了动态改变地图大小', changeMap)
        if (changeMap == false) {
            this.setData({
                changeMap: true,
                position: 'relative',
                width: '100%',
                height: '90vh',
            })
        } else {
            this.setData({
                changeMap: false,
                position: 'relative',
                width: '100%',
                height: '55vh',
            })
        }
    },

    //回到自己的可视范围
    MyLocation() {
        let mpCtx = wx.createMapContext("map");
        mpCtx.moveToLocation({
            latitude: this.data.latitude,
            longitude: this.data.longitude
        });
    },

    // 搜索输入值
    searchInput(e) {
        let value = e.detail.value
        console.log('编辑了搜索输入框：', value)
        if (value == '') {
            this.setData({
                markers: [],
                StoreList: [],
                clear: false,
            })
            this.getNearStore() //获取店铺信息
        } else {
            this.setData({
                searchData: value,
                clear: true
            })
        }
    },

    // 清除搜索输入值
    clearInput(e) {
        this.setData({
            markers: [],
            StoreList: [],
            searchData: '',
            clear: false
        })
        this.getNearStore() //获取店铺信息
    },

    //去搜索
    goSearch() {
        let key = this.data.searchData
        if (key) {
            this.setData({
                StoreList: [],
            })
            this.searchStore(key)
        } else {
            wx.showToast({
                title: '请输入搜索内容',
                icon: 'none',
                duration: 800,
            })
        }
    },

    /**
     * 搜索商店
     */
    searchStore(key) {
        console.log('搜索商店的key：', key)
        let longitude = this.data.longitude //自己的位置
        let latitude = this.data.latitude
        db.collection('StoreList')  //将符合以下条件的数据筛选出来
            .where(
                _.and(
                    _.or([{
                            Audit: true,
                            forbidden: false,
                            storeName: db.RegExp({
                                regexp: '.*' + key,
                                options: 'i',
                            })
                        },
                        {
                            AddressName: db.RegExp({
                                regexp: '.*' + key,
                                options: 'i',
                            })
                        },
                        {
                            Address: db.RegExp({
                                regexp: '.*' + key,
                                options: 'i',
                            })
                        },
                        {
                            storeIntro: db.RegExp({
                                regexp: '.*' + key,
                                options: 'i',
                            })
                        },
                        {
                            cuisine: db.RegExp({
                                regexp: '.*' + key,
                                options: 'i',
                            })
                        }
                    ]),
                    _.or({
                        location: _.geoNear({
                            geometry: db.Geo.Point(longitude, latitude),
                            minDistance: 0,
                            maxDistance: app.globalData.maxDistance, //以自己为中心的最远距离（m）
                        }),
                    })
                )
            )
            .orderBy('score', 'desc')
            .get({
                success: res => {
                    console.log('搜索店铺成功', res, res.data.length)
                    let StoreDataList = []
                    if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
                        let data = res.data

                        // 把店铺加入地图markers
                        let result = [];
                        for (let i = 0; i < data.length; i++) {
                            result.push({
                                iconPath: data[i].coverImg[0], // 图标
                                id: data[i]._id,
                                latitude: data[i].latitude, //商家位置
                                longitude: data[i].longitude,
                                width: 30, // 图标大小
                                height: 30,
                                callout: { // 气泡
                                    content: `${data[i].storeName}`,
                                    color: '#fff',
                                    bgColor: '#efb336',
                                    fontSize: 10,
                                    textAlign: 'center',
                                    borderRadius: 5,
                                    borderWidth: 1,
                                    borderColor: '#fff',
                                    padding: 5,
                                    display: 'ALWAYS',
                                }
                            });
                        }

                        // 把店铺加到列表
                        for (let i = 0; i < data.length; i++) {
                            let lat1 = this.data.latitude
                            let lng1 = this.data.longitude //自己的位置
                            let lat2 = data[i].latitude
                            let lng2 = data[i].longitude //商店的位置
                            var radLat1 = lat1 * Math.PI / 180.0
                            var radLat2 = lat2 * Math.PI / 180.0
                            var a = radLat1 - radLat2
                            var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0
                            var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)))
                            s = s * 6378.137 // 地球半径;
                            s = Math.round(s * 10000) / 10000
                            let Distance = s.toFixed(2)
                            console.log('计算距离：', Distance)
                            StoreDataList.push(({
                                Distance: Distance,
                                _id: data[i]._id,
                                _openid: data[i]._openid,
                                storeName: data[i].storeName,
                                coverImg: data[i].coverImg,
                                Address: data[i].Address,
                                feat: data[i].feat,
                                cuisine: data[i].cuisine,
                                score: data[i].score,
                                Price: data[i].Price
                            }))
                        }
                        this.setData({
                            StoreList: StoreDataList,
                            markers: result,
                        })
                    } else {
                        wx.showToast({
                            title: '暂时没有搜索到相关内容！',
                            icon: 'none',
                            duration: 800,
                        })
                    }
                },
                fail: err => {
                    wx.showToast({
                        title: '网络错误！搜索失败',
                        icon: 'none',
                        duration: 1500
                    })
                }
            })
    },

    // 排序
    onSort(e) {
        let sortBol = this.data.sortBol
        let property = e.currentTarget.dataset.key
        console.log('点击了排序：', e, sortBol, property)
        let newStoreList = this.data.StoreList.sort(this.compare(property, true))
        this.setData({
            property,
            StoreList: newStoreList
        })
    },

    //  进行排序
    compare(property) {
        let that = this
        let sortBol = this.data.sortBol
        console.log('进行排序：', sortBol, property)
        return function (a, b) {
            if (sortBol == true) {
                console.log('降序：', )
                let value1 = a[property];
                let value2 = b[property];
                that.setData({
                    sortBol: false,
                })
                return value1 - value2;
            }
            if (sortBol == false) {
                console.log('升序：', )
                let value1 = a[property];
                let value2 = b[property];
                that.setData({
                    sortBol: true,
                })
                return value2 - value1;
            }
        }
    },

    // 点击卡片跳转到店铺详情页
    goStoreDetail(e) {
        let id = e.currentTarget.dataset.id
        let url = '../../StorePackage/storeDetail/storeDetail'
        wx.navigateTo({
            url: `${url}?id=${id}`,
        })
    },

    /**
     * 点击地图上的商家图标进入商家详情页面
     */
    markertap(e) {
        console.log('点击附近美食地图上的marker', e)
        wx.getSystemInfo({
            success: res => {
                console.log("运行平台：", res.platform)
                if (res.platform == 'devtools') {
                    console.log("当前运行在PC开发工具")
                    // 工具调试，因为marker是数组，所以点击mark时不能获取到点击的具体id，所以在xml绑定了一个固定id,
                    wx.navigateTo({
                        url: '../../StorePackage/storeDetail/storeDetail?id=' + e.currentTarget.dataset.id
                    })
                } else {
                    console.log("当前运行在手机端")
                    // 真机调试，可以动态获取到点击mark的id
                    wx.navigateTo({
                        url: '../../StorePackage/storeDetail/storeDetail?id=' + e.detail.markerId
                    })
                }
            },
            fail: err => {
                console.log("获取运行平台失败：", err)
            }
        })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
        wx.showNavigationBarLoading() //在标题栏中显示加载
        this.onShow()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        wx.showToast({
            title: '看到底了哟！',
            icon: 'none',
            duration: 1000,
        })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {}
})