<template>
<el-form
	ref="dynamic_form_ref"
	class="dynamic-form"
	label-position="top"
	style="padding: 0;"
	size="small"
	:model="dynamic_form_data"
	:rules="rules"
	:validate-on-rule-change="false"
>
	<slot />
	<el-form-item
		v-for="item in props.formItems"
		:key="item.prop"
		:label="item.name"
		:prop="item.prop"
		:error="item.type === FORM_TYPE.ATTACHMENT && attachment_validate_info[item.prop]?attachment_validate_info[item.prop]:undefined"
		:class="{'img-item':item.type === FORM_TYPE.IMG,'attachment-item':item.type === FORM_TYPE.ATTACHMENT}"
	>
		<!-- 文本框 -->
		<el-input
			v-if="item.type === FORM_TYPE.TEXT"
			v-model="dynamic_form_data[item.prop]"
			:disabled="props.disabled || item.is_disabled"
			:clearable="!item.is_require"
		/>

		<!-- 图片 -->
		<span
			v-if="item.type === FORM_TYPE.IMG"
			slot="label"
		>
			{{ item.name }}
			<el-tooltip
				effect="dark"
				content="建议尺寸1:1，支持jpg、png，大小不超过5M"
				placement="top"
			>
				<i class="form-tips el-icon-warning-outline" />
			</el-tooltip>
		</span>
		<div
			v-if="item.type === FORM_TYPE.IMG && dynamic_form_data[item.prop] !== ''"
			class="el-upload-list el-upload-list--picture-card"
		>
			<div class="el-upload-list__item is-success">
				<preview-image
					v-if="!dynamic_form_data[item.prop]?.startsWith('data:image/')"
					:src="base_url + dynamic_form_data[item.prop]"
					:fit="item.name===PHOTO_PROP?'':'contain'"
					class="avatar"
				/>
				<preview-image
					v-else
					:src="dynamic_form_data[item.prop]"
					:fit="item.name===PHOTO_PROP?'':'contain'"
					class="avatar"
				/>
				<span
					v-show="!props.disabled && !item.is_disabled"
					class="el-upload-list__item-actions"
				>
					<span class="el-upload-list__item-delete">
						<i
							class="el-icon-delete"
							@click="handleRemoveImg(item.prop)"
						/>
					</span>
				</span>
			</div>
		</div>
		<el-upload
			v-if="item.type === FORM_TYPE.IMG && dynamic_form_data[item.prop] === ''"
			class="avatar-uploader"
			:class="{'avatar-uploader-hover': !props.disabled && !item.is_disabled}"
			:show-file-list="false"
			action
			:http-request="() => {}"
			:before-upload="beforeUpload(item.prop)"
			:disabled="props.disabled || item.is_disabled"
		>
			<span
				class="avatar-uploader-icon"
			>
				<i class="el-icon-plus" />
				<span>上传图片</span>
			</span>
		</el-upload>
		<span
			v-else-if="item.type === FORM_TYPE.ATTACHMENT"
			slot="label"
		>
			{{ item.name }}
			<el-tooltip
				effect="dark"
				content="最多支持上传6个文件，单个文件大小不超过200M"
				placement="top"
			>
				<i class="form-tips el-icon-warning-outline" />
			</el-tooltip>
		</span>
		<file-upload
			v-if="item.type === FORM_TYPE.ATTACHMENT"
			upload-url="/EHCommon/contractor/Company/uploadTmpFile"
			del-temp-file-url="/EHCommon/contractor/Company/deleteTmpFile"
			:hidden-on-disabled="true"
			:disabled="props.disabled || item.is_disabled"
			:style="{'--columns':grid_columns_num === 1?2:grid_columns_num}"
			:files.sync="dynamic_form_data[item.prop]"
			:limit="6"
			@change="attachmentFileChange(item)"
		/>

		<!-- 时间 -->
		<fk-date-picker
			v-else-if="item.type === FORM_TYPE.DATETIME"
			ref="datetime_ref"
			v-model="dynamic_form_data[item.prop]"
			type="datetime"
			format="yyyy-MM-dd HH:mm"
			value-format="yyyy-MM-dd HH:mm"
			placeholder="选择时间"
			:disabled="props.disabled || item.is_disabled"
			@focus="scrollForm(true)"
			@blur="scrollForm(false)"
		/>

		<!-- 日期 -->
		<fk-date-picker
			v-else-if="item.type === FORM_TYPE.DATE"
			ref="date_ref"
			v-model="dynamic_form_data[item.prop]"
			type="date"
			value-format="yyyy-MM-dd"
			placeholder="选择日期"
			:disabled="props.disabled || item.is_disabled"
			@focus="scrollForm(true)"
			@blur="scrollForm(false)"
		/>

		<!-- 单选 TODO 为符合需求兼容原本接口规则写死的部分  -->
		<el-select
			v-else-if="item.type === FORM_TYPE.SELECT && !special_props.includes(item.name) && !select_search_fields.includes(item.prop)"
			ref="select_ref"
			v-model="dynamic_form_data[item.prop]"
			class="w-full"
			:disabled="props.disabled || item.is_disabled"
			:placeholder="dynamic_form_data[`${item.prop}_options`]?.length ? '请选择' : (item.error_placeholder ?? '请选择')"
			:clearable="!item.is_require"
			@visible-change="scrollForm"
		>
			<el-option
				v-for="option in dynamic_form_data[`${item.prop}_options`]"
				:key="option.value"
				:label="option.label"
				:value="option.value"
			/>
		</el-select>
		<slot
			v-else-if="item.type === FORM_TYPE.SELECT && select_search_fields.includes(item.prop)"
			:name="item.prop"
		/>

		<select-icon
			v-else-if="item.type === FORM_TYPE.SELECT && item.name === ICON_PROP"
			ref="icon_select_ref"
			v-model="dynamic_form_data[item.prop]"
			:disabled="props.disabled || item.is_disabled"
			:things-type="thingsType"
			:class="{'disabled-icon-select-prefix':props.disabled || item.is_disabled}"
			@visible-change="scrollForm"
		/>

		<select-model
			v-else-if="item.type === FORM_TYPE.SELECT && item.name === MODEL_PROP"
			ref="model_select_ref"
			v-model="dynamic_form_data[item.prop]"
			:disabled="props.disabled || item.is_disabled"
			:class="{'disabled-icon-select-prefix':props.disabled || item.is_disabled}"
			:things-type="thingsType"
			@visible-change="scrollForm"
		/>
		<!-- 多选 -->
		<el-tooltip
			effect="dark"
			:content="multiple_select_tooltip[item.prop]"
			:disabled="!multiple_select_tooltip[item.prop] || !props.disabled"
			placement="top"
		>
			<el-select
				v-if="item.type === FORM_TYPE.MULTIPLE"
				ref="multiple_ref"
				v-model="dynamic_form_data[item.prop]"
				class="w-full dynamic-form-multiple-select"
				multiple
				collapse-tags
				:disabled="props.disabled || item.is_disabled"
				placeholder="请选择"
				@visible-change="scrollForm"
			>
				<el-option
					v-for="option in dynamic_form_data[`${item.prop}_options`]"
					:key="option.value"
					:label="option.label"
					:value="option.value"
				/>
			</el-select>
		</el-tooltip>
	</el-form-item>
