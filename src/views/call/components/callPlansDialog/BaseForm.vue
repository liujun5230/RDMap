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
		:label="type === 'plans' ? '点名计划名称' : '点名任务名称'"
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
		prop="is_use"
	>
		<template #label>
			<span style="display: inline-flex;align-items: center;">
				<span class="use-form-item-label">启用状态</span>
			</span>
		</template>
		<template #default>
			<el-select v-model="form_data.is_use">
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
</el-form>
</template>

<script setup lang="ts">
import {computed, ref, watch, inject} from "vue";
import type {Form as ElForm} from "element-ui";

import {checkRuleName} from "@/api/rollCall/rollCallRule";
import {DIALOG_MODE} from "@/components/Dialog/constant";

import type {FormData} from "./types";
import {RuleIdProvideKey} from "./constant";

interface Props {
	defaultFormData: FormData["base"],
	disabled: boolean,
	mode: DIALOG_MODE,
	type: "plans" | "task"
}
const props = defineProps<Props>();

const rule_id = inject(RuleIdProvideKey);

const rules = {
	name: [
		{required: true, whitespace: true, message: "请输入", trigger: "blur"},
		{validator: verifyRuleName, trigger: "blur"}
	]
};
const form_data = ref<FormData["base"]>(props.defaultFormData);
const form_ref = ref<InstanceType<typeof ElForm> | null>(null);

const select_text_color = computed(() => form_data.value.is_use ? "#67c23a" : "#f56c6c");

watch(() => props.defaultFormData, (new_form_data) => {
	form_data.value = {...new_form_data};
});

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
	const {is_use, name} = form_data.value;
	return {
		is_use,
		name,
	};
}

defineExpose({
	clearValidate,
	verifyForm,
	getApiParams
});
</script>

<style scoped lang="scss">
.base-form.el-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 16px;

	.use-form-item-label {
		margin-right: 4px;

		&::before {
			content: "*";
			color: #f56c6c;
			margin-right: 4px;
		}
	}

    .el-form-item {
        margin: 0;

        :deep(.el-form-item__label) {
            line-height: 1.15;
        }
    }

    :deep(.el-select) {
        width: 100%;

		.el-input__inner {
			color: v-bind("select_text_color")
		}
    }
}
</style>
