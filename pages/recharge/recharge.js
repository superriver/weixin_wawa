// pages/recharge/recharge.js
var initNum = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num: initNum,
    total:2,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  
  add:function(){
    initNum = initNum +1;
    var sum = initNum*2;
    this.setData({
      num:initNum,
      total:sum
    });
  },
  reduce:function(e){
    var value = this.data.num;
    initNum = initNum-1;
    var sum = initNum * 2;
    if (value > 1) {
      this.setData({
        num: initNum,     
        total:sum
      });
    }
    
  }
})