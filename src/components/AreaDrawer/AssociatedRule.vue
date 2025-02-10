<template>
<base-dialog
	v-model="visible"
	title="选择规则"
	v-bind="$attrs"
	:show-close="true"
	:close-on-click-modal="false"
	width="1062px"
	append-to-body
	min-height="776px"
	show-footer
	class="associated-rule-dialog"
	v-on="$listeners"
>
	<alarm-rule-dialog
		:id="rule_id"
		v-model="show_rule_dialog"
		:mode.sync="dialog_mode"
		@save-success="fetchTable"
	/>

	<area-drawer
		ref="area_drawer"
		@refresh="fetchTable"
	/>

	<archive-dialog ref="archive_dialog" />

	<div>
		<el-form
			:inline="true"
			class="demo-form-inline fk-filter-form"
			size="small"
		>
			<el-form-item label="规则类型">
				<el-select v-model="rule_type">
					<el-option
						:value="0"
						label="全部"
					/>
					<el-option
						v-for="item in rule_types"
						:key="item.id"
						:label=" item.alias ?? item.name"
						:value="item.id"
					/>
				</el-select>
			</el-form-item>
			<!-- 规则分组 -->
			<el-form-item label="规则分组">
				<el-select
					v-model="rule_group"
				>
					<el-option
						v-for="item in rule_group_options"
						:key="item.id"
						:label="item.name"
						:value="item.id"
					/>
				</el-select>
			</el-form-item>
			<el-form-item label="规则名称">
				<el-input
					v-model="rule_name"
					placeholder="请输入规则名称"
				>
					<i
						slot="prefix"
						class="el-input__icon el-icon-search input-icon-search"
					/>
				</el-input>
			</el-form-item>

			<el-form-item>
				<el-button
					type="primary"
					@click="fetchTable"
				>
					查询
				</el-button>
				<fk-reset-button
					plain
					type="primary"
					@click="reset"
				>
					重置
				</fk-reset-button>
			</el-form-item>
		</el-form>
	</div>

	<div class="add-btn">
		<el-button
			type="primary"
			@click="openAddDialog"
		>
			新增规则
		</el-button>
	</div>

	<fk-table
		ref="rule_table"
		v-loading="loading"
		:data="table_data"
		row-key="id"
		@selection-change="handleSelectionChange"
	>
		<el-table-column
			type="selection"
			:reserve-selection="true"
			width="31"
			:selectable="getSelectable"
		/>
		<fk-table-column
			prop="name"
			label="规则名称"
			show-overflow-tooltip
			clickable
			@click="openViewDialog"
		/>

		<el-table-column
			prop="type"
			label="规则类型"
			show-overflow-tip
			:formatter="(row, col, val) =>formatRuleType(val, rule_types)"
		/>

		<!-- 适用地图范围 -->
		<apply-map-table-column
			width="150"
			prop="areas"
			label="适用地图范围"
			show-overflow-tooltip
			@click="openAreaDrawer"
		/>

		<!-- 适用对象 -->
		<apply-object-table-column
			prop="applicable_objects"
			label="适用对象"
			show-overflow-tooltip
			@click="openArchiveDialog"
		/>

		<!-- 所属分组 -->
		<!-- TODO -->
		<el-table-column
			prop="rule_group"
			label="所属分组"
			show-overflow-tooltip
			:formatter="formatNull"
		/>

		<!-- 生效日期 -->
		<el-table-column
			prop="start_time"
			label="生效日期"
			show-overflow-tooltip
			:formatter="formatEffectDate()"
		/>

		<!-- 重复星期 -->
		<el-table-column
			prop="day_json"
			label="重复星期"
			show-overflow-tooltip
			:formatter="formatDayJson()"
		/>

		<!-- 重复时间 -->
		<el-table-column
			prop="time_json"
			label="重复时间"
			show-overflow-tooltip
			:formatter="formatTimeJson()"
		/>

		<!-- 启用状态 is_use -->
		<el-table-column
			prop="is_use"
			label="启用状态"
			show-overflow-tooltip
		>
			<template #default="{row}">
				<span :class="{active: row.is_use, passive: !row.is_use}">
					{{ row.is_use ? "启用" : "禁用" }}
				</span>
			</template>
		</el-table-column>
	</fk-table>
	<template #footer>
		<span>
			<el-button
				plain
				size="small"
				@click="handleCancel"
			>取消</el-button>
			<el-button
				size="small"
				type="primary"
				@click="handleSave"
			>保存</el-button>
		</span>
	</template>
</base-dialog>
</template>

<script setup lang="ts">
import {Notification} from "element-ui";
import {ref, shallowRef, watch, inject} from "vue";

import {formatDayJson, formatTimeJson, formatEffectDate} from "@/utils/js/formatter";
import {formatNull} from "@/utils/js/tools/table";
import {getAlarmRule, type AlarmRuleData} from "@/api/area/alarmRule";
import {getAlarmRuleGroup} from "@/api/area/alarmRuleGroup";
import {useVModel} from "@vueuse/core";
import ApplyMapTableColumn, {type AreaItem} from "../ForThink/Table/ApplyMapTableColumn.vue";
import ApplyObjectTableColumn from "@/views/gpsManage/rule/components/ApplyObjectTableColumn.vue";
import AlarmRuleDialog from "@/components/Rule/alarmRuleDialog/AlarmRuleDialog.vue";
import ArchiveDialog from "@/components/ArchiveDialog/ArchiveDialog.vue";
import AreaDrawer from "@/components/AreaDrawer/AreaDrawer.vue";
import FkTable from "@/components/ForThink/Table/FkTable.vue";

