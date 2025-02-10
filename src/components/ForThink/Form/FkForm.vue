<template>
<el-form
	:id="props.cacheKey"
	ref="fk_filter_form"
	inline
	size="small"
	class="fk-filter-form"
	v-bind="$attrs"
	v-on="$listeners"
>
	<slot />
	<span
		v-show="show_fold"
		class="fold-button"
		@click="toggleForm"
	>
		<i
			class="fold-icon"
			:class="fold ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"
		/>
		<span>{{ fold ? "展开" : "收起" }}</span>
	</span>
	<!--直接加载form上loading会作为form最后一个div 选择按钮的选择器会选到loading-->
	<span
		v-loading="is_loading"
		class="form-loading"
	/>
</el-form>
</template>

<script setup>
import {debounce} from "lodash-es";
import {nextTick, onBeforeUnmount, onMounted, ref, watch} from "vue";

import {ADD_FK_FORM_ITEM} from "@/events/form";
import {useEventBus} from "@vueuse/core";
import {useUserStorage} from "@/utils/js/storageByUser";

import "@/utils/css/fkFilterForm.css";

const store = useUserStorage();
const {on: onAddFkFormItem} = useEventBus(ADD_FK_FORM_ITEM);
const DEFAULT_LABEL_WIDTH = 56;
const DEFAULT_MARGIN_LEFT = -31;
const ITEM_WIDTH = 284;
const BUTTON_WIDTH = 146; // 查询 重置
const FOLD_WIDTH = 58; // 收起

let stop;

const fold = ref(true);
const fk_filter_form = ref();
let fk_form_ele;
let has_selectable_input = false;
let has_date_time_picker = false;
const show_fold = ref(true);
const is_loading = ref(true);
const form_items = ref([]);
const props = defineProps({
	cacheKey: {
		type: String,
		default: "fk_filter_form"
	},
	showFoldButton: {
		type: Boolean,
		default: true
	},
	useCache: {
		type: Boolean,
		default: true,
	},
	loading: {
		type: Boolean,
		default: false
	},
	dateTimeWidth: {
		type: Number,
		default: 366
	}
});

watch(
	() => props.loading,
	(val) => {
		if (val) {
			is_loading.value = val;
		} else {
			doLayout();
		}
	}
);

const toggleForm = () => {
	fold.value = !fold.value;
	if (props.useCache) {
		store.setItem(props.cacheKey, fold.value);
	}
	doLayout();
};

function handleReset(form_item_list) {
	for (const form_item of form_item_list) {
		if (form_item?.type === "date-picker") {
			form_item.el?.$parent?.resetFields();
		}
	}
}

onAddFkFormItem((payload) => {
	form_items.value.push(payload);
	if (payload.type === "reset") {
		payload.el.$on("click", () => {
			handleReset(form_items.value);
		});
	}
});

onMounted(() => {
	if (props.showFoldButton && props.useCache) {
		const is_fold = store.getItem(props.cacheKey);
		if (is_fold !== null && is_fold !== undefined) {
			fold.value = is_fold;
		}
	}
	if (!props.showFoldButton) fold.value = false;
	nextTick(() => {
		fk_form_ele = document.getElementById(props.cacheKey);
		props.showFoldButton && setFoldButton();
		handleResize();
	});
});

const getFirstElements = () => {
	const elements = fk_form_ele.getElementsByClassName("el-form-item");
	const firstElements = [];

	// 获取每行第一个元素
	let currentTop = null;
	for (const element of elements) {
		if (element.style.display === "none") continue;
		const elementTop = element.offsetTop;
		// 如果当前元素与上一个元素不在同一行，则将其视为该行的第一个元素
		if (elementTop !== currentTop) {
			firstElements.push(element);
			currentTop = elementTop;
		}
	}

	return firstElements;
};

const setFoldButton = () => { // 把折叠按钮的位置放到重置按钮后
	const eles = fk_form_ele.getElementsByClassName("el-form-item");
	const button_ele = eles[eles.length - 1]?.querySelector(".el-form-item__content");
	const fold_ele = fk_form_ele.getElementsByClassName("fold-button")[0];
	if (button_ele) {
		button_ele.appendChild(fold_ele);
	}
};

const setFoldButtonDisplay = () => {
	if (props.showFoldButton) {
		const count = getContainableItemCount();
		const item_num = fk_form_ele.getElementsByClassName("el-form-item").length - 1; // 最后一个item是button组
		return item_num > count;
	}
	return false;
};