</el-form>
</template>

<script>
export const FORM_TYPE = {
	"TEXT": 1, // 文本
	"IMG": 2, // 图片
	"DATETIME": 3, // 时间
	"DATE": 4, // 日期
	"SELECT": 5, // 单选
	"MULTIPLE": 6, // 多选
	"ATTACHMENT": 7 // 附件
};

export const TYPE_DEFAULT_VALUE = {
	[FORM_TYPE.TEXT]: "",
	[FORM_TYPE.IMG]: "",
	[FORM_TYPE.DATETIME]: "",
	[FORM_TYPE.DATE]: "",
	[FORM_TYPE.SELECT]: "",
	[FORM_TYPE.MULTIPLE]: [],
	[FORM_TYPE.ATTACHMENT]: [],
};
</script>
<script setup>
/*
	props.formItems数据格式约定
	{
		prop: string, // 表单验证成功后返回的字段数据对应的键名key
		name: string, // 字段name
		value: string | string[], // 字段对应的取值，新增表单时如果类型是多选框则value为空数组，其余为空字符串。
		type: number, // 字段类型
		rules: number, // 字段为文本类型时的长度约束
		options: Object[], // 字段选项-参考element-ui规范（针对单选、多选）
		is_require: number | boolean, // 是否必填
		is_custom: boolean, // 是否为自定义字段
		is_disabled: boolean // 是否禁用字段
		custom_rules: [] // 自定义验证对象数组（会在原有的验证规则上累加）-参考element-ui表单rules规范
		error_placeholder: string // 当select没有选项时的placeholder
	}
*/
import {Message, Notification} from "element-ui";
import {nextTick, ref, set, watch, computed} from "vue";

