function Axis(options) {
	this.options = {
		"container": $("#timeLine"),
		"width": 1500,
		"basewidth":50,
		"start": null,
		"end": null
	}

	this.dom = {
		//存放dom的一些参数
		// "container": $("#timeLine"),
		// "frame": $(".axis-warp"),
	}

	this.scaleObj = {  //刻度尺的时间范围
		MILLISECOND: 1,
		SECOND: 2,
		MINUTE: 3,
		HOUR: 4,
		DAY: 5,
		WEEKDAY: 6,
		YEAR: 8
	};
	this.short = {
		//日期的简称
		'MONTHS': ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		'MONTHS_SHORT': ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
		'DAYS': ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
		'DAYS_SHORT': ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
	};
	this.scale = this.scaleObj.MONTH; //scale代表时间轴当前的时间比例，默认值为月
	this.step = 1; //刻度尺每个刻度的步数

	this.init(options);

}
Axis.prototype.setOptions = function(data) {
	this.options = $.extend(this.options, data);
	this.options.width=this.options.container.width();  //将width属性设置为container的宽度
}

//setDefaultTime  设置刻度尺的默认时间，不填的话，默认为空
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
		dom.frame = $("<div class='axis-warp' style='position:absolute;left:0px;width:1000%;'></div>");
		
		dom.baseLineArr = [];
		dom.baseTxtArr = [];
		dom.majorLineArr = [];
		dom.majorTxtArr = [];
		this.dom.container.append($("<div class='axis-border'></div>"))
		this.dom.container.append(dom.frame);
	}
}
Axis.prototype.init = function(options) {

	// 设置默认参数
	this.setOptions(options);
	//设置默认时间
	this.setDefaultTime();
	//设置dom属性
	this.setDefaultDom();

	//render 绘制刻度尺
	this.render();
	//事件添加
	this.addevents();

	


};
//设置刻度尺的时间范围
Axis.prototype.applyRange = function(start, end) {
	if (start && end) {
		this.options.start = start;
		this.options.end = end;
	}
	this.ratio = (this.options.end - this.options.start) / this.options.width; //设置ratio
	this.setStep(this.options.basewidth); //设置step和比例
};


//render  重绘刻度尺
Axis.prototype.render = function(start, end) {

	this.applyRange(start, end);
     // renderRange 将刻度尺展示延长，为了方便拖拽等效果时候，不仅仅展示当前的时间范围，还展示前、后时间的刻度尺
    //比如起始时间为1天，那么就在刻度尺增加前天和后天
    this.renderRange(-1,1);   //

};

Axis.prototype.renderRange = function(offsetBefore, offsetAfter) { 
    //offsetBefore, offsetAfter 格式为整数,代表n个刻度尺的宽度的时间
   //  比如-1，+1，代表刻度尺的时间的前一倍时间和后一倍时间

	var start,
		end,
		startX,
		endX,
		warpArr=[], //存放元素的数组
		lineCurrent; //刻度尺上面刻度数当前所对应的时间

	startX = this.options.width*(0+offsetBefore);
	endX = this.options.width*(1+offsetAfter)
	start = this.lineToTime(startX);
	end = this.lineToTime(endX);
	lineCurrent = this.roundDate(start);

	//每个刻度尺包含4部分
	//BaseLine   小刻度
	// BaseTxt   小刻度的数值
	// MajorLine   大刻度
	// MajorTxt    大刻度的数值
 
	while (lineCurrent.valueOf() < end.valueOf()) {
		//画四条线
		lineCurrent = this.lineNext(lineCurrent); //设置下一个时间		
		var left = this.timeToLine(lineCurrent);
		txt1 = this.formateLineTxt(lineCurrent);
		txt2 = this.formateMajorTxt(lineCurrent);
		//调用画4个部分
		warpArr.push(this.drawBaseLine(left));
		warpArr.push(this.drawBaseTxt(left, txt1));

		if (this.isMajor(lineCurrent)) {
			//大刻度
			warpArr.push(this.drawMajorLine(left));
			warpArr.push(this.drawMajorTxt(left, txt2));
		}
	}

	this.dom.frame.empty();
	this.dom.frame.css({
		"left":0
	})
	this.dom.frame.html(warpArr.join(" "));
   
};

