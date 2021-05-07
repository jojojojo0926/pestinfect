<template>
	<view>
	</view>
</template>
<script>
export default {
};
</script>

<style>
</style>

<!-- <template>
	<view class="content" :style="{ backgroundImage: `url(${indexBackgroundImage})`, backgroundSize: 'cover' }">
		<view class="feedback-body feedback-uploader">
			<view class="uni-uploader">
				<view class="uni-uploader-head">
					<view style="font-weight: 700; font-size: 35upx; color: red;">点击拍摄 (请拍摄三张图片)</view>
					<view class="uni-uploader-info">{{ images.length }}/3</view>
				</view>
				<view class="uni-uploader-body">
					<view class="uni-uploader__files">
						<block v-for="(image, index) in images" :key="index">
							<view class="uni-uploader__file" style="position: relative;">
								<image class="uni-uploader__img" :src="image" @tap="previewImage"></image>
								<view class="close-view" @click="close(index)">x</view>
							</view>
						</block>
						<view class="uni-uploader__input-box" v-show="images.length < 3"><view class="uni-uploader__input" @tap="chooseImg"></view></view>
					</view>
				</view>
			</view>
		</view>
		<view class="feedback-title"><text @click="scan1" class="saoma">点击扫描二维码</text></view>
		<view class="feedback-title">
			<text class="_text">树桩编号:</text>
			<input class="feedback-input" v-model="check.stumpnum" placeholder="请填写" />
		</view>
		<view class="feedback-title">
			<text class="_text">地点:</text>
			<input class="feedback-input" v-model="check.location" placeholder="请填写" />
		</view>
		<view class="feedback-title">
			<text class="_text">备注:</text>
			<input class="feedback-input" v-model="check.postscript" placeholder="请填写" />
		</view>
		<view class="feedback-title"><text style="color: #fff; font-size: 35upx; font-weight: 600;">是否合格:</text></view>
		<view class="uni-list">
			<radio-group @change="radioChange">
				<label class="uni-list-cell uni-list-cell-pd" v-for="(item, index) in items" :key="item.value">
					<view><radio :value="item.value" /></view>
					<view>{{ item.name }}</view>
				</label>
			</radio-group>
		</view>
		<button class="feedback-submit" @click="send" :loading="loading">提交</button>
		<button class="feedback-submit" @click="Intoexcel">添加到本地</button>
		<button class="feedback-submit" @click="Lookexcel" >发送本地信息</button>
		<button class="feedback-submit" @click="Cleartable">清空存储</button>
	</view>
</template>

