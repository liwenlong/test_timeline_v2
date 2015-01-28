function Slider(frame,options){

	if(!frame) return;
	this.frame=frame;
	this.currenIndex=0;
	this.length=null;
	this.options={
		width:1000,
		height:300,
		leftBar:"leftBar",
		rightBar:"rightBar",
		data:null

	}
	
	this.init(options);
	this.events();
}

Slider.prototype.init=function(data){
	  this.setOptions(data);
	  this.setDate(this.options.data);
	  
}

Slider.prototype.setOptions=function(data){
	this.options=$.extend(this.options,data);
	
}

Slider.prototype.setDate=function(data){
    if(!data) {
      return;	
    }
    var str=[];
    this.length=data.length;
    for(var i=0;i<data.length;i++){
    	str.push('<li style="display:none;">'+data[i].content+'</li>');
    }
    str=str.join(" ");
    this.frame.find(".slider-content").html(str);
    this.showIndex(0,1);

}

Slider.prototype.showIndex=function(index,Timer){
	if(!index) index=0;
	if(!Timer) Timer=200;
	var _this=this;
	if(index>=this.length||index<0){ return;}
	this.frame.find("li").eq(this.currenIndex).animate({
	  "opacity":0
	},Timer,function(){
		$(this).hide();
	})		
	this.frame.find("li").eq(index).animate({
	  "opacity":1
	},Timer,function(){
		$(this).show();
		_this.currenIndex=index;
	})	
	
	
}

Slider.prototype.getCurrenIndex=function(){
	return this.currenIndex;
}

Slider.prototype.setCurrenIndex=function(index){
	if(!index||index>=this.length||this.index<0){ return;}
    this.currenIndex=index;
}

Slider.prototype.events=function(){
	var prv=$("."+this.options.leftBar);
	var next=$("."+this.options.rightBar);
	var _this=this;
	prv.on("click",function(){
		_this.showIndex(_this.getCurrenIndex()-1);
		_this.trigger('left',_this.getCurrenIndex())

	})
	next.on("click",function(){
		_this.showIndex(_this.getCurrenIndex()+1);
		_this.trigger('right',_this.getCurrenIndex())

	})
}

Events.mixTo(Slider);