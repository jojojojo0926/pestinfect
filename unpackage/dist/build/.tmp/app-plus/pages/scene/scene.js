(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/scene/scene"],{"015a":function(e,n,t){"use strict";t.r(n);var i=t("8e11"),s=t("70af");for(var a in s)"default"!==a&&function(e){t.d(n,e,function(){return s[e]})}(a);t("b965");var o,c=t("f0c5"),r=Object(c["a"])(s["default"],i["b"],i["c"],!1,null,null,null,!1,i["a"],o);n["default"]=r.exports},"5f62":function(e,n,t){"use strict";(function(e){t("e3a0"),t("921b");i(t("66fd"));var n=i(t("015a"));function i(e){return e&&e.__esModule?e:{default:e}}e(n.default)}).call(this,t("6e42")["createPage"])},"65c7":function(e,n,t){},"70af":function(e,n,t){"use strict";t.r(n);var i=t("9730"),s=t.n(i);for(var a in i)"default"!==a&&function(e){t.d(n,e,function(){return i[e]})}(a);n["default"]=s.a},"8e11":function(e,n,t){"use strict";var i,s=function(){var e=this,n=e.$createElement;e._self._c},a=[];t.d(n,"b",function(){return s}),t.d(n,"c",function(){return a}),t.d(n,"a",function(){return i})},9730:function(e,n,t){"use strict";(function(e,i){Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var s=u(t("a34a")),a=t("1989"),o=u(t("87b8")),c=t("ea30"),r=t("8ceb");function u(e){return e&&e.__esModule?e:{default:e}}function l(e,n,t,i,s,a,o){try{var c=e[a](o),r=c.value}catch(u){return void t(u)}c.done?n(r):Promise.resolve(r).then(i,s)}function f(e){return function(){var n=this,t=arguments;return new Promise(function(i,s){var a=e.apply(n,t);function o(e){l(a,i,s,o,c,"next",e)}function c(e){l(a,i,s,o,c,"throw",e)}o(void 0)})}}var m={data:function(){return{format:"",loading:!1,indexBackgroundImage:o.default,numlist:"",images:[],imagecontent:"",arrlength:"",info:{owner:"",id:"",userid:"",username:"",pinenum:"",imagepine:"",divsnum:"",imagediv:"",division:"",processmode:"'",postscript:"",stumpnum:"",imagestm:"0004"+(0,c.Thistime)(),time:(0,c.formatDate)((new Date).getTime())}}},onLoad:function(n){try{var t=e.getStorageSync("storage_key","scene");t&&(this.info.userid=t.userid,this.info.username=t.username,this.info.id=t.userid,this.info.owner=t.owner)}catch(o){}console.log(i(this.info.username," at pages\\scene\\scene.vue:81"));try{var s=e.getStorageSync("photograph");s&&(this.info.pinenum=s.pinenum,this.info.imagepine=s.imagepine,this.imagecontent=s.imagecontent,this.numlist=s.numlist,this.arrlength=s.arrlength)}catch(o){}try{var a=e.getStorageSync("division");a&&(this.info.divsnum=a.divsnum,this.info.division=a.division,this.info.processmode=a.processmode,this.info.postscript=a.postscript,this.info.imagediv=a.imagediv,this.imagecontent=this.imagecontent.concat(a.imagecontent),this.numlist=this.numlist.concat(a.numlist),this.arrlength=this.arrlength.concat(a.arrlength))}catch(o){}plus.sqlite.executeSql({name:"pineinfect",sql:'create table if not exists Scenetable("id" INT(10),"pinenum" INT(20),"stumpnum" INT(20),"division" INT(3),"divsnum" INT(20),"processmode" INT(1),"imagepine" CHAR(30),"imagediv" CHAR(30),"imagestm" CHAR(30),"userid" INT(10),"username" CHAR(11),"time" INT(20),"postscript" CHAR(50))',success:function(e){console.log(i("打开Scenetable表成功!"," at pages\\scene\\scene.vue:113"))},fail:function(e){console.log(i("打开Scenetable表失败"," at pages\\scene\\scene.vue:116"))}}),plus.sqlite.executeSql({name:"pineinfect",sql:'create table if not exists SceneImagetable("id" INT(10),"imagenum" CHAR(20),"imageorder" CHAR(20),"imagename" CHAR(20),"imageurl" CHAR(30),"imagecontent" CHAR(9999999999),"progress" INT(20),"time" CHAR(30),"userid" INT(10),"owner" INT(10),"houzhui" INT(10))',success:function(e){console.log(i("打开SceneImagetable表成功!"," at pages\\scene\\scene.vue:124"))},fail:function(e){console.log(i("打开SceneImagetable表失败"," at pages\\scene\\scene.vue:127"))}})},methods:{Tomainsql:function(){e.navigateTo({url:"../scenesql/scenesql"})},close:function(e){this.images.splice(e,1)},chooseImg:function(n){var t=this;e.chooseImage({sourceType:["camera"],sizeType:"compressed",count:3-this.images.length,success:function(e){(0,r.pathToBase64)(e.tempFilePaths[0]).then(function(e){var n=e.indexOf("/"),i=e.indexOf(";"),s=e.substr(n+1,i-n-1);t.format=s;var a=e.indexOf(",");t.imagecontent=t.imagecontent.concat(e.substring(a+1,e.length)+";")}).catch(function(e){console.error(i(e," at pages\\scene\\scene.vue:161"))}),t.images=t.images.concat(e.tempFilePaths),t.numlist=t.numlist.concat(t.info.imagestm+",");var n=t.images.length;t.arrlength=t.arrlength.concat(n+",")}})},previewImage:function(){e.previewImage({urls:this.images})},addlocation:function(){var n=this,t=n.imagecontent.split(";");t.pop();for(var s=0;s<t.length;s++){var a=n.numlist.split(","),o=a[s].slice(3,4),c=n.arrlength.split(",");c.pop(),plus.sqlite.executeSql({name:"pineinfect",sql:"insert into SceneImagetable values('"+n.info.id+"','"+a[s]+"','"+c[s]+"','"+s+"."+n.format+"','"+n.imageurl+"','"+t[s]+"','"+o+"','"+n.info.time+"','"+n.info.userid+"','"+n.info.owner+"','"+n.format+"')",success:function(n){console.log(i("添加图片成功!",n," at pages\\scene\\scene.vue:218")),e.showToast({title:"添加图片成功!"})},fail:function(n){console.log(i("添加图片失败!"," at pages\\scene\\scene.vue:224")),e.showToast({icon:"fail",title:"添加图片失败!"})}})}plus.sqlite.executeSql({name:"pineinfect",sql:"insert into Scenetable values('"+n.info.id+"','"+n.info.pinenum+"','"+n.info.stumpnum+"','"+n.info.division+"','"+n.info.divsnum+"','"+n.info.processmode+"','"+n.info.imagepine+"','"+n.info.imagediv+"','"+n.info.imagestm+"','"+n.info.userid+"','"+n.info.username+"','"+n.info.time+"','"+n.info.postscript+"')",success:function(n){console.log(i("添加信息成功!",n," at pages\\scene\\scene.vue:264")),e.showToast({title:"添加信息成功!"})},fail:function(n){e.showToast({icon:"fail",title:"添加信息失败!"})}}),e.showModal({showCancel:!1,title:"提示",content:"存入本地成功!",success:function(n){n.confirm&&e.redirectTo({url:"../startNav/startNav",success:function(){e.redirectTo({url:"../felling/felling"})}})}})},send:function(){console.log(i("1111111111111111"," at pages\\scene\\scene.vue:295"));var n=this;n.loading=!0,e.getNetworkType({success:function(){var t=f(s.default.mark(function t(i){var o,c,r,u,l,f;return s.default.wrap(function(t){while(1)switch(t.prev=t.next){case 0:if("4g"!=i.networkType&&"wifi"!=i.networkType){t.next=38;break}if(!(n.info.stumpnum.length>=10&&n.images.length>0)){t.next=32;break}return e.showLoading({title:"提交中……"}),t.next=5,(0,a.addDeal)(n.info);case 5:if(o=t.sent,setTimeout(function(){e.hideLoading()},15e3),1!==o.data){t.next=27;break}c=n.numlist.split(","),r=n.imagecontent.split(";"),u=n.arrlength.split(","),r.pop(),u.pop(),l=0;case 14:if(!(l<r.length)){t.next=22;break}return f=c[l].slice(3,4),t.next=18,(0,a.addImage)({imagecontent:r[l],imagenum:c[l],imageorder:u[l],imagename:u[l]+"."+n.format,progress:f,time:n.info.time,userid:n.info.userid,id:n.info.id,owner:n.info.owner});case 18:t.sent;case 19:l++,t.next=14;break;case 22:n.loading=!1,e.hideLoading(),e.showModal({showCancel:!1,title:"提示",content:"提交成功!",success:function(n){n.confirm&&e.redirectTo({url:"../startNav/startNav",success:function(){e.redirectTo({url:"../felling/felling"})}})}}),t.next=30;break;case 27:n.loading=!1,e.hideLoading(),e.showModal({showCancel:!1,title:"提示",content:"请求失败，二维码可能重复提交。"});case 30:t.next=36;break;case 32:return n.loading=!1,e.hideLoading(),e.showModal({showCancel:!1,title:"提示",content:"请填写完整或二维码格式不正确！"}),t.abrupt("return");case 36:t.next=41;break;case 38:n.loading=!1,e.hideLoading(),e.showModal({showCancel:!1,title:"提示",content:"没有网络，是否存入本地",success:function(e){n.addlocation()}});case 41:case"end":return t.stop()}},t,this)}));function i(e){return t.apply(this,arguments)}return i}()})},scan1:function(){var n=f(s.default.mark(function n(){var t=this;return s.default.wrap(function(n){while(1)switch(n.prev=n.next){case 0:e.scanCode({success:function(e){var n=e.result.indexOf(",");t.info.stumpnum=-1==n?e.result:e.result.substring(0,n)},fail:function(e){console.log(i(e," at pages\\scene\\scene.vue:415"))}});case 1:case"end":return n.stop()}},n,this)}));function t(){return n.apply(this,arguments)}return t}()}};n.default=m}).call(this,t("6e42")["default"],t("0de9")["default"])},b965:function(e,n,t){"use strict";var i=t("65c7"),s=t.n(i);s.a}},[["5f62","common/runtime","common/vendor"]]]);