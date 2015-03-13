//config abhout the timeline 
//author liwenlong
//date  2015.3
//no support with  <ie8

function Config() {
    this.dataType = {
        "pic": 1,
        "mix": 2,
        "video": 3,
        "html": 4
    };
    this.option = {
        "container": $('#config_warp')
    };
    this.currentType = 1;
    this.currenDate = {};
    this.defaultNew = null;
    this.newsBlockString = '<div class="boxContent"><table><tbody><tr><td>新闻类型</td><td><h3>图片</h3></td></tr><tr><td>标题</td><td><input type="text"name="title"></td></tr><tr><td>时间</td><td><input type="datetime-local"name="start"></td></tr><tr><td>图片URL</td><td><input type="text"name="img"></td></tr></tbody></table></div>';
    this.mixBlockString = '<div class="boxContent"><table><tbody><tr><td>新闻类型</td><td><h3>图文混排</h3></td></tr><tr><td>标题</td><td><input type="text"name="title"></td></tr><tr><td>时间</td><td><input type="datetime-local"name="start"></td></tr><tr><td>图片URL</td><td><input type="text"name="img"></td></tr><tr><td>简介</td><td><textarea rows="4"cols="80"name="des"></textarea></td></tr></tbody></table></div>';
    this.videoBlockString = '<div class="boxContent"><table><tbody><tr><td>新闻类型</td><td><h3>视频</h3></td></tr><tr><td>标题</td><td><input type="text"name="title"></td></tr><tr><td>时间</td><td><input type="datetime-local"name="start"></td></tr><tr><td>视频UID</td><td><input type="text"name="videoId"></td></tr></tbody></table></div>';
    this.htmlBlockString = '<div class="boxContent"><table><tbody><tr><td>新闻类型</td><td><h3>html代码</h3></td></tr><tr><td>标题</td><td><input type="text"name="title"></td></tr><tr><td>时间</td><td><input type="datetime-local"name="start"></td></tr><tr><td>html代码</td><td><textarea rows="6"cols="80"name="htmlContent"></textarea></td></tr></tbody></table></div>';
}
function timeConver(date) {
    //formate as 
    //yyyy-mm-ddThh:MM:ss.SSS
    if(!date) date=new Date();
    date=new Date(date.getTime()-8*3600*1000);
    var y, m, d, h, M, s, S;
    y = date.getFullYear();
    m = fixNumber(date.getMonth()+1, 2);
    d = fixNumber(date.getDate(), 2);
    h = fixNumber(date.getHours(), 2);
    M = fixNumber(date.getMinutes(), 2);
    s = fixNumber(date.getSeconds(), 2);
    S = fixNumber(date.getMilliseconds(), 3);
    var timeStr="" + y + "-" + m + "-" + d + "T" + h + ":" + M + ":" + s + "." + S;
    return timeStr;

}

function fixNumber(num, maxlenth) {
    //对数字进行补位操作 比如1--> 01
    if (num.toString().length >= maxlenth)  return  num;
    var  str = "";
    for (var  i = num.toString().length; i < maxlenth; i++)  str  += "0";
    return  str  +  num.toString();
}
Config.prototype.init = function() {
    this.event();
};


Config.prototype.creatHtml = function(data) {
    if(!data) return;
    this.creatglobalhtml(data); //创建全局参数
    this.creatBoxGroup(data.data); //创建信息组 
};
Config.prototype.getGloableData = function() {
    var data = {},
        global_container = $(".config_global");
    var box_container = $(".config_box");
    data = this.getEachDate(global_container);
    data.data = this.getBoxDate(box_container);
    this.currenDate = data;
};
Config.prototype.getBoxDate = function(container) {
    var _this = this;
    var dataArr = [];
    container.each(function(index) {
        var type = $(this).find(".card_on").attr("data-type");
        var data = _this.getEachDate($(this));
        data.dataType = parseInt(type);
        data.start = new Date(data.start);
        dataArr.push(data);
    });
    return dataArr;
};

Config.prototype.getEachDate = function(container) {
    var data = {};

    var nameArr = container.find("[name]");
    if(nameArr.length<=0){
        data=null;
        return data;
    }
    nameArr.each(function() {
        var name = $(this).attr("name");
        var val = $(this).val();
        data[name] = val;
    });
    return data;
};


Config.prototype.creatglobalhtml = function(data) {
    var wraper = $(".config_global");
    wraper.find("[name]").each(function() {
        var temp = data[$(this).attr("name")];
        $(this).val(temp);
    });
};
Config.prototype.creatBoxGroup = function(dataArr) {
    //废弃

    if (typeof dataArr == "undefined") {
        return;
    }
    var _this = this;
    var tempDom = $("<div></div>");
    for (var i = 0; i < dataArr.length; i++) {
        (function(i) {
            tempDom.append(_this.creatBox(dataArr[i]));
        })(i);
    }
    this.option.container.find(".config_box ").remove();
    this.option.container.append(tempDom.html());

};


