<template>
<div class="h-full">
	<div
		v-if="location_table_data"
		class="position-obj-tabs h-[calc(100%-60px)]"
	>
		<sort-table
			:data="location_table_data"
			:display-column="{label: '数据', prop: 'label'}"
			@sort-change="getChangeLocationInfo"
			@display-change="getChangeLocationInfo"
		>
			<el-table-column
				label="适用对象"
				prop="fit_obj"
				width="252px"
				show-overflow-tooltip
			/>
		</sort-table>
	</div>

	<el-tabs
		v-else
		v-model="active_tab"
		class="fk-index-tabs position-obj-tabs"
		:before-leave="changeTabs"
	>
		<el-tab-pane
			label="基本信息"
			name="base"
		>
			<sort-table
				v-if="active_tab === 'base'"
				:data="base_table_data"
				:display-column="{label: '数据', prop: 'label'}"
				@sort-change="getChangeBaseInfo"
				@display-change="getChangeBaseInfo"
			/>
		</el-tab-pane>
		<el-tab-pane
			v-if="business_table_data"
			label="业务数据"
			name="business"
		>
			<sort-table
				v-if="active_tab === 'business'"
				:data="business_table_data"
				:display-column="{label: '数据', prop: 'label'}"
				@sort-change="getChangeBusinessInfo"
				@display-change="getChangeBusinessInfo"
			/>
		</el-tab-pane>
	</el-tabs>

	<div class="flex flex-row justify-end gap-[0.5rem] pt-[12px] pr-[20px] pb-[16px]">
		<header-button
			type="primary"
			size="14"
			@click="cancelSettingsData"
		>
			取消
		</header-button>
		<header-button
			type="primary"
			size="14"
			@click="resetSettingsData"
		>
			重置
		</header-button>
		<header-button
			type="confirm"
			size="14"
			@click="clickSaveSetting"
		>
			保存
		</header-button>
	</div>
</div>
</template>
<script setup lang="ts">
import {computed, ref, watchEffect} from "vue";
import {Notification, MessageBox} from "element-ui";
import SortTable from "@index/components/table/SortTable.vue";
import {HeaderButton} from "@index/components/buttons";

interface Props {
	baseInfoData?: [],
	businessInfoData?:[],
	locationInfoData?:[]
}
const props = defineProps<Props>();
const base_setting_info = ref([]);
const business_setting_info = ref([]);
const location_setting_info = ref([]);
const active_tab = ref("base");

const base_table_data = computed(() => {
	return props.baseInfoData?.map((item:any, index) => {
		return {
			id: index + 1,
			pid: 0,
			sorting: index + 1,
			...item
		};
	});
});

const business_table_data = computed(() => {
	let sort_num = 0, child_id = 4;
	return props.businessInfoData?.map((item:any, index) => {
		return {
			id: index + 1,
			pid: 0,
			label: item.label,
			prop: item.prop,
			is_display: item.is_display,
			disable_drag: item.disable_drag,
			sorting: sort_num++,
			children: item.children?.map((child:any) => {
				return {
					id: child_id++,
					pid: index + 1,
					prop: child.prop,
					disable_drag: child.disable_drag,
					label: child.label,
					is_display: child.is_display,
					sorting: sort_num++
				};
			})
		};
	});
});

const location_table_data = computed(() => {
	let sort_num = 0, child_id = 100;
	return props.locationInfoData?.map((item:any, index) => {
		return {
			id: index + 1,
			pid: 0,
			label: item.label,
			prop: item.prop,
			fit_obj: item.fit_obj,
			is_display: item.is_display,
			disable_drag: item.disable_drag,
			disable_display: item.disable_display,
			sorting: sort_num++,
			children: item.children?.map((child:any) => {
				return {
					id: child_id++,
					pid: index + 1,
					fit_obj: child.fit_obj,
					prop: child.prop,
					label: child.label,
					is_display: child.is_display,
					disable_drag: child.disable_drag,
					sorting: sort_num++
				};
			})
		};
	});
});

const getChangeBaseInfo = (info:any) => {
	base_setting_info.value = info.table_data.map((item:any) => {
		return {
			label: item.label,
			prop: item.prop,
			disable_display: item.disable_display,
			disable_drag: item.disable_drag,
			is_display: Number(item.is_display),
			type: item.type,
			is_attachment: item.is_attachment
		};
	});
};

