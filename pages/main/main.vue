<template>
	<view class="content" :style="{ backgroundImage: `url(${indexBackgroundImage})`, backgroundSize: 'cover' }">
		<button style="margin: 30upx;" @click="getlocation">点击获取当前位置</button>
		<button style="margin: 30upx;" @click="Notnetwork">获取GPS</button>
		<view class="feedback-title">
			<text class="_text ">经度:</text>
			<input class="getlocation" disabled="disabled" :value="Pine.longitude" />
		</view>
		<view class="feedback-title">
			<text class="_text ">纬度:</text>
			<input class="getlocation" disabled="disabled" :value="Pine.latitude" />
		</view>
		<view class="feedback-title">
			<text class="_text ">备注2:</text>
			<input class="getlocation" v-model="beizhu2" />
		</view>
		
		<!-- <view style="background-color: #555555;">
			<view class="uni-textarea">
				<textarea :value="aaa"  auto-height  disabled/>
			</view>
		</view> -->

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
						<view class="uni-uploader__input-box" v-show="images.length < 3">
							<view class="uni-uploader__input" @tap="chooseImg"></view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="feedback-title">
			<text @click="scan()" style="margin-left: 29%; font-weight:600; color: red; background-color: #E0FFFF; padding: 10upx; border-radius: 20upx; opacity: 0.7;">
				点击扫描二维码
			</text>
		</view>
		<view class="feedback-title">
			<text class="_text">分段编号:</text>
			<input class="feedback-input" v-model="Pine.pinenum" placeholder="点击扫描二维码" disabled="disabled" />
		</view>
		<view class="feedback-title">
			<text class="_text">胸径(cm):</text>
			<input class="feedback-input" v-model="Pine.dhb" type='number' placeholder="请填写" @blur="Dhb" />
		</view>
		<view class="feedback-title">
			<text class="_text">树高(m)</text>
			<input class="feedback-input" v-model="Pine.height" type='number' placeholder="请填写" />
		</view>
		<view class="feedback-title">
			<text class="_text">备注:</text>
			<input class="feedback-input" v-model="Pine.postscript" placeholder="请填写" />
		</view>
		<view class="feedback-title">
			<text class="_text">小班号:</text>
			<input class="feedback-input" v-model="Pine.classnum" placeholder="请填写" />
		</view>
		<view class="feedback-title">
			<text class="_text">调查员名:</text>
			<input class="feedback-input" disabled="disabled" v-model="Pine.username" placeholder="请填写" />
		</view>
		<button type="warn" class="feedback-submit" @click="send" :loading="loading">提交</button>
		<button type="warn" class="feedback-submit" @click="addlocation">存储本地</button>
		<button type="warn" class="feedback-submit" @click="Tomainsql">查看本地</button>
		<button type="warn" class="feedback-submit" @click="Toresearchday">查看日调查统计</button>
		
	</view>
</template>

