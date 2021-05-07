(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["components/t-table/t-th"],{"0e4b":function(t,e,n){"use strict";var r=n("bc23"),i=n.n(r);i.a},6275:function(t,e,n){"use strict";var r,i=function(){var t=this,e=t.$createElement;t._self._c},c=[];n.d(e,"b",function(){return i}),n.d(e,"c",function(){return c}),n.d(e,"a",function(){return r})},"99ec":function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var r={props:{align:String},data:function(){return{thBorder:"1",borderColor:"#d0dee5",fontSize:"15",color:"#3b4246",thAlign:"center"}},inject:["table","tr"],created:function(){this.thBorder=this.table.border,this.borderColor=this.table.borderColor,this.fontSize=this.tr.fontSize,this.color=this.tr.color,this.align?this.thAlign=this.align:this.thAlign=this.tr.align},computed:{thAlignCpd:function(){var t="";switch(this.thAlign){case"left":t="flex-start";break;case"center":t="center";break;case"right":t="flex-end";break;default:t="center";break}return t}}};e.default=r},"9cd1":function(t,e,n){"use strict";n.r(e);var r=n("99ec"),i=n.n(r);for(var c in r)"default"!==c&&function(t){n.d(e,t,function(){return r[t]})}(c);e["default"]=i.a},bc23:function(t,e,n){},c3a0:function(t,e,n){"use strict";n.r(e);var r=n("6275"),i=n("9cd1");for(var c in i)"default"!==c&&function(t){n.d(e,t,function(){return i[t]})}(c);n("0e4b");var o,a=n("f0c5"),l=Object(a["a"])(i["default"],r["b"],r["c"],!1,null,null,null,!1,r["a"],o);e["default"]=l.exports}}]);
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'components/t-table/t-th-create-component',
    {
        'components/t-table/t-th-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('6e42')['createComponent'](__webpack_require__("c3a0"))
        })
    },
    [['components/t-table/t-th-create-component']]
]);
