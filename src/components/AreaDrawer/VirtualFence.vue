<template>
<div
	class="form-container"
>
	<div class="form-content">
		<!-- 添加区域模板 -->
		<add-template
			ref="add-template"
			:visible.sync="area_template_visible"
			@get-area-template="getAreaTemplateOption"
		/>

		<!-- 选择规则 -->
		<rule-dialog
			ref="rule_dialog"
			v-model="show_select_rule_dialog"
			:rule-data="form.alarm_rule_list"
			@save="handleAssociateRule"
		/>

		<el-form
			ref="form_el"
			label-position="top"
			:rules="rules"
			:model="form"
			size="small"
			class="drawer-form"
			:disabled="disabled_form"
		>
			<anchor-title title="位置数据" />
			<el-form-item>
				<!-- 所在地图 -->
				<map-item
					v-if="map.floor_id"
					class="map-item"
					:area-id="draw_props?.area_id"
					:map="map.map"
					:floor-id="map.floor_id"
					:disabled="is_edit_mode"
				/>
				<el-form-item
					label="绘制区域"
					prop="raw_area"
				>
					<div class="shape-select-container">
						<draw-button
							v-if="draw_props"
							:btn-handle-auth="auth.handle && (props.area?.is_delete !== 1)"
							:from="draw_props.from"
							:is-edit="is_edit_mode"
							@go-to-draw="() => {props.area && emits('go-to-draw', AreaTypes.VIRTUAL_FENCE, props.area?.id, props.area?.floor_id)}"
							@enter-edit="is_edit_mode = true"
							@draw-end="() => form_el?.clearValidate('raw_area')"
						/>
					</div>
				</el-form-item>
				<anchor-title title="基础信息" />
				<dynamic-form
					ref="dynamic_form_ref"
					:disabled="disabled_form"
					:form-column="1"
					:form-items="dynamic_form"
					:adapt-image="false"
				/>

				<el-form-item
					label="启用状态"
					prop="is_use"
				>
					<status-select
						v-model="form.is_use"
						validate
						validate-text="“禁用”电子围栏后，将导致触发此电子围栏的“告警状态”为“告警中”的告警全部结束；"
					/>
				</el-form-item>

				<el-form-item
					label="关联区域模板"
					prop="area_template"
				>
					<template #label>
						<two-cols>
							<template #left>
								<span>关联区域模板</span>
							</template>
							<template #right>
								<label-button
									v-if="auth.handle && system_auth.handle"
									@click="area_template_visible = true"
								>
									新增模板
								</label-button>
							</template>
						</two-cols>
					</template>
					<el-select
						v-model="form.area_template"
						placeholder="请选择"
						value-key="id"
						@change="changeTemplate"
					>
						<el-option
							v-for="item in props.areaTemplateOptions"
							:key="item.value.id"
							:label="item.label"
							:value="item.value"
						/>
					</el-select>
				</el-form-item>

				<!-- 关联规则 -->
				<two-cols>
					<template #left>
						<anchor-title title="关联规则" />
					</template>

					<template #right>
						<label-button @click="show_select_rule_dialog = true">
							关联
						</label-button>
					</template>
				</two-cols>
				<rule-table
					:show-handle="is_edit_mode"
					:data="rule_data"
					@delete-rule="deleteRule"
					@refresh="updateRuleList"
				/>
			</el-form-item>
		</el-form>
	</div>
	<fk-form-button
		v-model="is_edit_mode"
		:handle-auth="auth.handle && !area?.is_delete"
		class="button-group"
		:loading="loading"
		@confirm="saveArea"
		@cancel="cancel"
	/>
</div>
</template>

<script setup lang="ts">
import {Notification, type Form} from "element-ui";
import {ref, computed, watch, inject, provide} from "vue";

import {assertExists} from "@/utils/ts/common";
import {checkAreaNameRepeat} from "@/api/area/area";
import {getRuleType, type RuleTypeResultItem} from "@/api/alarm/configuration";
import {until} from "@vueuse/core";
import {usePageAuth} from "@/utils/js/authentication";
import DynamicForm from "@/components/DynamicForm/DynamicForm.vue";
import type {AreaTemplate} from "@/components/types";
import {type AreaArchiveResult} from "@/api/archives/archives";

