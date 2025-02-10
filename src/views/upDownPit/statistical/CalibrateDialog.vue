<template>
<el-dialog
	:visible="time_comment.show"
	:title="time_comment.type ? '设置进入时间' : '设置离开时间'"
	:close-on-click-modal="false"
	append-to-body
	class="time-setting-dialog"
	width="436px"
	@close="handleCloseDialog"
>
	<el-form :model="time_comment">
		<el-form-item
			:label="time_comment.type ? '进入时间' : '离开时间'"
		>
			<el-date-picker
				v-model="time_comment.time"
				type="datetime"
				class="time-picker"
				placeholder="请选择时间"
			/>
		</el-form-item>
	</el-form>
	<template #footer>
		<el-button @click="handleCloseDialog">
			取消
		</el-button>
		<el-button
			type="primary"
			:loading="loading"
			@click="handleSaveDialog"
		>
			保存
		</el-button>
	</template>
</el-dialog>
</template>

<script setup>
import {ref} from "vue";
import {Notification} from "element-ui";
import {inUpDownArea, leaveUpDownArea} from "@/api/pit/pitRecord";
import {useLoading} from "@/composable/useLoading";

const emit = defineEmits(["calibrate-time"]);

const time_comment = ref({
	show: false,
	id: -1,
	uuid: -1,
	time: "",
	type: 0 // 0为离开1为进入
});
const {loading, startLoading, endLoading} = useLoading();

function openCalibrateDialog(row, col, val) {
	if (val) return;
	time_comment.value.show = true;
	time_comment.value.type = col.property === "up_time" ? 0 : 1;
	time_comment.value.time = new Date();
	time_comment.value.id = row.id;
	time_comment.value.uuid = row.uuid;
}

function handleCloseDialog() {
	time_comment.value.show = false;
	// time_comment.value.type = 0;
	// time_comment.value.time = "";
	// time_comment.value.id = -1;
	// time_comment.value.uuid = -1;
}

async function handleSaveDialog() {
	startLoading();
	if (time_comment.value.type) {
		const res = await inUpDownArea({id: time_comment.value.id, uuid: time_comment.value.uuid, in_time: Math.floor(new Date(time_comment.value.time).getTime() / 1000)});
		if (res.data.type === 1) {
			Notification({
				title: "成功",
				type: "success",
				message: res.data.result.msg
			});
			emit("calibrate-time");
		} else {
			Notification({
				title: "错误",
				type: "error",
				message: res.data.result
			});
		}
	} else {
		const res = await leaveUpDownArea({id: time_comment.value.id, uuid: time_comment.value.uuid, leave_time: Math.floor(new Date(time_comment.value.time).getTime() / 1000)});
		if (res.data.type === 1) {
			Notification({
				title: "成功",
				type: "success",
				message: res.data.result.msg
			});
			emit("calibrate-time");
		} else {
			Notification({
				title: "错误",
				type: "error",
				message: res.data.result
			});
		}
	}
	endLoading();
	handleCloseDialog();
}

defineExpose({
	openCalibrateDialog
});
</script>

<style scoped>
.time-setting-dialog {
	display: flex;
	justify-content: center;
	align-items: center;
}

.time-setting-dialog :deep(.el-dialog) {
	margin: 0!important;
}

.time-setting-dialog :deep(.el-form-item__label) {
	line-height: 1;
	margin-bottom: 8px;
}

:deep(.time-picker.el-date-editor.el-input) {
    width: 100%;
	height: 36px;
}

:deep(.time-picker.el-date-editor.el-input .el-input__inner) {
    height: 36px;
}
</style>
