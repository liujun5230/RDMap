<template>
<div class="h-[0] flex flex-col flex-1 gap-y-[12px] relative">
	<multiple-detail-tabs
		v-model="active_tab"
		class="flex-none"
		:tabs="tabs"
		:data="tabs_data"
		@tab-click="handleTabClick"
	/>
	<div
		v-if="!loading"
		class="h-[0] flex-1 flex flex-col gap-y-[12px]"
	>
		<detail-box-loading v-if="table_loading" />
		<el-table
			v-if="!table_loading"
			row-key="id"
			class="fk-index-table flex-1"
			height="0"
			:class="{small}"
			:data="table_data"
			stripe
			border
			:default-sort="{...sort_field, order: sort_field.order === 'asc' ? 'ascending' : sort_field.order === 'desc' ? 'descending' : ''}"
			@sort-change="handleTableSort"
		>
			<fk-table-column
				v-for="col in table_columns"
				:key="col.prop"
				:label="formatColLabel(col.label)"
				:prop="col.prop"
				:sortable="['in_pit_time', 'pit_stay_time'].includes(col.prop) ? 'custom' : undefined"
				:show-overflow-tooltip="false"
				:show-header-tip="['名称', '相关信息'].includes(formatColLabel(col.label))"
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
							@click="openAreaDetailDialog(row, item.area_id, item.type)"
						>
							{{ item.area_name }}
						</span>
						<span v-if="!row[col.prop]?.length">--</span>
					</text-ellipsis>
					<text-ellipsis
						v-else-if="single_detail_dialog_cols.includes(col.prop)"
						style="width:100%;"
						:class="{link: formatCellValue(row, col) !== '--'}"
						@click="openDetail(row)"
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
		<pagination-simple
			v-show="!table_loading"
			class="flex-none"
			:page.sync="paginator.page"
			:total="paginator.total"
			:limit="paginator.limit"
			@current-change="immediatelyFetch()"
		/>
	</div>
	<detail-box-loading v-if="loading" />
</div>
</template>

<script setup lang="ts">
import {computed, type ComputedRef, ref, shallowRef, onMounted} from "vue";
import {useTimeoutPoll} from "@vueuse/core";

import store from "@/store";
import {resolveCustomText} from "@/store/modules/featureFlags";
import {small} from "@/utils/ts/breakpoints";
import {formatNull} from "@/utils/js/tools/table";
import {cleanupExpiredEffect} from "@/utils/js/common";
import {useLoading} from "@/composable/useLoading";
import {type GetPitMultiDetailResponse, type GetPitMultiDetailParams, getPitMultiDetail} from "@/api/pit/pitRecord";
import FkTableColumn from "@/components/ForThink/Table/FkTableColumn.vue";
import {useNameTips, useRelatedInfoTips} from "@/composable/hide";
import {type TableSortOrder, AreaType} from "@/types/global";

import type {MultipleDetailPitProps, MultipleDetailPitCategory, SingleDetailPositionObjProps} from "@index/store";
import {useAreaStore, useDetailDialogStore, DetailDialogCategoryEnum} from "@index/store";
import DetailBoxLoading from "@index/components/DetailDialog/components/DetailBoxLoading.vue";
import MultipleDetailTabs from "@index/components/DetailDialog/components/MultipleDetailTabs.vue";
import PaginationSimple from "@index/components/DetailDialog/components/PaginationSimple.vue";
import EmptyPlaceholder from "@index/components/EmptyPlaceholder.vue";
import {poll_interval} from "@index/utils/config";
import {pit_tab_column_map} from "@index/components/DetailDialog/multiple/constant";
import {PAGINATOR_LIMIT} from "@index/components/DetailDialog/constant";
import {ModuleNameEnum} from "@index/container/modules/constant";

import {formatColLabel} from "../constant";
import {UTYPES} from "@/utils/js/constant";

const props = defineProps<{
	category: MultipleDetailPitCategory
}>();

type ActiveTabKey = Exclude<MultipleDetailPitProps["default_tab"], undefined>;
type TableRow = GetPitMultiDetailResponse["data"]["data"]["0"]

const single_detail_dialog_cols = ["name", "licence", "serial_num"];
const multiple_detail_dialog_cols = ["branch_name", "company", "unit_name", "type_name"];

const sort_field = ref({order: "", prop: ""});
const active_tab = ref<ActiveTabKey>("person");
const tabs = shallowRef<{label: string, key: ActiveTabKey, num: number}[]>([]);
const tabs_data = shallowRef<Record<ActiveTabKey, number>>({} as Record<ActiveTabKey, number>);
const table_data = shallowRef<TableRow[]>([]);
const paginator = ref({page: 1, total: 0, limit: PAGINATOR_LIMIT});

