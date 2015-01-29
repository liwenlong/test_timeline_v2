function Axis(options) {
	// for the Axis


	this.options = {
		"container": $("#timeLine"),
		"width": 1500,
		"basewidth": 50,
		"start": null,
		"end": null
	}

	this.dom = {
		"container": $("#timeLine"),
		"frame": $(".axis-warp"),
		"before": $(".axis-before"),
		"curren": $(".axis-curren"),
		"after": $(".axis-after")
	}
	this.dom = {
		// "baseLine": "baseLine",
		// "baseTxt": "baseTxt",
		// "majorLine": "majorLine",
		// "majorTxt": "majorTxt"
	};
	this.scaleObj = {
		MILLISECOND: 1,
		SECOND: 2,
		MINUTE: 3,
		HOUR: 4,
		DAY: 5,
		WEEKDAY: 6,
		MONTH: 9,
		YEAR: 8
	};
	this.short = {
		'MONTHS': ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		'MONTHS_SHORT': ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
		'DAYS': ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
		'DAYS_SHORT': ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
	};
	this.scale = this.scaleObj.MONTH; //默认值
	this.step = 1;

	this.init(options);

}
Axis.prototype.setOptions = function(data) {
	this.options = $.extend(this.options, data);
}
Axis.prototype.setDefaultTime = function() {
	if (!this.options.start) {
		var start = new Date();
		start.setDate(start.getDate() - 2);
		var end = new Date();
		end.setDate(end.getDate() + 2);
		this.options.start = start;
		this.options.end = end;
	}
}
Axis.prototype.setDefaultDom = function() {
	var dom = this.dom;
	this.dom.container = this.options.container || this.dom.container; //传入默认container元素
	if (!dom.frame) { //创建frame
		dom.frame = $("<div class='axis-warp' style='position:absolute;left:0px;width:400%;'></div>");
		dom.baseLineArr = [];
		dom.baseTxtArr = [];
		dom.majorLineArr = [];
		dom.majorTxtArr = [];
		this.dom.container.append(dom.frame);
	}
}
Axis.prototype.init = function(options) {

	// 设置默认参数
	this.setOptions(options);
	//设置默认时间
	this.setDefaultTime();
	//新建dom属性
	this.setDefaultDom();

	//render
	this.render();
	this.addevents();


	//this.applyRange();
	//this.render();



}
Axis.prototype.render = function(start,end) {
	//渲染前面div
	//渲染中间div
	//渲染后面div
	// this.renderMiddle();	
	// this.renderLeft();

	this.applyRange(start,end);
	this.dom.frame.empty();
	this.renderName("axis-before", -this.options.width);
	this.renderName("axis-curren", 0);
	this.renderName("axis-after", this.options.width);
	this.dom.frame.css({
		"left": -this.options.width
	})

};

Axis.prototype.addevents = function() {
	var that = this;
	var obj = that.dom.frame;
	var frame = that.dom.frame;
	var startX, endX, startTime, endTime, startLine, endLine;
	obj.off();
	obj.on("mousedown", function(event) {

		startX = event.clientX;
		startLine = 0;
		endLine = that.options.width;
		var frameLeft = parseInt(frame.css("left"));
		obj.css({
			"cursor": "move"
		});
		$("body").on("mousemove", function(event) {

			endX = event.clientX;
			endX =  endX - startX;
			frame.css({
				left: frameLeft+endX
			})
			that.trigger('moving',endX);
			

		});

		$("body").on("mouseup", function(event) {
			
			endX = event.clientX - startX;
			startLine = startLine - endX;
			endLine = endLine - endX;
			startTime = that.lineToTime(startLine);
			endTime = that.lineToTime(endLine);
			that.trigger('move',startTime,endTime);
			obj.css({
				"cursor": "default"
			});
			$("body").off("mousemove");
			$("body").off("mouseup");

		});


	});

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
                currenX = currenX - that.dom.frame.offset().left;
                that.zoom(delta, currenX);
            }

        });

};
Axis.prototype.zoom = function(zoomFactor, currenX) {
        var time;
        if (currenX) {
            time = this.lineToTime(currenX);
        } else {

            time = new Date((this.dom.start.valueOf() + this.dom.end.valueOf()) / 2);
        }

        if (zoomFactor >= 1) {
            zoomFactor = 0.2;
        }
        if (zoomFactor <= -1) {
            zoomFactor = -0.2;
        }
       
        // zoom start Date and end Date relative to the zoomAroundDate
        var startDiff = (this.options.start.valueOf() - time.valueOf());
        var endDiff = (this.options.end.valueOf() - time.valueOf());
        // calculate new dates
        var newStart = new Date(this.options.start.valueOf() - startDiff * zoomFactor);
        var newEnd = new Date(this.options.end.valueOf() - endDiff * zoomFactor);

        // only zoom in when interval is larger than minimum interval (to prevent
        // sliding to left/right when having reached the minimum zoom level)
        var interval = (newEnd.valueOf() - newStart.valueOf());
        var zoomMin = 10;
        var zoomMax = (1000 * 60 * 60 * 24 * 365 * 1000);
        if (interval >= zoomMin && interval < zoomMax) {
        	this.trigger('zoom',newStart,newEnd);
            this.applyRange(newStart, newEnd);
            this.render();
        }
    };

