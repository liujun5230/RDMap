<template>
<div class="rule-setting-form">
	<header class="rule-setting-form-header">
		<span :style="{color: ALARM_LEVEL_COLOR[level]}">{{ title }}</span>
		<fk-icon
			v-if="showDelButton"
			size="16"
			tip="删除"
			style="--text-color: #f56c6c;"
			:style="{cursor: disabled ? 'not-allowed' : 'pointer'}"
			@click="handleDelete"
		>
			<delete-icon />
		</fk-icon>
	</header>
	<el-form
		ref="rule_setting_form"
		size="small"
		:model="form_data"
		:rules="rules"
		:disabled="disabled"
		label-position="left"
		:label-width="formConfig.alarm_setting_label_width"
	>
		<el-form-item
			v-if="formConfig.alarm_setting_label"
			:label="formConfig.alarm_setting_label"
			prop="alarm_setting"
		>
			<el-input
				:value="form_data.alarm_setting"
				:disabled="formConfig.alarm_setting_disabled[level] || false"
				:placeholder="formConfig.alarm_setting_placeholder"
				@input="updateAlarmSetting"
			>
				<template #append>
					<el-select
						v-if="formConfig.alarm_setting_units.length > 1"
						v-model="form_data.unit"
						:popper-append-to-body="false"
					>
						<el-option
							v-for="item in formConfig.alarm_setting_units"
							:key="item.value"
							:label="item.label"
							:value="item.value"
						/>
					</el-select>
					<div v-else>
						{{ form_data.unit }}
					</div>
				</template>
			</el-input>
		</el-form-item>
		<el-form-item
			v-if="formConfig.show_push_message"
			class="push-message-form-item"
			prop="push_message"
		>
			<template #label>
				<span style="display: inline-flex;align-items: center;">
					<span class="required-form-item-label">推送文字消息</span>
					<fk-icon
						size="16"
						tip="若定位对象绑定的定位标签（硬件）不支持，则即使触发告警也无法在硬件上显示下发的文字内容。具体哪些型号的定位标签（硬件）支持下发此功能，请参照相关型号的硬件产品说明手册。"
					>
						<warning-icon />
					</fk-icon>
				</span>
			</template>
			<template #default>
				<el-select
					v-model="form_data.push_message"
					:popper-append-to-body="false"
				>
					<el-option
						label="跟随系统（开启/关闭）"
						:value="0"
					/>
					<el-option
						label="自定义（关闭）"
						:value="2"
					/>
					<el-option
						label="自定义（开启）"
						:value="1"
					/>
				</el-select>
				<el-checkbox
					v-if="show_has_level"
					v-model="form_data.has_level"
					:true-label="1"
					:false-label="0"
					:disabled="form_data.push_message === 0"
					style="margin-left: 16px;"
				/>
				<span
					v-if="show_has_level"
					style="margin-left: 4px;"
				>{{ `包含告警级别：【${title}】` }}</span>
				<div v-if="show_has_level && form_data.push_message === 0">
					{{ form_data.message_content }}
				</div>
			</template>
		</el-form-item>
		<el-form-item
			v-if="formConfig.show_push_message && form_data.push_message === 1"
			prop="message_content"
			class="message-content-form-item"
		>
			<el-input
				v-model="form_data.message_content"
				type="textarea"
				placeholder="请输入推送文字消息"
				:rows="3"
				show-word-limit
				:maxlength="28"
				resize="none"
			/>
		</el-form-item>
	</el-form>
</div>
</template>

<script setup lang="ts">
import {ref, computed, watch, toRef, shallowRef} from "vue";
import type {Form as ElForm} from "element-ui";
import {storeToRefs} from "pinia";
import {merge} from "lodash-es";

import {useAlarmLevelStore} from "@/store/useAlarmStore";
import {DIALOG_MODE} from "@/components/Dialog/constant";
import FkIcon from "@/components/ForThink/FkIcon.vue";
import WarningIcon from "~icons/operation/header-warning";
import DeleteIcon from "~icons/operation/delete";
import {ALARM_RULE_TYPE, ALARM_LEVEL_COLOR} from "@/utils/js/constant";
import type {AlarmRuleResponseItem} from "@/api/alarm/configuration";

import {ALARM_LEVEL_NUMBER} from "./ruleConfig";
import type {AlarmSettingItem, FormConfig} from "./ruleConfig";

const emits = defineEmits<{
	(event: "delete"): void
}>();

type InitFormData = AlarmSettingItem["init_form"]
interface Props {
	level: AlarmSettingItem["level"],
	ruleType: ALARM_RULE_TYPE,
	initForm: InitFormData,
	showDelButton: boolean,
	formConfig: FormConfig,
	alarmConfig: Record<string, AlarmRuleResponseItem["configuration"]>,
	disabled: boolean,
	mode: DIALOG_MODE,
	allAlarmSetting: Record<string, number>
}
const props = defineProps<Props>();

const rule_setting_form = ref<InstanceType<typeof ElForm> | null>(null);
const form_data = ref<InitFormData>({} as InitFormData);
const show_has_level = ref(false);
type Rules = FormConfig["alarm_rules"];
const rules = shallowRef<Rules>({
	alarm_setting: [
		{required: true, whitespace: true, message: "请输入", trigger: "blur"},
		{validator: verifyAlarmSetting, trigger: "blur"},
	]
});

const title = computed(() => alarm_level_name_map.value[props.level]);

const {alarm_level_name_map} = storeToRefs(useAlarmLevelStore());

