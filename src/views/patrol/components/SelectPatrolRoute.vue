<template>
<base-dialog
	v-model="is_show"
	:show-footer="true"
	width="900px"
	:min-height="812"
	title="选择巡检路线"
	destroy-on-close
	@negative-click="closeDialog"
	@positive-click="clickSave"
>
	<template #operate>
		<el-tooltip
			content="刷新"
			placement="top"
		>
			<span
				class="refresh-icon"
				@click="handleRefresh"
			>
				<refresh-icon />
			</span>
		</el-tooltip>
	</template>
	<div class="container">
		<fk-form
			:use-cache="false"
			:show-fold-button="false"
		>
			<el-form-item label="巡检路线">
				<el-input
					v-model="route_name"
					placeholder="请输入搜索内容"
					@input="getTableDataDebounce"
				>
					<i
						slot="prefix"
						class="el-input__icon el-icon-search"
					/>
				</el-input>
			</el-form-item>
		</fk-form>
		<fk-table
			v-loading="loading"
			:data="table_data"
			height="calc(100% - 48px)"
		>
			<el-table-column
				width="40"
				class-name="radio-column"
			>
				<template #default="{row}">
					<el-radio
						v-model="selected_id"
						:label="row.id"
					/>
				</template>
			</el-table-column>
			<el-table-column
				label="巡检路线"
				prop="name"
				show-overflow-tooltip
			>
				<template #default="{row}">
					<span
						class="clickable-text"
						@click="openRouteDrawer(row.id)"
					>
						{{ row.name }}
					</span>
				</template>
			</el-table-column>
			<el-table-column
				prop="point_list"
				label="包含巡检点"
				show-overflow-tooltip
			>
				<template #default="{row}">
					<span
						v-for="(point, index) in row.point_list"
						:key="point.id"
					>
						<span
							class="clickable-text"
							@click="openPointDrawer(point.id)"
						>
							{{ point.name }}
						</span>
						{{ index === row.point_list.length - 1 ? "" : "、" }}
					</span>
				</template>
			</el-table-column>
			<el-table-column
				prop="is_ordered"
				label="是否顺序巡检"
				show-overflow-tooltip
				:formatter="formatOrder"
				width="104"
			/>
		</fk-table>
	</div>
	<template #footer>
		<label-button
			class="add-button"
			size="medium"
			@click="handleAddRoute"
		>
			新增巡检路线
		</label-button>
		<div>
			<el-button
				@click="closeDialog"
			>
				取消
			</el-button>
			<el-button
				type="primary"
				@click="clickSave"
			>
				保存
			</el-button>
		</div>
	</template>
</base-dialog>
</template>

<script setup lang="ts">
import {ref} from "vue";
import BaseDialog from "@/components/Dialog/BaseDialog.vue";
import FkForm from "@/components/ForThink/Form/FkForm.vue";
import FkTable from "@/components/ForThink/Table/FkTable.vue";
import {getPatrolRoute} from "@/api/patrol/route";
import {debounce} from "lodash-es";
import {useEventBus} from "@vueuse/core";
import {CLOSE_DRAWER_KEY, OPEN_POINT_DRAWER_KEY, OPEN_ROUTE_DRAWER_KEY} from "@/views/patrol/static/keys";
import RefreshIcon from "~icons/operation/refresh";
import LabelButton from "@/components/Button/LabelButton.vue";

const {emit: openPointDrawer} = useEventBus(OPEN_POINT_DRAWER_KEY);
const {emit: openRouteDrawer} = useEventBus(OPEN_ROUTE_DRAWER_KEY);
const {on: onDrawerClose} = useEventBus(CLOSE_DRAWER_KEY);
const is_show = ref(false);
const route_name = ref("");
const table_data = ref([]);
const loading = ref(false);
const selected_id = ref(0);

const closeDialog = () => {
	is_show.value = false;
};

const clickSave = () => {
	if (selected_id.value) {
		const row = table_data.value.find(it => selected_id.value === it.id);
		row && emits("select", row);
	}
	closeDialog();
};

function formatOrder(row: any, col: any, val: number) {
	return val ? "是" : "否";
}

const getTableDataDebounce = debounce(getTableData, 300);

onDrawerClose(getTableDataDebounce);

function getTableData() {
	loading.value = true;
	getPatrolRoute({name: route_name.value || undefined}).then(res => {
		const {type, result} = res.data;
		if (type === 1) {
			table_data.value = result;
			loading.value = false;
		}
	});
}

function openDialog() {
	route_name.value = "";
	is_show.value = true;
	selected_id.value = 0;
	getTableData();
}

function handleRefresh() {
	getTableData();
}

function handleAddRoute() {
	window.open("./patrol#/setting");
}

defineExpose({openDialog});
const emits = defineEmits(["select"]);
</script>

<style scoped>
:deep(.base-dialog .operate-wrap .refresh-icon) {
	display: flex;
	align-items: center;
	cursor: pointer;
}

:deep(.base-dialog .content-body) {
	display: flex;
}

.add-button {
	position: absolute;
	top: 12px;
	left: 16px;
	height: 32px;
}

.container {
	width: 100%;
	padding: 16px;

	:deep(.radio-column.el-table__cell) {
		text-align: center;
		.el-radio__label {
			width: 0;
			padding: 0;
			overflow: hidden;
		}
	}
}
</style>
