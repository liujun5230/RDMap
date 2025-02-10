<template>
<base-dialog
	v-bind="$attrs"
	:title="$attrs.mode === 'add' ? '新增单灯控制规则' : '规则名称'"
	width="456px"
	height="668px"
	custom-class="traffic-rule-dialog"
	:show-footer="true"
	:is-home="true"
	:positive-button-loading="save_btn_loading"
	:can-change-mode="auth.handle"
	v-on="$listeners"
	@opened="handleOpened"
	@negative-click="handleNegativeClick"
	@positive-click="handlePositiveClick"
>
	<el-form
		ref="form_ref"
		:model="form_data"
		:rules="rules"
		:disabled="$attrs.mode === 'view'"
		label-position="top"
		size="medium"
		class="fk-index-form traffic-rule-form"
	>
		<el-form-item
			prop="rule_name"
			label="规则名称"
		>
			<el-input
				v-model="form_data.rule_name"
				class="fk-index-input"
				placeholder="请输入规则名称"
				maxlength="20"
				show-word-limit
			/>
		</el-form-item>
		<el-form-item
			prop="device_name"
			label="设备名称"
		>
			<el-input
				v-model="form_data.device_name"
				class="fk-index-input"
				placeholder="请输入规则名称"
				maxlength="20"
				show-word-limit
				disabled
			/>
		</el-form-item>
		<el-form-item
			prop="left_light"
			label="左转灯"
		>
			<light-select v-model="form_data.left_light" />
		</el-form-item>
		<el-form-item
			prop="straight_light"
			label="直行灯"
		>
			<light-select v-model="form_data.straight_light" />
		</el-form-item>
		<el-form-item
			prop="right_light"
			label="右转灯"
		>
			<light-select v-model="form_data.right_light" />
		</el-form-item>
		<el-form-item
			prop="effect_start"
			label="生效开始时间"
		>
			<fk-date-picker
				:value="form_data.effect_start"
				type="datetime"
				class="fk-index-date"
				popper-class="fk-index-date-panel effect-date-panel"
				format="yyyy-MM-dd HH:mm:ss"
				placeholder="请选择日期时间"
				:use-cache="false"
				:clearable="true"
				:editable="false"
				:picker-options="effect_start_picker_options"
				@input="updateEffectDate($event, 'start')"
			/>
		</el-form-item>
		<el-form-item
			prop="effect_end"
			label="生效结束时间"
		>
			<fk-date-picker
				:value="form_data.effect_end"
				type="datetime"
				class="fk-index-date"
				popper-class="fk-index-date-panel effect-date-panel"
				format="yyyy-MM-dd HH:mm:ss"
				placeholder="请选择日期时间"
				:use-cache="false"
				:clearable="true"
				:editable="false"
				:picker-options="effect_end_picker_options"
				@input="updateEffectDate($event, 'end')"
			/>
		</el-form-item>
	</el-form>
</base-dialog>
</template>

<script setup lang="ts">
import {ref, useAttrs} from "vue";
import {useDateFormat} from "@vueuse/core";
import type {Form as ElForm} from "element-ui";
import {Notification} from "element-ui";

import {useLoading} from "@/composable/useLoading";
import BaseDialog from "@/components/Dialog/BaseDialog.vue";
import FkDatePicker from "@/components/ForThink/Form/FkDatePicker.vue";
import {DIALOG_MODE} from "@/components/Dialog/constant";
import {LIGHT} from "@/utils/js/constant";
import {normalizeHMS} from "@/utils/js/dateShortcuts";
import {addVoiceLightRule, updateVoiceLightRule, getVoiceLightRule, validateVoiceLightRule} from "@/api/device/record";

import LightSelect from "./LightSelect.vue";
import {usePageAuth} from "@/utils/js/authentication";

const emits = defineEmits<{
	(event: "input", value: boolean): void,
	(event: "save-success"): void
}>();