Axis.prototype.renderName = function(wrapDom, offsetX) {
	var start, end, startX, endX;

	startX = 0 + offsetX;
	endX = this.options.width + offsetX;
	start = this.lineToTime(startX);
	end = this.lineToTime(endX);

	//obj creatline
	var obj, majorLineArr, lineCurrent, max = 0;
	obj = $('<div class="' + wrapDom + '" style="width:' + this.options.width + 'px;height:100%;float:left;position:relative;"></div>');
	lineCurrent = this.roundDate(start);

	function drawBaseLine(left) {
		var line = $("<div class='baseLine'></div>");
		line.css({
			"left": (left) + "px"
		});
		return line;

	}

	function drawBaseTxt(left, txt) {
		var line = $("<div class='baseTxt'></div>");
		line.html(txt);
		line.css({
			"left": (left) + "px"
		});
		return line;
	}

	function drawMajorLine(left) {
		var line = $("<div class='majorLine'></div>");
		line.css({
			"left": (left) + "px"
		});
		return line;

	}

	function drawMajorTxt(left, txt) {
		var line = $("<div class='majorTxt'></div>");
		line.html(txt);
		line.css({
			"left": (left) + "px"
		});
		return line;
	}

	while (max < 100 && lineCurrent.valueOf() < end.valueOf()) {
		//画四条线		
		var left = this.timeToLine(lineCurrent) - offsetX;
		var txt1 = this.formateLineTxt(lineCurrent);
		var txt2 = this.formateMajorTxt(lineCurrent);
		obj.append(drawBaseLine(left));
		obj.append(drawBaseTxt(left, txt1));
		if (this.isMajor(lineCurrent)) {
			obj.append(drawMajorLine(left));
			obj.append(drawMajorTxt(left, txt2));
		}

		max++;
		lineCurrent = this.lineNext(lineCurrent); //设置下一个时间
	}

	this.dom.frame.append(obj);

};
Axis.prototype.applyRange = function(start, end) {
	if (start && end) {
		this.options.start = start;
		this.options.end = end;
	}
	this.pe = (this.options.end - this.options.start) / this.options.width; //设置pe
	this.setStep(this.options.basewidth); //设置step和比例
}