const dialog = computed(() => detail_dialog_store.getDialog(props.category));
const dialog_props = computed(() => dialog.value.props) as ComputedRef<MultipleDetailPitProps>;
const module_display_setting = computed(() => {
	const module_setting = dialog_props.value?.module_setting;
	// 外部未传module_setting，默认都显示
	if (!module_setting) return new Proxy({}, {
		get: () => true
	}) as unknown as Record<string, boolean>;
	return module_setting.options.reduce((result, item) => {
		result[item.name] = Boolean(item.is_display) && Boolean(item.is_use);
		return result;
	}, {} as Record<string, boolean>);
});
const person_columns = computed(() => {
	const person_dict = store.getters.person_dict;
	const columns = pit_tab_column_map.person;
	return columns.filter(({prop}) => {
		if (prop === "job_num") return person_dict.job_num;
		return true;
	});
});
const visitor_columns = computed(() => {
	const visitor_dict = store.getters.visitor_dict;
	const columns = pit_tab_column_map.visitor;
	return columns.filter(({prop}) => {
		if (prop === "company") return visitor_dict.company;
		return true;
	});
});

const contractor_columns = computed(() => {
	const contractor_dict = store.getters.contractor_dict;
	const columns = pit_tab_column_map.contractor;
	return columns.filter(({prop}) => {
		if (prop === "unit_name") return contractor_dict.unit_id;
		return true;
	});
});
const truck_columns = computed(() => {
	const car_dict = store.getters.car_dict;
	const columns = pit_tab_column_map.truck;
	return columns.filter(({prop}) => {
		if (prop === "licence") return car_dict.licence;
		if (prop === "type_name") return car_dict.type;
		if (prop === "driver") return car_dict.driver;
		return true;
	});
});
const material_columns = computed(() => {
	const material_dict = store.getters.material_dict;
	const columns = pit_tab_column_map.material;
	return columns.filter(({prop}) => {
		if (prop === "serial_num") return material_dict.serial_num;
		if (prop === "name") return material_dict.name;
		if (prop === "type_name") return material_dict.type;
		return true;
	});
});
const table_columns = computed(() => {
	switch (active_tab.value) {
	case "person":
		return person_columns.value;
	case "visitor":
		return visitor_columns.value;
	case "contractor":
		return contractor_columns.value;
	case "truck":
		return truck_columns.value;
	case "material":
		return material_columns.value;
	default:
		return pit_tab_column_map.default;
	}
});

const detail_dialog_store = useDetailDialogStore();
const area_store = useAreaStore();
const {loading, startLoading, endLoading} = useLoading();
const {loading: table_loading, startLoading: startTableLoading, endLoading: endTableLoading} = useLoading();
const name_tips = useNameTips();
const relation_info_tips = useRelatedInfoTips();

const getData = cleanupExpiredEffect(async (onCleanup: (cb: () => void) => void) => {
	let is_validate = true;
	onCleanup(() => {
		is_validate = false;
	});
	const params = getRequestParams();
	const {data: res} = await getPitMultiDetail(params).catch(() => ({data: undefined}));
	endLoading();
	endTableLoading();
	if (is_validate && res?.type === 1) {
		setTabs(res.result);
		paginator.value.total = tabs_data.value[active_tab.value];
		table_data.value = [...res.result.data.data];
	}
});
const {resume} = useTimeoutPoll(getData, poll_interval, {immediate: false});

onMounted(() => {
	// 上下井详情窗必须指定default_tab，#19039
	active_tab.value = dialog_props.value.default_tab;
	startLoading();
	resume();
});

