<template>
<div>
	<anchor-dialog
		v-model="is_show"
		:menus="menus"
		:title="dialog_title"
		width="888px"
		:mode.sync="dialog_mode"
		:show-footer="show_footer"
		@negative-click="closeDialog"
		@positive-click="clickSave"
		@closed="resetFormData"
	>
		<!--基础信息-->
		<template #patrol_base_info>
			<el-form
				ref="base_info_form"
				:model="base_info"
				:rules="rules"
				label-position="top"
				inline
				class="base-info-form"
				size="small"
				:disabled="!is_edit"
			>
				<el-form-item
					:label="props.isTemp ? '巡检任务名称' : '巡检计划名称'"
					prop="name"
				>
					<el-input
						v-model="base_info.name"
						:maxlength="20"
						show-word-limit
						placeholder="请输入"
					/>
				</el-form-item>
				<el-form-item
					label="启用状态"
					prop="is_use"
				>
					<status-select
						v-model="base_info.is_use"
						:disabled="!is_edit || props.isTemp"
					/>
				</el-form-item>
			</el-form>
		</template>
		<!--巡检路线-->
		<template #patrol_route>
			<label-button
				v-if="!patrol_route_table.length && is_edit"
				size="medium"
				@click="select_patrol_route_ref.openDialog()"
			>
				添加巡检路线
			</label-button>
			<fk-table
				v-show="patrol_route_table.length"
				:data="patrol_route_table"
			>
				<el-table-column
					prop="name"
					label="巡检路线"
				>
					<template #default="{row}">
						<span
							v-if="!row.is_delete"
							class="clickable-text"
							@click="openRouteDrawer(row.id)"
						>
							{{ row.name }}
						</span>
						<span v-else>{{ row.name }}</span>
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
								v-if="!point.is_delete"
								class="clickable-text"
								@click="openPointDrawer(point.id)"
							>
								{{ point.name }}
							</span>
							<span v-else>{{ point.name }}</span>
							{{ index === row.point_list.length - 1 ? "" : "、" }}
						</span>
					</template>
				</el-table-column>
				<el-table-column
					prop="is_ordered"
					label="是否巡检顺序"
					:formatter="formatOrder"
					width="104"
				/>
				<el-table-column
					v-if="is_edit"
					prop="operation"
					label="操作"
					width="58"
				>
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
							@click="deletePatrolRoute"
						/>
					</el-tooltip>
				</el-table-column>
			</fk-table>
			<div
				v-show="show_route_tips"
				class="tips"
			>
				请选择巡检路线
			</div>
		</template>
		<!--所属部门-->
		<template #branch>
			<el-form
				ref="branch_form_ref"
				:model="branch_info"
				:rules="branch_form_rules"
				inline
				size="small"
				class="branch-form"
				:disabled="!is_edit"
			>
				<el-form-item
					label="部门"
					prop="branch_id"
				>
					<branch-select
						ref="branch_cascader"
						:show-all="false"
						:branch-id="branch_info.branch_id"
						style="width: 285px;"
						@visible-change="scrollForm"
						@change-branch="handleChangeBranch"
					/>
				</el-form-item>
			</el-form>
		</template>
		<!--允许巡检人-->
		<template #patrol_principal>
			<tag-select
				v-model="apply_form.apply_person"
				label="员工"
				:options="apply_person_options"
				:show-custom-button="apply_form.apply_person === APPLY_PERSON.custom"
				:checked-list.sync="apply_form.apply_person_checked_list"
				style="margin-bottom: 16px;"
				:disabled="!is_edit"
				@open-dialog="openTagDialog"
			/>
			<shuttle-dialog
				v-model="shuttle_dialog_visible"
				title="选择员工"
				:select-options="person_select_options"
				:checked-list.sync="apply_form.apply_person_checked_list"
			/>
		</template>
		<!--巡检时间-->
		<template #patrol_time>
			<time-select
				v-show="!props.isTemp"
				v-model="date_time_form.effect_date_select"
				label="生效日期"
				:options="[
					{label: '全部日期', value: 'all'},
					{label: '自定义', value: 'custom'},
				]"
				:show-custom-time="date_time_form.effect_date_select === 'custom'"
				:effect-schedule.sync="date_time_form.effect_date_custom"
				:disabled="!is_edit"
				type="daterange"
				style="margin-bottom: 16px;"
				@change="onEffectDateChange"
			/>
			<time-select
				v-show="!props.isTemp"
				ref="week_time_select"
				v-model="date_time_form.effect_week_select"
				label="重复星期"
				:options="[
					{label: '全部星期', value: 'all'},
					{label: '自定义', value: 'custom'},
				]"
				:show-custom-time="date_time_form.effect_week_select === 'custom'"
				:effect-schedule.sync="date_time_form.effect_week_custom"
				:effect-date="date_time_form.effect_date_select === EFFECT_DATE.all ? undefined : date_time_form.effect_date_custom"
				:disabled="!is_edit"
				type="weekrange"
				style="margin-bottom: 16px;"
				@change="onEffectWeekChange"
			/>
			<time-select
				v-show="props.isTemp"
				value="custom"
				label="巡检时间"
				:options="[
					{label: '自定义', value: 'custom'},
				]"
				show-custom-time
				:effect-schedule.sync="date_time_form.effect_task_time"
				:disabled="!is_edit"
				:show-add-button="false"
				type="timerange"
				style="margin-bottom: 16px;"
			/>
			<time-select
				v-show="!props.isTemp"
				ref="time_range_select"
				v-model="date_time_form.effect_time_select"
				label="重复时段"
				:options="[
					{label: '全部时段', value: 'all'},
					{label: '自定义', value: 'custom'},
				]"
				:show-custom-time="date_time_form.effect_time_select === 'custom'"
				:effect-schedule.sync="date_time_form.effect_time_custom"
				:effect-time-range-list.sync="date_time_form.effect_time_list"
				:disabled="!is_edit"
				time-range-rule="no-overlapping"
				type="timerange"
				style="margin-bottom: 16px;"
				@change="onEffectTimeChange"
			/>
		</template>
		<!--告警手动处理设置-->
		<template #patrol_alarm_setting>
			<el-form
				size="small"
				:disabled="!is_edit"
			>
				<el-form-item>
					<el-select
						v-model="alarm_manual_handling_setting"
						style="width: 332px;"
					>
						<el-option
							label="处理内容非必填"
							:value="0"
						/>
						<el-option
							label="处理内容必填"
							:value="1"
						/>
					</el-select>
				</el-form-item>
			</el-form>
		</template>
	</anchor-dialog>
	<select-patrol-route
		ref="select_patrol_route_ref"
		@select="onSelectPatrolRoute"
	/>
