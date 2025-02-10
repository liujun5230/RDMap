<template>
<div>
	<shape-select
		v-show="!shape_select_disabled && !is_exist_area"
		v-model="shape"
		class="shape-select"
		v-bind="$attrs"
		@change="handleShapeChange"
	/>
	<el-button
		v-show="shape_select_disabled || is_exist_area"
		type="primary"
		plain
		class="without-mr"
		@click="drawShape(is_exist_area)"
	>
		{{ is_exist_area ? "重新绘制" : "前往绘制" }}
	</el-button>
</div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import ShapeSelect from "@/components/AreaDrawer/ShapeSelect.vue";
import {useEventBus} from "@vueuse/core";

const shape = ref("rectangle");
const shape_select_disabled = ref(false);
const is_exist_area = ref(false);

const props = defineProps<{isTempArea?:boolean}>();
const emit = defineEmits(["draw-end"]);

useEventBus("is-start-draw").on((val: any) => {
	shape_select_disabled.value = val;
});

useEventBus("is-exist-area").on((val: any) => {
	is_exist_area.value = val;
	if (val) {
		emit("draw-end");
	}
});

function handleShapeChange(type: string) {
	useEventBus("change-shape-type").emit(type);
}

function drawShape(is_area: boolean) {
	const param = {shape_type: shape.value, is_temp_area: props.isTempArea};
	is_area ? useEventBus("re-draw").emit(param) : useEventBus("start-draw").emit(param);
}
</script>

<style scoped>
.shape-select.el-select {
	width: 90px;
	margin-right: 12px;
}

.without-mr {
	margin-right: 0 !important;
}
</style>