watch(() => props.initForm, (init_form) => {
	// 这里不解构，保持和RuleSetting的form_data值更新
	form_data.value = init_form;
}, {
	immediate: true
});

watch([() => form_data.value.push_message, toRef(props, "alarmConfig"), toRef(props, "ruleType")], () => {
	const {ruleType, level, alarmConfig} = props;
	const push_message = form_data.value.push_message;
	const rule_alarm_config = alarmConfig[`${ruleType}_${level}`];
	if (push_message === 0) {
		// 跟随系统，来源系统设置》告警规则配置的标签告警推送是否开启
		show_has_level.value = Boolean(rule_alarm_config?.message_publish_enable);
		// 跟随系统，来源系统设置》告警规则配置的推送告警级别是否开启
		form_data.value.has_level = (rule_alarm_config?.message_alarm_level_enable as 0 | 1) ?? 0;
		// 跟随系统的推送文字消息来源告警配置
		form_data.value.message_content = rule_alarm_config?.message_content ?? "";
	} else {
		show_has_level.value = push_message === 1;
		form_data.value.has_level = push_message === 1 ? 1 : 0;
	}
}, {immediate: true});

watch(() => props.formConfig, (new_form_config) => {
	rules.value = mergeAlarmRules(rules.value, new_form_config.alarm_rules);
}, {
	immediate: true
});

function mergeAlarmRules(target?: Rules, source?: Rules) {
	const real_target = target ?? {};
	const real_source = source ?? {};

	return merge(real_target, real_source);
}

function verifyAlarmSetting(rule: any, value: string, callback: any) {
	const {level, allAlarmSetting, formConfig} = props;
	const alarm_setting_rule = formConfig.alarm_setting_rule;
	const tips = getErrorTips(alarm_setting_rule, level, allAlarmSetting);
	tips ? callback(new Error(tips)) : callback();
}
function getErrorTips(rule_type: FormConfig["alarm_setting_rule"], level: Props["level"], all_alarm_setting: Props["allAlarmSetting"]) {
	const {[level]: cur_alarm_value, ...other_alarm_setting} = all_alarm_setting;
	const cur_level_number = ALARM_LEVEL_NUMBER[level];
	// 假如当前在B级输入框输入值，需要和A、C输入框的值进行比较
	for (const other_level of Object.keys(other_alarm_setting)) {
		const other_alarm_value = other_alarm_setting[other_level];
		const other_level_number = ALARM_LEVEL_NUMBER[other_level as Props["level"]];
		// 如果A、C输入框没有输入值，忽略这次校验
		if (Number.isNaN(other_alarm_value)) return "";
		// 只要B和A、C比较过程中有一个校验不通过，立即结束剩余的校验
		// 否则B和A校验不通过，但是B和C校验通过，最终返回tips为空，出现误判
		if (rule_type === "desc") {
			// A>B>C 验证通过
			if (cur_level_number < other_level_number) {
				if (cur_alarm_value <= other_alarm_value) return `${title.value}设置值需大于${alarm_level_name_map.value[other_level]}告警设置值`;
			} else {
				if (cur_alarm_value >= other_alarm_value) return `${title.value}设置值需小于${alarm_level_name_map.value[other_level]}告警设置值`;
			}
		} else if (rule_type === "asc") {
			// A<B<C 验证通过
			if (cur_level_number < other_level_number) {
				if (cur_alarm_value >= other_alarm_value) return `${title.value}设置值需小于${alarm_level_name_map.value[other_level]}告警设置值`;
			} else {
				if (cur_alarm_value <= other_alarm_value) return `${title.value}设置值需大于${alarm_level_name_map.value[other_level]}告警设置值`;
			}
		}
	}
	return "";
}

function updateAlarmSetting(value: string) {
	const {alarm_setting_update} = props.formConfig;
	const update_value = alarm_setting_update?.(value) ?? value;
	form_data.value.alarm_setting = update_value;
}

function handleDelete() {
	const {mode} = props;
	if (mode !== DIALOG_MODE.view) {
		emits("delete");
	}
}

function getFormData() {
	return {...form_data.value};
}

function clearValidate() {
	rule_setting_form.value!.clearValidate();
}

async function verifyForm() {
	const is_pass = await rule_setting_form.value!.validate().catch(() => false);
	return is_pass;
}

defineExpose({
	getFormData,
	clearValidate,
	verifyForm
});
</script>

<style scoped lang="scss">
.rule-setting-form {
	box-sizing: border-box;
	padding: 16px;
	background-color: #f8f9fa;

	.rule-setting-form-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 11px;
		margin-bottom: 16px;
		border-bottom: 1px solid #ebeef5;
	}

	.el-form {
		:deep(.el-form-item) {
			margin-bottom: 16px;
		}

		.push-message-form-item.el-form-item {
			margin-bottom: 10px;
		}

		.message-content-form-item.el-form-item {
			margin-bottom: 0;
		}

		:deep(.el-form-item__content .el-input) {
			width: 215px;

			.el-input-group__append {
				background-color: #fff;

				.el-select .el-input {
					width: 80px;

					.el-input__inner {
						border-top-left-radius: 0;
						border-bottom-left-radius: 0;
						border-left: none;
						border-color: #d1d8e1 !important;
					}
				}
			}
		}

		.required-form-item-label {
			margin-right: 4px;

			&::before {
				content: "*";
				color: #f56c6c;
				margin-right: 4px;
			}
		}
	}
}
</style>
