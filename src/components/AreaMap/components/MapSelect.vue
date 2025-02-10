<template>
<el-form
	label-width="54px"
	size="small"
	class="map-select-form"
>
	<el-form-item label="地图">
		<floor-cascader
			width="320px"
			:enable-types="['floor']"
			only-map2d
			:default-floor="props.currentFloor"
			:need-baidu-map="!!props.mapType"
			:disabled="props.disabled"
			@get-checked-floor="getCheckedFloor"
		/>
	</el-form-item>
</el-form>
</template>
<script setup>
import FloorCascader from "@/components/FloorCascader.vue";

const props = defineProps({
	currentFloor: {
		type: Array,
		default() {
			return [];
		},
	},
	disabled: {
		type: Boolean,
		default: false
	},
	mapType: {
		type: Number,
		default: 0
	}
});

const getCheckedFloor = (data) => {
	emits("change-map", data.id);
};
const emits = defineEmits(["change-map"]);
</script>

<style scoped>

.el-form.map-select-form :deep(.el-form-item__label) {
	height: 32px;
	border: 1px solid #DCDFE6;
	border-radius: 4px 0 0 4px;
	border-right: none;
	background-color: #fff;
	color: #748BA4;
	padding: 0 12px;
}

.el-form.map-select-form :deep(.el-input__inner) {
	color: #A2B2C2;
	border-radius: 0 4px 4px 0;
	padding-left: 12px;
	font-size: 14px;
}
</style>
