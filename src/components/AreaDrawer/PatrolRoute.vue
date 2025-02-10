<template>
<div>
	<div class="drawer-body">
		<el-form
			ref="form_ref"
			label-position="top"
			:rules="rules"
			:model="form"
			size="small"
			:disabled="!editable"
			class="drawer-form"
		>
			<!-- 基础信息 -->
			<anchor-title title="基础信息" />
			<el-form-item
				label="巡检路线名称"
				prop="name"
			>
				<el-input
					v-model="form.name"
					placeholder="请输入"
				/>
			</el-form-item>
			<el-form-item
				prop="is_ordered"
				label="是否按顺序巡检"
			>
				<el-select
					v-model="form.is_ordered"
					placeholder="请选择"
				>
					<el-option
						label="是"
						:value="1"
					/>
					<el-option
						label="否"
						:value="0"
					/>
				</el-select>
			</el-form-item>
			<!--为了方便两个表格flex布局平分剩余空间 上面的form-item做label使用 下面的form-item做error提示-->
			<el-form-item
				label="巡检点（点击地图中巡检点添加）"
				style="margin-bottom: 0;"
				class="patrol-pointer"
				required
			>
				<template #label>
					<span>巡检点（点击地图中巡检点添加）</span>
					<label-button
						:disabled="!editable"
						style="float: right"
						@click="handleAddPoints"
					>
						新增巡检点
					</label-button>
				</template>
			</el-form-item>
			<fk-table
				:data="form.patrol_points"
				handle-drag-class=".point-drag"
				sortable
				row-key="id"
			>
				<el-table-column
					label="巡检点名称"
					prop="name"
					show-overflow-tooltip
					min-width="100"
				>
					<template #default="scope">
						<div class="drag-content">
							<img
								v-show="editable"
								class="point-drag"
								src="@/assets/svgIcons/operation/drag.svg"
								alt=""
							>
							<span
								class="clickable-text"
								@click="openPointDrawer(scope.row.id, scope.row.floor_id)"
							>{{ scope.row.name }}</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column
					label="所在地图"
					prop="map"
					class-name="direction-rtl"
					show-overflow-tooltip
				/>
				<el-table-column
					label="范围"
					prop="range"
					show-overflow-tooltip
					:formatter="formatRadius"
				/>
				<el-table-column
					label="停留时间"
					prop="stay_time"
					show-overflow-tooltip
					:formatter="formatStayTime"
				/>
				<el-table-column
					v-if="editable"
					label="操作"
					prop="operation"
					width="60"
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
								@click="handleDeletePoint(scope.$index)"
							/>
						</el-tooltip>
					</template>
				</el-table-column>
			</fk-table>
			<el-form-item
				prop="patrol_points"
				style="margin-bottom: 0;"
			/>
			<!-- 关联巡检计划 -->
			<div class="flex-title">
				<anchor-title title="关联巡检计划" />
				<label-button
					:disabled="!editable"
					@click="addPatrolPlan"
				>
					关联
				</label-button>
			</div>
			<fk-table
				:data="patrol_plan_list"
			>
				<el-table-column
					label="巡检计划名称"
					prop="name"
					show-overflow-tooltip
					min-width="120"
				>
					<template #default="{row}">
						<span
							class="clickable-text"
							@click="openPatrolPlan(row.id)"
						>{{ row.name }}</span>
					</template>
				</el-table-column>
				<el-table-column
					prop="branch_name"
					label="所属部门"
					min-width="100"
					show-overflow-tooltip
					:formatter="formatNull"
				>
					<template #header>
						所属部门
						<el-tooltip
							effect="dark"
							content="巡检统计页面将按此字段进行部门统计。"
							placement="top"
						>
							<i class="hg-icons hg-icon-tooltip-question question-icon" />
						</el-tooltip>
					</template>
				</el-table-column>
				<fk-tag-table-column
					prop="applicable_objects"
					label="允许巡检人"
					min-width="120"
					@click="showThingsArchive"
				>
					<template #header>
						允许巡检人
						<el-tooltip
							effect="dark"
							content="可以设置多人，仅允许其中任意一人执行并完成巡检任务。"
							placement="top"
						>
							<i class="hg-icons hg-icon-tooltip-question question-icon" />
						</el-tooltip>
					</template>
				</fk-tag-table-column>
				<el-table-column
					prop="start_time"
					label="生效日期"
					show-overflow-tooltip
					:formatter="formatDate"
				/>
				<el-table-column
					label="启用状态"
					prop="is_use"
				>
					<template #default="{row}">
						<span :class="row.is_use ? 'success' : 'error'">{{ row.is_use ? "启用" : "禁用" }}</span>
					</template>
				</el-table-column>
				<el-table-column
					v-if="editable"
					label="操作"
					prop="operation"
					width="75px"
					fixed="right"
				>
					<template #default="{row}">
						<el-tooltip
							effect="dark"
							content="删除"
							placement="top"
						>
							<el-button
								icon="el-icon-delete"
								size="mini"
								type="danger"
								circle
								plain
								@click="deletePatrolPlan(row.id)"
							/>
						</el-tooltip>
					</template>
				</el-table-column>
			</fk-table>
		</el-form>
	</div>
	<div
		v-if="handle_auth && !is_deleted"
		class="drawer-footer"
	>
		<el-button
			v-show="editable"
			size="small"
			plain
			@click="handleCancel"
		>
			取消
		</el-button>
		<el-button
			v-show="!editable"
			type="primary"
			size="small"
			@click="handleEdit"
		>
			编辑
		</el-button>
		<el-button
			v-show="editable"
			type="primary"
			size="small"
			:loading="is_save_loading"
			@click="handleSave"
		>
			保存
		</el-button>
	</div>
	<select-patrol-plan
		ref="patrol_plan_selector"
		@save="choosePatrolPlan"
	/>
	<archive-dialog ref="archive_dialog" />
