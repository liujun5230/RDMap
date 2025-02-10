<template>
<div class="area-statistics">
	<div>
		<fk-date-picker
			v-model="search_time"
			class="clear-date-icon"
			popper-class="area-date-picker-popper"
			type="datetimerange"
			format="yyyy-MM-dd HH:mm"
			start-placeholder="开始时间"
			end-placeholder="结束时间"
			:default-time="['00:00:00', '23:59:59']"
			@change="getTableList"
		/>
		<span
			v-show="total !== 0 && area_show_auth"
			class="clickable-text"
			@click="jumpPage"
		>查看{{ total }}次区域进出详情>></span>
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
			prop="map"
			label="所在地图"
			show-overflow-tooltip
			class-name="direction-rtl"
			:formatter="formatNull"
		/>
		<el-table-column
			prop="show_area"
			show-overflow-tooltip
			label="所在区域"
			:formatter="formatNull"
		/>
		<el-table-column
			prop="start_time"
			label="进入时间"
			width="200px"
			show-overflow-tooltip
			:formatter="formatTime"
		/>
		<el-table-column
			prop="end_time"
			label="离开时间"
			width="200px"
			show-overflow-tooltip
			:formatter="formatTime"
		/>
		<el-table-column
			prop="stay_time"
			label="停留时长"
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
</div>
</template>

<script setup>
import FkDatePicker from "@/components/ForThink/Form/FkDatePicker.vue";
import {computed, inject, onMounted, ref, watch} from "vue";
import {getDateTimeStr, getDayTimeStamp} from "@/utils/js/tools/time";
import FkTable from "@/components/ForThink/Table/FkTable.vue";
import {formatNull, getMaxPageNumer} from "@/utils/js/tools/table";
import {useAuthStore} from "@/store";
import {UTYPES} from "@/utils/js/constant";
import {
	getObjectAccessArea
} from "@/api/accessarea/accessArea";
const archive_uuid = inject("ARCHIVE_UUID");
const archive_info = inject("ARCHIVE_INFO");
const things_type = inject("ARCHIVE_THINGS_TYPE");
const search_time = ref([getDayTimeStamp().start, getDayTimeStamp().end]);
const table_data = ref([]);
const loading = ref(true);
const page = ref(1);
const total = ref(0);
const limit = ref(20);

const area_show_auth = computed(() => {
	const auth_store = useAuthStore();
	return auth_store && auth_store["/display#/areaRecordStatistic"] >= 1;
});

const FETCH_MAP = {
	person: UTYPES.PERSON,
	visitor: UTYPES.VISITOR,
	truck: UTYPES.CAR,
	material: UTYPES.MATERIAL
};

const getTableList = () => {
	if (!archive_uuid.value) return;
	loading.value = true;
	const data = {
		uuid: archive_uuid.value,
		start_time: search_time.value ? new Date(search_time.value[0]).getTime() / 1000 : undefined,
		end_time: search_time.value ? new Date(search_time.value[1]).getTime() / 1000 : undefined,
		page: page.value,
		limit: limit.value,
		utype: FETCH_MAP[things_type.value],
		time_type: 3
	};
	getObjectAccessArea(data)
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

onMounted(getTableList);

watch(
	() => [things_type.value, archive_uuid.value],
	getTableList,
);

const jumpPage = () => {
	const time = search_time.value ? [new Date(search_time.value[0]).getTime() / 1000, new Date(search_time.value[1]).getTime() / 1000] : [];
	const type = things_type.value;
	const name = things_type.value === "truck" ? archive_info.value.licence : archive_info.value.name;
	let params_str = `?type=${type}&name=${name}&time=${time}&uuid_list=${archive_info.value.uuid}&time_type=3`;
	if (window.location.href.includes("withoutHead")) params_str += "&withoutHead";
	window.open(`/display#/areaRecordStatistic${params_str}`);
};

const formatTime = (row, col, value) => {
	if (!value) {
		return "--";
	}
	const date_time = getDateTimeStr({time: value * 1000, dateStr: "-", timeStr: ":"});
	return date_time.date + " " + date_time.time;
};
</script>

<style>
.area-date-picker-popper .el-picker-panel__footer .el-button--text {
	display: none;
}
</style>
<style scoped lang="scss">
.area-statistics {
	padding: 16px 16px 0 16px;
	display: flex;
	flex-direction: column;
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
		margin-left: 10px;
	}
	.fk-table.el-table {
		margin-top: 12px;
	}
	.el-pagination {
		margin-bottom: 16px;
	}
}
</style>