</div>
</template>

<script setup lang="ts">
import AnchorDialog from "@/components/Dialog/AnchorDialog.vue";
import {computed, nextTick, ref} from "vue";
import StatusSelect from "@/components/StatusSelect.vue";
import FkTable from "@/components/ForThink/Table/FkTable.vue";
import LabelButton from "@/components/Button/LabelButton.vue";
import SelectPatrolRoute from "@/views/patrol/components/SelectPatrolRoute.vue";
import TimeSelect from "@/components/Select/TimeSelect.vue";
import ShuttleDialog from "@/components/Dialog/shuttle/ShuttleDialog.vue";
import TagSelect from "@/components/Select/TagSelect.vue";
import {type CheckedItem, SHUTTLE_API_PARAMS_KEY, SHUTTLE_TYPE} from "@/components/Dialog/constant";
import {
	APPLY_PERSON,
	EFFECT_DATE,
	EFFECT_TIME,
	EFFECT_WEEK
} from "@/components/Rule/alarmRuleDialog/ruleConfig";
import {addPlan, checkPlanName, updatePlan} from "@/api/patrol/plan";
import {Notification} from "element-ui";
import {addPatrolTask, getPatrolTaskArchive, updatePatrolTask} from "@/api/patrol/task";
import {getRangeShortcut, normalizeHMS, normalizeSeconds} from "@/utils/js/dateShortcuts";
import {getRuleArchives} from "@/api/archives/archives";
import {useDateFormat, useEventBus} from "@vueuse/core";
import {CLOSE_DRAWER_KEY, OPEN_POINT_DRAWER_KEY, OPEN_ROUTE_DRAWER_KEY} from "@/views/patrol/static/keys";
import type {ApplicableObjects} from "@/types/alarm";
import {usePageAuth} from "@/utils/js/authentication";
import BranchSelect from "@/components/BranchSelect.vue";
import {getBranchList} from "@/api/company/branchSetting";
import {transTreeBranch} from "@/views/company/person/utils";
import HeaderQuestionIcon from "~icons/operation/header-question";

