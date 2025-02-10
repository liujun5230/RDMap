<template>
<div
	ref="main_content_ref"
	class="main-content"
>
	<el-form
		ref="form_ref"
		class="base-form"
		:class="[theme === 'custom-theme-blue' ? 'blue' : 'green']"
		:model="form_data"
		:rules="rules"
		:disabled="!is_edit_mode"
		label-position="top"
		size="small"
	>
		<el-form-item
			prop="licence"
			label="车牌号"
		>
			<el-input
				v-model="form_data.licence"
				clearable
			/>
		</el-form-item>
	</el-form>

	<dynamic-form
		ref="dynamic_form_ref"
		:form-items="dynamic_form_items"
		:things-type="2"
		:disabled="!is_edit_mode"
		scroll-container=".main-content"
	/>

	<div
		v-if="!things_is_del && btn_handle_auth"
		class="handle-btn"
		:class="{'handle-btn-panel':isScrolling || !arrivedState.top}"
	>
		<el-button
			v-if="auth.handle && !is_edit_mode"
			plain
			type="primary"
			@click="setEditMode(true)"
		>
			编辑
		</el-button>
		<el-button
			v-if="auth.handle && edit_id && is_edit_mode"
			plain
			@click="setEditMode(false)"
		>
			取消
		</el-button>
		<el-button
			v-if="auth.handle && is_edit_mode"
			v-preventRepeatClick
			:loading="save_loading"
			type="primary"
			@click="handleSave"
		>
			保存
		</el-button>
	</div>
</div>
</template>

<script setup>
import {ref, computed, shallowRef, inject, watchEffect} from "vue";
import {Notification} from "element-ui";
import {useStore} from "@/store";
import {usePageAuth} from "@/utils/js/authentication";
import DynamicForm from "@/components/DynamicForm/DynamicForm.vue";
import {addTruck, updateTruck, checkTruckLicenseName} from "@/api/truck/truck";

import {useDynamicColumns} from "@/views/truck/info/composable/useDynamicColumns";
import {formatterCellValue} from "@/views/truck/info/composable/formatter";

import {useSelectedType} from "../../../components/useSelectedType";
import {useScroll, useEventBus} from "@vueuse/core";
import {checkUrlRule} from "@/utils/ts/formRule";

const store = useStore();
const auth = usePageAuth("/truck#/info");
const {getTypeId} = useSelectedType("truck");

const archive_info = inject("ARCHIVE_INFO");
const btn_handle_auth = inject("BTN_HANDLE_AUTH");

const checkNameRule = (rule, value, callback) => {
	checkUrlRule(checkTruckLicenseName, {id: archive_uuid.value || undefined, name: value}, callback);
};

const rules = {
	licence: [
		{required: true, whitespace: true, message: "请输入车牌号", trigger: "blur"},
		{validator: checkNameRule, trigger: "blur"},
	]
};

const main_content_ref = ref();
const {isScrolling, arrivedState} = useScroll(main_content_ref);

const form_ref = ref(null);
const getDefaultFormData = () => ({licence: ""});
const form_data = ref(getDefaultFormData());
const dynamic_form_items = shallowRef([]);
const dynamic_form_ref = ref(null);
const save_loading = ref(false);
const is_edit_mode = ref(false); // 是否进入编辑模块(新增、编辑)

const theme = computed(() => store.getters.user_info.theme);
const archive_card = inject("ARCHIVE_CARD");
const archive_uuid = inject("ARCHIVE_UUID");
const dialog_key = inject("DIALOG_KEY");
const things_is_del = ref(0);
const edit_id = ref(0);

const dynamic_columns = computed(() => {
	const truck_dict_items = store.getters.car_dict_items.filter(item => item.is_display);
	return useDynamicColumns(truck_dict_items).value;
});

// 设置车牌号校验规则
watchEffect(() => {
	if (dynamic_columns.value) {
		const [licence_col] = dynamic_columns.value;
		// length 为 -1 表示不限制文本长度，预设字段默认最长不超过 100 个字符，自定义字段不超过 200 字符
		const licence_limit = licence_col?.length === -1 ? 100 : licence_col?.length;
		rules.licence.push({validator: validateTextLength(licence_limit, `车辆编号不能超过${licence_limit}个字符`), trigger: "blur"});
	}
});

