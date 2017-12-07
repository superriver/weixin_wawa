//index.js
//获取应用实例
const app = getApp()
var config = require('../../script/config.js')
var wawa = require('../../script/fetch.js')
Page({
  data: {
    toys: [],
    hasMore: false,
    showLoading: false,
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
      var that = this;
      wawa.fetchList.call(that, config.apiList.toysUrl)



    // if (app.globalData.userInfo) {
    //   this.setData({
    //     userInfo: app.globalData.userInfo,
    //     hasUserInfo: true
    //   })
    // } else if (this.data.canIUse){
    //   // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //   // 所以此处加入 callback 以防止这种情况
    //   app.userInfoReadyCallback = res => {
    //     this.setData({
    //       userInfo: res.userInfo,
    //       hasUserInfo: true
    //     })
    //   }
    // } else {
    //   // 在没有 open-type=getUserInfo 版本的兼容处理
    //   wx.getUserInfo({
    //     success: res => {
    //       app.globalData.userInfo = res.userInfo
    //       this.setData({
    //         userInfo: res.userInfo,
    //         hasUserInfo: true
    //       })
    //     }
    //   })
    // }
  },
  // getUserInfo: function(e) {
  //   console.log(e)
  //   app.globalData.userInfo = e.detail.userInfo
  //   this.setData({
  //     userInfo: e.detail.userInfo,
  //     hasUserInfo: true
  //   })
  // },


  viewRoomDetail:function(e){

    wx.showModal({
      title: '提示',
      confirmText:'去充值',
      cancelText:'不玩了',
      content: '抓娃娃机每次玩耍30秒，共2元',
      success:function(res){
        if(res.confirm){
          //充值页面
          wx.navigateTo({
            url: '../game/game',
          })
        }else{
          //取消
        }
      }
    })
    
  }
})
