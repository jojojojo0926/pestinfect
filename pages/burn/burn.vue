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
			<textarea class="feedback-textarea" v-model="burn.divsnum" placeholder="请扫码获取" auto-height maxlength="-1" />
		</view>
		<view class="feedback-title">
			<text class="_text">段数:</text>
			<input class="feedback-input" v-model="burn.division" @tap="getnum" placeholder="请填写" />
		</view>
		<view class="feedback-title">
			<text class="_text">地点:</text>
			<input class="feedback-input" v-model="burn.location" placeholder="请填写" />
		</view>
		<view class="feedback-title">
			<text class="_text">备注:</text>
			<input class="feedback-input" v-model="burn.postscript" placeholder="请填写" />
		</view>
		<button class="feedback-submit" @tap="send" :loading="loading">提交</button>
		<button class="feedback-submit" @click="Inburnsql">本地查看</button>
	</view>
</template>

<script>
import { addBurn, addImage } from '../../common/vmeitime-http/';
import indexBackgroundImage from '@/static/02.jpg';
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
			burn: {
				postscript: '', //备注
				divsnum: '', //数段编号
				imagenum: '0005' + Thistime(), //焚烧图片编码
				id: '',
				location: '', //位置
				latitude: '', //纬度
				longitude: '', //经度
				altitude: '', //海拔
				division: '', //数目段数
				time: formatDate(new Date().getTime()), //时间
				userid: '', //采伐人员id
				username: '', //采伐人员
				owner: ''
			}
		};
	},
	onLoad() {
		//获取首页登录返回的内容 并赋值给data
		try {
			const value = uni.getStorageSync('storage_key');
			if (value) {
				this.burn.userid = value.userid;
				this.burn.username = value.username;
				this.burn.id = value.userid;
				this.burn.owner = value.userowner;
			}
		} catch (e) {
			// error
		}
		//获取位置信息
		uni.getLocation({
			// type: 'gcj02',
			geocode: true,
			success: res => {
				console.log(res)
				this.burn.latitude = res.latitude;
				this.burn.longitude = res.longitude;
				this.burn.location = res.address.province + res.address.city + res.address.district;
			}
		});
		//页面一打开就打开数据库
		// 创建数据表Burntable
		plus.sqlite.executeSql({
			name: 'pineinfect',
			sql:
				'create table if not exists Burntable("id" INT(10),"location" CHAR(25),"latitude" INT(20),"longitude" INT(20),"altitude" INT(5),"division" INT(2),"divsnum" CHAR(200),"time" CHAR(25),"imagenum" CHAR(25),"userid" INT(10),"username" CHAR(11),"postscript" CHAR(30))',
			success: function(e) {
				console.log('打开Burn表成功!');
			},
			fail: function(e) {
				console.log('打开Burn表失败');
			}
		});
		// 创建数据表BurnImagetable
		plus.sqlite.executeSql({
			name: 'pineinfect',
			sql:
				'create table if not exists BurnImagetable("id" INT(10),"imagenum" CHAR(20),"imageorder" CHAR(20),"imagename" CHAR(20),"imageurl" CHAR(30),"imagecontent" CHAR(99999999),"progress" INT(20),"time" CHAR(30),"userid" INT(10),"owner" INT(10),"houzhui" INT(10))',
			success: function(e) {
				console.log('打开BurnImagetable表成功!');
			},
			fail: function(e) {
				console.log('打开BurnImagetable表失败');
			}
		});
	},
	methods: {
		//跳转到本地存储页面
		Inburnsql() {
			uni.navigateTo({
				url: '../burnsql/burnsql'
			});
		},
		//获取段数
		getnum() {
			var divsnum = this.burn.divsnum;
			var divsnumLength = divsnum.split(';').length - 1;
			this.burn.division = divsnumLength;
			console.log(this.burn.division);
		},
		//删除图片
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
					//转base64
					pathToBase64(res.tempFilePaths[0])
						.then(base64 => {
							var slash = base64.indexOf('/');
							var semicolon = base64.indexOf(';');
							var str = base64.substr(slash + 1, semicolon - slash - 1);
							this.format = str;
							//获取base64主要部分
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
		//提交信息
		send() {
			var that = this;
			that.loading = true;
			uni.getNetworkType({
				success: async function(res) {
					//判断网络状态 如果不是 none 发送请求
					if (res.networkType == '3g' || res.networkType == '4g' || res.networkType == 'wifi') {
						// 判断如果编号不是空 就发送请求
						if (that.burn.divsnum.length > 0 && that.images.length > 0) {
							let resBurn = await addBurn(that.burn);
							if (resBurn.statusCode === 200) {
								let arr = that.imagecontent.split(';');
								arr.pop();
								for (var i = 0; i < arr.length; i++) {
									let resImage = await addImage({
										imagecontent: arr[i],
										id: that.burn.id,
										imagenum: that.burn.imagenum,
										imageorder: i + 1,
										imagename: i + '.' + that.format,
										progress: 5,
										time: that.burn.time,
										userid: that.burn.userid,
										owner: that.burn.owner
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
									//BurnImagetable中添加信息
									plus.sqlite.executeSql({
										name: 'pineinfect',
										sql:
											"insert into BurnImagetable values('" +
											that.burn.id +
											"','" +
											that.burn.imagenum +
											"','" +
											'burn' +
											"','" +
											'burn.png' +
											"','" +
											that.imageurl +
											"','" +
											that.imagecontent +
											"','" +
											8 +
											"','" +
											that.burn.time +
											"','" +
											that.burn.userid +
											"','" +
											that.owner +
											"','" +
											that.format +
											"')",
										success: function(e) {
											console.log('添加图片成功!');
											uni.showToast({
												icon: 'success',
												title: '添加图片成功!'
											});
										},
										fail: function(e) {
											console.log('添加图片失败!');
											uni.showToast({
												icon: 'none',
												title: '添加图片失败!'
											});
										}
									});
									//Burntable中添加信息
									plus.sqlite.executeSql({
										name: 'pineinfect',
										sql:
											"insert into Burntable values('" +
											that.burn.id +
											"','" +
											that.burn.location +
											"','" +
											that.burn.latitude +
											"','" +
											that.burn.longitude +
											"','" +
											that.burn.altitude +
											"','" +
											that.burn.division +
											"','" +
											that.burn.divsnum +
											"','" +
											that.burn.time +
											"','" +
											that.burn.imagenum +
											"','" +
											that.burn.userid +
											"','" +
											that.burn.username +
											"','" +
											that.burn.postscript +
											"')",
										success: function(e) {
											that.loading = false;
											console.log('添加信息成功!');
											uni.showToast({
												icon: 'success',
												title: '添加信息成功!'
											});
										},
										fail: function(e) {
											console.log(e);
											uni.showToast({
												icon: 'none',
												title: '添加信息失败!'
											});
										}
									});
									uni.showModal({
										title: '提示',
										content: '存入本地成功!',
										success: res => {
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
						this.burn.divsnum = this.burn.divsnum.concat(res.result + ';');
					} else {
						this.burn.divsnum = this.burn.divsnum.concat(res.result.substring(0, first) + ';');
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
