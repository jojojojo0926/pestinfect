<script>
	import Vue from 'vue';

	export default {
		created() {
			// #ifdef APP-PLUS
			plus.navigator.closeSplashscreen();
			// #endif
		},
		onLaunch: function() {
			console.log('App Launch');
		}, 
		onShow: function() {
			let res = plus.sqlite.isOpenDatabase({
				name: 'pineinfect',
				path: '_doc/pineinfect.db',
			});
			if (res) {
				console.log('数据库已打开')
			} else {
				plus.sqlite.openDatabase({
					name: 'pineinfect',
					path: '_doc/pineinfect.db',
					success: function(e) {
						console.log('打开数据库成功!');
					}
				});
			}
			
			console.log('App 开启');
			
			
			
			
		},
		onHide: function() {
			plus.sqlite.closeDatabase({
				name: 'pineinfect',
				success: function(e) {
					console.log('关闭数据库成功!');
				},
				fail: function(e) {
					console.log('closeDatabase failed: ' + JSON.stringify(e));
				}
			});
			console.log('App 关闭');
		}
	};
</script>

<style>
	/*每个页面公共css */

	page {
		min-height: 100%;
	}

	/* #ifdef MP-BAIDU */
	page {
		width: 100%;
		height: 100%;
		display: block;
		background-color: #EFEFF4;
	}

	swan-template {
		width: 100%;
		min-height: 100%;
		display: flex;
	}

	/* 原生组件模式下需要注意组件外部样式 */
	custom-component {
		width: 100%;
		min-height: 100%;
		display: flex;

	}

	/* #endif */

	/* #ifdef MP-ALIPAY */
	page {
		min-height: 100vh;

	}

	/* #endif */

	/* 原生组件模式下需要注意组件外部样式 */
	m-input {
		width: 100%;
		min-height: 100%;
		display: flex;
	}


	.content {
		display: flex;
		flex: 1;
		flex-direction: column;
		padding: 20upx;
		height: 1500upx;
		
	}

	.input-group {
		background-color: #ffffff;
		margin-top: 40upx;
		position: relative;
	}

	.input-group::before {
		position: absolute;
		right: 0;
		top: 0;
		left: 0;
		height: 1upx;
		content: '';
		-webkit-transform: scaleY(0.5);
		transform: scaleY(0.5);
		background-color: #c8c7cc;
	}

	.input-group::after {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
		height: 1upx;
		content: '';
		-webkit-transform: scaleY(0.5);
		transform: scaleY(0.5);
		background-color: #c8c7cc;
	}

	.input-row {
		display: flex;
		flex-direction: row;
		position: relative;
	}

	.input-row .title {
		width: 20%;
		height: 50upx;
		min-height: 50upx;
		padding: 15upx 0;
		padding-left: 30upx;
		line-height: 50upx;
	}

	.input-row.border::after {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 15upx;
		height: 1upx;
		content: '';
		-webkit-transform: scaleY(0.5);
		transform: scaleY(0.5);
		background-color: #c8c7cc;
	}

	.btn-row {
		margin-top: 50upx;
		padding: 20upx;
	}

	button.primary {
		background-color: #0faeff;
	}

	/* 上传 */
	.uni-uploader {

		flex: 1;
		flex-direction: column;
	}

	.uni-uploader-head {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.uni-uploader-info {
		color: #000;
	}

	.uni-uploader-body {
		margin-top: 16upx;
	}

	.uni-uploader__files {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
	}

	.uni-uploader__file {
		margin: 10upx;
		width: 210upx;
		height: 210upx;
	}

	.uni-uploader__img {
		display: block;
		width: 210upx;
		height: 210upx;
	}

	.uni-uploader__input-box {
		position: relative;
		margin: 10upx;
		width: 208upx;
		height: 208upx;
		border: 2upx solid #DD524D;
	}

	.uni-uploader__input-box:before,
	.uni-uploader__input-box:after {
		content: ' ';
		position: absolute;
		top: 50%;
		left: 50%;
		-webkit-transform: translate(-50%, -50%);
		transform: translate(-50%, -50%);
		background-color: #DD524D;
	}

	.uni-uploader__input-box:before {
		width: 4upx;
		height: 79upx;
	}

	.uni-uploader__input-box:after {
		width: 79upx;
		height: 4upx;
	}

	.uni-uploader__input-box:active {
		border-color: #DD524D;
	}

	.uni-uploader__input-box:active:before,
	.uni-uploader__input-box:active:after {
		background-color: #DD524D;
	}

	.uni-uploader__input {
		position: absolute;
		z-index: 1;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
	}

	/*问题反馈*/
	.feedback-title {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		padding: 20upx;
		font-weight: 500;
		font-size: 35upx;
		color: #ddd;
	}

	.feedback-star-view.feedback-title {
		justify-content: flex-start;
		margin: 0;
	}

	.feedback-quick {
		position: relative;
		padding-right: 40upx;
	}

	.feedback-quick:after {
		font-family: uniicons;
		font-size: 40upx;
		content: '\e581';
		position: absolute;
		right: 0;
		top: 50%;
		color: #bbb;
		-webkit-transform: translateY(-50%);
		transform: translateY(-50%);
	}

	.feedback-body {
		margin-top: 50upx;
		margin-bottom: 50upx;
		background: #DCDCDC;
		padding: 30upx;
		border-radius: 30upx;
		opacity: 0.6;
	}

	.feedback-textare {
		height: 200upx;
		font-size: 34upx;
		line-height: 50upx;
		width: 100%;
		box-sizing: border-box;
		padding: 20upx 30upx 0;
	}

	.feedback-input {
		width: 60%;
		color: #000000;
		font-weight: 400;
		font-size: 35upx;
		height: 40upx;
		padding: 10upx 20upx;
		line-height: 40upx;
		background-color: #e1e1e1;
		border-radius: 30upx;
		opacity: 0.9;
	}

	.feedback-uploader {
		padding: 22upx 20upx;
	}

	.feedback-star {
		font-family: uniicons;
		font-size: 40upx;
		margin-left: 6upx;
	}

	.feedback-star-view {
		margin-left: 20upx;
	}

	.feedback-star:after {
		content: '\e408';
	}

	.feedback-star.active {
		color: #ffb400;
	}

	.feedback-star.active:after {
		content: '\e438';
	}

	.feedback-submit {
		/* background-color: #FF5053; */
		font-weight: 700;
		color: #fff;
		margin: 30upx;
		opacity: 0.8;
		border-radius: 50upx;
	}

	._text {
		width: 30%;
		margin-left: 50upx;
		font-size: 40upx;
		color: #fff;
		font-weight: 700;
		text-align: center;
	}

	.close-view {
		text-align: center;
		line-height: 14px;
		height: 16px;
		width: 16px;
		border-radius: 50%;
		background: #ff5053;
		color: #ffffff;
		position: absolute;
		top: -6px;
		right: -4px;
		font-size: 12px;
	}

	.getlocation {
		width: 45%;
		background-color: #e1e1e1;
		border-radius: 10upx;
		padding: 10upx;
		margin-right: 20%;
		opacity: 0.7;
		color: #000000;
	}

	.saoma {
		margin-left: 29%;
		font-weight: 600;
		color: red;
		background-color: #E0FFFF;
		padding: 10upx;
		border-radius: 20upx;
		opacity: 0.7;
	}
</style>
