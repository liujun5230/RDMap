<template>
<el-date-picker
	ref="date_picker"
	:popper-class="popperClass"
	:type="type"
	v-bind="$attrs"
	:range-separator="separator"
	:picker-options="picker_options"
	:value="value"
	v-on="other_listeners"
	@change="onChange"
	@input="updateValue"
/>
</template>
<script setup>

import {
	getLastMonth,
	getLastWeek,
	getLastYear,
	getMonth,
	getNextMonth,
	getNextWeek,
	getNextYear,
	getRangeShortcut,
	getShortcut,
	getWeek,
	getYear,
	getToday,
} from "@/utils/js/dateShortcuts";
import {computed, onMounted, ref, watch, useAttrs, useListeners} from "vue";

import {ADD_FK_FORM_ITEM} from "@/events/form";
import {useEventBus} from "@vueuse/core";
import {useUserStorage} from "@/utils/js/storageByUser";

const {emit: emitAddFkFormItem} = useEventBus(ADD_FK_FORM_ITEM);

const emit = defineEmits(["click-shortcut", "input"]);

const store = useUserStorage();
const date_picker = ref(null);
const props = defineProps({
	value: {
		type: [Date, String, Number, Array],
		default: null
	},
	// 时间选择器类型， 共支持四种类型，date、datetime、datetimerange、daterange
	type: {
		validator(value) {
			return [
				"date",
				"datetime",
				"datetimerange",
				"daterange",
			].includes(value);
		},
		default: "date",
	},

	// 将上一次选择的快捷选项缓存到本地
	useCache: {
		type: Boolean,
		default: false,
	},

	/**
	 * 1. 如果没有设置过快捷选项，将会使用默认值
	 * 2. 如果设置过自定义选项，将会清除快捷选项的缓存，下一次进入页面将会使用默认值
	 */
	defaultValue: {
		type: [String, Number, Date, Array],
		default: "",
	},

	/**
	 * 组件唯一标识，当前页面唯一，主要用于缓存
	 * 如果切换cacheKey，将会重新获取缓存
	 * */
	cacheKey: {
		type: String,
		default: "",
	},

	/**
	 * 同el-date-picker的picker-options
	 */
	pickerOptions: {
		type: Object,
		default: () => ({}),
	},

	rangeSeparator: {
		type: String,
		default: "至"
	},

	popperClass: {
		type: String,
		default: ""
	},

	filterOptions: {
		type: Array,
		default: () => []
	}
});
const attrs = useAttrs();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const {input: ignore_input, ...other_listeners} = useListeners();

const is_click_shortcut = ref(false);

const generator = computed(() => {
	return is_range.value
		? range_shortcuts_generator
		: shortcuts_generator;
});

function updateValue(time) {
	if (!time) return emit("input", time);
	const {type} = props;
	const default_time = attrs["default-time"] ?? ["00:00:00", "00:00:00"];
	const start_seconds = parseInt(default_time[0].split(":")[2]) || 0;
	const end_seconds = parseInt(default_time[1].split(":")[2]) || 0;
	if (type === "datetimerange") {
		// 使用了element的内部方法
		const [start, end] = date_picker.value.parseValue(time);
		start.setSeconds(start_seconds, 0);
		end.setSeconds(end_seconds, 0);
		emit("input", date_picker.value.formatToValue([start, end]));
	} else {
		emit("input", time);
	}
}

function generateTimeFromShortcut(shortcut_text) {
	return generator.value[shortcut_text]?.();
}

function clickShortcut(picker, shortcut_text) {
	if (props.useCache) {
		store.setItem(props.cacheKey, shortcut_text);
	}
	is_click_shortcut.value = true;

	const shortcut = generateTimeFromShortcut(shortcut_text);

	picker.$emit("pick", shortcut);

	emit("click-shortcut", shortcut_text);
}

// 是否是范围选择
const is_range = computed(() => props.type.includes("range"));
const separator = computed(() => is_range.value ? props.rangeSeparator : undefined);

const range_shortcuts_generator = {
	"今天": () => getToday(),
	"昨天": () => getRangeShortcut(-3600 * 1000 * 24, -3600 * 1000 * 24),
	"明天": () => getRangeShortcut(3600 * 1000 * 24, 3600 * 1000 * 24),
	"本周": () => getWeek(),
	"上周": () => getLastWeek(),
	"下周": () => getNextWeek(),
	"本月": () => getMonth(),
	"上个月": () => getLastMonth(),
	"下个月": () => getNextMonth(),
	"今年": () => getYear(),
	"去年": () => getLastYear(),
	"明年": () => getNextYear(),
	"过去7天": () => getRangeShortcut(-3600 * 1000 * 24 * 7, 0, false),
	"将来7天": () => getRangeShortcut(0, 3600 * 1000 * 24 * 7, false),
	"过去30天": () => getRangeShortcut(-3600 * 1000 * 24 * 30, 0, false),
	"将来30天": () => getRangeShortcut(0, 3600 * 1000 * 24 * 30, false),
};

