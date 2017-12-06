

function fetchList(url){
  var that=this;
  wx.request({
    url: url,
   
    method:'POST',
    header:{
      "Content-Type":"application/json"
    },
    success:function(res){
      console.log(res.data);
        that.setData({
          toys: that.data.toys.concat(res.data.rooms)
        })
    },
    fail:function(){

    },
    complete:function(){

    }


  })
}

module.exports={
  fetchList: fetchList
}