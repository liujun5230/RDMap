<template>
<div
	ref="material_dialog_ref"
	v-loading="tab_loading"
	width="489px"
	class="material-dialog"
>
	<form-submit-button
		v-if="!things_is_del && btn_handle_auth"
		:type="tab_type"
		:loading="save_loading"
		:is-show-panel="is_show_panel"
		@cancel="onCancel"
		@save="onSave"
		@edit="onEdit"
	/>

	<el-form
		ref="form_ref"
		:class="[theme === 'custom-theme-blue' ? 'blue' : 'green']"
		:model="form_data"
		:rules="rules"
		label-position="top"
		size="small"
		:disabled="disabled_form"
	>
		<el-row :gutter="16">
			<el-col :span="8">
				<el-form-item
					prop="serial_num"
					label="物资编号"
				>
					<el-input
						v-model="form_data.serial_num"
						placeholder="请输入物资编号"
					/>
				</el-form-item>
			</el-col>
			<el-col :span="8">
				<el-form-item
					prop="name"
					label="物资名称"
				>
					<el-input
						v-model="form_data.name"
						placeholder="请输入物资名称"
					/>
				</el-form-item>
			</el-col>
		</el-row>

		<dynamic-form
			ref="dynamic_form_ref"
			:form-items="dynamic_form_items"
			:disabled="disabled_form"
			:things-type="5"
			scroll-container=".material-dialog"
		/>
	</el-form>
</div>
</template>

<script setup>
import {
	getDynamicIconIdByIconFollowType, getDynamicModelIdByModelFollowType,
	getIconFollowTypeByDynamicIconId,
	getModelFollowTypeByDynamicModelId,
	getIconIdByDynamicIconId,
	getModelIdByDynamicModelId
} from "@/components/DynamicForm/utils";
import {Notification} from "element-ui";
import {cloneDeep} from "lodash-es";
import {ref, computed, inject, shallowRef, watch, onMounted, watchEffect} from "vue";

import {addMaterial, editMaterial, checkMaterialName} from "@/api/material/material";
import {formatterCellValue} from "@/views/material/material/composable/formatter";
import {useDynamicColumns} from "@/views/material/material/composable/useDynamicColumns";
import {useStore} from "@/store";
import DynamicForm from "@/components/DynamicForm/DynamicForm.vue";
import FormSubmitButton from "@/components/FormSubmitButtom.vue";

import {useSelectedType} from "../../../components/useSelectedType";
import {useScroll, useEventBus} from "@vueuse/core";
import {checkUrlRule} from "@/utils/ts/formRule";

const {getTypeId} = useSelectedType("material");

const material_dialog_ref = ref();
const {isScrolling, arrivedState} = useScroll(material_dialog_ref);

const theme = computed(() => useStore().getters.user_info.theme);
const is_show_panel = computed(() => isScrolling.value || !arrivedState.top);

const archive_info = inject("ARCHIVE_INFO");
const btn_handle_auth = inject("BTN_HANDLE_AUTH");
const things_is_del = ref(0);

const raw_dict = computed(() => useStore().getters.material_dict_items.filter(item => item.is_display));
const archive_uuid = inject("ARCHIVE_UUID");
const archive_card_id = inject("ARCHIVE_CARD");
const dialog_key = inject("DIALOG_KEY");

const tab_type = ref("add");
const disabled_form = computed(() => tab_type.value === "view");
onMounted(() => {
	scan_card_ref.value?.connect();
});

const checkNameRule = (rule, value, callback) => {
	checkUrlRule(checkMaterialName, {id: archive_uuid.value || undefined, name: value}, callback);
};

const rules = {
	serial_num: [
		{required: true, whitespace: true, message: "请输入物资编号", trigger: "blur"},
		{validator: checkNameRule, trigger: "blur"},
	],
	name: [
		{required: true, whitespace: true, message: "请输入物资名称", trigger: "blur"}
	],
};

const getDefaultFormData = () => ({serial_num: "", name: "", card_id: ""});
const form_ref = ref(null);
const form_data = ref(getDefaultFormData());
const dynamic_form_ref = ref(null);
const save_loading = ref(false);
const tab_loading = ref(false);
const scan_card_ref = ref(null);

const dynamic_columns = computed(() => useDynamicColumns(shallowRef(raw_dict)).value);
const dynamic_form_items = shallowRef([]);

function validateTextLength(max_length, message) {
	return (rule, value, callback) => {
		const validate_value = rule.whitespace ? value : value.trim();
		if (validate_value.length > max_length) {
			return callback(new Error(message));
		}
		return callback();
	};
}

function resetTabData() {
	save_loading.value = false;
	form_ref.value?.resetFields();
	dynamic_form_ref.value.resetDynamicForm();
	openDialog(cloneDeep(archive_info.value));
}

