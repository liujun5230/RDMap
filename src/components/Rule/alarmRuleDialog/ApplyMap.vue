<template>
<div class="apply-map-container">
	<div class="select-wrap">
		<el-select
			v-model="form_data.map_scope"
			:popper-append-to-body="false"
			size="small"
			:disabled="formConfig.apply_map_options.length === 1 || disabled"
		>
			<el-option
				v-for="item in formConfig.apply_map_options"
				:key="item.value"
				:label="item.label"
				:value="item.value"
			/>
		</el-select>
		<el-select
			v-if="formConfig.show_inverse_map_scope && form_data.map_scope === APPLY_MAP_SCOPE.custom"
			v-model="form_data.is_inverse"
			:popper-append-to-body="false"
			:disabled="disabled"
			size="small"
		>
			<el-option
				label="以下地图范围将触发告警"
				:value="0"
			/>
			<el-option
				label="以下地图范围外将触发告警"
				:value="1"
			/>
		</el-select>
	</div>
	<fk-table
		v-if="form_data.map_scope === APPLY_MAP_SCOPE.custom"
		:data="form_data.map_table_data"
		max-height="832"
		style="min-height: 152px;"
	>
		<el-table-column
			prop="map_name"
			label="所在地图"
			class-name="direction-rtl"
			show-overflow-tooltip
			min-width="177"
			:formatter="formatNull"
		/>
		<el-table-column
			prop="area_name"
			label="电子围栏名称"
			min-width="177"
		>
			<template #default="{row, column}">
				<span v-if="!row[column.property]">--</span>
				<text-ellipsis
					v-else
					style="width: 100%;"
					class="clickable-text"
					@click="openAreaDialog(row)"
				>
					{{ row[column.property] }}
				</text-ellipsis>
			</template>
		</el-table-column>
		<el-table-column
			prop="rule_group_name"
			label="电子围栏分组"
			show-overflow-tooltip
			min-width="177"
			:formatter="formatNull"
		/>
		<el-table-column
			prop="is_use"
			label="启用状态"
			min-width="92"
			show-overflow-tooltip
		>
			<template #default="{row, column}">
				<text-ellipsis style="width: 100%;">
					<span
						v-if="row[column.property] == 1"
						style="color: #5db92e;"
					>启用</span>
					<span
						v-else-if="row[column.property] == 0"
						style="color: #f56c6c"
					>禁用</span>
					<span v-else>--</span>
				</text-ellipsis>
			</template>
		</el-table-column>
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
		v-if="handleAuth && form_data.map_scope === APPLY_MAP_SCOPE.custom"
		size="medium"
		:disabled="disabled"
		style="margin-top: 12px;"
		@click="openShuttleDialog"
	>
		添加地图范围
	</label-button>

	<shuttle-dialog
		v-model="shuttle_dialog_visible"
		title="选择地图范围"
		:select-options="formConfig.shuttle_map_options"
		:checked-list.sync="shuttle_checked_list"
		:multiple="formConfig.shuttle_map_multiple"
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

import {AreaType} from "@/types/global";
import {useSceneStore} from "@/store/useSceneStore";
import FkTable from "@/components/ForThink/Table/FkTable.vue";
import LabelButton from "@/components/Button/LabelButton.vue";
import type {CheckedItem} from "@/components/Dialog/constant";
import {AREA_TYPE_SHUTTLE_TYPE, SHUTTLE_TYPE, DIALOG_MODE} from "@/components/Dialog/constant";
import ShuttleDialog from "@/components/Dialog/shuttle/ShuttleDialog.vue";
import AreaDrawer from "@/components/AreaDrawer/AreaDrawer.vue";
import {numberToAreaTypes, typeToTitle} from "@/components/AreaDrawer/constant";
import {checkArchiveAuth} from "@/utils/js/authentication";
import {formatNull} from "@/utils/js/tools/table";
import {OUTDOOR_STOREY_ID} from "@/utils/js/constant";
import {getArea} from "@/api/area/area";

import type {FormData, FormConfig, ApplyMapRow} from "./ruleConfig";
import {APPLY_MAP_SCOPE} from "./ruleConfig";
import {storeToRefs} from "pinia";

interface Props {
	defaultFormData: FormData["apply_map"],
	formConfig: FormConfig,
	handleAuth: boolean,
	deleteAuth: boolean,
	disabled: boolean,
	mode: DIALOG_MODE
}
const props = defineProps<Props>();

const form_data = ref<FormData["apply_map"]>({} as FormData["apply_map"]);
const shuttle_dialog_visible = ref(false);
const shuttle_checked_list = shallowRef<CheckedItem[]>([]);
const area_drawer = ref<InstanceType<typeof AreaDrawer> | null>(null);
const area_map = new Map<number, ApplyMapRow>();

