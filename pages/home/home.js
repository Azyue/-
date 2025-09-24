// pages/home/home.js
const app = getApp();
const db = wx.cloud.database()
const _ = db.command
Page({

    /**
     * 页面的初始数据
     */
    data: {
        myCity: '选择地区', //选择地区
        longitude: "", //经度
        latitude: "", //纬度
        searchData: '', //搜索的内容
        clear: false, //搜索框的清除键
        SysCuisine: [], //系统菜系
        bannerImg: [], //轮播图
        Sudoku: true, //功能栏显示状态
        CkdSudoku: true, //功能栏选中状态
        itemid: '', //功能栏项id
        sortKey: '全部', //当前排序类
        sortBol: true, //排序
        storeTotal: 0, //店铺条数
        storePage: 0, //店铺页数
        GoodsTotal: 0,
        GoodsPage: 0,
        allContent: false,
        StoreList: [], //店铺的数据列表
        GoodsList: [], //商品的数据列表
        pyq: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log('首页onLoad执行', options)

        //分享朋友圈，在未登录状态下访问不了数据库，所以显示假数据
        if (options.name == 'pyq') {
            // let that = this
            // wx.cloud.callFunction({
            //     name: 'getStoreList',
            //     data: {},
            //     success(res) {
            //         console.log('云函数查询店铺成功', res.result)
            //         if (res.errMsg == "cloud.callFunction:ok") {
            //             that.setData({
            //                 StoreList: res.result
            //             })
            //         }
            //     },
            //     fail(err) {
            //         console.log('云函数查询店铺失败', err)
            //     }
            // })
            let StoreDataList = []
            StoreDataList.push({
                Distance: '4.90',
                _id: '',
                _openid: '',
                storeName: '甜七度甜品店',
                coverImg: ['cloud://formal-env-7gc2z2yb19446734.666f-formal-env-7gc2z2yb19446734-1305119510/pyq/七七.jpg'],
                Address: '海南省海口市龙华区金龙路附近',
                feat: '七七甜品',
                cuisine: '甜品类',
                score: Number(5),
                Price: '19',
            }, {
                Distance: '6.30',
                _id: '',
                _openid: '',
                storeName: '蟹堡王',
                coverImg: ['cloud://formal-env-7gc2z2yb19446734.666f-formal-env-7gc2z2yb19446734-1305119510/pyq/蟹黄堡-店铺.jpg'],
                Address: '比奇堡',
                feat: '健康美味',
                cuisine: '汉堡包',
                score: Number(4),
                Price: '15',
            })


            let GoodsDataList = []
            GoodsDataList.push({
                Distance: '4.90',
                _id: '',
                _openid: '',
                goodsName: '椰奶',
                storeName: '甜七度甜品店',
                coverImg: ['cloud://formal-env-7gc2z2yb19446734.666f-formal-env-7gc2z2yb19446734-1305119510/pyq/椰奶2.jpg'],
                cuisine: '甜品类',
                score: Number(4),
                Price: '19',
                PriceUnit: '元/份'
            }, {
                Distance: '6.30',
                _id: '',
                _openid: '',
                goodsName: '美味蟹堡',
                storeName: '蟹堡王',
                coverImg: ['cloud://formal-env-7gc2z2yb19446734.666f-formal-env-7gc2z2yb19446734-1305119510/pyq/蟹黄堡-商品.gif'],
                cuisine: '汉堡包',
                score: Number(3),
                Price: '15',
                PriceUnit: '元/份'
            })

            let SysCuisineList = []
            SysCuisineList.push({
                _id: '0123',
                _openid: '00123',
                cuisineImg: ['cloud://formal-env-7gc2z2yb19446734.666f-formal-env-7gc2z2yb19446734-1305119510/pyq/甜品2.jpg'],
                cuisineName: '甜品类'
            }, {
                _id: '01234',
                _openid: '001234',
                cuisineImg: ['cloud://formal-env-7gc2z2yb19446734.666f-formal-env-7gc2z2yb19446734-1305119510/pyq/椰奶1.jpg'],
                cuisineName: '饮品类'
            }, {
                _id: '012345',
                _openid: '0012345',
                cuisineImg: ['cloud://formal-env-7gc2z2yb19446734.666f-formal-env-7gc2z2yb19446734-1305119510/pyq/杏仁豆腐2.jpg'],
                cuisineName: '璃月类'
            })

            this.setData({
                pyq: true,
                StoreList: StoreDataList,
                GoodsList: GoodsDataList,
                bannerImg: ['cloud://formal-env-7gc2z2yb19446734.666f-formal-env-7gc2z2yb19446734-1305119510/pyq/椰奶1.jpg', 'cloud://formal-env-7gc2z2yb19446734.666f-formal-env-7gc2z2yb19446734-1305119510/pyq/椰奶2.jpg', 'cloud://formal-env-7gc2z2yb19446734.666f-formal-env-7gc2z2yb19446734-1305119510/pyq/杏仁豆腐1.jpg', 'cloud://formal-env-7gc2z2yb19446734.666f-formal-env-7gc2z2yb19446734-1305119510/pyq/甜品1.jpg', 'cloud://formal-env-7gc2z2yb19446734.666f-formal-env-7gc2z2yb19446734-1305119510/pyq/甜品2.jpg'],
                SysCuisine: SysCuisineList
            })
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        // console.log('首页onReady执行', )
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        console.log('首页onShow执行', )
        let myCity = wx.getStorageSync('MyCity'); //获取缓存里的位置信息
        if (myCity != '') {
            this.setData({
                myCity: myCity.name,
                longitude: myCity.longitude,
                latitude: myCity.latitude,
                GoodsList: [],
                StoreList: [],
            })
            this.getSysMiniInfo()
        } else {
            this.setData({
                myCity: '选择地区',
            })
            wx.showToast({
                title: '请先选择地区！',
                icon: 'none',
                duration: 900,
            })
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
        // console.log('首页onHide执行', )
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
        // console.log('首页onUnload执行', )
    },

    //查询查询配置信息
    getSysMiniInfo() {
        db.collection('SysMiniInfo')
            .get({
                success: res => {
                    console.log('获取程序配置成功', res, )
                    wx.stopPullDownRefresh() //停止下拉
                    wx.hideNavigationBarLoading() //隐藏标题栏加载
                    if (res.data[0].allContent === true) {
                        console.log('已关闭所有内容展示')
                        this.setData({
                            allContent: true,
                            SysCuisine: [], //系统菜系
                            bannerImg: [], //轮播图
                            StoreList: [], //店铺的数据列表
                            GoodsList: [], //商品的数据列表
                        })
                    } else {
                        this.setData({
                            allContent: false,
                        })
                        this.getHomeBanner(); //获取轮播图
                        this.getCuisine(); //获取系统菜系
                        let sortKey = this.data.sortKey
                        if (sortKey == '全部') {
                            this.getStoreCount()
                            let Spage = this.data.storePage
                            this.getNearStore(Spage) //查询附近店铺
                            this.getGoodsCount()
                            let Gpage = this.data.GoodsPage
                            this.getNearGoods(Gpage) //查询附近商品
                        }
                        if (sortKey == '店铺') {
                            this.getStoreCount()
                            let Spage = this.data.storePage
                            this.getNearStore(Spage) //查询附近店铺
                        }
                        if (sortKey == '商品') {
                            this.getGoodsCount()
                            let Gpage = this.data.GoodsPage
                            this.getNearGoods(Gpage) //查询附近商品
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

    //获取轮播图
    getHomeBanner() {
        db.collection('HomeBanner')
            .get({
                success: res => {
                    console.log('获取轮播图成功', res, )
                    wx.stopPullDownRefresh() //停止下拉
                    wx.hideNavigationBarLoading() //隐藏标题栏加载
                    if (res.errMsg == "collection.get:ok") {
                        this.setData({
                            bannerImg: res.data[0].bannerImg,
                        })
                    }
                },
                fail: err => {
                    wx.stopPullDownRefresh() //停止下拉
                    wx.hideNavigationBarLoading() //隐藏标题栏加载
                    console.log('获取轮播图失败', err)
                }
            })
    },

    //获取菜系
    getCuisine() {
        db.collection('SysCuisine').where({})
            .get({
                success: res => {
                    wx.stopPullDownRefresh() //停止下拉
                    wx.hideNavigationBarLoading() //隐藏标题栏加载
                    console.log('获取菜系列表成功', res, )
                    if (res.errMsg == "collection.get:ok") {
                        this.setData({
                            SysCuisine: res.data,
                        })
                    }
                },
                fail: err => {
                    wx.stopPullDownRefresh() //停止下拉
                    wx.hideNavigationBarLoading() //隐藏标题栏加载
                    console.log('获取菜系列表失败', err)
                }
            })
    },


    // 查询总条数
    getStoreCount() {
        if (this.data.allContent == false) {
            db.collection('StoreList')
                .where({
                    Audit: true, //审核
                    forbidden: false, //禁用
                })
                .count({
                    success: res => {
                        console.log('查询店铺总条数成功：', res.total)
                        if (res.errMsg == "collection.count:ok") {
                            this.setData({
                                storeTotal: res.total,
                            })
                        }
                    },
                    fail: err => {
                        console.log('查询店铺总条数失败', err)
                    }
                })
        }
    },

    /**
     * 查询附近商店
     */
    getNearStore(Spage) {
        if (this.data.allContent == false) {
            let longitude = this.data.longitude //自己的位置
            let latitude = this.data.latitude
            console.log('执行了查询附近商店，页数：', Spage)
            db.collection('StoreList').where({
                    Audit: true, //审核状态
                    forbidden: false, //禁用状态
                    location: _.geoNear({
                        geometry: db.Geo.Point(longitude, latitude),
                        minDistance: 0,
                        maxDistance: app.globalData.maxDistance, //以自己为中心的最远距离（m）
                    }),
                })
                .skip(Spage) //从某条开始加载
                .limit(20) //每次加载20条
                .orderBy('score', 'desc')
                .get()
                .then(res => {
                    wx.stopPullDownRefresh() //停止下拉
                    wx.hideNavigationBarLoading() //隐藏标题栏加载
                    console.log('查询附近店铺成功：', res)
                    if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
                        let StoreDataList = []
                        let data = res.data
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
                            console.log('计算的距离：', Distance)
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
                                Price: data[i].Price,
                            }))
                            this.setData({
                                StoreList: StoreDataList,
                            })
                        }
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
                    console.log('查询附近店铺失败：', err)
                })
        }
    },

    // 查询总条数
    getGoodsCount() {
        if (this.data.allContent == false) {
            db.collection('GoodsList')
                .where({
                    forbidden: false, //禁用状态
                })
                .count({
                    success: res => {
                        console.log('查询商品总条数成功：', res.total)
                        if (res.errMsg == "collection.count:ok") {
                            this.setData({
                                GoodsTotal: res.total,
                            })
                        }
                    },
                    fail: err => {
                        console.log('查询商品总条数失败', err)
                    }
                })
        }
    },

    /**
     * 查询附近商品
     */
    getNearGoods(Gpage) {
        if (this.data.allContent == false) {
            let longitude = this.data.longitude //自己的位置
            let latitude = this.data.latitude
            console.log('执行了查询附近商品，页数：', Gpage)
            db.collection('GoodsList').where({
                    forbidden: false, //禁用状态
                    location: _.geoNear({
                        geometry: db.Geo.Point(longitude, latitude),
                        minDistance: 0,
                        maxDistance: app.globalData.maxDistance, //以自己为中心的最远距离（m）
                    }),
                })
                .skip(Gpage) //从某条开始加载
                .limit(20) //每次加载20条
                .orderBy('score', 'desc')
                .get()
                .then(res => {
                    wx.stopPullDownRefresh() //停止下拉
                    wx.hideNavigationBarLoading() //隐藏标题栏加载
                    console.log('查询附近商品成功：', res)
                    if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
                        let GoodsDataList = []
                        let data = res.data
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
                            console.log('计算的距离：', Distance)
                            GoodsDataList.push(({
                                Distance: Distance,
                                _id: data[i]._id,
                                _openid: data[i]._openid,
                                goodsName: data[i].goodsName,
                                storeName: data[i].storeName,
                                coverImg: data[i].coverImg,
                                cuisine: data[i].cuisine,
                                score: data[i].score,
                                Price: data[i].Price,
                                PriceUnit: data[i].PriceUnit
                            }))
                            this.setData({
                                GoodsList: GoodsDataList,
                            })
                        }
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
                    console.log('查询附近商品失败：', err)
                })
        }
    },

    // 选择地区
    chooseLocation() {
        wx.chooseLocation({
            success: res => {
                console.log('选择地区成功：', res)
                wx.setStorageSync('MyCity', res) //保存到本地缓存
                this.onShow() //去查询数据
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

    // 搜索输入值
    searchInput(e) {
        let value = e.detail.value
        console.log('编辑了搜索输入框：', value)
        if (value == '') {
            this.setData({
                StoreList: [],
                GoodsList: [],
                Sudoku: true,
                clear: false
            })
            let Spage = this.data.storePage
            this.getNearStore(Spage)
            let Gpage = this.data.GoodsPage
            this.getNearGoods(Gpage)
        } else {
            this.setData({
                searchData: value,
                clear: true
            })
        }
    },

    // 一键清除搜索输入值
    clearInput() {
        this.setData({
            StoreList: [],
            GoodsList: [],
            searchData: '',
            Sudoku: true,
            clear: false
        })
        let Spage = this.data.storePage
        this.getNearStore(Spage)
        let Gpage = this.data.GoodsPage
        this.getNearGoods(Gpage)
    },

    // 打开扫描
    goScan() {
        // 允许从相机和相册扫码
        wx.scanCode({
            // 扫码类型
            scanType: ['qrCode'],
            success: res => {
                console.log('扫描二维码成功', )
            },
            fail: res => {
                console.log('扫描二维码失败：', res)
            }
        })
    },

    //点击功能栏
    clickSudoku(e) {
        let CkdSudoku = this.data.CkdSudoku
        let key = e.currentTarget.dataset.key
        let itemid = e.currentTarget.dataset.itemid
        console.log('点击功能栏key：', key, CkdSudoku, itemid)
        if (this.data.pyq == false) {
            if (CkdSudoku) {
                this.setData({
                    CkdSudoku: false,
                    itemid,
                    sortKey: '商品',
                    StoreList: [],
                    GoodsList: [],
                })
                this.searchGoods(key)
            } else {
                if (this.data.itemid == itemid) {
                    this.setData({
                        CkdSudoku: true,
                        itemid: '',
                        sortKey: '店铺',
                        StoreList: [],
                        GoodsList: [],
                    })
                    let Spage = this.data.storePage
                    this.getNearStore(Spage)
                    let Gpage = this.data.GoodsPage
                    this.getNearGoods(Gpage)
                } else {
                    this.setData({
                        CkdSudoku: false,
                        itemid,
                        sortKey: '商品',
                        StoreList: [],
                        GoodsList: [],
                    })
                    this.searchGoods(key)
                }
            }
        } else {
            if (CkdSudoku) {
                this.setData({
                    CkdSudoku: false,
                    itemid,
                    sortKey: '商品',
                })
            } else {
                if (this.data.itemid == itemid) {
                    this.setData({
                        CkdSudoku: true,
                        itemid: '',
                        sortKey: '店铺',
                    })
                } else {
                    this.setData({
                        CkdSudoku: false,
                        itemid,
                        sortKey: '商品',
                    })
                }
            }
        }
    },

    //去搜索
    goSearch() {
        let key = this.data.searchData
        if (key) {
            this.setData({
                Sudoku: false,
                StoreList: [],
                GoodsList: [],
            })
            this.searchStore(key) //搜索店铺
            this.searchGoods(key) //搜索商品
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
        if (this.data.allContent == false) {
            let longitude = this.data.longitude //自己的位置
            let latitude = this.data.latitude
            console.log('搜索商店的key：', key)
            db.collection('StoreList')
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
                        console.log('搜索商店成功', res, res.data.length)
                        let StoreDataList = []
                        if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
                            let data = res.data
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
                                    Price: data[i].Price,
                                }))
                                this.setData({
                                    StoreList: StoreDataList,
                                })
                            }
                        } else {
                            wx.showToast({
                                title: '暂时没有搜索到相关店铺内容',
                                icon: 'none',
                                duration: 900,
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
        }
    },

    /**
     * 搜索商品
     */
    searchGoods(key) {
        if (this.data.allContent == false) {
            let longitude = this.data.longitude //自己的位置
            let latitude = this.data.latitude
            console.log('搜索商品的key：', key)
            db.collection('GoodsList')
                .where(
                    _.and(
                        _.or([{
                                forbidden: false, //禁用状态
                                storeName: db.RegExp({
                                    regexp: '.*' + key,
                                    options: 'i',
                                })
                            }, {
                                goodsName: db.RegExp({
                                    regexp: '.*' + key,
                                    options: 'i',
                                })
                            },
                            {
                                cuisine: db.RegExp({
                                    regexp: '.*' + key,
                                    options: 'i',
                                })
                            }, {
                                AddressName: db.RegExp({
                                    regexp: '.*' + key,
                                    options: 'i',
                                })
                            }, {
                                Address: db.RegExp({
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
                        console.log('搜索商品成功', res, res.data.length)
                        let GoodsDataList = []
                        if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
                            let data = res.data
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
                                GoodsDataList.push(({
                                    Distance: Distance,
                                    _id: data[i]._id,
                                    _openid: data[i]._openid,
                                    goodsName: data[i].goodsName,
                                    storeName: data[i].storeName,
                                    coverImg: data[i].coverImg,
                                    cuisine: data[i].cuisine,
                                    score: data[i].score,
                                    Price: data[i].Price,
                                    PriceUnit: data[i].PriceUnit
                                }))
                                this.setData({
                                    GoodsList: GoodsDataList,
                                })
                            }
                        } else {
                            wx.showToast({
                                title: '暂时没有搜索到相关商品内容',
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
        }
    },

    //选择排序的类型
    onSortKey(e) {
        wx.showActionSheet({
            itemList: ['全部', '店铺', '商品'],
            success: res => {
                if (this.data.pyq == false) {
                    if (res.tapIndex === 0) {
                        //全部
                        this.setData({
                            sortKey: '全部',
                            StoreList: [],
                            GoodsList: []
                        })
                        let Spage = this.data.storePage
                        this.getNearStore(Spage)
                        let Gpage = this.data.GoodsPage
                        this.getNearGoods(Gpage)
                    }
                    if (res.tapIndex === 1) {
                        //店铺
                        this.setData({
                            sortKey: '店铺',
                            StoreList: [],
                            GoodsList: []
                        })
                        let Spage = this.data.storePage
                        this.getNearStore(Spage)
                    }
                    if (res.tapIndex === 2) {
                        //商品
                        this.setData({
                            sortKey: '商品',
                            StoreList: [],
                            GoodsList: []
                        })
                        let Gpage = this.data.GoodsPage
                        this.getNearGoods(Gpage)
                    }
                } else {
                    if (res.tapIndex === 0) {
                        let StoreDataList = []
                        StoreDataList.push({
                            Distance: '4.90',
                            _id: '',
                            _openid: '',
                            storeName: '甜七度甜品店',
                            coverImg: ['cloud://formal-env-7gc2z2yb19446734.666f-formal-env-7gc2z2yb19446734-1305119510/pyq/七七.jpg'],
                            Address: '海南省海口市龙华区金龙路附近',
                            feat: '七七甜品',
                            cuisine: '甜品类',
                            score: Number(5),
                            Price: '19',
                        }, {
                            Distance: '6.30',
                            _id: '',
                            _openid: '',
                            storeName: '蟹堡王',
                            coverImg: ['cloud://formal-env-7gc2z2yb19446734.666f-formal-env-7gc2z2yb19446734-1305119510/pyq/蟹黄堡-店铺.jpg'],
                            Address: '比奇堡',
                            feat: '健康美味',
                            cuisine: '汉堡包',
                            score: Number(4),
                            Price: '15',
                        })


                        let GoodsDataList = []
                        GoodsDataList.push({
                            Distance: '4.90',
                            _id: '',
                            _openid: '',
                            goodsName: '椰奶',
                            storeName: '甜七度甜品店',
                            coverImg: ['cloud://formal-env-7gc2z2yb19446734.666f-formal-env-7gc2z2yb19446734-1305119510/pyq/椰奶2.jpg'],
                            cuisine: '甜品类',
                            score: Number(4),
                            Price: '19',
                            PriceUnit: '元/份'
                        }, {
                            Distance: '6.30',
                            _id: '',
                            _openid: '',
                            goodsName: '美味蟹堡',
                            storeName: '蟹堡王',
                            coverImg: ['cloud://formal-env-7gc2z2yb19446734.666f-formal-env-7gc2z2yb19446734-1305119510/pyq/蟹黄堡-商品.gif'],
                            cuisine: '汉堡包',
                            score: Number(3),
                            Price: '15',
                            PriceUnit: '元/份'
                        })

                        //全部
                        this.setData({
                            sortKey: '全部',
                            StoreList: StoreDataList,
                            GoodsList: GoodsDataList
                        })
                    }
                    if (res.tapIndex === 1) {
                        let StoreDataList = []
                        StoreDataList.push({
                            Distance: '4.90',
                            _id: '',
                            _openid: '',
                            storeName: '甜七度甜品店',
                            coverImg: ['cloud://formal-env-7gc2z2yb19446734.666f-formal-env-7gc2z2yb19446734-1305119510/pyq/七七.jpg'],
                            Address: '海南省海口市龙华区金龙路附近',
                            feat: '七七甜品',
                            cuisine: '甜品类',
                            score: Number(5),
                            Price: '19',
                        }, {
                            Distance: '6.30',
                            _id: '',
                            _openid: '',
                            storeName: '蟹堡王',
                            coverImg: ['cloud://formal-env-7gc2z2yb19446734.666f-formal-env-7gc2z2yb19446734-1305119510/pyq/蟹黄堡-店铺.jpg'],
                            Address: '比奇堡',
                            feat: '健康美味',
                            cuisine: '汉堡包',
                            score: Number(4),
                            Price: '15',
                        })
                        //店铺
                        this.setData({
                            sortKey: '店铺',
                            StoreList: StoreDataList,
                            GoodsList: []
                        })
                    }
                    if (res.tapIndex === 2) {
                        let GoodsDataList = []
                        GoodsDataList.push({
                            Distance: '4.90',
                            _id: '',
                            _openid: '',
                            goodsName: '椰奶',
                            storeName: '甜七度甜品店',
                            coverImg: ['cloud://formal-env-7gc2z2yb19446734.666f-formal-env-7gc2z2yb19446734-1305119510/pyq/椰奶2.jpg'],
                            cuisine: '甜品类',
                            score: Number(4),
                            Price: '19',
                            PriceUnit: '元/份'
                        }, {
                            Distance: '6.30',
                            _id: '',
                            _openid: '',
                            goodsName: '美味蟹堡',
                            storeName: '蟹堡王',
                            coverImg: ['cloud://formal-env-7gc2z2yb19446734.666f-formal-env-7gc2z2yb19446734-1305119510/pyq/蟹黄堡-商品.gif'],
                            cuisine: '汉堡包',
                            score: Number(3),
                            Price: '15',
                            PriceUnit: '元/份'
                        })
                        //商品
                        this.setData({
                            sortKey: '商品',
                            StoreList: [],
                            GoodsList: GoodsDataList
                        })
                    }
                }
            },
            fail: err => {
                console.log('点击了取消')
            }
        })
    },

    // 排序
    onSort(e) {
        let sortKey = this.data.sortKey
        let sortBol = this.data.sortBol
        let property = e.currentTarget.dataset.key
        console.log('点击了排序：', sortBol, property, sortKey)
        if (sortKey == '店铺') {
            let newStoreList = this.data.StoreList.sort(this.compare(property))
            this.setData({
                StoreList: newStoreList,
            })
        } else {
            let newGoodsList = this.data.GoodsList.sort(this.compare(property))
            this.setData({
                GoodsList: newGoodsList,
            })
        }

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
        let id = e.currentTarget.dataset.id //在页面里绑定的id
        let url = '/StorePackage/storeDetail/storeDetail'
        wx.navigateTo({
            url: `${url}?id=${id}`,
        })
    },

    // 点击卡片跳转到商品详情页
    goGoodsDetail(e) {
        let id = e.currentTarget.dataset.id //在页面里绑定的id
        let url = '/StorePackage/goodsDetail/goodsDetail'
        wx.navigateTo({
            url: `${url}?id=${id}`,
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
        let sortKey = this.data.sortKey
        if (sortKey == '全部') {
            let Stotal = this.data.storeTotal
            let Spage = this.data.storePage
            let SList = this.data.StoreList
            console.log('触底de店铺条数：', Stotal, '页数：', Spage, '列表数：', SList.length)
            let Gtotal = this.data.GoodsTotal
            let Gpage = this.data.GoodsPage
            let GList = this.data.GoodsList
            console.log('触底de商品条数：', Gtotal, '页数：', Gpage, '列表数：', GList.length)

            if (SList.length < Stotal) {
                Spage = SList.length
                this.getNearStore(Spage)
            }
            if (GList.length < Gtotal) {
                Gpage = GList.length
                this.getNearGoods(Gpage)
            }
            if (SList.length == Stotal || SList.length == Stotal) {
                wx.showToast({
                    title: '看到底了哟！',
                    icon: 'none',
                    duration: 1000,
                })
            }
        }
        if (sortKey == '店铺') {
            let Stotal = this.data.storeTotal
            let Spage = this.data.storePage
            let SList = this.data.StoreList
            console.log('触底de店铺条数：', Stotal, '页数：', Spage, '列表数：', SList.length)
            if (SList.length < Stotal) {
                Spage = SList.length
                this.getNearStore(Spage)
            } else {
                wx.showToast({
                    title: '看到底了哟！',
                    icon: 'none',
                    duration: 1000,
                })
            }
        }
        if (sortKey == '商品') {
            let Gtotal = this.data.GoodsTotal
            let Gpage = this.data.GoodsPage
            let GList = this.data.GoodsList
            console.log('触底de商品条数：', Gtotal, '页数：', Gpage, '列表数：', GList.length)
            if (GList.length < Gtotal) {
                Gpage = GList.length
                this.getNearGoods(Gpage)
            } else {
                wx.showToast({
                    title: '看到底了哟！',
                    icon: 'none',
                    duration: 1000,
                })
            }
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {
        return {
            title: '小吃地图',
        }
    },

    //分享朋友圈
    onShareTimeline: function () {
        return {
            title: '小吃地图', //分享的标题
            query: "name=pyq",
        }
    },


})