<template>
<div class="call-plans-table-component">
	<fk-table
		ref="table_ref"
		v-bind="$attrs"
		v-loading="props.loading"
		class="fk-selection-index"
		:data="props.data"
		v-on="$listeners"
		@selection-change="handleSelectChange"
	>
		<el-table-column
			type="selection"
			width="22"
			fixed
		/>
		<el-table-column
			type="index"
			label="序号"
			width="45"
			fixed
		/>
		<el-table-column
			prop="name"
			label="点名计划名称"
		>
			<template #default="{row, column}">
				<text-ellipsis
					style="width: 100%;"
					class="clickable-text"
					@click="openAnchorDialog(row)"
				>
					{{ row[column.property] }}
				</text-ellipsis>
			</template>
		</el-table-column>
		<el-table-column
			prop="areas"
			label="点名区域"
		>
			<template #default="{row, column}">
				<span v-if="!(row[column.property] || []).length">--</span>
				<text-ellipsis
					v-else
					style="width: 100%"
				>
					<span
						v-for="(item) in (row[column.property] || [])"
						:key="item.id"
						class="clickable-text name-split"
						@click="openAreaDialog(item)"
					>
						{{ item.name }}
					</span>
				</text-ellipsis>
			</template>
		</el-table-column>
		<fk-tag-table-column
			prop="applicable_objects"
			label="点名对象"
			@click="openArchiveDialog"
		/>
		<el-table-column
			width="190"
			prop="effect_date"
			label="生效日期"
			show-overflow-tooltip
			:formatter="formatEffectDate()"
		/>
		<el-table-column
			prop="day_json"
			label="重复星期"
			show-overflow-tooltip
			:formatter="formatDayJson()"
		/>
		<el-table-column
			prop="roll_call_time_json"
			label="重复时刻"
			show-overflow-tooltip
			:formatter="formatTimeJson()"
		/>
		<el-table-column
			prop="offset_time"
			label="允许时差"
			show-overflow-tooltip
			:formatter="formatOffsetTime"
		/>
		<el-table-column
			width="88"
			prop="is_use"
			label="启用状态"
		>
			<template #default="{row, column}">
				<text-ellipsis style="width: 100%;">
					<span
						v-if="row[column.property] == 1"
						style="color: #5db92e;"
					>启用</span>
					<span
						v-else
						style="color: #f56c6c"
					>禁用</span>
				</text-ellipsis>
			</template>
		</el-table-column>
	</fk-table>

	<div
		v-if="showPagination"
		class="fk-pagination-bar"
	>
		<el-pagination
			:current-page="props.page"
			:page-size="props.limit"
			:page-sizes="[20, 50, 100, 200]"
			layout="total, sizes, prev, pager, next, jumper"
			:total="props.total"
			popper-class="fk-pagination-select"
			@size-change="handleSizeChange"
			@current-change="handleCurrentChange"
		/>
		<div
			v-show="selected_list.length"
			class="fk-selected-num"
			style="display: inline-block;vertical-align: bottom;"
		>
			{{ `已选择${selected_list.length}项` }}
		</div>
	</div>
</div>
</template>

<script lang="ts">
export default {
	inheritAttrs: false
};
</script>
<script setup lang="ts">
import {shallowRef, ref} from "vue";

import type {RollCallRuleRow} from "@/api/rollCall/rollCallRule";
import FkTable from "@/components/ForThink/Table/FkTable.vue";
import FkTagTableColumn from "@/components/ForThink/Table/FkTagTableColumn.vue";
import TextEllipsis from "@/components/TextEllipsis.vue";
import {formatNull} from "@/utils/js/tools/table";
import {formatDayJson, formatTimeJson, formatEffectDate} from "@/utils/js/formatter";

import {OFFSET_TIME_UNIT} from "@/views/call/components/callPlansDialog/types";

const emits = defineEmits<{
	(event: "limit-change", value: number): void,
	(event: "page-change", value: number): void,
	(event: "open-anchor-dialog", value: any): void,
	(event: "open-area-dialog", value: RollCallRuleRow["areas"][0]): void,
	(event: "open-archive-dialog", value: number): void,
}>();

interface Props {
	loading: boolean,
	data: RollCallRuleRow[],
	page?: number,
	limit?: number,
	total?: number
	showPagination?: boolean,
}
const props = withDefaults(defineProps<Props>(), {
	page: 1,
	limit: 20,
	total: 0,
	showPagination: true
});

const selected_list = shallowRef<Props["data"]>([]);
const table_ref = ref<InstanceType<typeof FkTable> | null>(null);

const unit_map = {
	[OFFSET_TIME_UNIT.second]: "秒",
	[OFFSET_TIME_UNIT.minute]: "分钟",
	[OFFSET_TIME_UNIT.hour]: "小时",
};
const second_map = {
	[OFFSET_TIME_UNIT.second]: 1,
	[OFFSET_TIME_UNIT.minute]: 60,
	[OFFSET_TIME_UNIT.hour]: 3600,
};
function formatOffsetTime(row: RollCallRuleRow, col: any, val: any) {
	const {offset_time, metering} = row;
	const value = formatNull(row, col, offset_time);
	if (value === "--") return value;
	return `${value / second_map[metering]}${unit_map[metering]}`;
}

function handleSelectChange(data: Props["data"]) {
	selected_list.value = data;
}

function handleSizeChange(limit: number) {
	emits("limit-change", limit);
}

function handleCurrentChange(page: number) {
	emits("page-change", page);
}

function openAnchorDialog(row: RollCallRuleRow) {
	emits("open-anchor-dialog", row);
}

function openAreaDialog(area_item: RollCallRuleRow["areas"][0]) {
	emits("open-area-dialog", area_item);
}

function openArchiveDialog(uuid: number) {
	emits("open-archive-dialog", uuid);
}

function getTableRef() {
	return table_ref.value!;
}

defineExpose({
	getTableRef
});
</script>

<style lang="scss" scoped>
.call-plans-table-component {
    height: 0;
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
}
</style>
