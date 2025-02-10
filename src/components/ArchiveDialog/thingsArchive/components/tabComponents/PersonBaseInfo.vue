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
			:things-type="1"
		>
			<el-form-item
				label="部门"
				required
				:error="branch_validate_info"
			>
				<branch-select
					ref="branch_cascader"
					:disabled="edit_person_panel.can_not_edit"
					filterable
					:show-all="false"
					:branch-id="edit_person_panel.branch"
					@visible-change="scrollForm"
					@change-branch="handleChangeBranch"
				/>
			</el-form-item>
		</dynamic-form>
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
import {ref, computed, shallowRef, inject, watchEffect, nextTick} from "vue";
import {useStore} from "@/store/index";
import DynamicForm from "@/components/DynamicForm/DynamicForm.vue";
import {FORM_TYPE, TYPE_DEFAULT_VALUE} from "@/components/DynamicForm/DynamicForm.vue";
import {getBranchList} from "@/api/company/branchSetting";
import {getTreeFromBranchData} from "@/utils/js/common";
import {addPersonInfo, fakeCode, updatePersonInfo, validatePersonIDCode} from "@/api/company/personSetting";
import {transTreeBranch, calcAge} from "@/views/company/person/utils";
import {getIconFollowTypeByDynamicIconId, getIconIdByDynamicIconId, getModelFollowTypeByDynamicModelId, getModelIdByDynamicModelId, getDynamicIconIdByIconFollowType, getDynamicModelIdByModelFollowType} from "@/components/DynamicForm/utils";
import {useSelectedType} from "../../../components/useSelectedType";
import {useScroll, useEventBus} from "@vueuse/core";
import CardReader from "../operationComponents/CardReader.vue";
import BranchSelect from "@/components/BranchSelect.vue";
import {cloneDeep} from "lodash-es";
const {getTypeId} = useSelectedType("person");

const archive_info = inject("ARCHIVE_INFO");
const btn_handle_auth = inject("BTN_HANDLE_AUTH");

const person_dict_items = computed(() => useStore().getters.person_dict_items);
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
		branch: [], // 部门
		reader_status: READER_STATUS.WAITING
	};
};

const main_content_ref = ref();

const {isScrolling, arrivedState} = useScroll(main_content_ref);

const card_reader_ref = ref();
const person_form_ref = ref();
const dynamic_form_ref = ref();

const branch_cascader = ref();
const branch_data = ref({});

const dynamic_form_items = shallowRef([]);

const edit_person_panel = ref(getDefaultFormData());

const disabled_id_code = ref(false);
const branch_validate_info = ref("");

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

const closeDownList = () => {
	branch_cascader.value.$children[0].dropDownVisible = false;
};

