<template>
<ul
	class="descriptions-list"
	:style="style"
>
	<li
		v-for="col in props.columns"
		:key="col.prop"
		class="leading-[24px]"
		:class="[{'row-span-2': col.type === 'picture'}, col.className]"
		:style="{...col.style}"
	>
		<slot
			:name="col.prop"
			:data="props.data"
			:column="col"
			:value="getChainPropValue(props.data, col.prop)"
		>
			<text-ellipsis
				v-if="!col.type || col.type === 'text'"
				class="w-full text-main-1"
			>
				<span
					class="after:content-[':'] text-minor-2 mr-[8px]"
					:class="[small ? 'text-[12px]' : 'text-[14px]']"
				>{{ col.label }}</span>
				<span
					class="text-main-1"
					:class="[small ? 'text-[14px]' : 'text-[16px]']"
				>{{ formatValue(props.data, col) }}</span>

				<template #tooltip>
					<span>{{ formatValue(props.data, col) }}</span>
				</template>
			</text-ellipsis>

			<div
				v-if="col.type === 'picture'"
				class="inline-flex"
			>
				<span
					class="after:content-[':'] text-minor-2 mr-[8px]"
					:class="[small ? 'text-[12px]' : 'text-[14px]']"
				>{{ col.label }}</span>
				<span
					v-if="[col.empty_text, emptyText].includes(formatValue(props.data, col))"
					:class="[small ? 'text-[14px]' : 'text-[16px]']"
				>{{ col.empty_text ?? emptyText }}</span>
				<preview-image
					v-else
					class="h-[36px]"
					:src="formatValue(props.data, col)"
				/>
			</div>
		</slot>
	</li>
</ul>
</template>

<script setup lang="ts">
import {computed} from "vue";

import TextEllipsis from "@/components/TextEllipsis.vue";
import {small} from "@/utils/ts/breakpoints";
import {getChainPropValue} from "@/utils/ts/common";
import PreviewImage from "@/components/PreviewImage.vue";

export interface Column {
	readonly label: string;
	readonly prop: string;
	readonly type?: "text" | "picture";
	readonly formatter?: (val: any, col: Column, data: Props["data"]) => any;
	readonly className?: string;
	readonly style?: any;
	readonly empty_text?: string
}

export interface Props {
	columns: Column[],
	data: Record<string, any>,
	span?: number,
	emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
	span: 1,
	emptyText: "--"
});

const style = computed(() => {
	const {span} = props;

	return {
		gridTemplateColumns: `repeat(${span}, minmax(0, 1fr))`,
	};
});

function formatNull(value: any, empty_text: string) {
	return [null, undefined, ""].includes(value) ? empty_text : value;
}

function formatValue(data: Props["data"], col: Column) {
	const origin_val = getChainPropValue(data, col.prop);
	const val = typeof col.formatter === "function" ? col.formatter(origin_val, col, data) : origin_val;
	return formatNull(val, col.empty_text ?? props.emptyText);
}
</script>

<style scoped>
.descriptions-list {
    font-family: "DingTalk JinBuTi";
    display: grid;
	color: #e3eefc;
}
</style>
