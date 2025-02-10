<template>
<div
	ref="container_ref"
	class="time-select-container"
>
	<base-select
		:value="value"
		:label="label"
		:options="options"
		:disabled="base_select_disabled"
		class="time-select-component"
		:class="{'error-validator': show_error_tip}"
		:style="base_select_style"
		@input="emits('input', $event)"
		@change="emits('change', $event)"
	>
		<fk-date-picker
			v-if="type === 'daterange' && showCustomTime"
			class="time-select-daterange"
			:value="effectSchedule"
			:clearable="false"
			:disabled="disabled"
			type="daterange"
			size="small"
			prefix-icon="none"
			:default-time="['00:00:00', '23:59:59']"
			@input="emits('update:effectSchedule', $event)"
		/>

		<el-checkbox-group
			v-if="type === 'weekrange' && showCustomTime"
			class="time-select-weekrange"
			:disabled="disabled"
			:value="effectSchedule"
			@input="emits('update:effectSchedule', $event)"
			@change="changeCheckboxGroup"
		>
			<el-checkbox-button
				:label="0"
				:disabled="!weekranges.includes(0)"
			>
				一
			</el-checkbox-button>
			<el-checkbox-button
				:label="1"
				:disabled="!weekranges.includes(1)"
			>
				二
			</el-checkbox-button>
			<el-checkbox-button
				:label="2"
				:disabled="!weekranges.includes(2)"
			>
				三
			</el-checkbox-button>
			<el-checkbox-button
				:label="3"
				:disabled="!weekranges.includes(3)"
			>
				四
			</el-checkbox-button>
			<el-checkbox-button
				:label="4"
				:disabled="!weekranges.includes(4)"
			>
				五
			</el-checkbox-button>
			<el-checkbox-button
				:label="5"
				:disabled="!weekranges.includes(5)"
			>
				六
			</el-checkbox-button>
			<el-checkbox-button
				:label="6"
				:disabled="!weekranges.includes(6)"
			>
				日
			</el-checkbox-button>
		</el-checkbox-group>

		<div
			v-if="type === 'time' && showCustomTime"
			class="time-wrap"
		>
			<el-time-picker
				class="time-select-time"
				:value="effectSchedule"
				:clearable="false"
				format="HH:mm"
				size="small"
				:editable="false"
				:disabled="disabled"
				prefix-icon="none"
				popper-class="time-select-time-panel"
				@input="updateTime"
			/>
			<label-button
				size="medium"
				:disabled="disabled"
				@click="handleButtonClick"
			>
				添加时刻
			</label-button>
		</div>

		<div
			v-if="type === 'timerange' && showCustomTime"
			class="time-wrap"
		>
			<div>
				<el-time-picker
					:value="effectSchedule[0]"
					:clearable="false"
					format="HH:mm"
					size="small"
					:editable="false"
					:disabled="disabled"
					prefix-icon="none"
					class="time-range-item"
					@input="(val) => updateTime([val, effectSchedule[1]])"
				/>
				<span style="margin: 0 8px;">至</span>
				<el-time-picker
					:value="effectSchedule[1]"
					:clearable="false"
					format="HH:mm"
					size="small"
					:editable="false"
					:disabled="disabled"
					prefix-icon="none"
					class="time-range-item"
					@input="(val) => updateTime([effectSchedule[0], val])"
				/>
				<div
					v-show="show_tomorrow"
					class="tomorrow"
				>
					次日
				</div>
			</div>
			<label-button
				v-if="showAddButton"
				size="medium"
				:disabled="disabled"
				@click="handleButtonClick"
			>
				添加时段
			</label-button>
		</div>

		<template #error>
			<p
				v-show="show_error_tip && error_tip_map[type]"
				class="error-tip"
			>
				{{ error_tip_map[type] }}
			</p>
		</template>
	</base-select>

	<div v-show="type === 'time' && showCustomTime">
		<el-tag
			v-for="(time, index) in effectTimeList"
			:key="`${index}`"
			class="select-tag"
			:closable="!disabled"
			disable-transitions
			@close="removeTag(index, 'time')"
		>
			{{ useDateFormat(time, 'HH:mm').value }}
		</el-tag>
	</div>
	<div v-show="type === 'timerange' && showCustomTime">
		<el-tag
			v-for="(item, index) in effectTimeRangeList"
			:key="`${index}`"
			class="select-tag"
			:closable="!disabled"
			disable-transitions
			@close="removeTag(index, 'timerange')"
		>
			{{ formatTimeRange(item) }}
		</el-tag>
	</div>
