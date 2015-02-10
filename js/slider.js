function Slider(options) {
	this.currenIndex = 0;
	this.length = null;
	this.options = {
		"container": $("#timeLine"),
		width: 1000,
		height: 300,
		leftBar: "leftBar",
		rightBar: "rightBar",
		data: null
	}
	this.dom = {
		//存放dom的一些参数
		// "container": $("#timeLine"),
		// "frame": $(".axis-warp"),

	}
	this.init(options);
	this.events();
}
Slider.prototype.init = function(data) {
	this.setOptions(data);
	var dom = this.dom;
	if (!dom.frame) {
		dom.frame = $('<div id="slider"></div>');
		this.options.container.append(dom.frame);
		
		dom.pre = $('<div class="leftBar">前一张</div>');
		dom.next = $('<div class="rightBar">下一张</div>');
		dom.content = $('<ul class="slider-content"></ul>');
		dom.frame.append(dom.pre);
		dom.frame.append(dom.next);
		dom.frame.append(dom.content);
		
	}
	this.setDate(this.options.data);
}

Slider.prototype.setOptions = function(data) {
	this.options = $.extend(this.options, data);

}

Slider.prototype.setDate = function(data) {
	if (!data) {
		return;
	}
	var str = [];
	this.length = data.length;
	var title, time, img, des;
	for (var i = 0; i < data.length; i++) {
		title = data[i].title;
		time = data[i].start;
		time = time.toLocaleDateString(); //采用Date对象内置方法转换时间
		img = data[i].img;
		des = data[i].des;
		str.push('<li style="display:none;">');
		str.push('  <h3>');
		str.push(title);
		str.push('  </h3>');
		str.push('  <h4>');
		str.push(time);
		str.push('  </h4>');
		str.push('  <div class="des">');
		str.push('    <img src="');
		str.push(img);
		str.push('    " height="240" ></img>');
		str.push(des);
		str.push('   </div>');
		str.push('</li>');
	}
	str = str.join(" ");
	this.dom.content.html(str);
	this.showIndex(0, 1);

}

Slider.prototype.showIndex = function(index, Timer) {
	if (!index) index = 0;
	if (!Timer) Timer = 200;
	var _this = this;
	if (index >= this.length || index < 0) {
		return;
	}
	console.log(index);
	console.log(this.currenIndex);
	this.dom.frame.find("li").eq(this.currenIndex).animate({
		"opacity": 0
	}, Timer, function() {
		$(this).hide();
	});
	this.dom.frame.find("li").eq(index).animate({
		"opacity": 1
	}, Timer, function() {
		$(this).show();
		_this.currenIndex = index;
	})
}

Slider.prototype.getCurrenIndex = function() {
	return this.currenIndex;
}

Slider.prototype.setCurrenIndex = function(index) {
	if (!index || index >= this.length || this.index < 0) {
		return;
	}
	this.currenIndex = index;
}

//TODO 动画滑动的效果

Slider.prototype.events = function() {
	var pre = this.dom.pre;
	var next = this.dom.next;
	var _this = this;
	var preClickTime,nextClickTime;
	this.dom.frame.hover(function() {
		pre.show();
		next.show();
	}, function() {
		pre.hide();
		next.hide();
	})

	pre.hover(function() {
		$(this).addClass('barOn');
	}, function() {
		$(this).removeClass('barOn');
	});
	next.hover(function() {
		$(this).addClass('barOn');
	}, function() {
		$(this).removeClass('barOn');
	});
	pre.on("click", function() {
		//增加无法额外点击
		if(!preClickTime||new Date()-preClickTime>400){
			_this.showIndex(_this.getCurrenIndex() - 1);
		    _this.trigger('left', _this.getCurrenIndex());
		    preClickTime=new Date();	
		}
	});
	next.on("click", function() {
		
		if(!nextClickTime||new Date()-nextClickTime>400){
			_this.showIndex(_this.getCurrenIndex() + 1);
			_this.trigger('right', _this.getCurrenIndex());
			nextClickTime=new Date();
		}

	})

}

Events.mixTo(Slider);