<template>
<div />
</template>
<script>
import {getDiskUsage} from "@/api/company/systemSetting";
import {useSystemConfigStore} from "@/store/useSystemConfigStore";
import {mapStores} from "pinia";
import
{
	getDiskCheckTime,
	setDiskCheckTime,
	getDiskUsageRatioState,
	setDiskUsageRatioState
} from "@/utils/js/sessions.js";

export default {
	data() {
		return {
			disk_usage: "",
			limit: 5120, // 磁盘内存预警值(5G)
			limit_ratio: 0, // 磁盘使用率预警值
			ratio_alarm: false,
			usage_alarm: false,
			dialogExists: false, // 当前是否存在弹窗
		};
	},
	computed: {
		...mapStores(useSystemConfigStore)
	},
	watch: {
		dialogExists() {
			const ms_per_hour = 60 * 60 * 1000;
			// 当前弹窗不存在,就每小时检查一次小于5g的报警弹窗
			if (this.dialogExists === false) {
				setTimeout(async () => {
					await this.checkDiskUsage();
					await this.newUsageAlarm();
				}, ms_per_hour);
			}

			// 六个小时检查一次占用率的报警弹窗
			if (this.dialogExists === false) {
				setTimeout(async () => {
					await this.checkDiskUsage();
					await this.newRatioAlarm();
				}, ms_per_hour * 6);
			}
		}
	},
	mounted() {
		new Promise(resolve => {
			const last_time = getDiskCheckTime();
			const now_time = +(new Date());
			if (last_time) {
				setTimeout(resolve, now_time - last_time);
			} else {
				resolve();
			}
		}).then(this.checkDiskUsage)
			.catch(() => console.warn("无法获取磁盘相关信息"))
			.then(async () => {
				if (this.disk_usage) {
					await this.newUsageAlarm();
					await this.newRatioAlarm();
				}
			});
	},
	methods: {
		// 初始化磁盘占用率 预警值信息
		async getDiskInfo() {
			await Promise.all([getDiskUsage(), this.systemConfigStore])
				.then(([res_usage,]) => {
					if (res_usage.data.type !== 1) {
						throw new Error("无法获取磁盘信息");
					}

					const disk_config = this.systemConfigStore.getNumberValue("DISK_USAGE_LIMIT");
					this.disk_usage = res_usage.data.result;
					if (this.disk_usage) {
						const ratio = this.disk_usage["max_ratio"];
						this.disk_usage["ratio"] = +(ratio.slice(0, -1));
						this.limit_ratio = disk_config;
					}
				});
		},
		async checkDiskUsage() {
			await this.getDiskInfo();
			this.setCondition();
		},
		setCondition() {
			const {capacity, total, ratio} = this.disk_usage;
			if (this.limit > (capacity - total)) {
				this.usage_alarm = true;
			} else {
				this.usage_alarm = false;
			}
			if (this.limit_ratio <= ratio) {
				this.ratio_alarm = true;
			} else {
				this.ratio_alarm = false;
			}
		},
		async newUsageAlarm() {
			if (this.dialogExists) return;
			// 上次检查的时间距今不超过一小时就不检查
			const now_timestamp = Date.now();
			const last_time = getDiskCheckTime();
			const ms_per_hour = 1000 * 60 * 60;
			if (last_time && (now_timestamp - last_time) < ms_per_hour) {
				return;
			}
			if (this.usage_alarm) {
				// 不足5G
				this.dialogExists = true;
				return this.$fkMsgbox.confirm("提示", "磁盘剩余容量不足5G，无法完成数据写入，", "请联系管理员进行数据清理或者升级存储容量", {
					type: "error",
					beforeClose: (action, instance, done) => {
						this.dialogExists = false;
						setDiskCheckTime(Date.now());
						done();
					}
				});
			}
		},
		async newRatioAlarm() {
			const ratio_state = getDiskUsageRatioState();
			if (this.ratio_alarm && !ratio_state) {
				// 占用率达到预警值
				this.dialogExists = true;
				return this.$fkMsgbox.confirm("提示", `磁盘占用率达到${this.disk_usage.ratio}%，您的数据存在无法写入的风险，`, "请联系管理员进行数据清理或升级存储容量", {
					beforeClose: (action, instance, done) => {
						this.dialogExists = false;
						setDiskUsageRatioState(1);
						done();
					}
				});
			}
		}
	}
};

</script>

<style scoped>
:deep(.el-message-box__title) {
	background-color: gray;
}

</style>
