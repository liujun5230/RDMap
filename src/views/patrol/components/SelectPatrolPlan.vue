<template>
<base-dialog
	v-model="is_show"
	:show-footer="true"
	width="900px"
	:min-height="812"
	title="选择巡检计划"
	@negative-click="closeDialog"
	@positive-click="clickSave"
	@opened="onDialogOpened"
>
	<div class="container">
		<fk-form
			:use-cache="false"
			:show-fold-button="false"
		>
			<el-form-item label="巡检计划名称">
				<el-input
					v-model="plan_name"
					placeholder="请输入搜索内容"
				>
					<i
						slot="prefix"
						class="el-input__icon el-icon-search"
					/>
				</el-input>
			</el-form-item>
			<el-form-item>
				<el-button
					size="small"
					type="primary"
					@click="clickSearch"
				>
					查询
				</el-button>
				<fk-reset-button
					plain
					size="small"
					type="primary"
					@click="resetSearch"
				>
					重置
				</fk-reset-button>
			</el-form-item>
		</fk-form>
		<div
			v-show="btn_handle_auth"
			class="add-btn"
		>
			<el-button
				type="primary"
				icon="el-icon-plus"
				size="small"
				@click="addPatrolPlan"
			>
				新增巡检计划
			</el-button>
		</div>
		<fk-table
			ref="table_ref"
			v-loading="loading"
			:data="table_data"
			row-key="id"
			@sort-change="handleSortChange"
			@selection-change="handleSelectedChange"
		>
			<el-table-column
				type="selection"
				width="31"
				reserve-selection
				fixed
			/>
			<el-table-column
				prop="name"
				label="巡检计划名称"
				sortable="custom"
				show-overflow-tooltip
				min-width="120"
			>
				<template #default="{row}">
					<span
						class="clickable-text"
						@click="openPatrolPlan(row.id)"
					>{{ row.name }}</span>
				</template>
			</el-table-column>
			<el-table-column
				prop="route_name"
				label="巡检路线"
				sortable="custom"
				show-overflow-tooltip
				min-width="100"
			>
				<template #default="{row}">
					<span
						class="clickable-text"
						@click="openPatrolRoute(row.route_id)"
					>
						{{ row.route_name }}
					</span>
				</template>
			</el-table-column>
			<el-table-column
				prop="branch_name"
				label="所属部门"
				min-width="100"
			>
				<template #header>
					所属部门
					<el-tooltip
						effect="dark"
						content="巡检统计页面将按此字段进行部门统计。"
						placement="top"
					>
						<i class="hg-icons hg-icon-tooltip-question question-icon" />
					</el-tooltip>
				</template>
			</el-table-column>
			<fk-tag-table-column
				prop="applicable_objects"
				label="允许巡检人"
				min-width="100"
				@click="showThingsArchive"
			>
				<template #header>
					允许巡检人
					<el-tooltip
						effect="dark"
						content="可以设置多人，仅允许其中任意一人执行并完成巡检任务。"
						placement="top"
					>
						<i class="hg-icons hg-icon-tooltip-question question-icon" />
					</el-tooltip>
				</template>
			</fk-tag-table-column>
			<el-table-column
				prop="start_time"
				label="生效日期"
				show-overflow-tooltip
				:formatter="formatDate"
				min-width="120"
			/>
			<el-table-column
				prop="day_json"
				label="重复星期"
				show-overflow-tooltip
				:formatter="formatDayJson"
			/>
			<el-table-column
				prop="time_json"
				label="重复时段"
				show-overflow-tooltip
				:formatter="formatTimeJson"
			/>
			<el-table-column
				prop="is_use"
				label="启用状态"
				show-overflow-tooltip
				sortable="custom"
				:formatter="formatStatus"
				min-width="100"
			>
				<template #default="{row}">
					<span :class="row.is_use ? 'success' : 'error'">{{ formatStatus(row, null, row.is_use) }}</span>
				</template>
			</el-table-column>
		</fk-table>
		<add-patrol-plan-dialog
			ref="add_patrol_plan_ref"
			@saved-success="getTableData"
		/>
		<archive-dialog ref="archive_dialog" />
		<area-drawer ref="area_drawer" />
	</div>
</base-dialog>
</template>

<script setup lang="ts">
import FkResetButton from "@/components/ForThink/Button/FkResetButton.vue";
import FkTable from "@/components/ForThink/Table/FkTable.vue";
import BaseDialog from "@/components/Dialog/BaseDialog.vue";
import AddPatrolPlanDialog from "./AddPatrolPlan.vue";
import FkForm from "@/components/ForThink/Form/FkForm.vue";
import {computed, ref} from "vue";
import {useAuthStore} from "@/store";
import {getPlan} from "@/api/patrol/plan";
import FkTagTableColumn from "@/components/ForThink/Table/FkTagTableColumn.vue";
import {getDateTimeStr, getFormatTimeString} from "@/utils/js/tools/time";
import {Notification} from "element-ui";
import type {ElTableColumn} from "element-ui/types/table-column";
import type {ApplicableObjects} from "@/types/alarm";
import ArchiveDialog from "@/components/ArchiveDialog/ArchiveDialog.vue";
import AreaDrawer from "@/components/AreaDrawer/AreaDrawer.vue";
import {AreaTypes} from "@/components/AreaDrawer/constant";

