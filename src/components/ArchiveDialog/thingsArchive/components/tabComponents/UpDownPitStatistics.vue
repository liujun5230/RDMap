<template>
<div class="pit-statistics">
	<div class="search-form">
		<fk-date-picker
			v-model="search_time"
			class="clear-date-icon"
			popper-class="pit-date-picker-popper"
			type="datetimerange"
			start-placeholder="开始时间"
			end-placeholder="结束时间"
			format="yyyy-MM-dd HH:mm"
			:default-time="['00:00:00', '23:59:59']"
			@change="getTableList"
		/>
		<el-select
			v-model="status"
			style="width:100px"
			size="small"
			@change="getTableList"
		>
			<el-option
				label="全部状态"
				value="all"
			/>
			<el-option
				label="正常"
				:value="1"
			/>
			<el-option
				label="可校准"
				:value="2"
			/>
		</el-select>
		<el-select
			v-model="current_enter_status"
			style="width:165px"
			size="small"
			@change="getTableList"
		>
			<el-option
				label="全部当次进出状态"
				value="all"
			/>
			<el-option
				label="进入"
				:value="1"
			/>
			<el-option
				label="离开"
				:value="2"
			/>
		</el-select>
		<span
			v-show="total !== 0 && pit_show_auth"
			class="clickable-text"
			@click="jumpPage"
		>查看{{ total }}次{{ resolveCustomText("pit") }}详情>></span>
	</div>
	<fk-table
		v-loading="loading"
		:data="table_data"
		@sort-change="sortChange"
	>
		<el-table-column
			prop="index"
			label="序号"
			type="index"
		/>
		<el-table-column
			prop="status"
			label="状态"
			show-overflow-tooltip
			:formatter="formatStatus"
		/>
		<el-table-column
			prop="access_status"
			show-overflow-tooltip
			label="当次进出状态"
			:formatter="formatAccessStatus"
		/>
		<el-table-column
			prop="down_time"
			:label="resolveCustomText('enter_pit')+'时间'"
			sortable="custom"
			width="200"
		>
			<template #default="{row, column}">
				<span
					v-if="show_calibrate_btn && pit_handle_auth"
					:class="{'clickable-text': !row.down_time}"
					@click="handleCalibrate(row, column, row.down_time)"
				>
					{{ formatTimeString(row, column, row.down_time) }}
				</span>
				<span v-else>{{ formatTime(row, column, row.down_time) }}</span>
			</template>
		</el-table-column>
		<el-table-column
			prop="up_time"
			:label="resolveCustomText('leave_pit')+'时间'"
			sortable="custom"
			width="200"
		>
			<template #default="{row, column}">
				<span
					v-if="show_calibrate_btn && pit_handle_auth"
					:class="{'clickable-text': !row.up_time}"
					@click="handleCalibrate(row, column, row.up_time)"
				>
					{{ formatTimeString(row, column, row.up_time) }}
				</span>
				<span v-else>{{ formatTime(row, column, row.up_time) }}</span>
			</template>
		</el-table-column>
		<el-table-column
			prop="stay_time"
			:label="resolveCustomText('enter_pit')+'时长'"
			width="140"
			sortable="custom"
			show-overflow-tooltip
		/>
	</fk-table>
	<el-pagination
		:current-page="page"
		:page-sizes="[20, 50, 100]"
		:page-size="limit"
		layout="total, sizes, prev, pager, next, jumper"
		class="page"
		popper-class="fk-pagination-select"
		:total="total"
		@size-change="handleSizeChange"
		@current-change="handleCurrentChange"
	/>
	<calibrate-dialog
		ref="calibrate_dialog_ref"
		@calibrate-time="getTableList"
	/>
</div>
</template>

<script setup>
import FkDatePicker from "@/components/ForThink/Form/FkDatePicker.vue";
import CalibrateDialog from "@/views/upDownPit/statistical/CalibrateDialog.vue";
import {computed, inject, onMounted, ref, watch} from "vue";
import {getDayTimeStamp, getDateTimeStr} from "@/utils/js/tools/time";
import FkTable from "@/components/ForThink/Table/FkTable.vue";
import {getMaxPageNumer} from "@/utils/js/tools/table";
import {useAuthStore} from "@/store";
import {
	getTimesPitRecord
} from "@/api/pit/pitRecord";
import {getConfig} from "@/api/configuration/sysConfig";
import {resolveCustomText} from "@/store/modules/featureFlags";
const archive_uuid = inject("ARCHIVE_UUID");
const archive_info = inject("ARCHIVE_INFO");
const search_time = ref([getDayTimeStamp().start, getDayTimeStamp().end]);
const table_data = ref([]);
const loading = ref(true);
const page = ref(1);
const total = ref(0);
const limit = ref(20);
const status = ref("all");
const current_enter_status = ref("all");
const order = ref("");
const field = ref("");
const calibrate_dialog_ref = ref();
const auth_store = useAuthStore();
const pit_show_auth = computed(() => {
	return auth_store && auth_store["/upDownPit#/statistic"] >= 1;
});

