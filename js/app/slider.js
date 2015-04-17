define(["jquery","events","videoPc"],function($,Events,SpecailVideo){

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
	var len=this.length||0;
	
		dom.frame = $('<div id="slider"></div>');
		dom.frame.css({ //初始化宽、高
			"height": this.options.height,
			"width": this.options.width,
			"margin-bottom": this.options.slider_margin_bottom
		})
		
		dom.pre = $('<div class="leftBar">前一张</div>');
		dom.next = $('<div class="rightBar">下一张</div>');
		dom.content = $('<ul class="slider-content" style="width:9999px;height:'+this.options.height+'px;"></ul>');
		dom.frame.append(dom.pre);
		dom.frame.append(dom.next);
		dom.frame.append(dom.content);
		this.options.container.append(dom.frame);
	
	this.setDate(this.options.data);
}

Slider.prototype.setOptions = function(data) {
	this.options = $.extend(this.options, data);

}

Slider.prototype.setDate = function(data) {
	if (!data) {
		return;
	}
	var str = [], //html内容
		that = this,
		videoList = [], //所有视频信息
		totalHeight = this.options.height,
		totalWidth = this.options.width,
		imgHight = totalHeight - 40 - 30;
	this.length = data.length;
	function creatSlider_Pic(objDate) {
		var str = [];
		str.push('<li style="width:'+that.options.width+'px;">');
		str.push('  <h3 class="slider_title">');
		str.push(objDate.title);
		str.push('  </h3>');
		str.push('  <h4 class="slider_date">');
		str.push(objDate.start.toLocaleDateString());
		str.push('  </h4>');
		str.push('  <img src="');
		str.push(objDate.img);
		str.push('   " width="' + totalWidth + '" class="slider_img"></img>');
		str.push('</li>');
		return str.join(" ");
	}

	function creatSlider_mix(objDate) {
		var str = [];
		str.push('<li style="width:'+that.options.width+'px;">');
		str.push('  <h3 class="slider_title">');
		str.push(objDate.title);
		str.push('  </h3>');
		str.push('  <h4 class="slider_date">');
		str.push(objDate.start.toLocaleDateString());
		str.push('  </h4>');
		str.push('  <div class="slider_des" style="width:' + (totalWidth - 20) + ';padding:0px 10px;">');
		str.push('     <img src="');
		str.push(objDate.img);
		str.push('     " width="' + (totalWidth / 2) + '" class="slider_img" style="margin:0px 10px 10px 0px;"></img>');
		str.push(objDate.des);
		str.push('  </div>');
		str.push('</li>');
		return str.join(" ");
	}

	function creatSlider_video(objDate) {
		//创建一个新的视频
		var str = [];
		var videoId =objDate.start.getTime()
		str.push('<li style="width:'+that.options.width+'px;" date-time="'+videoId+'">');
		str.push('  <div class="video">');
		str.push('     <div id="' + videoId + '">');
		str.push(objDate.videoId);
		str.push('     </div>');
		str.push('  </div>');
		str.push('</li>');
		//拼装视频信息
		videoList.push({
			"guid": objDate.videoId,
			"containerId": videoId, // 这个地方必须是id
			"AutoPlay": false, // 是否自动播放
			"width": that.options.width, // 播放器宽度
			"height": that.options.height, // 播放器高度
			"subjectid": videoId  // 组id，尽量以专题名加业内实例化序号来生成，保证不重复
			// 播放列表，如果没有，可以传回当前的guid或者传回''；
		})
		return str.join(" ");
	}

	function creatSlider_html(objDate) {
		var str = [];
		str.push('<li style="width:'+that.options.width+'px;">');
		str.push('  <h3 class="slider_title">');
		str.push(objDate.title);
		str.push('  </h3>');
		str.push('  <h4 class="slider_date">');
		str.push(objDate.start.toLocaleDateString());
		str.push('  </h4>');
		str.push('  <div class="slider_htmlContent">');
		str.push(objDate.htmlContent);
		str.push('  </div>');
		str.push('</li>');
		return str.join(" ");
	}

	function applyVideo(videoInfoList) {
		//根据视频列表，初始化视频
		var videoList = {};
	    for(var i=0;i<videoInfoList.length;i++){
        	(function(i){
            videoList[videoInfoList[i].containerId+""]=new SpecailVideo();
        	videoList[videoInfoList[i].containerId+""].create(videoInfoList[i]);
        	})(i)
         }
         return videoList;

	}
	for (var i = 0; i < data.length; i++) {
		switch (data[i].dataType) {
			case 1:
				str.push(creatSlider_Pic(data[i]));
				break;
			case 2:
				str.push(creatSlider_mix(data[i]));
				break;
			case 3:
				str.push(creatSlider_video(data[i]));
				break;
			case 4:
				str.push(creatSlider_html(data[i]));
				break;
			default:
				str.push("");
		}
	}
	str = str.join(" ");
	this.dom.content.html(str);
	this.videoList=applyVideo(videoList);
	this.showIndex(0, 1);
}

Slider.prototype.showIndex = function(index, Timer) {
	inde = index ||0;
	Timer = Timer||1000;
	if (index >= this.length || index < 0) {
		return;
	}
	var _this = this;
	var preDom=this.dom.frame.find("li").eq(this.currenIndex);
	var videoId=preDom.attr("date-time");
	 if(videoId){
	 	try{
	 		_this.videoList[videoId]&&_this.videoList[videoId].pause();
	 	}
	 	catch(e){
	 		
	 	}
		
	}
	
	var ulDom=this.dom.content;
	ulDom.animate({
		"left":-index*this.options.width
	}, Timer,function(){
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
	var preClickTime, nextClickTime;
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
		if (!preClickTime || new Date() - preClickTime > 400) {
			var triggerIndex=_this.getCurrenIndex();
			_this.showIndex(triggerIndex - 1);
			setTimeout(function(){
				//_this.trigger('left', _this.getCurrenIndex());
				_this.trigger('left', triggerIndex) ;
			},0)
			preClickTime = new Date();
		}
	});
	next.on("click", function() {

		if (!nextClickTime || new Date() - nextClickTime > 400) {
			var triggerIndex=_this.getCurrenIndex();
			_this.showIndex(triggerIndex + 1);
			setTimeout(function(){
				_this.trigger('right', triggerIndex);
			},0)
			nextClickTime = new Date();
		}

	})

}

Events.mixTo(Slider);
return Slider;



})
