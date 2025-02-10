<template>
<div
	v-if="!is_text"
	class="light"
	:class="{[config.color ?? '']: true}"
>
	<div class="icon">
		<div class="circle" />
	</div>
	<div class="text">
		{{ config.text }}
	</div>
</div>
<span v-else>
	{{ config.text }}
</span>
</template>

<script setup lang="ts">
import {LIGHT, TRAFFIC_LIGHT_TEXT_MAP} from "@/utils/js/constant";
import {computed} from "vue";

const props = defineProps<{
	type:	LIGHT;
}>();

const is_text = computed(() => props.type === LIGHT.NOT_EXISTS || props.type === LIGHT.UNCONTROLLED);

const config = computed(() => {
	switch (props.type) {
	case LIGHT.GREEN:
		return {
			color: "green",
			text: TRAFFIC_LIGHT_TEXT_MAP[props.type],
		};
	case LIGHT.RED:
		return {
			color: "red",
			text: TRAFFIC_LIGHT_TEXT_MAP[props.type],
		};
	case LIGHT.YELLOW:
		return {
			color: "yellow",
			text: TRAFFIC_LIGHT_TEXT_MAP[props.type],
		};
	case LIGHT.GRAY:
		return {
			color: "gray",
			text: TRAFFIC_LIGHT_TEXT_MAP[props.type],

		};
	case LIGHT.NOT_EXISTS:
		return {
			text: TRAFFIC_LIGHT_TEXT_MAP[props.type],

		};
	case LIGHT.UNCONTROLLED:
		return {
			text: TRAFFIC_LIGHT_TEXT_MAP[props.type],

		};
	default:
		return {
			text: TRAFFIC_LIGHT_TEXT_MAP[props.type],
		};
	}
});
</script>

<style scoped>
.light {
	display: flex;
	column-gap: 2px;
	align-items: center;
}

.icon {
	width: 16px;
	height: 16px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.circle {
	width: 8px;
	aspect-ratio: 1;
	border: none;
	border-radius: 9999px;
	background-color: var(--circle-color);
}

.text {
	white-space: nowrap;
}
.red {
	--circle-color: #F56C6C;
}

.yellow {
	--circle-color: #F5A623;
}

.green {
	--circle-color: #62BF33
}

.gray{
	--circle-color: #B0B0B0;
}

</style>
