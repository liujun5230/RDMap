<template>
<div class="multiple-alarm-content h-[0] flex flex-col flex-1 gap-y-[12px]">
	<div
		v-if="dialog_props.area_group_name || dialog_props.area_type_name"
		class="flex gap-x-[6px] flex-none"
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
		class="flex-none"
		:tabs="tabs"
		:data="tabs_data"
		@tab-click="handleTabClick"
	/>

	<alarm-type-table
		class="flex-1 relative"
		:loading="loading"
		:table-data="table_data"
		show-rule-type-or-name="type"
		area-detail-type="alarm_category"
		:is-include-call="is_include_all"
		:tabs="tabs"
		:begin="dialog_props.begin"
		:end="dialog_props.end"
		:rule-type-list="dialog_props.rule_type_list"
		:auto-scroll="false"
		:category="active_tab"
		@handle="immediatelyFetch()"
	/>

	<pagination-simple
		class="flex-none"
		:page.sync="paginator.page"
		:total="paginator.total"
		:limit="paginator.limit"
		@current-change="immediatelyFetch()"
	/>
</div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, shallowRef, watch} from "vue";
import type {ComputedRef} from "vue";
import {useTimeoutPoll} from "@vueuse/core";

import {getDayAlarmByAreaDetails} from "@/api/homepage/detail";
import type {AlarmMultipleDetailResponse} from "@/api/homepage/detail";
import {useLoading} from "@/composable";
import {ALARM_CATEGORY} from "@/types/alarm";
import {cleanupExpiredEffect} from "@/utils/js/common";

import {useDetailDialogStore, DetailDialogCategoryEnum} from "@index/store";
import type {MultipleDetailAlarmProps} from "@index/store";
import type {Props as AlarmTypeTableProps} from "@index/components/table/AlarmTypeTable.vue";
import AlarmTypeTable from "@index/components/table/AlarmTypeTable.vue";
import {poll_interval} from "@index/utils/config";
import MultipleDetailTabs from "@index/components/DetailDialog/components/MultipleDetailTabs.vue";
import PaginationSimple from "@index/components/DetailDialog/components/PaginationSimple.vue";
import {PAGINATOR_LIMIT} from "@index/components/DetailDialog/constant";

interface Props {
	category: DetailDialogCategoryEnum
}
const props = defineProps<Props>();

const active_tab_column_map = {
	all: 1,
	[ALARM_CATEGORY.tag]: 2,
	[ALARM_CATEGORY.area]: 3,
	[ALARM_CATEGORY.sos]: 4,
	[ALARM_CATEGORY.device]: 5,
	[ALARM_CATEGORY.accident]: 6,
	[ALARM_CATEGORY.healthy]: 7,
	[ALARM_CATEGORY.call]: 8,
};

type ActiveTabKey = "all" | Exclude<ALARM_CATEGORY, ALARM_CATEGORY.patrol>;
type TableRow = AlarmTypeTableProps["tableData"][0];

const active_tab = ref<ActiveTabKey>("all");
const getDefaultTabsData = () => ({
	all: 0,
	[ALARM_CATEGORY.sos]: 0,
	[ALARM_CATEGORY.tag]: 0,
	[ALARM_CATEGORY.area]: 0,
	[ALARM_CATEGORY.device]: 0,
	[ALARM_CATEGORY.accident]: 0,
	[ALARM_CATEGORY.healthy]: 0,
	[ALARM_CATEGORY.call]: 0,
});
const tabs_data = shallowRef(getDefaultTabsData());

const table_data = shallowRef<TableRow[]>([]);
const paginator = ref({page: 1, total: 0, limit: PAGINATOR_LIMIT});

const tabs = computed<{label: string, key: ActiveTabKey}[]>(() => {
	return dialog_props.value.tabs as {label: string, key: ActiveTabKey}[];
});
const is_include_all = computed(() => tabs.value.findIndex(({key}) => key === ALARM_CATEGORY.call) > -1 ? 1 : 0);
const dialog = computed(() => detail_dialog_store.getDialog(props.category));
const dialog_props = computed(() => dialog.value.props) as ComputedRef<MultipleDetailAlarmProps>;

