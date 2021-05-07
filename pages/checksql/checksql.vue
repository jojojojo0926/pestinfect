<template>
	<view class="warp">
		<view class="box">
			<t-table >
				<t-tr>
					<t-th>采伐人员</t-th>
					<t-th>日期</t-th>
					<t-th>疫木编号</t-th>
				</t-tr>
				<t-tr v-for="(item,index) in tableList" :key="index">
					<t-td class="tdd">{{ item.username }}</t-td>
					<t-td class="tdd ">{{ item.time }}</t-td>
					<t-td class="tdd">{{ item.stumpnum }}</t-td>
				</t-tr>
			</t-table>
		</view>
		<view class="btn">
			<button class="feedback-submit" type="primary" @tap="Send">发送</button>
			<!-- <button class="feedback-submit" type="primary" @tap="Cleartable">清空存储</button> -->
		</view>
	</view>
</template>

<script>
import { addCheck } from '../../common/vmeitime-http/';
import { addImage } from '../../common/vmeitime-http/';
import tTable from '@/components/t-table/t-table.vue';
import tTh from '@/components/t-table/t-th.vue';
import tTr from '@/components/t-table/t-tr.vue';
import tTd from '@/components/t-table/t-td.vue';
export default {
	components: {
		tTable,
		tTh,
		tTr,
		tTd
	},
	data() {
		return {
			tableList: []
		};
	},
	onLoad() {
		var that = this;
		plus.sqlite.selectSql({
			name: 'pineinfect',
			sql: 'select * from Checktable',
			success: function(data) {
				that.tableList = data;
			}
		});
	},
	methods: {
		//删除表
		Cleartable() {
			plus.sqlite.selectSql({
				name: 'pineinfect',
				sql: 'DROP TABLE Checktable',
				success: function(data) {
					console.log('删除check表成功');
				},
				fail: function(e) {
					console.log('删除数据表失败');
				}
			});
			plus.sqlite.selectSql({
				name: 'pineinfect',
				sql: 'DROP TABLE Imagetable',
				success: function(data) {
					console.log('删除image表成功');
				},
				fail: function(e) {
					console.log('删除数据表失败');
				}
			});
			uni.reLaunch({
				url: '../startNav/startNav',
				success: () => {
					uni.reLaunch({
						url: '../check/check'
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
		Send() {
			uni.getNetworkType({
				success: async res => {
					console.log(res);
					if (res.networkType == '3g' || res.networkType == '4g' || res.networkType == 'wifi') {
						plus.sqlite.selectSql({
							name: 'pineinfect',
							sql: 'select * from Imagetable',
							success: async function(data) {
								var Imgcontent;
								// 第一次循环 循环数据条数
								for (var i = 0; i < data.length; i++) {
									Imgcontent = data[i].imagecontent.split(';');
									Imgcontent.pop();
									for (var j = 0; j < Imgcontent.length; j++) {
										let resImage = await addImage({
											id: data[i].id,
											imagenum: data[i].imagenum,
											imageorder: j,
											imagename: j + '.' + data[i].houzhui,
											imagecontent: Imgcontent[j],
											progress: 8,
											time: data[i].time,
											userid: data[i].userid,
											owner: data[i].owner
										});
									}
								}
								uni.showToast({
									title: '图片上传成功'
								});
							}
						});
						plus.sqlite.selectSql({
							name: 'pineinfect',
							sql: 'select * from Checktable',
							success: async function(data) {
								for (var i in data) {
									let resCheck = await addCheck(data[i]);
								}
								uni.showToast({
									title: '信息上传成功'
								});
							}
						});
						uni.showModal({
							showCancel: false,
							title: '提示',
							content: '提交成功。',
							success: res => {
								if (res.confirm) {
									this.Cleartable();
								}
							}
						});
					} else {
						uni.showModal({
							showCancel: false,
							title: '提示',
							content: '网络不佳 请到网络较好的环境重新提交！',
						});
					}
				}
			});

			// uni.redirectTo({
			// 	url: '../startNav/startNav',
			// 	success: () => {
			// 		uni.redirectTo({
			// 			url: '../checksql/checksql'
			// 		});
			// 	}
			// });
		}
	}
};
</script>
<style>
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