import AddTemplate from "../AreaTemplate/AreaTemplateDialog.vue";
import LabelButton from "../Button/LabelButton.vue";
import TwoCols from "../Layout/TwoCols.vue";
import AnchorTitle from "../AnchorTitle.vue";
import StatusSelect from "../StatusSelect.vue";
import RuleDialog, {type TableRow as RuleTableRow} from "./AssociatedRule.vue";
import {useFloorInfo} from "./composable";
import {AreaDrawerProvideKey, AreaTypes} from "./constant";
import DrawButton from "./DrawButton.vue";
import FkFormButton from "../ForThink/Button/FkFormButton.vue";
import {RULE_AUTH_KEY, RULE_TYPE_KEY} from "./keys";
import MapItem from "./MapItem.vue";
import RuleTable from "./RuleTable.vue";
import {type RawArea} from "./types";
import type {AreaSubmitData, Shape, Option, AreaDict, AreaGroup, Rule, DynamicData, FloorInfo} from "./types";
import {getAlarmRule} from "@/api/area/alarmRule";

const area_fields = ["area_type", "area_name", "area_group"] as const satisfies AreaDict["field"][];
const draw_props = ref(inject(AreaDrawerProvideKey));
const is_edit_mode = ref(false);

const emits = defineEmits<{
	// 切换形状
	(e: "change-shape", shape: Shape): void,
	// 切换模板
	(e: "change-template", area_template: AreaTemplate): void,
	(e: "save", payload: AreaSubmitData): void,
	(e: "reselect"): void,
	// 更新区域模板选项
	(e: "update-template-options"): void
	(e: "update-raw-area"): void
	(e:"edit-mode-change", is_edit: boolean): void
	(e: "refresh", data: {area_id?: number}): void
	(e: "close"): void
	// 前往绘制
	(e: "go-to-draw", type: AreaTypes.VIRTUAL_FENCE, id: number, floor_id: number): void
}>();

export type FormData={
	id?: number;
	name: string;
	shape: 1 | 2;
	is_use: number;
	area_template: AreaTemplate | undefined;
	area_type: number;
	area_group?: number;
	area_dict: Record<string, string | number | number[]>;
	alarm_rule_list: number[]
}

type FormSubmitData = FormData & {area_template_id?: number}
const auth = usePageAuth("/gpsManage#/regionalManagement");

// 系统设置权限
const system_auth = usePageAuth("/systemManage#/systemConfig");

const rule_auth = usePageAuth("/gpsManage#/rule");
const form = ref<FormData>({
	id: undefined,
	name: "",
	shape: 1,
	is_use: 1,
	area_template: undefined,
	area_type: 0,
	area_group: 0,
	area_dict: {},
	alarm_rule_list: []
});

type Props = {
	id?: number

	areaTypeOptions?: {
		label: string;
		value: string;
	}[];

	areaGroupOptions?: Option<AreaGroup>[];

	areaTemplateOptions: Option<AreaTemplate>[],

	areaDict: AreaDict[]

	floorInfo: FloorInfo | undefined,

	area?: AreaArchiveResult,

	rawArea?: RawArea

	loading: boolean
}

const props = defineProps<Props>();

const map = useFloorInfo(() => props.floorInfo!);

const disabled_form = computed(() => !is_edit_mode.value || props.loading || !auth.value.handle || props.area?.is_delete === 1);

function validateRawArea(rule: any, value: any, callback: any) {
	if (draw_props.value?.from === "map" && !props.rawArea?.area) {
		return callback(new Error("请绘制区域"));
	}

	callback();
}

const rules = ref({
	raw_area: [
		{validator: validateRawArea, trigger: "blur", required: true},
	],
	is_use: [
		{required: true, message: "请选择启用状态", trigger: "blur"}
	],
	area_template: [
		{required: true, message: "请选择关联区域模板", trigger: "blur"}
	],
});

const area_template_visible = ref(false);

const show_select_rule_dialog = ref(false);

async function validateNameDuplicate(rule: unknown, value: string, callback: (arg?: unknown) => {}) {
	const data = {
		name: value,
		id: props.area?.id
	};

	const resp = await checkAreaNameRepeat(data);

	if (!resp.data.result.check) {
		return callback(new Error(resp.data.result.msg ?? "区域名称校验失败"));
	}

	return callback();
}

const dynamic_form_ref = ref<InstanceType<typeof DynamicForm>>();
const dynamic_form = computed(() => {
	let value: string | number | number[];
	return props.areaDict.map(dict => {
		let error_placeholder: string = "";
		let custom_rules;
		switch (dict.field) {
		// case "区域名称":
		case "area_name":
			value = form.value.name;
			custom_rules = [{validator: validateNameDuplicate, trigger: "blur"}];
			break;
		// case "区域类型":
		case "area_type":
			value = form.value.area_type;
			break;
		// case "区域分组":
		case "area_group":

			value = form.value.area_group ?? "";
			error_placeholder = "暂无数据，请前往字典添加数据";
			break;
		default:
			value = (form.value.area_dict)[dict.id];
			// 5 单选
			dict.type === 5 && (typeof value !== "number") && (value = value?.[0]);
			break;
		}
		const options = (dict.option || []).map((item) => ({label: item.name, value: item.id}));
		const default_value = dict.type === 6 ? [options[0]?.value].filter(Boolean) : options[0]?.value;
		return dict.is_display ? {
			prop: `${dict.id}`,
			name: dict.name,
			value: props.area ? value : default_value,
			type: dict.type,
			rules: dict.type_size,
			is_require: !!dict.is_require,
			is_custom: !(area_fields).includes(dict.field),
			options,
			custom_rules,
			error_placeholder
		} : null;
	}).filter(Boolean);
});

