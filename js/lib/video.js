/**
 * @description : 该文件用于实现播放器代码。(embed object video)
 * @version     : 1.0.6
 * 
 **/
 define(function(){
    var F = (function (F) {

  "use strict";

  // 合并对象。
  function _merge(s, t) {
    var result = {};

    if (!t) {
      return result;
    }

    for (var i in s) {
      result[i] = typeof t[i] !== "undefined" ? t[i] : s[i];
    }

    return result;
  }

  //获取cookie
  function _getCookie(name) {
    var arg = name + "=";
    var alen = arg.length;
    var clen = document.cookie.length;
    var i = 0;
    while (i < clen) {
        var j = i + alen;
        if (document.cookie.substring(i, j) == arg) {
            return (function(offset){
                var endstr = document.cookie.indexOf (";", offset);
                if (endstr == -1) {
                    endstr = document.cookie.length;
                }
                return decodeURIComponent(document.cookie.substring(offset, endstr));
            })(j);
        }
        i = document.cookie.indexOf(" ", i) + 1;
        if (i == 0) break; 
    }
    return "";
  }

  //设置cookie
  function _setCookie(name, value, params) {    
    var cStrArr = [];
    cStrArr.push(name + '=' + encodeURIComponent(value));
    
    if (typeof params === 'undefined') {
      params = {};
    }
    if (typeof params.expires !== 'undefined') {
      var date = new Date();
      date.setTime(date.getTime() + (params.expires) * 1000 * 60);
      cStrArr.push('; expires=' + date.toGMTString());
    }
    cStrArr.push((typeof params.path !== 'undefined') ? '; path=' + params.path : '');
    cStrArr.push((typeof params.domain !== 'undefined') ? '; domain=' + params.domain : '');
    cStrArr.push((typeof params.secure !== 'undefined') ? '; secure' : '');

    document.cookie = cStrArr.join('');
  }

  /**
   * html5的构造函数
   * @param {String} elmId    放置视频的容器
   * @param {Object} settings 参数配置对象
   * -------------------------具体参数列表
   *
   * data:    {Array}   播放地址列表
   * width:     {Number}  播放器宽
   * height:    {Number}  播放器高
   * id:      {String}  播放器id
   * autoplay:  {Boolean} 是否自动播放
   * poster:    {String}  海报图地址
   * controls:  {Boolean} 是否显示控制条
   * loadingImg:  {String}  隐藏的很深的一个参数，和poster参数功能有重复，看是否需要去掉某个
   */
  var Html5Video = function (elmId, settings) {
    
    if (!elmId) {
      return;
    }

    // 设置参数
    this.settings = _merge({
      data : [],
      width : 600,
      height : 455,
      id : "player",
      autoPlay : true,
      poster : "",
      controls : true,
      ended: this.ended,
      playing: this.playing,
      pause: this.pause
    }, settings);
    
    // 索引设置为0
    this.index = 0;
    // 获取放置视频的容器
    this.box = document.getElementById(elmId);
    //当前播放视频guid
    this.curGuid = '';
    //记录的guid
    this.remGuid = '';
    // 在容器中再生成一个容器，设置为相对定位
    var container = document.createElement("div");
    container.style.position = "relative";
    this.container = container;
    this.box.appendChild(this.container);
    // 开始初始化
    this.init();
  };

  Html5Video.prototype = {

    //随机获取一个uid
    getRandomUid : function () {
      var date = new Date().getTime(),
        uid = '',
        fn = '',
        sn = '';

      fn = ((Math.random() * 2147483648) | 0).toString(36);
      sn = Math.round(Math.random() * 10000);
      uid = date + '_' + fn + sn;
      return uid;
    },
    
    init : function () {
      var _this = this;
      // 创建一个video对象
      this.video = this.videoFactory();
      // 将视频插入容器
      this.container.appendChild(this.video);
      this.curGuid = playermsg.videoid;
      // 绑定播放开始事件
      this.bind(this.video, "play", function () {
        
        if (_this.remGuid !== _this.curGuid) {
          _this.remGuid = _this.curGuid;
          var params = {};
          params.id = playermsg.videoid;
          params.sid = _getCookie('sid');

          //如果获取userid为空串的话，生成一个userid
          if (_getCookie('userid') === '') {
            _setCookie('userid', _this.getRandomUid(), {domain: '.ifeng.com', path: '/', expires: 60 * 24 * 360});
          }
          params.uid = _getCookie('userid');

          var cid = typeof playermsg.categoryId !== 'undefined' ? playermsg.categoryId : '';
          var cname = playermsg.columnName;
          params.cat = cid
          params.se = typeof cname !== 'undefined' ? cname : cid;
          params.ptype = cid === '' ? '' : cid.substr(0, 4);
          params.ref = window.location.href.replace(/#/g,'$');
          params.tm = new Date().getTime();
          //判断设备类型
          if (typeof device !== 'undefined' && typeof device.type !== 'undefined') {

            if (device.type === 'mobile') {
              params.loc = 'phone';
            
            } else if (device.type === 'pad') {
              params.loc = 'pad';
            }
          }
          sendHTML5VideoInfo(params);
        }
      });

      this.bind(this.video, "pause", function() {
        _this.settings.pause.call(_this);
      });

      this.bind(this.video, "playing", function() {
        _this.settings.playing.call(_this);
      });
      // 绑定播放结束事件，
      this.bind(this.video, "ended", function () {
        _this.settings.ended.call(_this);
      });
      
      this.bind(this.video, "dataunavailble", function () {
        if (document.getElementById("player").readyState === 0) {
          alert("不支持该视频格式");
        }
      });

      this.checkVideoState(this.video);
    },

    playing: function() {},
    pause: function() {},

    ended: function () {

      var settings = this.settings;
      var data = settings.data;
      this.index = this.index + 1;
      var next = data[this.index];
      // 如果下一个地址为空，直接返回
      if (!next) {
        return;
      }
      this.video.setAttribute("src", next);
      this.video.play();
    },

    /**
     * 创造一个video对象
     */
    videoFactory : function () {
      var settings = this.settings;
      var video = document.createElement("video");
      video.width = settings.width;
      video.height = settings.height;
      video.setAttribute("id", settings.id);

      if (settings.poster !== "") {
        video.setAttribute("poster", settings.poster);
      }

      if (settings.controls === true) {
        video.setAttribute("controls", "controls");
      }

      if (settings.autoPlay === true) {
        video.setAttribute("autoplay", "autoplay");
      }

      // setting中并没有设置这个。
      // settings.loadingImg && video.setAttribute("poster", settings.loadingImg);
      if (typeof settings.data[0] !== "undefined") {
        video.setAttribute("src", settings.data[0]);
      }
      
      return video;
    },

    // 注册事件的封装
    bind : function (target, e, callback, useCapture) {
      try {
        target.addEventListener(e, function (event) {
          callback(event);
        }, useCapture ? useCapture : false);
      } catch (e) {
        throw new Error("check the params.");
      }
    },

    // 检查视频的状态
    checkVideoState : function (video) {
      var retry = 5;
      this.bind(video, "error", function () {
        if (!retry) {
          return;
        }
        retry = retry - 1;
        switch (video.readyState) {
        case 0 :
        case 1 :
        case 2 :
          var pos = video.currentTime;
          video.load();
          video.play();
          video.currentTime = pos;
          break;
        default :
          break;
        }
      });
    }
  };

  /**
   * flash player的构造函数
   * @param {String} elmId    放置播放器的容器
   * @param {Object} settings 参数配置对象
   * -------------------------具体参数列表
   *
   * url:     {String}  播放地址字符串
   * width:     {Number}  播放器的宽度值
   * height:    {Number}  播放器的高度值
   * id:      {String}  播放器的id
   * version:   {Array}   *不懂是什么
   *
   */
  var Player = function (elmId, settings) {
    if (!elmId) {
      return;
    }
    this.settings = _merge({
      url : "",
      width : 300,
      height : 225,
      id : "",
      version : [10, 0, 200]
    }, settings);
    this.el = document.getElementById(elmId);
    // 参数
    this.params = {};
    // 参数
    this.variables = {};
  };

  Player.prototype = {

    addParam : function (name, value) {
      this.params[name] = value;
    },

    addVariable : function (name, value) {
      this.variables[name] = value;
    },

    getVariables : function () {
      var a = [], o = this.variables;
      for (var i in o) {
        a.push(i + "=" + o[i]);
      }
      return a.join("&");
    },

    // todo: isIE并没有在此函数中声明和赋值。
    getParamString : function (isIE) {
      var a = [], o = this.params;
      var i;
      if (isIE) {
        for (i in o) {
          a.push('<param name="' + i + '" value="' + o[i] + '">');
        }
      } else {
        for (i in o) {
          a.push(i + "=" + o[i] + " ");
        }
      }
      return a.join("");
    },

    addCallback: function (callbackName, method, scope) {
      scope = scope || window;
      window[callbackName] = function () {
        return method.apply(scope, arguments);
      };
    },
    // 这个应该是调用扩展吧。
    callExternal : function (movieName, method, param, mathodCallback) {
      var o = navigator.appName.indexOf("Microsoft") !== -1 ? window[movieName] : document[movieName];
      o[method](param, mathodCallback);
    },

    play : function () {
      var fls = this.getVersion(), v = this.settings.version;
      
      // 如果当前浏览器flash版本号低于设置中规定的版本
      if (parseInt(fls[0], 10) < v[0] && parseInt(fls[1], 10) < v[1] && parseInt(fls[2], 10) < v[2]) {
        this.el.innerHTML = '<a style="display:block;height:31px;width:190px;line-height:31px;font-size:12px;text-decoration:none;text-align:center;position:absolute;top:100px;left:410px;border:2px outset #999;" href="http://get.adobe.com/flashplayer/" target="_blank">请下载最新版的flash播放器</a>';
        return;
      }
      
      var f = [];
      if (!!window.ActiveXObject) {
        f.push('<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0" width="');
        f.push(this.settings.width);
        f.push('" height="');
        f.push(this.settings.height);
        f.push('" id="');
        f.push(this.settings.id);
        f.push('"><param name="movie" value="');
        f.push(this.settings.url);
        f.push('"><param name="flashvars" value="');
        f.push(this.getVariables());
        f.push('">');
        f.push(this.getParamString(true));
        f.push("</object>");
      } else {
        f.push('<embed pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash"');
        f.push(' src="');
        f.push(this.settings.url);
        f.push('" height="');
        f.push(this.settings.height);
        f.push('" width="');
        f.push(this.settings.width);
        f.push('" id="');
        f.push(this.settings.id);
        f.push('" flashvars="');
        f.push(this.getVariables());
        f.push('" ');
        f.push(this.getParamString(false));
        f.push(">");
      }
      this.el.innerHTML = f.join("");
    },
    
    // 获取flash插件版本
    getVersion : function () {
      var b = [0, 0, 0];
      var c, f;
      if (navigator.plugins && navigator.mimeTypes.length) {
        var plugins = navigator.plugins["Shockwave Flash"];
        if (plugins && plugins.description) {
          return plugins.description.replace(/^\D+/, "").replace(/\s*r/, ".").replace(/\s*[a-z]+\d*/, ".0").split(".");
        }
      }
      if (navigator.userAgent && navigator.userAgent.indexOf("Windows CE") !== -1) {
        c = 1;
        f = 3;
        while (c) {
          try {
            c = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + (++f));
            return [f, 0, 0];
          } catch (d) {
            c = null;
          }
        }
      }
      try {
        c = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
      } catch (d) {
        try {
          c = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
          b = [6, 0, 21];
          c.AllowScriptAccess = "always";
        } catch (d) {
          if (b.major === 6) {
            return b;
          }
        }
        try {
          c = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
        } catch (d) {
        }
      }
      if (c) {
        b = c.GetVariable("$version").split(" ")[1].split(",");
      }
      return b;
    }
  };

  F.video = F.video || {};
  F.video.Player = Player;
  F.video.Html5Video = Html5Video;
  return F;

}(F || {}));


//移动设备

var ClientRedirect = (function () {
  "use strict";
  var sUserAgent = navigator.userAgent.toLowerCase();
  // var bIsIpad = sUserAgent.match(/ipad/i) === "ipad";
  // var bIsIphoneOs = sUserAgent.match(/iphone os/i) === "iphone os";
  // var bIsMidp = sUserAgent.match(/midp/i) === "midp";
  // var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) === "rv:1.2.3.4";
  // var bIsUc = sUserAgent.match(/ucweb/i) === "ucweb";
  // var bIsAndroid = sUserAgent.match(/android/i) === "android";
  // var bIsCE = sUserAgent.match(/windows ce/i) === "windows ce";
  // var bIsWM = sUserAgent.match(/windows phone/i) === "windows phone";

  var bIsIpad = sUserAgent.indexOf("ipad") > -1;
  var bIsIphoneOs = sUserAgent.indexOf("iphone os") > -1;
  var bIsMidp = sUserAgent.indexOf("midp") > -1;
  var bIsUc7 = sUserAgent.indexOf("rv:1.2.3.4") > -1;
  var bIsUc = sUserAgent.indexOf("ucweb") > -1;
  var bIsAndroid = sUserAgent.indexOf("android") > -1;
  var bIsCE = sUserAgent.indexOf("windows ce") > -1;
  var bIsWM = sUserAgent.indexOf("windows phone") > -1;

  return {
    bIsIpad : bIsIpad,
    bIsIphone : bIsIphoneOs,
    bIsMidp : bIsMidp,
    bIsUc : bIsUc,
    bIsAndroid : bIsAndroid,
    bIsCE : bIsCE,
    bIsWM : bIsWM,
    bIsUc7 : bIsUc7
  };
})();

//移动设备判定
ClientRedirect.isMobile = function () {

  "use strict";
  var result = ClientRedirect.bIsIpad || ClientRedirect.bIsIphone || ClientRedirect.bIsWM || ClientRedirect.bIsAndroid;
  return !!result;
};

//向统计系统发送html5的video播放器调用统计数据
var sendHTML5VideoInfo = function (params) {

  if (typeof params !== 'undefined') {
    // 合并对象。
    var _merge = function (s, t) {
      var result = {};

      if (!t) {
        return result;
      }

      for (var i in s) {
        result[i] = typeof t[i] !== "undefined" ? t[i] : s[i];
      }

      return result;
    };
  
    var url = 'http://stadig.ifeng.com/media.js';
    var data = _merge({
          id: '',
          sid: '',
          uid: '',
          from: 'HTML5',
          provider: 'd5f1032b-fe8b-4fbf-ab6b-601caa9480eb',
          loc: '',
          cat: '',
          se: '',
          ptype: '',
          vid: 'HTML5Player',
          ref: '',//域名
          tm: ''//时间戳
        }, params);

    //针对影视做的特殊统计参数处理
    if (typeof paramInfo !== 'undefined' && typeof paramInfo.type !== 'undefined' && typeof videoinfo !== 'undefined' && typeof videoinfo.cpId !== 'undefined') {
      data.provider = videoinfo.cpId;
    }

    pArr = [];
    for (var i in data) {
      pArr.push(i + '=' + encodeURIComponent(data[i]));
    }
    var scriptDom = document.createElement('script');
    url = (pArr.length > 0) ? url + '?' + pArr.join('&') : url;
    scriptDom.src = url;
    document.getElementsByTagName("head").item(0).appendChild(scriptDom);    
  }
};
  return F;
 }

 )


 /**
 * @description : 该文件用于实现播放器代码。(embed object video)
 * 
 * @version     : 1.0.6
 * 
 * @createTime  : 2013-06-21
 * 
 * @updateTime  : 2013-12-21
 * 
 * @updateLog   : 
 *   
 *         1.0.1 - 实现播放器代码
 *         1.0.2 - 将param.ref属性中的#替换为$
 *         1.0.3 - 加入了在userid为空的时候，自动生成并设置userid的功能。
 *         1.0.4 - 加入了对playing和pause事件的处理
 *         1.0.5 - 加入了在影视视频时候的provider字段处理
 *         1.0.6 - 加入了统计loc字段处理，在video时为pad或phone
 *
 **/
 //