const getChangeBusinessInfo = (info:any) => {
	business_setting_info.value = info.table_data.map((item:any) => {
		return {
			label: item.label,
			prop: item.prop,
			disable_drag: item.disable_drag,
			is_display: Number(item.is_display),
			children: item.children?.map((child:any) => {
				return {
					label: child.label,
					prop: child.prop,
					disable_drag: child.disable_drag,
					is_display: Number(child.is_display)
				};
			})
		};
	});
};

const getChangeLocationInfo = (info:any) => {
	location_setting_info.value = info.table_data.map((item:any) => {
		return {
			label: item.label,
			prop: item.prop,
			is_display: Number(item.is_display),
			fit_obj: item.fit_obj,
			disable_display: item.disable_display,
			disable_drag: item.disable_drag,
			children: item.children?.map((child:any) => {
				return {
					label: child.label,
					prop: child.prop,
					fit_obj: child.fit_obj,
					disable_display: child.disable_display,
					disable_drag: child.disable_drag,
					is_display: Number(child.is_display)
				};
			})
		};
	});
};

const saveSettingsData = (name:string) => {
	const tab_name = name || active_tab.value;
	if (location_table_data.value) {
		emits("location-info-change", location_setting_info.value);
	} else {
		if (tab_name === "base") {
			emits("base-info-change", base_setting_info.value);
		} else {
			emits("business-info-change", business_setting_info.value);
		}
	}
};

const clickSaveSetting = () => {
	saveSettingsData("");
	Notification({
		type: "success",
		title: "成功",
		message: "保存成功"
	});
};

const resetSettingsData = () => {
	MessageBox.confirm("确定重置？<br>确定后，将恢复为系统默认设置", "重置", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		dangerouslyUseHTMLString: true,
		closeOnClickModal: false,
		type: "warning",
		customClass: "fk-index-message-box",
		cancelButtonClass: "fk-index-button",
		confirmButtonClass: "fk-index-button"

	}).then(() => {
		if (location_table_data.value) {
			emits("reset-location-info");
		} else {
			if (active_tab.value === "base") {
				emits("reset-base-info");
			} else {
				emits("reset-business-info");
			}
		}
	}).catch(() => {
	});
};

const cancelSettingsData = () => {
	emits("cancel-setting-info");
};

const changeTabs = (active_name:string, old_name:string) => {
	saveSettingsData(old_name);
};

watchEffect(() => {
	if (props.baseInfoData) base_setting_info.value = props.baseInfoData;
	if (props.businessInfoData) business_setting_info.value = props.businessInfoData;
	if (props.locationInfoData) location_setting_info.value = props.locationInfoData;
});

const emits = defineEmits(["base-info-change", "business-info-change", "location-info-change", "reset-location-info", "reset-base-info", "reset-business-info", "cancel-setting-info"]);
defineExpose({saveSettingsData});

</script>
<style scoped>
	.fk-index-tabs :deep(.el-tabs__header.is-top) {
		margin-bottom: 10px;
	}
    .position-obj-tabs {
        padding: 16px 25px 20px 25px;
        width: 561px;
        border-bottom: 1px solid #2F3E54;

		&.fk-index-tabs.el-tabs {
			height: calc(100% - 60px);

			:deep(.el-tabs__content) {
				height: calc(100% - 42px);

				.el-tab-pane {
					height: 100%;
				}
			}
		}

    }

    .sort-table.el-table::before,
    .sort-table.el-table::after{
        width: 0;
        height: 0;
    }

	:deep(.sort-table.el-table) {
		color: #e3eefc !important;
	}
	:deep(.sort-table.el-table) .header-row {
		color: #94a6be !important;
	}

	:deep(.sort-table.el-table) th.el-table__cell.is-leaf {
		border-bottom: none !important;
	}
	:deep(.sort-table.el-table) tr:hover .el-table__cell {
		background-color: transparent !important;
	}

	:deep(.fk-index-checkbox.el-checkbox) .el-checkbox__input.is-checked .el-checkbox__inner {
		background-color: #4786da !important;
		border-color: #4786da !important;
	}
	:deep(.el-checkbox:not(.is-checked)) .el-checkbox__inner {
		background-color: transparent !important;
		border: 1px solid #94a6be !important;
	}

</style>
