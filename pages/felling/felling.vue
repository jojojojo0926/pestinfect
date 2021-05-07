<template>
	<view class="content" :style="{ backgroundImage: `url(${indexBackgroundImage})`, backgroundSize: 'cover' }">
		<uni-segmented-control :current="current" :values="items" @clickItem="onClickItem" style-type="button" active-color="#392f41"></uni-segmented-control>
		<view>
			<view v-show="current === 0" style="height:1200upx;">
				<view style="margin: 20upx ;">
					<map id="myMap" show-location scale="18" style="width:100%; height: 1000upx;" :latitude="latitude" :longitude="longitude" :markers="covers" show-location="true"></map>
				</view>
				<button @click="Refresh" class="feedback-submit" :loading="loading5">返回当前位置</button>
				<button @click="shuaxin" class="feedback-submit" >刷新</button>
			</view>
			<view v-show="current === 1" style="height:1200upx; padding: 30upx;">
				<view class="feedback-title">
					<text class="_text">编号:</text>
					<input class="feedback-input" placeholder="请扫码查看" :value="result" disabled="disabled" />
				</view>
				<view class="feedback-title">
					<text class="_text">胸径(cm):</text>
					<input class="feedback-input" placeholder="请扫码查看" :value="dhb" disabled="disabled" />
				</view>
				<view class="feedback-title">
					<text class="_text">树高(m):</text>
					<input class="feedback-input" placeholder="请扫码查看" :value="height" disabled="disabled" />
				</view>

				<button @click="scan1()" style="margin: 60upx; opacity: 0.7;">扫码登记</button>
				<button style="margin: 60upx; opacity: 0.7;" @click="Tophotograph" :loading="loading">伐前拍照</button>
				<button style="margin: 60upx; opacity: 0.7;" @click="Toscebesql">查看本地</button>
			</view>
			<view v-show="current === 2" style="height:1200upx;">
				<!-- <button class="btn1" @click="Totransport" :loading="loading1">运输记录</button>
				<button class="btn1" @click="Toburn" :loading="loading2">焚烧记录</button>
				<button class="btn1" @click="Tosmash" :loading="loading3">粉碎记录</button> -->
				<button class="btn1" @click="Tofellingday" :loading="loading4">查看日采伐统计</button>
			</view>
		</view>
	</view>
</template>

