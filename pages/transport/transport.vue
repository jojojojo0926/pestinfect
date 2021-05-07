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
						<view class="uni-uploader__input-box" v-show="images.length < 3"><view class="uni-uploader__input" @tap="chooseImg"></view></view>
					</view>
				</view>
			</view>
		</view>
		<view class="feedback-title"><text @click="scan1" class="saoma">点击扫描二维码</text></view>
		<view class="feedback-title">
			<text class="_text">分段编号:</text>
			<textarea class="feedback-textarea" v-model="transport.divsnum" placeholder="请扫码获取" auto-height maxlength="-1" />
		</view>
		<view class="feedback-title">
			<text class="_text">段数:</text>
			<input class="feedback-input" v-model="transport.division" @tap="getnum" placeholder="请填写" />
		</view>
		<view class="feedback-title">
			<text class="_text">牌号:</text>
			<input class="feedback-input" v-model="transport.carnum" placeholder="请填写" />
		</view>
		<view class="feedback-title">
			<text class="_text">司机:</text>
			<input class="feedback-input" v-model="transport.driver" placeholder="请填写" />
		</view>
		<view class="feedback-title">
			<text class="_text">装车点:</text>
			<input class="feedback-input" v-model="transport.location" placeholder="请填写" />
		</view>
		<view class="feedback-title">
			<text class="_text">目的地:</text>
			<input class="feedback-input" v-model="transport.destination" placeholder="请填写" />
		</view>
		<view class="feedback-title">
			<text class="_text">备注:</text>
			<input class="feedback-input" v-model="transport.postscript" placeholder="请填写" />
		</view>
		<button class="feedback-submit" @click="send" :loading="loading">提交</button>
		<button class="feedback-submit" @click="Intransportsql">本地查看</button>
	</view>
</template>

