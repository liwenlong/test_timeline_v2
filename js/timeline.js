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
   
 */
(function($) {
    function Timeline(container, options) {
        if (!container) {
            //this.dom.creat();  //创建默认的dom
            return;
        }
        this.options = { //default options

            "width": 1500,
            "height": 300,
            "reset": $("#reset"),
            "big": $("#big"),
            "small": $("#small"),
            "basewidth": 30, //刻度尺的基准宽度，用来生成刻度尺的标示所用，数值越大，刻度尺越稀疏
            "start": null, //时间轴开始时间
            "end": null, //时间轴结束时间
            "ratio": null, //当前时间轴的系数，由起始时间和刻度尺宽度决定
            "data": [{
                "start": new Date(2015, 1, 15),
                "content": "this is content"

            }, {
                "start": new Date(2015, 2, 15),
                "content": "this is content"

            }]
        }
        this.resetDate = {};
        this.dom = {
            "container": container, //defalut parent dom
            "frame": null,
            "axis": "axis",
            "item": "items",
            "current": "current"
        };

        this.setOptions(options); //合并参数

    }

    Timeline.prototype.init = function() {
        if (!this.dom.frame) {
            this.dom.frame = $('<div style="position:relative;width:100%;"></div>');
            this.dom.container.append(this.dom.frame);
        }

        this.setDate(this.options.data); //初始化data
        this.setDomCss(); //设置dom的css
        this.applyRange(); //设置事件比例尺   

        //创建子组件                
        var itemDate = {
            "container": this.dom.frame,
            "width": this.options.width,
            "basewidth": this.options.basewidth,
            "start": this.options.start,
            "end": this.options.end,
            "data": this.options.data
        }
        this.items = new Items(itemDate);
        var axisData = {
            "container": this.dom.frame,
            "width": this.options.width,
            "basewidth": this.options.basewidth,
            "start": this.options.start,
            "end": this.options.end
        }
        this.axis = new Axis(axisData);
        
        this.slider = new Slider($("#slider"), {
            "data": this.options.data
        });

        this.render();
        this.addEvent(); //绑定事件

    };

    //render   用来重绘时间轴，包含刻度尺和事件块
    Timeline.prototype.render = function() {

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

    }

    //addDate  新增时间
    Timeline.prototype.addDate = function(data) {
        if (!data) {
            return;
        }

        this.setDate(data);
        this.applyRange();
        this.render();

        this.slider.init({
            "data": this.options.data
        });

    }


    Timeline.prototype.setOptions = function(op) {
        if (!op) return;
        this.options = $.extend(this.options, op);

    }



    Timeline.prototype.method = {

        //刻度尺上面的时间和位置互相转换的功能函数

        lineToTime: function(line) {
            if (typeof line == 'undefined') {
                line = 0; //如果没有值，就默认0
            };
            var addtime = line * _this.options.ratio;
            return new Date(_this.options.start.valueOf() + addtime);

        },
        timeToLine: function(date) {

            if (typeof date == 'undefined') {
                date = new Date(); //如果没有值，就默认当前时间
            }
            return (date - _this.options.start) / _this.options.ratio;
        }
    }

    Timeline.prototype.setDate = function(data) {
        //set data  data必须是一个数组
        var start, end;
        if ($.isArray(data) && data.length > 0) {

            start = data[0].start;
            end = data[data.length - 1].start;
            // 对传入的数值进行处理 设置一些额外的起始和结束时间，更完整的展示数据
            var differ = (end.valueOf() - start.valueOf()) / 20
            start = new Date(start.valueOf() - differ);
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

    }

    //重置功能
    Timeline.prototype.reset = function() {
        this.options.start = this.resetDate.start;
        this.options.end = this.resetDate.end;
        this.applyRange();
        this.render();
    };


     //增加事件
    Timeline.prototype.addEvent = function() {

        var that = this,
            obj = this.dom.container,
            left = obj.offset().left;

        //item 和 slider和axis事件绑定与触发
        //用event插件来实现自定义事件触发

        this.axis.on("moving", function(moveX) {
            that.items.dom.frame.css({
                "left": moveX
            });
        });
        this.axis.on("move", function(start, end) {
            that.applyRange(start, end);
            that.render(start, end);
        });
        this.axis.on("zoom", function(start, end) {
            that.applyRange(start, end);
            that.render(start, end);
        });

        this.items.on("select", function(index) {
            that.slider.showIndex(index);
        });
        this.items.on("slid", function(X) {
            that.axis.slidX(X);
        });

        this.slider.on("left", function(index) {
            that.items.selectIndex(index - 1);
        });

        this.slider.on("right", function(index) {
            that.items.selectIndex(index + 1);
        });

        //按钮缩放、复原 实例
        this.options.reset.on("click", function() {
            that.reset();
        })
        this.options.big.on("click", function() {

            that.zoom(1);
        })
        this.options.small.on("click", function() {

            that.zoom(-1);
        })


    };

    //zoom  时间轴缩放   
    //zoomFactor  缩放参数   放大为1，缩小为-1
    //currenX  缩放时候，鼠标所停留的位置
    Timeline.prototype.zoom = function(zoomFactor, currenX) {
        var time;
        if (currenX) {
            time = this.method.lineToTime(currenX);
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


    window.Timeline = Timeline;

})(jQuery)