<script>
	import {
		addPine,
		addImage
	} from '../../common/vmeitime-http/';
	import indexBackgroundImage from '@/static/09.jpg';
	import {
		formatDate,
		Thistime
	} from '../../common/dayjs.js';
	import {
		pathToBase64
	} from '../../common/image-tools.js';
	export default {
		data() {
			return {
				aaa:'',
				timer: null,
				loading: false,
				format: '',
				indexBackgroundImage: indexBackgroundImage,
				images: [],
				storageArr: [],
				imagecontent: '',
				ImgUrl: [],
				beizhu2: '',
				Pine: {
					height: '', //树高
					dhb: '', //胸径
					circumference: '', //周长
					postscript: '', //备注
					latitude: '', //纬度
					longitude: '', // 经度
					altitude: '', //海拔
					pinenum: '', //编号
					username: '', //调查员姓名
					userid: '', //调查员ID
					owner: '',
					classnum: '', //小班号
					id: '',
					done: 0, //是否处理
					time: formatDate(new Date().getTime()),
					imagenum: '' //图片编号
				}
			};
		},
		onLoad(opacity) {
			// '0001' + Thistime() 
			try {
				const value = uni.getStorageSync('storage_key');
				if (value) {
					this.Pine.userid = value.userid;
					this.Pine.classnum = value.classnum;
					this.Pine.username = value.username;
					this.Pine.owner = value.owner;
					this.Pine.id = value.userid;
				}
			} catch (e) {
				// error
			}
			//打开数据库 打开数据表 创建数据表
			plus.sqlite.executeSql({
				name: 'pineinfect',
				sql: 'create table if not exists Researchtable("pinenum" varchar(20),"latitude" double,"longitude" double,"altitude" double,"height" float(6,2),"dhb" float(6,2),"circumference" float(6,2),"done" INT(2),"userid" INT(11),"username" CHAR(11),"owner" int(10),"classnum" varchar(30),"time" datetime,"imagenum" varchar(20),"postscript" varchar(60))',
				success: function(e) {
					console.log('打开main表成功!');
				},
				fail: function(e) {
					console.log('打开main表失败');
					console.log(e);
				}
			});
			plus.sqlite.executeSql({
				name: 'pineinfect',
				sql: 'create table if not exists Imagetable("imagenum" varchar(20),"imageorder" INT(4),"imagename" varchar(50),"imageurl" varchar(30),"imagecontent" varchar(999),"progress" INT(4),"time" datetime,"userid" INT(10),"owner" INT(10))',
				success: function(e) {
					console.log('打开Image表成功!');
				},
				fail: function(e) {
					console.log('打开Image表失败');
					console.log(e);
				}
			});
		},
		methods: {

			Notnetwork() {

				var that = this;
				uni.showLoading({
					title: '获取中'
				});
				plus.geolocation.getCurrentPosition(function(p) {
					uni.hideLoading(); 
					uni.showToast({
					    title: '获取成功！',
					    duration: 1000
					});
					console.log(p)
					// that.aaa = JSON.stringify(p)
					that.Pine.latitude = p.coords.latitude;
					that.Pine.longitude = p.coords.longitude;
				}, function (e) {
					console.log(e)
					uni.hideLoading(); 
					uni.showToast({
					    title: '获取失败！',
						icon:'none',
					    duration: 1000
					});
					uni.hideToast()
				},{enableHighAccuracy:'true',timeout:10000});

				// uni.showLoading({
				// 	title: '加载中'
				// });
				// var latitudeArr = []
				// var longitudeArr = []
				// that.timer = setInterval(() => {
				// 	plus.geolocation.getCurrentPosition(function(p) {
				// 		console.log(p.coords.latitude, p.coords.longitude);
				// 		latitudeArr.push(p.coords.latitude)
				// 		longitudeArr.push(p.coords.longitude)
				// 	}, function(e) {
				// 		console.log(e)
				// 		uni.hideLoading();
				// 		uni.showToast({
				// 			title: '获取失败',
				// 			duration: 1
				// 		});
				// 		uni.hideToast()
				// 	});
				// }, 9)
				// var res = setTimeout(() => {
				// 	console.log('停止定时器')
				// 	clearInterval(that.timer);
				// 	uni.hideLoading();
				// 	uni.hideToast()
				// 	that.timer = null;
				// 	var aa = eval(latitudeArr.join("+")) / latitudeArr.length
				// 	var bb = eval(longitudeArr.join("+")) / longitudeArr.length
				// 	that.Pine.latitude = aa
				// 	that.Pine.longitude = bb
				// 	console.log(aa)
				// 	console.log(bb)
				// 	clearTimeout(res);
				// }, 10000)




				// 
				// var that = this; 
				// uni.getLocation({
				// 	type:'gcj02',
				// 	success: function(res) {
				// 		console.log(res);
				// 		that.Pine.latitude = res.latitude.toFixed(6);
				// 		that.Pine.longitude = res.longitude.toFixed(6);
				// 	}
				// });
			},
			//本地查看跳转
			Tomainsql() {
				uni.navigateTo({
					url: '../mainsql/mainsql'
				});
			},
			Toresearchday() {
				//console.log(this.ImgUrl);
				uni.navigateTo({
					url: '../researchday/researchday'
				});
			},
			//获取地点
			getlocation() {
				uni.chooseLocation({
					success: res => {
						console.log(res);
						this.Pine.latitude = res.latitude.toFixed(6);
						this.Pine.longitude = res.longitude.toFixed(6);
						this.Pine.altitude = res.address; //位置
					}
				});
			},
			//获取周长
			Dhb() {
				this.Pine.circumference = this.Pine.dhb * 3.14;
				console.log(this.Pine.circumference);
			},
			// 删除图片
			close(e) {
				this.images.splice(e, 1);
			},
			//选择图片
			chooseImg(e) {
				uni.chooseImage({
					sourceType: ['camera'],
					sizeType: 'compressed',
					count: 3 - this.images.length,
					success: res => {
						uni.saveImageToPhotosAlbum({
							filePath: res.tempFilePaths[0],
							success: function() {
								console.log('save success');
							}
						});
						uni.compressImage({
							src: res.tempFilePaths[0],
							quality: 10,
							success: res => {
								this.ImgUrl.push(res.tempFilePath);
							}
						})


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
			//预览图片
			previewImage() {
				uni.previewImage({
					urls: this.images
				});
			},
			//添加进本地
			addlocation() {
				
				if( this.Pine.pinenum != ''  && this.images.length > 0){
					var that = this;
					if (that.Pine.userid.length == 1) {
						that.Pine.imagenum = '000' + that.Pine.userid + '1' + Thistime()
						console.log(that.Pine.imagenum)
					} else if (that.Pine.userid.length == 2) {
						that.Pine.imagenum = '00' + that.Pine.userid + '1' + Thistime()
						console.log(that.Pine.imagenum)
					} else if (that.Pine.userid.length == 3) {
						that.Pine.imagenum = '0' + that.Pine.userid + '1' + Thistime()
						console.log(that.Pine.imagenum)
					} else {
						that.Pine.imagenum = that.Pine.userid + '1' + Thistime()
						console.log(that.Pine.imagenum)
					}
					
					that.Pine.postscript = that.Pine.postscript.concat('奥维经纬度：' + that.beizhu2)
					console.log(that.Pine.postscript)
					//如果编号的长度等于
					if (that.Pine.pinenum.length >= 10 && that.images.length > 0) {
						for (var i = 0; i < that.ImgUrl.length; i++) {
							plus.sqlite.executeSql({
								name: 'pineinfect',
								sql: "insert into Imagetable values('" +
									that.Pine.imagenum +
									"','" +
									i +
									"','" +
									i + '.jpg' +
									"','" +
									that.ImgUrl[i] +
									"','" +
									that.ImgUrl[i] +
									"','" +
									1 +
									"','" +
									that.Pine.time +
									"','" +
									that.Pine.userid +
									"','" +
									that.Pine.owner +
									"')",
								success: function(e) {
									console.log('添加图片成功!');
									uni.showToast({
										title: '添加图片成功!'
									});
								},
								fail: function(e) {
									console.log(e);
									console.log('添加图片失败!');
									uni.showToast({
										icon: 'fail',
										title: '添加图片失败!'
									});
								}
							});
						}
						plus.sqlite.executeSql({
							name: 'pineinfect',
							sql: "insert into Researchtable values('" +
								that.Pine.pinenum +
								"','" +
								that.Pine.latitude +
								"','" +
								that.Pine.longitude +
								"','" +
								that.Pine.altitude +
								"','" +
								that.Pine.height +
								"','" +
								that.Pine.dhb +
								"','" +
								that.Pine.circumference +
								"','" +
								that.Pine.done +
								"','" +
								that.Pine.userid +
								"','" +
								that.Pine.username +
								"','" +
								that.Pine.owner +
								"','" +
								that.Pine.classnum +
								"','" +
								that.Pine.time +
								"','" +
								that.Pine.imagenum +
								"','" +
								that.Pine.postscript +
								"')",
							success: function(e) {
								console.log('添加信息成功!');
								uni.showToast({
									title: '添加信息成功!'
								});
							},
							fail: function(e) {
								uni.showToast({
									icon: 'fail',
									title: '添加信息失败!'
								});
							}
						});
						uni.showModal({
							showCancel: false,
							title: '提示',
							content: '存入本地成功!',
							success: res => {
								if (res.confirm) {
									uni.redirectTo({
										url: '../startNav/startNav',
										success() {
											uni.redirectTo({
												url: '../main/main'
											});
										}
									});
								}
							}
						});
					} else {
						uni.showModal({
							title: '提示',
							content: '信息填写不完整'
						});
					}
				} else {
						uni.showModal({
							title: '提示',
							content: '信息填写不完整'
						});
				}
				
			},
			//发送请求
			send() {
				var that = this;

				if (that.Pine.userid.length == 1) {
					that.Pine.imagenum = '000' + that.Pine.userid + '1' + Thistime()
					console.log(that.Pine.imagenum)
				} else if (that.Pine.userid.length == 2) {
					that.Pine.imagenum = '00' + that.Pine.userid + '1' + Thistime()
					console.log(that.Pine.imagenum)
				} else if (that.Pine.userid.length == 3) {
					that.Pine.imagenum = '0' + that.Pine.userid + '1' + Thistime()
					console.log(that.Pine.imagenum)
				} else {
					that.Pine.imagenum = that.Pine.userid + '1' + Thistime()
					console.log(that.Pine.imagenum)
				}

				that.loading = true;
				that.Pine.postscript = that.Pine.postscript.concat(';奥维经纬度：' + that.beizhu2)
				console.log(that.Pine.postscript)
				//监听网络状态变化
				uni.getNetworkType({
					success: async function(res) {
						//判断 如果网络状态不是 none 就发送信息
						if (res.networkType == '4g' || res.networkType == 'wifi' || res.networkType == '5g') {
							// 判断如果编号不是空 就发送请求
							if (that.Pine.pinenum.length >= 10 && that.images.length > 0) {
								//发送添加信息请求
								uni.showLoading({
									title: '提交中……'
								});

								let resPine = await addPine(that.Pine);

								setTimeout(function() {
									uni.hideLoading();
									that.loading = false;
								}, 15000);
								// 判断 如果状态吗返回200 即说明发送信息ok
								//判断图片数组的长度 如果大于0 调接口发送
								if (resPine.data === 1) {
									let arr = that.imagecontent.split(';');
									arr.pop();
									for (var i = 0; i < arr.length; i++) {
										let resImage = await addImage({
											imagecontent: arr[i],
											id: that.Pine.id,
											imagenum: that.Pine.imagenum,
											imageorder: i + 1,
											imagename: i + '.' + that.format,
											progress: 1,
											imageurl: '',
											time: that.Pine.time,
											userid: that.Pine.userid,
											owner: that.Pine.owner
										});
									}
									that.loading = false;
									uni.hideLoading();
									uni.showModal({
										showCancel: false,
										title: '提示',
										content: '提交成功!',
										success: res => {
											if (res.confirm) {
												uni.redirectTo({
													url: '../startNav/startNav',
													success() {
														uni.redirectTo({
															url: '../main/main'
														});
													}
												});
											}
										}
									});
								} else {
									that.loading = false;
									uni.hideLoading();
									uni.showModal({
										showCancel: false,
										title: '提示',
										content: '请求失败，二维码可能重复提交。'
									});
								}
							} else {
								that.loading = false;
								uni.hideLoading();
								uni.showModal({
									showCancel: false,
									title: '提示',
									content: '信息填写不完整或编号格式不正确'
								});
								return;
							}
						} else {
							that.loading = false;
							uni.hideLoading();
							uni.showModal({
								showCancel: false,
								title: '提示',
								content: '没有网络，是否存入本地',
								success: function(res) {
									that.addlocation();
								}
							});
						}
					}
				});
			},

			// 扫码
			async scan() {
				uni.scanCode({
					success: res => {
						var first = res.result.indexOf(',');
						if (first == -1) {
							this.Pine.pinenum = res.result;
						} else {
							this.Pine.pinenum = res.result.substring(0, first);
						}
					},
					fail: err => {
						console.log(err);
					}
				});
			}
		}
	};
</script>

<style>
	.content {
		height: 100%;
	}
</style>
