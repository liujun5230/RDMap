<template>
<base-dialog
	v-model="dialog_visible"
	title="显示设置"
	:show-close="true"
	:close-on-click-modal="false"
	width="436px"
	show-footer
	style="--body-padding: 16px;"
	@negative-click="closeDialog"
	@positive-click="saveSetting"
>
	<fk-sort-table
		v-if="dialog_visible"
		ref="ref_table"
		:btn-handle-auth="true"
		:data="props.tableData"
	/>
</base-dialog>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";
import type {DisplayDataType} from "@/components/ArchiveDialog/components/useDisplaySetting";
import FkSortTable from "@/components/ForThink/Table/FkSortTable.vue";
import BaseDialog from "@/components/Dialog/BaseDialog.vue";

type Props = {
	tableData: DisplayDataType[]
	dialogVisible:boolean
}
const props = withDefaults(defineProps<Props>(), {
	dialogVisible: false
});
const dialog_visible = computed({
	get() {
		return props.dialogVisible;
	},
	set() {
		closeDialog();
	}
});
const ref_table = ref();

const closeDialog = () => {
	emits("update:dialogVisible", false);
};

const saveSetting = () => {
	emits("save-setting", ref_table.value.getTableData());
};
const emits = defineEmits(["update:dialogVisible", "save-setting"]);

</script>