import {base_url} from "@/Config";
import SelectIcon from "@/components/DynamicForm/SelectIcon.vue";
import SelectModel from "@/components/DynamicForm/SelectModel.vue";

import FkDatePicker from "../ForThink/Form/FkDatePicker.vue";
import PreviewImage from "@/components/PreviewImage.vue";
import FileUpload from "@/components/FileUpload.vue";

const ICON_PROP = "二维图标";
const MODEL_PROP = "三维模型";
const PHOTO_PROP = "头像";
const special_props = [ICON_PROP, MODEL_PROP];
const select_search_fields = ["leader", "manager"];

const props = defineProps({
	formColumn: {
		type: Number,
		default: 3
	},
	formItems: {
		type: Array,
		required: true
	},
	disabled: {
		type: Boolean,
		default: false
	},
	scrollContainer: {
		type: String,
		default: ""
	},
	thingsType: { // 动态表单类型，用于二维三维图标选择（0: 全部类型, 1: 员工, 2: 车辆,3 : 访客, 5: 物资,6:承包商,7:承包商单位）
		type: Number,
		default: 0
	},
	adaptImage: { // 是否适配图片组件样式
		type: Boolean,
		default: true
	}
});

const select_ref = ref();
const multiple_ref = ref();
const datetime_ref = ref();
const date_ref = ref();
const icon_select_ref = ref();
const model_select_ref = ref();

const dynamic_form_ref = ref();

let custom_field_map = {};

const dynamic_form_data = ref({});

const rules = ref({});

const grid_columns_num = computed(() => props.formColumn);
const multiple_select_tooltip = ref({});
const attachment_validate_info = ref({});

// 初始化动态表单绑定数据
const initFormData = (item) => {
	// 由于vue2底层是defineProperty，所以动态增加属性必须使用set
	if (item.name === undefined || item.name === null || item.prop === undefined || item.prop === null) {
		console.error("formItems的name或props不能为空!", item);
	}
	if (item.type === FORM_TYPE.MULTIPLE) {
		set(dynamic_form_data.value, item.prop, item.value ? item.value : []);
		set(dynamic_form_data.value, `${item.prop}_options`, item.options);
		const option_obj = {};
		item.options.forEach(i => {
			option_obj[i.value] = i.label;
		});
		set(multiple_select_tooltip.value, `${item.prop}`, item.value ? item.value.map(val => option_obj[val]).join("、") : "");
	} else if (item.type === FORM_TYPE.SELECT) {
		set(dynamic_form_data.value, item.prop, item.value ? item.value : "");
		set(dynamic_form_data.value, `${item.prop}_options`, item.options);
	} else if (item.type === FORM_TYPE.ATTACHMENT) {
		set(dynamic_form_data.value, item.prop, item.value ? item.value : []);
	} else {
		set(dynamic_form_data.value, item.prop, item.value ? item.value : "");
	}

	// TODO 为符合需求兼容原本接口规则写死的部分
	if (special_props.includes(item.name)) {
		set(dynamic_form_data.value, item.prop, item.value);
	}
};

