<template>
<div class="h-[0] flex flex-col flex-1 gap-y-[12px]">
	<div
		v-if="dialog_props.area_group_name || dialog_props.area_type_name"
		class="flex gap-x-[6px]"
	>
		<div
			v-if="dialog_props.area_type_name"
			class="sub-title"
		>
			{{ dialog_props.area_type_name }}
		</div>
		<div
			v-if="dialog_props.area_group_name"
			class="sub-title"
		>
			{{ dialog_props.area_group_name }}
		</div>
	</div>

	<multiple-detail-tabs
		v-model="active_tab"
		:tabs="tabs"
		:data="tabs_data"
		@tab-click="handleTabClick"
	/>

	<div
		class="flex-1 relative overflow-auto"
	>
		<detail-box-loading v-show="loading" />
		<position-obj-content-table
			v-if="!loading"
			style="position: absolute;"
			:data="all_table[active_tab]"
			:columns="table_columns"
			@area-detail="openAreaMultipleDetailDialog($event)"
			@single-detail="openSingleDetailDialog($event)"
			@multiple-detail="openMultipleDetailDialog($event)"
		/>
	</div>

	<pagination-simple
		:page="paginator.page"
		:total="paginator.total"
		:limit="paginator.limit"
		@current-change="changePage"
	/>
</div>
</template>

<script setup lang="ts">
import {computed, ref, shallowRef, watch, onBeforeUnmount, onMounted} from "vue";
import {useTimeoutPoll, useEventBus} from "@vueuse/core";
import {storeToRefs} from "pinia";

import store from "@/store";
import {useEmergencyStore} from "@/store/useEmergencyStore";
import {EVACUATE_UPDATE_PROGRESS_KEY} from "@/events";
import {useLoading, useTablePage} from "@/composable";
import type {PositionObjMultiDetailResult} from "@/api/homepage/detail";
import {getPositionObjMultiDetail} from "@/api/homepage/detail";
import {getEvacuateObj} from "@/api/realtime/Evacuate";
import {UTYPES} from "@/utils/js/constant";
import {cleanupExpiredEffect} from "@/utils/js/common";

import {useDetailDialogStore, DetailDialogCategoryEnum, useAreaStore} from "@index/store";
import type {MultipleDetailPositionObjProps, MultipleDetailPositionObjCategory} from "@index/store";
import {poll_interval} from "@index/utils/config";
import {useMutexConfig} from "@index/composable";
import {EvaModuleNameEnum} from "@index/container/modules/constant";
import DetailBoxLoading from "@index/components/DetailDialog/components/DetailBoxLoading.vue";
import MultipleDetailTabs from "@index/components/DetailDialog/components/MultipleDetailTabs.vue";
import PaginationSimple from "@index/components/DetailDialog/components/PaginationSimple.vue";

import type {AreaDetailEmitParams, SingleDetailEmitParams, MultipleDetailEmitParams} from "./PositionObjContentTable.vue";
import PositionObjContentTable from "./PositionObjContentTable.vue";
import {tab_column_map} from "../constant";
import {PAGINATOR_LIMIT} from "../../constant";

interface Props {
	category: MultipleDetailPositionObjCategory
}
const props = defineProps<Props>();

type ActiveTabKey = "all" | "person" | "visitor" | "contractor" |"truck" | "material";

type AllTable = {
	all: PositionObjMultiDetailResult["all"]["data"],
	person: PositionObjMultiDetailResult["person"]["data"],
	visitor: PositionObjMultiDetailResult["visitor"]["data"],
	contractor: PositionObjMultiDetailResult["contractor"]["data"],
	truck: PositionObjMultiDetailResult["truck"]["data"],
	material: PositionObjMultiDetailResult["material"]["data"]
}
const all_table = shallowRef<AllTable>({
	all: [],
	person: [],
	visitor: [],
	contractor: [],
	truck: [],
	material: []
});
const tabs_data = shallowRef({all: 0, person: 0, visitor: 0, contractor: 0, truck: 0, material: 0});
const active_tab = ref<ActiveTabKey>("all");

