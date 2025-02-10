<template>
<anchor-dialog
	class="alarm-rule-dialog"
	:value="value"
	title="规则设置"
	:menus="menus"
	:loading="loading"
	:positive-button-loading="save_loading"
	:mode="mode"
	:show-footer="show_footer"
	calculate-offset-occasion="watch"
	v-on="$listeners"
	@negative-click="handleCancel"
	@positive-click="handleSave"
	@open="startLoading()"
	@opened="handleOpened"
	@input="closeDialog()"
	@update:mode="emits('update:mode', $event)"
>
	<template #base>
		<base-form
			ref="base_form"
			:default-form-data="form_data.base"
			:form-config="form_config"
			:disabled="mode === DIALOG_MODE.view"
			:mode="mode"
			@change-rule-type="changeRuleType"
		/>
	</template>

	<template #title_rule_setting>
		<fk-icon
			:tip="form_config.rule_setting_title_tip"
			size="16"
			style="margin-left: 4px;"
		>
			<question-icon />
		</fk-icon>
	</template>
	<template #rule_setting>
		<rule-setting
			ref="rule_setting"
			:rule-type="rule_type"
			:alarm-config-list="alarm_config_list"
			:default-form-data="form_data.rule_setting"
			:form-config="form_config"
			:delete-auth="auth.delete"
			:handle-auth="auth.handle"
			:disabled="mode === DIALOG_MODE.view"
			:mode="mode"
		/>
	</template>

	<template #apply_map>
		<apply-map
			ref="apply_map"
			:default-form-data="form_data.apply_map"
			:form-config="form_config"
			:delete-auth="auth.delete"
			:handle-auth="auth.handle"
			:disabled="mode === DIALOG_MODE.view"
			:mode="mode"
		/>
	</template>

	<template #hazard_source_apply_object>
		<apply-object
			ref="hazard_source_apply_object"
			:default-form-data="form_data.hazard_source_apply_object || form_data.apply_object"
			:form-config="form_config"
			:delete-auth="auth.delete"
			:handle-auth="auth.handle"
			:disabled="mode === DIALOG_MODE.view"
			:mode="mode"
		/>
	</template>
	<template #accompany_apply_object>
		<apply-object
			ref="accompany_apply_object"
			:default-form-data="form_data.accompany_apply_object || form_data.apply_object"
			:form-config="form_config"
			:delete-auth="auth.delete"
			:handle-auth="auth.handle"
			:disabled="mode === DIALOG_MODE.view"
			:mode="mode"
		/>
	</template>
	<template #apply_object>
		<apply-object
			ref="apply_object"
			:default-form-data="form_data.apply_object"
			:form-config="form_config"
			:delete-auth="auth.delete"
			:handle-auth="auth.handle"
			:disabled="mode === DIALOG_MODE.view"
			:mode="mode"
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
			:form-config="form_config"
			:disabled="mode === DIALOG_MODE.view"
			:mode="mode"
		/>
	</template>

	<template #handling_alarm>
		<handling-alarm
			ref="handling_alarm"
			:default-form-data="form_data.handling_alarm"
			:form-config="form_config"
			:disabled="mode === DIALOG_MODE.view"
			:mode="mode"
		/>
	</template>
</anchor-dialog>
</template>

<script setup lang="ts">
import {shallowRef, ref, provide, toRef, computed} from "vue";
import {storeToRefs} from "pinia";
import {Notification} from "element-ui";

import type {Props as AnchorDialogProps} from "@/components/Dialog/AnchorDialog.vue";
import AnchorDialog from "@/components/Dialog/AnchorDialog.vue";
import FkMessageBox from "@/components/ForThink/FkMessageBox";
import FkIcon from "@/components/ForThink/FkIcon.vue";
import QuestionIcon from "~icons/operation/question";
import WarningIcon from "~icons/operation/header-warning";
import {SHUTTLE_TYPE, DIALOG_MODE} from "@/components/Dialog/constant";
import {ALARM_RULE_TYPE} from "@/utils/js/constant";
import {usePageAuth} from "@/utils/js/authentication";
import {normalizeHMS} from "@/utils/js/dateShortcuts";
import {useLoading} from "@/composable/useLoading";
import {useAlarmLevelStore} from "@/store/useAlarmStore";
import {useRuleTypeStore, useRuleGroupStore} from "@/store/useRuleStore";
import {useSceneStore} from "@/store/useSceneStore";
import type {AlarmRuleResponseItem} from "@/api/alarm/configuration";
import {getAlarmConfiguration} from "@/api/alarm/configuration";
import type {AddAlarmRuleParams} from "@/api/area/alarmRule";
import {addAreaAlarmRule, editAreaAlarmRule} from "@/api/area/alarmRule";
import type {AlarmRuleArchivesData} from "@/api/archives/archives";
import {getRuleArchives} from "@/api/archives/archives";