// 初始化表单规则
const initFormRule = (item) => {
	set(rules.value, item.prop, []);

	const addRequired = (message, trigger) => {
		return {required: true, message, trigger};
	};

	const addSizeLimit = (max) => {
		return {min: 1, max, message: `输入超出限制，最多${max}个字符`, trigger: "blur"};
	};

	// 初始化动态表单规则
	if (item.type === FORM_TYPE.TEXT) {
		if (item.is_require) {
			rules.value[item.prop].push(addRequired(`请输入${item.name}`, "blur"));
		}
		if (item.rules !== -1) {
			rules.value[item.prop].push(addSizeLimit(item.rules));
		}
		if (item.rules === -1) {
			rules.value[item.prop].push(addSizeLimit(item.is_custom ? 200 : 100));
		}
	}

	if (item.type === FORM_TYPE.IMG && item.is_require) {
		rules.value[item.prop].push(addRequired("请上传图片", "change"));
	}

	if (item.type === FORM_TYPE.ATTACHMENT && item.is_require) {
		rules.value[item.prop].push(addRequired("请上传附件", "change"));
	}

	if (item.type === FORM_TYPE.DATETIME && item.is_require) {
		rules.value[item.prop].push(addRequired("请选择时间", "change"));
	}

	if (item.type === FORM_TYPE.DATE && item.is_require) {
		rules.value[item.prop].push(addRequired("请选择日期", "change"));
	}

	if ((item.type === FORM_TYPE.SELECT || item.type === FORM_TYPE.MULTIPLE) && item.is_require) {
		rules.value[item.prop].push(addRequired(`请选择${item.name}`, "change"));
	}

	// 自定义验证规则
	if (typeof item.custom_rules === "object" && Array.isArray(item.custom_rules)) {
		rules.value[item.prop].push(...item.custom_rules);
	}
};

// 处理自定义字段
const initCustomFieldMap = (item) => {
	custom_field_map[item.prop] = item.is_custom;
};

const initForm = () => {
	dynamic_form_data.value = {};
	props.formItems.forEach(item => {
		initFormData(item);
		initFormRule(item);
		initCustomFieldMap(item);
	});

	/*
		TODO 适配图片组件样式
	*/
	nextTick(() => {
		if (!props.adaptImage)
			return;
		const items = document.querySelectorAll(".img-item");
		for (const item of items) {
			if (item.offsetLeft <= 10) { // 如果图片组件居左
				const next_item = item.parentNode?.nextElementSibling?.children[0];
				if (next_item) { // 因为左浮动原因，需要将右边组件设置margin-bottom将相邻组件挤下去，否则会样式错乱
					next_item.style.marginBottom = "96px";
				}
			}
		}
	});
};
initForm();

watch(() => props.formItems, () => {
	initForm();
});

const attachmentFileChange = (item) => {
	attachment_validate_info.value[item.prop] = !item.is_require || (item.is_require && dynamic_form_data.value[item.prop] && dynamic_form_data.value[item.prop].length) ? "" : "请上传附件";
};
const attachmentValidate = () => {
	props.formItems.map(item => {
		if (item.type === FORM_TYPE.ATTACHMENT) {
			attachment_validate_info.value[item.prop] = !item.is_require || (item.is_require && dynamic_form_data.value[item.prop] && dynamic_form_data.value[item.prop].length) ? "" : "请上传附件";
		}
	});
};

const handleRemoveImg = (prop_name) => {
	dynamic_form_data.value[prop_name] = "";
	dynamic_form_ref.value.validateField([prop_name]);
};