Config.prototype.creatBox = function(data) {
    var boxWrap = $('<div class="config_box content_unit"></div>');
    //增加 选择div
    boxWrap.append('<div class="remove_block" title="关闭"></div>');
    var choseBox = $('<div class="chagneType clearfix"><div>选择类型</div><p class="card"data-type="1">图片</p><p class="card "data-type="2">图文混排</p><p class="card"data-type="3">视频</p><p class="card"data-type="4">html代码</p></div>');
    
    //增加 删除模块
    //创建新闻内容区
    boxWrap.append(choseBox);
    var boxContent;
    if (typeof data == "undefined"||!data) {
        choseBox.find("p").eq(this.currentType - 1).addClass('card_on');
        boxContent = this.creatBoxContent(this.currentType)
    } else {
        choseBox.find("p").eq(data.dataType - 1).addClass('card_on');
        boxContent = this.creatBoxContent(data.dataType, data)
    }
    boxWrap.append(boxContent)

    //增加
    boxWrap.append('<div class="config_box_add add_block">新增一个</div>');

    return boxWrap;
};
Config.prototype.creatBoxContent = function(type, data) {
    //创建空白的块
    type = parseInt(type || 1);
    data = data || null;
    var str = '';
    switch (type) {
        case 1:
            str = this.creatNewsBlock(data);
            break;
        case 2:
            str = this.creatMixBlock(data);
            break;
        case 3:
            str = this.creatVideoBlock(data);
            break;
        case 4:
            str = this.creatHtmlBlock(data);
            break;
        default:
            str = this.creatNewsBlock(data);
    }
    return str;
};
Config.prototype.addBox=function(container){
    //增加一条新闻
    //得到增加新闻点击时候，获得的默认内容和类型
       var type = container.find(".card_on").attr("data-type");
       var data = this.getEachDate(container);
       console.log()
       if(type){
           data.dataType=type;
           container.after(this.creatBox(data)); 
       }else{
            container.after(this.creatBox()); 
       }
       console.log()
       
       
    //生成内容
};

