<template>
<div class="apply-map-container">
	<div class="select-wrap">
		<el-select
			:value="0"
			disabled
			size="small"
		>
			<el-option
				label="自定义"
				:value="0"
			/>
		</el-select>
	</div>
	<fk-table
		:data="form_data.map_table_data"
		max-height="832"
		style="min-height: 152px;"
	>
		<el-table-column
			prop="area_name"
			label="点名区域名称"
			min-width="177"
		>
			<template #default="{row, column}">
				<text-ellipsis
					style="width: 100%;"
					class="clickable-text"
					@click="openAreaDialog(row)"
				>
					{{ row[column.property] }}
				</text-ellipsis>
			</template>
		</el-table-column>
		<el-table-column
			prop="map_name"
			label="所在地图"
			class-name="direction-rtl"
			show-overflow-tooltip
			min-width="177"
			:formatter="formatNull"
		/>
		<el-table-column
			v-if="deleteAuth && !disabled"
			label="操作"
			width="56"
		>
			<template #default="{row}">
				<el-tooltip
					effect="dark"
					content="删除"
					placement="top"
				>
					<el-button
						size="mini"
						type="danger"
						icon="op-icon-delete"
						circle
						plain
						:disabled="disabled"
						@click="removeRow(row)"
					/>
				</el-tooltip>
			</template>
		</el-table-column>
	</fk-table>

	<label-button
		v-if="handleAuth && type === 'plans'"
		size="medium"
		:disabled="disabled"
		style="margin-top: 12px;"
		@click="openShuttleDialog"
	>
		添加点名区域
	</label-button>
	<div
		v-if="show_error_tip"
		class="error_tip"
	>
		请选择点名区域
	</div>

	<shuttle-dialog
		v-model="shuttle_dialog_visible"
		title="选择点名区域"
		:select-options="shuttle_map_options"
		:checked-list.sync="shuttle_checked_list"
		@save="handleShuttleDialogSave"
		@refresh="fetchAreaData"
	/>

	<area-drawer
		ref="area_drawer"
		@close="refreshAreaData"
	/>
</div>
</template>

<script setup lang="ts">
import {ref, watch, shallowRef} from "vue";
import {storeToRefs} from "pinia";

import {useSceneStore} from "@/store/useSceneStore";
import FkTable from "@/components/ForThink/Table/FkTable.vue";
import LabelButton from "@/components/Button/LabelButton.vue";
import type {CheckedItem} from "@/components/Dialog/constant";
import {SHUTTLE_TYPE} from "@/components/Dialog/constant";
import ShuttleDialog from "@/components/Dialog/shuttle/ShuttleDialog.vue";
import AreaDrawer from "@/components/AreaDrawer/AreaDrawer.vue";
import {numberToAreaTypes, typeToTitle} from "@/components/AreaDrawer/constant";
import {checkArchiveAuth} from "@/utils/js/authentication";
import {formatNull} from "@/utils/js/tools/table";
import {OUTDOOR_STOREY_ID} from "@/utils/js/constant";
import {getArea} from "@/api/area/area";

import type {FormData, ApplyMapRow} from "./types";

interface Props {
	defaultFormData: FormData["apply_map"],
	disabled: boolean,
	handleAuth: boolean,
	deleteAuth: boolean,
	type: "plans" | "task"
}
const props = defineProps<Props>();

const form_data = ref<FormData["apply_map"]>(props.defaultFormData);
const shuttle_dialog_visible = ref(false);
const shuttle_checked_list = shallowRef<CheckedItem[]>([]);
const area_drawer = ref<InstanceType<typeof AreaDrawer> | null>(null);
const area_map = new Map<number, ApplyMapRow>();
const show_error_tip = ref(false);

const shuttle_map_options = [
	{label: "点名区域", value: SHUTTLE_TYPE.roll_call, tab_name: "点名区域"}
];

const {scene_floors, floor_obj} = storeToRefs(useSceneStore());

watch(() => props.defaultFormData, (new_form_data) => {
	form_data.value = {...new_form_data};
	form_data.value.map_table_data = [...new_form_data.map_table_data];
	shuttle_checked_list.value = form_data.value.map_table_data.map(({area_name, area_id}) => ({name: area_name, id: area_id, type: SHUTTLE_TYPE.roll_call}));
}, {
	immediate: true
});

function openShuttleDialog() {
	shuttle_dialog_visible.value = true;
	fetchAreaData();
}

function openAreaDialog(row: ApplyMapRow) {
	const {area_id, area_type: type} = row;
	if (!checkArchiveAuth(type)) return;
	const area_drawer_type = numberToAreaTypes[type as keyof typeof numberToAreaTypes];
	area_drawer.value!.openDrawer({
		id: area_id,
		type: area_drawer_type,
		from: "table",
		title: typeToTitle[area_drawer_type as keyof typeof typeToTitle]
	});
}

function handleShuttleDialogSave(checked_list: CheckedItem[]) {
	form_data.value.map_table_data = checked_list.flatMap(({id}) => area_map.get(id) ?? []);
}

function removeRow(row: ApplyMapRow) {
	form_data.value.map_table_data = form_data.value.map_table_data.filter(({area_id}) => area_id !== row.area_id);
	shuttle_checked_list.value = shuttle_checked_list.value.filter(({id}) => id !== row.area_id);
}

async function fetchAreaData() {
	const {data: res} = await getArea({type: 3}).catch(() => ({data: undefined}));
	if (res?.type === 1) {
		res.result.data.forEach((item: any) => {
			const is_outdoor = floor_obj.value[item.floor_id]?.storey_id === OUTDOOR_STOREY_ID;
			const has_building = Boolean(scene_floors.value[item.scene_id]?.building_ids?.length);
			area_map.set(item.id, {
				map_name: has_building ? is_outdoor ? `${item.scene_name}-室外` : [item.scene_name, item.building_name, item.floor_name].filter(Boolean).join("-") : item.scene_name,
				area_name: item.name,
				area_id: item.id,
				area_type: item.type,
			});
		});
	}
}

// 更改区域名称需要同步刷新列表数据
async function refreshAreaData() {
	await fetchAreaData();
	form_data.value.map_table_data = form_data.value.map_table_data.map(({area_id}) => area_map.get(area_id)!);
}

function clearValidate() {
	show_error_tip.value = false;
}

function verifyForm() {
	return new Promise((resolve) => {
		show_error_tip.value = !shuttle_checked_list.value.length;
		resolve(!show_error_tip.value);
	});
}

function getApiParams() {
	return {
		area_id_list: shuttle_checked_list.value.map(({id}) => id)
	};
}

defineExpose({
	clearValidate,
	verifyForm,
	getApiParams
});
</script>

<style scoped lang="scss">
.apply-map-container {
	.select-wrap {
		margin-bottom: 12px;
		display: flex;

		.el-select {
			flex: 0 1 50%;
			padding-right: 8px;
		}
	}

	.error_tip {
		font-size: 12px;
		color: #f56c6c;
		margin-top: 2px;
	}
}
</style>