const emits = defineEmits(["save"]);
const is_show = ref(false);
const plan_name = ref("");
const table_data = ref<PlanInfo[]>([]);
const table_ref = ref();
const order = ref();
const field = ref();
const selected_list = ref<PlanInfo[]>([]);
const loading = ref(false);
const add_patrol_plan_ref = ref();
const ids = ref<number[]>([]);
const auth = useAuthStore();
const btn_handle_auth = computed(() => auth["/patrol#/setting"] === 2 || auth["/patrol#/setting"] === 4);
const archive_dialog = ref();
const area_drawer = ref();

type PlanInfo = {
	id: number
	name: string
	is_use: number
	day_json: string
	start_time: number
	end_time: number
	route_id: number
	route_is_delete: number
	route_name: string
	time_json: string
	applicable_objects: ApplicableObjects
}

function clickSave() {
	emits("save", selected_list.value);
	is_show.value = false;
}

async function getTableData(cb?: () => void) {
	loading.value = true;
	const req = {
		plan_name: plan_name.value || undefined,
		order: order.value,
		field: field.value
	};
	const res = await getPlan(req);
	if (res.data.type !== 1) {
		Notification.error({
			title: "错误",
			message: res.data.result
		});
		return;
	}
	const {data} = res.data.result;
	loading.value = false;
	table_data.value = data;
	cb instanceof Function && cb();
}

function onDialogOpened() {
	getTableData(toggleSelection);
}

function clickSearch() {
	getTableData();
}

function resetSearch() {
	plan_name.value = "";
	getTableData();
}

function addPatrolPlan() {
	add_patrol_plan_ref.value.openDialog();
}

function openDialog(id_list: number[]) {
	is_show.value = true;
	ids.value = id_list;
}

function closeDialog() {
	is_show.value = false;
}

function handleSelectedChange(selection: PlanInfo[]) {
	selected_list.value = selection;
}

function handleSortChange(column: {order: string, prop: string}) {
	const {prop, order: o} = column;
	if (prop) {
		if (o === "descending") {
			order.value = "DESC";
		} else if (o === "ascending") {
			order.value = "ASC";
		}
		field.value = prop;
	} else {
		order.value = undefined;
		field.value = undefined;
	}
	getTableData();
}

function toggleSelection() {
	table_ref.value.clearSelection();
	table_data.value.map(item => {
		if (ids.value.includes(item.id)) {
			table_ref.value.toggleRowSelection(item);
		}
	});
}

function openPatrolPlan(id: number) {
	add_patrol_plan_ref.value.openDialog(id);
}

function openPatrolRoute(id: number) {
	area_drawer.value.openDrawer({
		type: AreaTypes.PATROL_ROUTE,
		from: "table",
		title: "巡检路线设置",
		id
	});
}

function showThingsArchive(uuid: number) {
	if (uuid) {
		archive_dialog.value.openArchiveDialog({uuid});
	}
}

function formatStatus(row: PlanInfo, col: any, val: number) {
	return val ? "启用" : "禁用";
}

function formatTimeJson(row: PlanInfo, col: any, val: string) {
	if (!val) return "全部时段";
	const time = JSON.parse(val);
	return time.map(([start_time, end_time]: number[]) => `${getFormatTimeString(start_time)}至${getFormatTimeString(end_time)}`).join("、");
}

function formatDayJson(row: PlanInfo, col: any, val: string) {
	if (!val) return "全部星期";
	const day_format = ["一", "二", "三", "四", "五", "六", "日"];
	const day = JSON.parse(val).sort();
	return day.length ? "星期" + day.map((i: number) => day_format[i]).join("、") : "--";
}

function formatDate(row: PlanInfo) {
	if (!row.start_time || !row.end_time) return "全部日期";
	return `${getDateTimeStr({time: row.start_time * 1000, dateStr: "-"}).date}至${getDateTimeStr({time: row.end_time * 1000, dateStr: "-"}).date}`;
}

defineExpose({openDialog});
</script>

<style scoped>
.container {
	height: 100%;
	display: flex;
	flex-direction: column;
	padding: 16px;
	min-height: inherit;

	.fk-table {
		flex: 1;
		margin-top: 12px;
	}
}

.error {
	color: #F56C6C;
}

.success {
	color: #67C23A;
}
</style>
