<template>
<div
	ref="main_content_ref"
	class="main-content"
>
	<el-form
		ref="person_form_ref"
		size="small"
		label-position="top"
		:rules="rules"
		:model="edit_person_panel"
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
					v-model="edit_person_panel.name"
					:disabled="edit_person_panel.can_not_edit"
					clearable
				/>
			</el-form-item>
			<el-form-item
				label="身份证号"
				required
				class="id-code-item"
				:error="id_code_validate_info"
			>
				<template #label>
					<span>
						身份证号
						<a
							v-if="!edit_person_panel.can_not_edit"
							class="clickable-text"
							@click="generateFakeCode"
						>自动生成</a>
						<el-tooltip
							v-if="!edit_person_panel.can_not_edit"
							content="因批量导入需要唯一识别字段，故身份证号必填，点击自动生成的身份证号前6位均为0"
							placement="top"
						>
							<i class="hg-icons hg-icon-tooltip-question question-icon" />
						</el-tooltip>
					</span>
				</template>
				<el-input
					v-model="edit_person_panel.id_code"
					:disabled="edit_person_panel.can_not_edit || disabled_id_code"
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
			:disabled="edit_person_panel.can_not_edit"
			scroll-container=".main-content"
			:things-type="6"
		/>
	</el-form>
	<div
		v-if="!things_is_del && btn_handle_auth"
		class="handle-btn"
		:class="{'handle-btn-panel':isScrolling || !arrivedState.top}"
	>
		<el-button
			v-show="edit_person_panel.can_not_edit"
			plain
			type="primary"
			@click="startEditPerson"
		>
			编辑
		</el-button>
		<el-button
			v-show="!edit_person_panel.can_not_edit && edit_person_panel.edit_id"
			plain
			@click="cancelEdit"
		>
			取消
		</el-button>
		<el-button
			v-show="!edit_person_panel.can_not_edit"
			v-preventRepeatClick
			type="primary"
			@click="savePerson"
		>
			保存
		</el-button>
	</div>
</div>
</template>
<script setup>
import {Notification} from "element-ui";
import {ref, computed, shallowRef, inject, nextTick, watchEffect} from "vue";
import {useStore} from "@/store/index";
import DynamicForm from "@/components/DynamicForm/DynamicForm.vue";
import {FORM_TYPE, TYPE_DEFAULT_VALUE} from "@/components/DynamicForm/DynamicForm.vue";
import {fakeCode} from "@/api/company/personSetting";
import {addContractorPerson, updateContractorPerson, validateIDCode} from "@/api/contractor/Person";
import {calcAge} from "@/views/company/person/utils";
import {
	getIconFollowTypeByDynamicIconId,
	getIconIdByDynamicIconId,
	getModelFollowTypeByDynamicModelId,
	getModelIdByDynamicModelId,
	getDynamicIconIdByIconFollowType,
	getDynamicModelIdByModelFollowType
} from "@/components/DynamicForm/utils";
import {useSelectedType} from "../../../components/useSelectedType";
import {useScroll, useEventBus} from "@vueuse/core";
import CardReader from "../operationComponents/CardReader.vue";

const {getTypeId} = useSelectedType("contractor");
import {cloneDeep} from "lodash-es";

const archive_info = inject("ARCHIVE_INFO");
const btn_handle_auth = inject("BTN_HANDLE_AUTH");

const person_dict_items = computed(() => useStore().getters.contractor_items);
const archive_card = inject("ARCHIVE_CARD");
const archive_uuid = inject("ARCHIVE_UUID");

const things_is_del = ref(0);
const id_code_validate_info = ref("");

const dialog_key = inject("DIALOG_KEY");

const READER_STATUS = {
	NORMAL: 1,
	ABNORMAL: 2,
	WAITING: 0
};
const getDefaultFormData = () => {
	return {
		can_not_edit: false,
		edit_id: null,
		name: "", // 姓名
		id_code: "", // 身份证号
		card: "", // 卡号
		reader_status: READER_STATUS.WAITING
	};
};

const main_content_ref = ref();

const {isScrolling, arrivedState} = useScroll(main_content_ref);

const card_reader_ref = ref();
const person_form_ref = ref();
const dynamic_form_ref = ref();

const dynamic_form_items = shallowRef([]);

const edit_person_panel = ref(getDefaultFormData());

const disabled_id_code = ref(false);

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

const getNameMaxSize = () => {
	const name_item = person_dict_items.value.find(item => {
		return item.field === "name";
	});
	return name_item.type_size === -1 ? 100 : name_item.type_size;
};

const rules = {
	name: []
};

