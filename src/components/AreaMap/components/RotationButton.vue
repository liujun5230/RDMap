<template>
<div class="rotate-container">
	<operation-button
		:operation="operation"
		:event-handler="event_handler"
		:tips="tips"
		:icon="icon"
	/>

	<div
		v-if="rotation_transition !== 0"
		class="degree-container"
		@click="emitRotate({is_reset: true})"
	>
		<icon-degree
			class="degree "
		/>
		{{ Math.round(rotation_transition) }}°
	</div>
</div>
</template>

<script setup lang="ts">
import {computed} from "vue";

import {ROTATE_KEY} from "@/events/mapEventKeys";
import {TransitionPresets} from "@vueuse/core";
import {useEventBus, useTransition} from "@vueuse/core";
import {useMapParams} from "@/composable";

import IconDegree from "~icons/operation/degree";
import IconRotateLeft from "~icons/operation/rotate-gradient";
import OperationButton, {type OperationButtonProps} from "@index/container/LeftFloatButtons/OperationButton.vue";

const {rotation} = useMapParams();
const {emit: emitRotate} = useEventBus(ROTATE_KEY);

const operation: OperationButtonProps["operation"] = "rotate";
const icon: OperationButtonProps["icon"] = IconRotateLeft;
const event_handler: OperationButtonProps["eventHandler"] = () => emitRotate({is_reset: false});
const tips: OperationButtonProps["tips"] = "旋转";
const rotation_degree = computed(() => {
	let rotation_value = Math.round(rotation.value * 180 / Math.PI) % 360;
	if (rotation_value < 0) {
		rotation_value += 360;
	}
	return rotation_value;
});
const rotation_transition = useTransition(rotation_degree, {duration: 100, transition: TransitionPresets.linear});
const rotation_degree_css = computed(() => (+rotation_transition.value - 90) + "deg");
</script>

<style scoped>
.rotate-container {
	display: flex;
	justify-content: space-between;
	position: relative;
	width: fit-content;
}

.degree-container {
	position: absolute;
	left: 2.75rem/* 44px */;
	top: 50%;
    transform: translateY(-50%);
	padding:2px 3px;
	margin:auto;
	width: max-content;
	color: rgb(178 196 219);
	background-color: #071831B2;
	border-radius: 0.25rem/* 4px */;
	backdrop-filter: blur(4px);
	display: flex;
	justify-content: space-between;
	align-items: center;
	cursor: pointer;
	column-gap: 6px;
}
.degree {
	display: block;
	transform: rotate(v-bind("rotation_degree_css"));
}
</style>
