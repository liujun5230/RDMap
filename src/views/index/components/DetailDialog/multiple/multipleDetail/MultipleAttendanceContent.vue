<template>
<div class="h-[0] flex flex-col flex-1 gap-y-[12px]">
	<multiple-detail-tabs
		v-model="active_tab"
		class="flex-none"
		:tabs="tabs"
		:data="tabs_data"
		@tab-click="handleTabClick"
	/>
	<div
		v-if="loading"
		class="h-full flex-1 relative"
	>
		<detail-box-loading />
	</div>
	<el-table
		v-else
		row-key="id"
		class="fk-index-table"
		:class="{small}"
		height="100%"
		:data="table_data"
		stripe
		border
	>
		<el-table-column
			prop="name"
			label="姓名"
			show-overflow-tooltip
		>
			<template #default="{row}">
				<span
					class="link"
					@click="openDetail(row.uuid)"
				>
					{{ row.name }}
				</span>
			</template>
		</el-table-column>
		<el-table-column
			prop="branch_name"
			label="部门"
			show-overflow-tooltip
		/>
		<el-table-column
			prop="frequent_name"
			label="班次"
			show-overflow-tooltip
		/>
		<el-table-column
			prop="status"
			label="下班状态"
			show-overflow-tooltip
			:formatter="formatStatus"
		/>
		<el-table-column
			prop="work_time"
			label="工作时间"
			show-overflow-tooltip
			min-width="160"
			:formatter="formatWorkTime"
		/>
		<template #empty>
			<empty-placeholder />
		</template>
	</el-table>

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
import {computed, ref, shallowRef, watch, onMounted} from "vue";
import {getAttendanceClassDetail} from "@/api/homepage/pageInformation";
import type {AttendanceClassDetailRow} from "@/api/homepage/pageInformation";
import {small} from "@/utils/ts/breakpoints";
import {cleanupExpiredEffect} from "@/utils/js/common";
import {useLoading} from "@/composable";
import {person_divide_type_map} from "@index/components/DetailDialog/constant";
import {DetailDialogCategoryEnum, PositionObjTypeEnum} from "@index/store";
import type {SingleDetailPositionObjProps, MultipleDetailAttendanceClassCategory, MultipleDetailAttendanceClassProps} from "@index/store";
import {useDetailDialogStore} from "@index/store/useDetailDialogStore";
import {ModuleNameEnum} from "@index/container/modules/constant";
import {useTimeoutPoll} from "@vueuse/core";
import {poll_interval} from "@index/utils/config";
import EmptyPlaceholder from "@index/components/EmptyPlaceholder.vue";
import MultipleDetailTabs from "@index/components/DetailDialog/components/MultipleDetailTabs.vue";
import DetailBoxLoading from "@index/components/DetailDialog/components/DetailBoxLoading.vue";
import PaginationSimple from "@index/components/DetailDialog/components/PaginationSimple.vue";
import {PAGINATOR_LIMIT} from "@index/components/DetailDialog/constant";

const props = defineProps<{ category: MultipleDetailAttendanceClassCategory }>();

const {loading, startLoading, endLoading} = useLoading();
const detail_dialog_store = useDetailDialogStore();
const dialog = computed(() => detail_dialog_store.getDialog(props.category));
const dialog_props = computed(() => dialog.value.props as MultipleDetailAttendanceClassProps);

const active_tab_status_param = {
	actual_num: undefined,
	not_off_duty_num: 1,
	off_duty_num: 2
} as const;

type ActiveTabKey = "actual_num" | "not_off_duty_num" | "off_duty_num";
const tabs = [
	{label: "实到", key: "actual_num"},
	{label: "未下班", key: "not_off_duty_num"},
	{label: "已下班", key: "off_duty_num"},
];
const active_tab = ref<ActiveTabKey>("actual_num");
const tabs_data = ref({actual_num: 0, not_off_duty_num: 0, off_duty_num: 0});
const paginator = ref({page: 1, total: 0, limit: PAGINATOR_LIMIT});

const WORK_STATUS = {
	1: "未下班",
	2: "已下班"
};
const KEY_MAP: Record<string, string> = {
	[DetailDialogCategoryEnum.BRANCH]: "branch_id",
	[DetailDialogCategoryEnum.WORK_TYPE]: "work_id",
	[DetailDialogCategoryEnum.DUTY]: "duty_id",
	[DetailDialogCategoryEnum.PERSON_CLASSIFY]: "class_id",
};
const table_data = shallowRef<AttendanceClassDetailRow[]>();

const getData = cleanupExpiredEffect(async (onCleanup: (cb: () => void) => void) => {
	let is_validate = true;
	onCleanup(() => {
		is_validate = false;
	});
	let val;
	const {branch_id, work_id, duty_id, class_id, frequent_id} = dialog_props.value;
	switch (props.category) {
	case DetailDialogCategoryEnum.BRANCH:
		val = branch_id;
		break;
	case DetailDialogCategoryEnum.WORK_TYPE:
		val = work_id;
		break;
	case DetailDialogCategoryEnum.DUTY:
		val = duty_id;
		break;
	case DetailDialogCategoryEnum.PERSON_CLASSIFY:
		val = class_id;
		break;
	}
	const {data: res} = await getAttendanceClassDetail({
		flag: person_divide_type_map[props.category],
		frequent_id: frequent_id || undefined,
		status: active_tab_status_param[active_tab.value],
		[KEY_MAP[props.category]]: val
	}).catch(() => ({data: undefined}));
	if (is_validate && res?.type === 1) {
		const {actual_num, not_off_duty_num, off_duty_num, data} = res.result;
		tabs_data.value.actual_num = actual_num;
		tabs_data.value.not_off_duty_num = not_off_duty_num;
		tabs_data.value.off_duty_num = off_duty_num;
		paginator.value.total = res.result[active_tab.value];
		if (paginator.value.total !== 0 && Math.ceil(paginator.value.total / paginator.value.limit) < paginator.value.page) {
			paginator.value.page = paginator.value.page - 1;
			return getData();
		}
		table_data.value = data;
	}
	endLoading();
});

const {resume} = useTimeoutPoll(getData, poll_interval, {immediate: false});

const openDetail = (uuid: number) => {
	const detail_props: SingleDetailPositionObjProps = {
		from: ModuleNameEnum.ATTENDANCE_CLASSIFY,
		title: "员工",
		uuid: Number(uuid),
		utype: PositionObjTypeEnum.PERSON,
	};
	detail_dialog_store.setProps(DetailDialogCategoryEnum.POSITION_OBJECT, detail_props);
	detail_dialog_store.toggleVisible(DetailDialogCategoryEnum.POSITION_OBJECT, true);
};

watch(
	() => dialog_props.value.default_tab,
	(val) => {
		active_tab.value = val as ActiveTabKey;
	},
	{immediate: true}
);

onMounted(() => {
	startLoading();
	resume();
});

const formatStatus = (row: AttendanceClassDetailRow, col: any, val: 1 | 2) => {
	return WORK_STATUS[val];
};

const formatWorkTime = (row: AttendanceClassDetailRow) => {
	let str = "";
	if (row.start_time) {
		str += `上班${row.start_time}`;
	}
	str += "~";
	if (row.end_time) {
		str += `下班${row.end_time}`;
	}
	return str;
};

async function immediatelyFetch() {
	startLoading();
	await getData();
}

function handleTabClick() {
	paginator.value.page = 1;
	paginator.value.total = 0;
	immediatelyFetch();
}
</script>
