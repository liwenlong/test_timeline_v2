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
    var title,time,img,des;
    for(var i=0;i<data.length;i++){
    	// title=data[i].title??data[i].title:" ";
    	// time=data[i].start??data[i].start:" ";
    	// img=data[i].img??data[i].img:" ";
    	// des=data[i].des??data[i].des:" ";
    	title=data[i].title;
    	time=data[i].start;
    	img=data[i].img;
    	des=data[i].des;
    	// str.push('<li style="display:none;">'+data[i].content+'</li>');
    	str.push('<li>');
    	str.push('  <h3>');  
    	str.push(      title); 
    	str.push('  </h3>'); 
    	str.push('  <h4>');
    	str.push(      time); 
    	str.push('  </h4>'); 
    	str.push('  <div class="des">'); 
    	str.push('    <img src="'); 
    	str.push(      img); 
    	str.push('    " height="240" ></img>'); 
    	str.push(      des);
    	str.push('   </div>'); 
    	str.push('</li>');    
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
	});		
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

//TODO 动画滑动的效果
  
Slider.prototype.events=function(){
	var prv=$("."+this.options.leftBar);
	var next=$("."+this.options.rightBar);
	var _this=this;
    this.frame.hover(function(){
    	prv.show();
        next.show();
    },function(){
    	prv.hide();
        next.hide();
    })
	
	prv.hover(function(){
		$(this).addClass('barOn');
	},function(){
		$(this).removeClass('barOn');
	});
	next.hover(function(){
		$(this).addClass('barOn');
	},function(){
		$(this).removeClass('barOn');
	});
    prv.on("click",function(){
		_this.showIndex(_this.getCurrenIndex()-1);
		_this.trigger('left',_this.getCurrenIndex())

	});
	next.on("click",function(){
		_this.showIndex(_this.getCurrenIndex()+1);
		_this.trigger('right',_this.getCurrenIndex());
	})
	
}

Events.mixTo(Slider);