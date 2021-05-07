<template>
	<view class="content" :style="{backgroundImage:`url(${indexBackgroundImage})`,backgroundSize: 'cover'}">
		<view class="header">
			<image src="../../static/shilu-login/logo.png"></image>
		</view>
			<view class="input-view">
				<view class="label-view">
					<text class="label">账号</text>
				</view>
				<input class="input" type="text" placeholder="请输入账号" v-model="user.username" />
			</view>
			<view class="input-view">
				<view class="label-view">
					<text class="label">密码</text>
				</view>
				<input class="input" password placeholder="请输入密码" v-model="user.password" />
			</view>
			<view class="button-view">
				<button  class="login" @click="handleLogin()" :loading="loading">登录</button>
			</view>
	</view>
</template>

<script>
	import indexBackgroundImage from "@/static/010.jpg"
	export default {
		data() {
			return {
				loading: false,
				indexBackgroundImage: indexBackgroundImage,
				user: {
					username: '', //用户名
					classnum: '',
					userid: '',
					owner:'',
					password: '',
					type:'',
				}
			}
		},
		onLoad() {
			try {
				const value = uni.getStorageSync('storage_key');
				if (value) {
					this.user.username = value.username;
					this.user.password = value.password;
				}
			}
			catch (e) {
				// error
			}
		},
		methods: {
			handleLogin() {
				this.loading = true
				uni.request({
					url: 'http://39.96.82.150/pineinfect/jaxrs/managerservice/login', 
					data: this.user,
					method: 'POST',
					success: (res) => {
						loading: false,
						this.user.owner = res.data.owner
						this.user.userid = res.data.userid
						this.user.classnum = res.data.classnum
						this.user.username = res.data.username
						this.user.type = res.data.type
						// 登录返回值 存储
						try {
						    uni.setStorageSync('storage_key', this.user );
						} catch (e) {
						    // error
						}
						if (res.statusCode == 200) {
							if (res.data.type === '2') {
								uni.redirectTo({
									url: '../main/main'
								})
							}
							if (res.data.type === '3') {
								uni.redirectTo({
									url: '../felling/felling'
								})
							}
							if (res.data.type === '4') {
								uni.redirectTo({
									url: '../check/check'
								})
							}
						} else {
							uni.showToast({
								title: '账号密码错误!'
							});
						}
						uni.hideLoading({
							 title: '登陆成功!'
						})
					},
					fail: (res) => {
						uni.showLoading({
							title: '登陆中……'
						});
						setTimeout(function () {
						    uni.hideLoading();
						}, 5000);
					}
				});
			},
		}
	}
</script>

<style>
	.header {
		width: 161upx;
		height: 161upx;
		background: rgba(63, 205, 235, 1);
		box-shadow: 0upx 12upx 13upx 0upx rgba(63, 205, 235, 0.47);
		border-radius: 50%;
		margin-top: 30upx;
		margin-left: auto;
		margin-right: auto;
	}

	.header image {
		width: 161upx;
		height: 161upx;
		border-radius: 50%;
	}

	view {
		display: flex;
	}


	.input-view {
		border-bottom-style: solid;
		border-bottom-width: 3upx;
		border-bottom-color: #ddd;
		background-color: #fff;
		flex-direction: row;
		width: 95%;
		padding: 20upx 20upx;
		opacity: 0.7;
		margin-top:5% ;
		border-radius: 30upx;
	}

	.label-view {
		width: 100upx;
		height: 60upx;
		align-items: center;
		margin-right: 30upx;
	}

	.label {
		flex: 1;
		line-height: 60upx;
		font-size: 34upx;
		color: #555;
		text-align: left;
	}

	.input {
		flex: 1;
		height: 60upx;
		font-size: 34upx;
		align-items: center;
	}

	.button-view {
		margin-top: 50upx;
		padding: 0 20upx;
		box-sizing: border-box;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.content {
		height: 1500upx;
	}
	button {
		width: 710upx;
		height: 80upx;
		line-height: 80upx;
		text-align: center;
		font-size: 34upx;
		margin-bottom: 30upx;
		right: 2.5%;
	}

	button.register {
		margin-top: 30upx;
		color: #ff80ab;
		background-color: #fff;
		border-color: #ff80ab;
		border-width: 2upx;
	}

	/* .register.hover,
	.login.hover {
	    opacity: 0.6;
	} */
	.getPassword {
		color: #888888;
	}
	.login {
		margin: 30upx;
		width: 70%;
	}
</style>
