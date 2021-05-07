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
		<view class="feedback-title"><text @click="scan" class="saoma">点击扫描二维码</text></view>
		<view class="feedback-title">
			<text class="_text">分段编号:</text>
			<textarea class="feedback-textarea" v-model="smash.divsnum" placeholder="请扫码获取" auto-height maxlength="-1" />
		</view>
		<view class="feedback-title">
			<text class="_text">段数:</text>
			<input class="feedback-input" v-model="smash.division" @tap="getnum" placeholder="请填写" />
		</view>
		<view class="feedback-title">
			<text class="_text">地点:</text>
			<input class="feedback-input" v-model="smash.location" placeholder="请填写" />
		</view>
		<view class="feedback-title">
			<text class="_text">备注:</text>
			<input class="feedback-input" v-model="smash.postscript" placeholder="请填写" />
		</view>
		<button class="feedback-submit" @tap="send" :loading="loading">提交</button>
		<button class="feedback-submit" @click="Insmashsql">本地查看</button>
	</view>
</template>

<script>
import { addSmash, addImage } from '../../common/vmeitime-http/';
import indexBackgroundImage from '@/static/006.jpg';
import { formatDate, Thistime } from '../../common/dayjs.js';
import { pathToBase64 } from '../../common/image-tools.js';
export default {
	data() {
		return {
			loading: false,
			indexBackgroundImage: indexBackgroundImage,
			format: '',
			images: [],
			imagecontent: '',
			smash: {
				owner: '',
				postscript: '', //备注
				divsnum: '', //数段编号
				imagenum: '0006' + Thistime(), //焚烧图片编码
				id: '',
				location: '', //位置
				latitude: '', //纬度
				longitude: '', //经度
				altitude: '', //海拔
				division: '', //数目段数
				time: formatDate(new Date().getTime()), //时间
				userid: '', //采伐人员id
				username: '' //采伐人员
			}
		};
	},
	onLoad(opacity) {
		try {
			const value = uni.getStorageSync('storage_key');
			if (value) {
				this.smash.userid = value.userid;
				this.smash.username = value.username;
				this.smash.id = value.userid;
				this.smash.owner = value.owner;
			}
		} catch (e) {
			// error
		}
		//获取位置信息
		uni.getLocation({
			// type: 'gcj02',
			geocode: true,
			success: res => {
				this.smash.latitude = res.latitude;
				this.smash.longitude = res.longitude;
				this.smash.location = res.address.province + res.address.city + res.address.district;
			}
		}); 
		plus.sqlite.executeSql({
			name: 'pineinfect',
			sql:
				'create table if not exists Smashtable("id" INT(10),"location" CHAR(25),"latitude" INT(20),"longitude" INT(20),"altitude" INT(5),"division" INT(2),"divsnum" CHAR(200),"time" CHAR(25),"imagenum" CHAR(25),"userid" INT(10),"username" CHAR(11),"postscript" CHAR(30))',
			success: function(e) {
				console.log('打开Smash表成功!');
			},
			fail: function(e) {
				console.log('打开Smash表失败');
			}
		});
		plus.sqlite.executeSql({
			name: 'pineinfect',
			// sql:'create table if not exists  SmashImagetable("imagecontent" CHAR(2000))',
			sql:
				'create table if not exists  SmashImagetable("id" INT(10),"imagenum" CHAR(20),"imageorder" CHAR(20),"imagename" CHAR(20),"imageurl" CHAR(30),"imagecontent" CHAR(99999999),"progress" INT(20),"time" CHAR(30),"userid" INT(10),"owner" INT(10),"houzhui" INT(10))',
			success: function(e) {
				console.log('打开SmashImagetable表成功!');
			},
			fail: function(e) {
				console.log('打开SmashImagetable表失败');
			}
		});
	},
	methods: {
		Insmashsql() {
			uni.navigateTo({
				url: '../smashsql/smashsql'
			});
		},
		getnum() {
			var divsnum = this.smash.divsnum;
			var divsnumLength = divsnum.split(';').length - 1;
			this.smash.division = divsnumLength;
			console.log(this.smash.division);
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
						if (that.smash.divsnum.length > 0 && that.images.length > 0) {
							let resSmash = await addSmash(that.smash);
							if (resSmash.statusCode === 200) {
								let arr = that.imagecontent.split(';');
								arr.pop();
								for (var i = 0; i < arr.length; i++) {
									let resImage = await addImage({
										imagecontent: arr[i],
										id: that.smash.id,
										imagenum: that.smash.imagenum,
										imageorder: i + 1,
										imagename: i + '.' + that.format,
										progress: 6,
										time: that.smash.time,
										userid: that.smash.userid,
										owner: that.smash.owner
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
											"insert into  SmashImagetable values('" +
											that.smash.id +
											"','" +
											that.smash.imagenum +
											"','" +
											'smash' +
											"','" +
											'smash.png' +
											"','" +
											that.imageurl +
											"','" +
											that.imagecontent +
											"','" +
											6 +
											"','" +
											that.smash.time +
											"','" +
											that.smash.userid +
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
											"insert into Smashtable values('" +
											that.smash.id +
											"','" +
											that.smash.location +
											"','" +
											that.smash.latitude +
											"','" +
											that.smash.longitude +
											"','" +
											that.smash.altitude +
											"','" +
											that.smash.division +
											"','" +
											that.smash.divsnum +
											"','" +
											that.smash.time +
											"','" +
											that.smash.imagenum +
											"','" +
											that.smash.userid +
											"','" +
											that.smash.username +
											"','" +
											that.smash.postscript +
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
		scan() {
			uni.scanCode({
				success: res => {
					var first = res.result.indexOf(',');
					if (first == -1) {
						this.smash.divsnum = this.smash.divsnum.concat(res.result + ';');
					} else {
						this.smash.divsnum = this.smash.divsnum.concat(res.result.substring(0, first) + ';');
					}
				}
			});
		}
	}
};
</script>

<style>
.content {
	height: 2500upx;
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