<script>
import { addCheck } from '../../common/vmeitime-http/';
import { addImage } from '../../common/vmeitime-http/';
import indexBackgroundImage from '@/static/09.jpg';
import { formatDate, Thistime } from '../../common/dayjs.js';
import { pathToBase64, base64ToPath } from '../../common/image-tools.js';
export default {
	data() {
		return {
			 loading: false,
			owner: '',
			indexBackgroundImage: indexBackgroundImage,
			items: [
				{
					value: '1',
					name: '合格'
				},
				{
					value: '0',
					name: '不合格'
				}
			],
			format: '',
			images: [],
			imagecontent: '',
			imageurl: '',
			check: {
				id: '',
				userid: '',
				username: '',
				stumpnum: '01010101',
				location: '',
				latitude: '',
				longitude: '',
				altitude: '',
				quality: '',
				imagenum: '0008' + Thistime(),
				postscript: '',
				time: formatDate(new Date().getTime()),
				type: ''
			}
		};
	},
	onLoad(option) {
		// 拿到登录返回值 作为参数传入
		try {
			const value = uni.getStorageSync('storage_key');
			if (value) {
				this.check.userid = value.userid;
				this.check.username = value.username;
				this.check.id = value.userid;
				this.owner = value.owner;
			}
		} catch (e) {
			// error
		}
		//获取位置信息
		uni.getLocation({
			type: 'gcj02',
			geocode: true,
			success: res => {
				this.check.latitude = res.latitude;
				this.check.longitude = res.longitude;
				this.check.location = res.address.province + res.address.city + res.address.district;
			}
		});
		//页面一打开就打开数据库
		plus.sqlite.openDatabase({
			name: 'pineinfect',
			path: '_doc/test.db',
			success: function(e) {
				console.log('打开数据库成功!');
				plus.sqlite.executeSql({
					name: 'pineinfect',
					sql:
						'create table if not exists Checktable("id" INT(10),"userid" INT(10),"username" CHAR(11),"stumpnum" INT(20),"location" CHAR(20),"latitude" INT(20),"longitude" INT(20),"altitude" INT(5),"quality" INT(1),"imagenum" CHAR(30),"postscript" CHAR(30),"time" INT(20),"type" INT(1))',
					success: function(e) {
						console.log('打开Check表成功!');
					},
					fail: function(e) {
						console.log('打开Check表失败');
					}
				});
				plus.sqlite.executeSql({
					name: 'pineinfect',
					// sql:'create table if not exists Imagetable("imagecontent" CHAR(2000))',
					sql:
						'create table if not exists Imagetable("id" INT(10),"imagenum" CHAR(20),"imageorder" CHAR(20),"imagename" CHAR(20),"imageurl" CHAR(30),"imagecontent" CHAR(200),"progress" INT(20),"time" CHAR(30),"userid" INT(10),"owner" INT(10))',
					success: function(e) {
						console.log('打开Image表成功!');
					},
					fail: function(e) {
						console.log('打开Image表失败');
					}
				});
			}
		});
	},
	methods: {
		//删除表
		Cleartable() {
			plus.sqlite.selectSql({
				name: 'pineinfect',
				sql: 'DROP TABLE Checktable',
				success: function(data) {
					console.log('删除check表成功');
				},
				fail: function(e) {
					console.log('删除数据表失败');
				}
			});
			plus.sqlite.selectSql({
				name: 'pineinfect',
				sql: 'DROP TABLE Imagetable',
				success: function(data) {
					console.log('删除image表成功');
				},
				fail: function(e) {
					console.log('删除数据表失败');
				}
			});
			plus.sqlite.closeDatabase({
				name: 'pineinfect',
				success: function(e) {
					console.log('关闭数据库成功!');
					uni.showToast({
						title: '清理信息完成!'
					});
				},
				fail: function(e) {
					console.log('closeDatabase failed: ' + JSON.stringify(e));
				}
			});
		},
		// 添加信息
		Intoexcel() {
			uni.showLoading({
				title: '添加中……'
			});
			plus.sqlite.executeSql({
				name: 'pineinfect',
				sql:
					"insert into Checktable values('" +
					this.check.id +
					"','" +
					this.check.userid +
					"','" +
					this.check.username +
					"','" +
					this.check.stumpnum +
					"','" +
					this.check.location +
					"','" +
					this.check.latitude +
					"','" +
					this.check.longitude +
					"','" +
					this.check.altitude +
					"','" +
					this.check.quality +
					"','" +
					this.check.imagenum +
					"','" +
					this.check.postscript +
					"','" +
					this.check.time +
					"','" +
					this.check.type +
					"')",
				success: function(e) {
					console.log('添加信息成功!');
					uni.showToast({
						title: '添加信息成功!'
					});
				},
				fail: function(e) {
					uni.showToast({
						icon:'fail',
						title: '添加信息失败!'
					});
				}
			});
			// let imgs = this.images.map((value, index) => {
			// 	return {
			// 		name: 'imageName' + index,
			// 		uri: value
			// 	};
			// });
			// for (var i = 0; i < imgs.length; i++) {

			// }
			plus.sqlite.executeSql({
				name: 'pineinfect',
				sql:
					"insert into Imagetable values('" +
					this.check.id +
					"','" +
					this.check.imagenum +
					"','" +
					'check' +
					"','" +
					'check.png' +
					"','" +
					this.imageurl +
					"','" +
					this.imageurl +
					"','" +
					8 +
					"','" +
					this.check.time +
					"','" +
					this.check.userid +
					"','" +
					this.owner +
					"')",
				success: function(e) {
					console.log('添加图片成功!');
					uni.showToast({
						title: '添加图片成功!'
					});
				},
				fail: function(e) {
					console.log('添加图片失败!');
					uni.showToast({
						icon:'fail',
						title: '添加图片失败!'
					});
				}
			});
			uni.redirectTo({
				url: '../startNav/startNav',
				success() {
					uni.redirectTo({
						url: '../check/check'
					});
				}
			});
			
		},
		//查询并提交信息
		Lookexcel() {
			uni.showLoading({
				title: '发送中……'
			});
			plus.sqlite.selectSql({
				name: 'pineinfect',
				sql: 'select * from Checktable',
				success:async function(data) {
					for (var i in data) {
						var resCheck = await addCheck(data[i]);
						console.log('信息结果-----------', resCheck);
						// uni.request({
						// 	url: 'http://39.96.82.150/pineinfect/jaxrs/dataservice/addCheck',
						// 	method: 'POST',
						// 	data: data[i]
						// }).then(data => {
						// 	//data为一个数组，数组第一项为错误信息，第二项为返回数据
						// 	var [error, res] = data;
						// 	console.log('-----信息-----', res);
						// 	if (res.statusCode === 200) {
						// 		uni.showToast({
						// 			title: 'OK! --1--'
						// 		});
						// 	}
						// });
					}
				},
				fail: function(e) {
					console.log('selectSql failed: ' + JSON.stringify(e));
				}
			});
			plus.sqlite.selectSql({
				name: 'pineinfect',
				sql: 'select * from Imagetable',
				success: function(data) {
					var Imageurl = [];
					// 第一次循环 循环数据条数
					for (var i = 0; i < data.length; i++) {
						console.log('循环的次数---------' + i + '---------');
						console.log(data[i]);
						Imageurl = data[i].imageurl.split(';');
						Imageurl.pop();
						console.log('图片的张数---------' + Imageurl.length + '---------');
						// console.log(Imageurl);
						Imageurl.reduce((promise, path) => promise.then(res => pathToBase64(path).then(base64 => (res.push(base64), res))), Promise.resolve([]))
							.then(async res => {
								for (var j = 0; j < res.length; j++) {
									var comma = res[j].indexOf(',');
									var Imgcontent = res[j].substring(comma + 1, res[j].length);
									
									let resImage = await addImage({
											id: data[j].id,
											imagenum: data[j].imagenum,
											imageorder: j,
											imagename: j + '.png',
											imagecontent: Imgcontent,
											progress: 8,
											time: data[j].time,
											userid: data[j].userid,
											owner: data[j].owner
										});
									console.log('图片结果-----------', resImage);
									if (res.statusCode === 200) {
										
									}
									
									
									// uni.request({
									// 	url: 'http://39.96.82.150/pineinfect/jaxrs/dataservice/addImage',
									// 	method: 'POST',
									// 	data: {
									// 		id: data[j].id,
									// 		imagenum: data[j].imagenum,
									// 		imageorder: j,
									// 		imagename: j + '.png',
									// 		imagecontent: Imgcontent,
									// 		progress: 8,
									// 		time: data[j].time,
									// 		userid: data[j].userid,
									// 		owner: data[j].owner
									// 	}
									// }).then(data => {
									// 	//data为一个数组，数组第一项为错误信息，第二项为返回数据
									// 	var [error, res] = data;
									// 	console.log('-----图片-----', res);
									// 	if (res.statusCode === 200) {
									// 		uni.showToast({
									// 			title: 'OK! --2--'
									// 		});
									// 	}
									// });
								}
							})
							.catch(error => {
								console.error(error);
							});
					}
				},
				fail: function(e) {
					console.log('selectSql failed: ' + JSON.stringify(e));
				}
			});
			uni.hideLoading()
			uni.showToast({
				title: 'OK! --2--'
			});
		},

		radioChange(evt) {
			this.check.quality = evt.target.value;
			console.log(this.check.quality);
		},
		close(e) {
			this.images.splice(e, 3);
		},
		chooseImg(e) {
			//选择图片
			uni.chooseImage({
				sourceType: ['camera', 'album'],
				// sizeType: 'compressed',
				count: 3,
				success: res => {
					this.imageurl = this.imageurl.concat(res.tempFilePaths + ';');
					//转base64
					pathToBase64(res.tempFilePaths[0])
						.then(base64 => {
							var slash = base64.indexOf('/');
							var semicolon = base64.indexOf(';');
							var str = base64.substr(slash + 1, semicolon - slash - 1);
							this.format = str;

							var comma = base64.indexOf(',');
							this.imagecontent = this.imagecontent.concat(base64.substring(comma + 1, base64.length) + ';');
						})
						.catch(error => {
							console.error(error);
						});
					this.images = this.images.concat(res.tempFilePaths);
				}
			});
		},
		previewImage() {
			//预览图片
			uni.previewImage({
				urls: this.images
			});
		},
		async send() {
			this.loading = true
			uni.showLoading({
				title: '提交中……'
			});
			let resCheck = await addCheck(this.check);
			console.log('信息结果-----------', resCheck);
			let arr = this.imagecontent.split(';');
			arr.pop()
			console.log(arr.length)
			for (var i = 0; i < arr.length; i++) {
				let resImage = await addImage({
					imagecontent: arr[i],
					id: this.check.id,
					imagenum: this.check.imagenum,
					imageorder: i + 1,
					imagename: i + '.png',
					progress: 8,
					time: this.check.time,
					owner: this.owner
				});
				console.log('图片结果-----------', resImage);
			}
			
			uni.redirectTo({
				url: '../startNav/startNav',
				success() {
					uni.redirectTo({
						url: '../check/check',
					});
				}
			});
			uni.showToast({
				icon:'success',
				title:'提交成功!',
				duration:3000
			})
			this.loading = false;
		},
		async scan1() {
			uni.scanCode({
				success: res => {
					var first = res.result.indexOf(',');
					if (first == -1) {
						this.check.stumpnum = res.result;
					} else {
						this.check.stumpnum = res.result.substring(0, first);
					}
				}
			});
		},
		// #ifdef APP-PLUS
		async checkPermission(code) {
			let status = permision.isIOS ? await permision.requestIOS('camera') : await permision.requestAndroid('android.permission.CAMERA');

			if (status === null || status === 1) {
				status = 1;
			} else {
				uni.showModal({
					content: '需要相机权限',
					confirmText: '设置',
					success: function(res) {
						if (res.confirm) {
							permision.gotoAppSetting();
						}
					}
				});
			}
			return status;
		}
		// #endif
	}
};
</script>
<style>
/* 合格 */
.uni-list {
	font-size: 28upx;
	opacity: 0.7;
	border-radius: 30upx;
	background-color: #ffffff;
	position: relative;
	width: 100%;
	display: flex;
	flex-direction: column;
}