const {emit: openPointDrawer} = useEventBus(OPEN_POINT_DRAWER_KEY);
const {emit: openRouteDrawer} = useEventBus(OPEN_ROUTE_DRAWER_KEY);
const {on: onCloseDrawer} = useEventBus(CLOSE_DRAWER_KEY);
onCloseDrawer(() => {
	displayData(plan_id.value);
});

const auth = usePageAuth("/patrol#/info");

type ApplyFormType = {
	apply_person: string
	apply_person_checked_list: CheckedItem[]
}

type ApplyObjectKey = "uuid_list" | "branch_id_list" | "person_class_id_list" | "duty_id_list" | "work_type_id_list"
type DateTimeFormType = {
	effect_week_select: EFFECT_WEEK
	effect_week_custom: number[]
	effect_date_select: EFFECT_DATE
	effect_date_custom: Date[]
	effect_time_select: EFFECT_TIME
	effect_time_custom: Date[] | null
	effect_time_list: number[][]
	effect_task_time: Date[]
}
type RouteInfo = {
	id: number
	name: string
	is_ordered: number
	point_list: {id: number, name: string}[]
}
type BaseInfo = {
	is_use: 1 | 0
	name: string
	start_time: number
	end_time: number
	alarm_manual_handling_setting: number
	day_json: string
	time_json: string
	status: number
	route: RouteInfo | null
	is_delete: number
	branch_id: number
}
type ResponseData = {
	base: BaseInfo,
	applicable_objects: ApplicableObjects
}
type TaskInfo = BaseInfo & {applicable_objects: ApplicableObjects}
type BaseFormType = {
	name: string;
	is_use: 1 | 0;
}

const props = withDefaults(defineProps<{isTemp?: boolean}>(), {isTemp: false});

const menus = ref([
	{id: "patrol_base_info", name: "基础信息"},
	{id: "patrol_route", name: "巡检路线"},
	{id: "branch", name: "所属部门", icon_tip: "巡检统计页面将按此字段进行部门统计。", icon: HeaderQuestionIcon},
	{id: "patrol_principal", name: "允许巡检人", icon_tip: "可以设置多人，仅允许其中任意一人执行并完成巡检任务。", icon: HeaderQuestionIcon},
	{id: "patrol_time", name: "巡检时间"},
	{id: "patrol_alarm_setting", name: "告警手动处理设置"},
]);

const is_show = ref(false);
const base_info_form = ref();
const base_info = ref<BaseFormType>({
	name: "",
	is_use: 1,
});
const branch_info = ref<{branch_id?: number[]}>({
	branch_id: undefined
});

async function verifyPlanName(rule: any, value: any, callback: any) {
	if (props.isTemp) return callback();
	const params = {
		name: value,
		id: dialog_mode.value === "edit" ? plan_id.value : undefined
	};
	const {data: res} = await checkPlanName(params).catch(() => ({data: undefined}));
	if (res?.type === 1) {
		const {check, msg} = res.result;
		check ? callback() : callback(new Error(msg));
	}
}

const rules = {
	name: [
		{required: true, whitespace: true, message: props.isTemp ? "请输入巡检任务名称" : "请输入巡检计划名称", trigger: "blur"},
		{validator: verifyPlanName, trigger: "blur"},
	],
	is_use: [
		{required: true, message: "请选择启用状态"},
	]
};

const branch_form_rules = {
	branch_id: [
		{required: true, message: "请选择部门", trigger: "change"}
	]
};

