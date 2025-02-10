
<template>
<anchor-dialog
	:value="value"
	:title="dialog_title"
	:menus="menus"
	:loading="loading"
	:positive-button-loading="save_loading"
	:mode="mode"
	:show-footer="show_footer"
	v-on="$listeners"
	@negative-click="handleCancel"
	@positive-click="handleSave"
	@open="handleOpen"
	@input="closeDialog()"
	@update:mode="emits('update:mode', $event)"
>
	<template #base>
		<base-form
			ref="base_form"
			:default-form-data="form_data.base"
			:disabled="mode === DIALOG_MODE.view || type === 'task'"
			:mode="mode"
			:type="type"
		/>
	</template>

	<template #apply_map>
		<apply-map
			ref="apply_map"
			:default-form-data="form_data.apply_map"
			:disabled="mode === DIALOG_MODE.view || type === 'task'"
			:delete-auth="auth.delete"
			:handle-auth="auth.handle"
			:type="type"
		/>
	</template>

	<template #apply_object>
		<apply-object
			ref="apply_object"
			:default-form-data="form_data.apply_object"
			:disabled="mode === DIALOG_MODE.view || type === 'task'"
			:delete-auth="auth.delete"
			:handle-auth="auth.handle"
			:type="type"
		/>
	</template>

	<template #title_effect_schedule>
		<fk-icon
			tip="生效时间截至时，会结束正在发送的告警"
			size="16"
			style="margin-left: 4px;"
		>
			<warning-icon />
		</fk-icon>
	</template>
	<template #effect_schedule>
		<effect-schedule
			ref="effect_schedule"
			:default-form-data="form_data.effect_schedule"
			:disabled="mode === DIALOG_MODE.view || type === 'task'"
			:type="type"
			:call-time="callTime"
			:mode="mode"
		/>
	</template>

	<template #handling_alarm>
		<handling-alarm
			ref="handling_alarm"
			:default-form-data="form_data.handling_alarm"
			:disabled="mode === DIALOG_MODE.view || type === 'task'"
		/>
	</template>
</anchor-dialog>
</template>

<script setup lang="ts">
import {ref, shallowRef, toRef, provide, computed} from "vue";
import {Notification} from "element-ui";
import {isCancel} from "axios";

import {useSceneStore} from "@/store/useSceneStore";
import {useLoading} from "@/composable/useLoading";
import AnchorDialog from "@/components/Dialog/AnchorDialog.vue";
import {SHUTTLE_TYPE, DIALOG_MODE} from "@/components/Dialog/constant";
import FkIcon from "@/components/ForThink/FkIcon.vue";
import WarningIcon from "~icons/operation/header-warning";
import {usePageAuth} from "@/utils/js/authentication";
import {normalizeHMS} from "@/utils/js/dateShortcuts";
import type {CallRuleArchivesData} from "@/api/archives/archives";
import {getRuleArchives} from "@/api/archives/archives";
import type {AddRollCallRuleParams} from "@/api/rollCall/rollCallRule";
import {addRollCallRule, updateRollCallRule} from "@/api/rollCall/rollCallRule";

import type {FormData} from "./types";
import {RULE_STATUS, APPLY_PERSON, APPLY_TRUCK, APPLY_VISITOR, APPLY_MATERIAL, APPLY_CONTRACTOR, EFFECT_DATE, EFFECT_WEEK, EFFECT_TIME, OFFSET_TIME_UNIT, HANDLING_ALARM} from "./types";
import BaseForm from "./BaseForm.vue";
import ApplyMap from "./ApplyMap.vue";
import ApplyObject from "./ApplyObject.vue";
import EffectSchedule from "./EffectSchedule.vue";
import HandlingAlarm from "./HandlingAlarm.vue";
import {RuleIdProvideKey} from "./constant";

const emits = defineEmits<{
	(event: "input", value: boolean): void,
	(event: "save-success", value: number): void,
	(event: "update:mode", value: DIALOG_MODE): void
}>();

interface Props {
	value: boolean,
	mode: DIALOG_MODE,
	id?: number,
	type?: "task" | "plans",
	callTime?: string
}
const props = withDefaults(defineProps<Props>(), {
	id: 0,
	type: "plans",
	callTime: ""
});

provide(RuleIdProvideKey, toRef(props, "id"));

const menus = [
	{name: "基础信息", id: "base"},
	{name: "适用点名区域", id: "apply_map"},
	{name: "点名对象", id: "apply_object"},
	{name: "点名时间", id: "effect_schedule"},
	{name: "告警手动处理设置", id: "handling_alarm"},
];
let abort_request_controller = new AbortController();

const form_data = shallowRef<FormData>(getDefaultFormData());
const is_delete_rule = ref(true);
const base_form = ref<InstanceType<typeof BaseForm> | null>(null);
const apply_map = ref<InstanceType<typeof ApplyMap> | null>(null);
const apply_object = ref<InstanceType<typeof ApplyObject> | null>(null);
const effect_schedule = ref<InstanceType<typeof EffectSchedule> | null>(null);
const handling_alarm = ref<InstanceType<typeof HandlingAlarm> | null>(null);