<script>
import { addTransport, addImage } from '../../common/vmeitime-http/';
import indexBackgroundImage from '@/static/01.jpg';
import { formatDate, Thistime } from '../../common/dayjs.js';
import { pathToBase64 } from '../../common/image-tools.js';
export default {
	data() {
		return {
			format: '',
			loading: false,
			indexBackgroundImage: indexBackgroundImage,
			images: [],
			imagecontent: '',
			transport: {
				owner: '',
				carnum: '',
				driver: '',
				destination: '',
				divsnum: '',
				imagenum: '0007' + Thistime(),
				id: '',
				location: '',
				latitude: '',
				longitude: '',
				altitude: '',
				division: '',
				time: formatDate(new Date().getTime()),
				userid: '',
				username: '',
				postscript: ''
			}
		};
	},
	onLoad(option) {
		try {
			const value = uni.getStorageSync('storage_key');
			if (value) {
				this.transport.userid = value.userid;
				this.transport.username = value.username;
				this.transport.id = value.userid;
				this.transport.owner = value.owner;
			}
		} catch (e) {
			// error
		}
		//获取位置信息
		uni.getLocation({
			// type: 'gcj02',
			geocode: true,
			success: res => {
				this.transport.latitude = res.latitude;
				this.transport.longitude = res.longitude;
				this.transport.location = res.address.province + res.address.city + res.address.district;
			}
		});
		plus.sqlite.executeSql({
			name: 'pineinfect',
			sql:
				'create table if not exists Transporttable("id" INT(10),"carnum" CHAR(10),"driver" CHAR(10),"location" CHAR(25),"latitude" INT(20),"longitude" INT(20),"altitude" INT(5),"destination" CHAR(20),"division" INT(2),"divsnum" CHAR(200),"time" CHAR(25),"imagenum" CHAR(25),"userid" INT(10),"username" CHAR(11),"postscript" CHAR(30))',
			success: function(e) {
				console.log('打开Transoprt表成功!');
			},
			fail: function(e) {
				console.log('打开Transoprt表失败');
			}
		});
		plus.sqlite.executeSql({
			name: 'pineinfect',
			// sql:'create table if not exists TransoprtImagetable("imagecontent" CHAR(2000))',
			sql:
				'create table if not exists TransoprtImagetable("id" INT(10),"imagenum" CHAR(20),"imageorder" CHAR(20),"imagename" CHAR(20),"imageurl" CHAR(30),"imagecontent" CHAR(99999999),"progress" INT(20),"time" CHAR(30),"userid" INT(10),"owner" INT(10),"houzhui" INT(10))',
			success: function(e) {
				console.log('打开TransoprtImagetable表成功!');
			},
			fail: function(e) {
				console.log('打开TransoprtImagetable表失败');
			}
		});
	},
	methods: {
		Intransportsql() {
			uni.navigateTo({
				url: '../transportsql/transportsql'
			});
		},
		//添加数据
		getnum() {
			var divsnum = this.transport.divsnum;
			var divsnumLength = divsnum.split(';').length - 1;
			this.transport.division = divsnumLength;
			console.log(this.transport.division);
		},
		close(e) {
			this.images.splice(e, 1);
		},
		chooseImg(e) {
			//选择图片
			uni.chooseImage({
				sourceType: ['camera'],
				sizeType: 'compressed',
				count: 3 - this.images.length,
				success: res => {
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
		send() {
			var that = this;
			that.loading = true;
			uni.getNetworkType({
				success: async function(res) {
					//判断网络状态 如果不是 none 发送请求
					if (res.networkType == '3g' || res.networkType == '4g' || res.networkType == 'wifi') {
						// 判断如果编号不是空 就发送请求
						if (that.transport.divsnum.length > 0 && that.images.length > 0) {
							let resTransport = await addTransport(that.transport);
							if (resTransport.statusCode === 200) {
								let arr = that.imagecontent.split(';');
								arr.pop();
								for (var i = 0; i < arr.length; i++) {
									let resImage = await addImage({
										imagecontent: arr[i],
										id: that.transport.id,
										imagenum: that.transport.imagenum,
										imageorder: i + 1,
										imagename: i + '.' + that.format,
										progress: 7,
										time: that.transport.time,
										userid: that.transport.userid,
										owner: that.transport.owner
									});
								}
							} else {
								uni.showModal({
									title: '提示',
									content: '请求失败!'
								});
							}
						} else {
							that.loading = false;
							uni.showModal({
								title: '提示',
								content: '请填写完整!'
							});
							return;
						}
						uni.showModal({
							title: '提示',
							content: '提交成功!',
							success: res => {
								if (res.confirm) {
									uni.navigateBack({
										delta: 1
									});
								} else {
									uni.navigateBack({
										delta: 1
									});
								}
							}
						});
					} else {
						uni.showModal({
							title: '提示',
							content: '没有网络，是否存入本地',
							success: function(res) {
								if (res.confirm) {
									plus.sqlite.executeSql({
										name: 'pineinfect',
										sql:
											"insert into TransoprtImagetable values('" +
											that.transport.id +
											"','" +
											that.transport.imagenum +
											"','" +
											'transport' +
											"','" +
											'transport.png' +
											"','" +
											that.imageurl +
											"','" +
											that.imagecontent +
											"','" +
											7 +
											"','" +
											that.transport.time +
											"','" +
											that.transport.userid +
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
										sql:
											"insert into Transporttable values('" +
											that.transport.id +
											"','" +
											that.transport.carnum +
											"','" +
											that.transport.driver +
											"','" +
											that.transport.location +
											"','" +
											that.transport.latitude +
											"','" +
											that.transport.longitude +
											"','" +
											that.transport.altitude +
											"','" +
											that.transport.destination +
											"','" +
											that.transport.division +
											"','" +
											that.transport.divsnum +
											"','" +
											that.transport.time +
											"','" +
											that.transport.imagenum +
											"','" +
											that.transport.userid +
											"','" +
											that.transport.username +
											"','" +
											that.transport.postscript +
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
											that.loading = false;
											if (res.confirm) {
												uni.navigateBack({
													delta: 1
												});
											}
										}
									});
								}
							}
						});
					}
				}
			});
		},
		scan1() {
			uni.scanCode({
				success: res => {
					var first = res.result.indexOf(',');
					if (first == -1) {
						this.transport.divsnum = this.transport.divsnum.concat(res.result + ';');
					} else {
						this.transport.divsnum = this.transport.divsnum.concat(res.result.substring(0, first) + ';');
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
.feedback-submit {
	background-color: #ff5053;
	font-weight: 700;
	color: #fff;
	margin: 30upx;
	opacity: 0.8;
	border-radius: 50upx;
}
.feedback-textarea {
	width: 60%;
	color: #000000;
	font-weight: 400;
	font-size: 35upx;
	padding: 10upx 20upx;
	background-color: #e1e1e1;
	border-radius: 30upx;
	opacity: 0.7;
}
</style>
