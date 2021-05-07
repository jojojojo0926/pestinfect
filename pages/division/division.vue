<template>
	<view class="content" :style="{backgroundImage:`url(${indexBackgroundImage})`,backgroundSize: 'cover'}">
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
			<text @click="scan1" class="saoma">点击扫描二维码</text>
		</view>
		<view class="feedback-title"><text class="_text">分段编号:</text>
			<textarea class="feedback-textarea" v-model="subsection.divsnum" placeholder="请扫码获取" auto-height maxlength=-1 />
			<!-- <input class="feedback-input" v-model="subsection.divsnum" placeholder="请扫码获取" /> -->
		</view>
		<view class="feedback-title"><text  class="_text">分段数:</text><input class="feedback-input" v-model="subsection.division"  @tap="getnum" placeholder="请填写" /></view>
		<view class="feedback-title"><text  class="_text">备注:</text><input class="feedback-input" v-model="subsection.postscript"
			 placeholder="请填写" /></view>
		<view class="feedback-title"><text>处理方式:</text></view>
		<view class="uni-list">
			<radio-group @change="radioChange">
				<label class="uni-list-cell uni-list-cell-pd" v-for="(item, index) in items" :key="item.value">
					<view>
						<radio :value="item.value" />
					</view> 
					<view>{{item.name}}</view>
				</label>
			</radio-group>
		</view>
		<button class="feedback-submit" @click="Toscene" :loading="loading">现场管理</button>
	</view>
</template>

<script>
	import indexBackgroundImage from "@/static/008.jpg"
	import {
		formatDate,
		Thistime
	} from "../../common/dayjs.js";
	import {
		pathToBase64,
	} from '../../common/image-tools.js'
	export default {
		data() {
			return {
				 loading: false,
				indexBackgroundImage: indexBackgroundImage,
				items: [{
						value: '1',
						name: '堆积'
					},
					{
						value: '2',
						name: '焚烧',
					},
					{
						value: '3',
						name: '粉碎'
					},
					{
						value: '4',
						name: '运输'
					}
				],
				images: [],
				subsection: {
					divsnum: '', //分段编号
					division: '', //分段数
					processmode: '', //处理方式
					postscript: '', //备注
					imagediv: '',
					numlist: '',
					imagecontent: [],
					arrlength: ''
				}
			};
		},
		onLoad(res) {
			var that = this
			try {
				const value = uni.getStorageSync('storage_key');
				if (value) {
					console.log(value.userid)
					if(value.userid.length == 1){
						that.subsection.imagediv = '000' + value.userid + '3' +Thistime() 
					} else if(value.userid.length == 2){
						that.subsection.imagediv = '00' + value.userid + '3' +Thistime()
					} else if(value.userid.length == 3){
						that.subsection.imagediv = '0' + value.userid + '3' +Thistime()
					} else {
						that.subsection.imagediv = value.userid + '3' +Thistime()
					}
				}
			} catch (e) {}
		},
		methods: {
			//获取分段数
			getnum(){
				var divsnum = this.subsection.divsnum
				var divsnumLength = divsnum.split(';').length - 1
				this.subsection.division = divsnumLength
				console.log(this.subsection.division)
			},
			//处理方式
			radioChange(evt) {
				this.subsection.processmode = evt.target.value
				console.log(this.subsection.processmode)
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
						this.subsection.imagecontent.push(res.tempFilePaths[0]);  //每拍一张 路径放到数组
						this.images = this.images.concat(res.tempFilePaths);      //
						var Length = this.subsection.imagecontent.length
						this.subsection.numlist = this.subsection.numlist.concat(this.subsection.imagediv + ',')
						this.subsection.arrlength = this.subsection.arrlength.concat(Length + ',')
						
						console.log(this.subsection.imagecontent)
						console.log(this.subsection.numlist)
						console.log(this.subsection.arrlength)

					}
				});
			},

			previewImage() {
				//预览图片
				uni.previewImage({
					urls: this.images,
				});
			},
			Toscene() {
				this.loading=true
				try {
					uni.setStorageSync('division', this.subsection);
				} catch (e) {
					// error
				}
				uni.navigateTo({
					url: '../scene/scene'
				})
				this.loading=false
			},
			async scan1() {
				uni.scanCode({
					success: res => {
						var first = res.result.indexOf(',')
						if (first == -1) {
							this.subsection.divsnum = this.subsection.divsnum.concat(res.result + ';');
						} else {
							this.subsection.divsnum = this.subsection.divsnum.concat(res.result.substring(0,first) + ';');
						}
						this.getnum()
					},
					fail: err => {
						console.log(err);
					},
			
				});
			},
			// #ifdef APP-PLUS
			async checkPermission(code) {
				let status = permision.isIOS ? await permision.requestIOS('camera') : await permision.requestAndroid(
					'android.permission.CAMERA');
			
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
	view {
		font-size: 28upx;
	}
	/*问题反馈*/
	.feedback-title {

		padding: 20upx;
		font-weight: 600;
		font-size: 35upx;
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
	.feedback-submit {
		background-color: #FF5053;
		font-weight: 700;
		color: #fff;
		margin: 30upx;
		opacity: 0.8;
		border-radius: 50upx;
	}
	.uni-list {
		background-color: #FFFFFF;
		position: relative;
		width: 100%;
		display: flex;
		flex-direction: column;
		border-radius: 20upx;
		opacity: 0.7;
	}
	.uni-list:after {
		position: absolute;
		z-index: 10;
		right: 0;
		bottom: 0;
		left: 0;
		height: 1px;
		content: '';
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
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
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
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
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
		background-color: #c8c7cc;
	}
	.content{
		height: 100%;
	}
</style>