</div>
</template>

<script setup lang="ts">
import {computed, ref, set, watch} from "vue";
import AnchorTitle from "@/components/AnchorTitle.vue";
import LabelButton from "@/components/Button/LabelButton.vue";
import FkTable from "@/components/ForThink/Table/FkTable.vue";
import SelectPatrolPlan from "@/views/patrol/components/SelectPatrolPlan.vue";
import {useEventBus} from "@vueuse/core";
import {getDateTimeStr, numberToTime} from "@/utils/js/tools/time";
import FkTableButton from "@/components/ForThink/Table/FkTableButton.vue";
import {addPatrolRoute, checkRouteName, getPatrolRouteArchive, updatePatrolRoute} from "@/api/patrol/route";
import {Notification} from "element-ui";
import {useAuthStore} from "@/store";
import type {ApplicableObjects} from "@/types/alarm";
import FkTagTableColumn from "@/components/ForThink/Table/FkTagTableColumn.vue";
import ArchiveDialog from "@/components/ArchiveDialog/ArchiveDialog.vue";
import type {ElTableColumn} from "element-ui/types/table-column";
import {formatNull} from "@/utils/js/tools/table";
import {getAllPoint} from "@/api/patrol/point";
import {getPlan} from "@/api/patrol/plan";

const props = defineProps({
	id: {
		type: Number,
		required: true
	},
	refresh: {
		type: Boolean,
		required: true
	}
});

type PointInfo = {
	id: number
	map: string
	name: string
	circle_attribute: {radius: number}
	extra_attribute: {stay_time: number}
}

type FormData = {
	id?: number
	name: string,
	is_ordered: number,
	patrol_points: PointInfo[]
}

type PlanInfo = {
	id: number
	name: string
	route_id: number
	route_name: string
	is_use: number
	start_time: number
	end_time: number
	day_json: string
	time_json: string
	branch_name: string
	applicable_objects: ApplicableObjects
}