//renderName  重绘某一个子刻度尺  提供刻度尺的dom名称 以及刻度尺的位置


//drawBaseLine 、drawBaseTxt 、drawMajorLine 、drawMajorTxt 分别为画大刻度、小刻度方法
Axis.prototype.drawBaseLine = function(left) {
	
    return "<div class='baseLine' style='left:"+left+"px;'></div>";
}

Axis.prototype.drawBaseTxt = function(left, txt) {
	
	return "<div class='baseTxt' style='left:"+left+"px;'>"+txt+"</div>";
}

Axis.prototype.drawMajorLine = function(left) {
	
   return "<div class='majorLine' style='left:"+left+"px;'></div>"
}

Axis.prototype.drawMajorTxt = function(left, txt) {
	
	return "<div class='majorTxt' style='left:"+left+"px;'>"+txt+"</div>";
}

//添加事件   主要有拖拽和鼠标滚轮事件
Axis.prototype.addevents = function() {
	var that = this;
	var obj = that.dom.frame;
	var frame = that.dom.frame;
	var startX, endX, startTime, endTime, startLine, endLine;
	obj.off();
	var isDrag=true;
	var obj1=$("<div></div>")
	
	obj.on("mousedown", function(event) {
		isDrag=true;
		startX = event.clientX;
		startLine = 0;
		endLine = that.options.width;
		var frameLeft = parseInt(frame.css("left"));
		obj.css({
			"cursor": "move"
		});
		$("body").on("mousemove", function(event) {
			if(isDrag){
				endX = event.clientX;
				endX = endX - startX;
				frame.css({
					left: frameLeft + endX
				})
				that.trigger('moving', endX); //触发正在拖拽中事件	
			}
			
		});
		$("body").on("mouseup", function(event) {
			isDrag=false;
			$("body").off();
			endX = event.clientX - startX;
			startLine = startLine - endX;
			endLine = endLine - endX;
			startTime = that.lineToTime(startLine);
			endTime = that.lineToTime(endLine);
			that.render(startTime,endTime);
			that.trigger('move', startTime, endTime); //触发移动事件
			obj.css({
				"cursor": "default"
			});
			
		});
		
		 event.stopImmediatePropagation();
		return false;
	});

	obj.on("mousewheel", function(event) {

		/*
			使用插件，兼容mousewheel     
				 插件封装了event.deltaX, event.deltaY, event.deltaFactor
				 其中，deltaY为1、-1
            */
		var currenX = event.originalEvent.clientX;
		currenX = currenX - that.dom.frame.offset().left;
		that.zoom(event.deltaY, currenX);
		return false;

	});

};

//zoom  比例尺缩放功能 根据缩放系数 重新设置起始时间和重绘
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

	
	var startDiff = (this.options.start.valueOf() - time.valueOf());
	var endDiff = (this.options.end.valueOf() - time.valueOf());	
	var newStart = new Date(this.options.start.valueOf() - startDiff * zoomFactor);
	var newEnd = new Date(this.options.end.valueOf() - endDiff * zoomFactor);

	var interval = (newEnd.valueOf() - newStart.valueOf());
	var zoomMin = 10;
	var zoomMax = (1000 * 60 * 60 * 24 * 365 * 1000);
	if (interval >= zoomMin && interval < zoomMax) {
		this.trigger('zoom', newStart, newEnd);
		this.applyRange(newStart, newEnd);
		this.render();
	}
};



Axis.prototype.roundDate = function(time) {
	//处理刻度尺开始的位置 根据范围和step设置 

	switch (this.scale) {
		case this.scaleObj.YEAR:
			time.setFullYear(this.step * Math.floor(time.getFullYear() / this.step));
			time.setMonth(0);
		case this.scaleObj.MONTH:
			time.setDate(1);
		case this.scaleObj.DAY: 
		case this.scaleObj.WEEKDAY:
			time.setHours(0);
		case this.scaleObj.HOUR:
			time.setMinutes(0);
		case this.scaleObj.MINUTE:
			time.setSeconds(0);
		case this.scaleObj.SECOND:
			time.setMilliseconds(0);
			
	}

	if (this.step != 1) {
		
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
			case this.scaleObj.WEEKDAY: 
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

//寻找刻度尺的下一个位置
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
				
				var h = time.getHours();
				time.setHours(h - (h % this.step));
				break;
			case this.scaleObj.WEEKDAY: 
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
			case this.scaleObj.WEEKDAY: 
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
				break; 
			default:
				break;
		}
	}

	

	return time;

};

