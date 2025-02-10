<template>
<el-dialog
	v-bind="$attrs"
	:visible="props.value"
	modal-append-to-body
	destroy-on-close
	append-to-body
	custom-class="archive-dialog"
	:close-on-press-escape="false"
	:close-on-click-modal="false"
	width="900px"
	@close="closeDialog"
	v-on="$listeners"
>
	<template #title>
		<text-ellipsis class="custom-ellipsis">
			{{ props.dialogTitle }}
			<template #tooltip>
				{{ props.dialogTitle }}
			</template>
		</text-ellipsis>
	</template>
	<data-loading v-show="props.isDataLoading" />
	<div
		v-show="!props.isDataLoading"
	>
		<slot />
	</div>
</el-dialog>
</template>
<script setup lang="ts">
import TextEllipsis from "@/components/TextEllipsis.vue";
import DataLoading from "@/components/ArchiveDialog/components/DataLoading.vue";

type Props = {
	value:boolean,
	dialogTitle:string,
	isDataLoading:boolean
}

const props = withDefaults(defineProps<Props>(), {
	dialogTitle: "",
	isDataLoading: true
});

const closeDialog = () => {
	emits("input", false);
};

const emits = defineEmits(["input"]);
</script>

<style scoped lang="scss">
.el-dialog__wrapper {
	display: flex;
	justify-content: center;
	align-items: center;
}

.custom-ellipsis {
	max-width: 840px;
	vertical-align: middle;
	font-size: 14px;
}

</style>
<style>
.archive-dialog {
	--margin-lr: 32px;
	--margin-bt: 60px;
	--archive-dialog-text-color: #a2b2c2;
	--primary-color: #07f;
}

.archive-dialog.el-dialog {
	margin: var(--margin-bt) var(--margin-lr) !important;
	position: absolute;
	overflow: hidden;
	min-width: 900px;
	width: fit-content;
	max-width: calc(100% - var(--margin-lr) * 2);
	max-height: calc(100% - var(--margin-bt) * 2);
}

.archive-dialog.el-dialog .el-dialog__body {
	overflow-y: hidden !important;
	max-height: none !important;
	padding: 16px !important;
}

</style>
