<template>
<div	class="form-container">
	<div class="form-content">
		<!-- 添加区域模板 -->
		<add-template
			ref="add-template"
			:visible.sync="area_template_visible"
			@get-area-template="getAreaTemplateOption"
		/>

		<el-form
			ref="form_el"
			label-position="top"
			:rules="rules"
			:model="form"
			size="small"
			:disabled="disabled_form"
			class="drawer-form"
		>
			<anchor-title title="位置数据" />
			<el-form-item>
				<!-- 所在地图 -->
				<map-item
					v-if="map.floor_id"
					:area-id="draw_props?.area_id"
					:map="map.map"
					:floor-id="map.floor_id"
					:disabled="is_edit_mode"
				/>
			</el-form-item>
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
						@go-to-draw="() => {props.area && emits('go-to-draw', AreaTypes.UP_DOWN_PIT, props.area?.id, props.area?.floor_id)}"
						@enter-edit="is_edit_mode = true"
						@draw-end="() => form_el?.clearValidate('raw_area')"
					/>
				</div>
			</el-form-item>
			<anchor-title title="基础信息" />
			<el-form-item
				:label="resolveCustomText('pit_name')"
				prop="area_name"
			>
				<el-input
					v-model="form.area_name"
					placeholder="请输入"
				/>
			</el-form-item>

			<el-form-item
				label="启用状态"
				prop="is_use"
			>
				<status-select
					v-model="form.is_use"
					validate
					:validate-text="`禁用后，可能将导致定位对象无法正常${resolveCustomText('pit_action')}，请谨慎操作`"
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

			<el-form-item
				:label="resolveCustomText('pit_type')"
				prop="area_type"
			>
				<template #label>
					<span class="label-content">{{ resolveCustomText('pit_type') }}</span>
					<el-tooltip
						placement="top"
						:content="`第一区域到第二区域是${resolveCustomText('enter_pit')}，第二区域到第一区域是${resolveCustomText('leave_pit')}`"
					>
						<i class="el-icon-warning-outline" />
					</el-tooltip>
				</template>
				<el-select
					v-model="form.area_type"
					placeholder="请选择"
				>
					<el-option
						v-for="item in props.areaTypeOptions"
						:key="item.value"
						:label="item.label"
						:value="item.value"
					/>
				</el-select>
			</el-form-item>
		</el-form>
	</div>
	<fk-form-button
		v-model="is_edit_mode"
		:loading="loading"
		:handle-auth="auth.handle && !area?.is_delete"
		class="button-group"
		@confirm="saveArea"
		@cancel="cancel"
	/>
</div>
</template>

<script setup lang="ts">
import type {Form} from "element-ui";
import {ref, watch, inject, computed} from "vue";

import {assertExists} from "@/utils/ts/common";
import {checkAreaNameRepeat} from "@/api/area/area";
import {resolveCustomText} from "@/store/modules/featureFlags";
import {until} from "@vueuse/core";
import {usePageAuth} from "@/utils/js/authentication";
import type {AreaTemplate} from "@/components/types";
import type {AreaData} from "@/types/area";
import type {AreaArchiveResult} from "@/api/archives/archives";

import AddTemplate from "../AreaTemplate/AreaTemplateDialog.vue";
import LabelButton from "../Button/LabelButton.vue";
import TwoCols from "../Layout/TwoCols.vue";
import AnchorTitle from "../AnchorTitle.vue";
import StatusSelect from "../StatusSelect.vue";
// import RuleDialog from "./AssociatedRule.vue";
import {useFloorInfo} from "./composable";
import {AreaTypes} from "./constant";
import {AreaDrawerProvideKey} from "./constant";
// import DrawAreaButton from "./DrawAreaButton.vue";
import DrawButton from "./DrawButton.vue";
import FkFormButton from "../ForThink/Button/FkFormButton.vue";
import MapItem from "./MapItem.vue";

import type {
	FloorInfo,
	Option,
	PitAreaSubmitData
} from "./types";
import {type RawArea} from "./types";

const is_edit_mode = ref(false);
const auth = usePageAuth("/upDownPit#/area");
const system_auth = usePageAuth("/systemManage#/systemConfig");

export type SaveData = PitAreaSubmitData
const emits = defineEmits<{
	// 切换模板
	(e: "change-template", area_template: AreaTemplate): void,
	(e: "save", payload: SaveData): void,
	// 更新区域模板选项
	(e: "update-template-options"): void
	// 重新绘制
	(e: "clear-draw-content"): void
	// 前往绘制
	(e: "go-draw-content"): void
	(e: "update-raw-area"): void
	(e: "edit-mode-change", is_edit_mode: boolean): void
	(e: "refresh", data: {area_id?: number}): void
	(e: "close"): void,
	// 前往绘制
	(e: "go-to-draw", type: AreaTypes.UP_DOWN_PIT, id: number, floor_id: number): void
}>();