</div>
</template>

<script setup lang="ts">
import {ref, computed, watch, onMounted} from "vue";
import {useDateFormat} from "@vueuse/core";
import {cloneDeep, isEqual} from "lodash-es";

import type {Option} from "@/types/global";
import FkDatePicker from "@/components/ForThink/Form/FkDatePicker.vue";
import LabelButton from "@/components/Button/LabelButton.vue";
import {getWeekRanges} from "@/utils/js/tools/time";
import {normalizeHMS, normalizeSeconds} from "@/utils/js/dateShortcuts";

import BaseSelect from "./BaseSelect.vue";

const emits = defineEmits<{
	(event: "input", value: any): void,
	(event: "change", value: any): void,
	(event: "update:effectSchedule", value: any): void,
	(event: "update:effectTimeList", value: number[]): void,
	(event: "update:effectTimeRangeList", value: number[][]): void,
	(event: "add", value: Date | Date[], tag_list: number[] | number[][]): void,
}>();

type SelectOption<T> = Omit<Option<T>, "id">;
export interface Props {
	label: string,
	value: string,
	options: SelectOption<string>[],
	showCustomTime: boolean,
	effectSchedule: any,
	type: "daterange" | "weekrange" | "time" | "timerange",
	effectTimeList?: number[],
	effectTimeRangeList?: number[][],
	// "no-repeat"——两个时间段的start或end不相等即可；
	// "no-overlapping"——两个时间段不能存在重叠，允许18:00-19:00,19:00-20:00；
	// "strict-no-overlapping"——两个时间段的完全不重叠，不允许18:00-19:00,19:00-20:00；
	timeRangeRule?: "no-repeat" | "no-overlapping" | "strict-no-overlapping",
	effectDate?: Date[], // 选择的生效日期
	disabled?: boolean,
	showAddButton?: boolean,
}
const props = withDefaults(defineProps<Props>(), {
	effectTimeList: () => [],
	effectTimeRangeList: () => [],
	timeRangeRule: "no-repeat",
	effectDate: undefined,
	disabled: false,
	showAddButton: true
});

const container_ref = ref<HTMLDivElement | null>(null);
const base_select_style = ref<Record<string, string>>();
const weekranges = ref([0, 1, 2, 3, 4, 5, 6]);
const show_error_tip = ref(false);
const error_tip_map = {
	daterange: "",
	weekrange: "请至少选择一项",
	timerange: "请至少选择1个时段",
	time: "请至少选择1个时刻"
};

const base_select_disabled = computed(() => {
	if (props.options.length <= 1) {
		return true;
	} else {
		return props.disabled;
	}
});

watch(() => props.effectDate, (effect_date) => {
	const {type} = props;
	if (type !== "weekrange") return;
	updateTime([]);
	if (effect_date) {
		const [start, end] = effect_date;
		weekranges.value = getWeekRanges(start, end);
	} else {
		weekranges.value = [0, 1, 2, 3, 4, 5, 6];
	}
}, {immediate: true});
watch(() => props.showCustomTime, (show_custom) => {
	if (!show_custom) {
		show_error_tip.value = false;
	}
}, {immediate: true});

const show_tomorrow = computed(() =>
	props.type === "timerange"
	&& props.showCustomTime
	&& props.effectSchedule[1]?.getDate() > props.effectSchedule[0]?.getDate()
);

onMounted(() => {
	base_select_style.value = extractCssVariables();
});

