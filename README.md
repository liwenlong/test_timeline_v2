# 时间轴（TimeLine）API文档

标签（空格分隔）： 文档



------

## 简述

时间轴是一个通过时间维度展示新闻的组件，通过它你可以更加直观的展示从时间的维度来浏览这些新闻，赶快试一试吧。

## 组件结构

###组件包含一行html代码（提供组件的容器），一个css文件、8个js文档

###依赖的js包

| 名称        | 说明   |  
| --------   | -----  | 
| jquery     | jquery |   
| jquery.mousewheel        |   依赖jquery的鼠标滚动事件   |  
| events        |  自定义事件    |  
|video、videoPic|  视频播放|
      
 
###本身的js

| 名称        | 说明   |  
| -----------   | -----  | 
| timeline      | 主体js |   
| items         |  主轴事件块   |  
| axis          |    主轴    |  
|slider|  具体内容展示|

##使用说明

###引入html代码
```html
<!--容器 id必须存在-->
<div id="timeLine">
   
</div>

```
###引入主体css
```css
   <!--组件样式css-->
   <link rel="stylesheet" type="text/css" href="css/main.css">
```
###引入js
```javascript
<script type="text/javascript" src="js/jquery.js"></script>
<script type="text/javascript" src="js/jquery.mousewheel.min.js"></script>
<script type="text/javascript" src="js/events.js"></script>
<script type="text/javascript" src="js/timeline.js"></script>
<script type="text/javascript" src="js/items.js"></script>
<script type="text/javascript" src="js/axis.js"></script>
<script type="text/javascript" src="js/slider.js"></script>
<script type="text/javascript" src="js/video.js"></script>
<script type="text/javascript" src="js/videoPc.js"></script>
```

###参数配置和初始化
```配置和初始化
var timeline=new Timeline("id"),{      //实例化
        //配置项
        "width": 1000,        //总体宽度
        "height": 800,        //总体高度
        "slider_margin_bottom":50,
        "skin":"redClass",
        "show_item_num":4 ,        //时间轴上初始展示多少条新闻 
        "data":[
              /*
                 dataType
                   1、图片       title、start、img
                   2、图文混排       
                   3、视频
                   4、html内容
              */
            {   
                "dataType":1,      //图片    title、start、img   
                "title":"test1 图片类型",
                "start":new Date(2010,7,23,23,0,0),
                "img":"img/1.jpg"
            },{
                "dataType":2, //图文混排     title、start、img   des
                "title":"test2 图文混排",
                "start":new Date(2010,7,24,16,0,0),
                "img":"img/2.jpg",
                "des":"据台湾媒体报道，一名美国囚犯杰瑞米秘克斯因为长得太帅而爆红，还有人将他的帅脸后制在各大知名品牌海报的男模特儿身上，而现在真的有一家模特儿经纪公司想要签下他，可以让他一个月赚进美金1.5到3万元（约9万到18万人民币）。据台湾媒体报道，一名美国囚犯杰瑞米秘克斯（Jeremy Meeks）因为长得太帅而爆红，还有人将他的帅脸后制在各大知名品牌海报的男模特儿身上，而现在真的有一家模特儿经纪公司想要签下他，可以让他一个月赚进美金1.5到3万元（约9万到18万人民币）。名美国囚犯杰瑞米秘克斯因为长得太帅而爆红，还有人将他的帅脸后制在各大知名品牌海报的男模特儿身上，而现在真的有一家模特儿经纪公司想要签下他，可以让他一个月赚进美金1.5到3万元（约9万到18万人民币）。"
            },{
                "dataType":3,  //视频    title、start、videoId
                "title":"test3 视频",
                "start":new Date(2010,7,26),
                "videoId":"01828f54-53fd-423f-91f3-eafc9280870e"
            },{
                "dataType":4 ,    //html内容    title、start、img   des
                "title":"test4 固定html",
                "start":new Date(2010,7,28),
                "htmlContent":'<p>在世界大国当中，中国的国防现代化的路应该说走得还是相当艰难的，大部分的军事装备、研发都要靠自己来做，甚至是从头做起。另外，我们广大官兵的保障还需要不断地加强。但是从根本上来讲，中国的国防政策还是防御性的，这是在宪法当中明确规定的。在这个方向上，在这个原则上，我们不会轻易地改变。我们改革开放这么多年取得了这么大的成就，我们不是靠炮舰开路去开拓经贸的，而是完全去靠互利互惠的合作，甚至是让利的合作。这条道路、和平发展的道路，我们走得是成功的，我们今后会继续坚持走和平发展的道路。谢谢。<span class="ifengLogo"><a href="http://www.ifeng.com/" target="_blank"><img src="http://img.ifeng.com/page/Logo.gif" width="15" height="17"></a></span></p>' 
            }]
    });
```

##参数配置和说明

###主参数
|属性 | 类型 | 默认值| 说明|
|-------|-----|----|-----|
|id|String|"timeline"|组件的外部容器id，默认为timeline，必须为页面的标签的id|
|width | Number | 1000 | 容器宽度 |
|height|Number|800|容器高度|
|skin | String | ""（空字符串） | 皮肤名称，默认为空 |
|show_item_num | Number | 4 | 初始化时，时间轴上面展示的新闻条数 |
|slider_margin_bottom | Number | 50 | 新闻展示区和时间轴的距离 |
|data | Json | 无 | 新闻内容，包含多条数据，其各项参数见下个表说明 |

###data 新闻内容参数说明

|属性 | 类型 | 默认值| 说明|
|-------|-----|----|-----|
|dataType | Number | 无 | 新闻类型，1、图片 2、图文混排  3、视频  4、html内容|
|title | String | 无 | 新闻的标题 |
|start| Date | 无 | 新闻的时间。格式为时间 |
|img | String | 无| 新闻的图片路径。 |
|des | Number | 无 |新闻的简介，为一段文字 |
|videoId | String | 无 | 视频ID |
|htmlContent | String | 无 | 新闻html代码 |



##在线demo或者简单实例
   暂无

##版本更新说明

|版本号 | 更新时间 | 更新说明| 
|-------|-----     |     ----|
|v1.0 | 2014.4.9 |  第一版正式|
|v1.4 | 2014.4.17 |  改为require 方式加载，并优化了一些内容|