const dialog = computed(() => detail_dialog_store.getDialog(props.category));
const dialog_props = computed(() => dialog.value.props as MultipleDetailPositionObjProps);
const tabs = computed(() => {
	const flags = store.getters.flags;
	const {category} = dialog.value;
	let tab_list: any[] = [];

	switch (category) {
	case DetailDialogCategoryEnum.BRANCH:
	case DetailDialogCategoryEnum.WORK_TYPE:
	case DetailDialogCategoryEnum.DUTY:
	case DetailDialogCategoryEnum.PERSON_CLASSIFY:
		tab_list = [{label: "员工", key: "person", utype: UTYPES.PERSON}];
		break;
	case DetailDialogCategoryEnum.VISITOR_UNIT:
		tab_list = [{label: "访客", key: "visitor", utype: UTYPES.VISITOR}];
		break;
	case DetailDialogCategoryEnum.CONTRACTOR_UNIT:
	case DetailDialogCategoryEnum.CONTRACTOR_WORK_TYPE:
		tab_list = [{label: "承包商", key: "contractor", utype: UTYPES.CONTRACTOR}];
		break;
	case DetailDialogCategoryEnum.TRUCK_TYPE:
		tab_list = [{label: "车辆", key: "truck", utype: UTYPES.CAR}];
		break;
	case DetailDialogCategoryEnum.MATERIAL_TYPE:
		tab_list = [{label: "物资", key: "material", utype: UTYPES.MATERIAL}];
		break;
	default:
		tab_list = [
			{label: "员工", key: "person", utype: UTYPES.PERSON},
			{label: "访客", key: "visitor", utype: UTYPES.VISITOR},
			{label: "承包商", key: "contractor", utype: UTYPES.CONTRACTOR},
			{label: "车辆", key: "truck", utype: UTYPES.CAR},
			{label: "物资", key: "material", utype: UTYPES.MATERIAL},
		];
		break;
	}

	if (!flags.displayVisitor) {
		const find_index = tab_list.findIndex(({key}) => key === "visitor");
		find_index > -1 && tab_list.splice(find_index, 1);
	}

	if (!flags.displayContractor) {
		const find_index = tab_list.findIndex(({key}) => key === "contractor");
		find_index > -1 && tab_list.splice(find_index, 1);
	}

	if (!flags.car) {
		const find_index = tab_list.findIndex(({key}) => key === "truck");
		find_index > -1 && tab_list.splice(find_index, 1);
	}

	if (!flags.displayMaterial) {
		const find_index = tab_list.findIndex(({key}) => key === "material");
		find_index > -1 && tab_list.splice(find_index, 1);
	}

	if (tab_list.length > 1) {
		tab_list.unshift({label: "全部", key: "all"});
	}

	return tab_list;
});
const all_columns = computed(() => {
	const columns = tab_column_map.all;

	if (dialog.value.category === DetailDialogCategoryEnum.AREA_TEMP) {
		return columns.filter((col) => !["areas", "in_area_time", "stay_time"].includes(col.prop));
	}
	return columns;
});
const person_columns = computed(() => {
	const person_dict = store.getters.person_dict;
	const columns = tab_column_map.person;
	const filter_columns = columns.filter(({prop}) => {
		if (prop === "job_num") return person_dict.job_num;
		return true;
	});

	if (dialog.value.category === DetailDialogCategoryEnum.AREA_TEMP) {
		return filter_columns.filter((col) => !["areas", "in_area_time", "stay_time"].includes(col.prop));
	}
	return filter_columns;
});
const visitor_columns = computed(() => {
	const visitor_dict = store.getters.visitor_dict;
	const columns = tab_column_map.visitor;
	const filter_columns = columns.filter(({prop}) => {
		if (prop === "company") return visitor_dict.company;
		return true;
	});

	if (dialog.value.category === DetailDialogCategoryEnum.AREA_TEMP) {
		return filter_columns.filter((col) => !["areas", "in_area_time", "stay_time"].includes(col.prop));
	}
	return filter_columns;
});
const contractor_columns = computed(() => {
	const contractor_dict = store.getters.contractor_dict;
	const columns = tab_column_map.contractor;
	const filter_columns = columns.filter(({prop}) => {
		if (prop === "unit_name") return contractor_dict.unit_id;
		return true;
	});

	if (dialog.value.category === DetailDialogCategoryEnum.AREA_TEMP) {
		return filter_columns.filter((col) => !["areas", "in_area_time", "stay_time"].includes(col.prop));
	}
	return filter_columns;
});
const truck_columns = computed(() => {
	const car_dict = store.getters.car_dict;
	const columns = tab_column_map.truck;
	const filter_columns = columns.filter(({prop}) => {
		if (prop === "licence") return car_dict.licence;
		if (prop === "type_name") return car_dict.type;
		if (prop === "driver") return car_dict.driver;
		return true;
	});

	if (dialog.value.category === DetailDialogCategoryEnum.AREA_TEMP) {
		return filter_columns.filter((col) => !["areas", "in_area_time", "stay_time"].includes(col.prop));
	}

	return filter_columns;
});
const material_columns = computed(() => {
	const material_dict = store.getters.material_dict;
	const columns = tab_column_map.material;
	const filter_columns = columns.filter(({prop}) => {
		if (prop === "serial_num") return material_dict.serial_num;
		if (prop === "name") return material_dict.name;
		if (prop === "type_name") return material_dict.type;
		return true;
	});

	if (dialog.value.category === DetailDialogCategoryEnum.AREA_TEMP) {
		return filter_columns.filter((col) => !["areas", "in_area_time", "stay_time"].includes(col.prop));
	}
	return filter_columns;
});
const table_columns = computed(() => {
	switch (active_tab.value) {
	case "all": return all_columns.value;
	case "person": return person_columns.value;
	case "visitor": return visitor_columns.value;
	case "contractor": return contractor_columns.value;
	case "truck": return truck_columns.value;
	case "material": return material_columns.value;
	default: return [];
	}
});