const beforeUpload = (prop_name) => {
	// 这里必须使用柯里化先提取到表单属性名
	return (file) => {
		console.log(file);
		const is_jpg = (file.type === "image/jpeg" || file.type === "image/png");
		const is_lt_5m = file.size / 1024 / 1024 < 5;

		if (!is_jpg) {
			Message.error("上传图片只能是 jpg/png 格式!");
			return false;
		}
		if (!is_lt_5m) {
			Message.error("上传图片大小不能超过 5MB!");
			return false;
		}

		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = (e) => {
			dynamic_form_data.value[prop_name] = e.currentTarget.result;
			dynamic_form_ref.value.validateField([prop_name]);
		};
	};
};

/**
 * 仅重置表单数据为默认值并清除校验结果
 */
const resetDataAndValidate = () => {
	dynamic_form_ref.value.resetFields();
};

/**
 * 重置表单数据（包括规则和自定义字段映射关系）
 */
const resetDynamicForm = () => {
	for (const key in props.formItems) {
		const prop = props.formItems[key].prop;
		const type = props.formItems[key].type;
		dynamic_form_data.value[prop] = TYPE_DEFAULT_VALUE[type];
	}

	dynamic_form_ref.value.clearValidate();
	custom_field_map = {};
	rules.value = {};
};

// 主要处理附件过滤uid
const formatDynamicData = (dynamic_form_data, key) => {
	const dynamic_item = props.formItems.find(item => item.prop === key && item.type === 7);
	if (dynamic_item && dynamic_form_data[key])	return dynamic_form_data[key].map(({name, size, path}) => ({name, size, path}));
	return dynamic_form_data[key];
};

/**
 * 验证表单
 * @returns {Promise<Object | Error>}
 */
const validateDynamicForm = () => {
	return new Promise((resolve, reject) => {
		attachmentValidate();
		dynamic_form_ref.value.validate((valid, e) => {
			if (valid) {
				const data = {
					dict_json: {} // 存放自定义字段数据
				};
				for (const key in dynamic_form_data.value) {
					if (!key.includes("_options")) {
						if (custom_field_map[key]) { // 自定义字段
							data.dict_json[key] = formatDynamicData(dynamic_form_data.value, key);
						} else { // 预设字段
							data[key] = dynamic_form_data.value[key];
						}
					}
				}
				for (const key in data.dict_json) {
					const dynamic_item = props.formItems.find(item => item.prop === key && item.type === 7);
					if (dynamic_item && data.dict_json[key].length && data.dict_json[key].find(item => !item.path)) {
						Notification({title: "失败", type: "error", message: "存在上传中的附件，保存失败"});
						return;
					}
				}
				resolve(data);
			} else {
				reject(e);
			}
		});
	});
};

const getDynamicFormData = () => {
	const data = {
		dict_json: {} // 存放自定义字段数据
	};

	for (const key in dynamic_form_data.value) {
		if (!key.includes("_options")) {
			if (custom_field_map[key]) { // 自定义字段
				data.dict_json[key] = dynamic_form_data.value[key];
			} else { // 预设字段
				data[key] = dynamic_form_data.value[key];
			}
		}
	}

	return data;
};

/**
 * 设置动态表单指定数据的值
 * @param {string} prop
 * @param {any} value
 */
const setFormValue = (prop, value) => {
	dynamic_form_data.value[prop] = value;
};

// 隐藏表单下拉项
const closeDownList = () => {
	if (Array.isArray(select_ref.value)) {
		select_ref.value.forEach(select => {
			select.blur();
		});
	}

	if (Array.isArray(multiple_ref.value)) {
		multiple_ref.value.forEach(select => {
			select.blur();
		});
	}

	if (Array.isArray(date_ref.value)) {
		date_ref.value.forEach(date => {
			date.$refs.date_picker.pickerVisible = false;
		});
	}

	if (Array.isArray(datetime_ref.value)) {
		datetime_ref.value.forEach(datetime => {
			datetime.$refs.date_picker.pickerVisible = false;
		});
	}

	// 定制组件只在对应的动态表单存在，因此在其他动态表单中可能不存在
	icon_select_ref.value?.[0]?.blur();
	model_select_ref.value?.[0]?.blur();
};

