<template>
<fk-table
	:data="props.data"
	v-bind="$attrs"
	:max-height="MAX_FORM_TABLE_HEIGHT"
	v-on="$listeners"
>
	<el-table-column
		prop="attendance_group_name"
		label="考勤组名称"
		min-width="120"
		show-overflow-tooltip
	/>

	<el-table-column
		prop="person_count"
		label="人数"
		show-overflow-tooltip
	/>

	<el-table-column
		prop="attendance_type"
		label="考勤类型"
		:formatter="formatAttendanceType"
		show-overflow-tooltip
	/>

	<el-table-column
		prop="frequent"
		label="考勤班次"
		show-overflow-tooltip
	/>
</fk-table>
</template>

<script setup lang="ts">
import {MAX_FORM_TABLE_HEIGHT} from "@/utils/js/constant";
import {type AttendanceArea} from "@/api/attendance/attendanceArea";

const formatAttendanceType = (row:unknown, col: unknown, val: number): string => {
	switch (val) {
	case 1: return "固定班制";
	case 2: return "排班制";
	case 3: return "自由班制";
	default: return "--";
	}
};

export type AttendanceGroup = AttendanceArea["attendance_group_info"][0]
type Props = {
	data: AttendanceGroup[];
}

const props = defineProps<Props>();
</script>

	<style scoped>
	.active {
		color: var(--table-active-text, #67C23A);
	}

	.disable {
		color: var(--table-passive-text, #F56C6C);
	}
	</style>