function getAreaTemplateOption(area_template_id: number) {
	emits("update-template-options");

	until(() => props.areaTemplateOptions)
		.toMatch((options) => !!options.find(option => option.value.id === area_template_id))
		.then(() => {
			const area_template = props.areaTemplateOptions.find(item => item.value.id === area_template_id);
			if (area_template) {
				form.value.area_template = area_template.value;
			}
		});
}

const rule_data = ref<RuleTableRow[]>([]);
const rule_types = ref<RuleTypeResultItem[]>([]);

provide(RULE_TYPE_KEY, rule_types);
provide(RULE_AUTH_KEY, rule_auth);

async function fetchRuleTypes() {
	try {
		const resp = await getRuleType({
			alarm_type_id: 1
		});
		if (resp.data.type === 1) {
			rule_types.value = resp.data.result;
		}
	} catch (e) {
		console.error(e);
	}
}

fetchRuleTypes();

watch(() => props.area, async (area) => {
	if (area) {
		rule_data.value = area.rule;
	}
});

function handleAssociateRule(rule_list: RuleTableRow[]) {
	show_select_rule_dialog.value = false;
	rule_data.value = rule_list.map(rule => {
		return {
			rule_group_name: rule.rule_group,
			...rule
		};
	});
	form.value.alarm_rule_list = rule_list.map(rule => rule.id);
}

function deleteRule(rule: Rule) {
	form.value.alarm_rule_list = form.value.alarm_rule_list.filter(id => id !== rule.id);
	rule_data.value = rule_data.value.filter(item => item.id !== rule.id);
}

async function updateRuleList() {
	const resp = await getAlarmRule();
	if (resp.data.type === 1) {
		rule_data.value = resp.data.result.data
			.filter(rule => form.value.alarm_rule_list.includes(rule.id))
			.map(rule => {
				return {
					rule_group_name: rule.rule_group,
					...rule
				};
			});
	} else {
		Notification.error({
			title: "错误",
			message: resp.data.result as any as string,
		});
	}
}

function changeTemplate(area_template: AreaTemplate) {
	if (area_template) {
		form.value.area_template = area_template;
		emits("change-template", form.value.area_template);
	}
}

const form_el = ref<InstanceType<typeof Form>>();

const hidden_area_dict = computed(() => {
	const result: Record<string, string | number | number[]> = {};
	return props.areaDict.reduce((result, {id, is_display, field}) => {
		if (!is_display && !area_fields.includes(field)) {
			const value = props.id ? (form.value.area_dict || {})[id] : "";
			result[id] = value;
		}
		return result;
	}, result);
});
// 保存区域
async function saveArea() {
	emits("update-raw-area");

	await until(() => props.rawArea?.area).toBeTruthy({timeout: 300});
	await form_el.value?.validate();
	const validate_dynamic = dynamic_form_ref.value?.validateDynamicForm();

	const result = await Promise.all([validate_dynamic]);
	const {dict_json, ...area_data} = result[0] as DynamicData;
	const custom_area_dict: Record<string, number | number[]> = {};
	const dict_type_map = new Map(props.areaDict.map(dict => [dict.id, dict.type]));
	for (const [dict_id, value] of Object.entries(dict_json)) {
		const type = dict_type_map.get(Number(dict_id));
		custom_area_dict[dict_id] = type === 5 ? [value] : value;
	}

	/**
	 * 字段和动态表单中的数据重复, area_type, area_group 提取出来
	 */
	const {area_template, ...form_submit}: FormSubmitData = form.value;

	const {area_style, relative_end, relative_start} = form.value.area_template!;
	const area_template_id = area_template?.id!;

	const area = props.rawArea?.area ?? props.area?.area;
	const circle_attribute = props.rawArea?.circle_attribute ?? undefined;
	assertExists(map.value?.floor_id);
	assertExists(area);
	const save_data: AreaSubmitData = {
		...form_submit,
		area_template_id,

		name: area_data[1],
		area_type_option_id: area_data[2] ? area_data[2] : undefined,
		area_group_list: area_data[3] ? [area_data[3]] : undefined,
		// 自定义区域字典存放在 area_dict
		area_dict: {
			...custom_area_dict,
			...hidden_area_dict.value
		},

		area_style,
		relative_start,
		relative_end,
		is_show: 1,
		alarm_rule_list: form.value.alarm_rule_list,
		is_gps: map.value.is_gps ?? 0,
		area,
		type: 1,
		circle_attribute,
		floor_id: map.value.floor_id,
	};

	emits("save", save_data);
}

