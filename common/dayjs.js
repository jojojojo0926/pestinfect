export function formatDate(time, format = 'YY-MM-DD hh:mm:ss') {
 	var date = new Date(time);

 	var year = date.getFullYear(),
 		month = date.getMonth() + 1, //月份是从0开始的
 		day = date.getDate(),
 		hour = date.getHours(),
 		min = date.getMinutes(),
 		sec = date.getSeconds();
 	var preArr = Array.apply(null, Array(10)).map(function(elem, index) {
 		return '0' + index;
 	}); ////开个长度为10的数组 格式为 00 01 02 03

 	var newTime = format.replace(/YY/g, year)
 		.replace(/MM/g, preArr[month] || month)
 		.replace(/DD/g, preArr[day] || day)
 		.replace(/hh/g, preArr[hour] || hour)
 		.replace(/mm/g, preArr[min] || min)
 		.replace(/ss/g, preArr[sec] || sec);

 	return newTime;
 }

export function Thistime() {
 	var myDate = new Date(); //获取的是本机时间
 	var month = myDate.getMonth() + 1;
 	var newMonth = month > 9 ? month : "0" + month; //月
 	var day = myDate.getDate();
 	var newday = day > 9 ? day : "0" + day; //日
 	var hours = myDate.getHours();
 	var newhours = hours > 9 ? hours : "0" + hours; //时
 	var minutes = myDate.getMinutes();
 	var newMinutes = minutes > 9 ? minutes : "0" + minutes; //分
 	var seconds = myDate.getSeconds();
 	var newseconds = seconds > 9 ? seconds : "0" + seconds; //秒
 	var Thistime = myDate.getFullYear() + '' + newMonth + '' + newday + '' + newhours + '' + newMinutes + '' + newseconds
	
	return Thistime
 }