const apply_person_options = ref([
	{label: "全部员工", value: APPLY_PERSON.all},
	{label: "自定义", value: APPLY_PERSON.custom}
]);
const apply_form = ref<ApplyFormType>(getApplyFormDefault());
const shuttle_dialog_visible = ref(false);
const person_select_options = [
	{label: "员工姓名", value: SHUTTLE_TYPE.person, fetch_type: SHUTTLE_TYPE.person},
	{label: "部门", value: SHUTTLE_TYPE.branch, tab_name: "组织架构", fetch_type: SHUTTLE_TYPE.branch},
	{label: "职务", value: SHUTTLE_TYPE.duty, tab_name: "职务", fetch_type: SHUTTLE_TYPE.duty},
	{label: "工种", value: SHUTTLE_TYPE.work_type, tab_name: "工种", fetch_type: SHUTTLE_TYPE.work_type},
	{label: "员工分类", value: SHUTTLE_TYPE.person_class, tab_name: "员工分类", fetch_type: SHUTTLE_TYPE.person_class}
];

const date_time_form = ref<DateTimeFormType>(getTimeDefault());

const alarm_manual_handling_setting = ref(0);
const patrol_route_table = ref<RouteInfo[]>([]);
const select_patrol_route_ref = ref();
const plan_id = ref(0); // 巡检计划或巡检任务id
const is_selected_route = ref(true);
let response_data: ResponseData;
let task_resp_data: TaskInfo;
const week_time_select = ref<InstanceType<typeof TimeSelect> | null>(null);
const time_range_select = ref<InstanceType<typeof TimeSelect> | null>(null);
const branch_cascader = ref();
const branch_form_ref = ref();
const branch_data = ref({});
const dialog_mode = ref("view");
const is_show_footer = ref(true);
const show_footer = computed(() => is_show_footer.value && auth.value.handle);

const dialog_title = computed(() => {
	if (plan_id.value) {
		return base_info.value.name;
	}
	if (props.isTemp) {
		return "新增临时巡检任务";
	}
	return "新增巡检计划";
});
const show_route_tips = computed(() => props.isTemp && !is_selected_route.value); // 临时巡检任务必选巡检路线

const is_edit = computed(() => dialog_mode.value !== "view");

const onEffectDateChange = () => {
	if (date_time_form.value.effect_date_select === EFFECT_DATE.custom) {
		date_time_form.value.effect_date_custom = getRangeShortcut(0, 3600 * 1000 * 24 * 30, false);
	}
};

const onEffectTimeChange = () => {
	if (date_time_form.value.effect_time_select === EFFECT_TIME.custom) {
		date_time_form.value.effect_time_custom = [new Date(), new Date(Date.now() + 3600000)];
	}
};

const onEffectWeekChange = () => {
	if (date_time_form.value.effect_week_select === EFFECT_WEEK.custom) {
		const week = new Date().getDay();
		const week_custom = week === 0 ? 6 : week - 1;
		date_time_form.value.effect_week_custom = [week_custom];
	}
};

const closeDialog = () => {
	if (dialog_mode.value === "add") {
		is_show.value = false;
	} else {
		if (props.isTemp) {
			showTaskInfo();
		} else {
			showPlanInfo();
		}
	}
	clearValidate();
};

async function displayData(id: number) {
	await getBranchData();
	if (id) {
		if (props.isTemp) {
			await getTaskArchive(id);
			showTaskInfo();
		} else {
			await getPlanInfo(id);
			showPlanInfo();
		}
	}
}

const getBranchData = async () => {
	const branch_res = await getBranchList();
	const {type, result} = branch_res.data;
	const obj = {};
	if (type === 1) {
		result.data.map((i) => {
			obj[i.id] = i;
		});
		branch_data.value = obj;
	}
};

const openDialog = async (id = 0) => {
	resetFormData();
	plan_id.value = id;
	dialog_mode.value = id ? "view" : "add";
	is_show_footer.value = true;
	await displayData(id);
	is_show.value = true;
};

async function getPlanInfo(id: number) {
	const res = await getRuleArchives({id, type: 3});
	if (res?.data?.type === 1) {
		response_data = res.data.result;
	}
}

