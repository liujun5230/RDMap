<template>
<el-form
	ref="form_ref"
	class="base-form"
	size="small"
	:model="form_data"
	:rules="rules"
	:disabled="disabled"
	inline
	label-position="top"
>
	<el-form-item
		label="规则类型"
		prop="type"
	>
		<template #label>
			<span class="required-form-item-label">规则类型</span>
		</template>
		<template #default>
			<el-select
				v-model="form_data.type"
				:popper-append-to-body="false"
				:disabled="mode !== 'add'"
				@change="changeRuleType"
			>
				<el-option
					v-for="item in alarm_rule_type_options"
					:key="item.value"
					:label="item.label"
					:value="item.value"
				/>
			</el-select>
		</template>
	</el-form-item>
	<el-form-item
		prop="is_use"
		class="use-form-item"
	>
		<template #label>
			<span style="display: inline-flex;align-items: center;">
				<span class="required-form-item-label">启用状态</span>
				<fk-icon
					:tip="formConfig.enable_icon_tip"
					size="16"
				>
					<warning-icon />
				</fk-icon>
			</span>
		</template>
		<template #default>
			<el-select
				v-model="form_data.is_use"
				:popper-append-to-body="false"
			>
				<el-option
					label="启用"
					:value="1"
				/>
				<el-option
					label="禁用"
					:value="0"
				/>
			</el-select>
		</template>
	</el-form-item>
	<el-form-item
		label="规则名称"
		prop="name"
	>
		<el-input
			v-model="form_data.name"
			show-word-limit
			:maxlength="20"
			placeholder="请输入"
		/>
	</el-form-item>
	<el-form-item
		label="规则分组"
		prop="rule_group_id"
	>
		<el-select
			v-model="form_data.rule_group_id"
			:popper-append-to-body="false"
			clearable
		>
			<el-option
				v-for="item in rule_group_options"
				:key="item.value"
				:label="item.label"
				:value="item.value"
			/>
		</el-select>
	</el-form-item>
	<el-form-item
		label="备注"
		prop="remark"
	>
		<el-input
			v-model="form_data.remark"
			type="textarea"
			placeholder="请输入"
			:rows="4"
			show-word-limit
			:maxlength="100"
			resize="none"
		/>
	</el-form-item>
</el-form>
</template>

<script setup lang="ts">
import type {Form as ElForm} from "element-ui";
import {storeToRefs} from "pinia";
import {ref, watch, computed, inject} from "vue";

import {ALARM_RULE_TYPE} from "@/utils/js/constant";
import {checkRuleName} from "@/api/area/alarmRule";
import {DIALOG_MODE} from "@/components/Dialog/constant";
import {useRuleTypeStore, useRuleGroupStore} from "@/store/useRuleStore";
import FkIcon from "@/components/ForThink/FkIcon.vue";
import WarningIcon from "~icons/operation/header-warning";

import {RuleIdProvideKey} from "./constant";
import type {FormData, FormConfig} from "./ruleConfig";

const emits = defineEmits<{
	(event: "change-rule-type", value: ALARM_RULE_TYPE): void,
}>();

interface Props {
	defaultFormData: FormData["base"],
	formConfig: FormConfig,
	disabled: boolean,
	mode: DIALOG_MODE,
}
const props = defineProps<Props>();

const rule_id = inject(RuleIdProvideKey);

const rules = {
	name: [
		{required: true, whitespace: true, message: "请输入规则名称", trigger: "blur"},
		{validator: verifyRuleName, trigger: "blur"}
	]
};
const form_data = ref<FormData["base"]>({} as FormData["base"]);
const form_ref = ref<InstanceType<typeof ElForm> | null>(null);

const select_text_color = computed(() => form_data.value.is_use ? "#67c23a" : "#f56c6c");

const {alarm_rule_type_options} = storeToRefs(useRuleTypeStore());
const {rule_group_options} = storeToRefs(useRuleGroupStore());

watch(() => props.defaultFormData, (new_form_data) => {
	form_data.value = {...new_form_data};
}, {
	immediate: true
});

function changeRuleType() {
	emits("change-rule-type", form_data.value.type);
}

async function verifyRuleName(rule: any, value: any, callback: any) {
	const {mode} = props;
	const params = {
		name: value,
		id: mode === DIALOG_MODE.edit ? rule_id!.value : undefined
	};
	const {data: res} = await checkRuleName(params).catch(() => ({data: undefined}));
	if (res?.type === 1) {
		const {check, msg} = res.result;
		check ? callback() : callback(new Error(msg));
	}
}

function clearValidate() {
	form_ref.value!.clearValidate();
}

async function verifyForm() {
	const is_pass = await form_ref.value!.validate().catch(() => false);
	return is_pass;
}

function getApiParams() {
	const {rule_group_id, remark, type, is_use, name} = form_data.value;
	return {
		type,
		is_use,
		name,
		rule_group_id: rule_group_id,
		comment: remark
	};
}

function isTriggerConfirmBox() {
	const {defaultFormData: default_form_data} = props;
	if (default_form_data.is_use !== form_data.value.is_use && form_data.value.is_use === 0) {
		return true;
	}
	return false;
}

defineExpose({
	clearValidate,
	verifyForm,
	getApiParams,
	isTriggerConfirmBox
});
</script>

<style scoped lang="scss">
.base-form.el-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px 16px;

    .el-form-item {
        margin: 0;

		.required-form-item-label {
			margin-right: 4px;

			&::before {
				content: "*";
				color: #f56c6c;
				margin-right: 4px;
			}
		}

        :deep(.el-form-item__label) {
            line-height: 1.15;
        }
    }

    .el-form-item:last-child {
        grid-column-start: 1;
        grid-column-end: 3;
    }

	.use-form-item .el-select {
		:deep(.el-input__inner) {
			color: v-bind("select_text_color")
		}
	}

    :deep(.el-select) {
        width: 100%;
    }
}
</style>
