<template>
<!-- @vue-ignore -->
<base-dialog
	v-bind="$attrs"
	:show-footer="true"
	width="1094px"
	min-height="770"
	title="选择点名计划"
	v-on="$listeners"
	@open="startLoading()"
	@opened="handleOpened"
	@negative-click="emits('input', false)"
	@positive-click="handlePositiveClick"
>
	<div class="plans-dialog-body">
		<div class="plans-header">
			<el-form
				class="fk-filter-form"
				inline
				size="small"
				:model="form"
			>
				<el-form-item label="点名计划名称">
					<el-input
						v-model="form.input_value"
						placeholder="请输入搜索内容"
						clearable
						@input="debounceInput"
					>
						<template #prefix>
							<i
								class="el-input__icon el-icon-search"
							/>
						</template>
					</el-input>
				</el-form-item>
			</el-form>
			<el-button
				v-if="auth.handle"
				type="primary"
				icon="el-icon-plus"
				size="small"
				@click="openAnchorDialog()"
			>
				新增点名计划
			</el-button>
		</div>
		<call-plans-table
			ref="table_ref"
			class="plans-table"
			:loading="loading"
			:data="table_data"
			:show-pagination="false"
			@selection-change="handleSelectionChange"
			@open-anchor-dialog="openAnchorDialog"
			@open-area-dialog="openAreaDialog"
			@open-archive-dialog="openArchiveDialog"
		/>
	</div>
</base-dialog>
</template>

<script lang="ts">
export default {
	inheritAttrs: false
};
</script>
<script setup lang="ts">
import {shallowRef, ref, nextTick} from "vue";
import {debounce} from "lodash-es";
import {Notification} from "element-ui";

import BaseDialog from "@/components/Dialog/BaseDialog.vue";
import {useLoading} from "@/composable/useLoading";
import {usePageAuth} from "@/utils/js/authentication";
import {DEBOUNCE_INPUT_WAIT} from "@/utils/js/constant";
import type {RollCallRuleParams, RollCallRuleRow} from "@/api/rollCall/rollCallRule";
import {getRollCallRule} from "@/api/rollCall/rollCallRule";

import CallPlansTable from "@/views/call/components/CallPlansTable.vue";

const emits = defineEmits<{
	(event: "input", value: boolean): void,
	(event: "update:selectedList", value: RollCallRuleRow[]): void,
	(event: "open-archive-dialog", value: number): void,
	(event: "open-area-dialog", value: RollCallRuleRow["areas"][0]): void,
	(event: "open-anchor-dialog", value?: RollCallRuleRow): void
}>();

interface Props {
	selectedList: RollCallRuleRow[]
}
const props = defineProps<Props>();

const table_data = shallowRef<RollCallRuleRow[]>([]);
const table_data_map = new Map<number, RollCallRuleRow>();
const selected_data = shallowRef<RollCallRuleRow[]>([]);
const table_ref = ref<InstanceType<typeof CallPlansTable> | null>(null);

interface FormData {
	input_value: string
}
const form = ref<FormData>({input_value: ""});

const {loading, startLoading, endLoading} = useLoading();
const auth = usePageAuth();

const debounceInput = debounce(() => {
	fetchTableData();
}, DEBOUNCE_INPUT_WAIT);

function getDefaultFormData(): FormData {
	return {input_value: ""};
}

function handleSelectionChange(data: RollCallRuleRow[]) {
	selected_data.value = [...data];
}

async function handleOpened() {
	form.value = getDefaultFormData();
	table_data.value = [];
	table_data_map.clear();
	selected_data.value = [];
	fetchTableData();
}

function updateSelectedList() {
	const list = [...selected_data.value];
	emits("update:selectedList", list);
}

function handlePositiveClick() {
	Notification.success({title: "成功", message: "保存成功"});
	updateSelectedList();
	emits("input", false);
}

function getRequestData(form_data: FormData) {
	const {input_value} = form_data;
	const params = {} as RollCallRuleParams;
	if (input_value) {
		params.name = input_value;
	}
	return params;
}
async function fetchTableData() {
	startLoading();
	const params = getRequestData(form.value);
	const {data: res} = await getRollCallRule(params).catch(() => ({data: undefined}));
	endLoading();
	if (res?.type === 1) {
		table_data.value = [];
		table_data_map.clear();
		res.result.data.forEach((row) => {
			table_data.value.push(row);
			table_data_map.set(row.id, row);
		});
		nextTick(() => {
			selected_data.value = [];
			props.selectedList.forEach((row) => {
				const selected_row = table_data_map.get(row.id);
				if (selected_row) {
					if (table_ref.value) {
						table_ref.value.getTableRef().toggleRowSelection(selected_row, true);
					} else {
						selected_data.value.push(selected_row);
					}
				}
				selected_row && table_ref.value?.getTableRef()?.toggleRowSelection(selected_row, true);
			});
		});
	} else {
		table_data.value = [];
		table_data_map.clear();
		Notification.error({title: "错误", message: res?.result as unknown as string || "查询失败"});
	}
}

function openAnchorDialog(row?: RollCallRuleRow) {
	emits("open-anchor-dialog", row);
}
function openAreaDialog(area_item: RollCallRuleRow["areas"][0]) {
	emits("open-area-dialog", area_item);
}
function openArchiveDialog(uuid: number) {
	emits("open-archive-dialog", uuid);
}

async function refreshTable() {
	await fetchTableData();
	updateSelectedList();
}

defineExpose({
	refreshTable
});
</script>

<style lang="scss" scoped>
:deep(.base-dialog .content-body) {
	display: flex;
}

.plans-dialog-body {
	width: 100%;
	padding: 16px;
	display: flex;
	flex-direction: column;
	row-gap: 12px;

	.plans-header {
		flex: 0 0 auto;
	}

	.plans-table {
		flex: 1 1 100%;
	}
}
</style>