const auth = usePageAuth("/call#/setting");
const {loading, startLoading, endLoading} = useLoading();
const {loading: save_loading, startLoading: startSaveLoading, endLoading: endSaveLoading} = useLoading();

const show_footer = computed(() => auth.value.handle && !is_delete_rule.value && props.type === "plans");
const dialog_title = computed(() => {
	if (props.type === "plans") return props.mode === DIALOG_MODE.add ? "新增点名计划" : "点名设置";
	return form_data.value.base.name;
});

function getDefaultFormData() {
	return {
		base: {
			is_use: RULE_STATUS.enable,
			name: "",
		},
		apply_map: {
			map_table_data: []
		},
		apply_object: {
			apply_person: APPLY_PERSON.none,
			apply_person_checked_list: [],
			apply_truck: APPLY_TRUCK.none,
			apply_truck_checked_list: [],
			apply_visitor: APPLY_VISITOR.none,
			apply_visitor_checked_list: [],
			apply_material: APPLY_MATERIAL.none,
			apply_material_checked_list: [],
			apply_contractor: APPLY_CONTRACTOR.none,
			apply_contractor_checked_list: [],
		},
		effect_schedule: {
			effect_date_select: EFFECT_DATE.all,
			effect_date_custom: [],
			effect_week_select: EFFECT_WEEK.all,
			effect_week_custom: [],
			effect_time_select: EFFECT_TIME.custom,
			effect_time_custom: new Date(),
			effect_time_list: [],
			offset_time: "30",
			offset_time_unit: OFFSET_TIME_UNIT.second
		},
		handling_alarm: {
			is_required: HANDLING_ALARM.optional
		}
	} satisfies FormData;
}

async function handleOpen() {
	startLoading();
	setDefaultFormData();
	useSceneStore().fetch();
	if (props.mode === DIALOG_MODE.add) {
		is_delete_rule.value = false;
		endLoading();
	} else {
		is_delete_rule.value = true;
		const rule_data = await fetchRuleData();
		if (rule_data) {
			is_delete_rule.value = Boolean(rule_data?.base.is_delete);
		}
	}
}

function setDefaultFormData() {
	form_data.value = getDefaultFormData();
}

function getApplyMapEditData(data: CallRuleArchivesData) {
	const {areas} = data.base;
	const map_table_data = areas.map((item) => ({
		map_name: item.map,
		area_name: item.area_name,
		area_id: item.area_id,
		area_type: item.type,
	}));

	return {
		map_table_data
	};
}
function getApplyObjectEditData(data: CallRuleArchivesData) {
	const {person, visitor, truck, material, contractor} = data.applicable_objects;
	const person_checked_list = [
		...(person?.single_person || []).map(({uuid, name, branch_name}) => ({id: uuid, name, type: SHUTTLE_TYPE.person, branch_name})),
		...(person?.branch || []).map((item) => ({...item, type: SHUTTLE_TYPE.branch})),
		...(person?.person_class || []).map((item) => ({...item, type: SHUTTLE_TYPE.person_class})),
		...(person?.duty || []).map((item) => ({...item, type: SHUTTLE_TYPE.duty})),
		...(person?.work_type || []).map((item) => ({...item, type: SHUTTLE_TYPE.work_type})),
	];
	const visitor_checked_list = [
		...(visitor?.single_visitor || []).map(({uuid, name}) => ({id: uuid, name, type: SHUTTLE_TYPE.visitor})),
	];
	const truck_checked_list = [
		...(truck?.single_truck || []).map(({uuid, name}) => ({id: uuid, name, type: SHUTTLE_TYPE.truck})),
		...(truck?.truck_type || []).map((item) => ({...item, type: SHUTTLE_TYPE.truck_type})),
	];
	const material_checked_list = [
		...(material?.single_material || []).map(({uuid, name}) => ({id: uuid, name, type: SHUTTLE_TYPE.material})),
		...(material?.material_type || []).map((item) => ({...item, type: SHUTTLE_TYPE.material_type})),
	];
	const contractor_checked_list = [
		...(contractor?.single_contractor || []).map(({uuid, name, unit_name}) => ({id: uuid, name, type: SHUTTLE_TYPE.contractor, unit_name})),
		...(contractor?.unit || []).map((item) => ({...item, type: SHUTTLE_TYPE.contractor_unit})),
		...(contractor?.work_type || []).map((item) => ({...item, type: SHUTTLE_TYPE.contractor_work_type})),
	];
	return {
		apply_person: person?.all_person ? APPLY_PERSON.all : person_checked_list.length ? APPLY_PERSON.custom : APPLY_PERSON.none,
		apply_person_checked_list: person_checked_list,
		apply_truck: truck?.all_truck ? APPLY_TRUCK.all : truck_checked_list.length ? APPLY_TRUCK.custom : APPLY_TRUCK.none,
		apply_truck_checked_list: truck_checked_list,
		apply_visitor: visitor?.all_visitor ? APPLY_VISITOR.all : visitor_checked_list.length ? APPLY_VISITOR.custom : APPLY_VISITOR.none,
		apply_visitor_checked_list: visitor_checked_list,
		apply_material: material?.all_material ? APPLY_MATERIAL.all : material_checked_list.length ? APPLY_MATERIAL.custom : APPLY_MATERIAL.none,
		apply_material_checked_list: material_checked_list,
		apply_contractor: contractor?.all_contractor ? APPLY_CONTRACTOR.all : contractor_checked_list.length ? APPLY_CONTRACTOR.custom : APPLY_CONTRACTOR.none,
		apply_contractor_checked_list: contractor_checked_list
	};
}
function getEffectScheduleEditData(data: CallRuleArchivesData) {
	const {start_time, end_time, day_json, roll_call_time_json, offset_time, metering} = data.base;
	const day_obj = day_json ? JSON.parse(day_json) : null;
	const time_list = roll_call_time_json ? JSON.parse(roll_call_time_json).map((time: number) => {
		return normalizeHMS(new Date(), "start").getTime() + time * 1000;
	}) : [];
	const time_custom = time_list.slice(-1)[0] ?? null;

	return {
		effect_date_select: start_time === 0 || end_time === 0 ? EFFECT_DATE.all : EFFECT_DATE.custom,
		effect_date_custom: start_time === 0 || end_time === 0 ? [] : [new Date(start_time * 1000), new Date(end_time * 1000)],
		effect_week_select: day_obj === null ? EFFECT_WEEK.all : EFFECT_WEEK.custom,
		effect_week_custom: day_obj ?? [],
		effect_time_select: EFFECT_TIME.custom,
		effect_time_custom: time_custom === null ? null : new Date(time_custom),
		effect_time_list: time_list,
		offset_time: String(offset_time),
		offset_time_unit: metering
	};
}
function setEditFormData(data: CallRuleArchivesData) {
	const {is_use, name, alarm_manual_handling_setting} = data.base;
	const base: FormData["base"] = {is_use, name};

	form_data.value = {
		base,
		apply_map: getApplyMapEditData(data),
		apply_object: getApplyObjectEditData(data),
		effect_schedule: getEffectScheduleEditData(data),
		handling_alarm: {
			is_required: alarm_manual_handling_setting
		}
	};
}

