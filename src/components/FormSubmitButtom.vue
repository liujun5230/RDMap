<template>
<div
	class="form-button-group"
	:class="{'form-button-group-panel':props.isShowPanel}"
>
	<div
		v-show="props.type === 'edit' || props.type === 'add'"
	>
		<el-button
			v-if="props.type === 'edit'"
			ref="button"
			plain
			:autofocus="false"
			@click="emit('cancel')"
		>
			取消
		</el-button>
		<el-button
			type="primary"
			:loading="props.loading"
			@click="emit('save')"
		>
			保存
		</el-button>
	</div>
	<div
		v-show="props.type === 'view'"
	>
		<el-button
			type="primary"
			plain
			:disabled="!auth.handle"
			@click="emit('edit')"
		>
			编辑
		</el-button>
	</div>
</div>
</template>

<script setup lang="ts">
import type {Button as ElButton} from "element-ui";
import {ref} from "vue";

import {usePageAuth} from "@/utils/js/authentication";

import "@/utils/css/button.css";

const auth = usePageAuth(undefined);
const emit = defineEmits(["cancel", "save", "edit"]);
const props = withDefaults(defineProps<{type: "add" | "edit" | "view", loading?: boolean, isShowPanel?: boolean}>(), {
	loading: false,
	isShowPanel: false
});
const button = ref<ElButton>();
</script>

<style scoped>
.form-button-group{
	position: absolute;
	padding-top: 16px;
	top: 0;
	right: 15px;
	text-align: right;
	z-index: 1;
}
.form-button-group-panel {
	width: 100%;
	background-color: #fbfdff;
}
</style>
