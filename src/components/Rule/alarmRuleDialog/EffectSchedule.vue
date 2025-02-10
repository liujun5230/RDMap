<template>
<div class="effect-schedule">
	<time-select
		v-if="formConfig.effect_schedule_class.date"
		v-model="form_data.effect_date_select"
		label="生效日期"
		:options="formConfig.effect_date_options"
		:show-custom-time="form_data.effect_date_select === EFFECT_DATE.custom"
		:effect-schedule.sync="form_data.effect_date_custom"
		:disabled="disabled"
		type="daterange"
		style="margin-bottom: 16px;"
		@change="changeDateSelect($event)"
	/>
	<time-select
		v-if="formConfig.effect_schedule_class.week"
		ref="week_time_select"
		v-model="form_data.effect_week_select"
		label="重复星期"
		:options="formConfig.effect_week_options"
		:show-custom-time="form_data.effect_week_select === EFFECT_WEEK.custom"
		:effect-schedule.sync="form_data.effect_week_custom"
		:effect-date="form_data.effect_date_select === EFFECT_DATE.all ? undefined : form_data.effect_date_custom"
		:disabled="disabled"
		type="weekrange"
		style="margin-bottom: 16px;"
		@change="changeWeekSelect()"
	/>
	<time-select
		v-if="formConfig.effect_schedule_class.time"
		ref="time_range_select"
		v-model="form_data.effect_time_select"
		label="重复时段"
		:options="formConfig.effect_time_options"
		:show-custom-time="form_data.effect_time_select === EFFECT_TIME.custom"
		:effect-schedule.sync="form_data.effect_time_custom"
		:effect-time-range-list.sync="form_data.effect_time_list"
		:disabled="disabled"
		type="timerange"
		style="margin-bottom: 16px;"
		@change="changeTimeSelect($event)"
	/>
</div>
</template>

<script setup lang="ts">
import {ref, watch, nextTick} from "vue";
import {useDateFormat} from "@vueuse/core";
import {isEqual} from "lodash-es";

import {DIALOG_MODE} from "@/components/Dialog/constant";
import TimeSelect from "@/components/Select/TimeSelect.vue";
import {getRangeShortcut, normalizeSeconds} from "@/utils/js/dateShortcuts";

import type {FormData, FormConfig} from "./ruleConfig";
import {EFFECT_DATE, EFFECT_WEEK, EFFECT_TIME} from "./ruleConfig";

interface Props {
	defaultFormData: FormData["effect_schedule"],
	formConfig: FormConfig,
	disabled: boolean,
	mode: DIALOG_MODE
}
const props = defineProps<Props>();

const form_data = ref<FormData["effect_schedule"]>({} as FormData["effect_schedule"]);
const week_time_select = ref<InstanceType<typeof TimeSelect> | null>(null);
const time_range_select = ref<InstanceType<typeof TimeSelect> | null>(null);

watch(() => props.defaultFormData, (new_form_data) => {
	form_data.value = {
		...new_form_data,
		effect_date_custom: [...new_form_data.effect_date_custom],
		effect_week_custom: [...(new_form_data.effect_week_custom)],
		effect_time_custom: [...new_form_data.effect_time_custom],
		effect_time_list: [...new_form_data.effect_time_list]
	};
	nextTick(() => {
		form_data.value.effect_week_custom = [...(new_form_data.effect_week_custom || [])];
	});
}, {
	immediate: true
});

function getApiParams() {
	const {
		effect_date_select,
		effect_date_custom,
		effect_week_select,
		effect_week_custom,
		effect_time_select,
		effect_time_list
	} = form_data.value;

	const time_obj = effect_time_list.map(([start, end]) => {
		const [h_start, m_start, s_start] = useDateFormat(start, "H-m-s").value.split("-");
		const [h_end, m_end, s_end] = useDateFormat(end, "H-m-s").value.split("-");
		return [
			parseInt(h_start) * 3600 + parseInt(m_start) * 60 + parseInt(s_start),
			parseInt(h_end) * 3600 + parseInt(m_end) * 60 + parseInt(s_end) + (new Date(start).getDate() < new Date(end).getDate() ? 86400 : 0),
		];
	});
	return {
		start_time: effect_date_select === EFFECT_DATE.all ? 0 : Math.floor(effect_date_custom[0].getTime() / 1000),
		end_time: effect_date_select === EFFECT_DATE.all ? 0 : Math.floor(effect_date_custom[1].getTime() / 1000),
		day_json: effect_week_select === EFFECT_WEEK.all ? null : JSON.stringify([...effect_week_custom]),
		time_json: effect_time_select === EFFECT_TIME.all ? null : JSON.stringify(time_obj)
	};
}

function changeDateSelect(value: EFFECT_DATE) {
	if (value === EFFECT_DATE.custom) {
		// 此刻往后30天
		form_data.value.effect_date_custom = getRangeShortcut(0, 3600 * 1000 * 24 * 30, true);
	} else {
		form_data.value.effect_date_custom = [];
	}
}

function changeWeekSelect() {
	form_data.value.effect_week_custom = [];
}

function changeTimeSelect(value: EFFECT_TIME) {
	if (value === EFFECT_TIME.custom) {
		// 此刻往后1小时
		const start = normalizeSeconds(new Date(), "start");
		const end = normalizeSeconds(new Date(start.getTime() + 3600000), "end");
		form_data.value.effect_time_custom = [start, end];
	} else {
		form_data.value.effect_time_custom = [];
		form_data.value.effect_time_list = [];
	}
}

function isTriggerConfirmBox() {
	const {defaultFormData: default_form_data} = props;
	const {effect_date_select, effect_date_custom, effect_week_select, effect_week_custom, effect_time_select, effect_time_list} = form_data.value;
	const old_effect_date_timestamp_custom = default_form_data.effect_date_custom.map((date) => date.getTime());
	const effect_date_timestamp_custom = effect_date_custom.map((date) => date.getTime());
	const is_modify_date = default_form_data.effect_date_select !== effect_date_select || !isEqual(old_effect_date_timestamp_custom, effect_date_timestamp_custom);
	const is_modify_week = default_form_data.effect_week_select !== effect_week_select || !isEqual(default_form_data.effect_week_custom, effect_week_custom);
	const is_modify_time = default_form_data.effect_time_select !== effect_time_select || !isEqual(default_form_data.effect_time_list, effect_time_list);
	if (is_modify_date || is_modify_week || is_modify_time) {
		return true;
	}
	return false;
}

async function verifyForm() {
	const pass_list = await Promise.all([
		week_time_select.value?.verifyForm() ?? Promise.resolve(true),
		time_range_select.value?.verifyForm() ?? Promise.resolve(true),
	]);
	return pass_list.every((is_pass) => is_pass);
}

function clearValidate() {
	week_time_select.value?.clearValidate();
	time_range_select.value?.clearValidate();
}

defineExpose({
	getApiParams,
	isTriggerConfirmBox,
	verifyForm,
	clearValidate
});
</script>
