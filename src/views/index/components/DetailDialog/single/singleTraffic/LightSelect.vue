<template>
<el-select
	v-bind="$attrs"
	:value="value"
	:popper-class="`${$attrs.popperClass || ''} light-popper fk-index-select-dropdown`"
	:disabled="value === LIGHT.NOT_EXISTS"
	:popper-append-to-body="false"
	class="fk-index-select light-select"
	:class="{'hidden-prefix': value === LIGHT.UNCONTROLLED || value === LIGHT.NOT_EXISTS}"
	v-on="$listeners"
	@input="emits('input', $event)"
>
	<template #prefix>
		<div
			v-show="value !== LIGHT.UNCONTROLLED && value !== LIGHT.NOT_EXISTS"
			class="light-select-prefix"
		>
			<i
				class="circle"
				:style="{backgroundColor: light_config[value].color}"
			/>
		</div>
	</template>
	<el-option
		v-for="item in options"
		:key="item.value"
		:label="item.label"
		:value="item.value"
	>
		<div class="light-item">
			<i
				class="circle"
				:style="{backgroundColor: light_config[item.value].color}"
			/>
			<span>{{ item.label }}</span>
		</div>
	</el-option>
</el-select>
</template>

<script lang="ts">
export default {
	inheritAttrs: false,
};
</script>
<script setup lang="ts">
import {computed} from "vue";

import {LIGHT} from "@/utils/js/constant";

const emits = defineEmits<{
	(event: "input", value: LIGHT): void
}>();

interface Props {
	value: LIGHT,
}
const props = defineProps<Props>();

const base_options = [
	{label: "绿灯", value: LIGHT.GREEN},
	{label: "红灯", value: LIGHT.RED},
	{label: "不控制", value: LIGHT.UNCONTROLLED},
];
const light_config = {
	[LIGHT.GRAY]: {
		color: "#B0B0B0",
		text: "灰灯",
	},
	[LIGHT.GREEN]: {
		color: "#62BF33",
		text: "绿灯",
	},
	[LIGHT.NOT_EXISTS]: {
		color: "transparent",
		text: "无",
	},
	[LIGHT.RED]: {
		color: "#F56C6C",
		text: "红灯",
	},
	[LIGHT.UNCONTROLLED]: {
		color: "transparent",
		text: "不控制",
	},
	[LIGHT.YELLOW]: {
		color: "#F5A623",
		text: "黄灯",
	}
};

const options = computed(() => {
	if (props.value === LIGHT.NOT_EXISTS) {
		return [
			...base_options,
			{label: "无", value: LIGHT.NOT_EXISTS},
		];
	}
	return [...base_options];
});
</script>

<style>
.light-popper {
	.light-item {
		display: flex;
		align-items: center
	}

	.circle {
		display: inline-block;
		width: 8px;
		aspect-ratio: 1;
		border: none;
		border-radius: 50%;
		margin-right: 4px;
	}
}

</style>

<style scoped>
.light-select {
	.light-select-prefix {
		padding-left: 12px;

		.circle {
			display: inline-block;
			width: 8px;
			aspect-ratio: 1;
			border: none;
			border-radius: 50%;
		}
	}

	&.hidden-prefix {
		:deep(.el-input__inner) {
			padding-left: 15px;
		}
	}
}
</style>
