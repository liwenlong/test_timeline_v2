;
(function($){
	function Dialog(options){
		var defaultOpt={
			"closeBtn":"closeBtn"
		}
		var opts=$.extend(defaultOpt,options);
		var bgDom=$('<div class="dialog_bg" style="position: fixed;left:0;top:0;width:100%;height:100%;background:#666;opacity:.5;z-index:100"></div>')
		var _this=this;
		$("body").append(bgDom);
		this.css({
			"z-index":101,
			"position":"absolute"
		});
		console.log(this.html());
		this.show();

		//关闭
		$(this).on("click",opts.closeBtn,function(){

			 _this.hide();
			 bgDom.remove();
			 console.log("123");
		})
	}
	$.fn.extend({
	    dialog:Dialog
	})
})(jQuery)
