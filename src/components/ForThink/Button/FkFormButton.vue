<template>
<div
	v-if="is_edit_mode"
	class="form-button-group"
	:class="{border: props.border}"
>
	<el-button
		type="primary"
		plain
		size="small"
		:loading="loading"
		@click="emit('cancel')"
	>
		取消
	</el-button>
	<el-button
		type="primary"
		size="small"
		:loading="loading"
		:disabled="!props.handleAuth"
		@click="emit('confirm')"
	>
		保存
	</el-button>
</div>

<div
	v-else
	v-loading="loading"
	class="form-button-group"
>
	<el-button
		type="primary"
		size="small"
		:disabled="!props.handleAuth"
		@click="onEnterEdit"
	>
		编辑
	</el-button>
</div>
</template>

<script setup lang="ts">
import {useVModel} from "@vueuse/core";

type Props = {
	value: boolean,
	loading?: boolean
	border?: boolean
	/**
	 * 操作权限
	 */
	handleAuth: boolean
}

const emit = defineEmits(["input", "cancel", "confirm", "edit"]);

const props = withDefaults(defineProps<Props>(), {
	loading: false,
	border: true
});

const is_edit_mode = useVModel(props, undefined, emit);

function onEnterEdit() {
	is_edit_mode.value = true;
	emit("edit");
}
</script>

<style scoped>
.form-button-group {
  display: flex;
  justify-content: flex-end;
  column-gap: 8px;

  padding-top: 16px;
}

.border {
  border-top:1px solid #EFF3F6;
}

.form-button-group > .el-button {
  /* 全局 button.css  存在 important */
  margin: 0 !important;
}

</style>
