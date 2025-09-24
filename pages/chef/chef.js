// pages/chef/chef.js
const app = getApp();
const db = wx.cloud.database()
const _ = db.command
Page({

    /**
     * 页面的初始数据
     */
    data: {
        myCity: '选择地区',
        longitude: "",
        latitude: "",
        CkdItem: true, //选中状态
        itemid: '', //城市栏项id
        sortBol: true,
        cheftotal: 0,
        chefpage: 0,
        chefList: [],
        CityList: [],
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
                        chefList: [],
                        CityList: [],
                    })
                } else {
                    this.getHotCity()
                    let myCity = wx.getStorageSync('MyCity');
                    if (myCity) {
                        this.getMyCity()
                    } else {
                        wx.showToast({
                            title: '请先选择地区！',
                            icon: 'none',
                            duration: 900,
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

    //获取选择的地区
    getMyCity() {
        let myCity = wx.getStorageSync('MyCity');
        if (myCity) {
            this.setData({
                myCity: myCity.name,
                longitude: myCity.longitude,
                latitude: myCity.latitude,
                clear: false,
                chefList: [],
            })
            this.chefCount()
            let page = this.data.chefpage
            this.getChef(page)
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
    onHide() {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {},

    //获取城市列表
    getHotCity() {
        db.collection('HotCity')
            .get({
                success: res => {
                    console.log('获取热门城市成功：', res, )
                    if (res.errMsg == "collection.get:ok") {
                        this.setData({
                            CityList: res.data,
                        })
                    }
                },
                fail: err => {
                    console.log('获取热门城市失败：', err)
                }
            })
    },

    // 查询总条数
    chefCount() {
        db.collection('ChefList')
            .count({
                success: res => {
                    console.log('查询总条数成功：', res.total)
                    if (res.errMsg == "collection.count:ok") {
                        this.setData({
                            cheftotal: res.total,
                        })
                    }
                },
                fail: err => {
                    console.log('查询总条数失败', err)
                }
            })
    },

    /**
     * 获取厨师信息
     */
    getChef(page) {
        let longitude = this.data.longitude //自己的位置
        let latitude = this.data.latitude
        db.collection('ChefList')
            .where({
                forbidden: false, //禁用状态 
                location: _.geoNear({
                    geometry: db.Geo.Point(longitude, latitude),
                    minDistance: 0,
                    maxDistance: app.globalData.maxDistance, //以自己为中心的最远距离（m）
                }),
            })
            .skip(page) //从某条开始加载
            .limit(20) //每次加载20条
            .orderBy('score', 'desc')
            .get({
                success: res => {
                    wx.stopPullDownRefresh() //停止下拉
                    wx.hideNavigationBarLoading() //隐藏标题栏加载
                    if (res.errMsg == "collection.get:ok") {
                        let ChefDataList = []
                        let data = res.data
                        if (data.length > 0) {
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
                                ChefDataList.push(({
                                    Distance: Distance,
                                    _id: data[i]._id,
                                    _openid: data[i]._openid,
                                    chefName: data[i].chefName,
                                    storeName: data[i].storeName,
                                    chefImg: data[i].chefImg,
                                    chefCuisine: data[i].chefCuisine,
                                    score: data[i].score,
                                }))
                                this.setData({
                                    chefList: ChefDataList,
                                })
                            }
                        } else {
                            wx.showToast({
                                title: '附近暂时没有可展示的星厨！',
                                icon: 'none',
                                duration: 800,
                            })
                        }
                    }
                },
                fail: err => {
                    wx.stopPullDownRefresh() //停止下拉
                    wx.hideNavigationBarLoading() //隐藏标题栏加载
                    console.log('查询厨师列表失败', err)
                }
            })
    },

    // 点击卡片跳转到厨师详情页
    goChefDetail(e) {
        let id = e.currentTarget.dataset.id
        let url = '../../StorePackage/chefDetail/chefDetail'
        wx.navigateTo({
            url: `${url}?id=${id}`,
        })
    },

    //点击热门城市
    clickHotCity(e) {
        let CkdItem = this.data.CkdItem
        let key = e.currentTarget.dataset.key
        let itemid = e.currentTarget.dataset.itemid
        console.log('点击了热门城市：', key, CkdItem, itemid)
        if (CkdItem) {
            this.setData({
                CkdItem: false,
                itemid,
                chefList: [],
            })
            this.searchHotCityChef(key)
        } else {
            if (this.data.itemid == itemid) {
                this.setData({
                    CkdItem: true,
                    itemid: '',
                    goodstotal: 0,
                    goodspage: 0,
                    chefList: [],
                })
                this.chefCount()
                let page = this.data.chefpage
                this.getChef(page)
            } else {
                this.setData({
                    CkdItem: false,
                    itemid,
                    chefList: [],
                })
                this.searchHotCityChef(key)
            }
        }
    },

    // 搜索热门城市的厨师
    searchHotCityChef(key) {
        console.log('搜索的key：', key)
        db.collection('ChefList')
            .where({
                forbidden: false, //禁用状态 
                Address: db.RegExp({
                    regexp: '.*' + key,
                    options: 'i',
                })
            })
            .orderBy('score', 'desc')
            .get({
                success: res => {
                    console.log('查询热门城市厨师成功', res, res.data.length)
                    let ChefDataList = []
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
                            ChefDataList.push(({
                                Distance: Distance,
                                _id: data[i]._id,
                                _openid: data[i]._openid,
                                chefName: data[i].chefName,
                                storeName: data[i].storeName,
                                chefImg: data[i].chefImg,
                                chefCuisine: data[i].chefCuisine,
                                score: data[i].score,
                            }))
                            this.setData({
                                chefList: ChefDataList,
                            })
                        }
                    } else {
                        wx.showToast({
                            title: '暂时没有搜索到相关内容',
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

    // 搜索输入值
    searchInput(e) {
        let value = e.detail.value
        console.log('编辑了搜索输入框：', value)
        if (value == '') {
            this.setData({
                searchData: '',
                clear: false
            })
            this.chefCount()
            let page = this.data.chefpage
            this.getChef(page)
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
            searchData: '',
            clear: false
        })
        this.chefCount()
        let page = this.data.chefpage
        this.getChef(page)
    },


    //去搜索
    goSearch() {
        let key = this.data.searchData
        if (key) {
            this.setData({
                chefList: [],
            })
            this.searchChef(key)
        } else {
            wx.showToast({
                title: '请输入搜索内容',
                icon: 'none',
                duration: 800,
            })
        }
    },

    /**
     * 搜索厨师
     */
    searchChef(key) {
        let longitude = this.data.longitude //自己的位置
        let latitude = this.data.latitude
        console.log('搜索的key：', key)
        db.collection('ChefList')
            .where(
                _.and(
                    _.or([{
                            forbidden: false, //禁用状态 
                            chefName: db.RegExp({
                                regexp: '.*' + key,
                                options: 'i',
                            })
                        },
                        {
                            chefCuisine: db.RegExp({
                                regexp: '.*' + key,
                                options: 'i',
                            })
                        },
                        {
                            storeName: db.RegExp({
                                regexp: '.*' + key,
                                options: 'i',
                            })
                        },
                        {
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
                    console.log('搜索厨师成功', res, res.data.length)
                    let ChefDataList = []
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
                            ChefDataList.push(({
                                Distance: Distance,
                                _id: data[i]._id,
                                _openid: data[i]._openid,
                                chefName: data[i].chefName,
                                storeName: data[i].storeName,
                                chefImg: data[i].chefImg,
                                chefCuisine: data[i].chefCuisine,
                                score: data[i].score,
                            }))
                            this.setData({
                                chefList: ChefDataList,
                            })
                        }
                    } else {
                        wx.showToast({
                            title: '暂时没有搜索到相关内容',
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
        let newChefList = this.data.chefList.sort(this.compare(property, true))
        this.setData({
            chefList: newChefList,
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
        let total = this.data.cheftotal
        console.log('触底de条数', total)
        let page = this.data.chefpage
        console.log('触底de页数', page)
        let List = this.data.chefList
        if (List.length < total) {
            page = List.length
            this.getChef(page)
        } else {
            wx.showToast({
                title: '看到底了哟！',
                icon: 'none',
                duration: 1000,
            })
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {}
})