const auth_store = useAuthStore();
const handle_auth = computed(() => {
	return auth_store && (auth_store["/patrol#/setting"] === 2 || auth_store["/patrol#/setting"] === 4);
});
const is_deleted = computed(() => form.value.id && patrol_route_info.value?.is_delete);

const validatePatrolName = async (rule: any, value: string, callback: any) => {
	const reg = /^[\u4e00-\u9fa5\w-]+$/i;
	if (value === "") {
		return callback(new Error("请输入名称"));
	}
	if (!reg.test(value)) {
		return callback(new Error("巡检路线仅支持输入：汉字、字母、数字和下划线_及破折号-"));
	}
	const {data: res} = await checkRouteName({
		name: value,
		id: form.value.id
	}).catch(() => ({data: undefined}));
	if (res?.type === 1) {
		const {check, msg} = res.result;
		check ? callback() : callback(new Error(msg));
	}
};

const rules = {
	name: [
		{
			required: true,
			message: "请输入巡检路线名称",
			trigger: "blur",
		},
		{
			validator: validatePatrolName,
			trigger: "blur"
		}
	],
	patrol_points: [
		{
			type: "array",
			required: true,
			message: "请至少选择一个巡检点",
			trigger: "change"
		}
	]
};
const form = ref<FormData>(getDefaultFormData());
const editable = ref(true);
const form_ref = ref();
const patrol_plan_selector = ref();
const is_save_loading = ref(false);
const patrol_plan_list = ref<PlanInfo[]>([]);
const patrol_route_info = ref();
const archive_dialog = ref();
const {on: onPointAdd} = useEventBus("add point");

function getDefaultFormData() {
	return {
		name: "",
		is_ordered: 1,
		patrol_points: [],
	};
}

function addPatrolPlan() {
	patrol_plan_selector.value.openDialog(patrol_plan_list.value.map(it => it.id));
}

function handleDeletePoint(index: number) {
	form.value.patrol_points.splice(index, 1);
}

function openPointDrawer(id: number, floor_id: number) {
	emits("open-patrol-point-drawer", id, floor_id);
}

function openPatrolPlan(id: number) {
	emits("open-patrol-plan", id);
}

function showThingsArchive(uuid: number) {
	if (uuid) {
		archive_dialog.value.openArchiveDialog({uuid});
	}
}

const changeStatus = (edit: boolean) => {
	editable.value = edit;
	emits("change-status", editable.value, true);
};

watch(
	() => props.id,
	async (val) => {
		changeStatus(!val);
		if (val) {
			form.value.id = val;
			getArchive(val);
		} else {
			form.value = getDefaultFormData();
			patrol_plan_list.value = [];
		}
	},
	{immediate: true}
);

watch(
	() => props.refresh,
	() => {
		if (form.value.id) {
			getArchive(form.value.id);
		} else {
			refreshTable();
		}
	}
);

const refreshPoint = (point_list: PointInfo[]) => {
	const points = {};
	point_list.map(it => points[it.id] = it);
	for (let i = 0; i < form.value.patrol_points.length; i++) {
		const id = form.value.patrol_points[i].id;
		if (points[id]) {
			set(form.value.patrol_points, i, {
				...points[id],
				circle_attribute: JSON.parse(points[id].circle_attribute),
				extra_attribute: JSON.parse(points[id].extra_attribute),
				map: form.value.patrol_points[i].map_name});
		} else {
			handleDeletePoint(i);
		}
	}
};

const refreshPlan = (plan_list: PlanInfo[]) => {
	const plans = {};
	plan_list.map(it => plans[it.id] = it);
	for (let i = 0; i < patrol_plan_list.value.length; i++) {
		const id = patrol_plan_list.value[i].id;
		if (plans[id]) {
			set(patrol_plan_list.value, i, plans[id]);
		} else {
			deletePatrolPlan(id);
		}
	}
};

async function refreshTable() {
	const res_list = await Promise.all([
		getAllPoint(),
		getPlan()
	]);
	for (let i = 0; i < res_list.length; i++) {
		const {type, result} = res_list[i].data;
		if (type === 1) {
			switch (i) {
			case 0:
				refreshPoint(result);
				break;
			case 1:
				refreshPlan(result.data);
				break;
			}
		}
	}
}