import FkResetButton from "../ForThink/Button/FkResetButton.vue";
import FkTableColumn from "../ForThink/Table/FkTableColumn.vue";
import BaseDialog from "../Dialog/BaseDialog.vue";
import {DIALOG_MODE} from "../Dialog/constant";
import {fetchRuleType} from "./fetchData";
import {RULE_AUTH_KEY, RULE_TYPE_KEY} from "./keys";
import {formatRuleType} from "./utils";

import "@/utils/css/customThemes/variables.css";

const rule_types = inject(RULE_TYPE_KEY, ref([]));
/**
 * TODO
 * 1. 添加新增规则组件
 * 2. 添加规则档案组件
 * 3. 区域列添加区域档案
 * 4. 员工添加员工档案
 */
const rule_table = ref<InstanceType<typeof FkTable>>();
const rule_name = ref("");
const rule_type = ref(0);
const rule_group = ref(0);
type RuleGroup = { id: number; name: string };
const rule_group_options = ref<RuleGroup[]>([{id: 0, name: "全部"}]);
const type_select_data = ref([{value: "", label: "全部"}]);
const selection = ref<TableRow[]>([]);
const loading = ref(false);

type Props = {
	ruleData: number[]
	value: boolean
}

const props = defineProps<Props>();

const emits = defineEmits(["input", "save"]);

const visible = useVModel(props, undefined, emits);

export type TableRow = AlarmRuleData

const table_data = shallowRef<TableRow[]>([]);

async function fetchTable() {
	const filterEmpty = (val: string | number) => val ? val : undefined;
	const params = {
		name: filterEmpty(rule_name.value) as string,
		type: rule_type.value ? +rule_type.value : undefined,
		group_id: filterEmpty(rule_group.value) as number,
	};

	try {
		loading.value = true;
		const resp = await getAlarmRule(params);
		if (resp.data.type === 1) {
			table_data.value = resp.data.result.data;
		} else {
			Notification.error({
				title: "错误",
				message: resp.data.result as any as string,
			});
		}
	} finally {
		loading.value = false;
	}
}

function handleSelectionChange(selected: TableRow[]) {
	selection.value = selected;
}

function toggleSelection(rows?: TableRow[]) {
	if (rows) {
		for (const row of rows) {
			rule_table.value?.toggleRowSelection(row);
		}
	} else {
		rule_table.value?.clearSelection();
	}
}

function handleSave() {
	emits("save", selection.value);
}

function handleCancel() {
	visible.value = false;
}

function reset() {
	rule_name.value = "";
	rule_type.value = 0;
	rule_group.value = 0;

	fetchTable();
}

async function fetchRuleGroupOptions() {
	const resp = await getAlarmRuleGroup({});
	if (resp.data.type === 1) {
		rule_group_options.value = resp.data.result.data;
	}
}

watch(visible, async () => {
	if (visible.value) {
		fetchRuleGroupOptions();
		const rule_type_data = await fetchRuleType("area");
		type_select_data.value.push(...rule_type_data);

		await fetchTable();

		const selected_row = table_data.value.filter((item) => props.ruleData.includes(item.id));
		toggleSelection(selected_row);
	} else {
		toggleSelection();
		// 重置筛选条件
		rule_type.value = 0;
		rule_group.value = 0;
		rule_name.value = "";
	}
});

// 打开弹窗
const dialog_mode = ref<DIALOG_MODE>(DIALOG_MODE.add);
const show_rule_dialog = ref(false);

function openAddDialog() {
	show_rule_dialog.value = true;
	dialog_mode.value = DIALOG_MODE.add;
}

const rule_id = ref<number>();

const auth = inject(RULE_AUTH_KEY, ref({
	handle: false,
	check: false,
	all: false,
	delete: false,
}));
function openViewDialog(row: TableRow) {
	if (!auth.value.check) {
		Notification({
			type: "error",
			title: "错误",
			message: "无权限查看",
		});
		return;
	}
	rule_id.value = row.id;
	show_rule_dialog.value = true;
	dialog_mode.value = DIALOG_MODE.view;
}

// 打开区域档案
const area_drawer = ref<InstanceType<typeof AreaDrawer>>();
function openAreaDrawer(row: AreaItem) {
	area_drawer.value?.openDrawer({
		type: row.type,
		from: "table",
		id: row.area_id,
	});
}

const archive_dialog = ref<InstanceType<typeof ArchiveDialog>>();
function openArchiveDialog(data: {uuid?: number, card_id?: number}) {
	archive_dialog.value!.openArchiveDialog(data);
}

function getSelectable(row: AlarmRuleData) {
	if (row.id === 17 || row.id === 16)
		return false;
	return !row?.is_all_map;
}
</script>

<style scoped>
.associated-rule-dialog :deep(.el-dialog__body .content-body) {
  --body-padding: 16px;
	display: flex;
	flex-direction: column;
}

.input-icon-search {
  color: var(--theme-color);
}
.active {
	color: var(--table-active-text, #67C23A);
}

.passive {
	color: var(--table-disabled-text, #F56C6C);
}

.add-btn {
	margin-block-end: 10px;
}
</style>