Axis.prototype.roundDate = function(time) {

	switch (this.scale) {
		case this.scaleObj.YEAR:
			time.setFullYear(this.step * Math.floor(time.getFullYear() / this.step));
			time.setMonth(0);
		case this.scaleObj.MONTH:
			time.setDate(1);
		case this.scaleObj.DAY: // intentional fall through
		case this.scaleObj.WEEKDAY:
			time.setHours(0);
		case this.scaleObj.HOUR:
			time.setMinutes(0);
		case this.scaleObj.MINUTE:
			time.setSeconds(0);
		case this.scaleObj.SECOND:
			time.setMilliseconds(0);
			//case this.scaleObj.MILLISECOND: // nothing to do for milliseconds
	}

	if (this.step != 1) {
		// round down to the first minor value that is a multiple of the current step size
		switch (this.scale) {
			case this.scaleObj.MILLISECOND:
				time.setMilliseconds(time.getMilliseconds() - time.getMilliseconds() % this.step);
				break;
			case this.scaleObj.SECOND:
				time.setSeconds(time.getSeconds() - time.getSeconds() % this.step);
				break;
			case this.scaleObj.MINUTE:
				time.setMinutes(time.getMinutes() - time.getMinutes() % this.step);
				break;
			case this.scaleObj.HOUR:
				time.setHours(time.getHours() - time.getHours() % this.step);
				break;
			case this.scaleObj.WEEKDAY: // intentional fall through
			case this.scaleObj.DAY:
				time.setDate((time.getDate() - 1) - (time.getDate() - 1) % this.step + 1);
				break;
			case this.scaleObj.MONTH:
				time.setMonth(time.getMonth() - time.getMonth() % this.step);
				break;
			case this.scaleObj.YEAR:
				time.setFullYear(time.getFullYear() - time.getFullYear() % this.step);
				break;
			default:
				break;
		}
	}

	return time;

}
Axis.prototype.lineNext = function(time) {
	var prev = time.valueOf();
	var current = time.getMonth();
	var step = this.step;
	var scal = this.scale;

	// Two cases, needed to prevent issues with switching daylight savings
	// (end of March and end of October)
	if (time.getMonth() < 6) {
		switch (this.scale) {
			case this.scaleObj.MILLISECOND:

				time = new Date(time.valueOf() + this.step);
				break;
			case this.scaleObj.SECOND:
				time = new Date(time.valueOf() + this.step * 1000);
				break;
			case this.scaleObj.MINUTE:
				time = new Date(time.valueOf() + this.step * 1000 * 60);
				break;
			case this.scaleObj.HOUR:
				time = new Date(time.valueOf() + this.step * 1000 * 60 * 60);
				// in case of skipping an hour for daylight savings, adjust the hour again (else you get: 0h 5h 9h ... instead of 0h 4h 8h ...)
				var h = time.getHours();
				time.setHours(h - (h % this.step));
				break;
			case this.scaleObj.WEEKDAY: // intentional fall through
			case this.scaleObj.DAY:
				time.setDate(time.getDate() + this.step);
				break;
			case this.scaleObj.MONTH:
				time.setMonth(time.getMonth() + this.step);
				break;
			case this.scaleObj.YEAR:
				time.setFullYear(time.getFullYear() + this.step);
				break;
			default:
				break;
		}
	} else {
		switch (this.scale) {
			case this.scaleObj.MILLISECOND:
				time = new Date(time.valueOf() + this.step);
				break;
			case this.scaleObj.SECOND:
				time.setSeconds(time.getSeconds() + this.step);
				break;
			case this.scaleObj.MINUTE:
				time.setMinutes(time.getMinutes() + this.step);
				break;
			case this.scaleObj.HOUR:
				time.setHours(time.getHours() + this.step);
				break;
			case this.scaleObj.WEEKDAY: // intentional fall through
			case this.scaleObj.DAY:
				time.setDate(time.getDate() + this.step);
				break;
			case this.scaleObj.MONTH:
				time.setMonth(time.getMonth() + this.step);
				break;
			case this.scaleObj.YEAR:
				time.setFullYear(time.getFullYear() + this.step);
				break;
			default:
				break;
		}
	}

	if (this.step != 1) {
		// round down to the correct major value
		switch (this.scale) {
			case this.scaleObj.MILLISECOND:
				if (time.getMilliseconds() < this.step) time.setMilliseconds(0);
				break;
			case this.scaleObj.SECOND:
				if (time.getSeconds() < this.step) time.setSeconds(0);
				break;
			case this.scaleObj.MINUTE:
				if (time.getMinutes() < this.step) time.setMinutes(0);
				break;
			case this.scaleObj.HOUR:
				if (time.getHours() < this.step) time.setHours(0);
				break;
			case this.scaleObj.WEEKDAY: // intentional fall through
			case this.scaleObj.DAY:
				if (time.getDate() < this.step + 1) time.setDate(1);
				break;
			case this.scaleObj.MONTH:
				if (time.getMonth() < this.step) time.setMonth(0);
				break;
			case this.scaleObj.YEAR:
				break; // nothing to do for year
			default:
				break;
		}
	}

	// safety mechanism: if current time is still unchanged, move to the end
	if (time.valueOf() == prev) {
		time = new Date(this.warp.time.valueOf());
	}

	return time;

};

Axis.prototype.slidX=function(X){
	var left,startx,start,end,endX,that=this;
	var left=parseInt(this.dom.frame.css("left"));
	var startX=0+X;
	var endX=this.options.width+X;
    this.dom.frame.animate({
    	left:left-X
    },function(){
    	start=that.lineToTime(startX);
    	end=that.lineToTime(endX);
        that.render(start,end);
    })
}

