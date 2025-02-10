<template>
<div class="attendance-statistics">
	<div class="search-form">
		<fk-date-picker
			v-model="search_time"
			class="clear-date-icon"
			type="datetimerange"
			start-placeholder="开始"
			end-placeholder="结束"
			format="yyyy-MM-dd HH:mm"
			:default-time="['00:00:00', '23:59:59']"
			@change="getTableList"
		/>
		<el-select
			v-model="attendance_frequent_id"
			style="width:100px"
			size="small"
			@change="getTableList"
		>
			<el-option
				value="all"
				label="全部班次"
			/>
			<el-option
				v-for="item in attendance_frequent_options"
				:key="item.value"
				:value="item.value"
				:label="item.label"
			/>
		</el-select>
		<el-select
			v-model="attendance_status"
			style="width:130px"
			size="small"
			@change="getTableList"
		>
			<el-option
				v-for="item in status_options"
				:key="item.value"
				:value="item.value"
				:label="item.label"
			/>
		</el-select>
		<span
			v-show="total !== 0 && attendance_show_auth"
			class="clickable-text"
			@click="jumpPage"
		>查看{{ total }}次日考勤详情>></span>
	</div>
	<fk-table
		v-loading="loading"
		:data="table_data"
	>
		<el-table-column
			prop="index"
			label="序号"
			type="index"
		/>
		<el-table-column
			prop="date"
			label="日期"
			show-overflow-tooltip
		/>
		<el-table-column
			prop="attendance_type"
			show-overflow-tooltip
			label="考勤方式"
			:formatter="formatAttendanceType"
		/>
		<el-table-column
			prop="group_name"
			label="考勤组"
			show-overflow-tooltip
		/>
		<el-table-column
			prop="classes"
			label="班次"
			show-overflow-tooltip
			:formatter="formatNull"
		/>
		<el-table-column
			prop="start_time"
			label="最早上班时间"
			width="110"
			show-overflow-tooltip
		/>
		<el-table-column
			prop="end_time"
			label="最晚下班时间"
			width="110"
			show-overflow-tooltip
		/>
		<el-table-column
			prop="work_time_arr"
			label="工作时间"
			show-overflow-tooltip
			width="145"
			:formatter="formatOfficeTime"
		/>
		<el-table-column
			prop="work_time"
			label="工作时长"
			width="145"
			show-overflow-tooltip
			:formatter="formatWorkTime"
		/>
		<el-table-column
			prop="status"
			label="考勤状态"
			show-overflow-tooltip
			:formatter="formatAttendanceStatus"
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
</div>
</template>

<script setup>
import FkDatePicker from "@/components/ForThink/Form/FkDatePicker.vue";
import {computed, inject, onMounted, ref, watch} from "vue";
import {numberToTime, getDayTimeStamp} from "@/utils/js/tools/time";
import FkTable from "@/components/ForThink/Table/FkTable.vue";
import {formatNull, getMaxPageNumer} from "@/utils/js/tools/table";
import {useAuthStore} from "@/store";
import {
	getDayAttendanceDate
} from "@/api/attendance/attendanceRecord";
import {getAttendanceFrequent} from "@/api/attendance/attendanceFrequent";
import {ATTENDANCE_STATUS, ATTENDANCE_TYPE} from "@/views/attendance/attendanceStatistic/individual/utils/utils";
const archive_uuid = inject("ARCHIVE_UUID");
const archive_info = inject("ARCHIVE_INFO");
const search_time = ref([getDayTimeStamp().start, getDayTimeStamp().end]);
const table_data = ref([]);
const loading = ref(true);
const page = ref(1);
const total = ref(0);
const limit = ref(20);
const attendance_frequent_id = ref("all");
const attendance_status = ref("all");
const attendance_frequent_options = ref([]);

const attendance_show_auth = computed(() => {
	const auth_store = useAuthStore();
	return auth_store && auth_store["/attendance#/attendanceStatistic"] >= 1;
});

const status_options = [
	{value: "all", label: "全部考勤状态"},
	{value: 1, label: "正常"},
	{value: 2, label: "迟到"},
	{value: 3, label: "早退"},
	{value: 4, label: "旷工"},
	{value: 8, label: "缺卡"},
	{value: 7, label: "无效"},
	{value: 6, label: "已删除"},
];

const getAttendanceFrequentOptions = async () => {
	const resp = await getAttendanceFrequent();
	if (resp.data.type === 1) {
		attendance_frequent_options.value = resp.data.result.data.map(({id, name}) => ({value: id, label: name}));
	}
};

const getTableList = () => {
	if (!archive_uuid.value) return;
	loading.value = true;
	const data = {
		uuid: archive_uuid.value,
		begin: search_time.value ? new Date(search_time.value[0]).getTime() / 1000 : undefined,
		end: search_time.value ? new Date(search_time.value[1]).getTime() / 1000 : undefined,
		page: page.value,
		limit: limit.value,
		status: attendance_status.value === "all" ? undefined : attendance_status.value,
		attendance_frequent_id: attendance_frequent_id.value === "all" ? undefined : attendance_frequent_id.value
	};
	getDayAttendanceDate(data)
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

onMounted(() => {
	getAttendanceFrequentOptions();
	getTableList();
});

watch(
	() => [archive_uuid.value],
	getTableList,
);

const jumpPage = () => {
	const time = search_time.value ? [new Date(search_time.value[0]).getTime() / 1000, new Date(search_time.value[1]).getTime() / 1000] : [];
	const name = archive_info.value.name;
	let params_str = `?jump_type=1&name=${name}&time=${time}&uuid=${archive_info.value.uuid}&status=${attendance_status.value}&attendance_frequent_id=${attendance_frequent_id.value}`;
	if (window.location.href.includes("withoutHead")) params_str += "&withoutHead";
	window.open(`/attendance#/attendanceStatistic${params_str}`);
};

const formatOfficeTime = (row, col, value) => {
	return value.join("\n");
};

const formatWorkTime = (row, col, value) => {
	return value ? numberToTime(value, null, true) : "--";
};

const formatAttendanceType = (row, col, value) => {
	return ATTENDANCE_TYPE[value] ?? "--";
};

const formatAttendanceStatus = (row, col, value) => {
	return ATTENDANCE_STATUS[value] ?? "--";
};
</script>

<style scoped lang="scss">
.attendance-statistics {
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