async function getTaskArchive(id: number) {
	const res = await getPatrolTaskArchive({id});
	if (res.data.type === 1) {
		task_resp_data = res.data.result;
	}
}

function showPlanInfo() {
	base_info.value.name = response_data.base.name;
	base_info.value.is_use = response_data.base.is_use;
	patrol_route_table.value = response_data.base.route ? [response_data.base.route] : [];
	branch_info.value.branch_id = response_data.base.branch_id ? transTreeBranch(response_data.base.branch_id, branch_data.value) : undefined;
	alarm_manual_handling_setting.value = response_data.base.alarm_manual_handling_setting;
	apply_form.value = getApplyObjectEditData(response_data.applicable_objects);
	const time_data = getEffectScheduleEditData(response_data);
	date_time_form.value = {...time_data};
	nextTick(() => {
		setTimeout(() => {
			date_time_form.value.effect_week_custom = time_data.effect_week_custom;
		});
	});
	is_show_footer.value = !response_data.base.is_delete;
}

function showTaskInfo() {
	base_info.value.name = task_resp_data.name;
	base_info.value.is_use = task_resp_data.is_use;
	patrol_route_table.value = task_resp_data.route ? [task_resp_data.route] : [];
	branch_info.value.branch_id = task_resp_data.branch_id ? transTreeBranch(task_resp_data.branch_id, branch_data.value) : undefined;
	alarm_manual_handling_setting.value = task_resp_data.alarm_manual_handling_setting;
	apply_form.value = getApplyObjectEditData(task_resp_data.applicable_objects);
	date_time_form.value.effect_task_time = [new Date(task_resp_data.start_time * 1000), new Date(task_resp_data.end_time * 1000)];
	is_show_footer.value = task_resp_data.status === 0;
}

function getApplyObjectEditData(data: ApplicableObjects) {
	const {person} = data;
	const person_checked_list = [
		...(person?.single_person || []).map(({uuid, name, branch_name}) => ({id: uuid, name, type: SHUTTLE_TYPE.person, branch_name})),
		...(person?.branch || []).map((item) => ({...item, type: SHUTTLE_TYPE.branch})),
		...(person?.person_class || []).map((item) => ({...item, type: SHUTTLE_TYPE.person_class})),
		...(person?.duty || []).map((item) => ({...item, type: SHUTTLE_TYPE.duty})),
		...(person?.work_type || []).map((item) => ({...item, type: SHUTTLE_TYPE.work_type})),
	];
	return {
		apply_person: person.all_person ? APPLY_PERSON.all : APPLY_PERSON.custom,
		apply_person_checked_list: person_checked_list,
	};
}

function getEffectScheduleEditData(data: ResponseData) {
	const {start_time, end_time, day_json, time_json} = data.base;
	const day_obj = day_json === null ? null : JSON.parse(day_json);
	const time_list = (JSON.parse(time_json) || []).map(([start, end]: number[]) => {
		const start_timestamp = normalizeHMS(new Date(), "start").getTime() + start * 1000;
		const end_timestamp = normalizeHMS(new Date(), "start").getTime() + end * 1000;
		return [start_timestamp, end_timestamp];
	});
	const time_custom = time_list.slice(-1)[0]?.map((time: number) => new Date(time)) ?? [new Date(), new Date(Date.now() + 3600000)];

	return {
		effect_date_select: start_time === 0 || end_time === 0 ? EFFECT_DATE.all : EFFECT_DATE.custom,
		effect_date_custom: [new Date(start_time * 1000), new Date(end_time * 1000)],
		effect_week_select: day_obj === null ? EFFECT_WEEK.all : EFFECT_WEEK.custom,
		effect_week_custom: day_obj ?? [],
		effect_time_select: time_json === null ? EFFECT_TIME.all : EFFECT_TIME.custom,
		effect_time_custom: time_custom,
		effect_time_list: time_list,
		effect_task_time: [] // 临时任务
	};
}