// 表单滚动隐藏
const scrollForm = (flag) => {
	const container = props.scrollContainer ? document.querySelector(props.scrollContainer) : null;
	if (flag) {
		container && container.addEventListener("scroll", closeDownList);
	} else {
		container && container.removeEventListener("scroll", closeDownList);
	}
};

defineExpose({
	resetDynamicForm,
	resetDataAndValidate,
	validateDynamicForm,
	setFormValue,
	getDynamicFormData
});
</script>

<style scoped>

.dynamic-form {
	display: grid;
	grid-template-columns: repeat(v-bind(grid_columns_num), 1fr);
	grid-column-gap: 16px;
}
.dynamic-form .el-form-item {
	margin-bottom: 20px;
}

.dynamic-form.el-form :deep(.el-form-item__label) {
	line-height: 16px;
}

.w-full {
	width: 100%;
}

.avatar-uploader :deep(.el-upload) {
	width: 104px;
	height: 104px;
	border: 1px dashed #d9d9d9;
	border-radius: 6px;
	cursor: not-allowed;
	position: relative;
	overflow: hidden;
}

.avatar-uploader-icon {
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	color: #D1D8E1;

}

.avatar-uploader-icon i {
	font-size: 28px;
}

.avatar {
	display: block;
	width: 100%;
	height: 100%;
}

.dynamic-form :deep(.el-upload-list--picture-card .el-upload-list__item) {
	width: 104px;
	height: 104px;
	margin: 0;
}

.dynamic-form :deep(.el-upload--picture-card) {
	width: 104px;
	height: 104px;
	line-height: 104px;
}

.avatar-uploader-hover :deep(.el-upload){
	cursor: pointer;
}

.custom-theme-blue .avatar-uploader-hover :deep(.el-upload:hover .avatar-uploader-icon) {
	color: #07f;
}

.custom-theme-green .avatar-uploader-hover :deep(.el-upload:hover .avatar-uploader-icon) {
	color: #3eb2a9;
}

.custom-theme-green .avatar-uploader-hover :deep(.el-upload:hover) {
	border-color: #3eb2a9;
}

.custom-theme-blue .avatar-uploader-hover :deep(.el-upload:hover) {
	border-color: #07f;
}

.el-upload__tip {
	color: #D1D8E1;
	line-height: 16px;
	margin: 0;
}

.form-tips {
	vertical-align: top;
	font-size: 16px;
	color: #D1D8E1;
	transform: rotate(180deg);
}
.disabled-icon-select-prefix {
	:deep(.icon-select-prefix){
		color: #d1d8e1;
	}
}

/*
	TODO 适配图片组件样式
*/
:deep(.img-item) {
	margin-bottom: 8px !important;
	grid-row-end: span 2;
}

:deep(.img-item .el-form-item__content) {
	height: 116px !important;
}

:deep(.attachment-item) {
	grid-column-start: span v-bind(grid_columns_num);
}

:deep(.attachment-item.is-required:not(.is-no-asterisk))>.el-form-item__label:before{
	margin-right: 0 !important;
}

:deep(.dynamic-form-multiple-select.el-select .el-tag) {
	max-width: 136px;
}

.dynamic-form-multiple-select :deep(.el-tag.el-tag--info) {
    border-radius: 12px !important;
}

.custom-theme-blue .dynamic-form-multiple-select :deep(.el-tag.el-tag--info .el-tag__close) {
    color: #07f;
    background-color: transparent;
}

.custom-theme-blue .dynamic-form-multiple-select :deep(.el-tag.el-tag--info .el-tag__close):hover {
    color: #fff !important;
    background-color: #07f !important;
}

.custom-theme-green .dynamic-form-multiple-select :deep(.el-tag.el-tag--info .el-tag__close) {
    color: #3eb2a9;
    background-color: transparent;
}

.custom-theme-green .dynamic-form-multiple-select :deep(.el-tag.el-tag--info .el-tag__close):hover {
    color: #fff !important;
    background-color: #3eb2a9 !important;
}
</style>
