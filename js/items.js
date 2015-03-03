function Items(options) {
	this.options = {
		"container": $("#timeLine"),
		"height": 190,
		"basewidth": 30,
		"start": null,
		"end": null,
		"data": null,
		"midH": 30
	}
	this.dom = {
		"item_block": "item_block",
		"item_block_on": "item_block_on"
	};
	this.index = 0;
	this.itemsLength = null;
	this.item = [];
	this.init(options);
}

Items.prototype.setOptions = function(data) {
	this.options = $.extend(this.options, data);
	this.options.width = this.options.container.width();
}

//init 初始化  
Items.prototype.init = function(options) {
	this.setOptions(options);
	var dom = this.dom;
	dom.frame = $("<div class='items-warp'></div>");
	dom.frame.css({
		"height":this.options.height,
		"width":this.options.width
	})
	this.options.container.append(dom.frame);
	if (!this.options.start) {
		var start, end;
		if (this.options.data) {
			// 对传入的数值进行处理 设置一些额外的边际
			start = this.options.data[0].start;
			end = this.options.data[this.options.data.length - 1].start;
			var differ = (end.valueOf() - start.valueOf()) / 20
			start = new Date(start.valueOf() - differ);
			end = new Date(end.valueOf() + differ * 2);
		} else {
			start = new Date();
			start.setDate(start.getDate() - 2);
			end = new Date();
			end.setDate(end.getDate() + 2);
		}

		this.options.start = start;
		this.options.end = end;
	}

	this.applyRange();
	this.creeatItem();
	this.addEvent();
};

//重绘信息块
//start, end  起始时间
//data  信息块的数据
Items.prototype.render = function(start, end, data) {
	this.applyRange(start, end);
	//将dom的left置为0  为了解决在模拟拖拽时候，left被改动，在渲染的时候需要重置一下
	this.dom.frame.css({
		"left": "0px"
	})
	if (data && this.options.data != data) {
		this.options.data = data;
		this.creeatItem();
	} else {
		this.setPosItem();
	}
	this.itemOverlap();
};

//applyRange  设置时间轴的范围，以确定事件块的位置
Items.prototype.applyRange = function(start, end) {

	if (start && end) {
		this.options.start = start;
		this.options.end = end;
	}
	this.ratio = (this.options.end - this.options.start) / this.options.width; //ratio 比例系数

};
//creeatItem  创建信息块并设置位置
Items.prototype.creeatItem = function() {

	var dom = this.dom;
	var _this = this;
	dom.frame.empty();
	this.item = [];
	for (var i = 0; i < this.options.data.length; i++) {
		var item = $('<div class="item_block" ></div>');
		var pos = this.timeToLine(this.options.data[i].start);
		item.html(this.options.data[i].title);
		item.css({
			"left": pos,
			"width":this.options.item_width,
			"height":this.options.item_height
		})
		this.item.push(item);
		dom.frame.append(item);
	}
	this.item[0].addClass(this.dom.item_block_on); //默认选中第一个
	this.itemsLength = this.options.data.length;
	

};

//setPosItem 设置信息块位置
Items.prototype.setPosItem = function() {
	var _this = this;
	for (var i = 0; i < this.options.data.length; i++) {
		(function() {
			var pos = _this.timeToLine(_this.options.data[i].start);
			_this.item[i].css({
				"left": pos
			})
		})(i)
	}

};


Items.prototype.addEvent = function() {
	//点击事件
	var that = this;
	that.dom.frame.on("click", "div", function() {
		var index = that.getIndex(this);
		that.selectIndex(index);

	});
	//@ToDo  其他点击事件处理

};


//位置和时间互相转换
Items.prototype.lineToTime = function(line) {
	if (typeof line == 'undefined') {
		line = 0; //如果没有值，就默认0
	};
	var addtime = line * this.ratio;
	return new Date(this.options.start.valueOf() + addtime);

};

Items.prototype.timeToLine = function(date) {
	if (typeof date == 'undefined') {
		date = new Date(); //如果没有值，就默认当前时间
	}
	return (date - this.options.start) / this.ratio;
};


//选中某一个信息块
Items.prototype.selectIndex = function(index) {
	if (index >= this.itemsLength || index < 0) {
		return
	}
	var curObj = $("." + this.dom["item_block"]).eq(index);
	$("." + this.dom["item_block_on"]).removeClass(this.dom["item_block_on"]);
	curObj.addClass(this.dom["item_block_on"])
		//处理事件块被选中时候的移动效果  默认移动到时间轴中间
	var left = parseInt(curObj.css("left"));
	//if(left<0||left>(0 + this.options.width) / 2){    //只有事件块在刻度的外面或者刻度才的右侧才触发移动效果
	    var X = left - (0 + this.options.width) / 2;
		this.slidX(X);

	//}

	
	this.trigger('select', index);

	this.index = index;
};

//选中某一个信息块  得到当前信息块的索引
Items.prototype.getIndex = function(item) {
	for (var i = 0; i < this.item.length; i++) {
		if (item == this.item[i][0]) {
			return i;
		}
	}
	return 0;
};

//信息块左右滑动
Items.prototype.slidX = function(X) {
	var left,
		startTime,
		startx,
		endTime,
		endX,
		that = this;
	left = parseInt(this.dom.frame.css("left"));
	startX = 0 + X;
	endX = this.options.width + X;
	this.dom.frame.animate({
		left: left - X
	}, function() {

		startTime = that.lineToTime(startX);
		endTime = that.lineToTime(endX);
		that.render(startTime, endTime);
	})
	this.trigger('slid', X);
};

Items.prototype.itemOverlap = function() {
	//位置重叠处理
	//@ToDo
	function removeOverlap(arr, w, h, H, midH) {
		/*
		  arr 处理的对象数组
		  w    对象的宽
		  h    对象的高
		  H    父节点的高度
		  midH  对象的初始化top值，作为位置基准线
		*/
		var arr1 = [];
		var len = arr.length;
		var left, top, preleft, pretop;
		arr[0].attr("data-top", midH);
		for (var i = 1; i < len; i++) {
			left = parseInt(arr[i].css("left"));
			top = parseInt(arr[i].css("top"));
			for (var j = 0; j < i; j++) {
				preleft = parseInt(arr[j].css("left"));
				pretop = parseInt(arr[j].attr("data-top"));
				if (Math.abs(left - preleft) <= (w) && Math.abs(top - pretop) <= (h)) {
					//改变top值
					top = (pretop + h + 10 + H) % H;
				}
				if (Math.abs(left - preleft) > (w)) {
					top = midH;
				}

			}
			arr[i].attr("data-top", top);
		}
		for (var i = 1; i < len; i++) {
			(function(i) {
				var curObj = arr[i];
				var top = curObj.attr("data-top");
				curObj.animate({
					"top": top
				}, 400)

			})(i)

		}

	}


	var itemWidth = this.item[0].width(),
		itemHeight = this.item[0].height();
	removeOverlap(this.item, itemWidth, itemHeight, this.options.height-itemHeight, this.options.midH);


};

Events.mixTo(Items);