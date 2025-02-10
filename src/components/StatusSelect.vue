<template>
<el-select
	v-model="status"
	v-bind="$attrs"
	:class="{colorful: cur_color}"
	v-on="$listeners"
	@input="confirmChange"
>
	<el-option
		v-if="$props.hasAll"
		label="全部"
		value=""
	/>
	<el-option
		v-for="option in status_options"
		:key="option.value"
		:label="option.label"
		:value="option.value"
		:style="option.color ? {color: option.color + ' !important'} : {}"
	/>
</el-select>
</template>

<script setup lang="ts">
import {MessageBox} from "element-ui";
import {computed} from "vue";

import {useVModel} from "@vueuse/core";

type StatusOption = {
	color?: string,
	label: string,
	value: number
};

type Props = {
	value: number|string;
	statusOptions?: StatusOption[];
	allSelectable?: boolean;
	validate?: boolean
	validateText?: string
	hasAll?: boolean
}

const emit = defineEmits(["input", "confirm", "cancel"]);

const props = withDefaults(defineProps<Props>(), {
	hasAll: false,
	statusOptions: () => ([
		{
			label: "启用",
			value: 1,
			color: "#67C23A",
		},
		{
			label: "禁用",
			value: 0,
			color: "#F56C6C"
		},
	]),
	validate: false,
	validateText: undefined,

});

const status = useVModel(props, undefined, emit);

const cur_color = computed(() => {
	const cur_status = props.statusOptions.find(item => item.value === status.value);
	return cur_status?.color;
});

const status_options = computed(() => {
	if (props.allSelectable) {
		return [
			{
				label: "全部",
				value: -1,
			},
			...props.statusOptions
		];
	}
	return props.statusOptions;
});

function confirmChange(value: number) {
	// 不需要二次确认
	if (!props.validate)
		return;
	// 仅从启用到禁用需要二次确认
	if (+value === 1)
		return;
	MessageBox.confirm(
		`确定禁用?<br/>${props.validateText}`,
		"禁用",
		{
			confirmButtonText: "确认",
			cancelButtonText: "取消",
			closeOnClickModal: false,
			type: "warning",
			dangerouslyUseHTMLString: true
		}).then(() => {
		emit("confirm");
	}, () => {
		status.value = 1;
		emit("cancel");
	});
}
</script>

<style scoped>
.colorful :deep(.el-input__inner) {
	/* fk-form 当中使用important */
  color: v-bind("cur_color") !important;
}
</style>
