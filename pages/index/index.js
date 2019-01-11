//index.js
//获取应用实例
const app = getApp()
const util = require("../../utils/util.js")
var types = ["1", "41", "10", "29", "31"];
var DATATYPE = {
  ALLDATATYPE: "1",
  VIDEODATATYPE: "41",
  PICTUREDATATYPE: "10",
  TEXTDATATYPE: "29",
  VOICEDATATYPE: "31"
};
var page = 1;//页码
var allMaxtime = 0;//全部 最大时间
var videoMaxtime = 0;//视频 最大时间
var pictureMaxtime = 0;//图片 最大时间
var textMaxtime = 0;//段子 最大时间
var voiceMaxtime = 0;//声音 最大时间
var currentVideoArr;
var video;
var videoid;
var videoOffsettop;
var videoHeight;
var videoWidth;
var devicewidth;
var hasloadmore = true;
var hasrefresh = true;
var currentDirection;
Page({
  data: {
    allDataList: [],
    videoDataList: [],
    pictureDataList: [],
    textDataList: [],
    voiceDataList: [],
    navlist:['推荐','视频','图片','段子'],
    currentTopItem:0,
    scrollviewheight:'0',
    deviceWidth:'0',
    dataLength:0,
    play:false,
    currentvideo:'0',
    refresh:true,
    refreshHeight:0,
    finishload:false,
    finishloadmore:true,
    touchdesc:'',
    touchStart:true
  },

  switchTab:function(e){
    this.setData({
      currentTopItem: e.currentTarget.dataset.idx
    });
    if(this.needRefreshData()){
      this.refreshNewData();
    }
  },

  //刷新数据
  refreshNewData:function(){
    var that = this;
    var parameters = 'list=list&data=data&type=' + types[this.data.currentTopItem];
    util.request(parameters,function(res){
      console.log(res.data);
      page = res.data.info.page
      that.setNewData(res.data, that);
      hasrefresh = true;
      that.setData({
        dataLength: res.data.list.length,
        finishload:true,
        touchStart:true
      });

    });
  },

  setNewData:function(datalist,target){
    
      switch(types[this.data.currentTopItem])
      {
        case DATATYPE.ALLDATATYPE:
        
          var min;
          var s;
          for(let i in datalist.list){
            var time = datalist.list[i].videotime;
            if (Math.floor(time / 60) < 10){
              min = '0' + Math.floor(time / 60);
            }else{
              min = Math.floor(time / 60);
            }
            if(time%60 < 10){
              s = '0'+time%60;
            }else{
              s = time%60;
            }
            datalist.list[i].videotime = min + ':' + s;
          }
          allMaxtime = datalist.info.maxtime;
        target.setData({
          allDataList: datalist.list
        });
        case DATATYPE.VIDEODATATYPE:
          var min;
          var s;
          for (let i in datalist.list) {
            var time = datalist.list[i].videotime;
            if (Math.floor(time / 60) < 10) {
              min = '0' + Math.floor(time / 60);
            } else {
              min = Math.floor(time / 60);
            }
            if (time % 60 < 10) {
              s = '0' + time % 60;
            } else {
              s = time % 60;
            }
            datalist.list[i].videotime = min + ':' + s;
          }
          videoMaxtime = datalist.info.maxtime;
        target.setData({
          videoDataList: datalist.list
        });

        case DATATYPE.PICTUREDATATYPE:
          pictureMaxtime = datalist.info.maxtime;
        target.setData({
          pictureDataList: datalist.list
        });

        case DATATYPE.TEXTDATATYPE:
          textMaxtime = datalist.info.maxtime;
        target.setData({
          textDataList: datalist.list
        });
      }
    
  },

  //是否需要刷新数据
  needRefreshData:function(){
    switch(types[this.data.currentTopItem])
    {
      case DATATYPE.ALLDATATYPE:
      return this.data.allDataList.length > 0 ? false : true;
      case DATATYPE.VIDEODATATYPE:
      return this.data.videoDataList.length > 0 ? false :true;
      case DATATYPE.PICTUREDATATYPE:
      return this.data.pictureDataList.length > 0 ? false : true;
      case DATATYPE.TEXTDATATYPE:
      return this.data.textDataList.length > 0 ?false : true;
    }
  },
  //手动下拉刷新数据
  refreshData:function(e){
    console.log(e)
    currentDirection = e.detail.direction;
    this.setData({
      touchdesc:'松开立即刷新',
      touchStart:false
    })
  },
  touchend:function(e){
    if(currentDirection == 'top'){
      if (hasrefresh == true) {
        hasrefresh = false;
        this.setData({
          touchdesc: '正在刷新数据...'
        })
        this.refreshNewData()
      }
    }
    
      
  },

  onLoad: function () {
    this.refreshNewData()

  },
  onReady: function () {
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        console.log(res.windowWidth);
        devicewidth = res.windowWidth - 20
        that.setData({
          scrollviewheight: res.windowHeight,
          deviceWidth:res.windowWidth - 20
        });
      }
    })
  },
  playvideo: function(e){
    var that = this;
    console.log(e.currentTarget);
    videoid = e.currentTarget.id;
    videoOffsettop = e.currentTarget.offsetTop;
    videoHeight = parseInt(e.currentTarget.dataset.height)
    videoWidth = parseInt(e.currentTarget.dataset.width)
    if(videoHeight>=videoWidth){
      videoHeight = devicewidth;
    }else{
      videoHeight = devicewidth / videoWidth * videoHeight;
    }
    console.log(videoHeight)
    if(video){
      video.pause();
      this.setData({
        play: !this.play
      });
    }
    
    video = wx.createVideoContext(e.currentTarget.id, this);
    video.play();
    that.setData({
      play: !this.play,
      currentvideo: e.currentTarget.id
    });
    
    
    
  },
  scrollevent:function(res){
    var that = this;
    //console.log(res.detail);
    var y = res.detail.scrollTop;
    //console.log(videoHeight + videoOffsettop)
    if(video){
      if(y>(videoHeight+videoOffsettop)){
        video.pause()
      }
    }
    

    
    
    
  },
  //加载更多数据
  loadMoreData:function(e){
    console.log(e)
    currentDirection = e.detail.direction;
    if(hasloadmore == true){
      hasloadmore = false;
      this.loadNextData();
      this.setData({
        finishloadmore: false
      })
    }
    
  },
  loadNextData:function(e){
    //console.log(e);
    var that = this;
    var parameters = 'list=list&data=data&type=' + types[this.data.currentTopItem] + '&page=' + (page + 1) + '&maxtime=' + this.getMaxtime();
    console.log(parameters)
    util.request(parameters, function (res) {
      console.log(res.data);
      hasloadmore = true;
      page+=1;
      that.setMoreDataWithRes(res.data, that)
      that.setData({
        dataLength: res.data.list.length,
        finishloadmore:true
      });

    });
  },
  setMoreDataWithRes:function(datalist,target){
    console.log(datalist)
    switch (types[this.data.currentTopItem]) {
      case DATATYPE.ALLDATATYPE:

        var min;
        var s;
        for (let i in datalist.list) {
          var time = datalist.list[i].videotime;
          if (Math.floor(time / 60) < 10) {
            min = '0' + Math.floor(time / 60);
          } else {
            min = Math.floor(time / 60);
          }
          if (time % 60 < 10) {
            s = '0' + time % 60;
          } else {
            s = time % 60;
          }
          datalist.list[i].videotime = min + ':' + s;
        }
        allMaxtime = datalist.info.maxtime;
        target.setData({
          allDataList: target.data.allDataList.concat(datalist.list)
        });
      case DATATYPE.VIDEODATATYPE:
        var min;
        var s;
        for (let i in datalist.list) {
          var time = datalist.list[i].videotime;
          if (Math.floor(time / 60) < 10) {
            min = '0' + Math.floor(time / 60);
          } else {
            min = Math.floor(time / 60);
          }
          if (time % 60 < 10) {
            s = '0' + time % 60;
          } else {
            s = time % 60;
          }
          datalist.list[i].videotime = min + ':' + s;
        }
        videoMaxtime = datalist.info.maxtime;
        target.setData({
          videoDataList: target.data.videoDataList.concat(datalist.list)
        });

      case DATATYPE.PICTUREDATATYPE:
        pictureMaxtime = datalist.info.maxtime;
        target.setData({
          pictureDataList: target.data.pictureDataList.concat(datalist.list)
        });

      case DATATYPE.TEXTDATATYPE:
        textMaxtime = datalist.info.maxtime;
        target.setData({
          textDataList: target.data.textDataList.concat(datalist.list)
        });
    }
  },
  getMaxtime: function () {
    switch (types[this.data.currentTopItem]) {
      //全部
      case DATATYPE.ALLDATATYPE:
        return allMaxtime;
      //视频
      case DATATYPE.VIDEODATATYPE:
        return videoMaxtime;
      //图片
      case DATATYPE.PICTUREDATATYPE:
        return pictureMaxtime;

      //段子
      case DATATYPE.TEXTDATATYPE:
        return textMaxtime;

      //声音
      case DATATYPE.VOICEDATATYPE:
        return voiceMaxtime;
      default:
        return 0;
    }
  },
  
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
