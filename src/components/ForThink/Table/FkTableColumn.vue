<template>
<el-table-column
	:prop="props.prop"
	:label="props.label"
	:formatter="props.formatter"
	v-bind="$attrs"
	v-on="$listeners"
>
	<template #header>
		<slot name="header">
			<div class="fk-table__label">
				<span>{{ props.label }}</span>
				<fk-icon
					v-if="show_header_tip"
					:tip="header_tip"
				>
					<icon-header-warning v-if="props.importantHeaderTip" />
					<icon-header-question v-else />
					<template #tip>
						<div
							v-for="tip in formated_tip"
							:key="tip"
						>
							{{ tip }}
						</div>
					</template>
				</fk-icon>
			</div>
		</slot>
	</template>
	<template #default="{row, column}">
		<slot
			:row="row"
			:column="column"
		>
			<text-ellipsis
				style="width:100%;"
				:disabled="!props.showOverflowTooltip"
			>
				<span
					:class="{'clickable-text': clickable(row) && !disabled(row), 'link': clickable(row) && !disabled(row)}"
					:disabled="disabled(row)"
					:style="{color: disabled(row) ? '#D1D8E1' : color(row), 'cursor': disabled(row) ? 'not-allowed' : ''}"
					@click="!disabled(row) && emit('click', row, column)"
				>
					{{ props.formatter ? props.formatter(row, column, get(row, props.prop)) : get(row, props.prop) }}
				</span>
			</text-ellipsis>
		</slot>
	</template>
</el-table-column>
</template>

<script lang="ts" setup>
import {get} from "lodash-es";
import {computed} from "vue";

import {resolveGetter} from "@/utils/ts/common";
import FkIcon from "@/components/ForThink/FkIcon.vue";
import TextEllipsis from "@/components/TextEllipsis.vue";

import IconHeaderQuestion from "~icons/operation/header-question";
import IconHeaderWarning from "~icons/operation/header-warning";

type Props = {
	prop: string
	label: string
	// 在表头添加提示
	showHeaderTip?: boolean
	// 提示文字内容
	headerTip?: string
	// 重要提示文字内容
	importantHeaderTip?: string
	// 文字是否可点击
	clickable?: boolean | ((row: any) => boolean)
	disabled?: boolean | ((row: any) => boolean)
	color?: string | ((row: any) => string)
	showOverflowTooltip?: boolean,
	formatter?:((row: any, col:any, val:any) => string)
}

const props = withDefaults(defineProps<Props>(), {
	showOverflowTooltip: false,
	showHeaderTip: true,
	headerTip: "",
	clickable: false,
	disabled: false,
	color: "",
	importantHeaderTip: undefined,
	formatter: undefined
});

const emit = defineEmits<{
	(e: "click", row: any, column: any): void
}>();

const header_tip = computed(() => props.importantHeaderTip || props.headerTip);

const show_header_tip = computed(() => {
	return props.showHeaderTip && header_tip.value;
});

const formated_tip = computed(() => {
	return header_tip.value.split("\\n");
});

const clickable = resolveGetter(props.clickable);
const color = resolveGetter(props.color);
const disabled = resolveGetter(props.disabled);
</script>

<style scoped>
.fk-table__label {
	display: inline-flex;
	align-items: center;
	column-gap: 4px;
}
</style>
