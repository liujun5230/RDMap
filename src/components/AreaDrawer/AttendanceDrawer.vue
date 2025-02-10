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
						:from="draw_props.from"
						:btn-handle-auth="auth.handle && (props.area?.is_delete !== 1)"
						:is-edit="is_edit_mode"
						@go-to-draw="() => {props.area && emits('go-to-draw', AreaTypes.ATTENDANCE_AREA, props.area?.id, props.area?.floor_id)}"
						@enter-edit="is_edit_mode = true"
						@draw-end="() => form_el?.clearValidate('raw_area')"
					/>
				</div>
			</el-form-item>
			<anchor-title title="基础信息" />
			<el-form-item
				label="考勤区域名称"
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
					validate-text="禁用后，将导致此考勤区域关联考勤组下“未下班的员工”全部下班，请谨慎操作。"
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
								:disabled="!is_edit_mode"
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

			<anchor-title title="关联考勤组" />
			<el-form-item>
				<attendance-group-table
					:data="form.area_group_list"
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
import type {Form} from "element-ui";
import {ref, watch, inject, computed} from "vue";

import {assertExists} from "@/utils/ts/common";
import {checkAreaNameRepeat} from "@/api/area/area";
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
import AttendanceGroupTable from "./AttendanceGroupTable.vue";
import {useFloorInfo} from "./composable";
import {AreaTypes} from "./constant";
import {AreaDrawerProvideKey} from "./constant";
import DrawButton from "./DrawButton.vue";
import FkFormButton from "../ForThink/Button/FkFormButton.vue";
import MapItem from "./MapItem.vue";
import type {FloorInfo, Shape, Option, RawArea} from "./types";

const is_edit_mode = ref(false);
const auth = usePageAuth("/attendance#/group");
const system_auth = usePageAuth("/systemManage#/systemConfig");

export type SaveData = {
	id?: number;
	name: string;
	is_gps: number;
	floor_id: number;
	is_use: number;
	area: string;
	area_template_id: number;
	circle_attribute?: string;
	shape: 1 | 2
}

const emits = defineEmits<{
	// 切换形状
	(e: "change-shape", shape: Shape): void,
	// 切换模板
	(e: "change-template", area_template: AreaTemplate): void,
	(e: "save", payload: SaveData): void,
	(e: "reselect"): void,
	// 更新区域模板选项
	(e: "update-template-options"): void
	// 重新绘制
	(e: "clear-draw-content"): void
	// 前往绘制
	(e: "go-draw-content"): void
	(e: "update-raw-area"): void
	(e: "edit-mode-change", is_edit_mode: boolean): void
	(e: "refresh", data: {area_id?: number}): void
	(e: "close"): void
	// 前往绘制
	(e: "go-to-draw", type: AreaTypes.ATTENDANCE_AREA, id: number, floor_id: number): void

}>();

export type FormData = {
	area_name: string;
	shape: 1 | 2;
	is_use: number;
	area_template: AreaTemplate | undefined;
	id?: number;
	area_group_list: AttendanceGroup[];
}

type FormSubmitData = FormData & { area_template_id?: number }

const form = ref<FormData>({
	id: undefined,
	area_name: "",
	shape: 1,
	is_use: 1,
	area_template: undefined,
	area_group_list: []
});

type Props = {
	id?: number

	floorInfo: FloorInfo | undefined;

	areaData?: AreaData;

	areaTemplateOptions: Option<AreaTemplate>[],

	area?: AreaArchiveResult

	rawArea?: RawArea

	loading: boolean
}

const props = defineProps<Props>();

const disabled_form = computed(() => !is_edit_mode.value || props.loading);

const map = useFloorInfo(() => props.floorInfo);

function validateRawArea(rule: any, value: any, callback: any) {
	if (draw_props.value?.from === "map" && !props.rawArea?.area) {
		callback(new Error("请绘制区域"));
	} else {
		callback();
	}
}

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

const rules = ref({
	raw_area: [
		{validator: validateRawArea, trigger: "blur", required: true},
	],
	area_name: [
		{required: true, message: "请输入区域名称", trigger: "blur"},
		{validator: validateNameDuplicate, trigger: "blur"}
	],
	is_use: [
		{required: true, message: "请选择启用状态", trigger: "blur"}
	],
	area_template: [
		{required: true, message: "请选择关联区域模板", trigger: "blur"}
	],
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
	await until(() => props.rawArea?.area).toMatch((v) => !!v, {timeout: 300});

	const valid = await form_el.value?.validate();
	if (!valid) {
		return;
	}

	const {area_template, ...form_submit}: FormSubmitData = form.value;
	const area_template_id = area_template?.id!;
	assertExists(map.value?.floor_id);
	const area: SaveData = {
		...form_submit,
		area_template_id,
		area: props.rawArea?.area || "",
		circle_attribute: props.rawArea?.circle_attribute ?? undefined,
		floor_id: map.value.floor_id,
		id: form.value.id,
		// is_gps: map.value.is_gps,
		is_gps: 0,
		name: form.value.area_name,
		shape: props.rawArea?.circle_attribute ? 2 : 1
	};

	emits("save", area);
}

type AttendanceGroup = {
	area_list_json: string;
	attendance_group_name: string;
	attendance_type: number;
	frequent: string;
	id: number;
}
function resolveArea(area: AreaArchiveResult<AttendanceGroup>) {
	form.value = {
		id: area.id,
		shape: area.shape,
		area_name: area.name,
		is_use: area.is_use,
		area_template: props.areaTemplateOptions.find(item => item.value.id === area.area_template_id)?.value,
		// TODO 等后端加
		area_group_list: props.area?.rule
	};

	if (form.value.area_template) {
		changeTemplate(form.value.area_template);
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
</style>