function extractCssVariables() {
	const style = getComputedStyle(container_ref.value!);

	return {
		"--label-mr": style.getPropertyValue("--label-mr"),
		"--select-mr": style.getPropertyValue("--select-mr"),
		"--select-w": style.getPropertyValue("--select-w") || "268px",
		"--select-h": style.getPropertyValue("--select-h"),
	};
}

function changeCheckboxGroup(data: number[]) {
	show_error_tip.value = !data.length;
}

function updateTime(value: Date | Date[]) {
	if (Array.isArray(value)) {
		if (value.length) {
			value[0] = normalizeSeconds(value[0], "start");
			value[1] = normalizeSeconds(value[1], "end");
			const [start, end] = cloneDeep(value);
			const start_timestamp = start.getTime();
			const end_timestamp = end.getTime();
			normalizeHMS(start, "start"); // 会改变Date对象
			normalizeHMS(end, "start");
			if (start_timestamp - start.getTime() >= end_timestamp - end.getTime()) { // 开始时间小毫秒数大于结束时间毫秒数，则结束时间为次日
				value[1].setDate(value[0].getDate() + 1);
			} else {
				value[1].setDate(value[0].getDate());
			}
		}
	} else {
		value.setSeconds(0, 0);
	}
	emits("update:effectSchedule", value);
}

function handleButtonClick() {
	const {type, effectSchedule} = props;
	let data = effectSchedule;
	if (type === "timerange") {
		if (effectSchedule.length) {
			data[0] = normalizeSeconds(effectSchedule[0], "start");
			data[1] = normalizeSeconds(effectSchedule[1], "end");
		}
		addTimeRange(data);
	} else if (type === "time") {
		data = new Date(effectSchedule);
		data.setSeconds(0, 0);
		addTime(data);
	}
}

function addTimeRange(value: Date[]) {
	const {effectTimeRangeList, timeRangeRule} = props;
	const temp_list = effectTimeRangeList.map((list) => [...list]);
	try {
		const select_time = value.map((time) => time.getTime());
		if (select_time.length) {
			if (timeRangeRule === "no-repeat") {
				// 新增的时间段在已选择的中已经存在，忽略
				const is_exist = temp_list.some((time_list) => isEqual(time_list, select_time));
				is_exist || temp_list.push(select_time);
			} else {
				const [select_start, select_end] = select_time;
				const is_overlapping = temp_list.some(([start, end]) => {
					if (timeRangeRule === "no-overlapping") {
						const is_intersection = (select_start > start && select_start < end) || (select_end > start && select_end < end);
						const is_include = (select_start <= start && select_end >= end) || (select_start >= start && select_end <= end);
						return is_intersection || is_include;
					} else if (timeRangeRule === "strict-no-overlapping") {
						const is_intersection = (select_start >= start && select_start <= end) || (select_end >= start && select_end <= end);
						const is_include = (select_start <= start && select_end >= end) || (select_start >= start && select_end <= end);
						return is_intersection || is_include;
					} else {
						return false;
					}
				});
				is_overlapping || temp_list.push(select_time);
			}
			show_error_tip.value = !temp_list.length;
			emits("update:effectTimeRangeList", [...temp_list]);
			emits("add", [...value], [...temp_list]);
		}
	} catch (error) {
		console.debug(error);
	}
}

function addTime(value: Date) {
	const {effectTimeList} = props;
	let temp_list = [...effectTimeList];
	try {
		temp_list.push(value.getTime());
		temp_list = [...new Set(temp_list)];
		show_error_tip.value = !temp_list.length;
		emits("update:effectTimeList", [...temp_list]);
		emits("add", value, [...temp_list]);
	} catch (error) {
		console.debug(error);
	}
}

