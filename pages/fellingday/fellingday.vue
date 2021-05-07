<template>
    <view class="warp">
        <view class="box">
            <t-table @change="change">
                <t-tr>
                    <t-th>采伐人员</t-th>
                    <t-th>日期</t-th>
                    <t-th>疫木编号</t-th>
                    <t-th>段数</t-th>
                    <t-th>分段编码</t-th>
                </t-tr>
                <t-tr v-for="item in tableList" :key="item.id">
                    <t-td class="tdd">{{ item.username }}</t-td>
                    <t-td class="tdd ">{{ item.time }}</t-td>
                    <t-td class="tdd">{{ item.pinenum }}</t-td>
                    <t-td class="tdd">{{ item.division }}</t-td>
                    <t-td class="tdd">{{ item.divsnum }}</t-td>
                </t-tr>
            </t-table>
        </view>
		<view class="btn">
			<button class="feedback-submit" type="primary" @tap="Look" >查看工作量</button>
			<button class="feedback-submit" type="primary" @tap="Back" >确定</button>
		</view>
    </view>
</template>

<script>
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
				number:'',
				userid: '',
				username:'',
				owner: '',
				classnum: '',
				type: '',
                tableList: [
                ]
            };
        },
		onLoad() {
			try {
				const value = uni.getStorageSync('storage_key');
				if (value) {
					console.log(value)
					this.userid = value.userid
					this.username = value.username
					this.owner = value.userowner
					this.classnum = value.userclassnum
					this.type = value.type
				}
			} catch (e) {
				// error
			}
			
			uni.request({
				url: 'http://39.96.82.150/pineinfect/jaxrs/dataservice/getdealsday',
				method: 'POST',
				header: {
					'Content-Type': 'application/json' //请求头信息
				},
				data: {
					userid: this.userid,
					classnum: this.classnum,
					username: this.username,
					owner: this.owner,
					type: this.type,	
				},
				success: res => {
					console.log(res.data.deal);
					this.tableList = this.tableList.concat(res.data.deal) 
					this.number =res.data.deal.length
				}
			});
		},
        methods: {
			Look(){
				uni.showModal({
					title:'今日砍伐量',
					content:'今日砍伐' + this.number + '颗',
					showCancel: false,
				})
			},
			Back(){
				uni.navigateBack({
					delta: 1
				});
			},
            change(e) {
                console.log(e.detail);
            },
            edit(item) {
                uni.showToast({
                    title: item.name,
                    icon: 'none'
                });
            }
        }
    };
</script>
<style>
.btn{
	margin: 50upx;
}
.tdd {
	overflow: auto;
}
.lh{
	line-height: 100upx;
}
</style>