const scrollForm = (flag) => {
	const container = document.querySelector(".main-content");
	if (flag) {
		container && container.addEventListener("scroll", closeDownList);
	} else {
		container && container.removeEventListener("scroll", closeDownList);
	}
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

const validateBranchValue = (value) => {
	if (value) {
		branch_validate_info.value = "";
		closeDownList();
	}
};

const validateIdCodeInfo = () => {
	id_code_validate_info.value = "";
	if (edit_person_panel.value.id_code === "") {
		id_code_validate_info.value = "请输入身份证号";
	} else {
		validatePersonIDCode({id_code: edit_person_panel.value.id_code, uuid: archive_uuid.value || undefined}).then(res => {
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

const getDynamicFormItems = async (info) => {
	const branch_res = await getBranchList();
	const {type, result} = branch_res.data;
	const obj = {};
	if (type === 1) {
		result.data.map((i) => {
			obj[i.id] = i;
		});
		const tree = getTreeFromBranchData(result.data, true);
		branch_cascader.value?.setBranchData(tree);
		branch_data.value = obj;
	}
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
	const NOT_DYNAMIC_ITEMS = ["name", "id_code", "branch_id"];

	const display_item = person_dict_items.value.filter(item => {
		return (item.is_display && !NOT_DYNAMIC_ITEMS.includes(item.field));
	});

	return display_item.map(item => {
		return {
			prop: item.prop_name,
			name: item.name,
			value: ["icon_id", "model_id"].includes(item.field) ? -2 : TYPE_DEFAULT_VALUE[item.type],
			type: item.type,
			rules: item.type_size,
			options: item.options.map(option => ({label: option.name, value: option.id})),
			is_require: Boolean(item.is_require),
			is_custom: !item.role_deny.field,
			is_disabled: ["age", "birthday"].includes(item.field)
		};
	});
};

const getEditFormItems = (row) => {
	row = {...row, ...row.dict_json};

	// 不参与排序的静态表单项
	const NOT_DYNAMIC_ITEMS = ["name", "id_code", "branch_id"];
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
			if (item.field === "duty_name") {
				value = row_data.get("duty_id");
			} else if (item.type === FORM_TYPE["SELECT"]) {
				value = value ? Number(value) : value;
			} else if (item.type === FORM_TYPE["MULTIPLE"]) {
				value = value ? value.map(val => Number(val)) : value;
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

		return {
			prop: prop_name,
			name: item.name,
			// row中存在该属性才取row中的值，否则按默认值
			value,
			type: item.type,
			rules: item.type_size,
			options: item.options.map(option => ({label: option.name, value: option.id})),
			is_require: Boolean(item.is_require),
			is_custom: !item.field,
			is_disabled: ["age", "birthday"].includes(item.field)
		};
	});
};

const addPerson = () => {
	edit_person_panel.value = getDefaultFormData();
	const branch_id = getTypeId();
	edit_person_panel.value.branch = branch_id !== -1 ? transTreeBranch(branch_id, branch_data.value) : [];
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
	edit_person_panel.value.branch = data.branch_id !== -1 ? transTreeBranch(data.branch_id, branch_data.value) : [];
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
			branch_validate_info.value = (edit_person_panel.value.branch && edit_person_panel.value.branch.length) ? "" : "请选择部门";
			const {data: {type, result}} = await validatePersonIDCode({id_code: edit_person_panel.value.id_code, uuid: edit_person_panel.value.edit_id || undefined});
			if (type === 1) {
				id_code_validate_info.value = result;
			}
			if (valid && !branch_validate_info.value && !id_code_validate_info.value) {
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
		if (key === "model_id" || key === "person_class") {
			dynamic_data[key] = data[key];
		} else if (key === "dict_json") {
			dynamic_data[key] = Object.entries(data[key]).reduce((result, [key, value]) => {
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

const savePerson = () => {
	Promise.all([validateStaticForm(), dynamic_form_ref.value.validateDynamicForm()])
		.then(async (res) => {
			const dynamic_data = generateDynamicData(res[1]);
			dynamic_data["icon_follow_type"] = getIconFollowTypeByDynamicIconId(dynamic_data["icon_id"]);
			dynamic_data["model_follow_type"] = getModelFollowTypeByDynamicModelId(dynamic_data["model_id"]);
			dynamic_data["icon_id"] = getIconIdByDynamicIconId(dynamic_data["icon_id"]);
			dynamic_data["model_id"] = getModelIdByDynamicModelId(dynamic_data["model_id"]);

			const data = {
				name: returnNullParam(edit_person_panel.value.name),
				branch_id: edit_person_panel.value.branch[edit_person_panel.value.branch.length - 1],
				id_code: returnNullParam(edit_person_panel.value.id_code),
				card_id: archive_card.value || undefined,
				...dynamic_data
			};
			let update_uuid = edit_person_panel.value.edit_id;
			if (edit_person_panel.value.edit_id) {
				data.uuid = edit_person_panel.value.edit_id;
				const res = await updatePersonInfo(data);
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
				const res = await addPersonInfo(data);
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

const handleChangeBranch = (branch_id) => {
	edit_person_panel.value.branch = branch_id;
	validateBranchValue();
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