function resetFormData() {
	base_info.value = {
		name: "",
		is_use: 1
	};
	branch_info.value = {
		branch_id: undefined
	};
	clearValidate();
	patrol_route_table.value = [];
	date_time_form.value = getTimeDefault();
	apply_form.value = getApplyFormDefault();
	alarm_manual_handling_setting.value = 0;
}

function getApplyFormDefault() {
	return {
		apply_person: APPLY_PERSON.custom,
		apply_person_checked_list: []
	};
}

function getTimeDefault() {
	return {
		effect_week_select: EFFECT_WEEK.all,
		effect_week_custom: [],
		effect_date_select: EFFECT_DATE.all,
		effect_date_custom: [],
		effect_time_select: EFFECT_TIME.all,
		effect_time_custom: [],
		effect_time_list: [],
		effect_task_time: [normalizeSeconds(new Date(), "start"), normalizeSeconds(new Date(Date.now() + 3600000), "end")],
	};
}

function getApiParams() {
	const {
		apply_person,
		apply_person_checked_list,
	} = apply_form.value;

	const params = {
		type_things_json: JSON.stringify({
			is_person: (apply_person === APPLY_PERSON.all ? 1 : 0),
		}),
		uuid_list: [],
		branch_id_list: [],
		person_class_id_list: [],
		duty_id_list: [],
		work_type_id_list: [],
	};

	[
		...(apply_person === APPLY_PERSON.custom ? apply_person_checked_list : []),
	].forEach(({id, type}) => {
		const key = SHUTTLE_API_PARAMS_KEY[type] as ApplyObjectKey;
		params[key].push(id);
	});

	return params;
}

const clickSave = () => {
	is_selected_route.value = !!patrol_route_table.value.length;
	verifyForm().then(async (validate) => {
		if (validate && !show_route_tips.value) {
			let res;
			if (props.isTemp) { // 新增临时巡检任务
				const data = {
					id: plan_id.value || undefined,
					name: base_info.value.name,
					route_id: patrol_route_table.value[0].id,
					branch_id: branch_info.value.branch_id[branch_info.value.branch_id?.length - 1],
					alarm_manual_handling_setting: alarm_manual_handling_setting.value,
					start_time: Math.floor(date_time_form.value.effect_task_time[0].getTime() / 1000),
					end_time: Math.floor(date_time_form.value.effect_task_time[1].getTime() / 1000),
					...getApiParams()
				};

				const fetchRequest = plan_id.value ? updatePatrolTask : addPatrolTask;
				res = await fetchRequest(data);
			} else { // 新增编辑巡检计划
				const data = {
					id: plan_id.value ? plan_id.value : undefined,
					name: base_info.value.name,
					is_use: base_info.value.is_use,
					route_id: patrol_route_table.value.length ? patrol_route_table.value[0].id : undefined,
					branch_id: branch_info.value.branch_id[branch_info.value.branch_id?.length - 1],
					alarm_manual_handling_setting: alarm_manual_handling_setting.value,
					...getApiParams(),
					...getTimeApiParams(),
				};
				const fetchRequest = plan_id.value ? updatePlan : addPlan;
				res = await fetchRequest(data);
			}
			if (res?.data?.type === 1) {
				Notification.success({
					title: "成功",
					message: res.data.result
				});
				is_show.value = false;
				emits("saved-success");
			} else {
				Notification.error({
					title: "错误",
					message: res.data.result
				});
			}
		}
	});
};

async function verifyForm() {
	const pass_list = await Promise.all([
		week_time_select.value?.verifyForm() ?? Promise.resolve(true),
		time_range_select.value?.verifyForm() ?? Promise.resolve(true),
		branch_form_ref.value?.validate(),
		base_info_form.value?.validate(),
	]);
	return pass_list.every((is_pass) => is_pass);
}

function clearValidate() {
	base_info_form.value?.clearValidate();
	branch_form_ref.value?.clearValidate();
	week_time_select.value?.clearValidate();
	time_range_select.value?.clearValidate();
}

