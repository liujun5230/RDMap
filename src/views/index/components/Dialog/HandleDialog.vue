<template>
<base-dialog
	:value="value"
	custom-class="handle-dialog"
	width="456px"
	height="264px"
	title="处理"
	:show-footer="handleAuth"
	:is-home="true"
	v-on="$listeners"
	@open="handleOpen"
	@opened="handleOpened"
	@close="closeDialog()"
	@positive-click="handleSave"
>
	<div class="handle-dialog-body">
		<el-form
			ref="form"
			class="fk-index-form"
			:model="form_data"
			:rules="rules"
			:disabled="!handleAuth"
		>
			<el-form-item
				prop="comment"
				label="处理内容"
			>
				<el-input
					ref="comment_ref"
					v-model="form_data.comment"
					class="textarea-input fk-index-input"
					type="textarea"
					rows="4"
					maxlength="100"
					show-word-limit
					resize="none"
				/>
			</el-form-item>
		</el-form>
	</div>
</base-dialog>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";
import type {Form as ElForm, Input as ElInput} from "element-ui";

import BaseDialog from "@/components/Dialog/BaseDialog.vue";

const emits = defineEmits<{
	(event: "save", value: FormData): void,
	(event: "input", value: boolean): void
}>();

interface Props {
	value: boolean,
	handleAuth: boolean
	required?: boolean,
	comment?: string,
	commentKey?: string,
}
const props = withDefaults(defineProps<Props>(), {
	required: false,
	comment: "",
	commentKey: "comment",
});

interface FormData {
	comment: string
}
const form_data = ref(getDefaultFormData());
const form = ref<InstanceType<typeof ElForm> | null>(null);
const comment_ref = ref<InstanceType<typeof ElInput> | null>(null);

const rules = computed(() => {
	const is_required = props.required;
	return is_required ? {
		comment: [
			{required: true, message: "处理内容不能为空，请输入", trigger: "blur"}
		]
	} : undefined;
});

function getDefaultFormData(): FormData {
	return {
		comment: ""
	};
}

function closeDialog() {
	form.value?.clearValidate();
	emits("input", false);
}

function handleOpen() {
	form_data.value.comment = props.comment;
}
function handleOpened() {
	comment_ref.value?.focus();
}

async function handleSave() {
	const is_pass = await form.value!.validate().catch(() => false);
	if (is_pass) {
		emits("save", form_data.value);
	}
}
</script>

<style scoped lang="scss">
.handle-dialog-body {
	padding: 16px 16px 24px;

	:deep(.el-form) {
		.el-form-item__label {
			line-height: 1;
			margin-bottom: 10px;
		}

		.el-form-item:last-child {
			margin-bottom: 0;
		}
	}
}

.textarea-input{
	line-height: normal;
}
</style>