//method 日期和轴转换

Axis.prototype.addZeros = function(value, len) { //为格式化增加的功能
	var str = "" + value;
	while (str.length < len) {
		str = "0" + str;
	}
	return str;
};


Axis.prototype.lineToTime = function(line) {

	if (typeof line == 'undefined') {
		line = 0; //如果没有值，就默认0
	};
	var addtime = line * this.pe;
	return new Date(this.options.start.valueOf() + addtime);

}



Axis.prototype.timeToLine = function(date) {

	if (typeof date == 'undefined') {
		date = new Date(); //如果没有值，就默认当前时间
	}
	return (date - this.options.start) / this.pe;
}

Axis.prototype.setStep = function(basewidth) {
	//根据最小的宽度，换算成时间轴的最小时间，然后根据最小时间所在的范围，得到当前的scal和step

	if (!basewidth) return;

	var baseTime = this.lineToTime(basewidth).valueOf() - this.options.start.valueOf();
	var stepYear = (1000 * 60 * 60 * 24 * 30 * 12);
	var stepMonth = (1000 * 60 * 60 * 24 * 30);
	var stepDay = (1000 * 60 * 60 * 24);
	var stepHour = (1000 * 60 * 60);
	var stepMinute = (1000 * 60);
	var stepSecond = (1000);
	var stepMillisecond = (1);
	// find the smallest step that is larger than the provided baseTime
	if (stepYear * 1000 > baseTime) {
		this.scale = this.scaleObj.YEAR;
		this.step = 1000;
	}
	if (stepYear * 500 > baseTime) {
		this.scale = this.scaleObj.YEAR;
		this.step = 500;
	}
	if (stepYear * 100 > baseTime) {
		this.scale = this.scaleObj.YEAR;
		this.step = 100;
	}
	if (stepYear * 50 > baseTime) {
		this.scale = this.scaleObj.YEAR;
		this.step = 50;
	}
	if (stepYear * 10 > baseTime) {
		this.scale = this.scaleObj.YEAR;
		this.step = 10;
	}
	if (stepYear * 5 > baseTime) {
		this.scale = this.scaleObj.YEAR;
		this.step = 5;
	}
	if (stepYear > baseTime) {
		this.scale = this.scaleObj.YEAR;
		this.step = 1;
	}
	if (stepMonth * 3 > baseTime) {
		this.scale = this.scaleObj.MONTH;
		this.step = 3;
	}
	if (stepMonth > baseTime) {
		this.scale = this.scaleObj.MONTH;
		this.step = 1;
	}
	if (stepDay * 5 > baseTime) {
		this.scale = this.scaleObj.DAY;
		this.step = 5;
	}
	if (stepDay * 2 > baseTime) {
		this.scale = this.scaleObj.DAY;
		this.step = 2;
	}
	if (stepDay > baseTime) {
		this.scale = this.scaleObj.DAY;
		this.step = 1;
	}
	if (stepDay / 2 > baseTime) {
		this.scale = this.scaleObj.WEEKDAY;
		this.step = 1;
	}
	if (stepHour * 4 > baseTime) {
		this.scale = this.scaleObj.HOUR;
		this.step = 4;
	}
	if (stepHour > baseTime) {
		this.scale = this.scaleObj.HOUR;
		this.step = 1;
	}
	if (stepMinute * 15 > baseTime) {
		this.scale = this.scaleObj.MINUTE;
		this.step = 15;
	}
	if (stepMinute * 10 > baseTime) {
		this.scale = this.scaleObj.MINUTE;
		this.step = 10;
	}
	if (stepMinute * 5 > baseTime) {
		this.scale = this.scaleObj.MINUTE;
		this.step = 5;
	}
	if (stepMinute > baseTime) {
		this.scale = this.scaleObj.MINUTE;
		this.step = 1;
	}
	if (stepSecond * 15 > baseTime) {
		this.scale = this.scaleObj.SECOND;
		this.step = 15;
	}
	if (stepSecond * 10 > baseTime) {
		this.scale = this.scaleObj.SECOND;
		this.step = 10;
	}
	if (stepSecond * 5 > baseTime) {
		this.scale = this.scaleObj.SECOND;
		this.step = 5;
	}
	if (stepSecond > baseTime) {
		this.scale = this.scaleObj.SECOND;
		this.step = 1;
	}
	if (stepMillisecond * 200 > baseTime) {
		this.scale = this.scaleObj.MILLISECOND;
		this.step = 200;
	}
	if (stepMillisecond * 100 > baseTime) {
		this.scale = this.scaleObj.MILLISECOND;
		this.step = 100;
	}
	if (stepMillisecond * 50 > baseTime) {
		this.scale = this.scaleObj.MILLISECOND;
		this.step = 50;
	}
	if (stepMillisecond * 10 > baseTime) {
		this.scale = this.scaleObj.MILLISECOND;
		this.step = 10;
	}
	if (stepMillisecond * 5 > baseTime) {
		this.scale = this.scaleObj.MILLISECOND;
		this.step = 5;
	}
	if (stepMillisecond > baseTime) {
		this.scale = this.scaleObj.MILLISECOND;
		this.step = 1;
	}

};