const setNameRule = () => {
	const max = getNameMaxSize();
	rules.name = [
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

const validateIdCodeInfo = () => {
	id_code_validate_info.value = "";
	if (edit_person_panel.value.id_code === "") {
		id_code_validate_info.value = "请输入身份证号";
	} else {
		validateIDCode({
			id_code: edit_person_panel.value.id_code,
			uuid: archive_uuid.value || undefined
		}).then(res => {
			if (res.data.type === 1) {
				id_code_validate_info.value = res.data.result;
			}
		});
	}
	handleIdCode();
};

const onReadCard = (data) => {
	edit_person_panel.value.name = data.name;
	edit_person_panel.value.id_code = data.ID_No;
	validateIdCodeInfo();
};

const handleIdCode = () => {
	const age_prop = "age";
	const birthday_prop = "birthday";
	if (!id_code_validate_info.value) {
		const ymd_str = edit_person_panel.value.id_code.substring(6, 14);
		const year = ymd_str.substring(0, 4);
		const month = ymd_str.substring(4, 6);
		const date = ymd_str.substring(6, 8);

		const birthday_val = `${year}-${month}-${date}`;
		const [age_val] = calcAge(birthday_val);

		/*
			 * 特殊处理这个特殊生日
			 * */
		if (birthday_val === "1993-02-30") {
			dynamic_form_ref.value.setFormValue(birthday_prop, "");
			dynamic_form_ref.value.setFormValue(age_prop, "");
		} else {
			dynamic_form_ref.value.setFormValue(birthday_prop, birthday_val);
			dynamic_form_ref.value.setFormValue(age_prop, String(age_val));
		}
	} else {
		dynamic_form_ref.value.setFormValue(birthday_prop, "");
		dynamic_form_ref.value.setFormValue(age_prop, "");
	}
};

const clearIdCode = () => {
	edit_person_panel.value.id_code = "";
	disabled_id_code.value = false;
	validateIdCodeInfo();
};

const generateFakeCode = () => {
	fakeCode()
		.then(({data}) => {
			edit_person_panel.value.id_code = data.result;
			disabled_id_code.value = true;
			id_code_validate_info.value = "";
			handleIdCode();
		});
};

const clearFormPromise = () => {
	return new Promise((resolve) => {
		resolve();
	});
};

const getDynamicFormItems = async (info) => {
	// 这里加个异步函数解决dynamic_form_ref.value?.resetDataAndValidate()陷入循环的问题
	await clearFormPromise();
	if (info) {
		editPerson(info);
	} else {
		addPerson();
	}

	dynamic_form_items.value = info ? getEditFormItems(info) : getAddFormItems();
	setNameRule();
	dynamic_form_ref.value?.resetDataAndValidate();
};

const getAddFormItems = () => {
	// 不参与排序的静态表单项
	const NOT_DYNAMIC_ITEMS = ["name", "id_code"];

	const display_item = person_dict_items.value.filter(item => {
		return (item.is_display && !NOT_DYNAMIC_ITEMS.includes(item.field));
	});
	return display_item.map(item => {
		let value = TYPE_DEFAULT_VALUE[item.type];
		if (["icon_id", "model_id"].includes(item.field)) {
			value = -4;
		}
		if (item.field === "unit_id") {
			value = getTypeId() === -1 ? "" : getTypeId();
		}
		return {
			prop: item.prop_name,
			name: item.name,
			value,
			type: item.type,
			rules: item.type_size,
			options: item.options ? item.options.map(({id, name}) => ({label: name, value: id})) : [],
			is_require: Boolean(item.is_require),
			is_custom: !!item.btn_delete,
			is_disabled: ["age", "birthday"].includes(item.field)
		};
	});
};

const getEditFormItems = (row) => {
	row = {...row, ...row.dict_data};

	// 不参与排序的静态表单项
	const NOT_DYNAMIC_ITEMS = ["name", "id_code"];
	const display_item = person_dict_items.value.filter(item => {
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
				if (Array.isArray(value)) {
					value = value.length ? Number(value[0].id) : undefined;
				} else {
					value = value ? Number(value) : value;
				}
			} else if (item.type === FORM_TYPE["MULTIPLE"]) {
				value = value ? value.map(val => Number(val.id)) : value;
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

		// 根据出生日期动态计算年龄
		if (prop_name === "age" && row_data.get("birthday")) {
			value = String(calcAge(row_data.get("birthday"))[0]);
		}
		// 承包商单位被删除后，选项置为空
		if (prop_name === "unit_id" && !item.options?.find(({id}) => id === value)) value = "";

		return {
			prop: prop_name,
			name: item.name,
			// row中存在该属性才取row中的值，否则按默认值
			value,
			type: item.type,
			rules: item.type_size,
			options: item.options ? item.options.map(({id, name}) => ({label: name, value: id})) : [],
			is_require: Boolean(item.is_require),
			is_custom: !!item.btn_delete,
			is_disabled: ["age", "birthday"].includes(item.field)
		};
	});
};

const addPerson = () => {
	edit_person_panel.value = getDefaultFormData();
	disabled_id_code.value = false;
	nextTick(() => {
		card_reader_ref.value?.connectID();
	});
};

const editPerson = (data) => {
	edit_person_panel.value.edit_id = data.uuid;
	edit_person_panel.value.can_not_edit = true;
	edit_person_panel.value.reader_status = READER_STATUS.WAITING;
	edit_person_panel.value.name = data.name || "";
	edit_person_panel.value.id_code = data.id_code || "";
};

const startEditPerson = () => {
	edit_person_panel.value.can_not_edit = false;
	card_reader_ref.value.connectID();
};

const cancelEdit = () => {
	if (!edit_person_panel.value.edit_id) return;
	getDynamicFormItems(archive_info.value);
	edit_person_panel.value.can_not_edit = true;
	edit_person_panel.value.reader_status = READER_STATUS.WAITING;
	id_code_validate_info.value = "";
	person_form_ref.value?.resetFields();

	card_reader_ref.value.resetReader();
};

const validateStaticForm = () => {
	return new Promise((resolve, reject) => {
		person_form_ref.value?.validate(async (valid) => {
			const {data: {type, result}} = await validateIDCode({
				id_code: edit_person_panel.value.id_code,
				uuid: edit_person_panel.value.edit_id || undefined
			});
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

const returnNullParam = (val) => {
	return (!val ? null : val);
};

const savePerson = () => {
	Promise.all([validateStaticForm(), dynamic_form_ref.value.validateDynamicForm()])
		.then(async (res) => {
			const dynamic_data = res[1];
			const dict_data = Object.entries(dynamic_data.dict_json).reduce((result, [key, value]) => {
				const find_one = person_dict_items.value.find(item => item.prop_name === key);
				let real_value = value;
				if (find_one.type === 5) {
					real_value = value ? [value] : [];
				}
				result[key] = real_value;
				return result;
			}, {});
			dynamic_data["icon_follow_type"] = getIconFollowTypeByDynamicIconId(dynamic_data["icon_id"]);
			dynamic_data["model_follow_type"] = getModelFollowTypeByDynamicModelId(dynamic_data["model_id"]);
			dynamic_data["icon_id"] = getIconIdByDynamicIconId(dynamic_data["icon_id"]);
			dynamic_data["model_id"] = getModelIdByDynamicModelId(dynamic_data["model_id"]);
			dynamic_data["dict_data"] = dict_data;
			delete dynamic_data["dict_json"];
			const data = {
				name: returnNullParam(edit_person_panel.value.name),
				id_code: returnNullParam(edit_person_panel.value.id_code),
				card_id: archive_card.value || undefined,
				...dynamic_data
			};
			let update_uuid = edit_person_panel.value.edit_id;
			if (edit_person_panel.value.edit_id) {
				data.uuid = edit_person_panel.value.edit_id;
				const res = await updateContractorPerson(data);
				if (res.data.type === 1) {
					Notification({
						type: "success",
						title: "成功",
						message: "修改成功"
					});
					card_reader_ref.value.resetReader();
				} else {
					Notification({
						type: "error",
						title: "错误",
						message: res.data.result
					});
				}
			} else {
				const res = await addContractorPerson(data);
				if (res.data.type === 1) {
					update_uuid = res.data.result;
					Notification({
						type: "success",
						title: "成功",
						message: "新增成功"
					});
					card_reader_ref.value.resetReader();
				} else {
					Notification({
						type: "error",
						title: "错误",
						message: res.data.result
					});
				}
			}
			useEventBus("update_info_" + dialog_key).emit(update_uuid);
		})
		.catch(() => {
			console.log("验证失败");
		});
};

watchEffect(() => {
	if (archive_uuid.value === 0 && !archive_info.value) {
		getDynamicFormItems();
	}
	if (archive_info.value) {
		things_is_del.value = archive_info.value.is_delete;
		getDynamicFormItems(cloneDeep(archive_info.value));
	}
});

</script>
<style scoped>

.custom-theme-blue .more-info-btn {
	color: #07f;
}

.custom-theme-green .more-info-btn {
	color: #3eb2a9;
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

.hg-icon-tooltip-question {
	color: #a2b2c2;
	font-size: 14px;
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