import {normalizeRuleAlarmSetting} from "./tool";
import type {FormData, FormConfig, AlarmSettingItem} from "./ruleConfig";
import {
	ALARM_RULE_CONFIG,
	ALARM_LEVEL_NUMBER,
	EFFECT_DATE,
	EFFECT_WEEK,
	EFFECT_TIME,
	APPLY_PERSON,
	APPLY_TRUCK,
	APPLY_VISITOR,
	APPLY_MATERIAL,
	APPLY_CONTRACTOR,
	APPLY_CARD_TYPE
} from "./ruleConfig";
import BaseForm from "./BaseForm.vue";
import RuleSetting from "./RuleSetting.vue";
import ApplyMap from "./ApplyMap.vue";
import ApplyObject from "./ApplyObject.vue";
import EffectSchedule from "./EffectSchedule.vue";
import HandlingAlarm from "./HandlingAlarm.vue";
import {RuleIdProvideKey, LocalElFormProvideKey} from "./constant";

const emits = defineEmits<{
	(event: "input", value: boolean): void,
	(event: "save-success", value: number): void,
	(event: "update:mode", value: DIALOG_MODE): void
}>();

interface Props {
	value: boolean,
	mode: DIALOG_MODE,
	id?: number,
}
const props = defineProps<Props>();

provide(RuleIdProvideKey, toRef(props, "id"));
// 避免在el-form使用AlarmRuleDialog组件，外部el-form的disabled属性影响AlarmRuleDialog内部的表单组件
provide(LocalElFormProvideKey, {});

const menus = shallowRef<AnchorDialogProps["menus"]>([]);
const form_data = shallowRef<FormData>({} as FormData);
const form_config = shallowRef<FormConfig>({} as FormConfig);
const rule_type = ref<ALARM_RULE_TYPE>(ALARM_RULE_TYPE.region_intrusion);
const alarm_config_list = shallowRef<AlarmRuleResponseItem[]>([]);
const is_delete_rule = ref(false);
const base_form = ref<InstanceType<typeof BaseForm> | null>(null);
const rule_setting = ref<InstanceType<typeof RuleSetting> | null>(null);
const apply_map = ref<InstanceType<typeof ApplyMap> | null>(null);
const apply_object = ref<InstanceType<typeof ApplyObject> | null>(null);
const hazard_source_apply_object = ref<InstanceType<typeof ApplyObject> | null>(null);
const accompany_apply_object = ref<InstanceType<typeof ApplyObject> | null>(null);
const effect_schedule = ref<InstanceType<typeof EffectSchedule> | null>(null);
const handling_alarm = ref<InstanceType<typeof HandlingAlarm> | null>(null);

const auth = usePageAuth("/gpsManage#/rule");
const {loading, startLoading, endLoading} = useLoading();
const {loading: save_loading, startLoading: startSaveLoading, endLoading: endSaveLoading} = useLoading();
const {rule_type_name_map} = storeToRefs(useRuleTypeStore());

const show_footer = computed(() => auth.value.handle && !is_delete_rule.value);

async function handleOpened() {
	useAlarmLevelStore().fetch();
	useRuleTypeStore().fetch();
	useRuleGroupStore().fetch();
	useSceneStore().fetch();
	fetchAlarmConfig();
	if (props.mode === DIALOG_MODE.add) {
		is_delete_rule.value = false;
		changeRuleConfig(ALARM_RULE_TYPE.region_intrusion);
		setDefaultFormData();
		endLoading();
	} else {
		const rule_data = await fetchAlarmRuleData();
		is_delete_rule.value = Boolean(rule_data?.base?.is_delete);
	}
}

function setDefaultFormData() {
	const {getDefaultForm} = ALARM_RULE_CONFIG[rule_type.value];
	form_data.value = getDefaultForm();
	form_data.value.base.name = rule_type_name_map.value.get(rule_type.value)?.alias ?? "";
}

