<template>
	<view class="warp">
		<view class="box">
			<t-table @change="change">
				<t-tr>
					<t-th>采伐人员</t-th>
					<t-th>日期</t-th>
					<t-th>疫木编号</t-th>
				</t-tr>
				<t-tr v-for="item in tableList" :key="item.id">
					<t-td class="tdd">{{ item.username }}</t-td>
					<t-td class="tdd ">{{ item.time }}</t-td>
					<t-td class="tdd">{{ item.divsnum }}</t-td>
				</t-tr>
			</t-table>
		</view>
		<view class="btn">
			<button class="feedback-submit" type="primary" @tap="Send">发送</button>
			<button class="feedback-submit" type="primary" @tap="Cleartable">清空存储</button>
		</view>
	</view>
</template>

<script>
import { addSmash } from '../../common/vmeitime-http/';
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
			sql: 'select * from Smashtable',
			success: function(data) {
				that.tableList = data;
			} 
		});
	},
	methods: {
		//删除表
		Cleartable() {
			uni.showModal({
				title: '提示',
				content: '确定删除本地信息?',
				success: function(res) {
					if (res.confirm) {
						plus.sqlite.selectSql({
							name: 'pineinfect',
							sql: 'DROP TABLE Smashtable',
							success: function(data) {
								console.log('删除smash表成功');
							},
							fail: function(e) {
								console.log('删除数据表失败');
							}
						});
						plus.sqlite.selectSql({
							name: 'pineinfect',
							sql: 'DROP TABLE SmashImagetable',
							success: function(data) {
								console.log('删除SmashImagetable表成功');
							},
							fail: function(e) {
								console.log('删除数据表失败');
							}
						});
						uni.reLaunch({
							url: '../startNav/startNav',
							success: () => {
								uni.reLaunch({
									url: '../felling/felling'
								});
							}
						});
					}
				}
			});
		}, 
		Send() {
			plus.sqlite.selectSql({
				name: 'pineinfect',
				sql: 'select * from SmashImagetable',
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
								progress: 6,
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
				sql: 'select * from Smashtable',
				success: async function(data) {
					for (var i in data) {
						let resSmash = await addSmash(data[i]);
						console.log(resSmash);
					}
					uni.showToast({
						title: '信息上传成功'
					});
				}
			});
			uni.redirectTo({
				url: '../startNav/startNav',
				success: () => {
					uni.redirectTo({
						url: '../smashsql/smashsql'
					});
				}
			});
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
