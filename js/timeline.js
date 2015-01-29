/*
 Timeline
   include
    
     1. axis
     2.items
     3.slider
   add:
      1、新增缩放按钮
      2、将时间start、end放入options
      3、新增reset,全局存放初始的开始时间和结束时间
 */
(function($) {
    var _this; //set to Timeline this 
    function Timeline(container, options) {
        if (!container) {
            //this.dom.creat();  //创建默认的dom
            return;
        }
        this.options = { //default options
            "basewidth": 50,
            "width": 1500,
            "height": 300,
            "data": [{
                "start": new Date(2015, 1, 15),
                "content": "this is content"

            }, {
                "start": new Date(2015, 2, 15),
                "content": "this is content"

            }],
            "reset": $("#reset"),
            "big": $("#big"),
            "small": $("#small"),
            "start": null,
            "end": null,
            "pe": null
        }
        this.dom = {
            "container": container, //defalut parent dom
            "frame": null,
            "axis": "axis",
            "item": "items",
            "current": "current"
        };
        this.resetDate = {};
        this.setOptions(options);
        // this.options = {
        //     "start": null,
        //     "end": null,
        //     "pe": null,
        //     "data": null
        // };
    }


    Timeline.prototype.init = function() {
        _this = this;
        if (!this.dom.frame) {
            this.dom.frame = $('<div style="position:relative;width:200%;"></div>');
            this.dom.container.append(_this.dom.frame);
        }
        this.setDate(this.options.data);
        this.setDomCss(); //设置dom的css
        this.applyRange();

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
        this.axis = new Axis(axisData); //创建两个子组件


        this.slider = new Slider($("#slider"), {
            "data": this.options.data
        });

        this.render();
        this.addEvent();

    };
    Timeline.prototype.setDomCss = function() {
        this.dom.container.css({
            "width": this.options.width,
            "height": this.options.height
        })

    }
    Timeline.prototype.addDate = function(data) {
        if (!data) {
            return;
        }
        this.options.data = data;
        this.setDate(data);
        this.applyRange();
        this.render();

        this.slider.init({
            "data": this.options.data
        });

    }

    Timeline.prototype.render = function() {
        // this.axis.render(start,end);

        //触发事件
        this.axis.render(this.options.start, this.options.end);
        // Timeline.item.redner();
        // this.items.render();
        this.items.render(this.options.start, this.options.end, this.options.data);

    }
    Timeline.prototype.setOptions = function(op) {

        if (!op) return;
        this.options = $.extend(this.options, op);

    }

    Timeline.prototype.applyRange = function(start, end) {
        var time = this.options;
        if (start && end) {
            time.start = start;
            time.end = end;

        }
        time.pe = (time.end - time.start) / this.options.width;

    }

    Timeline.prototype.method = {
        lineToTime: function(line) {
            if (typeof line == 'undefined') {
                line = 0; //如果没有值，就默认0
            };
            var addtime = line * _this.options.pe;
            return new Date(_this.options.start.valueOf() + addtime);

        },
        timeToLine: function(date) {

            if (typeof date == 'undefined') {
                date = new Date(); //如果没有值，就默认当前时间
            }
            return (date - _this.options.start) / _this.options.pe;
        }
    }
    Timeline.prototype.setDate = function(data) {
        //set data
        var start, end;
        if ($.isArray(data) && data.length > 0) {

            start = data[0].start;
            end = data[data.length - 1].start;
            // 对传入的数值进行处理 设置一些额外的边际
            var differ = (end.valueOf() - start.valueOf()) / 20
            start = new Date(start.valueOf() - differ);
            end = new Date(end.valueOf() + differ * 2);
            this.options.data = data;
        } else {
            //如果数据不正确  默认值
            start = new Date();
            start.setDate(start.getDate() - 2);
            end = new Date();
            end.setDate(end.getDate() + 2);
        }


        this.options.start = start;
        this.options.end = end;
        this.resetDate = {
            "start": start,
            "end": end
        }

    }
    Timeline.prototype.reset = function() {
        this.options.start = this.resetDate.start;
        this.options.end = this.resetDate.end;
        this.applyRange();
        this.render();
    };



    Timeline.prototype.addEvent = function() {

        var that = this;
        var obj = this.dom.container;
        var left = obj.offset().left;



        //item 和 slider事件绑定与触发
        //用event插件来实现自定义事件触发
        var that = this;


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

        that.slider.on("left", function(index) {
            that.items.selectIndex(index - 1);
        });

        that.slider.on("right", function(index) {
            that.items.selectIndex(index + 1);
        });

        //按钮缩放  复原
        that.options.reset.on("click", function() {
            that.reset();
        })
        that.options.big.on("click", function() {

            that.zoom(1);
        })
        that.options.small.on("click", function() {

            that.zoom(-1);
        })


    };

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