//移动刻度尺 
Axis.prototype.slidX = function(X) {
	var left, startx, start, end, endX, that = this;
	var left = parseInt(this.dom.frame.css("left"));
	var startX = 0 + X;
	var endX = this.options.width + X;
	this.dom.frame.animate({
		left: left - X
	}, function() {
		start = that.lineToTime(startX);
		end = that.lineToTime(endX);
		that.render(start, end);
	})
}


//补零
Axis.prototype.addZeros = function(value, len) { //为格式化增加的功能
	var str = "" + value;
	while (str.length < len) {
		str = "0" + str;
	}
	return str;
};

// 时间和位置转换
Axis.prototype.lineToTime = function(line) {

	if (typeof line == 'undefined') {
		line = 0; //如果没有值，就默认0
	};
	var addtime = line * this.ratio;
	return new Date(this.options.start.valueOf() + addtime);

}



Axis.prototype.timeToLine = function(date) {

	if (typeof date == 'undefined') {
		date = new Date(); //如果没有值，就默认当前时间
	}
	return (date - this.options.start) / this.ratio;
}

//setStep 设置scal和step
Axis.prototype.setStep = function(basewidth) {
    //设置scal 和step
    //首先根据开始时间、起始时间，总宽度，算出最小宽度(basewidth)代表的最小时间段
	//根据换算的最小时间段所在的范围，得到当前的scal和step

	if (!basewidth) return;
	var baseTime = this.lineToTime(basewidth).valueOf() - this.options.start.valueOf();
	var stepYear = (1000 * 60 * 60 * 24 * 30 * 12);
	var stepMonth = (1000 * 60 * 60 * 24 * 30);
	var stepDay = (1000 * 60 * 60 * 24);
	var stepHour = (1000 * 60 * 60);
	var stepMinute = (1000 * 60);
	var stepSecond = (1000);
	var stepMillisecond = (1);
	
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

//对刻度数进行处理  formateLineTxt 小刻度 
Axis.prototype.formateLineTxt = function(currenTime) {
	var date = currenTime;
	switch (this.scale) {
		case this.scaleObj.MILLISECOND:
			return String(date.getMilliseconds())+"ms";
		case this.scaleObj.SECOND:
			return String(date.getSeconds())+"s";
		case this.scaleObj.MINUTE:
			return this.addZeros(date.getHours(), 2) + ":" + this.addZeros(date.getMinutes(), 2);
		case this.scaleObj.HOUR:
			return this.addZeros(date.getHours(), 2) + ":" + this.addZeros(date.getMinutes(), 2);
		case this.scaleObj.WEEKDAY:
			return this.short.DAYS_SHORT[date.getDay()] + ' ' + date.getDate()+'日';
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

//对刻度数进行处理  formateLineTxt 大刻度 
Axis.prototype.formateMajorTxt = function(currenTime) {
	var date = currenTime;

	switch (this.scale) {
		case this.scaleObj.MILLISECOND:
			return this.addZeros(date.getHours(), 2) + ":" +
				this.addZeros(date.getMinutes(), 2) + ":" +
				this.addZeros(date.getSeconds(), 2);
		case this.scaleObj.SECOND:
			 
		    return	this.short.MONTHS_SHORT[date.getMonth()] +
				date.getDate() + "日" +
				this.addZeros(date.getHours(), 2) + ":" +
				this.addZeros(date.getMinutes(), 2);
		case this.scaleObj.MINUTE:
			return this.short.DAYS_SHORT[date.getDay()] + " " +
				date.getFullYear() + "年" +
				this.short.MONTHS_SHORT[date.getMonth()] + ""+
				date.getDate()+'日 ';
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

//判断是否为大刻度尺
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