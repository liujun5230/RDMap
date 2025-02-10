<template>
<div class="multiple-emergency h-full flex flex-col gap-y-[12px] font-main">
	<module-header
		:title="dialog_props.title"
		class="flex-none"
	>
		<template #operate>
			<div class="flex justify-between items-center gap-[8px]">
				<fk-icon
					v-if="auth.handle"
					class="text-btn-red cursor-pointer hover-icon"
					tip="撤离"
					:size="small ? 20 : 28"
					@click="clickTagEvacuate"
				>
					<evacuate-icon />
				</fk-icon>

				<fk-icon
					class="text-minor-2 px-[8px] cursor-pointer hover-icon hover:text-minor-1"
					tip="关闭"
					:size="small ? 24 : 28"
					@click="closeDialog"
				>
					<close-icon />
				</fk-icon>
			</div>
		</template>
	</module-header>

	<multiple-detail-tabs
		v-model="active_tab"
		class="flex-none"
		:tabs="tabs"
		:data="tabs_data"
		@tab-click="handleTabClick"
	/>

	<div
		class="flex-1 relative overflow-auto"
	>
		<detail-box-loading v-if="loading" />
		<el-table
			ref="table_ref"
			class="fk-index-table"
			:class="{small}"
			height="100%"
			:data="table_data"
			stripe
			border
			@sort-change="changeSort"
		>
			<fk-table-column
				v-for="col in table_columns"
				:key="col.prop"
				:label="col.label"
				:prop="col.prop"
				:sortable="['leave_time', 'arrive_at_time'].includes(col.prop) ? 'custom' : undefined"
				:show-overflow-tooltip="false"
				:show-header-tip="['名称', '相关信息'].includes(col.label)"
				:header-tip="formatColHeaderTip(col.label)"
				:width="col.min_width"
			>
				<template #default="{row}">
					<text-ellipsis
						v-if="col.prop === 'areas'"
						style="width:100%;"
					>
						<span
							v-for="(item) in (row[col.prop] || [])"
							:key="item.area_id"
							class="name-split"
							:class="{link: item.type !== AreaType.UP_DOWN_PIT_FIRST && item.type !== AreaType.UP_DOWN_PIT_SECOND}"
							@click="openAreaDetailDialog(item)"
						>
							{{ item.area_name }}
						</span>
						<span v-if="!row[col.prop]?.length">--</span>
					</text-ellipsis>
					<text-ellipsis
						v-else-if="single_detail_dialog_cols.includes(col.prop)"
						style="width:100%;"
						:class="{link: formatCellValue(row, col) !== '--'}"
						@click="openSingleDetailDialog(row)"
					>
						{{ formatCellValue(row, col) }}
					</text-ellipsis>
					<text-ellipsis
						v-else-if="multiple_detail_dialog_cols.includes(col.prop)"
						style="width:100%;"
						:class="{link: formatCellValue(row, col) !== '--'}"
						@click="openMultipleDetailDialog({row, col})"
					>
						{{ formatCellValue(row, col) }}
					</text-ellipsis>
					<text-ellipsis
						v-else
						style="width:100%;"
					>
						{{ formatCellValue(row, col) }}
					</text-ellipsis>
				</template>
			</fk-table-column>
			<template #empty>
				<empty-placeholder />
			</template>
		</el-table>
	</div>
	<pagination-simple
		class="flex-none"
		:page="pages.page"
		:total="pages.total"
		:limit="pages.limit"
		@current-change="changePage"
	/>
</div>
</template>

<script setup lang="ts">
import {computed, shallowRef, ref, onMounted, reactive, nextTick} from "vue";
import {useEventBus} from "@vueuse/core";
import {storeToRefs} from "pinia";
import type {Table as ElTable} from "element-ui";

import {AreaType} from "@/types/global";
import {TAG_EVACUATE_KEY, EVACUATE_UPDATE_PROGRESS_KEY} from "@/events";
import {useLoading, useTableSort, useTablePage} from "@/composable";
import {useFeatureFlags} from "@/store";
import {useEmergencyStore} from "@/store/useEmergencyStore";
import TextEllipsis from "@/components/TextEllipsis.vue";
import FkTableColumn from "@/components/ForThink/Table/FkTableColumn.vue";
import FkIcon from "@/components/ForThink/FkIcon.vue";
import EvacuateIcon from "~icons/operation/evacuate";
import CloseIcon from "~icons/operation/stroke-close";
import {small} from "@/utils/ts/breakpoints";
import {cleanupExpiredEffect} from "@/utils/js/common";
import {UTYPES} from "@/utils/js/constant";
import {usePageAuth} from "@/utils/js/authentication";
import {formatNull} from "@/utils/js/tools/table";
import {getEvacuateObj, type GetEvacuateObjRow} from "@/api/realtime/Evacuate";
import {useNameTips, useRelatedInfoTips} from "@/composable/hide";

