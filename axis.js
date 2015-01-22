function Axis(options) {
	// for the Axis


	this.options = {
		"container": $("#timeLine"),
		"width": 1500,
		"basewidth": 30,
		"start": null,
		"end": null
	}
	this.dom = {
		"baseLine": "baseLine",
		"baseTxt": "baseTxt",
		"majorLine": "majorLine",
		"majorTxt": "majorTxt"

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

Axis.prototype.init = function(options) {
	this.setOptions(options);
	if (!this.options.start) {
		var start = new Date();
		start.setDate(start.getDate() - 2);
		var end = new Date();
		end.setDate(end.getDate() + 2);
		this.options.start = start;
		this.options.end = end;
	}
	this.applyRange();
	this.render();
}
Axis.prototype.render = function() {
	var dom = this.dom;
	if (!dom.frame) {
		dom.frame = $("<div class='axis-warp' style='position:relative;left:0px;width:100%;'></div>");
		dom.baseLineArr = [];
		dom.baseTxtArr = [];
		dom.majorLineArr = [];
		dom.majorTxtArr = [];
		this.options.container.append(dom.frame);

	}
	dom.frame.remove();
	this.creatLine();
	this.options.container.append(dom.frame);

}
Axis.prototype.applyRange = function(start, end) {
	if (start && end) {
		this.options.start = start;
		this.options.end = end;
	}
	this.pe = (this.options.end - this.options.start) / this.options.width;

}
Axis.prototype.setZoom = function(start, end) {
	this.applyRange(start, end);
	this.render();
}
Axis.prototype.creatLine = function() {

	this.setStep(this.options.basewidth);
	this.lineStart();
	this.reWritingNum(); //记刻度尺数字清零
	var max = 0;
	while (!this.lineEnd() && max < 1000) {
		max++;
		var isMajor = this.isMajor();
		this.setBaseLine();
		this.setBaseTxt();
		if (isMajor) {
			this.setMajorLine();
			this.setMajorTxt();
		}
		this.lineNext();
	}
	this.reWriteNum(); //处理多余的元素 

};
Axis.prototype.reWriteNum = function() {
	var dom = this.dom;
	var frame = dom.frame;
	var num;
	var arr;
	arr = dom.baseLineArr;
	num = this.baseLineNum;
	while (arr.length > num) {
		var minorText = arr[num];
		minorText.remove();
		arr.splice(num, 1);
	}


	arr = dom.baseTxtArr;
	num = this.baseTxtNum;
	while (arr.length > num) {
		var minorText = arr[num];
		minorText.remove();
		arr.splice(num, 1);
	}

	arr = dom.majorLineArr;
	num = this.majorLineNum;
	while (arr.length > num) {
		var minorText = arr[num];
		minorText.remove();
		arr.splice(num, 1);
	}

	arr = dom.majorTxtArr;
	num = this.majorTxtNum;
	while (arr.length > num) {
		var minorText = arr[num];
		minorText.remove();
		arr.splice(num, 1);
	}



};
Axis.prototype.reWritingNum = function() {
	this.baseLineNum = 0;
	this.baseTxtNum = 0;
	this.majorLineNum = 0;
	this.majorTxtNum = 0;

};


Axis.prototype.setBaseLine = function() {
	var dom = this.dom;
	var frame = dom.frame;
	var index = this.baseLineNum;
	var arr = dom.baseLineArr;
	var line;
	if (index < arr.length) {

		line = arr[index];
	} else {
		line = $("<div class='baseLine'></div>");
		frame.append(line);
		arr.push(line);
	}
	line.css({
		"left": (this.timeToLine(this.lineCurrent) - 1) + "px"
	});
	this.baseLineNum++;
};
Axis.prototype.setBaseTxt = function() {

	var dom = this.dom;
	var frame = dom.frame;
	var index = this.baseTxtNum;
	var arr = dom.baseTxtArr;
	var line;
	var txt = this.formateLineTxt(); //得到要填充的内容
	if (index < arr.length) {
		line = arr[index];
	} else {
		line = $("<div class='baseTxt'></div>");
		line.html(txt);
		frame.append(line);
		arr.push(line);
	}

	line.html(txt);
	line.css({
		"left": (this.timeToLine(this.lineCurrent)) + "px"
	});
	this.baseTxtNum++;
};

Axis.prototype.setMajorLine = function() {
	var dom = this.dom;
	var frame = dom.frame;
	var index = this.majorLineNum;

	var arr = dom.majorLineArr;
	var line;
	if (index < arr.length) {
		line = arr[index];
	} else {
		line = $("<div class='majorLine'></div>");
		frame.append(line);
		arr.push(line);
	}
	line.css({
		"left": (this.timeToLine(this.lineCurrent) - 1) + "px"
	});
	this.majorLineNum++;

};
Axis.prototype.setMajorTxt = function() {


	var dom = this.dom;
	var frame = dom.frame;
	var index = this.majorTxtNum;
	var arr = dom.majorTxtArr;
	var line;
	var txt = this.formateMajorTxt(); //得到要填充的内容

	if (index < arr.length) {
		line = arr[index];
	} else {
		line = $("<div class='majorTxt'></div>");
		line.html(txt);
		frame.append(line);
		arr.push(line);
	}

	line.html(txt);
	line.css({
		"left": (this.timeToLine(this.lineCurrent)) + "px"
	});
	this.majorTxtNum++;

};


Axis.prototype.formateLineTxt = function() {
	var date = this.lineCurrent;
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

Axis.prototype.formateMajorTxt = function() {
	var date = this.lineCurrent;

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

Axis.prototype.lineStart = function() {
	this.lineCurrent = new Date(this.options.start.valueOf());

	//将当前时间取整
	this.roundDate(this.lineCurrent);


};
Axis.prototype.lineEnd = function() {

	return this.lineCurrent.valueOf() > this.options.end.valueOf();
};
Axis.prototype.lineNext = function() {
	var prev = this.lineCurrent.valueOf();
	var current = this.lineCurrent.getMonth();
	var step = this.step;
	var scal = this.scale;

	// Two cases, needed to prevent issues with switching daylight savings
	// (end of March and end of October)
	if (this.lineCurrent.getMonth() < 6) {
		switch (this.scale) {
			case this.scaleObj.MILLISECOND:

				this.lineCurrent = new Date(this.lineCurrent.valueOf() + this.step);
				break;
			case this.scaleObj.SECOND:
				this.lineCurrent = new Date(this.lineCurrent.valueOf() + this.step * 1000);
				break;
			case this.scaleObj.MINUTE:
				this.lineCurrent = new Date(this.lineCurrent.valueOf() + this.step * 1000 * 60);
				break;
			case this.scaleObj.HOUR:
				this.lineCurrent = new Date(this.lineCurrent.valueOf() + this.step * 1000 * 60 * 60);
				// in case of skipping an hour for daylight savings, adjust the hour again (else you get: 0h 5h 9h ... instead of 0h 4h 8h ...)
				var h = this.lineCurrent.getHours();
				this.lineCurrent.setHours(h - (h % this.step));
				break;
			case this.scaleObj.WEEKDAY: // intentional fall through
			case this.scaleObj.DAY:
				this.lineCurrent.setDate(this.lineCurrent.getDate() + this.step);
				break;
			case this.scaleObj.MONTH:
				this.lineCurrent.setMonth(this.lineCurrent.getMonth() + this.step);
				break;
			case this.scaleObj.YEAR:
				this.lineCurrent.setFullYear(this.lineCurrent.getFullYear() + this.step);
				break;
			default:
				break;
		}
	} else {
		switch (this.scale) {
			case this.scaleObj.MILLISECOND:
				this.lineCurrent = new Date(this.lineCurrent.valueOf() + this.step);
				break;
			case this.scaleObj.SECOND:
				this.lineCurrent.setSeconds(this.lineCurrent.getSeconds() + this.step);
				break;
			case this.scaleObj.MINUTE:
				this.lineCurrent.setMinutes(this.lineCurrent.getMinutes() + this.step);
				break;
			case this.scaleObj.HOUR:
				this.lineCurrent.setHours(this.lineCurrent.getHours() + this.step);
				break;
			case this.scaleObj.WEEKDAY: // intentional fall through
			case this.scaleObj.DAY:
				this.lineCurrent.setDate(this.lineCurrent.getDate() + this.step);
				break;
			case this.scaleObj.MONTH:
				this.lineCurrent.setMonth(this.lineCurrent.getMonth() + this.step);
				break;
			case this.scaleObj.YEAR:
				this.lineCurrent.setFullYear(this.lineCurrent.getFullYear() + this.step);
				break;
			default:
				break;
		}
	}

	if (this.step != 1) {
		// round down to the correct major value
		switch (this.scale) {
			case this.scaleObj.MILLISECOND:
				if (this.lineCurrent.getMilliseconds() < this.step) this.lineCurrent.setMilliseconds(0);
				break;
			case this.scaleObj.SECOND:
				if (this.lineCurrent.getSeconds() < this.step) this.lineCurrent.setSeconds(0);
				break;
			case this.scaleObj.MINUTE:
				if (this.lineCurrent.getMinutes() < this.step) this.lineCurrent.setMinutes(0);
				break;
			case this.scaleObj.HOUR:
				if (this.lineCurrent.getHours() < this.step) this.lineCurrent.setHours(0);
				break;
			case this.scaleObj.WEEKDAY: // intentional fall through
			case this.scaleObj.DAY:
				if (this.lineCurrent.getDate() < this.step + 1) this.lineCurrent.setDate(1);
				break;
			case this.scaleObj.MONTH:
				if (this.lineCurrent.getMonth() < this.step) this.lineCurrent.setMonth(0);
				break;
			case this.scaleObj.YEAR:
				break; // nothing to do for year
			default:
				break;
		}
	}

	// safety mechanism: if current time is still unchanged, move to the end
	if (this.lineCurrent.valueOf() == prev) {
		this.lineCurrent = new Date(this.warp.time.valueOf());
	}

};

Axis.prototype.roundDate = function(time) {
	if (!time) time = this.lineCurrent;
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


};
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



Axis.prototype.isMajor = function() {
	switch (this.scale) {
		case this.scaleObj.MILLISECOND:
			return (this.lineCurrent.getMilliseconds() == 0);
		case this.scaleObj.SECOND:
			return (this.lineCurrent.getSeconds() == 0);
		case this.scaleObj.MINUTE:
			return (this.lineCurrent.getMinutes() == 0);
			// Note: this is no bug. Major label is equal for both minute and hour scale
		case this.scaleObj.HOUR:
			return (this.lineCurrent.getHours() == 0);
		case this.scaleObj.WEEKDAY: // intentional fall through
		case this.scaleObj.DAY:
			return (this.lineCurrent.getDate() == 1);
		case this.scaleObj.MONTH:
			return (this.lineCurrent.getMonth() == 0);
		case this.scaleObj.YEAR:
			return false;
		default:
			return false;
	}
};

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