<script>
import indexBackgroundImage from '@/static/08.jpg';
import uniSegmentedControl from '../../components/uni-segmented-control/uni-segmented-control.vue';
export default {
	components: {
		uniSegmentedControl
	},
	data() {
		return {
			loading1: false,
			loading2: false,
			loading3: false,
			loading4: false,
			loading5: false,
			loading: false,
			userid: '',
			username: '',
			owner: '',
			classnum: '',
			type: '',
			indexBackgroundImage: indexBackgroundImage,
			format: '',
			result: '',
			height: '', //树高
			dhb: '', //周长
			latitude: 0,
			longitude: 0,
			items: ['疫木分布', '疫木处理', '日志记录'],
			current: 0,
			title: 'map',
			covers: [],
			distance:0
		};
	},
	onLoad: function(opacity) {
		//拿到登录页返回的数据
		try {
			const value = uni.getStorageSync('storage_key');
			if (value) {
				// console.log(value)
				this.userid = value.userid;
				this.username = value.username;
				this.owner = value.userowner;
				this.classnum = value.userclassnum;
				this.type = value.type;
			} 
		} catch (e) {
			// error
		}
		uni.getLocation({
			type: 'gcj02',
			altitude: true,
			success: res => {
				this.longitude = res.longitude;
				this.latitude = res.latitude;
			}
		});
		(this.mapCtx = uni.createMapContext('myMap')), // 使用 uni.createMapContext 获取 map 上下文
		this.mapCtx.moveToLocation(); //将地图中心移动到当前定位点S
		this.Getpines();
	},
	onReady() {
		let appMap = uni.createMapContext('myMap').$getAppMap();
		appMap.setMapType(plus.maps.MapType.MAPTYPE_SATELLITE);
		appMap.showUserLocation(true); //显示当前位置
		appMap.showZoomControls(true); //缩放级别
	},
	methods: {
		Toscebesql() {
			uni.navigateTo({
				url: '../scene/scene'
			});
		},
		Refresh() {
			this.loading5 = true;
			(this.mapCtx = uni.createMapContext('myMap')), // 使用 uni.createMapContext 获取 map 上下文
			this.mapCtx.moveToLocation(); //将地图中心移动到当前定位点S
			this.Getpines();
			this.loading5 = false;
		},
		shuaxin() {
			uni.reLaunch({
				url: '../startNav/startNav',
				success: () => {
					uni.reLaunch({
						url: '../felling/felling'
					});
				}
			});
		},
		Tofellingday() {
			this.loading4 = true;
			uni.navigateTo({
				url: '../fellingday/fellingday'
			});
			this.loading4 = false;
		},
		Tophotograph() {
			this.loading = true;
			uni.navigateTo({
				url: '../photograph/photograph?id=' + this.result
			});
			this.loading = false;
		},
		Totransport() {
			this.loading1 = true;
			uni.navigateTo({
				url: '../transport/transport'
			});
			this.loading1 = false;
		},
		Toburn() {
			this.loading2 = true;
			uni.navigateTo({
				url: '../burn/burn'
			});
			this.loading2 = false;
		},
		Tosmash() {
			this.loading3 = true;
			uni.navigateTo({
				url: '../smash/smash'
			});
			this.loading3 = false;
		},
		async Getpines() {
			var that = this
			var distance;
			uni.request({
				url: 'http://39.96.82.150/pineinfect/jaxrs/dataservice/getpines',
				method: 'POST',
				header: {
					'Content-Type': 'application/json' //请求头信息
				},
				data: {
					classnum: this.classnum,
					username: this.username,
					owner: this.owner,
					type: this.type,
					userid: this.userid
				},
				success: async res => {
					var arr = res.data.pine;
					var newarr = arr.slice(-40);
					var distance;
					for (let i = 0; i < newarr.length; i++) {
						var point1 = new plus.maps.Point(newarr[i].longitude,newarr[i].latitude);
						var point2 = new plus.maps.Point(this.longitude,this.latitude);
						plus.maps.Map.calculateDistance(point1,point2,function(event){
							distance = event.distance.toFixed(2);  // 转换后的距离值
							newarr[i].callout = {
								content:
									' id:' +
									newarr[i].id +
									',' +
									'\n ' +
									'二维码编号:' +
									newarr[i].pinenum +
									',' +
									'\n ' +
									'纬度:' +
									newarr[i].latitude +
									',' +
									'\n ' +
									'经度:' +
									newarr[i].longitude +
									',' +
									'\n ' +
									'树高(m):' +
									newarr[i].height +
									',' +
									'\n ' +
									'胸径(cm):' +
									newarr[i].dhb +
									',' +
									'\n ' +
									'周长(cm):' +
									newarr[i].circumference +
									',' +
									'\n ' +
									'调查员ID:' +
									newarr[i].userid +
									',' +
									'\n ' +
									'调查员姓名:' +
									newarr[i].username +
									',' +
									'\n ' +
									'小班号:' +
									newarr[i].classnum +
									',' +
									'\n ' +
									'图片编号:' +
									newarr[i].imagenum +
									',' +
									'\n ' +
									'备注:' +
									newarr[i].postscript +
									',' +
									'\n ' +
									'时间:' +
									newarr[i].time  +
									',' +
									'\n ' +
									'直线距离:(单位：米)' +
									distance
							};
							if (newarr[i].done === '0') {
								newarr[i].iconPath = '../../static/img/000.png';
							}
							if (newarr[i].done === '1') {
								newarr[i].iconPath = '../../static/img/111.png';
							}
							if (newarr[i].done === '2') {
								newarr[i].iconPath = '../../static/img/222.png';
							}
						},function(e){
							alert("Failed:"+JSON.stringify(e));
						});
					}
					this.covers = newarr;
				}
			});
		},
		// 切换栏
		onClickItem(index) {
			if (this.current !== index) {
				this.current = index;
			}
		},
		//扫码
		async scan1() {
			uni.scanCode({
				success: res => {
					// this.result = res.result;
					// if (res.result.length > 13) {
					// 	this.result = res.result.substring(0, 13)
					// } else {
					// 	this.result = res.result;
					// }
					var first = res.result.indexOf(',');
					if (first == -1) {
						this.result = res.result;
					} else {
						this.result = res.result.substring(0, first);
					}
					uni.request({
						url: 'http://39.96.82.150/pineinfect/jaxrs/dataservice/pine/' + this.result,
						method: 'GET',
						success: res => {
							this.height = res.data.height;
							this.dhb = res.data.dhb;
							// uni.showModal({
							// 	title: '提示',
							// 	content: ''+ res.data +'',
							// });
						}
					});
				},
				fail: err => {
					console.log(err);
				}
			});
		},
	}
};
</script>

<style>
.feedback-submit {
	background-color: #0faeff;
	font-weight: 700;
	color: #fff;
	margin: 70upx;
	opacity: 0.8;
	border-radius: 50upx;
}

body {
	background-size: 100% 100%;
	overflow: hidden;
}

.btn1 {
	width: 80%;
	margin-top: 10%;
	margin-bottom: 10%;
	opacity: 0.7;
}

.feedback-title {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	padding: 20upx;
	font-weight: 500;
	font-size: 35upx;
	margin-top: 40upx;
	color: #000;
}

.feedback-star-view.feedback-title {
	justify-content: flex-start;
	margin: 0;
}

.feedback-input {
	width: 60%;
	font-weight: 400;
	font-size: 35upx;
	height: 40upx;
	padding: 10upx 20upx;
	line-height: 40upx;
	background-color: #e1e1e1;
	border-radius: 30upx;
	opacity: 0.8;
}

.list-item {
	flex-direction: row;
	flex-wrap: nowrap;
	align-items: center;
	padding: 5px 0px;
	margin: 20upx;
	background-color: #e1e1e1;
	text-align: center;
	opacity: 0.6;
	border-radius: 50upx;
}

.list-text {
	flex: 1;
}

._text {
	width: 40%;
	margin-left: 50upx;
	font-size: 40upx;
	color: #f7f7f7;
	font-weight: 700;
	text-align: center;
}
</style>
