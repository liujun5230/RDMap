<template>
<div
	ref="container_ref"
	class="tag-select-container"
>
	<base-select
		:value="props.value"
		:label="label"
		:options="options"
		:disabled="base_select_disabled"
		:style="base_select_style"
		@input="emits('input', $event)"
	>
		<label-button
			v-if="showCustomButton"
			size="medium"
			:disabled="props.disabled"
			@click="handleButtonClick"
		>
			{{ `添加${label}` }}
		</label-button>
	</base-select>
	<div v-show="showCustomButton">
		<el-tag
			v-for="item in checkedList"
			:key="`${item.type}-${item.id}`"
			class="select-tag"
			:closable="!disabled"
			disable-transitions
			@close="removeTag(item)"
		>
			{{ formatSelectName(item) }}
		</el-tag>
	</div>
</div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from "vue";

import LabelButton from "@/components/Button/LabelButton.vue";
import type {CheckedItem} from "@/components/Dialog/constant";
import type {Option} from "@/types/global";

import BaseSelect from "./BaseSelect.vue";

const emits = defineEmits<{
	(event: "input", value: any): void,
	(event: "update:checkedList", value: CheckedItem[]): void,
	(event: "open-dialog"): void
}>();

type SelectOption<T> = Omit<Option<T>, "id">;
export interface Props {
	label: string,
	value: string,
	options: SelectOption<string>[],
	showCustomButton: boolean,
	checkedList: CheckedItem[],
	disabled?: boolean
}
const props = withDefaults(defineProps<Props>(), {
	disabled: false,
});

const container_ref = ref<HTMLDivElement | null>(null);
const base_select_style = ref<Record<string, string>>();

const base_select_disabled = computed(() => {
	if (props.options.length <= 1) {
		return true;
	} else {
		return props.disabled;
	}
});

onMounted(() => {
	base_select_style.value = extractCssVariables();
});

function extractCssVariables() {
	const style = getComputedStyle(container_ref.value!);

	return {
		"--label-w": style.getPropertyValue("--label-w"),
		"--label-mr": style.getPropertyValue("--label-mr"),
		"--select-mr": style.getPropertyValue("--select-mr"),
		"--select-w": style.getPropertyValue("--select-w"),
		"--select-h": style.getPropertyValue("--select-h"),
	};
}

function formatSelectName(item: CheckedItem) {
	const addition_info = item.branch_name || item.unit_name;
	return addition_info ? `${item.name}（${addition_info}）` : item.name;
}

function handleButtonClick() {
	emits("open-dialog");
}

function removeTag({type, id}: CheckedItem) {
	const data = props.checkedList.filter((item) => `${item.type}-${item.id}` !== `${type}-${id}`);
	emits("update:checkedList", data);
}
</script>

<style scoped lang="scss">
.tag-select-container {
	--tag-color: #748ba4;
	--tag-bg: #f3f7fa;
	--tag-hover-bg: #a2b2c2;

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
}
</style>
