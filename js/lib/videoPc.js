
define(["video"],function(F){
 var SpecailVideo = (function () {

  var win = window;
  var doc = document;
  var uuid = 0;
  var emptyFn = function () {};

  var containParams = function (orginObj, newObj) {
    var o = {};

    for (var key in orginObj) {
      o[key] = key in newObj ? newObj[key] : orginObj[key];
    }

    return o;
  };

  var getFrom = function () {
    var from = '',
        url = window.location.href;
    var startIndex = url.indexOf('http://') + 'http://'.length,
        endIndex = url.indexOf('.ifeng.com');

    if (startIndex !== -1 && endIndex !== -1) {
      from = url.substr(startIndex, (endIndex - startIndex));
      return from;
    }

    return from;
  };

  var getCookie = function (name) {
    var arg = name + "=";
    var alen = arg.length;
    var clen = document.cookie.length;
    var i = 0;

    while (i < clen) {
      var j = i + alen;

      if (document.cookie.substring(i, j) === arg) {
        return (function (offset) {
          var endstr = document.cookie.indexOf(";", offset);

          if (endstr === -1) {
            endstr = document.cookie.length;
          }

          return decodeURIComponent(document.cookie.substring(offset, endstr));
        })(j);
      }

      i = document.cookie.indexOf(" ", i) + 1;

      if (i === 0) {
        break;
      }
    }

    return "";
  };

  var defaultConf = {
    swfUrl: 'http://img.ifeng.com/swf/p2p/zuhe/online/zuheVPplayer_v1.0.7.swf',
    containerId: '',
    width: 600,
    height: 455
  };

  var defaultParamConf = {
    'allowFullScreen': 'true',
    'wmode': 'transparent',
    'allowScriptAccess': 'always'
  };

  var defaultVarConf = {
    'guid': '',
    'AutoPlay': true,
    'forPlayNum': 1,
    'preAdurl': '',
    'adType': 2,
    'canShare': false,
    'ADOrderFirst': 1,
    'subject': getFrom(),
    'from': getFrom(),
    'writeby': 'webjs',
    'ADPlay': true,
    'postUrl': '',
    'ADOrder': 1,
    'ivbAdUrl': '',
    'postAdUrl': '',
    'pauseUrl': '',
    'clickPlay': true,
    'special': true,
    'PlayerName': 'VZHPlayer',
    'multiPreAd': 1,
    'subjectid': '',
    'guidList': '',
    'uid': getCookie('userid'),
    'sid': getCookie('sid'),
    'locid': getCookie('location'),
    'pageurl': window.location.href
  };

  var callbackConf = {
    'getNextGuid': emptyFn
  };

  var Video = function () {
  };

  Video.prototype = {

    create: function (opts) {
      this.initModel(opts);
      this.createPlayer();
    },

    initModel: function (opts) {
      this.model = {};
      this.model.swfId = 'js_playVideo' + uuid++;
      this.model.conf = containParams(defaultConf, opts);
      this.model.paramConf = containParams(defaultParamConf, opts);
      this.model.varConf = containParams(defaultVarConf, opts);
      this.model.callbackConf = containParams(callbackConf, opts);
      this.container = document.getElementById(this.model.conf.containerId);
    },

    createPlayer: function () {
      var key;
      var conf = this.model.conf;
      var param = this.model.paramConf;
      var varConf = this.model.varConf;
      var callbackConf = this.model.callbackConf;

      var player = new F.video.Player(conf.containerId, {
        url: conf.swfUrl,
        height: conf.height,
        width: conf.width,
        id: this.model.swfId
      });

      this.player = player;

      for (key in param) {
        player.addParam(key, param[key]);
      }

      for (key in varConf) {
        player.addVariable(key, varConf[key]);
      }

      player.addCallback('swfplay', videoEnd);
      player.addCallback('shareTo', shareTo);
      player.addCallback('goPage', goPage);

      for (key in callbackConf) {
        player.addCallback(key, callbackConf[key]);
      }

      // 这里才开始创建播放器。
      player.play();

      this.flash = doc.getElementById(this.model.swfId);

    },

    play: function (guid) {
      if (typeof guid === 'undefined') {
        this.flash.videoPlay();
      } else {
        this.flash.playGuid(guid, {adOrderFirst: 0});
      }
    },

    pause: function () {
      this.flash.videoPause();
    },

    show: function () {
      $(this.flash).show();
    },

    hide: function () {
      $(this.flash).hide();
    },

    destroy: function () {
      $(this.flash).remove();
    }

  };

  var videoEnd = function () {
    return "the last!";
  };

  var goPage = function (url) {
    window.open(url);
  };

  //分享到各个网站
  var shareTo = function (site, pic, url, title, smallimg) {
    var videoinfo = videoinfo || {url: document.location.href, title: document.title};
    var e = encodeURIComponent;
    var vlink = url || videoinfo.url;//'http://v.ifeng.com/news/world/201101/57b5bddb-36b4-4178-90d3-0f96bad889af.shtml';
    var _url = e(vlink);
    var vtitle = title || videoinfo.title;
    var _title = e(vtitle);
    /*if (eval("_oFlv_c.Content != null")) {
        _content = encodeURIComponent(_oFlv_c.Content);
    }*/
    switch (site) {
      
    case "ifengkuaibo" :
      break;

    case "ifengteew" :
      var t = _title, z = _url, id = "凤凰视频", type = 1, s = screen;
      var f = "http://t.ifeng.com/interface.php?_c=share&_a=share&", pa = ["sourceUrl=", _url, "&title=", _title, "&pic=", e(smallimg || ""), "&source=", e(id || ""), "&type=", e(type || 0)].join("");
      
      var a = function () {
        if (!window.open([f, pa].join(""), "", ["toolbar=0,status=0,resizable=1,width=640,height=481,left=", (s.width - 640) / 2, ",top=", (s.height - 480) / 2].join(""))) {
          location.href = [f, pa].join("");
        }
      }

      if (/Firefox/.test(navigator.userAgent)) {
        setTimeout(a, 0);
      
      } else {
        a();
      }
      break;

    case "kaixin" :
      window.open("http://www.kaixin001.com/repaste/share.php?rurl=" + _url + "&rtitle=" + _title);
      break;

    case "renren":
      window.open("http://share.renren.com/share/buttonshare.do?link=" + _url + "&title=" + _title);
      break;

    case "sinateew" :
      var l = (screen.width - 440) / 2;
      var t = (screen.height - 430) / 2;
      var smallimg = smallimg || "";

      $.ajax({
        url: 'http://api.t.sina.com.cn/friendships/create/1806128454.xml?source=168486312',
        dataType: 'script',
        success: function () {}  //没有回调
      });
      window.open("http://v.t.sina.com.cn/share/share.php?appkey=168486312&url=" + _url + "&title=" + _title + "&source=ifeng&searchPic=false&sourceUrl=http://v.ifeng.com/&content=utf8&pic=" + smallimg + "&ralateUid=1806128454", "_blank", "toolbar=0,status=0,resizable=1,width=440,height=430,left=" + l + ",top=" + t);
      break;

    case "qqzone" :
      window.open("http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=" + _url);
      break;
    
    case "qqteew" :
      var _appkey = encodeURI("f8ca1cd768da4529ab190fae9f1bf21d"), _pic = encodeURI(smallimg || ""), _site = "http://v.ifeng.com";
      var _u = "http://v.t.qq.com/share/share.php?title=" + _title + "&url=" + _url + "&appkey=" + _appkey + "&site=" + _site + "&pic=" + _pic;
      window.open(_u, "\u8F6C\u64AD\u5230\u817E\u8BAF\u5FAE\u535A", "width=700, height=680, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, location=yes, resizable=no, status=no");
      break;

    case "163" :
      var url = "link=http://www.ifeng.com&source=" + encodeURIComponent("凤凰网") + "&info=" + _title + " " + _url;
      window.open("http://t.163.com/article/user/checkLogin.do?" + url + "&" + new Date().getTime(), "newwindow", "height=330,width=550,top=" + (screen.height - 280) / 2 + ",left=" + (screen.width - 550) / 2 + ", toolbar=no, menubar=no, scrollbars=no,resizable=yes,location=no, status=no");
      break;

    case "feixin" :
      var u = "http://space.fetion.com.cn/api/share?Source=" + encodeURIComponent("凤凰视频") + "&Title=" + _title + "&url=" + _url + "&IsEditTitle=false";
      window.open(u, "newwindow", "top=" + (screen.height - 280) / 2 + ",left=" + (screen.width - 550) / 2 + ", toolbar=no, menubar=no, scrollbars=no,resizable=yes,location=no, status=no");
      break;

    case "sohuteew" :
      var s = screen, z = vlink, t = vtitle;
      var f = "http://t.sohu.com/third/post.jsp?", p = ["&url=", e(z), "&title=", e(t), "&content=utf-8", "&pic=", e(smallimg || "")].join("");
      var b = function () {
        if (!window.open([f, p].join(""), "mb", ["toolbar=0,status=0,resizable=1,width=660,height=470,left=", (s.width - 660) / 2, ",top=", (s.height - 470) / 2].join(""))) {
          location.href = [f, p].join("");
        }
      }

      if (/Firefox/.test(navigator.userAgent)) {
        setTimeout(b, 0);
      } else {
        b();
      }
      break;

    case "51com" :
      var u = "http://share.51.com/share/out_share_video.php?from=" + encodeURIComponent("凤凰视频") + "&title=" + _title + "&vaddr=" + _url + "&IsEditTitle=false&charset=utf-8";
      window.open(u, "newwindow", "top=" + (screen.height - 280) / 2 + ",left=" + (screen.width - 550) / 2 + ", toolbar=no, menubar=no, scrollbars=no,resizable=yes,location=no, status=no");
      break;

    case "baiduI":
      var u = 'http://tieba.baidu.com/i/app/open_share_api?link=' + _url,
          o = function () {
            if (!window.open(u)) {
              location.href = u;
            }
          };

      if (/Firefox/.test(navigator.userAgent)) {
        setTimeout(o, 0);

      } else {
        o();
      }
      
      return false;

    default:
      return false;
    }
  };

  return Video;
}());
  return SpecailVideo;
})

