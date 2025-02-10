<template>
<div class="h-full flex flex-col gap-y-[12px] font-main">
	<module-header title="聚集对象">
		<template #operate>
			<div class="flex justify-between items-center">
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
		:tabs="tabs"
		:data="table_data_sum"
		@tab-click="handleTabClick"
	/>

	<div
		v-if="loading"
		class="h-full flex-1 relative"
	>
		<detail-box-loading />
	</div>

	<div class="h-[0] flex flex-col flex-1 gap-y-[12px]">
		<el-table
			v-show="!loading"
			row-key="id"
			class="fk-index-table"
			:class="{small}"
			height="100%"
			:data="table_data"
			stripe
			border
		>
			<!-- 序号 -->
			<el-table-column
				type="index"
				prop="index"
				label="序号"
				min-width="44"
			/>
			<el-table-column
				label="定位对象类型"
				prop="utype"
				:formatter="formatUtype"
				min-width="120"
				show-overflow-tooltip
			/>

			<el-table-column
				prop="name"
				min-width="100"
				show-overflow-tooltip
			>
				<template #header>
					<div class="flex gap-1 items-center ">
						<span>名称</span>
						<fk-icon
							class="text-minor-2 cursor-pointer"
							:tip="tips"
							:size="small ? 16 : 20"
						>
							<question-icon />
						</fk-icon>
					</div>
				</template>
				<template #default="{row}">
					<span
						class="link"
						@click="openDetail(row)"
					>
						{{ row.name || "--" }}
					</span>
				</template>
			</el-table-column>

			<!-- 相关信息 -->
			<el-table-column
				label="相关信息"
				prop="related_info"
				:formatter="emptyFormatter"
				show-overflow-tooltip
			/>

			<!-- 卡号 -->
			<el-table-column
				label="卡号"
				prop="card_id"
				:formatter="emptyFormatter"
				show-overflow-tooltip
			/>

			<!-- 聚集状态 -->
			<el-table-column
				label="聚集状态"
				prop="status"
				:formatter="statusFormatter"
				show-overflow-tooltip
			/>

			<!-- 聚集开始时间 -->
			<el-table-column
				label="聚集开始时间"
				prop="gather_begin"
				min-width="167"
				:formatter="timeFormatter"
				show-overflow-tooltip
			/>

			<!-- 聚集结束时间 -->
			<el-table-column
				label="聚集结束时间"
				prop="gather_end"
				:formatter="timeFormatter"
				min-width="167"
				show-overflow-tooltip
			/>
			<template #empty>
				<empty-placeholder />
			</template>
		</el-table>
	</div>

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
import {ref, computed, shallowRef, onMounted} from "vue";
import {DetailDialogCategoryEnum, useDetailDialogStore, type MultipleDetailGatherScopeProps} from "@/views/index/store";
import {getDateTimeStr} from "@/utils/js/tools/time";
import {getGatherObjectHomePage} from "@/api/alarm/alarm";
import {poll_interval} from "@index/utils/config";
import {small} from "@/utils/ts/breakpoints";
import {cleanupExpiredEffect} from "@/utils/js/common";
import {useLoading} from "@/composable";
import {type SingleDetailPositionObjProps,} from "@/views/index/store";
import {useTimeoutPoll} from "@vueuse/core";
import DetailBoxLoading from "@index/components/DetailDialog/components/DetailBoxLoading.vue";
import FkIcon from "@/components/ForThink/FkIcon.vue";
import ModuleHeader from "@index/components/ModuleHeader.vue";
import MultipleDetailTabs from "@index/components/DetailDialog/components/MultipleDetailTabs.vue";
import PaginationSimple from "@index/components/DetailDialog/components/PaginationSimple.vue";
import {PAGINATOR_LIMIT} from "@index/components/DetailDialog/constant";
import EmptyPlaceholder from "../../EmptyPlaceholder.vue";

import QuestionIcon from "~icons/operation/question";
import CloseIcon from "~icons/operation/stroke-close";
import {formatUtype} from "@/utils/js/formatter";
import {useNameTips} from "@/composable/hide";