.uni-list:after {
	position: absolute;
	z-index: 10;
	right: 0;
	bottom: 0;
	left: 0;
	height: 1px;
	content: '';
	-webkit-transform: scaleY(0.5);
	transform: scaleY(0.5);
	background-color: #c8c7cc;
}

.uni-list::before {
	position: absolute;
	z-index: 10;
	right: 0;
	top: 0;
	left: 0;
	height: 1px;
	content: '';
	-webkit-transform: scaleY(0.5);
	transform: scaleY(0.5);
	background-color: #c8c7cc;
}

.uni-list-cell {
	position: relative;
	display: flex;
	flex-direction: row;
	align-items: center;
}

.uni-list-cell-hover {
	background-color: #eee;
}

.uni-list-cell-pd {
	padding: 22upx 30upx;
}

.uni-list-cell::after {
	position: absolute;
	z-index: 3;
	right: 0;
	bottom: 0;
	left: 30upx;
	height: 1px;
	content: '';
	-webkit-transform: scaleY(0.5);
	transform: scaleY(0.5);
	background-color: #c8c7cc;
}

.feedback-submit {
	background-color: #ff5053;
	font-weight: 700;
	color: #fff;
	margin: 30upx;
	opacity: 0.8;
	border-radius: 50upx;
}

.content {
	height: 2500upx;
}
</style>
 -->