Config.prototype.creatNewsBlock = function(data) {
    data = data || this.defaultNew;
    var strArr = [],
        str = '';

    if (!data) {
        str = this.newsBlockString;
    } else {
        //有数据的处理方式
        strArr.push('<div class="boxContent">');
        strArr.push('<table>');
        strArr.push('<tbody>');
        strArr.push('<tr>');
        strArr.push('   <td>');
        strArr.push('     新闻类型');
        strArr.push('    </td>');
        strArr.push('    <td>  <h3>');
        strArr.push('     图片');
        strArr.push('    </h3></td>');
        strArr.push('</tr>');
        strArr.push('<tr>');
        strArr.push('   <td>');
        strArr.push('     标题');
        strArr.push('    </td>');
        strArr.push('    <td>  ');
        strArr.push('     <input type="text" name="title" value="' + data.title + '">');
        strArr.push('    </td>');
        strArr.push('</tr>');

        strArr.push('<tr>');
        strArr.push('   <td>');
        strArr.push('     时间');
        strArr.push('    </td>');
        strArr.push('    <td>  ');
        strArr.push('     <input type="datetime-local" name="start" value="' + timeConver(new Date(data.start)) + '">');
        strArr.push('    </td>');
        strArr.push('</tr>');
        
        strArr.push('<tr>');
        strArr.push('   <td>');
        strArr.push('     图片URL');
        strArr.push('    </td>');
        strArr.push('    <td>  ');
        strArr.push('     <input type="text" name="img" value="' + data.img + '">');
        strArr.push('    </td>');
        strArr.push('</tr>');

        strArr.push('   </tbody>');
        strArr.push('  </table>');
        strArr.push(' </div>');
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
        strArr.push('<div class="boxContent">');
        strArr.push('<table>');
        strArr.push('<tbody>');
        strArr.push('<tr>');
        strArr.push('   <td>');
        strArr.push('     新闻类型');
        strArr.push('    </td>');
        strArr.push('    <td>  <h3>');
        strArr.push('     图文混排');
        strArr.push('    </h3></td>');
        strArr.push('</tr>');
        strArr.push('<tr>');
        strArr.push('   <td>');
        strArr.push('     标题');
        strArr.push('    </td>');
        strArr.push('    <td>  ');
        strArr.push('     <input type="text" name="title" value="' + data.title + '">');
        strArr.push('    </td>');
        strArr.push('</tr>');

        strArr.push('<tr>');
        strArr.push('   <td>');
        strArr.push('     时间');
        strArr.push('    </td>');
        strArr.push('    <td>  ');
        strArr.push('     <input type="datetime-local" name="start" value="' + timeConver(new Date(data.start)) + '">');
        strArr.push('    </td>');
        strArr.push('</tr>');

        strArr.push('<tr>');
        strArr.push('   <td>');
        strArr.push('     图片URL');
        strArr.push('    </td>');
        strArr.push('    <td>  ');
        strArr.push('     <input type="text" name="img" value="' + data.img + '">');
        strArr.push('    </td>');
        strArr.push('</tr>');

        strArr.push('<tr>');
        strArr.push('   <td>');
        strArr.push('     简介');
        strArr.push('    </td>');
        strArr.push('    <td>  ');
        var textareaWrp=$("<div></div>");
        var textareaDom=$('<textarea rows="6" cols="80" name="des"></textarea> ');
        textareaDom.html(data.des);
        textareaWrp.append(textareaDom);

        strArr.push(textareaWrp.html());
        strArr.push('    </td>');
        strArr.push('</tr>');

        strArr.push('   </tbody>');
        strArr.push('  </table>');
        strArr.push(' </div>');

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
        strArr.push('<div class="boxContent">');
        strArr.push('<table>');
        strArr.push('<tbody>');
        strArr.push('<tr>');
        strArr.push('   <td>');
        strArr.push('     新闻类型');
        strArr.push('    </td>');
        strArr.push('    <td>  <h3>');
        strArr.push('     视频');
        strArr.push('    </h3></td>');
        strArr.push('</tr>');
        strArr.push('<tr>');
        strArr.push('   <td>');
        strArr.push('     标题');
        strArr.push('    </td>');
        strArr.push('    <td>  ');
        strArr.push('     <input type="text" name="title" value="' + data.title + '">');
        strArr.push('    </td>');
        strArr.push('</tr>');

        strArr.push('<tr>');
        strArr.push('   <td>');
        strArr.push('     时间');
        strArr.push('    </td>');
        strArr.push('    <td>  ');
        strArr.push('     <input type="datetime-local" name="start" value="' + timeConver(new Date(data.start)) + '">');
        strArr.push('    </td>');
        strArr.push('</tr>');
        
        strArr.push('<tr>');
        strArr.push('   <td>');
        strArr.push('     视频UID');
        strArr.push('    </td>');
        strArr.push('    <td>  ');
        strArr.push('     <input type="text" name="videoId" value="' + data.videoId + '">');
        strArr.push('    </td>');
        strArr.push('</tr>');

        strArr.push('   </tbody>');
        strArr.push('  </table>');
        strArr.push(' </div>');
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
        strArr.push('<div class="boxContent">');
        strArr.push('<table>');
        strArr.push('<tbody>');
        strArr.push('<tr>');
        strArr.push('   <td>');
        strArr.push('     新闻类型');
        strArr.push('    </td>');
        strArr.push('    <td>  <h3>');
        strArr.push('     html代码');
        strArr.push('    </h3></td>');
        strArr.push('</tr>');
        strArr.push('<tr>');
        strArr.push('   <td>');
        strArr.push('     标题');
        strArr.push('    </td>');
        strArr.push('    <td>  ');
        strArr.push('     <input type="text" name="title" value="' + data.title + '">');
        strArr.push('    </td>');
        strArr.push('</tr>');

        strArr.push('<tr>');
        strArr.push('   <td>');
        strArr.push('     时间');
        strArr.push('    </td>');
        strArr.push('    <td>  ');
        strArr.push('     <input type="datetime-local" name="start" value="' + timeConver(new Date(data.start)) + '">');
        strArr.push('    </td>');
        strArr.push('</tr>');

        strArr.push('<tr>');
        strArr.push('   <td>');
        strArr.push('     简介');
        strArr.push('    </td>');
        strArr.push('    <td>  ');
        var textareaWrp=$("<div></div>");
        var textareaDom=$('<textarea rows="6" cols="80" name="htmlContent"></textarea> ');
        textareaDom.html(data.htmlContent);
        textareaWrp.append(textareaDom);
        strArr.push(textareaWrp.html());
        strArr.push('    </td>');
        strArr.push('</tr>');

        strArr.push('   </tbody>');
        strArr.push('  </table>');
        strArr.push(' </div>');

        str = strArr.join(" ");
    }
    return str;
};
Config.prototype.setData = function(data) {
    if (typeof data == "undefined") return;
    //将数据拆分
    this.creatHtml(data);


};

