<template>
<el-select
	v-model="form_data.is_required"
	:popper-append-to-body="false"
	size="small"
	:disabled="disabled"
	style="width: 50%;padding-right: 8px;"
>
	<el-option
		v-for="item in formConfig.handling_alarm_options"
		:key="item.value"
		:label="item.label"
		:value="item.value"
	/>
</el-select>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";

import {DIALOG_MODE} from "@/components/Dialog/constant";

import type {FormData, FormConfig} from "./ruleConfig";

interface Props {
	defaultFormData: FormData["handling_alarm"],
	formConfig: FormConfig,
	disabled: boolean,
	mode: DIALOG_MODE
}
const props = defineProps<Props>();

const form_data = ref<FormData["handling_alarm"]>({} as FormData["handling_alarm"]);

watch(() => props.defaultFormData, (new_form_data) => {
	form_data.value = {...new_form_data};
}, {
	immediate: true
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