function getRuleSettingEditData(data: AlarmRuleArchivesData) {
	const special_obj = JSON.parse(data.base.special_json ?? "{}");
	const alarm_list = Object.keys(ALARM_LEVEL_NUMBER).filter((key) => Number(key)).flatMap((key: any) => {
		const item = special_obj[ALARM_LEVEL_NUMBER[key]];
		const {alarm_setting_label_key} = form_config.value;
		// 忽略该level级别的告警
		const ignore_alarm_level = Object.values(item ?? {}).every((val) => val === null);
		if (ignore_alarm_level) return [];
		// 系统默认规则的alarm_setting接口返回的都是null，要处理成""
		let alarm_setting = "";
		if (alarm_setting_label_key) {
			alarm_setting = item[alarm_setting_label_key] != null ? String(normalizeRuleAlarmSetting(item[alarm_setting_label_key], item.unit_name, "unit")) : "";
		}
		return [{
			level: ALARM_LEVEL_NUMBER[key] as AlarmSettingItem["level"],
			init_form: {
				alarm_setting,
				push_message: item.message_select_type,
				has_level: item.has_level,
				message_content: item.message_content,
				unit: item.unit_name,
				disabled: false,
			}
		}];
	});
	return {
		gather_radius: special_obj.dis === undefined ? undefined : String(special_obj.dis),
		gather_dur_time: special_obj.dur_time === undefined ? undefined : String(special_obj.dur_time),
		enter_require: special_obj.enter_require,
		merge_area: special_obj.merge_area,
		alarm_list
	};
}
function getApplyMapEditData(data: AlarmRuleArchivesData) {
	const {is_all_map, area_ids_inverse, areas} = data.base;
	const special_obj = JSON.parse(data.base.special_json ?? "{}");
	const map_table_data = (areas || []).map((item) => ({
		map_name: item.map,
		area_name: item.area_name,
		area_id: item.area_id,
		area_type: item.type,
		rule_group_name: item.group_name,
		is_use: item.is_use,
		scene_id: special_obj.scene_id as number | undefined
	}));

	return {
		map_scope: is_all_map,
		is_inverse: area_ids_inverse,
		map_table_data
	};
}
function getApplyObjectEditData(data: AlarmRuleArchivesData, key?: "hazard_source" | "accompany") {
	const {applicable_object, uuids_inverse, unbind_alarm} = data.base;
	const {person, visitor, truck, material, contractor, card_type} = key ? data.base[key]!.applicable_objects : data.applicable_objects;
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
	const card_type_checked_list = [
		...(card_type?.card_type || []).map((item) => ({...item, type: SHUTTLE_TYPE.card_type})),
	];
	return {
		apply_object_type: applicable_object,
		apply_object_alarm: uuids_inverse,
		apply_object_unbind: unbind_alarm,
		apply_person: person?.all_person ? APPLY_PERSON.all : person_checked_list.length ? APPLY_PERSON.custom : APPLY_PERSON.none,
		apply_person_checked_list: person_checked_list,
		apply_truck: truck?.all_truck ? APPLY_TRUCK.all : truck_checked_list.length ? APPLY_TRUCK.custom : APPLY_TRUCK.none,
		apply_truck_checked_list: truck_checked_list,
		apply_visitor: visitor?.all_visitor ? APPLY_VISITOR.all : visitor_checked_list.length ? APPLY_VISITOR.custom : APPLY_VISITOR.none,
		apply_visitor_checked_list: visitor_checked_list,
		apply_material: material?.all_material ? APPLY_MATERIAL.all : material_checked_list.length ? APPLY_MATERIAL.custom : APPLY_MATERIAL.none,
		apply_material_checked_list: material_checked_list,
		apply_contractor: contractor?.all_contractor ? APPLY_CONTRACTOR.all : contractor_checked_list.length ? APPLY_CONTRACTOR.custom : APPLY_CONTRACTOR.none,
		apply_contractor_checked_list: contractor_checked_list,
		apply_card_type: card_type?.all_card_type ? APPLY_CARD_TYPE.all : APPLY_CARD_TYPE.custom,
		apply_card_type_checked_list: card_type_checked_list,
	};
}
function getEffectScheduleEditData(data: AlarmRuleArchivesData) {
	const {start_time, end_time, day_json, time_json} = data.base;
	const day_obj = JSON.parse(day_json);
	const time_list = (JSON.parse(time_json) || []).map(([start, end]: number[]) => {
		const start_timestamp = normalizeHMS(new Date(), "start").getTime() + start * 1000;
		const end_timestamp = normalizeHMS(new Date(), "start").getTime() + end * 1000;
		return [start_timestamp, end_timestamp];
	});
	const time_custom = time_list.slice(-1)[0]?.map((time: number) => new Date(time)) ?? [];
	return {
		effect_date_select: start_time === 0 || end_time === 0 ? EFFECT_DATE.all : EFFECT_DATE.custom,
		effect_date_custom: start_time === 0 || end_time === 0 ? [] : [new Date(start_time * 1000), new Date(end_time * 1000)],
		effect_week_select: day_json === null ? EFFECT_WEEK.all : EFFECT_WEEK.custom,
		effect_week_custom: day_obj ?? [],
		effect_time_select: time_list.length === 0 ? EFFECT_TIME.all : EFFECT_TIME.custom,
		effect_time_custom: time_custom,
		effect_time_list: time_list
	};
}
function setEditFormData(data: AlarmRuleArchivesData) {
	const {type, is_use, name, rule_group_id, comment, alarm_manual_handling_setting} = data.base;
	const base: FormData["base"] = {
		type,
		is_use,
		name,
		rule_group_id: rule_group_id ? rule_group_id : undefined,
		remark: comment,
	};

	form_data.value = {
		base,
		rule_setting: getRuleSettingEditData(data),
		apply_map: getApplyMapEditData(data),
		apply_object: getApplyObjectEditData(data),
		effect_schedule: getEffectScheduleEditData(data),
		handling_alarm: {
			is_required: alarm_manual_handling_setting
		}
	};
	if (rule_type.value === ALARM_RULE_TYPE.hazard_source) {
		form_data.value.hazard_source_apply_object = getApplyObjectEditData(data, "hazard_source");
	}
	if (rule_type.value === ALARM_RULE_TYPE.accompany) {
		form_data.value.accompany_apply_object = getApplyObjectEditData(data, "accompany");
	}
}

