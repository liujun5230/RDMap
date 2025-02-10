<template>
<div>
	<archive-dialog ref="archive_dialog" />
	<alarm-rule-dialog
		:id="selected_row.id"
		v-model="show_rule_archive"
		:mode.sync="dialog_mode"
		@save-success="emits('refresh')"
	/>
	<fk-table
		v-bind="$attrs"
		:max-height="MAX_FORM_TABLE_HEIGHT"
		v-on="$listeners"
	>
		<fk-table-column
			prop="name"
			label="规则名称"
			clickable
			show-overflow-tooltip
			@click="openRuleArchive"
		/>
		<el-table-column
			prop="type"
			label="规则类型"
			show-overflow-tooltip
			:formatter="formatRuleTypeColumn"
		/>
		<el-table-column
			prop="rule_group_name"
			label="所属分组"
			show-overflow-tooltip
			:formatter="formatNull"
		/>

		<!-- 适用对象 -->
		<apply-object-table-column
			prop="applicable_objects"
			label="适用对象"
			show-overflow-tooltip
			@click="openArchiveDialog"
		/>
		<el-table-column
			prop="start_time"
			label="生效日期"
			show-overflow-tooltip
		>
			<template #default="{row}">
				{{ formatTime(row.start_time, row.end_time) }}
			</template>
		</el-table-column>

		<!-- 启用时间 -->
		<el-table-column
			prop="is_use"
			label="启用状态"
			show-overflow-tooltip
		>
			<template #default="{row}">
				<span :class="{active: row.is_use, inactive: !row.is_use}">{{ row.is_use ? "启用" : "禁用" }}</span>
			</template>
		</el-table-column>

		<el-table-column
			v-if="props.showHandle"
			prop="handle"
			label="操作"
			width="55"
		>
			<template #default="scope">
				<el-tooltip
					effect="dark"
					content="删除"
					placement="top"
				>
					<fk-table-button
						size="mini"
						type="danger"
						icon="op-icon-delete"
						circle
						plain
						@click="emits('delete-rule', scope.row)"
					/>
				</el-tooltip>
			</template>
		</el-table-column>
	</fk-table>
</div>
</template>

<script setup lang="ts">
import {Notification} from "element-ui";
import {ref, inject} from "vue";

import {formatNull} from "@/utils/js/tools/table";
import {MAX_FORM_TABLE_HEIGHT} from "@/utils/js/constant";
import AlarmRuleDialog from "@/components/Rule/alarmRuleDialog/AlarmRuleDialog.vue";
import ApplyObjectTableColumn from "@/views/gpsManage/rule/components/ApplyObjectTableColumn.vue";

import {DIALOG_MODE} from "../Dialog/constant";
import {RULE_AUTH_KEY, RULE_TYPE_KEY} from "./keys";
import {formatRuleType} from "./utils";
import ArchiveDialog from "../ArchiveDialog/ArchiveDialog.vue";

const dialog_mode = ref(DIALOG_MODE.view);
const rule_types = inject(RULE_TYPE_KEY);
const props = defineProps<{
	showHandle: boolean;
}>();

const emits = defineEmits<{
	(e: "delete-rule", rule: any): void;
	(e: "refresh"): void;
}>();

const formatTime = (start_time: number, end_time: number) => {
	// 如果为0则永久生效，否则将时间戳转换为2023-05-26类似格式
	if (start_time === 0 && end_time === 0) {
		return "永久生效";
	}

	return Intl.DateTimeFormat("zh-CN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date(start_time * 1000)) + " - " + Intl.DateTimeFormat("zh-CN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date(end_time * 1000));
};

const archive_dialog = ref<InstanceType<typeof ArchiveDialog>>();
function openArchiveDialog(data: {uuid?: number, card_id?: number}) {
	archive_dialog.value!.openArchiveDialog(data);
}

const show_rule_archive = ref(false);
const selected_row = ref<any>({});

const auth = inject(RULE_AUTH_KEY, ref({
	handle: false,
	check: false,
	all: false,
	delete: false,
}));
function openRuleArchive(row: any) {
	if (!auth.value.check) {
		Notification({
			type: "error",
			title: "错误",
			message: "无权限查看",
		});
		return;
	}
	selected_row.value = row;
	show_rule_archive.value = true;
	dialog_mode.value = DIALOG_MODE.view;
}

function formatRuleTypeColumn(_row: any, _col: any, val: any) {
	if (rule_types?.value) {
		return formatRuleType(val, rule_types?.value);
	}
	return "--";
}

</script>

<style scoped>
.active {
	color: #67C23A;
}

.inactive {
	color: #F56C6C;
}
</style>
