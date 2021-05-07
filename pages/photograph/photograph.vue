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

		<view class="feedback-title">
			<text class="_text">疫木编号:</text>
			<input class="feedback-input" v-model="photograph.pinenum" placeholder="请扫码获取" disabled="disabled" />
		</view>
		<button @click="division" class="feedback-submit" :loading="loading">分割编号</button>
	</view>
</template>
 
<script>
import indexBackgroundImage from '@/static/011.jpg';
import { formatDate, Thistime } from '../../common/dayjs.js';
import { pathToBase64 } from '../../common/image-tools.js';
export default {
	data() {
		return {
			loading: false,
			indexBackgroundImage: indexBackgroundImage,
			images: [],
			ImgAddress:[],
			photograph: {
				pinenum: '', //疫木编号
				imagepine: '',
				imagecontent: [],
				numlist: '',
				arrlength: ''
			}
		};
	},
	onLoad(res) {
		var that = this
		that.photograph.pinenum = res.id;
		try {
			const value = uni.getStorageSync('storage_key');
			if (value) {
				if(value.userid.length == 1){
					that.photograph.imagepine = '000' + value.userid + '2' +Thistime() 
				} else if(value.userid.length == 2){
					that.photograph.imagepine = '00' + value.userid + '2' +Thistime()
				} else if(value.userid.length == 3){
					that.photograph.imagepine = '0' + value.userid + '2' +Thistime()
				} else {
					that.photograph.imagepine = value.userid + '2' +Thistime()
				}
			}
		} catch (e) {}
	},
	methods: {
		division() {
			this.loading = true;
			uni.navigateTo({
				url: '../division/division'
			});
			try {
				uni.setStorageSync('photograph', this.photograph);
			} catch (e) {
				// error
			}
			this.loading = false;
		},
		close(e) {
			this.images.splice(e, 1);
		},
		chooseImg(e) {
			//选择图片
			uni.chooseImage({
				sourceType: ['camera'],
				sizeType: 'compressed',
				count: 3,
				success: res => {
					this.photograph.imagecontent.push(res.tempFilePaths[0]);
					
					this.images = this.images.concat(res.tempFilePaths);

					var Length = this.photograph.imagecontent.length;
					this.photograph.numlist = this.photograph.numlist.concat(this.photograph.imagepine + ',');
					this.photograph.arrlength = this.photograph.arrlength.concat(Length + ',');
					
					console.log(this.photograph.imagecontent)
					console.log(this.photograph.numlist);
					console.log(this.photograph.arrlength);
					console.log(Length);
				}
			});
		},
		previewImage() {
			//预览图片
			uni.previewImage({
				urls: this.images
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