function changeRuleConfig(type: ALARM_RULE_TYPE) {
	rule_type.value = type;
	const {form_config: rule_form_config, menus: anchor_menus} = ALARM_RULE_CONFIG[type];
	menus.value = anchor_menus;
	form_config.value = rule_form_config;
}

function changeRuleType(type: ALARM_RULE_TYPE) {
	clearValidate();
	changeRuleConfig(type);
	setDefaultFormData();
}

function closeDialog() {
	clearValidate();
	emits("input", false);
}

async function saveConfirmBox() {
	if (props.mode === "add") return true;
	const tip_list: string[] = [];
	if (base_form.value?.isTriggerConfirmBox()) {
		const tip = rule_type.value === ALARM_RULE_TYPE.work_timeout ? "“禁用”规则后，此规则下“告警状态”为“告警中”的告警不结束；" : "“禁用”规则后，将导致此规则下“告警状态”为“告警中”的告警结束；";
		tip_list.push(tip);
	}

	if (apply_map.value?.isTriggerConfirmBox()) {
		tip_list.push("删除某“适用地图范围”后，将导致此规则下触发此“适用地图范围”且“告警状态”为“告警中”的告警结束；");
	}

	if (apply_object.value?.isTriggerConfirmBox() || hazard_source_apply_object.value?.isTriggerConfirmBox() || accompany_apply_object.value?.isTriggerConfirmBox()) {
		tip_list.push("删除某“适用对象”后，将导致此规则下此“适用对象”触发且“告警状态”为“告警中”的告警结束；");
	}

	if (effect_schedule.value?.isTriggerConfirmBox()) {
		tip_list.push("修改“生效时间”后，将导致此规则下触发的告警按照最新的生效时间更新“告警状态”。");
	}

	const content_message = tip_list.length === 1 ? tip_list[0] : tip_list.map((tip, index) => `${index + 1}、${tip}`).join("<br>");

	if (tip_list.length) {
		return FkMessageBox.confirm("保存", "确定保存？", `${content_message}<br><br>请谨慎操作。`);
	}
	return true;
}

function clearValidate() {
	base_form.value?.clearValidate();
	rule_setting.value?.clearValidate();
	effect_schedule.value?.clearValidate();
}

async function verifyForm() {
	const pass_list = await Promise.all([
		base_form.value?.verifyForm() ?? Promise.resolve(true),
		rule_setting.value?.verifyForm() ?? Promise.resolve(true),
		effect_schedule.value?.verifyForm() ?? Promise.resolve(true)
	]);

	return pass_list.every((is_pass) => is_pass);
}