const setFormMargin = (firstElements) => {
	let max_label_width = 0;
	let move_button = false; // 按钮跑到第一个元素可能会被截断

	for (const element of firstElements) {
		const label_ele = element.getElementsByClassName("el-form-item__label")[0];
		if (!label_ele) { // 没有label的元素视为button
			move_button = true;
			continue;
		}
		const label_width = getTextWidth(label_ele);
		if (label_width > max_label_width) {
			max_label_width = label_width;
		}
	}

	// if (!firstElements.length && has_selectable_input) { // 只有可选搜索框
	// 	const label_ele = fk_form_ele.querySelector(".fk-label").getElementsByClassName("el-form-item__label")[0];
	// 	const label_width = getTextWidth(label_ele);
	// 	if (label_width > max_label_width) {
	// 		max_label_width = label_width;
	// 	}
	// }

	max_label_width > DEFAULT_LABEL_WIDTH && (max_label_width = DEFAULT_LABEL_WIDTH);

	fk_form_ele.style.marginLeft = DEFAULT_MARGIN_LEFT - DEFAULT_LABEL_WIDTH + max_label_width + "px";
	const ele = fk_form_ele.getElementsByClassName("el-form-item");
	const ele_button = ele[ele.length - 1];
	if (move_button) {
		ele_button.style.marginLeft = -(DEFAULT_MARGIN_LEFT - DEFAULT_LABEL_WIDTH + max_label_width) - 24 + "px"; // 24是查询按钮的左边距
	} else {
		ele_button.style.marginLeft = 0;
	}
};

const getTextWidth = (el) => {
	const range = getTextWidth.range || (getTextWidth.range = document.createRange());
	range.setStart(el, 0);
	range.setEnd(el, el.childNodes.length);
	const rangeWidth = range.getBoundingClientRect().width;
	return Number(rangeWidth.toFixed(2));
};

function resizeObserver(el, callback, resizeOptions) {
	function stop() {
		observer?.disconnect();
		observer = undefined;
	}

	const isSupported = window && "ResizeObserver" in window;
	let observer;

	if (isSupported) {
		observer = new ResizeObserver(callback);
		observer.observe(el, resizeOptions);
	}

	return stop;
}

const getContainableItemCount = () => {
	const form_width = getCssStyle(fk_form_ele, "width");
	let num;
	let button_width = BUTTON_WIDTH;
	if (props.showFoldButton) {
		button_width += FOLD_WIDTH;
	}
	if (isNaN(form_width) || form_width < button_width) {
		num = 0;
	} else {
		let width = form_width;
		if (has_date_time_picker) width = form_width - props.dateTimeWidth + ITEM_WIDTH;
		width -= button_width;
		num = Math.floor(width / ITEM_WIDTH); // 可以容纳的item数
	}
	return num;
};

const handleFormFold = (is_fold) => {
	let skip_num = 1;
	has_selectable_input && (skip_num += 1);
	const elements = fk_form_ele.getElementsByClassName("el-form-item");
	if (props.showFoldButton && is_fold) {
		let num = getContainableItemCount();
		has_selectable_input && (num -= 1);
		if (elements.length <= skip_num) return;
		for (let i = 0; i < elements.length; i++) {
			if (i >= elements.length - skip_num) { // fold button 和 查询重置
				elements[i].style.display = "inline-flex";
			} else {
				elements[i].style.display = i < num ? "inline-flex" : "none";
			}
		}
	} else {
		for (const element of elements) {
			element.style.display = "inline-flex";
		}
	}
};

const handleResize = () => {
	if (!fk_form_ele) return;
	stop = resizeObserver(fk_form_ele, debounce(() => {
		nextTick(doLayout);
	}, 400, {leading: true}));
};

function getCssStyle(element, prop, number = true) {
	const style = window.getComputedStyle(element, null).getPropertyValue(prop);
	return number === true ? Number(parseFloat(style).toFixed(2)) : style;
}

const doLayout = () => {
	if (!fk_form_ele) return;
	has_selectable_input = !!fk_form_ele.getElementsByClassName("fk-label").length; // 判断是否有可选输入框
	has_date_time_picker = !!fk_form_ele.getElementsByClassName("fk-date-time").length;
	nextTick(() => {
		show_fold.value = setFoldButtonDisplay(); // 一行能显示得下就不显示展开收起按钮
		handleFormFold(fold.value);
		setFormMargin(getFirstElements());
		nextTick(() => {
			if (!props.loading) is_loading.value = false;
		});
	});
};

onBeforeUnmount(stop);

defineExpose({
	doLayout,
	resetFields: () => fk_filter_form.value?.resetFields()
});
</script>

<style scoped lang="scss">
.fk-filter-form {
	position: relative;
}

.fold-button {
	display: inline-block;
	margin-left: 12px;
	cursor: pointer;
	height: 32px;
	line-height: 32px;
	font-size: 14px;

	.fold-icon {
		margin-right: 4px;
	}
}

.form-loading {
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	pointer-events: none;

	:deep(.el-loading-mask) {
		background-color: #fff;
		transition: none;
	}
}

.custom-theme-blue {
	.fold-button {
		color: #07f;
	}

	.fold-button:hover {
		color: #1160BB;
	}

	.fold-button:active {
		color: #23488A;
	}
}

.custom-theme-green {
	.fold-button {
		color: #3EB2A9;
	}

	.fold-button:hover {
		color: #288F87;
	}

	.fold-button:active {
		color: #166B65;
	}
}
</style>
