<template>
<div
	v-show="is_show"
	class="card-reader"
>
	<div
		v-show="reader_status !== READER_STATUS.WAITING"
		class="scan-tips"
		:style="{backgroundColor: reader_status === READER_STATUS.ABNORMAL ? '#E6A23C1A' : '#67C23A1A'}"
	>
		<i
			v-if="reader_status === READER_STATUS.ABNORMAL"
			class="el-icon-warning"
		/>
		<i
			v-if="reader_status === READER_STATUS.NORMAL"
			class="el-icon-success"
		/>
		<span class="tips-scan">{{ reader_status === READER_STATUS.ABNORMAL ? "读卡器或驱动异常 " : ("读卡器和驱动正常，" + tip) }}</span>
		<a
			v-if="reader_status === READER_STATUS.ABNORMAL"
			class="clickable-text"
			:href="drive_download_url"
		>下载驱动</a>
		<span
			v-if="reader_status === READER_STATUS.NORMAL"
			class="clickable-text"
			@click="scanID"
		>点击读卡</span>
	</div>
</div>
</template>

<script setup>
import {drive_download_url} from "@/Config";
import {computed, onBeforeUnmount, ref} from "vue";
import {Notification} from "element-ui";

const READER_STATUS = {
	NORMAL: 1,
	ABNORMAL: 2,
	WAITING: 0
};

const props = defineProps({
	readerType: {
		type: String,
		default: "IDCard" // IDCard or Tag
	}
});

let ws_client = null;
const reader_status = ref(READER_STATUS.WAITING);
const is_show = ref(false);

const tip = computed(() => props.readerType === "IDCard" ? "请放置身份证到身份证读卡器上" : "请放置标签卡到读卡器上");

const scanID = () => {
	if (props.readerType === "IDCard") {
		ws_client.send(JSON.stringify({IDCard_Read: 1}));
	} else if (props.readerType === "Tag") {
		ws_client.send("ReadRFID");
	}
};

const connectID = () => {
	is_show.value = true;
	if (ws_client) {
		ws_client.close();
		ws_client = null;
	}
	if (props.readerType === "IDCard") {
		ws_client = new WebSocket("ws://127.0.0.1:9801/CertID_CVR100");
	} else if (props.readerType === "Tag") {
		ws_client = new WebSocket("ws://127.0.0.1:9801/RFID");
	}
	ws_client.onopen = () => {
		reader_status.value = READER_STATUS.NORMAL;
	};
	ws_client.onerror = () => {
		reader_status.value = READER_STATUS.ABNORMAL;
		ws_client?.close();
		ws_client = null;
	};
	ws_client.onmessage = (msg) => {
		if (props.readerType === "IDCard") { // 身份证读卡器
			const data = JSON.parse(msg.data);
			if (data.type) {
				emits("onmessage", data);
			} else if (data.errCode === -3) {
				Notification({
					type: "error",
					title: "错误",
					message: data.errMsg
				});
			} else {
				Notification({
					type: "error",
					title: "错误",
					message: "无法读取数据，请不要把证件一直放在读卡器上"
				});
			}
		} else if (props.readerType === "Tag") { // 标签读卡器
			const data = msg.data.replace("Card ID:", "");
			if (data === "unConnected") {
				this.$notify({
					type: "warning",
					title: "警告",
					message: "读卡器未连接"
				});
			} else if (data.toLowerCase() === "null") {
				this.$notify({
					type: "error",
					title: "消息",
					message: "无法读取数据"
				});
			} else {
				emits("onmessage", data);
			}
		}
	};
};

const resetReader = () => {
	is_show.value = false;
	reader_status.value = READER_STATUS.WAITING;
	if (ws_client) {
		ws_client.close();
		ws_client = null;
	}
};

onBeforeUnmount(() => {
	ws_client?.close();
});

const emits = defineEmits(["onmessage"]);

defineExpose({connectID, resetReader});
</script>

<style scoped>
.card-reader {
	min-height: 48px;
}

.el-icon-success,
.el-icon-warning {
	padding-left: 8px;
	padding-right: 4px;
}

.el-icon-warning {
	color: #E6A23C;
}

.el-icon-success {
	color: #67C23A;
}

.scan-tips {
	line-height: 28px;
	width: 100%;
	max-width: 552px;
	margin-bottom: 20px;
	border-radius: 5px;
}
</style>