function getArchive(id: number) {
	getPatrolRouteArchive({id}).then(res => {
		const {type, result} = res.data;
		if (type === 1) {
			patrol_route_info.value = result;
			setRouteInfo();
		}
	});
}

function setRouteInfo() {
	const {name, is_ordered, point_list, plans} = patrol_route_info.value;
	form.value = {
		name,
		is_ordered,
		patrol_points: point_list,
		id: form.value.id
	};
	patrol_plan_list.value = plans;
}

const handleSave = () => {
	form_ref.value.validate(async (valid: boolean) => {
		if (valid) {
			is_save_loading.value = true;
			const data = {
				name: form.value.name,
				is_ordered: form.value.is_ordered,
				point_order: form.value.patrol_points.map(it => it.id),
				plans: patrol_plan_list.value.map(it => it.id),
			};
			let res;
			if (form.value.id) {
				res = await updatePatrolRoute({...data, id: form.value.id});
			} else {
				res = await addPatrolRoute(data);
			}
			if (res?.data?.type === 1) {
				Notification.success({
					title: "成功",
					message: form.value.id ? "编辑成功" : "新增成功"
				});
				form.value.id = form.value.id ? form.value.id : res.data.result;
				changeStatus(false);
				emits("saved-success", form.value.id, true);
			} else {
				Notification.error({
					title: "错误",
					message: res?.data?.result || (form.value.id ? "编辑失败" : "新增失败")
				});
			}
			is_save_loading.value = false;
		}
	});
};

const handleCancel = () => {
	form_ref.value?.clearValidate();
	changeStatus(false);
	if (!form.value.id) {
		emits("close");
		form.value = getDefaultFormData();
	} else {
		setRouteInfo();
	}
};

function choosePatrolPlan(list: PlanInfo[]) {
	patrol_plan_list.value = list;
}

const handleEdit = () => {
	changeStatus(true);
};

const addPoint = (point: PointInfo) => {
	if (form.value.patrol_points.find(it => it.id === point.id)) return;
	form.value.patrol_points.push({...point, map: point.map_name});
};

onPointAdd(addPoint);

function formatStayTime(row: PointInfo) {
	return row.extra_attribute?.stay_time ? numberToTime(row.extra_attribute?.stay_time, "", "") : "--";
}

function formatRadius(row: PointInfo) {
	return row.circle_attribute?.radius + "米" || "--";
}

function deletePatrolPlan(id: number) {
	const index = patrol_plan_list.value.findIndex(it => it.id === id);
	if (index !== -1) {
		patrol_plan_list.value.splice(index, 1);
	}
}

function formatDate(row: PlanInfo) {
	if (!row.start_time || !row.end_time) return "全部日期";
	return `${getDateTimeStr({time: row.start_time * 1000, dateStr: "-"}).date}至${getDateTimeStr({time: row.end_time * 1000, dateStr: "-"}).date}`;
}

function handleAddPoints() {
	window.open("/patrol#/setting");
}

const emits = defineEmits(["close", "saved-success", "change-status", "open-patrol-point-drawer", "open-patrol-plan"]);
</script>

<style scoped>
.area-drawer .drawer-form .flex-title :deep(.anchor-title) {
	margin-bottom: 0;
}

.drawer-form.el-form {
	display: flex;
	flex-direction: column;
	min-height: calc(100% - 16px);
}

.drawer-form.el-form :deep(.patrol-pointer.el-form-item.is-required .el-form-item__label) {
	width: 100%;
	line-height: 24px;
	overflow: hidden;
}

.flex-title {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 24px 0 16px 0;
}

.drag-content {
	img {
		vertical-align: middle;
		cursor: move;
		margin-right: 8px;
	}
}

.error {
	color: #F56C6C;
}

.success {
	color: #67C23A;
}
</style>