function getRequestParams() {
	const {scene_id, rule_id, personnel_id, branch_id, duty_id, work_type_id, type_id, company, pit_card_flag, unit_id} = dialog_props.value;
	const params: GetPitMultiDetailParams = {
		utype: [-1],
		card_type_name: undefined,
		scene_id,
		rule_id,
		order: sort_field.value.order || undefined,
		field: sort_field.value.prop || undefined,
		personnel_id,
		unit_id,
		branch_id,
		duty_id,
		work_type_id,
		type_id,
		company,
		page: paginator.value.page,
		limit: paginator.value.limit
	};
	switch (active_tab.value) {
	case "person":
		params.utype = [1];
		params.card_type_name = undefined;
		break;
	case "visitor":
		params.utype = [3];
		params.card_type_name = undefined;
		break;
	case "contractor":
		params.utype = [6];
		params.card_type_name = undefined;
		break;
	case "truck":
		params.utype = [2];
		params.card_type_name = undefined;
		break;
	case "material":
		params.utype = [5];
		params.card_type_name = undefined;
		break;
	case "total":
		params.utype = pit_card_flag ? [-1] : [
			module_display_setting.value["员工"] ? 1 : -2,
			module_display_setting.value["访客"] ? 3 : -2,
			module_display_setting.value["承包商"] ? 6 : -2,
			module_display_setting.value["车辆"] ? 2 : -2,
			module_display_setting.value["物资"] ? 5 : -2,
		].filter((val) => val !== -2);
		params.card_type_name = undefined;
		break;
	default:
		params.utype = [-1];
		params.card_type_name = active_tab.value;
		break;
	}

	return params;
}

async function immediatelyFetch() {
	startTableLoading();
	await getData();
}

function handleTabClick() {
	paginator.value.page = 1;
	paginator.value.total = 0;
	immediatelyFetch();
}

function setTabs(data: GetPitMultiDetailResponse) {
	const flags = store.getters.flags;
	const {category} = dialog.value;
	let tab_list: {label: string, key: ActiveTabKey, num: number}[] = [];

	const getPitStatisticsTabList = () => {
		if (data.data.pit_rule_flag === 0) {
			const list = (data.data.person_card_type_num_list || []).map((item) => {
				let num = item.person_pit_num;
				if (flags.displayVisitor) {
					num += item.visitor_pit_num;
				}
				if (flags.displayContractor) {
					num += item.contractor_pit_num;
				}
				if (flags.car) {
					num += item.truck_pit_num;
				}
				if (flags.displayMaterial) {
					num += item.material_pit_num;
				}
				return {
					label: item.name,
					key: item.name,
					num: num
				};
			});
			const total_num = list.reduce((sum, {num}) => {
				sum += num;
				return sum;
			}, 0);
			list.unshift({label: resolveCustomText("pit_total"), key: "total", num: total_num});
			return list;
		} else {
			const list = [
				{label: "员工", key: "person", num: data.data.person_pit_num},
				{label: "访客", key: "visitor", num: data.data.visitor_pit_num},
				{label: "承包商", key: "contractor", num: data.data.contractor_pit_num},
				{label: "车辆", key: "truck", num: data.data.truck_pit_num},
				{label: "物资", key: "material", num: data.data.material_pit_num}
			].filter(({label}) => module_display_setting.value[label]);
			list.unshift({label: resolveCustomText("pit_total"), key: "total", num: 0});

			if (!flags.displayVisitor) {
				const find_index = list.findIndex(({key}) => key === "visitor");
				find_index > -1 && list.splice(find_index, 1);
			}
			if (!flags.displayContractor) {
				const find_index = list.findIndex(({key}) => key === "contractor");
				find_index > -1 && list.splice(find_index, 1);
			}
			if (!flags.car) {
				const find_index = list.findIndex(({key}) => key === "truck");
				find_index > -1 && list.splice(find_index, 1);
			}
			if (!flags.displayMaterial) {
				const find_index = list.findIndex(({key}) => key === "material");
				find_index > -1 && list.splice(find_index, 1);
			}

			const total_num = list.reduce((sum, {num}) => {
				sum += num;
				return sum;
			}, 0);
			list[0].num = total_num;
			return list;
		}
	};

	switch (category) {
	case DetailDialogCategoryEnum.BRANCH:
	case DetailDialogCategoryEnum.WORK_TYPE:
	case DetailDialogCategoryEnum.DUTY:
	case DetailDialogCategoryEnum.PERSON_CLASSIFY:
		tab_list = [{label: "员工", key: "person", num: data.data.count}];
		break;
	case DetailDialogCategoryEnum.VISITOR_UNIT:
		tab_list = [{label: "访客", key: "visitor", num: data.data.count}];
		break;
	case DetailDialogCategoryEnum.CONTRACTOR_UNIT:
	case DetailDialogCategoryEnum.CONTRACTOR_WORK_TYPE:
		tab_list = [{label: "承包商", key: "contractor", num: data.data.count}];
		break;
	case DetailDialogCategoryEnum.TRUCK_TYPE:
		tab_list = [{label: "车辆", key: "truck", num: data.data.count}];
		break;
	case DetailDialogCategoryEnum.MATERIAL_TYPE:
		tab_list = [{label: "物资", key: "material", num: data.data.count}];
		break;
	case DetailDialogCategoryEnum.PIT_STATISTICS:
		tab_list = getPitStatisticsTabList();
		break;
	}
	tabs.value = tab_list;
	tabs_data.value = tab_list.reduce((result, item) => {
		result[item.key] = item.num;
		return result;
	}, {} as Record<ActiveTabKey, number>);
}