export type FormData = {
	area_name: string;
	shape: 1 | 2;
	is_use: number;
	area_template: AreaTemplate | undefined;
	area_type: number;
	id?: number;
}

type FormSubmitData = FormData & { area_template_id?: number }

const form = ref<FormData>({
	id: undefined,
	area_name: "",
	shape: 1,
	is_use: 1,
	area_template: undefined,
	area_type: 9,
});

type Props = {
	id?: number

	floorInfo: FloorInfo | undefined
	areaTypeOptions?: {
		label: string;
		value: number;
	}[];

	areaData?: AreaData;

	areaTemplateOptions: Option<AreaTemplate>[],

	area?: AreaArchiveResult

	rawArea?: RawArea

	loading: boolean
}

const props = defineProps<Props>();

const disabled_form = computed(() => !is_edit_mode.value || props.loading);

const map = useFloorInfo(() => props.floorInfo!);

function validateRawArea(rule: unknown, value: unknown, callback: (arg?: unknown) => {}) {
	if (draw_props.value?.from === "map" && !props.rawArea?.area) {
		return callback(new Error("请绘制区域"));
	}

	callback();
}

async function validateNameDupicate(rule: unknown, value: string, callback: (arg?: unknown) => {}) {
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

const rules = ref({
	raw_area: [{validator: validateRawArea, trigger: "blur", required: true}],
	area_name: [
		{required: true, message: "请输入区域名称", trigger: "blur"},
		{validator: validateNameDupicate, trigger: "blur"},
	],
	is_use: [
		{required: true, message: "请选择启用状态", trigger: "blur"}
	],
	area_template: [
		{required: true, message: "请选择关联区域模板", trigger: "blur"}
	],
	area_type: [
		{required: true, message: "请选择区域类型", trigger: "blur"}
	]
});

const area_template_visible = ref(false);

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

function changeTemplate(area_template: AreaTemplate) {
	if (area_template) {
		form.value.area_template = area_template;
		emits("change-template", form.value.area_template);
	}
}

const form_el = ref<InstanceType<typeof Form>>();

// 保存区域
async function saveArea() {
	emits("update-raw-area");

	await until(() => props.rawArea?.area).toBeTruthy({timeout: 300});

	const valid = await form_el.value?.validate();

	if (!valid) {
		return;
	}

	const {id, area_template, area_type, ...form_submit}: FormSubmitData = form.value;
	const area_template_id = area_template?.id!;

	const area = props.rawArea?.area ?? "";
	const circle_attribute = props.rawArea?.circle_attribute ?? undefined;
	assertExists(map.value?.floor_id);
	const save_data: SaveData = {
		...form_submit,
		area_id: id,
		type: area_type,
		area_template_id,
		floor_id: map.value.floor_id,
		area,
		circle_attribute,
		shape: props.rawArea?.circle_attribute ? 2 : 1,
	};

	emits("save", save_data);
}

function resolveArea(area: AreaArchiveResult) {
	form.value = {
		id: area.id,
		area_name: area.name,
		shape: area.shape,
		is_use: area.is_use,
		area_template: props.areaTemplateOptions.find(item => item.value.id === area.area_template_id)?.value,
		area_type: area.type,
	};

	if (form.value.area_template) {
		changeTemplate(form.value.area_template);
	}
}

// 处理打开编辑模式
function cancel() {
	/**
	 * 1. 编辑-退出编辑模式
	 * 2. 新增-关闭抽屉
	 */
	if (props.area) {
		// 恢复表单
		resolveArea(props.area);
		is_edit_mode.value = false;
		form_el.value?.clearValidate();
		emits("refresh", {area_id: props.area?.id});
	} else {
		// 退出
		is_edit_mode.value = false;
		emits("close");
	}
}

watch(() => [props.area, props.areaTemplateOptions], () => {
	if (props.area) {
		resolveArea(props.area);
	}

	if (!draw_props.value?.area_id && props.areaTemplateOptions.length && !form.value.area_template) {
		form.value.area_template = props.areaTemplateOptions[0].value;
		changeTemplate(form.value.area_template);
	}
});

const draw_props = ref(inject(AreaDrawerProvideKey));
watch(() => draw_props.value?.area_id, (area_id) => {
	if (area_id) {
		is_edit_mode.value = false;
	} else {
		is_edit_mode.value = true;
	}
}, {immediate: true});

watch(is_edit_mode, () => {
	emits("edit-mode-change", is_edit_mode.value);
}, {immediate: true});

defineExpose({
	exitEditMode: () => {
		is_edit_mode.value = false;
	},
	// 恢复之前的数据
	restoreFormData: (old_form: FormData) => {
		// 进入编辑模式
		is_edit_mode.value = true;
		form.value = old_form;
	},
	getFormData: () => form.value
});
</script>

<style scoped>
.form-container :deep(.el-form-item__label:has(.layout-two-cols)) {
	display: flex;
	width: 100%;
	max-height: 24px;
}

.layout-two-cols {
	flex: 1;
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

.label-content {
	margin-right: 5px;
}
</style>
