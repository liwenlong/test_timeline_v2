var timeline = {
    //配置项
    "width": 1000, //总体宽度
    "height": 800, //总体高度
    //按钮
    "reset": $("#reset"), //三个方法
    "big": $("#big"),
    "small": $("#small"),
    //各种宽高配置
    "slider_margin_bottom": 50,
    "skin": "skinClass",
    "show_item_num": 4, //时间轴上初始展示多少条新闻 
    "data": {}
}

function Config() {
    this.dataType = {
        "pic": 1,
        "mix": 2,
        "video": 3,
        "html": 4
    }
    this.option = {
        "container": $('#config_warp'),

    }
    this.currentType = 1;
    this.currenDate = {};
    this.defaultNew = null;
    this.newsBlockString = '<div class="boxContent"><table><tbody><tr><td>新闻类型</td><td><h3>图片</h3></td></tr><tr><td>标题</td><td><input type="text"name="title"></td></tr><tr><td>时间</td><td><input type="datetime-local"name="start"></td></tr><tr><td>图片</td><td><input type="datetime-local"name="img"></td></tr></tbody></table></div>';
    this.mixBlockString = '<div class="boxContent"><table><tbody><tr><td>新闻类型</td><td><h3>图文混排</h3></td></tr><tr><td>标题</td><td><input type="text"name="title"></td></tr><tr><td>时间</td><td><input type="datetime-local"name="start"></td></tr><tr><td>图片URL</td><td><input type="text"name="img"></td></tr><tr><td>简介</td><td><textarea rows="4"cols="80"name="des"></textarea></td></tr></tbody></table></div>';
   
    this.videoBlockString = '<div class="boxContent"><table><tbody><tr><td>新闻类型</td><td><h3>视频</h3></td></tr><tr><td>标题</td><td><input type="text"name="title"></td></tr><tr><td>时间</td><td><input type="datetime-local"name="start"></td></tr><tr><td>视频UID</td><td><input type="text"name="videoId"></td></tr></tbody></table></div>';

    this.htmlBlockString = '<div class="boxContent"><table><tbody><tr><td>新闻类型</td><td><h3>图片</h3></td></tr><tr><td>标题</td><td><input type="text"name="title"></td></tr><tr><td>时间</td><td><input type="datetime-local"name="start"></td></tr><tr><td>html代码</td><td><textarea rows="6"cols="80"name="htmlContent"></textarea></td></tr></tbody></table></div>';

}

Config.prototype.init = function() {
    this.event();
}

Config.prototype.creathtml = function(data) {
    //data  如果没有的话，就默认生成空白表单  有的话，就按照数据生成相应的内容
    this.creatglobalhtml(); //创建全局参数
    this.creatNewsGroup(); //创建信息组 
};
Config.prototype.getGloable = function() {
    var data = {},
        global_container = $(".config_global");
        box_container = $(".config_box")
    data = this.getEachDate(global_container);
    data.data = this.getBoxDate(box_container);
    this.currenDate = data;
}
Config.prototype.getBoxDate = function(container) {
    var _this = this;
    var dataArr = [];
    container.each(function(index) {
        var type = $(this).find(".card_on").attr("data-type");
        var data = _this.getEachDate($(this));
        data.type = type;
        dataArr.push(data);

    })
    return dataArr;
}
Config.prototype.getEachDate = function(container) {
    var data = {};

    var nameArr = container.find("[name]");
    nameArr.each(function() {
        var name = $(this).attr("name");
        var val = $(this).val();
        data[name] = val;
    })

    return data;
}



Config.prototype.creatNewsGroup = function(data) {
    //废弃
    if (typeof data == "undefined") {
        var blockWrap = $('<div class="config_news_group content_unit"></div>');
        blockWrap.append('<div class="remove_block">删除</div><div class="chagneType clearfix"><div>选择类型</div><p class="card"data-type="1">图片</p><p class="card "data-type="2">图文混排</p><p class="card"data-type="3">视频</p><p class="card card_on"data-type="4">html代码</p></div>');
        this.creatBoxContent(blockWrap, this.currentType);
        return blockWrap;
    } else {

    }

};


Config.prototype.creatBox = function(data) {
    var boxWrap = $('<div class="config_box content_unit"></div>');
    //增加 选择div
    boxWrap.append('<div class="remove_block">删除</div>')
    var choseBox = $('<div class="chagneType clearfix"><div>选择类型</div><p class="card"data-type="1">图片</p><p class="card "data-type="2">图文混排</p><p class="card"data-type="3">视频</p><p class="card"data-type="4">html代码</p></div>');
    choseBox.find("p").eq(this.currentType - 1).addClass('card_on');
    //增加 删除模块
    //创建新闻内容区
    boxWrap.append(choseBox);
    boxWrap.append(this.creatBoxContent(this.currentType, data));
    //增加
    boxWrap.append('<div class="config_box_add add_block">新增一个</div>');

    return boxWrap;
}
Config.prototype.creatBoxContent = function(type, data) {
    //创建空白的块
    type = parseInt(type || 1);
    data = data || null;
    var str = '';
    switch (type) {
        case 1:
            str = this.creatNewsBlock(data)
            break;
        case 2:
            str = this.creatMixBlock(data);
            break;
        case 3:
            str = this.creatVideoBlock(data)
            break;
        case 4:
            str = this.creatHtmlBlock(data)
            break;
        default:
            str = this.creatNewsBlock(data)
    }
    return str;
};

Config.prototype.creatNewsBlock = function(data) {
    data = data || this.defaultNew;
    var strArr = [],
        str = '';

    if (!data) {
        str = this.newsBlockString;
    } else {
        //有数据的处理方式
        str = strArr.join(" ");
    }

    return str;

};
Config.prototype.creatMixBlock = function(data) {

    data = data || this.defaultNew;

    var strArr = [],
        str = '';

    if (!data) {

        str = this.mixBlockString;
    } else {
        //有数据的处理方式
        str = strArr.join(" ");
    }

    return str;
};
Config.prototype.creatVideoBlock = function(data) {
    data = data || this.defaultNew;
    var strArr = [],
        str = '';

    if (!data) {
        str = this.videoBlockString;
    } else {
        //有数据的处理方式
        str = strArr.join(" ");
    }
    return str;

};
Config.prototype.creatHtmlBlock = function(data) {
    data = data || this.defaultNew;
    var strArr = [],
        str = '';

    if (!data) {
        str = this.htmlBlockString;
    } else {
        //有数据的处理方式
        str = strArr.join(" ");
    }
    return str;
}

Config.prototype.event = function() {
    var _this = this;
   $('#config_warp').on("click",".card",function(){
            var that = $(this);
            var currenWrap = that.parent().parent().find(".boxContent");
            if ($(this).hasClass("card_on")) {
                return;
            }
            var type = $(this).attr("data-type");
            that.parent().find(".card_on").removeClass("card_on");
            console.log(currenWrap);
            currenWrap.html(_this.creatBoxContent(type))
            that.addClass("card_on");
            _this.currentType = type;

   })
   
   //删除

    $('#config_warp').on("click",".remove_block",function(){
            $(this).parent().remove();
    })
  

    //增加
   
    $('#config_warp').on("click",".add_block",function(){
            $(this).parent().after(_this.creatBox());
    })

    $("#getAllDate").on("click", function() {
        _this.getGloable();
        setTimeout(function() {
            $("#show_code").html(JSON.stringify(_this.currenDate) );
        }, 0)
    })

}



Config.prototype.readDate = function() {


}

Config.prototype.saveDate = function(data) {


}

var config = new Config();
config.init();