function handleTableSort({prop, order}: TableSortOrder) {
	if (order) {
		sort_field.value.prop = prop;
		sort_field.value.order = order === "ascending" ? "asc" : "desc";
	} else {
		sort_field.value.prop = "";
		sort_field.value.order = "";
	}
	immediatelyFetch();
}

function formatColHeaderTip(label: string | (() => string)) {
	const real_label = formatColLabel(label);
	if (real_label === "名称") return name_tips.value;
	if (real_label === "相关信息") return relation_info_tips.value;
	return undefined;
}

function formatCellValue(row: TableRow, col: any) {
	const origin_val = row[col.prop as unknown as keyof TableRow];
	const val = typeof col.formatter === "function" ? col.formatter(origin_val, col, row) : origin_val;
	return formatNull(row, col, val);
}

const openDetail = (row: TableRow) => {
	const detail_props: SingleDetailPositionObjProps = {
		uuid: Number(row.uuid),
		utype: row.utype as SingleDetailPositionObjProps["utype"],
	};
	detail_dialog_store.setProps(DetailDialogCategoryEnum.POSITION_OBJECT, detail_props);
	detail_dialog_store.toggleVisible(DetailDialogCategoryEnum.POSITION_OBJECT, true);
};

const openAreaDetailDialog = (row: TableRow, area_id: number, area_type: number) => {
	if (area_type === AreaType.UP_DOWN_PIT_FIRST || area_type === AreaType.UP_DOWN_PIT_SECOND) return;
	const {floor_id} = row;
	const {name: area_name, area_group_id, area_group_name, area_type_name} = area_store.area_id_info[area_id] ?? {};

	const category = DetailDialogCategoryEnum.AREA_NAME;
	detail_dialog_store.setProps(category, {
		dialog_id: String(area_id),
		direction: "rtl",
		title: area_name,
		areas: {[area_group_id ?? -1]: [area_id]},
		floor_id_list: floor_id !== undefined ? [floor_id] : undefined,
		area_type_name,
		area_group_name
	});
	detail_dialog_store.toggleVisible(category, true);
};

function openMultipleDetailDialog({row, col}: {row: TableRow, col: any}) {
	const {branch_id, branch_name, company, type_id, unit_id, unit_name, utype, type_name} = row;
	const {label} = col;
	let category: DetailDialogCategoryEnum.BRANCH | DetailDialogCategoryEnum.VISITOR_UNIT | DetailDialogCategoryEnum.CONTRACTOR_UNIT | DetailDialogCategoryEnum.TRUCK_TYPE | DetailDialogCategoryEnum.MATERIAL_TYPE;
	const detail_props: MultipleDetailPitProps = {
		from: ModuleNameEnum.PIT,
		direction: "rtl",
		title: undefined,
		branch_id: undefined,
		company: undefined,
		type_id: undefined,
		unit_id: undefined,
		scene_id: dialog_props.value.scene_id,
		default_tab: active_tab.value,
		pit_card_flag: dialog_props.value.pit_card_flag,
		module_setting: dialog_props.value.module_setting
	};
	if (label === "部门") {
		category = DetailDialogCategoryEnum.BRANCH;
		detail_props.title = branch_name;
		detail_props.branch_id = branch_id;
	} else if (label === "单位" && utype === UTYPES.VISITOR) {
		category = DetailDialogCategoryEnum.VISITOR_UNIT;
		detail_props.title = company;
		detail_props.company = company;
	} else if (label === "单位" && utype === UTYPES.CONTRACTOR) {
		category = DetailDialogCategoryEnum.CONTRACTOR_UNIT;
		detail_props.title = unit_name;
		detail_props.unit_id = unit_id;
	} else if (label === "车辆类型") {
		category = DetailDialogCategoryEnum.TRUCK_TYPE;
		detail_props.title = type_name;
		detail_props.type_id = type_id;
	} else {
		category = DetailDialogCategoryEnum.MATERIAL_TYPE;
		detail_props.title = type_name;
		detail_props.type_id = type_id;
	}

	detail_dialog_store.setProps(category, detail_props, ModuleNameEnum.PIT);
	detail_dialog_store.toggleVisible(category, true);
}

function getAllCard() {
	return table_data.value.map(({card_id}) => card_id);
}

defineExpose({getAllCard});
</script>