const fetchData = cleanupExpiredEffect(async (onCleanup: (cb: () => void) => void) => {
	let is_validate = true;
	onCleanup(() => {
		is_validate = false;
	});
	const {page, limit} = paginator.value;
	let result: any;
	const area_id = dialog_props.value.area_id || Object.values(dialog_props.value.areas || {})?.[0]?.[0];
	const evacuate_type = getEvacuateType(area_id);
	if (evacuate_type) {
		// 紧急撤离模式下点击安全区域、事故区域、疏散区域的详情数据
		const {data: res} = await getEvacuateObj({
			evacuate_type,
			record_id: emergency_record_id.value,
			area_id
		}).catch(() => ({data: undefined}));
		result = res;
	} else {
		const request_params = {
			utype_list: dialog_props.value.utype_list ?? tabs.value.flatMap(({utype}) => utype ? utype : []),
			areas: dialog_props.value.areas,
			area_type: dialog_props.value.area_type,
			tmp_area: dialog_props.value.tmp_area,
			tmp_area_floor_id: dialog_props.value.tmp_area_floor_id,
			tmp_area_scene_id: dialog_props.value.tmp_area_scene_id,
			tmp_area_relative_start: dialog_props.value.tmp_area_relative_start,
			tmp_area_relative_end: dialog_props.value.tmp_area_relative_end,
			floor_id_list: dialog_props.value.floor_id_list,
			building_id: dialog_props.value.building_id,
			scene_id: dialog_props.value.scene_id,
			person_class_id: dialog_props.value.person_class_id,
			branch_id: dialog_props.value.branch_id,
			duty_id: dialog_props.value.duty_id,
			unit_id: dialog_props.value.unit_id,
			work_type_id: dialog_props.value.work_type_id,
			truck_type_id: dialog_props.value.truck_type_id,
			material_type_id: dialog_props.value.material_type_id,
			visitor_company: dialog_props.value.visitor_company,
			page,
			limit
		};
		const {data: res} = await getPositionObjMultiDetail(request_params).catch(() => ({data: undefined}));
		result = res;
	}

	if (is_validate && result?.type === 1) {
		const {all, person, visitor, truck, material, contractor} = result.result;
		tabs_data.value = {
			all: all?.count ?? 0,
			person: person?.count ?? 0,
			visitor: visitor?.count ?? 0,
			contractor: contractor?.count ?? 0,
			truck: truck?.count ?? 0,
			material: material?.count ?? 0,
		};

		switch (active_tab.value) {
		case "all":
			paginator.value.total = tabs_data.value.all;
			break;
		case "person":
			paginator.value.total = tabs_data.value.person;
			break;
		case "visitor":
			paginator.value.total = tabs_data.value.visitor;
			break;
		case "contractor":
			paginator.value.total = tabs_data.value.contractor;
			break;
		case "truck":
			paginator.value.total = tabs_data.value.truck;
			break;
		case "material":
			paginator.value.total = tabs_data.value.material;
			break;
		default:
			paginator.value.total = 0;
			break;
		}

		all_table.value = {
			all: all?.data ?? [],
			person: person?.data ?? [],
			visitor: visitor?.data ?? [],
			contractor: contractor?.data ?? [],
			truck: truck?.data ?? [],
			material: material?.data ?? [],
		};
	}
	endLoading();
});

const {pause, resume} = useTimeoutPoll(fetchData, poll_interval, {immediate: false});
const area_store = useAreaStore();
const {loading, startLoading, endLoading} = useLoading();
const detail_dialog_store = useDetailDialogStore();
const {pages: paginator, changePage} = useTablePage(immediatelyFetch, {init_limit: PAGINATOR_LIMIT});
const {accident_area_ids, evacuate_area_ids, security_area_ids, emergency_record_id} = storeToRefs(useEmergencyStore());
const {has} = useMutexConfig();
useEventBus(EVACUATE_UPDATE_PROGRESS_KEY).on(fetchData);

