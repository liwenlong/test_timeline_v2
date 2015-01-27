/*
 Timeline
   include
     axis items      ----   class
     option  data  method  data addEvent   init  setOptions setDate
 1. axis
 2.items

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
            "height": 400,
            "data": [{
                "start": new Date(2015, 1, 15),
                "content": "this is content"

            }, {
                "start": new Date(2015, 2, 15),
                "content": "this is content"

            }]
        }
        this.dom = {
            "container": container, //defalut parent dom
            "iframe": null,
            "axis": "axis",
            "item": "items",
            "current": "current"
        };

        this.setOptions(options);
        this.time = {
            "start": null,
            "end": null,
            "pe": null,
            "data": null
        };
    }


    Timeline.prototype.init = function() {
        _this = this;
        this.setDate(this.options.data);
        if (!this.dom.iframe) {
            this.dom.iframe = $('<div style="position:relative;width:200%;"></div>');
            this.dom.container.append(_this.dom.iframe);
        }
        this.applyRange();

        var axisData = {
            "container": this.dom.iframe,
            "width": this.options.width,
            "basewidth": this.options.basewidth,
            "start": this.time.start,
            "end": this.time.end
        }
        this.axis = new Axis(axisData); //创建两个子组件

        var itemDate = {
            "container": this.dom.iframe,
            "width": this.options.width,
            "basewidth": this.options.basewidth,
            "start": this.time.start,
            "end": this.time.end,
            "data": this.time.data
        }
        this.items = new Items(itemDate);
        this.slider = new Slider($("#slider"), {
            "data": this.time.data
        });
        
        this.render();
        this.addEvent();

    };

    Timeline.prototype.addDate = function(data) {
        if (!data) {
            return;
        }
        this.time.data = data;
        this.setDate(data);
        this.applyRange();
        this.render();

        this.slider.init({
            "data": this.time.data
        });

    }

    Timeline.prototype.render = function() {
        // this.axis.render(start,end);
        //触发事件

        this.axis.setZoom(this.time.start, this.time.end);
        // Timeline.item.redner();
        // this.items.render();
        this.items.render(this.time.start, this.time.end, this.time.data);

    }
    Timeline.prototype.setOptions = function(op) {

        if (!op) return;
        this.options = $.extend(this.options, op);

    }

    Timeline.prototype.applyRange = function(start, end) {
        var time = this.time;
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
            var addtime = line * _this.time.pe;
            return new Date(_this.time.start.valueOf() + addtime);

        },
        timeToLine: function(date) {

            if (typeof date == 'undefined') {
                date = new Date(); //如果没有值，就默认当前时间
            }
            return (date - _this.time.start) / _this.time.pe;
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
            this.time.data = data;
        } else {
            //如果数据不正确  默认值
            start = new Date();
            start.setDate(start.getDate() - 2);
            end = new Date();
            end.setDate(end.getDate() + 2);
        }



        this.time.start = start;
        this.time.end = end;

    }

    Timeline.prototype.addEvent = function() {

        var that = this;
        var obj = this.dom.container;
        var left = obj.offset().left;

        obj.on("mousewheel", function(event) {
            //@TODO forfox 浏览器不支持这个方法 

            var delta = 0;
            var currenX;
            var orginEv = event.originalEvent;
            currenX = event.originalEvent.clientX;

            if (orginEv.wheelDelta) { // IE/Opera
                delta = orginEv.wheelDelta / 120;
            }
            if (delta) {
                currenX = currenX - left;
                that.zoom(delta, currenX);
            }

        });
        var startX, endX, startTime, endTime;
        obj.on("mousedown", function(event) {
            var flg = true;
            var time, newStart, newEnd;
            startX = event.clientX;
            startTime = that.time.start;
            endTime = that.time.end;
            obj.css({
                "cursor": "move"
            });
            $("body").on("mousemove", function(event) {
                endX = event.clientX;
                time = startTime.valueOf() - that.method.lineToTime(endX - startX).valueOf();
                newStart = new Date(startTime.valueOf() + time);
                newEnd = new Date(endTime.valueOf() + time);
                that.applyRange(newStart, newEnd);
                that.render();

            });

            $("body").on("mouseup", function(event) {
                that.render();
                obj.css({
                    "cursor": "default"
                });
                $("body").off("mousemove");
                $("body").off("mouseup");

            });


        });

        


       //item 和 slider事件绑定与触发
       //用event插件来实现自定义事件触发
        var that=this;
        this.items.on("select", function(index) {
            that.slider.showIndex(index);
        });
        this.items.on("render",function(start,end){
            
            that.applyRange(start, end);
            that.render();

         })
        that.slider.on("left", function(index) {
            that.items.chooseIndex(index - 1);
       });

        that.slider.on("right", function(index) {
            that.items.chooseIndex(index + 1);
        });

    };

    Timeline.prototype.zoom = function(zoomFactor, currenX) {

        var time;
        if (currenX) {
            time = this.method.lineToTime(currenX);
        } else {

            time = new Date((this.time.start.valueOf() + this.time.end.valueOf()) / 2);
        }

        if (zoomFactor >= 1) {
            zoomFactor = 0.2;
        }
        if (zoomFactor <= -1) {
            zoomFactor = -0.2;
        }

        // zoom start Date and end Date relative to the zoomAroundDate
        var startDiff = (this.time.start.valueOf() - time);
        var endDiff = (this.time.end.valueOf() - time);
        // calculate new dates
        var newStart = new Date(this.time.start.valueOf() - startDiff * zoomFactor);
        var newEnd = new Date(this.time.end.valueOf() - endDiff * zoomFactor);

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

   //@TODO
   //1、render和applyRange的统一接口问题，相当于完全重新绘制
   //2、关于移动的效果，应该增加moveto效果来实现。如果增加动画效果
   //3、关于move的效果，可以考虑先用left实现，然后最后重绘实现
   //4、关于信息块在缩小的过程中，重叠的处理情况
})(jQuery)