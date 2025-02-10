<template>
<div
	ref="main_content_ref"
	class="main-content"
>
	<el-form
		ref="visitor_form_ref"
		size="small"
		label-position="top"
		:rules="rules"
		:model="edit_visitor_panel"
	>
		<card-reader
			ref="card_reader_ref"
			@onmessage="onReadCard"
		/>
		<div class="base-info">
			<el-form-item
				label="姓名"
				prop="name"
			>
				<el-input
					v-model="edit_visitor_panel.name"
					:disabled="edit_visitor_panel.can_not_edit || !is_from_pc"
					clearable
				/>
			</el-form-item>
			<el-form-item
				label="身份证号"
				required
				:error="id_code_validate_info"
				class="id-code-item"
			>
				<template #label>
					<span>
						身份证号
						<a
							v-if="!edit_visitor_panel.can_not_edit"
							class="download-link"
							@click="generateFakeCode"
						>自动生成</a>
						<el-tooltip
							v-if="!edit_visitor_panel.can_not_edit"
							content="因批量导入需要唯一识别字段，故身份证号必填，点击自动生成的身份证号前6位均为0"
							placement="top"
						>
							<i class="hg-icons hg-icon-tooltip-question question-icon" />
						</el-tooltip>
					</span>
				</template>
				<el-input
					v-model="edit_visitor_panel.id_code"
					:disabled="edit_visitor_panel.can_not_edit || disabled_id_code"
					@blur="validateIdCodeInfo"
				>
					<template #suffix>
						<i
							v-if="disabled_id_code"
							class="el-icon-circle-close id-code-clear-btn"
							style="cursor: pointer;"
							@click="clearIdCode"
						/>
					</template>
				</el-input>
			</el-form-item>
		</div>
		<dynamic-form
			ref="dynamic_form_ref"
			:form-items="dynamic_form_items"
			:disabled="edit_visitor_panel.can_not_edit"
			scroll-container=".main-content"
			:things-type="3"
		/>
	</el-form>
	<div
		v-if="!things_is_del && btn_handle_auth"
		class="handle-btn"
		:class="{'handle-btn-panel':isScrolling || !arrivedState.top}"
	>
		<el-button
			v-show="edit_visitor_panel.can_not_edit"
			plain
			type="primary"
			@click="startEdit"
		>
			编辑
		</el-button>
		<el-button
			v-show="!edit_visitor_panel.can_not_edit && edit_visitor_panel.edit_id"
			plain
			@click="cancelEdit"
		>
			取消
		</el-button>
		<el-button
			v-show="!edit_visitor_panel.can_not_edit"
			v-preventRepeatClick
			type="primary"
			@click="saveVisitor"
		>
			保存
		</el-button>
	</div>
</div>
</template>

<script setup>
import {computed, inject, ref, watch, nextTick} from "vue";
import {useStore} from "@/store";
import DynamicForm, {TYPE_DEFAULT_VALUE, FORM_TYPE} from "@/components/DynamicForm/DynamicForm.vue";
import {fakeCode} from "@/api/company/personSetting";
import {Notification} from "element-ui";
import {
	getDynamicIconIdByIconFollowType,
	getDynamicModelIdByModelFollowType,
	getIconFollowTypeByDynamicIconId,
	getIconIdByDynamicIconId,
	getModelFollowTypeByDynamicModelId,
	getModelIdByDynamicModelId
} from "@/components/DynamicForm/utils";
import {createVisitor, updateVisitor, validateIdCode} from "@/api/visitor/visitor";
import {useScroll, useEventBus} from "@vueuse/core";
import CardReader from "../operationComponents/CardReader.vue";

const archive_info = inject("ARCHIVE_INFO");
const btn_handle_auth = inject("BTN_HANDLE_AUTH");

const archive_card = inject("ARCHIVE_CARD");
const archive_uuid = inject("ARCHIVE_UUID");
const dialog_key = inject("DIALOG_KEY");
const visitor_dict_items = computed(() => useStore().getters.visitor_dict_items);