function openDialog(params) {
	if (tab_type.value !== "add") {
		form_data.value = {serial_num: params.serial_num, name: params.name, card_id: `${params.card_id}`};
	} else {
		form_data.value = getDefaultFormData();
	}
	dynamic_form_items.value = dynamic_columns.value.map(item => {
		let value = "";
		if (tab_type.value === "add" && item.label === "物资类型") {
			value = getTypeId() === -1 ? 1 : getTypeId();
		}

		if (tab_type.value === "add" && ["二维图标", "三维模型"].includes(item.label)) {
			value = -3;
		}

		if (tab_type.value !== "add") {
			value = formatterCellValue(params, item, false);
		}
		if (tab_type.value !== "add" && ["二维图标", "三维模型"].includes(item.label)) {
			value = item.label === "二维图标" ? getDynamicIconIdByIconFollowType(params.icon_follow_type, params.icon_id) : getDynamicModelIdByModelFollowType(params.model_follow_type, params.model_id);
		}

		return {
			prop: item.prop,
			name: item.label,
			value,
			type: item.type,
			rules: item.length,
			options: item.option ? item.option.map(({id, name}) => ({label: name, value: id})) : [],
			is_require: item.is_require,
			is_custom: !!item.name_is_delete || item.label === "备注",
		};
	});

	const [material_num_item, material_name_item] = raw_dict.value;
	// length 为 -1 表示不限制文本长度，预设字段默认最长不超过 100 个字符，自定义字段不超过 200 字符
	const serial_num_limit = material_num_item?.length === -1 ? 100 : material_num_item?.length;
	const name_limit = material_name_item?.length === -1 ? 100 : material_name_item?.length;
	rules.serial_num.push({validator: validateTextLength(serial_num_limit, `物资编号不能超过${serial_num_limit}个字符`), trigger: "blur"});
	rules.name.push({validator: validateTextLength(name_limit, `物资名称不能超过${name_limit}个字符`), trigger: "blur"});
}

// 保存
async function saveMaterial(params) {
	const requestFn = tab_type.value === "edit" ? editMaterial : addMaterial;
	save_loading.value = true;
	const response = requestFn(params);
	const {data: {result, type}} = await response;
	save_loading.value = false;
	if (type === 1) {
		const uuid = tab_type?.value === "edit" ? archive_info.value?.uuid : result;
		Notification({title: "成功", type: "success", message: tab_type?.value === "edit" ? "修改成功" : "新增成功"});
		useEventBus("update_info_" + dialog_key).emit(uuid);
	} else {
		Notification({title: "错误", type: "error", message: result || "接口异常"});
	}
}

function onCancel() {
	resetTabData();
	if (tab_type.value === "edit") {
		tab_type.value = "view";
	}
}

// 点击保存
async function onSave() {
	const [is_validate, dynamic_form_data] = await Promise.all([form_ref.value.validate(), dynamic_form_ref.value.validateDynamicForm()]).catch(() => []);
	if (is_validate && dynamic_form_data) {
		save_loading.value = true;
		const material_dict = Object.entries(dynamic_form_data.dict_json).reduce((result, [key, value]) => {
			const find_one = dynamic_columns.value.find(item => item.prop === key);
			let real_value = value;
			if (find_one.type === 5) {
				real_value = value ? [value] : [];
			}
			result[key] = real_value;
			return result;
		}, {});

		const emit_data = {
			...form_data.value,
			card_id: parseInt(archive_card_id.value),
			uuid: archive_info.value?.uuid,
			type: dynamic_form_data.type,
			icon_follow_type: getIconFollowTypeByDynamicIconId(dynamic_form_data.icon_id),
			model_follow_type: getModelFollowTypeByDynamicModelId(dynamic_form_data.model_id),
			icon_id: getIconIdByDynamicIconId(dynamic_form_data.icon_id),
			model_id: getModelIdByDynamicModelId(dynamic_form_data.model_id),
			picture: dynamic_form_data.picture,
			material_dict: material_dict
		};

		saveMaterial(emit_data);
	}
}

watch(() => archive_info.value, (value) => {
	if (value) {
		tab_type.value = "view";
		things_is_del.value = archive_info.value.is_delete;
		openDialog(cloneDeep(archive_info.value));
	}
}, {
	immediate: true
});

watchEffect(() => {
	if (archive_uuid.value === 0 && !archive_info.value) {
		tab_type.value = "add";
		openDialog({});
	}
});

function onEdit() {
	tab_type.value = "edit";
}
</script>

<style lang="scss" scoped>

.material-dialog {
	padding: 1rem 1rem 0 1rem;
	overflow-y: auto;
	.form-item-title {
		margin-bottom: 1rem;
	}
	.btn_open_edit_person {
		margin-left: 10px;
		cursor: pointer;
	}

	.el-icon-close {
			font-size: 20px;
			font-weight: 500;
			cursor: pointer;
	}

	.el-form-item {
		margin-bottom: 24px;
	}

	.el-form-item__label {
			line-height: 16px;
	}
}

:deep(.el-date-editor.el-input.el-date-editor) {
	width: 100%;
}
</style>