interface Props {
	deviceName?: string,
	deviceId?: string,
	addrId?: number | string,
	ruleId?: number,
	leftEnableStatus?: 0 | 1,
	straightEnableStatus?: 0 | 1,
	rightEnableStatus?: 0 | 1,
}
const props = withDefaults(defineProps<Props>(), {
	deviceName: "",
	deviceId: "",
	addrId: 0,
	ruleId: 0,
	leftEnableStatus: 1,
	straightEnableStatus: 1,
	rightEnableStatus: 1,
});

const attrs = useAttrs();

const rules = {
	rule_name: [
		{required: true, whitespace: true, message: "请输入", trigger: "blur"},
	],
	device_name: [
		{required: true, whitespace: true, message: "请输入", trigger: "blur"},
		{validator: verifyDeviceName, trigger: "blur"},
	],
	effect_start: [
		{required: true, message: "请选择生效开始时间", trigger: "blur"},
		{validator: verifyEffectStart, trigger: "blur"},
	],
	effect_end: [
		{required: true, message: "请选择生效结束时间", trigger: "blur"},
		{validator: verifyEffectEnd, trigger: "blur"},
	]
};
let opened_date = new Date();

interface FormData {
	rule_name: string,
	device_name: string,
	left_light: LIGHT,
	straight_light: LIGHT,
	right_light: LIGHT,
	effect_start: Date | null,
	effect_end: Date | null
}
const form_data = ref(getDefaultFormData());
const form_ref = ref<InstanceType<typeof ElForm> | null>(null);

const effect_start_picker_options = ref({
	disabledDate,
	selectableRange: "00:00:00 - 23:59:59"
});
const effect_end_picker_options = ref({
	disabledDate,
	selectableRange: "00:00:00 - 23:59:59"
});

const {loading: save_btn_loading, startLoading: startSaveBtnLoading, endLoading: endSaveBtnLoading} = useLoading();

const auth = usePageAuth("/deviceManage#/setting");
console.log(auth.value);

function getDefaultFormData(): FormData {
	const {leftEnableStatus, straightEnableStatus, rightEnableStatus} = props;
	return {
		rule_name: "",
		device_name: props.deviceName,
		left_light: leftEnableStatus ? LIGHT.GREEN : LIGHT.NOT_EXISTS,
		straight_light: straightEnableStatus ? LIGHT.GREEN : LIGHT.NOT_EXISTS,
		right_light: rightEnableStatus ? LIGHT.GREEN : LIGHT.NOT_EXISTS,
		effect_start: null,
		effect_end: null
	};
}

function disabledDate(date: Date) {
	const opened_date_start = normalizeHMS(new Date(opened_date), "start");
	return date.getTime() < opened_date_start.getTime();
}

function updateEffectDate(date: Date | null, type: "start" | "end") {
	if (date === null) {
		if (type === "start") form_data.value.effect_start = null;
		if (type === "end") form_data.value.effect_end = null;
		return;
	}
	const date_start = normalizeHMS(new Date(date), "start");
	const opened_date_start = normalizeHMS(new Date(opened_date), "start");
	if (date_start.getTime() === opened_date_start.getTime()) {
		const opened_hm = useDateFormat(opened_date, "HH:mm").value;
		const selectable_range = `${opened_hm}:00 - 23:59:59`;
		if (type === "start") {
			effect_start_picker_options.value.selectableRange = selectable_range;
			// date的时分小于opened_hm，把effect_start重置为opened_hm
			form_data.value.effect_start = date.getTime() < opened_date.getTime() ? new Date(`${useDateFormat(opened_date, "YYYY-MM-DD HH:mm").value}:00`) : new Date(`${useDateFormat(date, "YYYY-MM-DD HH:mm").value}:00`);
		} else {
			effect_end_picker_options.value.selectableRange = selectable_range;
			form_data.value.effect_end = date.getTime() < opened_date.getTime() ? new Date(`${useDateFormat(opened_date, "YYYY-MM-DD HH:mm").value}:00`) : new Date(`${useDateFormat(date, "YYYY-MM-DD HH:mm").value}:59`);
		}
	} else {
		const selectable_range = "00:00:00 - 23:59:59";
		if (type === "start") {
			effect_start_picker_options.value.selectableRange = selectable_range;
			form_data.value.effect_start = new Date(`${useDateFormat(date, "YYYY-MM-DD HH:mm").value}:00`);
		} else {
			effect_end_picker_options.value.selectableRange = selectable_range;
			form_data.value.effect_end = new Date(`${useDateFormat(date, "YYYY-MM-DD HH:mm").value}:59`);
		}
	}
}