function removeTag(index: number, type: "timerange" | "time") {
	const {effectTimeList, effectTimeRangeList} = props;
	if (type === "timerange") {
		const temp_list = effectTimeRangeList.map((list) => [...list]);
		temp_list.splice(index, 1);
		show_error_tip.value = !temp_list.length;
		emits("update:effectTimeRangeList", [...temp_list]);
	}
	if (type === "time") {
		const temp_list = [...effectTimeList];
		temp_list.splice(index, 1);
		show_error_tip.value = !temp_list.length;
		emits("update:effectTimeList", [...temp_list]);
	}
}

function formatTimeRange(item: number[]) {
	const [start, end] = item;
	const start_str = useDateFormat(start, "HH:mm").value;
	const end_str = useDateFormat(end, "HH:mm").value;
	return `${start_str}至${new Date(end).getDate() > new Date(start).getDate() ? "次日" : ""}${end_str}`;
}

function verifyForm() {
	const {type, showCustomTime, effectSchedule, effectTimeList, effectTimeRangeList} = props;
	let is_pass = true;
	if (type === "weekrange") {
		is_pass = !showCustomTime ? true : Boolean(effectSchedule.length);
	} else if (type === "timerange") {
		is_pass = !showCustomTime ? true : Boolean(effectTimeRangeList.length);
	} else if (type === "time") {
		is_pass = !showCustomTime ? true : Boolean(effectTimeList.length);
	}
	show_error_tip.value = !is_pass;
	return Promise.resolve(is_pass);
}

function clearValidate() {
	show_error_tip.value = false;
}

defineExpose({
	verifyForm,
	clearValidate
});
</script>

<style lang="scss">
.time-select-time-panel.el-time-panel {
	min-width: 224px;
}
</style>
<style lang="scss" scoped>
.time-select-container {
	--tag-color: #748ba4;
	--tag-bg: #f3f7fa;
	--tag-hover-bg: #a2b2c2;
}

.time-select-weekrange.el-checkbox-group {
	flex: 1 1 0;
	display: flex;

	:deep(.el-checkbox-button) {
		flex: 1 1 0;
	}

	:deep(.el-checkbox-button__inner) {
		display: inline-block;
		width: 100%;
		font-size: 14px;
		padding: 8px 16px;
	}

	:deep(.el-checkbox-button.is-checked .el-checkbox-button__inner) {
		background-color: var(--theme-color);
	}
}

.time-select-daterange.el-range-editor {
	:deep(.el-range-input) {
		color: var(--theme-text-color-normal);
	}

	:deep(.el-range-separator) {
		width: 8%;
		color: var(--theme-text-color-normal);
	}
}

.time-wrap {
	display: flex;
	column-gap: 12px;
}

.time-select-time.el-date-editor--time.el-date-editor {
	width: 224px;

	:deep(.el-input__inner) {
		text-align: center;
	}
}

.el-date-editor.el-input.time-range-item {
	width: 82px;
	:deep(.el-input__inner) {
		padding: 8px;
		text-align: center;
	}
}

.tomorrow {
	display: inline-block;
	padding: 0 1px;
	margin-left: 4px;
	line-height: 14px;
	font-size: 12px;
	border-radius: 4px;
	border: 1px solid var(--theme-color);
	color: var(--theme-color);
}

.select-tag.el-tag.el-tag--light {
	margin: 8px 8px 0 0;
	background-color: var(--tag-bg);
	border: none;
	border-radius: 50px;
	font-size: 12px;
	color: var(--tag-color);
	height: 26px;
	line-height: 24px;

	:deep(.el-tag__close) {
		color: var(--tag-color);
		font-size: 12px;
		width: 14px;
		height: 14px;
	}

	&:hover {
		cursor: pointer;

		:deep(.el-tag__close) {
			color: #fff;
			background-color: var(--tag-hover-bg);
		}
	}
}

.error-tip {
	margin: 0;
	padding: 0;
	color: var(--table-passive-text);
	font-size: 12px;
	line-height: 1;
	position: absolute;
	bottom: -13px;
}

.error-validator.time-select-component {
	:deep(.el-select .el-input) {
		border: 1px solid var(--table-passive-text);
		border-radius: 5px;
	}
}
</style>
