<template>
<div class="rule-setting">
	<el-form
		v-if="ruleType === ALARM_RULE_TYPE.gather || ruleType === ALARM_RULE_TYPE.forbidden_departure"
		ref="form_ref"
		class="rule-form"
		size="small"
		:model="form_data"
		:rules="rules"
		:disabled="disabled"
		label-position="left"
		inline
	>
		<el-form-item
			v-if="ruleType === ALARM_RULE_TYPE.gather"
			label="半径范围"
			prop="gather_radius"
		>
			<el-input
				:value="form_data.gather_radius"
				placeholder="请输入"
				@input="updateGatherRadius"
			>
				<template #append>
					<div>米</div>
				</template>
			</el-input>
		</el-form-item>
		<el-form-item
			v-if="ruleType === ALARM_RULE_TYPE.gather"
			prop="gather_dur_time"
		>
			<template #label>
				<span style="display:inline-flex;align-items:center;">
					<span>持续时长</span>
					<fk-icon
						size="16"
						style="margin-left: 4px;"
						tip="触发聚集告警规则判定后持续时长超过设置值，则触发聚集告警"
					>
						<question-icon />
					</fk-icon>
				</span>
			</template>
			<template #default>
				<el-input
					:value="form_data.gather_dur_time"
					placeholder="请输入"
					@input="updateGatherDurTime"
				>
					<template #append>
						<div>秒</div>
					</template>
				</el-input>
			</template>
		</el-form-item>
		<el-form-item
			v-if="ruleType === ALARM_RULE_TYPE.forbidden_departure"
			prop="enter_require"
		>
			<el-select
				v-model="form_data.enter_require"
				:popper-append-to-body="false"
			>
				<el-option
					label="包含未到“适用地图范围”的适用对象"
					:value="ENTER_REQUIRE.disable"
				/>
				<el-option
					label="仅含已到“适用地图范围”的适用对象"
					:value="ENTER_REQUIRE.enable"
				/>
			</el-select>
		</el-form-item>
		<el-form-item
			v-if="ruleType === ALARM_RULE_TYPE.forbidden_departure"
			prop="merge_area"
		>
			<el-select
				v-model="form_data.merge_area"
				:popper-append-to-body="false"
			>
				<el-option
					label="超过“离开未归时长”未返回离开区域"
					:value="MERGE_AREA.individual"
				/>
				<el-option
					label="超过“离开未归时长”未返回任一适用地图范围"
					:value="MERGE_AREA.overall"
				/>
			</el-select>
		</el-form-item>
	</el-form>

	<rule-setting-form
		v-for="(item, index) in form_data.alarm_list"
		ref="rule_setting_form_refs"
		:key="item.level"
		class="rule-setting-form-item"
		:show-del-button="index !== 0 && index === form_data.alarm_list.length - 1"
		:rule-type="ruleType"
		:level="item.level"
		:init-form="item.init_form"
		:form-config="formConfig"
		:alarm-config="alarm_config"
		:disabled="disabled"
		:mode="mode"
		:all-alarm-setting="all_alarm_setting"
		@delete="removeAlarmLevel"
	/>
	<label-button
		v-if="show_add_button"
		size="medium"
		:disabled="disabled"
		style="margin-top: 12px;"
		@click="addAlarmLevel"
	>
		添加告警级别
	</label-button>
</div>
</template>

<script setup lang="ts">
import {ref, computed, watch} from "vue";
import type {Form as ElForm} from "element-ui";

import {DIALOG_MODE} from "@/components/Dialog/constant";
import FkIcon from "@/components/ForThink/FkIcon.vue";
import QuestionIcon from "~icons/operation/header-question";
import LabelButton from "@/components/Button/LabelButton.vue";
import type {AlarmRuleResponseItem} from "@/api/alarm/configuration";
import {ALARM_RULE_TYPE} from "@/utils/js/constant";
import {filterNonNegativeFloat} from "@/utils/ts/common";

import RuleSettingForm from "./RuleSettingForm.vue";
import {normalizeRuleAlarmSetting} from "./tool";
import {ALARM_LEVEL_NUMBER, ENTER_REQUIRE, MERGE_AREA} from "./ruleConfig";
import type {FormData, FormConfig} from "./ruleConfig";

interface Props {
	ruleType: ALARM_RULE_TYPE,
	alarmConfigList: AlarmRuleResponseItem[],
	defaultFormData: FormData["rule_setting"],
	formConfig: FormConfig,
	handleAuth: boolean,
	deleteAuth: boolean,
	disabled: boolean,
	mode: DIALOG_MODE
}
const props = defineProps<Props>();

const rules = {
	gather_radius: [
		{required: true, whitespace: true, message: "请输入半径范围", trigger: "blur"}
	],
	gather_dur_time: [
		{required: true, whitespace: true, message: "请输入持续时长", trigger: "blur"}
	]
};
const form_ref = ref<InstanceType<typeof ElForm> | null>(null);
const form_data = ref<FormData["rule_setting"]>({} as FormData["rule_setting"]);
const rule_setting_form_refs = ref<InstanceType<typeof RuleSettingForm>[]>([]);

