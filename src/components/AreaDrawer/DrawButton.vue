<template>
<div>
	<el-button
		v-show="show_go_button"
		type="primary"
		plain
		:disabled="!props.btnHandleAuth"
		@click="handleClick"
	>
		前往绘制
	</el-button>

	<!-- 这里必须用 v-show 防止 draw-area-button 监听不到事件 -->
	<draw-area-button
		v-show="!show_go_button"
		:disabled="!props.btnHandleAuth"
		@blur="() => {}"
		v-on="$listeners"
	/>
</div>
</template>

<script setup lang="ts">
import DrawAreaButton from "./DrawAreaButton.vue";
import {computed} from "vue";

type Props = {
	btnHandleAuth: boolean
	isEdit: boolean
	from: "map" | "table"
}

const show_go_button = computed(() => {
	if (props.from === "table")
		return true;

	return !props.isEdit;
});

const props = defineProps<Props>();

const emits = defineEmits(["go-to-draw", "enter-edit"]);
function handleClick() {
	if (props.from === "table") {
		emits("go-to-draw");
	} else {
		emits("enter-edit");
	}
}
</script>

<style scoped> </style>