// 是否进入编辑模块(新增、编辑)
watchEffect(() => {
	if (archive_uuid.value === 0 && !archive_info.value) {
		// 新增
		is_edit_mode.value = true;
		edit_id.value = 0;
		form_data.value = getDefaultFormData();
		dynamic_form_items.value = getDynamicFormItems(archive_info.value);
	}
	if (archive_info.value) {
		// 编辑
		is_edit_mode.value = false;
		edit_id.value = archive_info.value.uuid;
		things_is_del.value = archive_info.value.is_delete;
		form_data.value.licence = archive_info.value.licence;
		dynamic_form_items.value = getDynamicFormItems(archive_info.value);
	}
});

function getDynamicFormItems(row) {
	return dynamic_columns.value.map(col => {
		const is_model_col = col.field === "model_id";
		const is_icon_col = col.field === "icon_id";
		const dict_option = col.option || [];

		let value = "";
		if (!row) {
			if (is_model_col || is_icon_col) {
				// -3 表示跟随类型
				value = -3;
			}
			if (col.field === "type") {
				const default_type_id = dict_option[0]?.value || 1;
				const selected_type_id = getTypeId();
				// 车辆信息的左侧面板如果选择的是全部类型，则用默认车辆类型id
				value = selected_type_id === -1 ? default_type_id : selected_type_id;
			}
		} else {
			value = formatterCellValue(row, col, false);
			if (is_model_col && row.model_follow_type === 3) {
				value = -3;
			}
			if (is_icon_col && row.icon_follow_type === 3) {
				value = -3;
			}
		}

		return {
			prop: col.prop,
			name: col.label,
			value,
			type: col.type,
			rules: col.length,
			options: [5, 6].includes(col.type) ? dict_option.map(({id, name}) => ({label: name, value: id})) : [],
			is_require: col.is_require,
			is_custom: !!col.name_is_delete
		};
	});
}

function validateTextLength(max_length, message) {
	return (rule, value, callback) => {
		const validate_value = rule.whitespace ? value : value.trim();
		if (validate_value.length > max_length) {
			return callback(new Error(message));
		}
		return callback();
	};
}

function setEditMode(mode) {
	if (!mode) {
		form_ref.value?.resetFields();
		dynamic_form_ref.value?.resetDataAndValidate();
	}
	is_edit_mode.value = mode;
}

async function handleSave() {
	const is_add = archive_uuid.value === 0;
	const [is_validate, dynamic_form_data] = await Promise.all([form_ref.value.validate(), dynamic_form_ref.value.validateDynamicForm()]).catch(() => []);
	if (is_validate && dynamic_form_data) {
		save_loading.value = true;

		const truck_dict = Object.entries(dynamic_form_data.dict_json).reduce((result, [key, value]) => {
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
			...dynamic_form_data,
			dict_json: undefined,
			model_id: dynamic_form_data.model_id === -3 ? 0 : dynamic_form_data.model_id,
			model_follow_type: dynamic_form_data.model_id === -3 ? 3 : 0,
			icon_id: dynamic_form_data.icon_id === -3 ? 0 : dynamic_form_data.icon_id,
			icon_follow_type: dynamic_form_data.icon_id === -3 ? 3 : 0,
			card_id: parseInt(archive_card.value) || undefined,
			uuid: archive_uuid.value || undefined,
			truck_dict,
		};

		const requestFn = edit_id.value ? updateTruck : addTruck;
		const {data: res} = await requestFn(emit_data).catch(() => ({data: undefined}));
		save_loading.value = false;
		if (res?.type === 1) {
			const uuid = is_add ? res.result : emit_data.uuid;
			Notification.success({title: "成功", message: is_add ? "新增成功" : "修改成功"});
			is_add && (is_edit_mode.value = false);
			useEventBus("update_info_" + dialog_key).emit(uuid);
		} else if (res?.result) {
			Notification.error({title: "错误", message: res?.result || "接口异常"});
		}
	}
}
</script>

<style lang="scss" scoped>
.main-content {
    padding: 16px 16px 0 16px;
	overflow-y: auto;

    .base-form {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        column-gap: 16px;

        .el-form-item {
            margin-bottom: 24px;
        }

        :deep(.el-form-item__label) {
            line-height: 16px;
        }
    }

    .handle-btn {
        position: absolute;
		padding-top: 16px;
		top: 0;
		right: 15px;
		text-align: right;
    }
	.handle-btn-panel {
		width: 100%;
		background-color: #fbfdff;
	}
}

:deep(.el-date-editor.el-input.el-date-editor) {
	width: 100%;
}
</style>