const show_add_button = computed(() => props.formConfig.alarm_level_num > 1 && form_data.value.alarm_list.length < props.formConfig.alarm_level_num);
const alarm_config = computed(() => {
	return props.alarmConfigList.reduce((result: Record<string, AlarmRuleResponseItem["configuration"]>, item) => {
		if (ALARM_RULE_TYPE[item.rule_type_id]) {
			const key = `${item.rule_type_id}_${item.configuration.alarm_level_value}`;
			result[key] = item.configuration;
		}
		return result;
	}, {} as Record<string, AlarmRuleResponseItem["configuration"]>);
});
// A/B/C告警级别对应的告警设置值
const all_alarm_setting = computed(() => {
	return form_data.value.alarm_list.reduce((result: Record<string, number>, {level, init_form}) => {
		const {alarm_setting, unit} = init_form;
		result[level] = normalizeRuleAlarmSetting(parseFloat(alarm_setting), unit, "second");
		return result;
	}, {} as Record<string, number>);
});

watch(() => props.defaultFormData, (new_form_data) => {
	form_data.value = {...new_form_data, alarm_list: [...new_form_data.alarm_list]};
}, {
	immediate: true
});

function updateGatherRadius(value: string) {
	form_data.value.gather_radius = filterNonNegativeFloat(value);
}

function updateGatherDurTime(value: string) {
	form_data.value.gather_dur_time = value.replace(/[^\d]*/g, "");
}

function addAlarmLevel() {
	const {alarm_level_num, alarm_setting_units} = props.formConfig;
	if (form_data.value.alarm_list.length < alarm_level_num) {
		const cur_max_level = form_data.value.alarm_list.slice(-1)[0].level;
		const next_level_number = parseInt(ALARM_LEVEL_NUMBER[cur_max_level as any]) + 1;
		const level = ALARM_LEVEL_NUMBER[next_level_number] as "a" | "b" | "c";
		form_data.value.alarm_list.push({
			level,
			init_form: {
				alarm_setting: "",
				push_message: 0,
				has_level: 0,
				message_content: "",
				unit: alarm_setting_units[0]?.value ?? ""
			}
		});
	}
}
function removeAlarmLevel() {
	form_data.value.alarm_list.pop();
}

function getApiParams() {
	const special_obj: Record<string, any> = {};
	const {ruleType} = props;
	const {alarm_setting_label_key, show_push_message} = props.formConfig;
	const {gather_dur_time, gather_radius, enter_require, merge_area} = form_data.value;
	const all_levels = Object.values(ALARM_LEVEL_NUMBER).filter((val) => typeof val === "number") as number[];
	all_levels.forEach((level, index) => {
		const component = rule_setting_form_refs.value[index];
		const special_key = component?.level;
		if (special_key) {
			const {alarm_setting, push_message, has_level, message_content, unit} = component.getFormData();
			special_obj[special_key] = {
				message_select_type: show_push_message ? push_message : 2, // 如果隐藏推送文字消息，强制自定义关闭
				has_level,
				message_content,
				unit_name: unit
			};
			if (alarm_setting_label_key) {
				special_obj[special_key][alarm_setting_label_key] = normalizeRuleAlarmSetting(parseFloat(alarm_setting), unit, "second");
			}
		} else {
			const special_key = ALARM_LEVEL_NUMBER[level];
			special_obj[special_key] = {
				message_select_type: null,
				has_level: null,
				message_content: null,
				unit_name: null
			};
			alarm_setting_label_key && (special_obj[special_key][alarm_setting_label_key] = null);
		}
	});
	if (ruleType === ALARM_RULE_TYPE.gather) {
		special_obj.dur_time = parseFloat(gather_dur_time!);
		special_obj.dis = parseFloat(gather_radius!);
	}
	if (ruleType === ALARM_RULE_TYPE.forbidden_departure) {
		special_obj.enter_require = enter_require;
		special_obj.merge_area = merge_area;
	}
	return {
		special_json: JSON.stringify(special_obj)
	};
}

function clearValidate() {
	form_ref.value?.clearValidate();
	rule_setting_form_refs.value.map((component) => component.clearValidate());
}

async function verifyForm() {
	const pass_list = await Promise.all([
		form_ref.value?.validate()?.catch(() => false) ?? Promise.resolve(true),
		...rule_setting_form_refs.value.map((component) => component.verifyForm())
	]);
	return pass_list.every((is_pass) => is_pass);
}

defineExpose({
	getApiParams,
	clearValidate,
	verifyForm
});
</script>

<style scoped lang="scss">
.rule-setting {
	.rule-form.el-form {
		display: flex;
		column-gap: 16px;
		align-items: center;
		margin-bottom: 16px;

		:deep(.el-form-item) {
			margin: 0;
			flex: 0 1 50%;
			display: flex;

			.el-form-item__label {
				flex: 0 0 auto;
			}
		}

		:deep(.el-form-item__content) {
			width: 100%;

			.el-input .el-input-group__append {
				padding: 0 12px;
				background-color: #fff;
			}

			.el-select {
				width: 100%;
			}
		}
	}

	.rule-setting-form-item {
		margin-bottom: 16px;
	}
}
</style>