const {scene_floors, floor_obj} = storeToRefs(useSceneStore());

watch(() => props.defaultFormData, (new_form_data) => {
	form_data.value = {...new_form_data};
	form_data.value.map_table_data = [...new_form_data.map_table_data];
	shuttle_checked_list.value = form_data.value.map_table_data.map(({area_name, area_id, area_type, scene_id, map_name}) => {
		return scene_id ? {
			name: map_name!,
			id: scene_id,
			type: SHUTTLE_TYPE.scene
		} : {
			name: area_name!,
			id: area_id!,
			type: AREA_TYPE_SHUTTLE_TYPE[area_type as keyof typeof AREA_TYPE_SHUTTLE_TYPE]
		};
	});
}, {
	immediate: true
});

function openShuttleDialog() {
	shuttle_dialog_visible.value = true;
	fetchAreaData();
}

function openAreaDialog(row: ApplyMapRow) {
	const {area_id, area_type: type} = row;
	if (!checkArchiveAuth(type!)) return;
	const area_drawer_type = numberToAreaTypes[type!];
	area_drawer.value!.openDrawer({
		id: area_id!,
		type: area_drawer_type,
		from: "table",
		title: typeToTitle[area_drawer_type as keyof typeof typeToTitle]
	});
}

function handleShuttleDialogSave(checked_list: CheckedItem[]) {
	form_data.value.map_table_data = checked_list.flatMap(({id, type, name}) => {
		if (type === SHUTTLE_TYPE.scene) {
			return {
				map_name: name,
				area_name: null,
				area_id: null,
				area_type: null,
				rule_group_name: null,
				is_use: null,
				scene_id: id
			};
		} else {
			return area_map.get(id) ?? [];
		}
	});
}

function removeRow(row: ApplyMapRow) {
	form_data.value.map_table_data = form_data.value.map_table_data.filter(({area_id, scene_id}) => {
		return area_id ? area_id !== row.area_id : scene_id !== row.scene_id;
	});
	shuttle_checked_list.value = shuttle_checked_list.value.filter(({id, type}) => {
		return type === SHUTTLE_TYPE.scene ? id !== row.scene_id : id !== row.area_id;
	});
}

async function fetchAreaData() {
	const {data: res} = await getArea().catch(() => ({data: undefined}));
	if (res?.type === 1) {
		res.result.data.forEach((item: any) => {
			if (item.type === AreaType.VIRTUAL_FENCE || item.type === AreaType.ATTENDANCE) {
				const rule_group_name = Array.isArray(item.area_group) ? item.area_group.map(({name}: any) => name).join("、") : "";
				const is_outdoor = floor_obj.value[item.floor_id]?.storey_id === OUTDOOR_STOREY_ID;
				const has_building = Boolean(scene_floors.value[item.scene_id]?.building_ids?.length);
				area_map.set(item.id, {
					map_name: has_building ? is_outdoor ? `${item.scene_name}-室外` : [item.scene_name, item.building_name, item.floor_name].filter(Boolean).join("-") : item.scene_name,
					area_name: item.name,
					area_id: item.id,
					area_type: item.type,
					rule_group_name,
					is_use: item.is_use,
				});
			}
		});
	}
}

// 更改区域名称需要同步刷新列表数据
async function refreshAreaData() {
	await fetchAreaData();
	form_data.value.map_table_data = form_data.value.map_table_data.map((item) => {
		return item.area_id ? {...area_map.get(item.area_id)!} : {...item};
	});
}

function getApiParams() {
	const {map_scope, is_inverse} = form_data.value;
	return {
		is_all_map: map_scope,
		area_ids_inverse: map_scope === APPLY_MAP_SCOPE.all ? 0 : is_inverse,
		area_id_list: map_scope === APPLY_MAP_SCOPE.custom ? shuttle_checked_list.value.map(({id}) => id) : []
	};
}

// 删除某“适用地图范围”才触发
function isTriggerConfirmBox() {
	const {defaultFormData: default_form_data} = props;
	const mapCallback = ({area_id, area_type, scene_id}: ApplyMapRow) => area_id && area_type ? `${area_type}-${area_id}` : scene_id!.toString();
	const default_map_ids = default_form_data.map_table_data.map(mapCallback);
	const new_map_ids = form_data.value.map_table_data.map(mapCallback);
	const is_reserve = default_map_ids.every((id) => new_map_ids.includes(id));
	return !is_reserve;
}

defineExpose({
	getApiParams,
	isTriggerConfirmBox
});
</script>

<style scoped lang="scss">
.apply-map-container {
	.select-wrap {
		margin-bottom: 12px;
		display: flex;

		.el-select {
			flex: 0 1 50%;

			&:nth-child(1) {
				padding-right: 8px;
			}

			&:nth-child(2) {
				padding-left: 8px;
			}
		}
	}
}
</style>