watch(() => `${dialog_props.value.default_tab}${tabs.value}`, () => {
	if (tabs.value.length) {
		active_tab.value = dialog_props.value.default_tab ?? tabs.value[0].key;
	}
}, {immediate: true});

onMounted(() => {
	startLoading();
	startLoop();
});

onBeforeUnmount(() => {
	endLoop();
});

async function immediatelyFetch() {
	endLoop();
	startLoading();
	await fetchData();
	setTimeout(startLoop, poll_interval);
}

function handleTabClick() {
	paginator.value.page = 1;
	paginator.value.total = 0;
	immediatelyFetch();
}

function startLoop() {
	const {from} = dialog_props.value;
	if (from === EvaModuleNameEnum.AREA) {
		fetchData();
	} else {
		resume();
	}
}

function endLoop() {
	const {from} = dialog_props.value;
	if (from !== EvaModuleNameEnum.AREA) {
		pause();
	}
}

function getEvacuateType(area_id?: number) {
	if (!area_id || !has("emergency_evacuation")) return undefined;
	if (accident_area_ids.value.has(area_id)) return 1;
	if (evacuate_area_ids.value.has(area_id)) return 2;
	if (security_area_ids.value.has(area_id)) return 3;
}

function openSingleDetailDialog({row}: SingleDetailEmitParams) {
	const {uuid, utype} = row;
	const category = DetailDialogCategoryEnum.POSITION_OBJECT;
	detail_dialog_store.setProps(category, {
		direction: "rtl",
		utype,
		uuid
	});
	detail_dialog_store.toggleVisible(category, true);
}

function openMultipleDetailDialog({row, col}: MultipleDetailEmitParams) {
	const {branch_id, branch_name, company, unit_name, unit_id, type: type_id, type_name, utype} = row;
	const {label} = col;
	let category: DetailDialogCategoryEnum.DUTY | DetailDialogCategoryEnum.VISITOR_UNIT | DetailDialogCategoryEnum.CONTRACTOR_UNIT | DetailDialogCategoryEnum.TRUCK_TYPE | DetailDialogCategoryEnum.MATERIAL_TYPE;
	const dialog_props: MultipleDetailPositionObjProps = {
		direction: "rtl",
		title: undefined,
		branch_id: undefined,
		unit_id: undefined,
		visitor_company: undefined,
		truck_type_id: undefined,
		material_type_id: undefined
	};
	if (label === "部门") {
		category = DetailDialogCategoryEnum.DUTY;
		dialog_props.title = branch_name;
		dialog_props.branch_id = branch_id;
	} else if (label === "单位" && utype === UTYPES.VISITOR) {
		category = DetailDialogCategoryEnum.VISITOR_UNIT;
		dialog_props.title = company;
		dialog_props.visitor_company = company;
	} else if (label === "单位" && utype === UTYPES.CONTRACTOR) {
		category = DetailDialogCategoryEnum.CONTRACTOR_UNIT;
		dialog_props.title = unit_name;
		dialog_props.unit_id = unit_id;
	} else if (label === "车辆类型") {
		category = DetailDialogCategoryEnum.TRUCK_TYPE;
		dialog_props.title = type_name;
		dialog_props.truck_type_id = type_id;
	} else {
		category = DetailDialogCategoryEnum.MATERIAL_TYPE;
		dialog_props.title = type_name;
		dialog_props.material_type_id = type_id;
	}

	detail_dialog_store.setProps(category, dialog_props);
	detail_dialog_store.toggleVisible(category, true);
}

function openAreaMultipleDetailDialog({row, area_item}: AreaDetailEmitParams) {
	const {floor_id} = row;
	const {area_id, area_name, group_id, group_name} = area_item;
	const {area_type_name} = area_store.area_id_info[area_id] ?? {};

	const category = DetailDialogCategoryEnum.AREA_NAME;
	detail_dialog_store.setProps(category, {
		direction: "rtl",
		title: area_name,
		areas: {[group_id ?? -1]: [area_id]},
		floor_id_list: floor_id !== undefined ? [floor_id] : undefined,
		area_type_name,
		area_group_name: group_name
	});
	detail_dialog_store.toggleVisible(category, true);
}

function getAllCard() {
	const {person, visitor, contractor, truck, material} = all_table.value;
	return [...person, ...visitor, ...contractor, ...truck, ...material].flatMap(({card_id}) => card_id ? [card_id] : []);
}

defineExpose({
	getAllCard
});
</script>

<style scoped>
.sub-title {
    border: 1px solid #32496a;
    border-radius: 4px;
    background-color: rgba(86, 98, 122, 0.21);
    padding: 4px 6px;
    color: var(--text-minor-1);
    font-size: 12px;
}
</style>
