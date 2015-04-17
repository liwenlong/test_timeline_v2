/*
 Timeline

   包含3个模块
     1. axis   刻度尺模块  
     2.items   信息块模块
     3.slider  内容区模块
   依赖的外部组件：
      1、jquery         
      2、jquery.mousewheel     滚轮兼容组件
      3、events         自定义事件
      4、视频播放器 video、videoPc
   
 */
require.config({
    baseUrl: "js/lib",
    paths: {
        app: "../app"
    }
})
define(["jquery", "jquery.mousewheel.min", "app/axis", "app/items", "app/slider"], function($, mouse, Axis, Items, Slider) {

    "use strict";

    function Timeline(container, options) {
        if (!container || $("#" + container).length <= 0) {
            //节点不存在
            return false;
        }
        this.options = { //default options
            "width": 1500,
            "height": 800,
            "reset": $("#reset"),
            "big": $("#big"),
            "small": $("#small"),
            "basewidth": 40, //刻度尺的基准宽度，用来生成刻度尺的标示所用，数值越大，刻度尺越稀疏
            "start": null, //时间轴开始时间
            "end": null, //时间轴结束时间
            "ratio": null, //当前时间轴的系数，由起始时间和刻度尺宽度决定
            "data": [{
                "start": new Date(2015, 1, 15),
                "title": "this is content"
            }, {
                "start": new Date(2015, 2, 15),
                "title": "this is content"
            }]
        };
        this.resetDate = {};
        this.dom = {
            "container": $("#" + container), //defalut parent dom
            "frame": null,
            "axis": "axis",
            "item": "items",
            "current": "current"
        };
        this.init(options);

    }
    Timeline.prototype.init = function(options) {
        if(options){
            this.dom.container.html(""); //清空html
            this.setOptions(options); //合并参数
            this.setDate(this.options.data); //初始化data
            if (this.dataLength === 0) {
                this.showErrorMessage(0);
                return;
            };
            this.setDomCss(); //设置dom的css
        }
        
        this.applyRange(); //设置事件比例尺   
        //创建子组件  slider items axis
        this.creatChild();
        this.render();
        this.addEvent(); //绑定事件

    };
    //创建子组件
    Timeline.prototype.creatChild = function() {

        var slideDate = {
            "data": this.options.data,
            "width": this.options.width * 0.8,
            "height": this.options.height - 300 - this.options.slider_margin_bottom,
            "slider_margin_bottom": this.options.slider_margin_bottom
        };
        this.slider = this.slider || new Slider(slideDate);

        //将item和axis外面包一层div，以及背景，选中div等的增加处理
        this.creatTimelineBottomDiv();

        var itemDate = {
            "container": this.dom.frame,
            "width": this.options.width * 0.95,
            "height": 200,
            "basewidth": this.options.basewidth,
            "start": this.options.start,
            "end": this.options.end,
            "data": this.options.data
        }

        this.items = this.items || new Items(itemDate);
        var axisData = {
            "container": this.dom.frame,
            "width": this.options.width * 0.95,
            "height": 100,
            "basewidth": this.options.basewidth,
            "start": this.options.start,
            "end": this.options.end
        }
        this.axis = this.axis || new Axis(axisData);
    }
        //render   用来重绘时间轴，包含刻度尺和事件块
    Timeline.prototype.render = function() {
        if (!this.axis || !this.items) return;
        // 触发子组件的render事件
        this.axis.render(this.options.start, this.options.end);
        this.items.render(this.options.start, this.options.end, this.options.data);
    };

    //applyRange  重新设置比例尺   参数为起始时间，不写默认当前的
    Timeline.prototype.applyRange = function(start, end) {
        var options = this.options;
        if (start && end) {
            options.start = start;
            options.end = end;
        }
        options.ratio = (options.end - options.start) / options.width;

    };
    Timeline.prototype.setDomCss = function() {
        this.dom.container.css({
            "width": this.options.width,
            "height": this.options.height
        })
        if (this.options.skin) {
            //换肤
            this.dom.container.attr("class", this.options.skin);
        }

    };


    Timeline.prototype.creatTimelineBottomDiv = function() {
        this.dom.frame = $('<div class="timeLine-bottom"></div>');
        //创建放大缩小工具
        this.dom.toolBar = $('<div class="toolBar"></div>');
        this.dom.big = $('<div id="big"></div>');
        this.dom.small = $('<div id="small"></div>');
        this.dom.reset = $('<div id="reset"></div>');
        this.dom.toolBar.append(this.dom.big).append(this.dom.small).append(this.dom.reset);
        this.dom.frame.append(this.dom.toolBar);
        this.dom.topBorder = $('<div class="topBorder"></div>'); //顶部的一条线
        this.dom.midBorder = $('<div class="midborder"></div>'); //中间的蓝线
        this.dom.frame.append(this.dom.topBorder);
        this.dom.frame.append(this.dom.midBorder);
        this.dom.container.append(this.dom.frame);
    };
        //resetDate  从设定时间
    Timeline.prototype.replaceData = function(data) {
        if (!data) {
            return;
        }
        this.setDate(data);
        this.applyRange();
        this.render();
        this.slider.init({
            "data": this.options.data
        });
    };

    Timeline.prototype.addData = function(data) {
        if (!data) {
            return;
        }
        // Array.prototype.push.apply(this.options.data , data);
        //this.sortDate();
        //this.options.data=data;
        //this.options.data = [];
        for(var i =0 , len = data.length ; i<len;i++){
            this.options.data.push(data[i]);
        }
        this.sortDate();
        this.setDate(this.options.data);
        

        this.applyRange();

        this.render();
        this.slider.init({
            "data": this.options.data
        });

    };
    Timeline.prototype.setOptions = function(op) {
        if (!op) return;
        this.options = $.extend(this.options, op);
        this.options.slider_margin_bottom = parseInt(this.options.slider_margin_bottom);
        //对数据按日期进行排序
        this.sortDate();

    };
    Timeline.prototype.sortDate = function() {
        this.options.data.sort(function(a, b) {
            return a.start.getTime() - b.start.getTime();
        })

    };
    Timeline.prototype.lineToTime = function(line) {
        //将距离换算为刻度尺上面的日期
        if (typeof line == 'undefined') {
            line = 0; //如果没有值，就默认0
        };
        var addtime = line * this.options.ratio;
        return new Date(this.options.start.valueOf() + addtime);
    };
    Timeline.prototype.timeToLine = function(date) {
        //将日期换算为刻度尺的长度
        if (typeof date == 'undefined') {
            date = new Date(); //如果没有值，就默认当前时间
        }
        return (date - this.options.start) / this.options.ratio;
    };
    Timeline.prototype.setDate = function(data) {
        //设定数据
        //data必须是一个数组
        var start, end, endPos;
        this.dataLength = data.length;
        if ($.isArray(data) && data.length > 0) {
            //判断条数，超出进行处理
            this.options.show_item_num = parseInt(this.options.show_item_num);
            endPos = data.length < this.options.show_item_num ? data.length : this.options.show_item_num;
            start = data[0].start;
            end = data[endPos - 1].start;
            // 对传入的数值进行处理 设置一些额外的起始和结束时间，更完整的展示数据
            var differ = (end.valueOf() - start.valueOf()) / 10;
            if (differ == 0) { //当新闻条数只有1个的时候
                differ = 1 * 24 * 3600 * 1000;
            }
            start = new Date(start.valueOf() - differ / 2);
            end = new Date(end.valueOf() + differ * 2);
            this.options.data = data;
        } else {
            //如果数据不正确  以当天的范围为默认值默认值
            start = new Date();
            start.setDate(start.getDate() - 2);
            end = new Date();
            end.setDate(end.getDate() + 2);
        }

        this.options.start = start;
        this.options.end = end;
        this.resetDate = { //保存时间轴复位时候的参数
            "start": start,
            "end": end
        }

    };

    //重置功能
    Timeline.prototype.reset = function() {
        //重置起始时间
        this.options.start = this.resetDate.start;
        this.options.end = this.resetDate.end;
        this.applyRange();
        this.render();
    };


    //增加事件
    Timeline.prototype.addEvent = function() {

        var _self = this,
            obj = this.dom.container,
            left = obj.offset().left;

        //item 和 slider和axis事件绑定与触发
        //用event插件来实现自定义事件触发
        this.axis.on("moving", function(moveX) {
            _self.items.dom.frame.css({
                "left": moveX
            });
        });
        this.axis.on("move", function(start, end) {
            _self.applyRange(start, end);
            _self.render(start, end);
        });
        this.axis.on("zoom", function(start, end) {
            _self.applyRange(start, end);
            _self.render(start, end);
        });
        this.items.on("select", function(index) {
            _self.slider.showIndex(index);
        });
        this.items.on("slid", function(X) {
            _self.axis.slidX(X);
        });
        this.slider.on("left", function(index) {
            _self.items.selectIndex(index - 1);
        });

        this.slider.on("right", function(index) {
            _self.items.selectIndex(index + 1);
        });

        //按钮缩放、复原 实例
        this.dom.reset.on("click", function() {
            _self.reset();
        })
        this.dom.big.on("click", function() {
            _self.zoom(1);
        })
        this.dom.small.on("click", function() {
            _self.zoom(-1);
        })


    };
    Timeline.prototype.showErrorMessage = function(type) {
        var messageArr = ["无数据，请重新配置数据"];
        this.dom.container.html(messageArr[type]);
    };
    //zoom  时间轴缩放   
    //zoomFactor  缩放参数   放大为1，缩小为-1
    //currenX  缩放时候，鼠标所停留的位置
    Timeline.prototype.zoom = function(zoomFactor, currenX) {
        var time;
        if (currenX) {
            time = this.lineToTime(currenX);
        } else {

            time = new Date((this.options.start.valueOf() + this.options.end.valueOf()) / 2);
        }

        if (zoomFactor >= 1) {
            zoomFactor = 0.2;
        }
        if (zoomFactor <= -1) {
            zoomFactor = -0.2;
        }

        // zoom start Date and end Date relative to the zoomAroundDate
        var startDiff = (this.options.start.valueOf() - time);
        var endDiff = (this.options.end.valueOf() - time);
        // calculate new dates
        var newStart = new Date(this.options.start.valueOf() - startDiff * zoomFactor);
        var newEnd = new Date(this.options.end.valueOf() - endDiff * zoomFactor);

        // only zoom in when interval is larger than minimum interval (to prevent
        // sliding to left/right when having reached the minimum zoom level)
        var interval = (newEnd.valueOf() - newStart.valueOf());
        var zoomMin = 10;
        var zoomMax = (1000 * 60 * 60 * 24 * 365 * 1000);
        if (interval >= zoomMin && interval < zoomMax) {
            this.applyRange(newStart, newEnd);
            this.render();
        }
    };
    return Timeline;
})