const pit_handle_auth = computed(() => {
	return auth_store && auth_store["/upDownPit#/statistic"] === 2 || auth_store["/upDownPit#/statistic"] === 4;
});

const show_calibrate_btn = ref(1);

const getTableList = () => {
	if (!archive_uuid.value) return;
	loading.value = true;
	const data = {
		uuid: archive_uuid.value,
		begin: search_time.value ? new Date(search_time.value[0]).getTime() / 1000 : undefined,
		end: search_time.value ? new Date(search_time.value[1]).getTime() / 1000 : undefined,
		page: page.value,
		limit: limit.value,
		order: order.value || undefined,
		field: field.value || undefined,
		status: status.value === "all" ? undefined : status.value,
		access_status: current_enter_status.value === "all" ? undefined : current_enter_status.value,
		time_type: 3
	};
	getTimesPitRecord(data)
		.then(res => {
			const {type, result: {data, count}} = res.data;
			if (type === 1) {
				if (page.value > getMaxPageNumer(count, limit.value)) {
					page.value = getMaxPageNumer(count, limit.value);
					getTableList();
				} else {
					total.value = count;
					table_data.value = data;
				}
			}
		})
		.finally(() => {
			loading.value = false;
		});
};

const handleSizeChange = (val) => {
	limit.value = val;
	getTableList();
};

const handleCurrentChange = (val) => {
	page.value = val;
	getTableList();
};
const sortChange = (obj) => {
	field.value = obj.prop;
	if (obj.order === "ascending") {
		order.value = "asc";
	} else if (obj.order === "descending") {
		order.value = "desc";
	} else {
		order.value = undefined;
		field.value = undefined;
	}
	getTableList();
};

const getShowButtonConfig = async () => {
	const response = await getConfig();
	show_calibrate_btn.value = Number(response.data.result.find((config) => config.name === "OPEN_UP_AND_DOWN_WELL")?.value);
};

onMounted(() => {
	getShowButtonConfig();
	getTableList();
});

watch(
	() => [archive_uuid.value],
	getTableList,
);

const jumpPage = () => {
	const time = search_time.value ? [new Date(search_time.value[0]).getTime() / 1000, new Date(search_time.value[1]).getTime() / 1000] : [];
	const name = archive_info.value.name;
	let params_str = `?name=${name}&time=${time}&uuid=${archive_info.value.uuid}&time_type=3`;
	if (window.location.href.includes("withoutHead")) params_str += "&withoutHead";
	window.open(`/upDownPit#/statistic${params_str}`);
};

const formatTimeString = (row, col, value) => {
	if (col.property === "up_time" && !row.up_time) {
		return "离开校准>>";
	}
	if (col.property === "down_time" && !row.down_time) {
		return "进入校准>>";
	}
	return formatTime(row, col, value);
};

const formatTime = (row, col, val) => {
	if (!val || val === "--") {
		return "--";
	} else {
		if (col.property === "up_time") {
			return row.up_pit_time_flag ? getTimeStrFromStamp(val) + (show_calibrate_btn.value ? "（已校准）" : "") : getTimeStrFromStamp(val);
		}
		return row.in_pit_time_flag ? getTimeStrFromStamp(val) + (show_calibrate_btn.value ? "（已校准）" : "") : getTimeStrFromStamp(val);
	}
};

const getTimeStrFromStamp = (val) => {
	const time = getDateTimeStr({time: val * 1000, dateStr: "-", timeStr: ":"});
	return time.date + " " + time.time;
};

const formatAccessStatus = (row, col, value) => {
	return value === 1 ? "进入" : "离开";
};

const formatStatus = (row, col, val) => {
	let result = "";
	switch (val) {
	case 1:
		result = "正常";
		break;
	case 2:
		result = "可校准";
		break;
	case 3:
		result = "正常" + (show_calibrate_btn.value ? "（已校准）" : "");
		break;
	default:
		result = "--";
	}
	return result;
};
const handleCalibrate = (row, col, val) => {
	calibrate_dialog_ref.value?.openCalibrateDialog(row, col, val);
};

</script>

<style>
.pit-date-picker-popper .el-picker-panel__footer .el-button--text {
	display: none;
}
</style>
<style scoped lang="scss">
.pit-statistics {
	padding: 16px 16px 0 16px;
	display: flex;
	flex-direction: column;
	.search-form {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	:deep(.el-range-editor.el-input__inner) {
		width: 280px;
		height: 32px;

		.el-range-input {
			width: 46%;
			line-height: 14px;
			color: #a2b2c2;
			text-align: center !important;
		}

		.el-range-separator {
			line-height: 24px;
			padding: 0;
			color: #a2b2c2;
			width: 21px !important;
		}
	}

	.clickable-text {
		margin-left: 5px;
	}
	.fk-table.el-table {
		margin-top: 12px;
	}
	.el-pagination {
		margin-bottom: 16px;
	}
}
</style>
