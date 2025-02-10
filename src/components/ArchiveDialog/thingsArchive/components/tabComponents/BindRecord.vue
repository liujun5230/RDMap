<template>
<div class="bind-record">
	<el-form
		:model="form"
		inline
		size="small"
		class="fk-filter-form"
		@submit.native.prevent
	>
		<el-form-item>
			<template #label>
				<span>
					持有者
					<el-tooltip
						effect="dark"
						:content="tips"
						placement="top"
					>
						<i class="hg-icons hg-icon-tooltip-question" />
					</el-tooltip>
				</span>
			</template>
			<el-input
				v-model="form.name_licence"
				placeholder="请输入"
				@input="handleInput"
			>
				<i
					slot="prefix"
					class="el-input__icon el-icon-search"
				/>
			</el-input>
		</el-form-item>
	</el-form>
	<fk-table
		v-loading="loading"
		:data="table_data"
		@cell-click="clickTableName"
	>
		<el-table-column
			prop="index"
			label="序号"
			type="index"
		/>
		<el-table-column
			prop="name"
			label="持有者"
			show-overflow-tooltip
		>
			<template #default="{row}">
				<span :class="{'clickable-text':row.uuid !== archive_uuid}">{{ row.name }}</span>
			</template>
		</el-table-column>
		<el-table-column
			prop="start_time"
			label="绑卡时间"
			show-overflow-tooltip
			:formatter="formatTime"
		/>
		<el-table-column
			prop="end_time"
			label="解绑时间"
			show-overflow-tooltip
			:formatter="formatTime"
		/>
		<el-table-column
			prop="stay_time"
			label="使用时长"
			show-overflow-tooltip
			:formatter="formatUseTime"
			width="200"
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
	<archive-dialog
		ref="archive_dialog_ref"
	/>
</div>
</template>

<script setup>
import {inject, onMounted, ref, watch} from "vue";
import {useNameTips} from "@/composable/hide";
import FkTable from "@/components/ForThink/Table/FkTable.vue";
import {getDateTimeStr, numberToTime} from "@/utils/js/tools/time";
import {getCardRecord} from "@/api/device/deviceCard";
import {debounce} from "lodash-es";
import ArchiveDialog from "@/components/ArchiveDialog/ArchiveDialog.vue";

const archive_card = inject("ARCHIVE_CARD");
const archive_uuid = inject("ARCHIVE_UUID");
const tips = useNameTips();
const form = ref({name_licence: ""});
const table_data = ref([]);
const loading = ref(true);
const page = ref(1);
const limit = ref(20);
const total = ref(0);

const archive_dialog_ref = ref();

const getList = async () => {
	const param = {...form.value, card_id: archive_card.value};
	param.limit = limit.value;
	param.page = page.value;
	param.card_type = 1; // 1 -> 精准查询 默认0 -> 模糊查询
	loading.value = true;
	const res = await getCardRecord(param).catch(() => ({}));
	loading.value = false;
	if (res?.data?.type === 1) {
		const {data, count} = res.data.result;
		total.value = count;
		table_data.value = data;
	}
};

watch(
	() => archive_card.value,
	getList,
);

watch(
	() => archive_uuid.value,
	getList,
);

onMounted(getList);

const handleInput = debounce(() => {
	page.value = 1;
	getList();
}, 400);

const handleSizeChange = (val) => {
	limit.value = val;
	getList();
};

const handleCurrentChange = (val) => {
	page.value = val;
	getList();
};

const getTimeStrFromStamp = (val) => {
	const time = getDateTimeStr({time: val, dateStr: "-", timeStr: ":"});
	return time.date + " " + time.time;
};

const formatTime = (row, col, val) => {
	return val ? getTimeStrFromStamp(val * 1000) : "--";
};

const formatUseTime = (row, col, val) => {
	if (!val) val = Math.floor(new Date().getTime() / 1000) - row.start_time;
	return numberToTime(val);
};

const clickTableName = (row, col) => {
	if (col.property !== "name" || archive_uuid.value === row.uuid) return;
	archive_dialog_ref.value?.openArchiveDialog({uuid: row.uuid});
};
</script>

<style scoped>
.bind-record {
	padding: 16px 16px 0 16px;
	display: flex;
	flex-direction: column;
}
.hg-icon-tooltip-question{
	color:#a2b2c2;
	font-size:14px;
}
.el-pagination {
	margin-bottom: 16px;
}
</style>
