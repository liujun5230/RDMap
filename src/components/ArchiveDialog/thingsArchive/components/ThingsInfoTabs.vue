<template>
<div>
	<archive-base-tabs
		:active-name="active_name"
		:tab-components="tab_components"
	/>
	<el-button
		v-if="btn_handle_auth"
		type="primary"
		size="small"
		class="btn-setting"
		plain
		@click="openSettingDialog"
	>
		显示设置
	</el-button>
	<tabs-display-setting-dialog
		:dialog-visible.sync="display_dialog_visible"
		:table-data="display_table_data"
		@save-setting="saveDisplaySetting"
	/>
</div>
</template>
<script setup lang="ts">
import {computed, ref, inject, provide, watch} from "vue";
import {getTabs} from "../composable/getTabs";
import ArchiveBaseTabs from "@/components/ArchiveDialog/components/ArchiveBaseTabs.vue";
import {Notification} from "element-ui";
import TabsDisplaySettingDialog from "@/components/ArchiveDialog/components/TabsDisplaySettingDialog.vue";

import {useDisplaySetting} from "@/components/ArchiveDialog/components/useDisplaySetting";
import {cloneDeep} from "lodash-es";
const btn_handle_auth = inject("BTN_HANDLE_AUTH");
const archive_uuid = inject("ARCHIVE_UUID");

const is_entry_area = inject("IS_ENTRY_AREA");
const is_health = inject("IS_HEALTH");
const is_attendance = inject("IS_ATTENDANCE");
const is_up_down_pit = inject("IS_UP_DOWN_PIT");
const utype = inject("UTYPE");

const {getDisplaySettingData, getAllDisplaySetting, setDisplaySetting} = useDisplaySetting();

const is_health_page = inject("IS_HEALTH_PAGE");

const display_setting_data = computed(() => getDisplaySettingData(utype.value));

const tab_components = computed(() => getTabs(display_setting_data.value, archive_uuid.value, is_entry_area.value, is_health.value, is_attendance.value, is_up_down_pit.value));
const display_dialog_visible = ref(false);
const display_table_data = computed(() => cloneDeep(display_setting_data.value));
const active_name = ref("");
provide("ACTIVE_NAME", active_name);

const openSettingDialog = () => {
	display_dialog_visible.value = true;
};
const saveDisplaySetting = (data) => {
	setDisplaySetting(data, utype.value).then(res => {
		if (res.data.type === 1) {
			Notification({
				type: "success",
				title: "成功",
				message: res.data.result
			});
			getAllDisplaySetting();
			display_dialog_visible.value = false;
		} else {
			Notification({
				type: "error",
				title: "错误",
				message: res.data?.result
			});
		}
	});
};
watch(() => tab_components.value, (tab) => {
	if (!tab.find(item => item.name === active_name.value)) active_name.value = is_health_page.value ? "health_data" : tab[0].name;
}, {immediate: true});
</script>
<style scoped lang="scss">
	.btn-setting {
		position: absolute;
		top: 294px;
		right: 8px;
	}
</style>
