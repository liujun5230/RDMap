<template>
<el-tooltip
	v-bind="$attrs"
	:content="undefined"
	:disabled="disabled"
	:placement="placement"
	:popper-class="`${props.popperClass ?? ''} fk-text-ellipsis-popper`"
>
	<span
		ref="trigger_ref"
		:class="['fk-text-ellipsis', {'fk-text-ellipsis-line-clamp': props.lineClamp > 0}]"
		:style="ellipsis_style"
		v-on="$listeners"
		@mouseover="handleMouseover"
	>
		<slot v-if="props.lineClamp" />
		<span
			v-if="!props.lineClamp"
			ref="trigger_inner_ref"
		>
			<slot />
		</span>
	</span>
	<template #content>
		<slot name="tooltip">
			<slot />
		</slot>
	</template>
</el-tooltip>
</template>

<script>
export default {
	name: "TextEllipsis",
	inheritAttrs: false,
};
</script>
<script setup>
import {ref, computed, onMounted, watch} from "vue";

const trigger_ref = ref(null);
const trigger_inner_ref = ref(null);
const disabled_tooltip = ref(true);

// 其他属性参考 tooltip 参数
const props = defineProps({
	/**
	 * 最大行数
	 */
	lineClamp: {
		type: Number,
		default: undefined,
		validator: (value) => {
			if (!Number.isInteger(value)) throw (new Error("期待 lineClamp 是一个正整数，但是得到了浮点数"));
			if (parseInt(value) <= 0) throw (new Error(`期待 lineClamp 是一个正整数，但是得到了${parseInt(value) < 0 ? "负数" : 0}`));
			return true;
		}
	},
	placement: {
		type: String,
		default: "top"
	},

	disabled: {
		type: Boolean,
		default: false
	},

	popperClass: {
		type: String,
		default: ""
	}
});

const disabled = computed(() => props.disabled || disabled_tooltip.value);

const ellipsis_style = computed(() => {
	return props.lineClamp > 0 ? {
		"-webkit-line-clamp": props.lineClamp,
	} : {
		"white-space": "nowrap",
		"text-overflow": "ellipsis"
	};
});

watch(() => props.lineClamp, () => {
	disabled_tooltip.value = getTooltipDisabled();
});

onMounted(() => {
	disabled_tooltip.value = getTooltipDisabled();
});

function getTooltipDisabled() {
	let tooltip_disabled = false;
	if (trigger_ref.value) {
		if (props.lineClamp !== undefined) {
			// 在恒迹云当中，没有超出时，scrollHeight 始终会比 offsetHeight 多 1px，暂时没找到原因
			tooltip_disabled = trigger_ref.value.scrollHeight - 1 <= trigger_ref.value.offsetHeight;
		} else if (trigger_inner_ref.value) {
			tooltip_disabled = trigger_inner_ref.value.getBoundingClientRect().width <= trigger_ref.value.getBoundingClientRect().width;
		}
	}
	return tooltip_disabled;
}

function handleMouseover() {
	disabled_tooltip.value = getTooltipDisabled();
}
</script>

<style>
.el-tooltip__popper.fk-text-ellipsis-popper[x-placement] {
	max-width: 656px;
}
</style>
<style scoped>
.fk-text-ellipsis {
	display: inline-block;
	overflow: hidden;
	vertical-align: bottom;
}

.fk-text-ellipsis.fk-text-ellipsis-line-clamp {
	display: -webkit-inline-box;
	-webkit-box-orient: vertical;
}
</style>
