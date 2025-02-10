<template>
<i
	class="fk-icon"
	:style="style"
	v-on="$listeners"
>
	<el-tooltip
		v-bind="$attrs"
		:placement="props.placement"
		:content="props.tip"
		:disabled="!props.tip && !$scopedSlots.tip"
	>
		<slot />

		<template #content>
			<slot name="tip">
				{{ props.tip }}
			</slot>
		</template>
	</el-tooltip>
</i>
</template>

<script lang="ts">
export default {
	name: "FkIcon",
	inheritAttrs: false
};
</script>
<script setup lang="ts">
import type {PopoverPlacement} from "element-ui/types/popover";
import {computed} from "vue";

const props = withDefaults(defineProps<{
	size?: number | string;
	tip?: string;
	color?: string;
	hoverColor?: string;
	activeColor?: string;
	placement?: PopoverPlacement
}>(), {
	size: undefined,
	tip: "",
	color: undefined,
	hoverColor: undefined,
	activeColor: undefined,
	placement: "top"
});

const style = computed(() => {
	const {size, color} = props;

	return {
		fontSize: size === undefined ? undefined : addUnit(size),
		color
	};
});

function addUnit (value: any, default_unit = "px") {
	if (Number(value)) return value + default_unit;
	return value;
}
</script>

<style>
.fk-icon {
	--text-color: inherit;
	--text-size: inherit;

    height: 1em;
    width: 1em;
    line-height: 1em;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    fill: currentColor;
    font-size: var(--text-size);
	color: var(--text-color);
}

.fk-icon svg {
	width: 1em;
	height: 1em;
}

.fk-icon svg:hover {
	color: v-bind("props.hoverColor")
}

.fk-icon svg:active {
	color: v-bind("props.activeColor")
}
</style>