const fetchTableData = cleanupExpiredEffect(async (onCleanup: (cb: () => void) => void) => {
	let is_validate = true;
	onCleanup(() => {
		is_validate = false;
	});
	const transformData = (row: AlarmMultipleDetailResponse): TableRow => {
		return {
			id: row.id,
			rule_type: row.rule_type,
			rule_type_name: row.rule_type_name,
			rule_name: row.rule_name,
			level: row.level,
			name: row.name,
			uuid: row.uuid,
			utype: row.utype,
			device_type: row.device_type,
			card_id: row.card_id,
			time: row.time,
			related_info: row.related_info,
			alarm_manual_handling_setting: row.alarm_manual_handling_setting,
			areas: [{
				scene_id: null,
				scene_name: null,
				area_id: row.area_id,
				area_name: row.area_name,
				type: null,
				group_id: null,
				group_name: null
			}]
		};
	};

	const params = {
		flag: dialog_props.value.flag,
		page: paginator.value.page,
		limit: paginator.value.limit,
		column: active_tab_column_map[active_tab.value],
		type: dialog_props.value.type,
		id: dialog_props.value.id,
		begin: dialog_props.value.begin,
		end: dialog_props.value.end,
		rule_type_list: dialog_props.value.rule_type_list
	};

	const {data: res} = await getDayAlarmByAreaDetails(params).catch(() => ({data: undefined}));

	if (is_validate && res?.type === 1) {
		const {count, data} = res.result;
		paginator.value.total = count[active_tab_column_map[active_tab.value]];
		tabs_data.value = {
			all: count[active_tab_column_map["all"]],
			[ALARM_CATEGORY.sos]: count[active_tab_column_map[ALARM_CATEGORY.sos]],
			[ALARM_CATEGORY.tag]: count[active_tab_column_map[ALARM_CATEGORY.tag]],
			[ALARM_CATEGORY.area]: count[active_tab_column_map[ALARM_CATEGORY.area]],
			[ALARM_CATEGORY.device]: count[active_tab_column_map[ALARM_CATEGORY.device]],
			[ALARM_CATEGORY.accident]: count[active_tab_column_map[ALARM_CATEGORY.accident]],
			[ALARM_CATEGORY.healthy]: count[active_tab_column_map[ALARM_CATEGORY.healthy]],
			[ALARM_CATEGORY.call]: count[active_tab_column_map[ALARM_CATEGORY.call]],
		};
		if (paginator.value.total !== 0 && Math.ceil(paginator.value.total / paginator.value.limit) < paginator.value.page) {
			paginator.value.page = paginator.value.page - 1;
			return fetchTableData();
		}
		table_data.value = data.map((row) => transformData(row));
	}

	endLoading();
});

const {resume} = useTimeoutPoll(fetchTableData, poll_interval, {immediate: false});
const {loading, startLoading, endLoading} = useLoading();
const detail_dialog_store = useDetailDialogStore();

watch(() => dialog_props.value.default_tab, () => {
	active_tab.value = dialog_props.value.default_tab ?? tabs.value[0].key;
}, {immediate: true});

onMounted(() => {
	startLoading();
	resume();
});

async function immediatelyFetch() {
	startLoading();
	await fetchTableData();
}

function handleTabClick() {
	paginator.value.page = 1;
	paginator.value.total = 0;
	immediatelyFetch();
}
</script>

<style scoped>
.multiple-alarm-content {
	.sub-title {
		border: 1px solid #32496a;
		border-radius: 4px;
		background-color: rgba(86, 98, 122, 0.21);
		padding: 4px 6px;
		color: var(--text-minor-1);
		font-size: 12px;
	}

	:deep(.fk-index-table) {
		position: absolute;
	}
}
</style>