async function verifyDeviceName(rule: any, value: string, callback: any) {
	const {deviceId, addrId, ruleId} = props;
	const {effect_start, effect_end, device_name} = form_data.value;
	const params = {
		rule_id: ruleId ? ruleId : undefined,
		addr_id: addrId,
		name: device_name,
		code: deviceId,
		begin: effect_start ? Math.floor(effect_start.getTime() / 1000) : 0,
		end: effect_end ? Math.floor(effect_end.getTime() / 1000) : 0
	};
	const {data: res} = await validateVoiceLightRule(params).catch(() => ({data: undefined}));
	if (res?.type === 1) {
		return res.result.check ? callback() : callback(new Error(res.result.msg));
	} else {
		return callback(new Error(res?.result?.msg || res?.result || "接口失败"));
	}
}
function verifyEffectStart(rule: any, value: Date, callback: any) {
	const {effect_end} = form_data.value;
	if (!value) return callback("请选择生效开始时间");
	if (effect_end && value.getTime() >= effect_end.getTime()) return callback("生效开始时间必须小于生效结束时间");
	return callback();
}
function verifyEffectEnd(rule: any, value: Date, callback: any) {
	const {effect_start, effect_end} = form_data.value;
	if (!effect_start) return callback();
	if (!effect_end) return callback(new Error("请选择生效结束时间"));
	if (effect_start && effect_end.getTime() <= effect_start.getTime()) return callback("生效结束时间必须大于生效开始时间");
	return effect_end.getTime() - effect_start.getTime() > 8 * 3600000 ? callback(new Error("生效时段不能超过8小时，请重新选择")) : callback();
}

function clearValidate() {
	form_ref.value?.clearValidate();
}

function verifyForm() {
	const field_pass_list: boolean[] = [];
	form_ref.value!.validateField(["rule_name", "effect_start", "effect_end"], (msg) => {
		field_pass_list.push(!msg);
	});
	const is_field_pass = field_pass_list.every((is_pass) => is_pass);
	// 避免生效时间未填，校验device_name出现不合适的提示语，#17918
	if (is_field_pass) {
		return form_ref.value!.validate();
	} else {
		return Promise.reject(false);
	}
}

async function handleOpened() {
	opened_date = new Date();
	if (attrs.mode === "add") {
		form_data.value = getDefaultFormData();
	} else {
		form_data.value = await fetchRuleDetail();
	}
}

async function handleNegativeClick() {
	clearValidate();
	if (attrs.mode === DIALOG_MODE.edit) {
		form_data.value = await fetchRuleDetail();
	}
}