Config.prototype.event = function() {
    var _this = this;
    $('#config_warp').on("click", ".card", function() {
        var that = $(this);
        var currenWrap = that.parent().parent().find(".boxContent");
        if ($(this).hasClass("card_on")) {
            return;
        }
        var type = $(this).attr("data-type");
        that.parent().find(".card_on").removeClass("card_on");

        currenWrap.html(_this.creatBoxContent(type));
        that.addClass("card_on");
        _this.currentType = type;

    });

    //删除

    $('#config_warp').on("click", ".remove_block", function() {
        $(this).parent().remove();
    });

    //增加

    $('#config_warp').on("click", ".add_block", function() {
       // $(this).parent().after(_this.creatBox());
        _this.addBox($(this).parent());
    });

    //配置数据

    $("#getDate").on("click", function() {
        $(".config_getDate").dialog({
            "closeBtn":".getDate_close"
        });
        _this.getGloableData();
        setTimeout(function() {
            $(".config_getDate_are").html(JSON.stringify(_this.currenDate));
        }, 0);
    });

    $("#setDate").on("click", function() {

        var that=$(this);
        var data = {
            "width": "1000",
            "height": "800",
            "slider_margin_bottom": "50",
            "skin": "skin_red",
            "show_item_num": "4",
            "data": [{
                "title": "test1 图片类型",
                "start": "2010-07-23T23:00:00.000Z",
                "img": "img/1.jpg",
                "dataType": "1"
            },
            {
                "title": "test2 图文混排",
                "start": "2010-07-24T16:00:00.000Z",
                "img": "img/2.jpg",
                "des": "据台湾媒体报道，一名美国囚犯杰瑞米秘克斯因为长得太帅而爆红，还有人将他的帅脸后制在各大知名品牌海报的男模特儿身上，而现在真的有一家模特儿经纪公司想要签下他，可以让他一个月赚进美金1.5到3万元（约9万到18万人民币）。据台湾媒体报道，一名美国囚犯杰瑞米秘克斯（Jeremy Meeks）因为长得太帅而爆红，还有人将他的帅脸后制在各大知名品牌海报的男模特儿身上，而现在真的有一家模特儿经纪公司想要签下他，可以让他一个月赚进美金1.5到3万元（约9万到18万人民币）。名美国囚犯杰瑞米秘克斯因为长得太帅而爆红，还有人将他的帅脸后制在各大知名品牌海报的男模特儿身上，而现在真的有一家模特儿经纪公司想要签下他，可以让他一个月赚进美金1.5到3万元（约9万到18万人民币）。",
                "dataType": "2"
            },
            {
                "title": "test3 视频",
                "start": "2010-07-26T00:00:00.000Z",
                "videoId": "01828f54-53fd-423f-91f3-eafc9280870e",
                "dataType": "3"
            },
            {
                "title": "test4 固定html",
                "start": "2010-07-28T00:00:00.000Z",
                "htmlContent": "<p>在世界大国当中，中国的国防现代化的路应该说走得还是相当艰难的，大部分的军事装备、研发都要靠自己来做，甚至是从头做起。另外，我们广大官兵的保障还需要不断地加强。但是从根本上来讲，中国的国防政策还是防御性的，这是在宪法当中明确规定的。在这个方向上，在这个原则上，我们不会轻易地改变。我们改革开放这么多年取得了这么大的成就，我们不是靠炮舰开路去开拓经贸的，而是完全去靠互利互惠的合作，甚至是让利的合作。这条道路、和平发展的道路，我们走得是成功的，我们今后会继续坚持走和平发展的道路。谢谢。<span class=\"ifengLogo\"><a href=\"http://www.ifeng.com/\" target=\"_blank\"><img src=\"http://img.ifeng.com/page/Logo.gif\" width=\"15\" height=\"17\"></a></span></p>",
                "dataType": "4"
            },
            {
                "title": "test5足球杯视频",
                "start": "2010-07-29T00:00:00.000Z",
                "videoId": "01ae5dec-3946-4d66-b458-1cb4ca3ac80d",
                "dataType": "3"
            },
            {
                "title": "test6视频",
                "start": "2010-07-30T00:00:00.000Z",
                "videoId": "01678257-0769-4840-b63e-c02c0662acb5",
                "dataType": "3"
            }]
        };
        $(".config_setDate").dialog({
            "closeBtn":".setDate_close"
        });
        var data=JSON.stringify(data);
        $(".config_setDate_are").html(data);
        $(".setDatBtn").on("click",function(){
            var result=$(".config_setDate_are").val();
             result=JSON.parse(result);
             _this.setData(result);
             $(".config_setDate").hide();
        })   

    });

    $("#preview").on("click",function(){
         $(".config_iframe").dialog({
            "closeBtn":".iframe_close"
        });
         _this.getGloableData();
        window.frames[0].postMessage(_this.currenDate,"*");

    })


};

var config = new Config();
config.init();

//TODO
//表单验证
// 预览的时候，对数据进行校验，是否为空
 