import ModuleHeader from "@index/components/ModuleHeader.vue";
import EmptyPlaceholder from "@index/components/EmptyPlaceholder.vue";
import MultipleDetailTabs from "@index/components/DetailDialog/components/MultipleDetailTabs.vue";
import type {MultipleDetailEmergencyCategory, MultipleDetailEmergencyProps, PositionObjTypeEnum} from "@index/store";
import {DetailDialogCategoryEnum, useDetailDialogStore, useAreaStore, type MultipleDetailPositionObjProps} from "@index/store";

import DetailBoxLoading from "../components/DetailBoxLoading.vue";
import PaginationSimple from "../components/PaginationSimple.vue";
import {PAGINATOR_LIMIT} from "../constant";
import {emergency_tab_column_map} from "./constant";

interface Props {
	category: MultipleDetailEmergencyCategory
}
const props = defineProps<Props>();

const single_detail_dialog_cols = ["name", "licence", "serial_num"];
const multiple_detail_dialog_cols = ["branch_name", "company", "unit_name", "type_name"];

type ActiveTabKey = NonNullable<MultipleDetailEmergencyProps["default_tab"]>;
const active_tab = ref<ActiveTabKey>("all");
const getDefaultTabsData = () => ({
	all: 0,
	person: 0,
	visitor: 0,
	truck: 0,
	material: 0,
	contractor: 0
});
const tabs_data = shallowRef(getDefaultTabsData());
const table_data_obj = shallowRef<{
	all: {count: number, data: GetEvacuateObjRow[]},
	person: {count: number, data: GetEvacuateObjRow[]},
	visitor: {count: number, data: GetEvacuateObjRow[]},
	truck: {count: number, data: GetEvacuateObjRow[]},
	material: {count: number, data: GetEvacuateObjRow[]},
	contractor: {count: number, data: GetEvacuateObjRow[]},
}>({
	all: {count: 0, data: []},
	person: {count: 0, data: []},
	visitor: {count: 0, data: []},
	truck: {count: 0, data: []},
	material: {count: 0, data: []},
	contractor: {count: 0, data: []},
});
const table_ref = ref<InstanceType<typeof ElTable>>();

const dialog_props = computed(() => detail_dialog_store.getDialog(props.category).props as MultipleDetailEmergencyProps);
const tabs = computed(() => {
	const tab_list = [
		{label: "总数", key: "all"},
		{label: "员工", key: "person"},
	];

	flags.displayVisitor && tab_list.push({label: "访客", key: "visitor"});
	flags.displayContractor && tab_list.push({label: "承包商", key: "contractor"});
	flags.car && tab_list.push({label: "车辆", key: "truck"});
	flags.displayMaterial && tab_list.push({label: "物资", key: "material"});

	return tab_list;
});
const table_data = computed(() => table_data_obj.value[active_tab.value].data);
const table_columns = computed(() => emergency_tab_column_map[active_tab.value]);

const fetchTableData = cleanupExpiredEffect(async (onCleanup: (cb: () => void) => void) => {
	let is_validate = true;
	onCleanup(() => {
		is_validate = false;
	});
	const params = {
		...sort_field.value,
		evacuate_type: dialog_props.value.evacuate_type,
		page: pages.value.page,
		limit: pages.value.limit,
		record_id: emergency_record_id.value
	};
	const {data: res} = await getEvacuateObj(params).catch(() => ({data: undefined}));
	if (is_validate && res?.type === 1) {
		table_data_obj.value = res.result;
		pages.value.total = res.result[active_tab.value].count;
		tabs_data.value = {
			all: res.result.all.count,
			person: res.result.person.count,
			visitor: res.result.visitor.count,
			truck: res.result.truck.count,
			material: res.result.material.count,
			contractor: res.result.contractor.count,
		};
	}
	endLoading();
});

const detail_dialog_store = useDetailDialogStore();
const {loading, startLoading, endLoading} = useLoading();
const auth = usePageAuth("/");
const {sort_field, changeSort} = useTableSort(withLoadingFetchTable);
const {pages, changePage} = useTablePage(withLoadingFetchTable, {init_limit: PAGINATOR_LIMIT});
// 撤离进度更新，同步更新详情框
useEventBus(EVACUATE_UPDATE_PROGRESS_KEY).on(fetchTableData);
const {emergency_record_id} = storeToRefs(useEmergencyStore());
const flags = reactive(useFeatureFlags());
const {area_id_info} = storeToRefs(useAreaStore());
const tips = useNameTips();
const related_info_tips = useRelatedInfoTips();

