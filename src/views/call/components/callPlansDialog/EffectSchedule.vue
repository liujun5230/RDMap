<template>
<div class="effect-schedule">
	<time-select
		v-if="type === 'plans'"
		v-model="form_data.effect_date_select"
		label="生效日期"
		:options="[
			{label: '全部日期', value: EFFECT_DATE.all},
			{label: '自定义', value: EFFECT_DATE.custom},
		]"
		:show-custom-time="form_data.effect_date_select === EFFECT_DATE.custom"
		:effect-schedule.sync="form_data.effect_date_custom"
		:disabled="disabled"
		type="daterange"
		style="margin-bottom: 16px;"
		@change="changeDateSelect($event)"
	/>
	<time-select
		v-if="type === 'plans'"
		ref="week_time_select"
		v-model="form_data.effect_week_select"
		label="重复星期"
		:options="[
			{label: '全部星期', value: EFFECT_WEEK.all},
			{label: '自定义', value: EFFECT_WEEK.custom},
		]"
		:show-custom-time="form_data.effect_week_select === EFFECT_WEEK.custom"
		:effect-schedule.sync="form_data.effect_week_custom"
		:effect-date="form_data.effect_date_select === EFFECT_DATE.all ? undefined : form_data.effect_date_custom"
		:disabled="disabled"
		type="weekrange"
		style="margin-bottom: 16px;"
	/>
	<time-select
		v-if="type === 'plans'"
		ref="time_select"
		v-model="form_data.effect_time_select"
		label="重复时刻"
		:options="[
			{label: '自定义', value: EFFECT_TIME.custom},
		]"
		:show-custom-time="form_data.effect_time_select === EFFECT_TIME.custom"
		:effect-schedule.sync="form_data.effect_time_custom"
		:effect-time-list.sync="form_data.effect_time_list"
		:disabled="disabled"
		type="time"
		style="margin-bottom: 16px;"
		@change="changeTimeSelect($event)"
	/>
	<div
		v-if="type === 'task'"
		class="call-task-time"
	>
		<label class="call-time-label">点名时间</label>
		<el-input
			size="small"
			disabled
			:value="callTime"
		/>
	</div>
	<el-form
		ref="form_ref"
		class="offset-time-form"
		size="small"
		:model="form_data"
		:disabled="disabled"
		inline
		label-position="left"
	>
		<el-form-item
			label="允许时差"
			prop="offset_time"
		>
			<el-input
				:value="form_data.offset_time"
				placeholder="请输入"
				@input="updateOffsetTime"
			>
				<template #append>
					<el-select
						v-model="form_data.offset_time_unit"
					>
						<el-option
							label="秒"
							:value="OFFSET_TIME_UNIT.second"
						/>
						<el-option
							label="分钟"
							:value="OFFSET_TIME_UNIT.minute"
						/>
						<el-option
							label="小时"
							:value="OFFSET_TIME_UNIT.hour"
						/>
					</el-select>
				</template>
			</el-input>
		</el-form-item>
	</el-form>
</div>
</template>

<script setup lang="ts">
import {nextTick, ref, watch} from "vue";
import {useDateFormat} from "@vueuse/core";

import TimeSelect from "@/components/Select/TimeSelect.vue";
import {DIALOG_MODE} from "@/components/Dialog/constant";
import {getRangeShortcut, normalizeSeconds} from "@/utils/js/dateShortcuts";

import type {FormData} from "./types";
import {EFFECT_DATE, EFFECT_WEEK, EFFECT_TIME, OFFSET_TIME_UNIT} from "./types";

interface Props {
	defaultFormData: FormData["effect_schedule"],
	disabled: boolean,
	type: "plans" | "task",
	mode: DIALOG_MODE,
	callTime?: string
}
const props = defineProps<Props>();

const form_data = ref<FormData["effect_schedule"]>(props.defaultFormData);
const week_time_select = ref<InstanceType<typeof TimeSelect> | null>(null);
const time_select = ref<InstanceType<typeof TimeSelect> | null>(null);

watch(() => props.defaultFormData, (new_form_data) => {
	form_data.value = {
		...new_form_data,
		effect_date_custom: [...new_form_data.effect_date_custom],
		effect_week_custom: [...(new_form_data.effect_week_custom)],
		effect_time_list: [...new_form_data.effect_time_list]
	};
	nextTick(() => {
		form_data.value.effect_week_custom = [...new_form_data.effect_week_custom];
	});
});

function updateOffsetTime(value: string) {
	form_data.value.offset_time = value.replace(/[^\d]/g, "");
}

function getApiParams() {
	const {
		effect_date_select,
		effect_date_custom,
		effect_week_select,
		effect_week_custom,
		effect_time_select,
		effect_time_list,
		offset_time,
		offset_time_unit
	} = form_data.value;

	const roll_call_time_obj = effect_time_list.map((time) => {
		const [h, m, s] = useDateFormat(time, "H-m-s").value.split("-");
		return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s);
	});

	return {
		offset_time: parseInt(offset_time) || 0,
		metering: offset_time_unit,
		start_time: effect_date_select === EFFECT_DATE.all ? 0 : Math.floor(effect_date_custom[0].getTime() / 1000),
		end_time: effect_date_select === EFFECT_DATE.all ? 0 : Math.floor(effect_date_custom[1].getTime() / 1000),
		day_json: effect_week_select === EFFECT_WEEK.all ? null : JSON.stringify([...effect_week_custom]),
		roll_call_time_json: effect_time_select === EFFECT_TIME.all ? null : JSON.stringify(roll_call_time_obj)
	};
}

function changeDateSelect(value: EFFECT_DATE) {
	if (value === EFFECT_DATE.custom) {
		// 此刻往后30天
		form_data.value.effect_date_custom = getRangeShortcut(0, 3600 * 1000 * 24 * 30, true);
	}
}

function changeTimeSelect(value: EFFECT_TIME) {
	if (value === EFFECT_TIME.custom) {
		// 此刻
		const now = normalizeSeconds(new Date(), "start");
		form_data.value.effect_time_custom = now;
	}
}

async function verifyForm() {
	const pass_list = await Promise.all([
		week_time_select.value?.verifyForm() ?? Promise.resolve(true),
		time_select.value?.verifyForm() ?? Promise.resolve(true),
	]);
	return pass_list.every((is_pass) => is_pass);
}

function clearValidate() {
	week_time_select.value?.clearValidate();
	time_select.value?.clearValidate();
}

defineExpose({
	getApiParams,
	verifyForm,
	clearValidate
});
</script>

<style scoped lang="scss">
.effect-schedule {
	:deep(.el-form-item__content .el-input) {
		.el-input-group__append {
			background-color: #fff;

			.el-select .el-input {
				width: 80px;

				.el-input__inner {
					border-top-left-radius: 0;
					border-bottom-left-radius: 0;
					border-left: none;
					border-color: #d1d8e1;
				}
			}
		}
	}

	.call-task-time {
		margin-bottom: 16px;
		display: flex;
		align-items: center;
		width: 50%;

		.call-time-label {
			flex: 0 0 auto;
			padding-right: 12px;
		}

		.el-input {
			width: 264px;
		}
	}
}
</style>