function cancel() {
	if (props.area) {
		// 恢复表单
		resolveArea(props.area);
		is_edit_mode.value = false;
		emits("refresh", {area_id: props.area?.id});
	} else {
		// 退出
		is_edit_mode.value = false;
		emits("close");
	}
}

function resolveArea(area: AreaArchiveResult) {
	form.value = {
		id: area.id,
		name: area.name,
		shape: area.shape,
		is_use: area.is_use,
		area_template: props.areaTemplateOptions.find(item => item.value.id === area.area_template_id)?.value,
		area_type: area.area_type_id,
		area_group: area.area_group?.length ? +area.area_group[0].id : undefined,
		area_dict: area.area_dict,
		alarm_rule_list: area.rule.map(rule => rule.id)
	};

	if (form.value.area_template) {
		changeTemplate(form.value.area_template);
	}

	rule_data.value = area.rule;
}
watch(() => [props.area, props.areaTemplateOptions], () => {
	// 处理打开编辑模式
	if (props.area) {
		resolveArea(props.area);
	}

	if (!draw_props.value?.area_id && props.areaTemplateOptions.length && !form.value.area_template) {
		form.value.area_template = props.areaTemplateOptions[0].value;
		changeTemplate(form.value.area_template);
	}
});

watch(is_edit_mode, () => {
	emits("edit-mode-change", is_edit_mode.value);
}, {immediate: true});

watch(() => draw_props.value?.area_id, (area_id) => {
	if (area_id) {
		is_edit_mode.value = false;
	} else {
		is_edit_mode.value = true;
	}
}, {immediate: true});

/**
 * 从动态表单获取数据，合并到 form 中
 */
function mergeFormData() {
	const {dict_json, ...area_data} = dynamic_form_ref.value?.getDynamicFormData() as DynamicData;
	const custom_area_dict: Record<string, string | number | number[]> = {};
	const dict_type_map = new Map(props.areaDict.map(dict => [dict.id, dict.type]));
	for (const [dict_id, value] of Object.entries(dict_json)) {
		const type = dict_type_map.get(Number(dict_id));
		custom_area_dict[dict_id] = type === 5 ? [value] : value;
	}

	return {
		id: form.value.id,
		name: area_data[1],
		shape: form.value.shape,
		is_use: form.value.is_use,
		area_template: form.value.area_template,
		area_type: area_data[2],
		area_group: area_data[3],
		area_dict: {
			...custom_area_dict,
			...hidden_area_dict.value
		},
		alarm_rule_list: form.value.alarm_rule_list
	} satisfies FormData;
}

defineExpose({
	exitEditMode: () => {
		is_edit_mode.value = false;
	},

	// 恢复之前的数据
	restoreFormData: (old_form: FormData) => {
		// 进入编辑模式
		is_edit_mode.value = true;
		form.value = old_form;
		console.log("old_form", old_form);
	},

	// 保存现在的数据
	getFormData: () => {
		return mergeFormData();
	}
});

</script>

<style scoped>
.form-container :deep(.el-form-item__label:has(.layout-two-cols)) {
  display: flex;
  width: 100%;
	max-height: 24px;
}

.form-container :deep(.el-form-item--small.el-form-item .el-form-item__content),
.form-container :deep(.anchor-title)
 {
	line-height: 14px;
}

.form-container :deep(.layout-two-cols .anchor-title) {
	margin-bottom: 0px !important;
}

.form-container :deep(.layout-two-cols) {
	margin-bottom: 8px;
}

.form-container :deep(.map-item) {
	margin-bottom: 20px;
}

.form-container .form-content :deep(.el-form-item .el-form-item:has(.shape-select-container)) {
	margin-bottom: 24px !important;
}

.layout-two-cols {
  flex:1;
}

.form-container {
  --padding: 1rem;
  height: calc(100% - 50px);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-x: auto;
}

.form-content {
  padding-top: var(--padding);
  padding-inline: var(--padding);
  flex: 1;
  overflow-y: auto;
}

:deep(.el-select) {
  width: 100%;
}

.shape-select {
  width: 90px;
}

.shape-select-container {
  display: flex;
  align-items: center;
  column-gap: 12px;
}

.button-group {
  padding-bottom: var(--padding);
  padding-inline: var(--padding);
}
</style>