const notification_tip = {
	"000": "左转灯、直行灯、右转灯状态变化为“无”不可控制，请重新设置",
	"001": "左转灯、直行灯状态变化为“无”不可控制，请重新设置",
	"010": "左转灯、右转灯状态变化为“无”不可控制，请重新设置",
	"100": "直行灯、右转灯状态变化为“无”不可控制，请重新设置",
	"011": "左转灯状态变化为“无”不可控制，请重新设置",
	"101": "直行灯状态变化为“无”不可控制，请重新设置",
	"110": "右转灯状态变化为“无”不可控制，请重新设置",
	"111": "",
};
// 检测到左、直、右状态从启用变为无时，刷新下拉选项，并且弹窗提示
function checkLightStatus() {
	const {leftEnableStatus, straightEnableStatus, rightEnableStatus} = props;
	const {left_light, straight_light, right_light} = form_data.value;
	let left_key = 1;
	let straight_key = 1;
	let right_key = 1;
	if (left_light !== LIGHT.NOT_EXISTS && leftEnableStatus === 0) {
		form_data.value.left_light = LIGHT.NOT_EXISTS;
		left_key = 0;
	}
	if (straight_light !== LIGHT.NOT_EXISTS && straightEnableStatus === 0) {
		form_data.value.straight_light = LIGHT.NOT_EXISTS;
		straight_key = 0;
	}
	if (right_light !== LIGHT.NOT_EXISTS && rightEnableStatus === 0) {
		form_data.value.right_light = LIGHT.NOT_EXISTS;
		right_key = 0;
	}
	const key = `${left_key}${straight_key}${right_key}` as keyof typeof notification_tip;
	const tip = notification_tip[key];
	if (tip) {
		Notification.error({title: attrs.mode === "add" ? "新增失败" : "修改失败", message: tip});
	}
	return tip ? Promise.reject(false) : Promise.resolve(true);
}

async function handlePositiveClick() {
	const {deviceId, addrId, ruleId} = props;
	const {device_name, rule_name, left_light, straight_light, right_light, effect_start, effect_end} = form_data.value;
	const pass_list = await Promise.all([
		verifyForm(),
		checkLightStatus()
	]).catch(() => [false, false]);
	const is_pass = pass_list.every((is_pass) => is_pass);
	if (!is_pass) return;
	const params = {
		rule_name,
		left_light,
		straight_light,
		right_light,
		name: device_name,
		code: deviceId,
		addr_id: addrId,
		begin: Math.floor(effect_start!.getTime() / 1000),
		end: Math.floor(effect_end!.getTime() / 1000)
	};
	startSaveBtnLoading();
	if (attrs.mode === "add") {
		const {data: res} = await addVoiceLightRule(params).catch(() => ({data: undefined}));
		if (res?.type === 1) {
			Notification.success({title: "成功", message: "新增成功"});
			emits("input", false);
			emits("save-success");
		} else {
			Notification.error({title: "错误", message: res?.result || "新增失败"});
		}
	} else if (attrs.mode === "edit") {
		const {data: res} = await updateVoiceLightRule({...params, id_list: [ruleId]}).catch(() => ({data: undefined}));
		if (res?.type === 1) {
			Notification.success({title: "成功", message: "修改成功"});
			emits("input", false);
			emits("save-success");
		} else {
			Notification.error({title: "错误", message: res?.result || "修改失败"});
		}
	}
	endSaveBtnLoading();
}

async function fetchRuleDetail() {
	const {data: res} = await getVoiceLightRule({rule_id: props.ruleId}).catch(() => ({data: undefined}));
	if (res?.type === 1) {
		if (!res.result.data.length) return getDefaultFormData();
		const {rule_name, name, left_light, straight_light, right_light, begin, end} = res.result.data[0];
		return {
			rule_name,
			device_name: name,
			left_light,
			straight_light,
			right_light,
			effect_start: new Date(begin * 1000),
			effect_end: new Date(end * 1000)
		} as FormData;
	} else {
		return getDefaultFormData();
	}
}
</script>

<style>
.effect-date-panel.el-date-picker {
	.el-time-panel {
		width: 150px;
	}

	.el-time-spinner.has-seconds .el-time-spinner__wrapper {
		width: 50%;

		&:last-child {
			display: none;
		}
	}

	.el-picker-panel__footer .el-button--text {
		display: none;
	}
}
</style>
<style scoped>
:deep(.traffic-rule-dialog.home-base-dialog.el-dialog) {

	.traffic-rule-form {
		padding: 16px 20px 0;
		font-family: "DingTalk JinBuTi";
		color: var(--text-main-1);

		.el-form-item {
			margin-bottom: 20px;
		}
	}
}
</style>
