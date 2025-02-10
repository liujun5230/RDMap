<template>
<el-select
	v-model="form_data.is_required"
	:disabled="disabled"
	size="small"
	style="width: 50%;padding-right: 8px;"
>
	<el-option
		label="处理内容非必填"
		:value="HANDLING_ALARM.optional"
	/>
	<el-option
		label="处理内容必填"
		:value="HANDLING_ALARM.required"
	/>
</el-select>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";

import type {FormData} from "./types";
import {HANDLING_ALARM} from "./types";

interface Props {
	defaultFormData: FormData["handling_alarm"],
	disabled: boolean
}
const props = defineProps<Props>();

const form_data = ref<FormData["handling_alarm"]>(props.defaultFormData);

watch(() => props.defaultFormData, (new_form_data) => {
	form_data.value = {...new_form_data};
});

function getApiParams() {
	const {is_required} = form_data.value;
	return {
		alarm_manual_handling_setting: is_required
	};
}

defineExpose({
	getApiParams
});
</script>