const main_content_ref = ref();
const {isScrolling, arrivedState} = useScroll(main_content_ref);

const visitor_form_ref = ref();
const dynamic_form_ref = ref();
const things_is_del = ref(0);
const id_code_validate_info = ref("");
const card_reader_ref = ref();

const getDefaultFormData = () => {
	return {
		source: 1, // 数据来源，1-PC端，2-小程序
		can_not_edit: false, // 表示是否是查看模式
		edit_id: null,
		name: "", // 姓名
		id_code: "", // 身份证号
	};
};

const generateDynamicFormItems = () => {
	// 不参与排序的静态表单项
	const NOT_DYNAMIC_ITEMS = ["name", "id_code", "source", "record_count"];

	const name_item = visitor_dict_items.value.find(item => {
		return item.field === "name";
	});
	setNameRules(name_item.length);

	const display_item = visitor_dict_items.value.filter(item => {
		return (item.is_display && !NOT_DYNAMIC_ITEMS.includes(item.field));
	});

	return display_item.map(item => {
		let value = TYPE_DEFAULT_VALUE[item.type];

		if (item.field === "icon_id") {
			value = -1;
		}

		if (item.field === "model_id") {
			value = 3;
		}

		return {
			prop: item.prop_name,
			value,
			name: item.name,
			type: item.type,
			rules: item.length,
			options: item.option ? item.option.map(({id, name}) => ({label: name, value: id})) : [],
			is_require: item.is_require,
			is_custom: !item.field,
			is_disabled: false
		};
	});
};

const generateEditDynamicFormItems = (row) => {
	row = {...row, ...row.visitor_dict};

	const name_item = visitor_dict_items.value.find(item => {
		return item.field === "name";
	});
	setNameRules(name_item.length);
	// 不参与排序的静态表单项
	const NOT_DYNAMIC_ITEMS = ["name", "id_code", "source", "record_count"];
	const display_item = visitor_dict_items.value.filter(item => {
		return (item.is_display && !NOT_DYNAMIC_ITEMS.includes(item.field));
	});

	const row_data = new Map();
	for (const key in row) {
		row_data.set(key, row[key]);
	}
	return display_item.map(item => {
		const prop_name = item.prop_name;

		// 后端返回的选项值为字符型，需要转换为数字型
		let value;
		if (row_data.has(prop_name)) {
			value = row_data.get(prop_name);
			if (item.type === FORM_TYPE["SELECT"]) {
				if (value && Array.isArray(value)) {
					value = Number(value[0].id);
				}
			} else if (item.type === FORM_TYPE["MULTIPLE"]) {
				if (value && Array.isArray(value)) {
					value = value.map(val => Number(val.id));
				}
			}
		} else {
			value = TYPE_DEFAULT_VALUE[item.type];
		}

		// 特殊处理三维模型在动态表单中的取值
		if (prop_name === "model_id") {
			value = getDynamicModelIdByModelFollowType(row_data.get("model_follow_type"), value);
		}

		// 特殊处理二维图标在动态表单中的取值
		if (prop_name === "icon_id") {
			value = getDynamicIconIdByIconFollowType(row_data.get("icon_follow_type"), value);
		}

		return {
			prop: prop_name,
			name: item.name,
			value,
			type: item.type,
			rules: item.length,
			options: item.option ? item.option.map(option => ({label: option.name, value: option.id})) : [],
			is_require: item.is_require,
			is_custom: !!item.name_is_delete || item.name === "备注",
			is_disabled: item.field === "photo" && row.source === 2 ? true : false
		};
	});
};

const validateIdCodeInfo = () => {
	id_code_validate_info.value = "";
	if (edit_visitor_panel.value.id_code === "") {
		id_code_validate_info.value = "请输入身份证号";
	} else {
		validateIdCode({id_code: edit_visitor_panel.value.id_code, uuid: archive_uuid.value || undefined}).then(res => {
			if (res.data.type === 1) {
				id_code_validate_info.value = res.data.result;
			}
		});
	}
};

