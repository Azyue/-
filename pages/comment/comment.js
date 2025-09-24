// pages/comment/comment.js
const {
    formatTime
} = require("../../utils/util.js")
const db = wx.cloud.database();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        commId: '', //被评论的id
        default_score: 0,
        score: 0,
        score_text_arr: ['非常差', '差', '一般', '好', '非常好'],
        score_text: "",
        score_img_arr: [],
        time: null,
        userInfo: null,

        commtext: "", //评论内容
        imgFileID: [],
        imgList: [], //显示图片
        videoFileID: [],
        videoList: [], //显示视频
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            commId: options.id
        })
        this._default_score(this.data.default_score);
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    //初始化星的数量
    _default_score: function (tauch_score = 0) {
        var score_img = [];
        var score = 0;
        for (let i = 0; i < 5; i++) {
            if (i < tauch_score) {
                score_img[i] = "/images/star_on.png"
                score = i;
            } else {
                score_img[i] = "/images/star_off.png"
            }
        }
        this.setData({
            score_img_arr: score_img,
            score_text: this.data.score_text_arr[score]
        });
    },
    // 获取输入值
    inputValue(e) {
        console.log('编辑输入框：', e.detail.value)
        this.setData({
            commtext: e.detail.value
        })
    },

    //获取评分
    onScore(e) {
        var score = e.currentTarget.dataset.score;
        console.log('选择的评分：', score)
        this._default_score(score);
        this.setData({
            score: score,
        })
    },

    //选择图片
    ChooseMedia(e) {
        wx.chooseMedia({
            count: 5, //最多课选择的数量
            sizeType: ['compressed'], //可选择原图或压缩后的图片
            sourceType: ['album', 'camera'], //可选择性开放访问相册、相机
            mediaType: ['mix'], //图片和视频混合选择
            success: res => {
                console.log('选择图片视频成功：', res)

                let imgArr = []
                let videArr = []
                for (let i = 0; i < res.tempFiles.length; i++) {
                    if (res.tempFiles[i].fileType == 'image') {
                        imgArr.push(res.tempFiles[i])

                    } else {
                        videArr.push(res.tempFiles[i])

                    }
                }

                //图片列表赋值
                if (this.data.imgList.length != 0) {
                    console.log('if')
                    this.setData({
                        imgList: this.data.imgList.concat(imgArr),
                    })
                } else {
                    console.log('else')
                    this.setData({
                        imgList: imgArr
                    })
                }

                //视频列表赋值
                if (this.data.videoList.length != 0) {
                    this.setData({
                        videoList: this.data.videoList.concat(videArr),
                    })
                } else {
                    this.setData({
                        videoList: videArr
                    })
                }
            },
            fail: err => {
                console.log('选择图片视频失败：', err)
            }
        })

    },


    //删除图片
    DelImg(e) {
        this.data.imgList.splice(e.currentTarget.dataset.index, 1);
        this.setData({
            imgList: this.data.imgList,
        })
    },

    //删除视频
    DelVide(e) {
        this.data.videoList.splice(e.currentTarget.dataset.index, 1);
        this.setData({
            videoList: this.data.videoList,
        })
    },

    // 大图预览
    preViewMedia(e) {
        console.log('大图预览：', e)
        const sources = [{
            url: e.currentTarget.dataset.url, // 当前预览资源的url链接
            current: e.currentTarget.dataset.index, // 当前显示的资源序号
            poster: e.currentTarget.dataset.poster, // 当前视频封面
            type: e.currentTarget.dataset.type, // 当前预览的文件类型
        }];
        wx.previewMedia({
            sources, // 需要预览的资源列表
            success(res) {
                console.log('大图预览成功:', res)
            },
            fail(res) {
                console.log('大图预览失败:', res)
            }
        });
    },

    // 提交信息前进行数据校验
    onSubmitBtn(e) {
        let text = this.data.commtext
        let ImgList = this.data.imgList
        let videoList = this.data.videoList
        let score = this.data.score
        if (text == '') {
            wx.showToast({
                title: '请填写评论！',
                duration: 700,
                icon: 'none',
                mask: true,
            })
            return;
        }
        // 图片为空时报错
        else if (ImgList.length == 0) {
            wx.showToast({
                title: '图片不能为空,最少需要一张！',
                duration: 700,
                icon: 'none',
                mask: true,
            })
            return;
        } else if (ImgList.length > 5) {
            wx.showToast({
                title: '图片不能超过5张！',
                duration: 700,
                icon: 'none',
                mask: true,
            })
            return;
        } else if (videoList.length > 5) {
            wx.showToast({
                title: '视频不能超过5个！',
                duration: 700,
                icon: 'none',
                mask: true,
            })
            return;
        } else if (score == '') {
            wx.showToast({
                title: '请选择评分！',
                duration: 700,
                icon: 'none',
                mask: true,
            })
            return;
        } else {
            // 上传图片
            this.UpImages(ImgList)
        }
    },

    // 上传图片
    UpImages(ImgList) {
        let imgFileID = [] //把图片以数组保存
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        // 存储照片
        for (let i = 0; i < ImgList.length; i++) {
            const fileName = ImgList[i].tempFilePath; //this.data.imgList是数组类型，把imgList转换字符串fileName
            const cloudPath = "CommImg/" + Date.now() + Math.floor(Math.random(0, 1) * 10000000) + '.jpg'; //云存储地址
            wx.cloud.uploadFile({
                    cloudPath,
                    filePath: fileName,
                }).then(res => {
                    //console.log('uploadFile-then的fileID', res.fileID, 'fileID的类型', typeof res.fileID)
                    imgFileID.push(res.fileID) //返回的res.fileID是字符串类型，把上传成功后返回的res.fileID压入（push）imgFileID数组中，这样写入数据库就是数组了
                    console.log('imgFileID：', imgFileID, 'imgFileID类型：', typeof imgFileID)
                    if (imgFileID.length == ImgList.length) {
                        wx.hideLoading()
                        this.setData({
                            imgFileID
                        })
                        if (this.data.videoList != '') {
                            this.UpVideo()
                        } else {
                            this.SubmitData()
                        }

                    }
                })
                .catch(err => {
                    // uploadFile上传图片失败，则把已经上传的图片删除
                    wx.hideLoading()
                    wx.cloud.deleteFile({
                        fileList: imgFileID, //deleteFile的fileList是数组才能删除
                        success: res => {
                            if (res.errMsg == "cloud.deleteFile:ok") {
                                console.log('评论图片上传失败：', err)
                                wx.showToast({
                                    title: '网络错误，操作失败！',
                                    duration: 1000,
                                    icon: 'none',
                                    mask: true,
                                })
                            }
                        },
                        fail: err => {}
                    })
                })
        }
    },

    // 上传视频
    UpVideo() {
        let videoFileID = [] //把图片以数组保存
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        // 存储照片
        for (let i = 0; i < this.data.videoList.length; i++) {
            const fileName = this.data.videoList[i].tempFilePath; //this.data.imgList是数组类型，把imgList转换字符串fileName
            const cloudPath = "CommVideo/" + Date.now() + Math.floor(Math.random(0, 1) * 10000000) + '.mp4'; //云存储地址
            wx.cloud.uploadFile({
                    cloudPath,
                    filePath: fileName,
                }).then(res => {
                    //console.log('uploadFile-then的fileID', res.fileID, 'fileID的类型', typeof res.fileID)
                    videoFileID.push(res.fileID) //返回的res.fileID是字符串类型，把上传成功后返回的res.fileID压入（push）imgFileID数组中，这样写入数据库就是数组了
                    console.log('imgFileID：', videoFileID, 'imgFileID类型：', typeof videoFileID)
                    if (videoFileID.length == this.data.videoList.length) {
                        wx.hideLoading()
                        this.setData({
                            videoFileID
                        })
                        this.SubmitData()
                    }
                })
                .catch(err => {
                    // uploadFile上传图片失败，则把已经上传的图片删除
                    wx.hideLoading()
                    wx.cloud.deleteFile({
                        fileList: videoFileID, //deleteFile的fileList是数组才能删除
                        success: res => {
                            if (res.errMsg == "cloud.deleteFile:ok") {
                                console.log('评论视频上传失败：', err)
                                wx.showToast({
                                    title: '网络错误，操作失败！',
                                    duration: 1000,
                                    icon: 'none',
                                    mask: true,
                                })
                            }
                        },
                        fail: err => {}
                    })
                })
        }
    },


    // 写入数据库
    SubmitData() {
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        let userInfo = wx.getStorageSync('UserInfo') // 获取缓存的用户信息
        db.collection('Comments')
            .add({
                data: {
                    CommId: this.data.commId,
                    CommPublish: false,
                    CommAvatarUrl: userInfo[0].avatarUrl,
                    CommNickName: userInfo[0].nickName,
                    CommText: this.data.commtext,
                    CommScore: this.data.score,
                    CommImg: this.data.imgFileID,
                    CommVide: this.data.videoFileID,
                    CommTime: formatTime(new Date())
                },
                success: res => {
                    console.log('评论信息写入成功：', res.errMsg)
                    wx.hideLoading()
                    if (res.errMsg == "collection.add:ok") {
                        wx.showModal({
                            title: '温馨提示',
                            content: '评论成功，等待管理员审核后即可显示',
                            showCancel: false,
                            confirmText: '返回',
                            complete: (res) => {
                                if (res.confirm) {
                                    wx.navigateBack({
                                        delta: 1
                                    })
                                }
                            }
                        })
                    }
                },
                fail: err => {
                    wx.hideLoading()
                    //发布失败，则把已经上传的图片删除
                    wx.cloud.deleteFile({
                        fileList: imgFileID, //deleteFile的fileList是数组才能删除
                        success: res => {
                            if (res.errMsg == "cloud.deleteFile:ok") {
                                console.log('评论信息写入失败：', err)
                                wx.showToast({
                                    title: '发表失败！',
                                    duration: 1000,
                                    icon: 'none',
                                    mask: true,
                                })
                            }
                        },
                        fail: err => {}
                    })
                }
            })
    }

})