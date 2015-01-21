function Items(_this) {
	this.warp = _this;
	this.dom = {
		"container": _this.dom.iframe,
		"item_block": "item_block"

	};
	this.item = [];
	this.data = [];
	this.init();
}

Items.prototype.init = function() {
	var dom = this.dom;
	dom.frame = $("<div class='items-warp' style='position:relative;left:0px;top:0px;width:100%;'></div>");
	dom.baseLineArr = [];
	dom.baseTxtArr = [];
	dom.majorLineArr = [];
	dom.majorTxtArr = [];
	dom.container.append(dom.frame);
	this.data = this.warp.time.data;
	this.creeatItem();
	
}
Items.prototype.render = function() {
	var _this = this;
	if (this.data != this.warp.time.data) {
		this.data = this.warp.time.data;
		this.creeatItem();
	} else{
		this.data = this.warp.time.data;
		this.setPosItem();
	}
}

Items.prototype.creeatItem = function() {
	var dom = this.dom;
	var _this = this;
	dom.frame.empty();
	this.item = [];
	for (var i = 0; i < this.data.length; i++) {
		var _this = this;
		(function() {
			var item = $('<div class="item_block"></div>');
			//console.log(_this.data[i]);
			var pos = _this.warp.method.timeToLine(_this.data[i].start);
			item.html(_this.data[i].content);
			//console.log(pos);
			item.css({
				"left": pos
			})
			_this.item.push(item);
			dom.frame.append(item);
		})(i)

	}
	this.addEvent();
}

Items.prototype.setPosItem = function() {
	var _this = this;
	for (var i = 0; i < this.data.length; i++) {
		(function() {
			var pos = _this.warp.method.timeToLine(_this.data[i].start);
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
		
	    //@ToDo  其他点击效果
	    return false;
	})

    
}