const onReadCard = (data) => {
	edit_visitor_panel.value.name = data.name;
	edit_visitor_panel.value.id_code = data.ID_No;
};

const addVisitor = () => {
	edit_visitor_panel.value = getDefaultFormData();
	disabled_id_code.value = false;
	nextTick(() => {
		card_reader_ref.value?.connectID();
	});
};

const editVisitor = (data) => {
	edit_visitor_panel.value.edit_id = data.uuid;
	edit_visitor_panel.value.can_not_edit = true;
	edit_visitor_panel.value.name = data.name || "";
	edit_visitor_panel.value.id_code = data.id_code || "";
	edit_visitor_panel.value.source = data.source;
};

const setNameRules = (max) => {
	const checkChart = (rule, value, callback) => {
		if (!value) {
			return callback();
		}
		const str = value.trim();
		if (/^[\u4E00-\u9FA5[A-Za-z0-9·]*$/.test(str)) {
			callback();
		} else {
			callback(new Error("输入仅允许中文字母和数字"));
		}
	};
	const checkNumStart = (rule, value, callback) => {
		if (!value) {
			return callback();
		}
		const str = value.trim();
		if (/^[0-9]*$/.test(str[0])) {
			callback(new Error("输入不能以数字开头"));
		} else {
			callback();
		}
	};
	max = max === -1 ? 100 : max;
	rules.value.name = [
		{
			required: true,
			message: "请输入姓名",
			whitespace: true,
			trigger: "blur"
		},
		{validator: checkChart, trigger: "blur"},
		{validator: checkNumStart, trigger: "blur"},
		{min: 1, max, message: `输入超出限制，最多${max}个字符`, trigger: "blur"}
	];
};

const rules = ref({
	name: []
});
const edit_visitor_panel = ref(getDefaultFormData());
const disabled_id_code = ref(false); // 是否禁用身份证号
const dynamic_form_items = ref([]); // 动态表单数据
const is_from_pc = computed(() => edit_visitor_panel.value.source === 1);

watch(() => archive_uuid.value, async (value) => {
	if (value === 0 && !archive_info.value) {
		dynamic_form_items.value = generateDynamicFormItems();
		addVisitor();
	}
}, {
	immediate: true
});

watch(() => archive_info.value, async(value) => {
	if (value) {
		things_is_del.value = value.is_delete;
		dynamic_form_items.value = generateEditDynamicFormItems(value);
		editVisitor(value);
	}
}, {
	immediate: true
});

// 自动生成假的身份证号
const generateFakeCode = async () => {
	const {data: res} = await fakeCode().catch(() => ({}));
	if (res?.type === 1) {
		edit_visitor_panel.value.id_code = res.result;
		id_code_validate_info.value = "";
		disabled_id_code.value = true;
	}
};

const clearIdCode = () => { // 清除自动生成的身份证号
	edit_visitor_panel.value.id_code = "";
	disabled_id_code.value = false;
	validateIdCodeInfo();
};

const startEdit = () => {
	edit_visitor_panel.value.can_not_edit = false;
	card_reader_ref.value.connectID();
};

const cancelEdit = async () => {
	if (!edit_visitor_panel.value.edit_id) return;
	dynamic_form_items.value = generateEditDynamicFormItems(archive_info.value);
	editVisitor(archive_info.value);
	id_code_validate_info.value = "";
	visitor_form_ref.value?.resetFields();
	dynamic_form_ref.value?.resetDataAndValidate();
	edit_visitor_panel.value.can_not_edit = true;
	card_reader_ref.value.resetReader();
};

const validateStaticForm = () => {
	return new Promise((resolve, reject) => {
		visitor_form_ref.value.validate(async (valid) => {
			const {data: {type, result}} = await validateIdCode({id_code: edit_visitor_panel.value.id_code, uuid: archive_uuid.value || undefined});
			if (type === 1) {
				id_code_validate_info.value = result;
			}
			if (valid && !id_code_validate_info.value) {
				resolve();
			} else {
				reject();
			}
		});
	});
};

const handleNull = (data) => {
	if (Array.isArray(data) && data.length === 0) {
		return null;
	} else {
		return returnNullParam(data);
	}
};

const generateDynamicData = (data) => {
	const dynamic_data = {};
	for (const key in data) {
		if (key === "model_id") {
			dynamic_data[key] = data[key];
		} else if (key === "dict_json") {
			dynamic_data["visitor_dict"] = Object.entries(data[key]).reduce((result, [key, value]) => {
				const find_one = dynamic_form_items.value.find(item => item.prop === key);
				result[key] = find_one.type === 5 ? [value] : value;
				return result;
			}, {});
		} else {
			dynamic_data[key] = handleNull(data[key]);
		}
	}
	return dynamic_data;
};

const returnNullParam = (val) => {
	return (!val ? null : val);
};

const saveVisitor = () => {
	Promise.all([validateStaticForm(), dynamic_form_ref.value.validateDynamicForm()])
		.then(async (res) => {
			const dynamic_data = generateDynamicData(res[1]);
			dynamic_data["icon_follow_type"] = getIconFollowTypeByDynamicIconId(dynamic_data["icon_id"]);
			dynamic_data["model_follow_type"] = getModelFollowTypeByDynamicModelId(dynamic_data["model_id"]);
			dynamic_data["icon_id"] = getIconIdByDynamicIconId(dynamic_data["icon_id"]);
			dynamic_data["model_id"] = getModelIdByDynamicModelId(dynamic_data["model_id"]);

			const data = {
				name: returnNullParam(edit_visitor_panel.value.name),
				id_code: returnNullParam(edit_visitor_panel.value.id_code),
				source: returnNullParam(edit_visitor_panel.value.source),
				card_id: archive_card.value || undefined,
				...dynamic_data
			};

			if (edit_visitor_panel.value.edit_id) {
				data.uuid = edit_visitor_panel.value.edit_id;
				const res = await updateVisitor(data);
				if (res.data.type === 1) {
					Notification({
						type: "success",
						title: "成功",
						message: "修改成功"
					});
					useEventBus("update_info_" + dialog_key).emit(data.uuid);
					card_reader_ref.value.resetReader();
				} else {
					Notification({
						type: "error",
						title: "错误",
						message: res.data.result
					});
				}
			} else {
				const res = await createVisitor(data);
				if (res.data.type === 1) {
					Notification({
						type: "success",
						title: "成功",
						message: "新增成功"
					});
					useEventBus("update_info_" + dialog_key).emit(res.data.result);
					card_reader_ref.value.resetReader();
				} else {
					Notification({
						type: "error",
						title: "错误",
						message: res.data.result
					});
				}
			}
		})
		.catch((e) => {
			console.log("验证失败", e);
		});
};
</script>

<style scoped>
.custom-theme-blue .more-info-btn,
.custom-theme-blue .download-link {
	color: #07f;
}

.custom-theme-green .more-info-btn,
.custom-theme-green .download-link {
	color: #3eb2a9;
}

.download-link {
	text-decoration: underline;
	cursor: pointer;
}
.main-content {
	padding: 16px 16px 0 16px;
	overflow-y: auto;
}

.base-info {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-column-gap: 16px;
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

.hg-icon-tooltip-question{
	color:#a2b2c2;
	font-size:14px;
}

:deep(.id-code-item.is-required:not(.is-no-asterisk))>.el-form-item__label:before{
	margin-right: 0;
}

:deep( .el-form-item__label) {
	line-height: 14px !important;
	padding: 0 0 8px !important;
}
:deep(.el-form-item--mini.el-form-item),
.el-form-item--small.el-form-item {
	margin-bottom: 20px;
}

:deep(.el-cascader) {
	width: 100%;
}

:deep(.el-date-editor.el-input.el-date-editor) {
	width: 100%;
}

:deep(.el-select) {
	width: 100%;
}
</style>