Axis.prototype.formateLineTxt = function(currenTime) {
	var date = currenTime;
	switch (this.scale) {
		case this.scaleObj.MILLISECOND:
			return String(date.getMilliseconds());
		case this.scaleObj.SECOND:
			return String(date.getSeconds());
		case this.scaleObj.MINUTE:
			return this.addZeros(date.getHours(), 2) + ":" + this.addZeros(date.getMinutes(), 2);
		case this.scaleObj.HOUR:
			return this.addZeros(date.getHours(), 2) + ":" + this.addZeros(date.getMinutes(), 2);
		case this.scaleObj.WEEKDAY:
			return this.short.DAYS_SHORT[date.getDay()] + ' ' + date.getFullYear() + "." +
				(date.getMonth() + 1) + "." + date.getDate();
		case this.scaleObj.DAY:
			return String(date.getDate());
		case this.scaleObj.MONTH:
			return this.short.MONTHS_SHORT[date.getMonth()]; // month is zero based
		case this.scaleObj.YEAR:
			return String(date.getFullYear());
		default:
			return "";
	}

};

Axis.prototype.formateMajorTxt = function(currenTime) {
	var date = currenTime;

	switch (this.scale) {
		case this.scaleObj.MILLISECOND:
			return this.addZeros(date.getHours(), 2) + ":" +
				this.addZeros(date.getMinutes(), 2) + ":" +
				this.addZeros(date.getSeconds(), 2);
		case this.scaleObj.SECOND:
			return date.getDate() + " " +
				this.short.MONTHS_SHORT[date.getMonth()] + " " +
				this.addZeros(date.getHours(), 2) + ":" +
				this.addZeros(date.getMinutes(), 2);
		case this.scaleObj.MINUTE:
			return this.short.DAYS_SHORT[date.getDay()] + " " +
				date.getFullYear() + "年" +
				this.short.MONTHS_SHORT[date.getMonth()] + "";
			// +
			// date.getDate()+'日 '+
			// date.getHours()+':00';
		case this.scaleObj.HOUR:
			return this.short.DAYS_SHORT[date.getDay()] + " " +
				date.getFullYear() + "年" +
				this.short.MONTHS_SHORT[date.getMonth()] + "" + date.getDate() + '日';
		case this.scaleObj.WEEKDAY:
		case this.scaleObj.DAY:
			return date.getFullYear() + "年" + this.short.MONTHS_SHORT[date.getMonth()];
		case this.scaleObj.MONTH:
			return String(date.getFullYear()) + "年";
		default:
			return "";
	}

};

Axis.prototype.isMajor = function(currenTime) {
	switch (this.scale) {
		case this.scaleObj.MILLISECOND:
			return (currenTime.getMilliseconds() == 0);
		case this.scaleObj.SECOND:
			return (currenTime.getSeconds() == 0);
		case this.scaleObj.MINUTE:
			return (currenTime.getMinutes() == 0);
			// Note: this is no bug. Major label is equal for both minute and hour scale
		case this.scaleObj.HOUR:
			return (currenTime.getHours() == 0);
		case this.scaleObj.WEEKDAY: // intentional fall through
		case this.scaleObj.DAY:
			return (currenTime.getDate() == 1);
		case this.scaleObj.MONTH:
			return (currenTime.getMonth() == 0);
		case this.scaleObj.YEAR:
			return false;
		default:
			return false;
	}
};

Events.mixTo(Axis);