<template>
	<view class="warp">
		<view class="box">
			<t-table>
				<t-tr>
					<t-th>采伐人员</t-th>
					<t-th>日期</t-th>
					<t-th>疫木编号</t-th>
				</t-tr>
				<t-tr v-for="(item , index) in tableList" :key="index">
					<t-td class="tdd">{{ item.username }}</t-td>
					<t-td class="tdd ">{{ item.time }}</t-td>
					<t-td class="tdd">{{ item.pinenum }}</t-td>
				</t-tr>
			</t-table>
		</view>
		<view class="btn">
			<button class="feedback-submit" type="primary" @tap="Send" :loading="loading">发送</button>
			<cmd-progress :percent="p" :stroke-width="12" status="active"></cmd-progress>
			<!-- <button class="feedback-submit" type="primary" @tap="Cleantable">清空存储</button> -->
		</view>
	</view>
</template>

<script>
	import {
		addPine
	} from '../../common/vmeitime-http/';
	import {
		addImage
	} from '../../common/vmeitime-http/';
	import tTable from '@/components/t-table/t-table.vue';
	import tTh from '@/components/t-table/t-th.vue';
	import tTr from '@/components/t-table/t-tr.vue';
	import tTd from '@/components/t-table/t-td.vue';
	import cmdProgress from '@/components/cmd-progress/cmd-progress.vue';
	import {
		pathToBase64
	} from '../../common/image-tools.js';
	export default {
		components: {
			cmdProgress,
			tTable,
			tTh,
			tTr,
			tTd
		},
		data() {
			return {
				loading: false,
				p: null,
				tableList: [],
				aImg: []
			};
		},
		onLoad() {
			var that = this;
			plus.sqlite.selectSql({
				name: 'pineinfect',
				sql: 'select * from Researchtable',
				success: function(data) {
					that.tableList = data;
				}
			});
			// plus.sqlite.selectSql({
			// 	name: 'pineinfect',
			// 	sql: 'select * from Imagetable',
			// 	   success: async function(data) {
			// 		for (let i = 0; i < data.length; i++) {
			// 			console.log(data[i])
			// 			await pathToBase64(data[i].imagecontent).then(async base64 => {
			// 				let comma = base64.indexOf(',');
			// 				let newarr = base64.substring(comma + 1, base64.length);
			// 				that.aImg.push(newarr);
			// 			});
			// 		}
			// 	}
			// });
		},
		methods: {
			//删除表
			Cleantable() {
				plus.sqlite.selectSql({
					name: 'pineinfect',
					sql: 'DROP TABLE Researchtable',
					success: function(data) {
						console.log('删除main数据成功');
					},
					fail: function(e) {
						console.log('删除数据失败');
					}
				});
				plus.sqlite.selectSql({
					name: 'pineinfect',
					sql: 'DROP TABLE Imagetable',
					success: function(data) {
						console.log('删除image数据成功');
					},
					fail: function(e) {
						console.log('删除数据失败');
					}
				});
				uni.reLaunch({
					url: '../startNav/startNav',
					success: () => {
						uni.reLaunch({
							url: '../main/main'
						});
					}
				});
				// uni.showModal({ 
				// 	title: '提示',
				// 	content: '确定删除本地信息?',
				// 	success: function(res) {
				// 		if (res.confirm) {
				// 		}
				// 	}
				// });
			},
			async Send() {
				var that = this
				that.loading = true
				await uni.getNetworkType({
					success: async res => {
						if (res.networkType == '4g' || res.networkType == '5g' || res.networkType == 'wifi') {
							await plus.sqlite.selectSql({
								name: 'pineinfect',
								sql: 'select * from Researchtable',
								success: async function(data) {
									console.log(1)
									for (var i in data) {
										console.log(data)
										console.log(2)
										let resResearch = await addPine(data[i]);
										if (resResearch.data != 1) {
											console.log('重复')
											continue;
										}
										console.log(3)
									}
									
								}
							});
							
							await plus.sqlite.selectSql({
								name: 'pineinfect',
								sql: 'select * from Imagetable',
								success: async function(data) {
									console.log(data)
									for (let i = 0; i < data.length; i++) {
										await pathToBase64(data[i].imagecontent).then(base64 => {
											let comma = base64.indexOf(',');
											let newarr = base64.substring(comma + 1, base64.length);
											that.aImg.push(newarr);
										});
										let resImage = await addImage({
											id: data[i].id,
											imagenum: data[i].imagenum,
											imageorder: data[i].imageorder,
											imagename: data[i].imagename,
											imagecontent: that.aImg[i],
											progress: 1,
											time: data[i].time,
											userid: data[i].userid,
											owner: data[i].owner
										});
										var num = (i + 1) / data.length * 100
										that.p = num.toFixed(2) - 0
									}
							
									that.loading = false;
									uni.showModal({
										showCancel: false,
										title: '提示',
										content: '提交成功。',
										success: res => {
											if (res.confirm) {
												that.Cleantable();
											}
										}
									});
								}
							});

						} else {
							uni.showModal({
								showCancel: false,
								title: '提示',
								content: '网络不佳 请到网络较好的环境重新提交！'
							});
						}
					}
				});

				// uni.redirectTo({
				// 	url: '../startNav/startNav',
				// 	success: () => {
				// 		uni.redirectTo({
				// 			url: '../mainsql/mainsql'
				// 		});
				// 	}
				// });
			}
		}
	};
</script>

<style scoped>
	.btn {
		margin: 50upx;
	}

	.tdd {
		overflow: auto;
	}

	.lh {
		line-height: 100upx;
	}
</style>
