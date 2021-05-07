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
		<view class="feedback-title">
			<text @click="scan()" style="margin-left: 29%; font-weight:600; color: red; background-color: #E0FFFF; padding: 10upx; border-radius: 20upx; opacity: 0.7;">
				点击扫描二维码
			</text>
		</view>
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
					<view>
						<radio :value="item.value" />
					</view>
					<view>{{ item.name }}</view>
				</label>
			</radio-group>
		</view>
		<button class="feedback-submit" @click="send" :loading="loading">提交</button>
<!-- 		<button class="feedback-submit" @click="addlocation">存储本地</button>
		<button class="feedback-submit" @click="Inchecksql">本地查看</button> -->
	</view>
</template>

<script>
	import {
		addCheck,
		addImage
	} from '../../common/vmeitime-http/';
	import indexBackgroundImage from '@/static/09.jpg';
	import {
		formatDate,
		Thistime
	} from '../../common/dayjs.js';
	import {
		pathToBase64,
		base64ToPath
	} from '../../common/image-tools.js';
	export default {
		data() {
			return {
				yimubian: '',
				kanfaren: '',
				kanfabei: '',
				kanfashi: '',
				diaocharen: '',
				diaochashi: '',
				diaochabei: '',
				diaochaban: '',
				shigao: '',
				xiongjing: '',
				loading: false,
				format: '',
				owner: '',
				indexBackgroundImage: indexBackgroundImage,
				items: [{
						value: '1',
						name: '合格'
					},
					{
						value: '0',
						name: '不合格'
					}
				],
				images: [],
				imagecontent: '',
				imageurl: '',
				check: {
					id: '',
					userid: '',
					username: '',
					stumpnum: '',
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
		created() {
			//获取位置信息
			uni.getLocation({
				// type: 'gcj02',
				geocode: true,
				success: res => {
					console.log(res)
					this.check.latitude = res.latitude;
					this.check.longitude = res.longitude;
					this.check.location = res.address.province + res.address.city + res.address.district;
				}
			});
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



			//页面一打开就打开数据库
			plus.sqlite.executeSql({
				name: 'pineinfect',
				sql: 'create table if not exists Checktable("id" INT(10),"userid" INT(10),"username" CHAR(11),"stumpnum" INT(20),"location" CHAR(20),"latitude" INT(20),"longitude" INT(20),"altitude" INT(5),"quality" INT(1),"imagenum" CHAR(30),"postscript" CHAR(30),"time" INT(20),"type" INT(1))',
				success: function(e) {
					console.log('打开Check表成功!');
				},
				fail: function(e) {
					console.log('打开Check表失败');
				}
			});
			plus.sqlite.executeSql({
				name: 'pineinfect',
				sql: 'create table if not exists Imagetable("id" INT(10),"imagenum" CHAR(20),"imageorder" CHAR(20),"imagename" CHAR(20),"imageurl" CHAR(30),"imagecontent" CHAR(99999999),"progress" INT(20),"time" CHAR(30),"userid" INT(10),"owner" INT(10),"houzhui" INT(10))',
				success: function(e) {
					console.log('打开Image表成功!');
				},
				fail: function(e) {
					console.log('打开Image表失败');
				}
			});
		},
		methods: {
			Inchecksql() {
				uni.navigateTo({
					url: '../checksql/checksql'
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
					sourceType: ['camera'],
					sizeType: 'compressed',
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
			//预览图片
			previewImage() {
				uni.previewImage({
					urls: this.images
				});
			},
			addlocation() {
				var that = this;
				if (that.check.stumpnum.length >= 10 && that.images.length > 0) {
					plus.sqlite.executeSql({
						name: 'pineinfect',
						sql: "insert into Imagetable values('" +
							that.check.id +
							"','" +
							that.check.imagenum +
							"','" +
							'check' +
							"','" +
							'check.png' +
							"','" +
							that.imageurl +
							"','" +
							that.imagecontent +
							"','" +
							8 +
							"','" +
							that.check.time +
							"','" +
							that.check.userid +
							"','" +
							that.owner +
							"','" +
							that.format +
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
								icon: 'fail',
								title: '添加图片失败!'
							});
						}
					});
					plus.sqlite.executeSql({
						name: 'pineinfect',
						sql: "insert into Checktable values('" +
							that.check.id +
							"','" +
							that.check.userid +
							"','" +
							that.check.username +
							"','" +
							that.check.stumpnum +
							"','" +
							that.check.location +
							"','" +
							that.check.latitude +
							"','" +
							that.check.longitude +
							"','" +
							that.check.altitude +
							"','" +
							that.check.quality +
							"','" +
							that.check.imagenum +
							"','" +
							that.check.postscript +
							"','" +
							that.check.time +
							"','" +
							that.check.type +
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
						title: '提示',
						content: '存入本地成功!',
						success: res => {
							if (res.confirm) {
								uni.redirectTo({
									url: '../startNav/startNav',
									success() {
										uni.redirectTo({
											url: '../check/check'
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
			//发送请求
			send() {
				console.log(1);
				var that = this;
				that.loading = true;
				uni.getNetworkType({
					success: async function(res) {
						console.log(res);
						//判断网络状态 如果不是 none 发送请求
						if (res.networkType == '4g' || res.networkType == 'wifi') {
							// 判断如果编号不是空 就发送请求
							if (that.check.stumpnum.length >= 10 && that.images.length > 0) {
								uni.showLoading({
									title: '提交中……'
								});
								let resCheck = await addCheck(that.check);

								setTimeout(function() {
									uni.hideLoading();
									that.loading = false;
								}, 15000);
								if (resCheck.data === 1) {
									let arr = that.imagecontent.split(';');
									arr.pop();
									for (var i = 0; i < arr.length; i++) {
										let resImage = await addImage({
											imagecontent: arr[i],
											id: that.check.id,
											imagenum: that.check.imagenum,
											imageorder: i + 1,
											imagename: i + '.' + that.format,
											progress: 8,
											time: that.check.time,
											owner: that.owner
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
															url: '../check/check'
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
									content: '信息不完整或编号格式不正确'
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
			scan() {
				var that = this;
				uni.scanCode({
					success: async res => {
						console.log(res);
						var first = res.result.indexOf(',');
						if (first == -1) {
							that.check.stumpnum = res.result;
						} else {
							that.check.stumpnum = res.result.substring(0, first);
						}

						return new Promise((resolve, reject) => {
							uni.request({
								url: 'http://39.96.82.150/pineinfect/jaxrs/dataservice/pine/' + that.check.stumpnum,
								success: res => {
									console.log(res);
									that.diaocharen = res.data.username;
									that.diaochabei = res.data.postscript;
									that.diaochashi = res.data.time;
									that.yimubian = res.data.pinenum;
									that.shugao = res.data.height;
									that.xiongjing = res.data.dhb;
									that.diaochaban = res.data.classnum;

									return new Promise((resolve, reject) => {
										uni.request({
											url: 'http://39.96.82.150/pineinfect/jaxrs/dataservice/deal/' + that.check.stumpnum,
											success: res => {
												console.log(res);

												that.kanfaren = res.data.username;
												that.kanfashi = res.data.time;
												that.kanfabei = res.data.postscript;
												uni.showModal({
													showCancel: false,
													title: '疫木信息',
													content: '疫木编号:' +
														that.yimubian +
														'\r\n' +
														'调查人员:' +
														that.diaocharen +
														'\r\n' +
														'调查时间:' +
														that.diaochashi +
														'\r\n' +
														'调查小班:' +
														that.diaochaban +
														'\r\n' +
														'胸径:' +
														that.xiongjing +
														'\r\n' +
														'树高:' +
														that.shugao +
														'\r\n' +
														'调查备注:' +
														that.diaochabei +
														'\r\n' +
														'砍伐人员:' +
														that.kanfaren +
														'\r\n' +
														'砍伐备注:' +
														that.kanfabei +
														'\r\n' +
														'砍伐时间:' +
														that.kanfashi +
														'\r\n'
												});
											},
											fail: err => {}
										});
									});
								},
								fail: err => {}
							});
						});
					}
				});
			}
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
