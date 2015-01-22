function Items(options) {
	
	this.dom = {
		"item_block": "item_block"
	};

	this.options = {
		"container": $("#timeLine"),
		"width": 1500,
		"basewidth": 30,
		"start": null,
		"end": null,
		"data":null
	}
	this.item = [];
	this.init(options);
	this.index=0;
}

Items.prototype.setOptions = function(data) {
	this.options = $.extend(this.options, data);
}

Items.prototype.init = function(options) {
	this.setOptions(options);
	var dom = this.dom;
	dom.frame = $("<div class='items-warp' style='position:relative;left:0px;top:0px;width:100%;'></div>");
	this.options.container.append(dom.frame);

	if (!this.options.start) {

		var start,end;
		if(this.options.data){
			 // 对传入的数值进行处理 设置一些额外的边际
			 start = this.options.data[0].start;
             end = this.options.data[this.options.data.length - 1].start;
             var differ = (end.valueOf() - start.valueOf()) / 20
             start = new Date(start.valueOf() - differ);
             end = new Date(end.valueOf() + differ * 2);
		}else{
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
	
}


Items.prototype.render = function(start,end,data) {
	this.applyRange(start,end);
	if (this.options.data != data) {
		this.options.data = data;
		this.creeatItem();
	} else{
		this.setPosItem();
	}
}

Items.prototype.creeatItem = function() {
	var dom = this.dom;
	var _this=this;
	dom.frame.empty();
	this.item = [];
	//console.log(this.options);
	for (var i = 0; i < this.options.data.length; i++) {
		(function() {
			var item = $('<div class="item_block"></div>');

			var pos = _this.timeToLine(_this.options.data[i].start);
			item.html(_this.options.data[i].content);
			item.css({
				"left": pos
			})
			_this.item.push(item);
			dom.frame.append(item);
		})(i)

	}
	this.addEvent();

	// this.container.on('click', '.item', function () {
	// 	//ddfdf
	// 	this.trigger('select', index);
	// });
}

Items.prototype.setPosItem = function() {
	var _this=this;
	for (var i = 0; i < this.options.data.length; i++) {
		(function() {
			
			var pos = _this.timeToLine(_this.options.data[i].start);
			_this.item[i].css({
				"left": pos
			})
		})(i)
	}

}

Items.prototype.itemOverlap = function() {
	//位置重叠处理
    ////@ToDo
}

Items.prototype.addEvent = function() {
	//点击事件
	var frame=this.dom.frame;
	var obj=$("."+this.dom.item_block);
	frame.off("click");
	obj.on("click",function(event){
		$(".item_block_on").removeClass("item_block_on");
		$(this).addClass("item_block_on");
		
	    //@ToDo  其他点击事件处理
	    return false;
	})

    
}

Items.prototype.applyRange = function(start, end) {
	if (start && end) {
		this.options.start = start;
		this.options.end = end;
	}
	this.pe = (this.options.end - this.options.start) / this.options.width;

}

Items.prototype.lineToTime = function(line) {

	if (typeof line == 'undefined') {
		line = 0; //如果没有值，就默认0
	};
	var addtime = line * this.pe;
	return new Date(this.options.start.valueOf() + addtime);

}



Items.prototype.timeToLine = function(date) {

	if (typeof date == 'undefined') {
		date = new Date(); //如果没有值，就默认当前时间
	}
	return (date - this.options.start) / this.pe;
}




