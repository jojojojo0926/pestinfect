<template>
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
						<view class="uni-uploader__input-box" v-show="images.length < 3">
							<view class="uni-uploader__input" @tap="chooseImg"></view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<view class="feedback-title"><text @click="scan1" class="saoma">点击扫描二维码</text></view>
		<view class="feedback-title">
			<text class="_text">树桩编号:</text>
			<input class="feedback-input" v-model="info.stumpnum" placeholder="请扫码获取" disabled="disabled" />
		</view>
		<button @click="send" class="feedback-submit" :loading="loading">提交</button>
		<button @click="addlocation" class="feedback-submit">存储本地</button>
		<button @click="Tolocation" class="feedback-submit">查看本地</button>
	</view>
</template>

<script>
	import {
		addDeal,
		addImage
	} from '../../common/vmeitime-http/';
	import indexBackgroundImage from '@/static/012.jpg';
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
				format: '',
				loading: false,
				indexBackgroundImage: indexBackgroundImage,
				numlist: '', //接受图片编号的容器  即imagenum
				images: [],
				aImg: [],
				imagecontent: '',
				arrlength: '', //接受图片序号容器 即imageorder
				info: {
					lat: '', //纬度
					longit: '', //经度
					altit: '', //高度

					owner: '',
					id: '',
					userid: '',
					username: '',

					pinenum: '', //疫木编号
					imagepine: '', //采伐登记图片的编号

					divsnum: '', //分段编号
					imagediv: '', //分段图片的编号
					division: '', //分段数
					processmode: "'", //处理方式
					postscript: '', //备注

					stumpnum: '', //树桩编号
					imagestm: '', //树桩图片的编号
					time: formatDate(new Date().getTime())
				}
			};
		},
		onLoad(opacity) {

			uni.getLocation({
				type: 'gcj02',
				altitude: true,
				success: res => {
					this.info.longit = res.longitude;
					this.info.lat = res.latitude;
					this.info.altit = res.altitude;
				}
			});

			//获取登录页的数据
			try {
				const value = uni.getStorageSync('storage_key', 'scene');
				if (value) {
					this.info.userid = value.userid;
					this.info.username = value.username;
					this.info.id = value.userid;
					this.info.owner = value.owner;

					if (value.userid.length == 1) {
						this.info.imagestm = '000' + value.userid + '4' + Thistime()
					} else if (value.userid.length == 2) {
						this.info.imagestm = '00' + value.userid + '4' + Thistime()
					} else if (value.userid.length == 3) {
						this.info.imagestm = '0' + value.userid + '4' + Thistime()
					} else {
						this.info.imagestm = value.userid + '4' + Thistime()
					}
				}
			} catch (e) {}
			//获取登记拍照的数据
			try {
				const value = uni.getStorageSync('photograph');
				if (value) {
					this.info.pinenum = value.pinenum; //疫木编号
					this.info.imagepine = value.imagepine; //采伐登记图片的编号
					this.imagecontent = value.imagecontent; //采伐登记图片的编号
					this.numlist = value.numlist; //采伐登记图片的编号
					this.arrlength = value.arrlength; //图片顺序编号
				}
			} catch (e) {}
			//获取分割编号的数据
			try {
				const value = uni.getStorageSync('division');
				if (value) {
					this.info.divsnum = value.divsnum;
					this.info.division = value.division;
					this.info.processmode = value.processmode;
					this.info.postscript = value.postscript;
					this.info.imagediv = value.imagediv;
					this.imagecontent = this.imagecontent.concat(value.imagecontent);
					this.numlist = this.numlist.concat(value.numlist); //图片编号拼接
					this.arrlength = this.arrlength.concat(value.arrlength); //图片顺序编号拼接
				}
			} catch (e) {}
			//打开数据库 打开数据表 创建数据表
			plus.sqlite.executeSql({
				name: 'pineinfect',
				sql: 'create table if not exists Scenetable("pinenum" varchar(20),"stumpnum" varchar(20),"division" INT(3),"divsnum" varchar(20),"processmode" INT(1),"imagepine" CHAR(30),"imagediv" CHAR(30),"imagestm" CHAR(30),"userid" INT(10),"username" CHAR(11),"time" datetime,"postscript" varchar(60))',
				success: function(e) {
					console.log('打开Scenetable表成功!');
				},
				fail: function(e) {
					console.log('打开Scenetable表失败');
				}
			});
			plus.sqlite.executeSql({
				name: 'pineinfect',
				sql: 'create table if not exists SceneImagetable("imagenum" varchar(20),"imageorder" INT(4),"imagename" varchar(50),"imageurl" varchar(30),"imagecontent" varchar(999),"progress" INT(4),"time" datetime,"userid" INT(10),"owner" INT(10))',
				success: function(e) {
					console.log('打开SceneImagetable表成功!');
				},
				fail: function(e) {
					console.log('打开SceneImagetable表失败');
				}
			});
		},
		methods: {
			Tolocation() {
				uni.navigateTo({
					url: '../scenesql/scenesql'
				});
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
						this.imagecontent.push(res.tempFilePaths[0]);
						//this.format = res.tempFilePaths[0].substring(res.tempFilePaths[0].length-4);
						this.images = this.images.concat(res.tempFilePaths); //

						// pathToBase64(res.tempFilePaths[0])
						// 	.then(base64 => {
						// 		var comma = base64.indexOf(',');
						// 		this.imagecontent = this.imagecontent.concat(base64.substring(comma + 1, base64.length) + ';');
						// 		// console.log(this.imagecontent)
						// 	})
						// 	.catch(error => {
						// 		console.error(error);
						// 	});


						//图片编号拼接
						this.numlist = this.numlist.concat(this.info.imagestm + ',');


						//图片顺序号拼接
						var Length = this.images.length;
						this.arrlength = this.arrlength.concat(Length + ',');
						console.log(this.arrlength)
						console.log(this.numlist)
						console.log(this.imagecontent)
					}
				});
			},
			//预览图片
			previewImage() {
				//预览图片
				uni.previewImage({
					urls: this.images,
				});
			},
			addlocation() {

				if (this.info.stumpnum != '' && this.images.length > 0) {
					var that = this
					let arr = that.imagecontent; //将图片转换成数组
					for (let i = 0; i < arr.length; i++) {
						let unmlists = that.numlist.split(','); //将图片编号转换成数组
						unmlists.pop();
						let _progress = unmlists[i].slice(3, 4);
						let arrlength = that.arrlength.split(','); //将图片顺序编号转换成数组
						arrlength.pop();
						plus.sqlite.executeSql({
							name: 'pineinfect',
							sql: "insert into SceneImagetable values('" +
								unmlists[i] +
								"','" +
								arrlength[i] +
								"','" +
								i + '.jpg' +
								"','" +
								arr[i] +
								"','" +
								arr[i] +
								"','" +
								_progress +
								"','" +
								that.info.time +
								"','" +
								that.info.userid +
								"','" +
								that.info.owner +
								"')",
							success: function(e) {
								console.log('添加图片成功!', e);
								uni.showToast({
									title: '添加图片成功!'
								});
							},
							fail: function(e) {
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
						sql: "insert into Scenetable values('" +
							that.info.pinenum +
							"','" +
							that.info.stumpnum +
							"','" +
							that.info.division +
							"','" +
							that.info.divsnum +
							"','" +
							that.info.processmode +
							"','" +
							that.info.imagepine +
							"','" +
							that.info.imagediv +
							"','" +
							that.info.imagestm +
							"','" +
							that.info.userid +
							"','" +
							that.info.username +
							"','" +
							that.info.time +
							"','" +
							that.info.postscript +
							"')",
						success: function(e) {
							console.log('添加信息成功!', e);
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
											url: '../felling/felling'
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


			},
			send() {
				var that = this;
				that.loading = true;
				// 发送信息 
				uni.getNetworkType({
					success: async function(res) {
						//判断 如果网络状态不是 none 就发送信息
						if (res.networkType == '4g' || res.networkType == 'wifi') {
							// 判断如果编号不是空 就发送请求
							if (that.info.stumpnum.length >= 10 && that.images.length > 0) {
								console.log('1111111111')
								//发送添加信息请求
								uni.showLoading({
									title: '提交中……'
								});
								let resDeal = await addDeal(that.info);
								setTimeout(function() {
									uni.hideLoading();
								}, 30000);
								// 判断 如果状态吗返回200 即说明发送信息ok
								if (resDeal.data === 1) {
									//判断图片数组的长度 如果大于0 调接口发送
									let unmlists = that.numlist.split(','); //将图片编号转换成数组
									let arr = that.imagecontent; //将图片转换成数组
									let arrlength = that.arrlength.split(','); //将图片顺序编号转换成数组
									arrlength.pop();
									for (var i = 0; i < arr.length; i++) {
										let _progress = unmlists[i].slice(4, 5);
										console.log(_progress)
										await pathToBase64(arr[i]).then(base64 => {
											let comma = base64.indexOf(',');
											let newarr = base64.substring(comma + 1, base64.length);
											that.aImg.push(newarr);
										});

										let resImage = await addImage({
											imagecontent: that.aImg[i],
											imagenum: unmlists[i],
											imageorder: arrlength[i],
											imagename: arrlength[i] + '.jpg',
											progress: _progress,
											time: that.info.time,
											userid: that.info.userid,
											id: that.info.id,
											owner: that.info.owner
										});
										console.log(resImage.data)
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
															url: '../felling/felling'
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
									content: '请填写完整或二维码格式不正确！'
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
			//扫码
			async scan1() {
				uni.scanCode({
					success: res => {
						var first = res.result.indexOf(',');
						if (first == -1) {
							this.info.stumpnum = res.result;
						} else {
							this.info.stumpnum = res.result.substring(0, first);
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
		height: 1500upx;
	}

	.feedback-submit {
		background-color: #ff5053;
		font-weight: 700;
		color: #fff;
		margin: 30upx;
		opacity: 0.8;
		border-radius: 50upx;
	}
</style>