async function verifyForm() {
	const pass_list = await Promise.all([
		base_form.value!.verifyForm(),
		effect_schedule.value!.verifyForm()
	]);

	return pass_list.every((is_pass) => is_pass);
}

async function handleSave() {
	const {id} = props;
	startSaveLoading();
	const is_pass = await verifyForm();
	if (!is_pass) return endSaveLoading();
	const params: AddRollCallRuleParams = {
		...base_form.value!.getApiParams(),
		...apply_map.value!.getApiParams(),
		...apply_object.value!.getApiParams(),
		...effect_schedule.value!.getApiParams(),
		...handling_alarm.value!.getApiParams(),
	};
	if (id) {
		const {data: res} = await updateRollCallRule({...params, id}).catch(() => ({data: undefined}));
		endSaveLoading();
		if (res?.type === 1) {
			Notification.success({title: "成功", message: "更新成功"});
			emits("save-success", id);
			emits("input", false);
		} else {
			Notification.error({title: "错误", message: res?.result || "更新失败"});
		}
	} else {
		const {data: res} = await addRollCallRule(params).catch(() => ({data: undefined}));
		endSaveLoading();
		if (res?.type === 1) {
			Notification.success({title: "成功", message: "新增成功"});
			emits("save-success", res.result as number);
			emits("input", false);
		} else {
			Notification.error({title: "错误", message: res?.result as string || "新增失败"});
		}
	}
}

function handleCancel() {
	if (props.mode === DIALOG_MODE.edit) {
		clearValidate();
		fetchRuleData();
	}
}

async function fetchRuleData() {
	abort_request_controller = new AbortController();
	try {
		const {data: res} = await getRuleArchives<CallRuleArchivesData>({id: props.id!, type: 2}, abort_request_controller.signal);
		if (res?.type === 1) {
			setEditFormData(res.result);
			endLoading();
			return res.result;
		} else {
			Notification.error({title: "失败", message: res.result as unknown as string});
		}
	} catch (error) {
		if (!isCancel(error)) {
			Notification.error({title: "失败", message: "查询点名计划档案失败"});
		}
	}
}

function clearValidate() {
	base_form.value!.clearValidate();
	apply_map.value!.clearValidate();
	effect_schedule.value!.clearValidate();
}

function closeDialog() {
	abort_request_controller.abort();
	clearValidate();
	emits("input", false);
}
</script>

<style lang="scss" scoped></style>
