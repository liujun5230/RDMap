<template>
<el-table
	class="fk-index-table"
	:class="{small}"
	height="100%"
	:data="props.data"
	stripe
	border
>
	<fk-table-column
		v-for="col in props.columns"
		:key="col.label"
		:label="col.label"
		:prop="col.prop"
		:min-width="col.min_width"
		:show-overflow-tooltip="false"
		:header-tip="formateColHeaderTip(col)"
		:important-header-tip="formateColImportantHeaderTip(col)"
	>
		<template #default="{row}">
			<text-ellipsis
				v-if="col.prop === 'areas'"
				style="width: 100%;"
			>
				<span
					v-for="(item) in (row[col.prop] || [])"
					:key="item.area_id"
					class="name-split"
					:class="{link: item.type !== AreaType.UP_DOWN_PIT_FIRST && item.type !== AreaType.UP_DOWN_PIT_SECOND}"
					@click="openAreaDetailDialog(row, item)"
				>
					{{ item.area_name }}
				</span>
				<span v-if="!row[col.prop]?.length">--</span>
			</text-ellipsis>
			<text-ellipsis
				v-else-if="single_detail_dialog_cols.includes(col.prop)"
				style="width: 100%;"
				:class="{link: formatCellValue(row, col) !== '--'}"
				@click="openSingleDetailDialog(row, col)"
			>
				{{ formatCellValue(row, col) }}
			</text-ellipsis>
			<text-ellipsis
				v-else-if="multiple_detail_dialog_cols.includes(col.prop)"
				style="width: 100%;"
				:class="{link: formatCellValue(row, col) !== '--'}"
				@click="openMultipleDetailDialog(row, col)"
			>
				{{ formatCellValue(row, col) }}
			</text-ellipsis>
			<text-ellipsis
				v-else
				style="width: 100%;"
			>
				{{ formatCellValue(row, col) }}
			</text-ellipsis>
		</template>
	</fk-table-column>
	<template #empty>
		<empty-placeholder />
	</template>
</el-table>
</template>

<script setup lang="ts">
import type {Table as ElTable} from "element-ui";

import type {PositionObjMultiDetailBaseResult, PositionObjMultiDetailResult} from "@/api/homepage/detail";
import {formatNull} from "@/utils/js/tools/table";
import {small} from "@/utils/ts/breakpoints";
import TextEllipsis from "@/components/TextEllipsis.vue";
import FkTableColumn from "@/components/ForThink/Table/FkTableColumn.vue";
import {AreaType} from "@/types/global";

import EmptyPlaceholder from "@index/components/EmptyPlaceholder.vue";

type AllRow = Omit<PositionObjMultiDetailResult["all"]["data"]["0"], keyof PositionObjMultiDetailBaseResult>;
type PersonRow = Omit<PositionObjMultiDetailResult["person"]["data"]["0"], keyof PositionObjMultiDetailBaseResult>;
type VisitorRow = Omit<PositionObjMultiDetailResult["visitor"]["data"]["0"], keyof PositionObjMultiDetailBaseResult>;
type ContractorRow = Omit<PositionObjMultiDetailResult["contractor"]["data"]["0"], keyof PositionObjMultiDetailBaseResult>;
type TruckRow = Omit<PositionObjMultiDetailResult["truck"]["data"]["0"], keyof PositionObjMultiDetailBaseResult>;
type MaterialRow = Omit<PositionObjMultiDetailResult["material"]["data"]["0"], keyof PositionObjMultiDetailBaseResult>;

type Row = PositionObjMultiDetailBaseResult & Partial<AllRow> & Partial<PersonRow> & Partial<VisitorRow> & Partial<ContractorRow> & Partial<TruckRow> & Partial<MaterialRow>;
export interface Props {
	data: Row[],
	columns: any
}

const props = defineProps<Props>();

export interface MultipleDetailEmitParams {
	row: Row,
	col: any
}
export interface SingleDetailEmitParams {
	row: Row
}
export interface AreaDetailEmitParams {
	row: Row,
	area_item: Row["areas"]["0"]
}
const emits = defineEmits<{
	(event: "multiple-detail", value: MultipleDetailEmitParams): void,
	(event: "single-detail", value: SingleDetailEmitParams): void,
	(event: "area-detail", value: AreaDetailEmitParams): void
}>();

// 打开单详情弹窗的列名
const single_detail_dialog_cols = ["name", "licence", "serial_num"];
// 打开多详情弹窗的列名
const multiple_detail_dialog_cols = ["branch_name", "company", "unit_name", "type_name"];

function formateColHeaderTip(col: any) {
	return col?.header_tip?.() ?? col.header_tip;
}

function formateColImportantHeaderTip(col: any) {
	return col?.important_header_tip?.() ?? col.important_header_tip;
}

function formatCellValue(row: Row, col: any) {
	const origin_val = row[col.prop as unknown as keyof Row];
	const val = typeof col.formatter === "function" ? col.formatter(origin_val, col, row) : origin_val;
	return formatNull(row, col, val);
}

function openAreaDetailDialog(row: Row, area_item: Row["areas"]["0"]) {
	if (area_item.type === AreaType.UP_DOWN_PIT_FIRST || area_item.type === AreaType.UP_DOWN_PIT_SECOND) return;
	emits("area-detail", {row, area_item});
}

function openSingleDetailDialog(row: Row, col: any) {
	if (formatCellValue(row, col) === "--") return;
	emits("single-detail", {row});
}

function openMultipleDetailDialog(row: Row, col: any) {
	if (formatCellValue(row, col) === "--") return;
	emits("multiple-detail", {row, col});
}
</script>