const detail_dialog_store = useDetailDialogStore();
const dialog = computed(() => detail_dialog_store.getDialog(DetailDialogCategoryEnum.GATHER));
function closeDialog() {
	detail_dialog_store.toggleVisible(DetailDialogCategoryEnum.GATHER, false);
}
const tips = useNameTips();
type GatherAlarm = {
	// id
	id: number;
	// 定位对象类型1员工，3访客，2车辆，5物资
	utype: number;
	// 名称
	name: string;
	// 相关信息
	related_info: string;
	// 卡号
	card_id: string;
	// 聚集状态1聚集中，2已离散
	status: number;
	// 聚集开始时间
	gather_begin: string;
	// 聚集结束时间
	gather_end: string;

	uuid: number
};

const table_data = shallowRef<GatherAlarm[]>([]);
const enum GatherStatus {
	GATHERING = 0,
	DISPERSED = 1,
}

const active_tab_status_param = {
	all: undefined,
	gathering: 0,
	dispersed: 1
} as const;
const table_data_sum = ref({
	all: 0,
	gathering: 0,
	dispersed: 0
});
const paginator = ref({page: 1, total: 0, limit: PAGINATOR_LIMIT});

type ActiveTabKey = "all" | "gathering" | "dispersed";
const tabs = [
	{label: "全部", key: "all"},
	{label: "聚集中", key: "gathering"},
	{label: "已离散", key: "dispersed"},
] satisfies Array<{label: string; key: ActiveTabKey}>;
const active_tab = ref<ActiveTabKey>("gathering");

const {loading, startLoading, endLoading} = useLoading();

const fetchGatherTable = cleanupExpiredEffect(async (onCleanup: (cb: () => void) => void) => {
	let is_validate = true;
	onCleanup(() => {
		is_validate = false;
	});
	const params = (dialog.value.props as MultipleDetailGatherScopeProps)?.params;
	if (!params) {
		console.warn("[getGatherObjectHomePage]: 聚集参数无效", dialog.value.props);
		endLoading();
		return;
	}
	const {data: resp} = await getGatherObjectHomePage({
		status: active_tab_status_param[active_tab.value],
		page: paginator.value.page,
		limit: paginator.value.limit,
		merge_gather: params
	}).catch(() => ({data: undefined}));

	if (is_validate && resp?.type === 1) {
		const {all_count, gather_count, disperse_count, data} = resp.result;
		table_data_sum.value.all = all_count;
		table_data_sum.value.gathering = gather_count;
		table_data_sum.value.dispersed = disperse_count;
		paginator.value.total = resp.result[active_tab.value] || 0;
		if (paginator.value.total !== 0 && Math.ceil(paginator.value.total / paginator.value.limit) < paginator.value.page) {
			paginator.value.page = paginator.value.page - 1;
			return fetchGatherTable();
		}
		table_data.value = data;
	}

	endLoading();
});

// TODO 卡号需要可点击，打开详情框
const {resume} = useTimeoutPoll(fetchGatherTable, poll_interval, {immediate: false});

onMounted(() => {
	startLoading();
	resume();
});

// 聚集状态formatter
function statusFormatter(row: GatherAlarm) {
	switch (row.status) {
	case GatherStatus.GATHERING:
		return "聚集中";
	case GatherStatus.DISPERSED:
		return "已离散";
	default:
		return "未知";
	}
}

function emptyFormatter(row: unknown, col: unknown, val: unknown) {
	return val || "--";
}

const timeFormatter = (row: unknown, col: unknown, value: string) => {
	if (!value) {
		return "--";
	}
	const date_time = getDateTimeStr({time: +value * 1000, dateStr: "-", timeStr: ":"});
	return date_time.date + " " + date_time.time;
};

async function immediatelyFetch() {
	startLoading();
	await fetchGatherTable();
}

function handleTabClick() {
	paginator.value.page = 1;
	paginator.value.total = 0;
	immediatelyFetch();
}

function openDetail(row: GatherAlarm) {
	const detail_props: SingleDetailPositionObjProps = {
		title: "员工",
		uuid: +row.uuid,
		utype: +row.utype,
	};
	detail_dialog_store.setProps(DetailDialogCategoryEnum.POSITION_OBJECT, detail_props);
	detail_dialog_store.toggleVisible(DetailDialogCategoryEnum.POSITION_OBJECT, true);
}
</script>

<style scoped>
</style>