function getTimeApiParams() {
	const {
		effect_date_select,
		effect_date_custom,
		effect_week_select,
		effect_week_custom,
		effect_time_select,
		effect_time_list
	} = date_time_form.value;

	const time_obj = effect_time_list.map(([start, end]) => {
		const [h_start, m_start, s_start] = useDateFormat(start, "H-m-s").value.split("-");
		const [h_end, m_end, s_end] = useDateFormat(end, "H-m-s").value.split("-");
		return [
			parseInt(h_start) * 3600 + parseInt(m_start) * 60 + parseInt(s_start),
			parseInt(h_end) * 3600 + parseInt(m_end) * 60 + parseInt(s_end) + (new Date(start).getDate() < new Date(end).getDate() ? 86400 : 0),
		];
	});
	return {
		start_time: effect_date_select === EFFECT_DATE.all ? 0 : Math.floor(effect_date_custom[0].getTime() / 1000),
		end_time: effect_date_select === EFFECT_DATE.all ? 0 : Math.floor(effect_date_custom[1].getTime() / 1000),
		day_json: effect_week_select === EFFECT_WEEK.all ? null : JSON.stringify([...effect_week_custom]),
		time_json: effect_time_select === EFFECT_TIME.all ? null : JSON.stringify(time_obj)
	};
}

function deletePatrolRoute() {
	patrol_route_table.value = [];
}

function onSelectPatrolRoute(row: RouteInfo) {
	patrol_route_table.value = [row];
	is_selected_route.value = true;
}

function openTagDialog() {
	shuttle_dialog_visible.value = true;
}

const handleChangeBranch = (branch_id: number[]) => {
	branch_info.value.branch_id = branch_id;
	branch_form_ref.value.validate();
};

function formatOrder(row: any, col: any, val: number) {
	return val ? "是" : "否";
}

const closeDownList = () => {
	branch_cascader.value.$children[0].dropDownVisible = false;
};

const scrollForm = (flag: boolean) => {
	const container = document.querySelector(".main-content");
	if (flag) {
		container && container.addEventListener("scroll", closeDownList);
	} else {
		container && container.removeEventListener("scroll", closeDownList);
	}
};

defineExpose({openDialog});
const emits = defineEmits(["saved-success"]);
</script>

<style scoped>
.base-info-form.el-form {
	display: grid;
	gap: 16px;
	grid-template-columns: 1fr 1fr;
	:deep(.el-form-item__label) {
		line-height: 14px;
		padding-bottom: 8px;
	}

	.el-select {
		width: 100%;
	}

	.el-form-item {
		margin: 0;
	}
}

.branch-form.el-form {
	.el-form-item {
		margin-bottom: 0;
	}

	:deep(.el-form-item__label) {
		padding-right: 8px;
	}
}

.patrol-time-form {
	:deep(.el-form-item__label) {
		padding-right: 8px;
	}
	:deep(.el-form-item__content) {
		.el-select {
			width: 268px;
			margin-right: 12px;
		}

		.el-checkbox-group {
			display: inline-flex;
			width: 332px;
			vertical-align: bottom;

			label {
				flex: 1;

				.el-checkbox-button__inner {
					width: 100%;
				}
			}
		}

		.label-button {
			display: inline-block;
			margin-left: 12px;
		}

		.el-range-separator {
			width: auto;
			padding: 0 20px;
			color: #A2B2C2;
		}

		.el-date-editor {
			.el-range-input:first-of-type {
				text-align: right;
			}

			.el-range-input:last-of-type {
				text-align: left;
			}
		}

		.el-checkbox-button__inner,
		.el-range-input {
			color: #A2B2C2;
		}

		.el-checkbox-button.is-checked .el-checkbox-button__inner{
			color: #fff;
		}
	}
}

.tag-container {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.tag {
	display: inline-block;
	padding: 4px 8px 4px 10px;
	font-size: 12px;
	line-height: 16px;
	color: #748ba4;
	background-color: #F3F7FA;
	border-radius: 50px;

	.el-icon-close {
		padding: 1px;
		border-radius: 50px;
		cursor: pointer;
	}

	.el-icon-close:hover {
		color: #F3F7FA;
		background-color: #A2B2C2;
	}
}

.tips {
	color: #f56c6c;
	font-size: 12px;
}
</style>