const shortcuts_generator = {
	"今天": () => getShortcut(0),
	"昨天": () => getShortcut(-3600 * 1000 * 24),
	"明天": () => getShortcut(3600 * 1000 * 24),
};

const range_shortcuts = Object.keys(range_shortcuts_generator)
	.filter((text) => !props.filterOptions.includes(text))
	.map((text) => {
		return {
			text,
			onClick(picker) {
				clickShortcut(picker, text);
			}
		};
	});

const not_range_shortcuts = Object.keys(shortcuts_generator)
	.filter((text) => !props.filterOptions.includes(text))
	.map((text) => {
		return {
			text,
			onClick(picker) {
				clickShortcut(picker, text);
			}
		};
	});

const shortcuts = computed(() => {
	if (is_range.value) {
		return range_shortcuts;
	}
	return not_range_shortcuts;
});

const picker_options = computed(() => {
	return {
		firstDayOfWeek: 1,
		...props.pickerOptions,
		shortcuts: {
			...shortcuts.value,
			...props.pickerOptions?.shortcuts,
		},
	};
});

const resolveCacheShortcut = (shortcut) => {
	if (Array.isArray(shortcut)) {
		return shortcut.map((item) => new Date(item));
	}
	return new Date(shortcut);
};

function getLastShortcut() {
	return generateTimeFromShortcut(store.getItem(props.cacheKey));
}

function retrieve() {
	if (props.useCache) {
		if (!props.cacheKey) {
			console.error("useCache 为 true 时，必须设置 cacheKey");
		}
		// 系统里现有页面的默认时间保留。首次进入页面，或上一次自定义选择时间后再进去页面时，筛选为默认时间；
		const last_shortcut = getLastShortcut();
		if (last_shortcut || props.defaultValue) {
			date_picker.value?.emitInput(resolveCacheShortcut(last_shortcut || props.defaultValue));
		}
	} else {
		if (props.defaultValue) {
			date_picker.value?.emitInput(resolveCacheShortcut(props.defaultValue));
		}
	}
}

onMounted(() => {
	emitAddFkFormItem({el: date_picker.value, type: "date-picker"});
	retrieve();
});

watch(() => props.cacheKey, () => {
	retrieve();
});

const popperClass = computed(() => {
	return ["date-picker-popper", props.popperClass].join(" ");
});

const last_margin = computed(() => {
	return is_range.value ? "10px" : "0px";
});

function onChange() {
	if (props.useCache && !is_click_shortcut.value) {
		store.setItem(props.cacheKey, "");
	}
	is_click_shortcut.value = false;
}

function resetFields() {
	store.setItem(props.cacheKey, "");
	retrieve();
}

defineExpose({
	getLastShortcut,
	resetFields,
	date_picker,
});
</script>
<style scoped>
.date-picker.el-date-editor .el-range-separator {
	/* tailwind css 样式会设置box-sizing为border-box 参考bug #16662 */
	box-sizing: content-box;
}
</style>
<style>
.date-picker-popper .el-picker-panel__sidebar :nth-child(3n + 1):not(:last-child):not(:first-child) {
  margin-top: 10px;
}

.date-picker-popper .el-picker-panel__sidebar :nth-last-child(4) {
  margin-top: v-bind('last_margin');
}

.date-picker-popper .el-picker-panel__sidebar :last-child {
  margin-bottom: 15px;
}

.date-picker-popper .el-picker-panel__sidebar  {
	width: 94px;
}

.date-picker-popper.el-date-range-picker.has-sidebar {
	width: 738px !important;
}

.date-picker-popper .el-time-spinner * {
	scroll-behavior: unset;
}

.el-date-range-picker.has-time .el-picker-panel__footer .el-picker-panel__link-btn.el-button--text{
	background: transparent !important;
	color: var(--theme-color) !important;
	border-color: transparent;
	box-shadow: none;
}

.el-date-range-picker.has-time .el-picker-panel__footer .el-picker-panel__link-btn.el-button--text:hover{
	color:var(--theme-button-color-hover) !important;
}

.el-date-range-picker.has-time .el-picker-panel__footer .el-picker-panel__link-btn.el-button--text:active{
	color:var(--theme-button-color-active) !important;
}
</style>
