<template>
<div class="cursor-pointer">
	<img
		class="degree"
		alt="compass"
		src="@/assets/images/index/compass.png"
		@click="emit('reset')"
	>
</div>
</template>

<script setup lang="ts">
import {computed} from "vue";

const props = defineProps<{
	/**
	 * 弧度 radian
	 */
	rotation: number;
}>();

const rotation_degree_css = computed(() => {
	return props.rotation + "rad";
});

const emit = defineEmits<{
	(e: "reset"): void;
}>();
</script>

<style scoped>

.degree {
	display: block;
	transform: rotate(v-bind("rotation_degree_css"));
	width: 2.5rem/* 40px */;
	aspect-ratio: auto;
}

</style>