onMounted(() => {
	withLoadingFetchTable();
});

function closeDialog() {
	detail_dialog_store.toggleVisible(props.category, false);
}

async function withLoadingFetchTable() {
	startLoading();
	await fetchTableData();
}

function clickTagEvacuate() {
	const card_id_list = table_data.value.map((item) => item.card_id);
	useEventBus(TAG_EVACUATE_KEY).emit({card_id: card_id_list});
}

function formatColHeaderTip(label: string) {
	if (label === "名称") return tips.value;
	if (label === "相关信息") return related_info_tips.value;
	return undefined;
}

function formatCellValue(row: GetEvacuateObjRow, col: any) {
	const origin_val = row[col.prop as unknown as keyof GetEvacuateObjRow];
	const val = typeof col.formatter === "function" ? col.formatter(origin_val, col, row) : origin_val;
	return formatNull(row, col, val);
}

async function handleTabClick() {
	pages.value.page = 1;
	pages.value.total = 0;
	withLoadingFetchTable();
	await nextTick();
	table_ref.value?.doLayout();
}

function openSingleDetailDialog(row: GetEvacuateObjRow) {
	const {uuid, utype, card_id} = row;
	const dialog_props = {
		utype: utype as unknown as PositionObjTypeEnum,
		uuid,
		card_id
	};
	detail_dialog_store.setProps(DetailDialogCategoryEnum.POSITION_OBJECT, dialog_props);
	detail_dialog_store.toggleVisible(DetailDialogCategoryEnum.POSITION_OBJECT, true);
}

function openAreaDetailDialog(area_item: GetEvacuateObjRow["areas"][0]) {
	const {group_name, group_id, area_id, area_name, type: area_type} = area_item;
	if (area_type === AreaType.UP_DOWN_PIT_FIRST || area_type === AreaType.UP_DOWN_PIT_SECOND) return;
	const area_type_name = area_id_info.value[area_id]?.area_type_name;
	detail_dialog_store.setProps(DetailDialogCategoryEnum.AREA_NAME, {
		title: area_name,
		direction: "rtl",
		area_group_name: group_name,
		area_type_name,
		areas: {
			[group_id || -1]: [area_id]
		}
	});
	detail_dialog_store.toggleVisible(DetailDialogCategoryEnum.AREA_NAME, true);
}

function openMultipleDetailDialog({row, col}: {row: GetEvacuateObjRow, col: any}) {
	const {branch_id, branch_name, company, type: type_id, unit_id, unit_name, utype, type_name} = row;
	const {label} = col;
	let category: DetailDialogCategoryEnum.BRANCH | DetailDialogCategoryEnum.VISITOR_UNIT | DetailDialogCategoryEnum.CONTRACTOR_UNIT | DetailDialogCategoryEnum.TRUCK_TYPE | DetailDialogCategoryEnum.MATERIAL_TYPE;
	const detail_props: MultipleDetailPositionObjProps = {
		direction: "rtl",
		title: undefined,
		branch_id: undefined,
		visitor_company: undefined,
		truck_type_id: undefined,
		material_type_id: undefined,
		unit_id: undefined,
		default_tab: active_tab.value,
	};
	if (label === "部门") {
		category = DetailDialogCategoryEnum.BRANCH;
		detail_props.title = branch_name;
		detail_props.branch_id = branch_id;
	} else if (label === "单位" && utype === UTYPES.VISITOR) {
		category = DetailDialogCategoryEnum.VISITOR_UNIT;
		detail_props.title = company;
		detail_props.visitor_company = company;
	} else if (label === "单位" && utype === UTYPES.CONTRACTOR) {
		category = DetailDialogCategoryEnum.CONTRACTOR_UNIT;
		detail_props.title = unit_name;
		detail_props.unit_id = unit_id;
	} else if (label === "车辆类型") {
		category = DetailDialogCategoryEnum.TRUCK_TYPE;
		detail_props.title = type_name;
		detail_props.truck_type_id = type_id;
	} else {
		category = DetailDialogCategoryEnum.MATERIAL_TYPE;
		detail_props.title = type_name;
		detail_props.material_type_id = type_id;
	}

	detail_dialog_store.setProps(category, detail_props);
	detail_dialog_store.toggleVisible(category, true);
}
</script>

<style scoped>
.multiple-emergency {
	:deep(.fk-index-table) {
		position: absolute;
	}
}
</style>