async function handleSave() {
	const {id} = props;
	startSaveLoading();
	const is_pass = await verifyForm();
	if (!is_pass) return endSaveLoading();
	const params: AddAlarmRuleParams = {
		...(base_form.value?.getApiParams() ?? {}),
		...(rule_setting.value?.getApiParams() ?? {}),
		...(apply_map.value?.getApiParams() ?? {}),
		...(apply_object.value?.getApiParams() ?? {}),
		...(effect_schedule.value?.getApiParams() ?? {}),
		...(handling_alarm.value?.getApiParams() ?? {}),
	};
	if (hazard_source_apply_object.value) {
		const hazard_source_params = hazard_source_apply_object.value!.getApiParams();
		const special_obj = JSON.parse(params.special_json);
		special_obj.type_things_json = JSON.parse(hazard_source_params.type_things_json);
		special_obj.special_uuids_inverse = hazard_source_params.uuids_inverse;
		const {uuid_list, branch_id_list, person_class_id_list, duty_id_list, work_type_id_list, truck_type_id_list, material_type_id_list, contractor_unit_id_list, contractor_work_type_id_list} = hazard_source_params;
		params.hazard_source = {
			uuid_list,
			branch_id_list,
			person_class_id_list,
			duty_id_list,
			work_type_id_list,
			truck_type_id_list,
			material_type_id_list,
			contractor_unit_id_list,
			contractor_work_type_id_list
		};
		params.special_json = JSON.stringify(special_obj);
	}
	if (accompany_apply_object.value) {
		// 被陪同放在accompany字段中
		const accompany_params = accompany_apply_object.value!.getApiParams();
		const special_obj = JSON.parse(params.special_json);
		special_obj.type_things_json = JSON.parse(accompany_params.type_things_json);
		special_obj.special_uuids_inverse = accompany_params.uuids_inverse;
		const {uuid_list, branch_id_list, person_class_id_list, duty_id_list, work_type_id_list, truck_type_id_list, material_type_id_list, contractor_unit_id_list, contractor_work_type_id_list} = accompany_params;
		params.accompany = {
			uuid_list,
			branch_id_list,
			person_class_id_list,
			duty_id_list,
			work_type_id_list,
			truck_type_id_list,
			material_type_id_list,
			contractor_unit_id_list,
			contractor_work_type_id_list
		};
		params.special_json = JSON.stringify(special_obj);
	}
	if ((rule_type.value === ALARM_RULE_TYPE.pit_overcrowded || rule_type.value === ALARM_RULE_TYPE.pit_shortage) && params.area_id_list?.length) {
		// 出入口超限/缺员的area_id_list要放在special_json的scene_id里面
		const scene_id = params.area_id_list.pop();
		const special_obj = JSON.parse(params.special_json);
		special_obj.scene_id = scene_id;
		params.special_json = JSON.stringify(special_obj);
	}
	const is_confirm = await saveConfirmBox().catch(() => false);
	if (!is_confirm) return endSaveLoading();
	if (id) {
		const {data: res} = await editAreaAlarmRule({...params, id}).catch(() => ({data: undefined}));
		endSaveLoading();
		if (res?.type === 1) {
			Notification.success({title: "成功", message: "更新成功"});
			emits("save-success", id);
			emits("input", false);
		} else {
			Notification.error({title: "错误", message: res?.result || "更新失败"});
		}
	} else {
		const {data: res} = await addAreaAlarmRule(params).catch(() => ({data: undefined}));
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
	const {mode} = props;
	if (mode === DIALOG_MODE.edit) {
		clearValidate();
		fetchAlarmRuleData();
	}
}

async function fetchAlarmRuleData() {
	const {data: res} = await getRuleArchives<AlarmRuleArchivesData>({id: props.id!, type: 1}).catch(() => ({data: undefined}));
	endLoading();
	if (res?.type === 1) {
		changeRuleConfig(res.result.base.type);
		setEditFormData(res.result);
		return res.result;
	} else {
		Notification.error({title: "错误", message: res?.result as unknown as string || "查询规则档案失败"});
	}
}

async function fetchAlarmConfig() {
	const {data: res} = await getAlarmConfiguration().catch(() => ({data: undefined}));
	if (res?.type === 1) {
		alarm_config_list.value = res.result.data;
	}
}
</script>

<style scoped>
.alarm-rule-dialog :deep(.el-select .el-select-dropdown) {
	position: absolute !important;
	top: auto !important;
	left: 0px !important;
}
</style>
