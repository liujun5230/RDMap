<template>
<div class="call-area-drawer">
	<div class="call-area-body">
		<div class="location-wrap">
			<anchor-title title="位置数据" />
			<map-item
				:map="map_info.map_name"
				:floor-id="map_info.floor_id"
				:disabled="editable"
				style="margin-top: 16px;margin-bottom: 20px;font-size: 14px;"
			/>
			<anchor-title
				title="绘制区域"
				:style="required_style"
			/>
			<draw-area-button
				v-show="from === 'map' && editable"
				style="margin-top: 8px;"
				@draw-end="verifyDrawArea"
			/>
			<div style="margin-top: 8px;">
				<el-button
					v-if="auth.handle && !is_delete_rule && (from !== 'map' || !editable)"
					type="primary"
					plain
					class="without-mr"
					@click="jumpToDraw"
				>
					前往绘制
				</el-button>
			</div>
			<span
				v-show="!draw_area_verification"
				class="el-form-item__error"
			>
				请绘制区域
			</span>
		</div>

		<div class="base-info-wrap">
			<anchor-title title="基础信息" />
			<el-form
				ref="form_ref"
				label-position="top"
				:rules="rules"
				:model="form"
				:disabled="!editable"
				size="small"
				style="margin-top: 16px;"
			>
				<el-form-item
					label="区域名称"
					prop="area_name"
				>
					<el-input
						v-model="form.area_name"
						placeholder="请输入"
					/>
				</el-form-item>
				<el-form-item
					class="area-template-form-item"
					prop="area_template_id"
				>
					<template #label>
						<div class="area-template-form-label">
							<anchor-title
								title="关联区域模板"
								:style="required_style"
							/>
							<label-button
								v-if="system_auth.handle"
								:disabled="!editable"
								@click="openAreaTemplateDialog"
							>
								新增模板
							</label-button>
						</div>
					</template>
					<el-select
						v-model="form.area_template_id"
						@change="changeAreaTemplate"
					>
						<el-option
							v-for="item in area_template_list"
							:key="item.id"
							:label="item.name"
							:value="item.id"
						/>
					</el-select>
				</el-form-item>
			</el-form>
		</div>

		<div class="association-call-wrap">
			<div class="call-plans-header">
				<anchor-title title="关联点名计划" />
				<label-button
					:disabled="!editable"
					@click="openAssociationDialog"
				>
					关联
				</label-button>
			</div>
			<fk-table
				:data="table_data"
				class="call-table"
				max-height="454px"
			>
				<el-table-column
					prop="name"
					label="点名计划名称"
				>
					<template #default="{row, column}">
						<text-ellipsis
							style="width: 100%;"
							class="clickable-text"
							@click="openAnchorDialog(row)"
						>
							{{ row[column.property] }}
						</text-ellipsis>
					</template>
				</el-table-column>
				<fk-tag-table-column
					prop="applicable_objects"
					label="点名对象"
					@click="openArchiveDialog"
				/>
				<el-table-column
					prop="is_use"
					label="启用状态"
				>
					<template #default="{row, column}">
						<text-ellipsis style="width: 100%;">
							<span
								v-if="row[column.property] == 1"
								style="color: #5db92e;"
							>启用</span>
							<span
								v-else
								style="color: #f56c6c"
							>禁用</span>
						</text-ellipsis>
					</template>
				</el-table-column>
				<el-table-column
					v-if="editable"
					label="操作"
					width="48"
				>
					<template #default="{row}">
						<el-tooltip
							effect="dark"
							content="删除"
							placement="top"
						>
							<fk-table-button
								size="mini"
								type="danger"
								icon="op-icon-delete"
								circle
								plain
								@click="handleDelete(row)"
							/>
						</el-tooltip>
					</template>
				</el-table-column>
			</fk-table>
		</div>
	</div>
	<div
		v-if="show_footer"
		class="call-area-footer"
	>
		<el-button
			v-if="editable"
			size="small"
			plain
			@click="handleCancel"
		>
			取消
		</el-button>
		<el-button
			v-if="editable"
			:loading="loading"
			type="primary"
			size="small"
			@click="handleSave"
		>
			保存
		</el-button>
		<el-button
			v-if="!editable"
			type="primary"
			size="small"
			@click="updateEditable(true)"
		>
			编辑
		</el-button>
	</div>

	<area-template-dialog
		:visible.sync="area_template_visible"
		@get-area-template="fetchAreaTemplateData"
	/>
	<call-association-plans-dialog
		ref="call_association_plans_dialog"
		v-model="plans_visible"
		:selected-list.sync="table_data"
		@open-archive-dialog="openArchiveDialog"
		@open-area-dialog="openAreaDrawer"
		@open-anchor-dialog="openAnchorDialog"
	/>
	<archive-dialog
		ref="archive_dialog"
		@close-archive-dialog="handleSaveCallDialog"
	/>

	<call-plans-dialog
		:id="call_plans_dialog_data.id"
		v-model="call_plans_dialog_data.visible"
		:mode.sync="call_plans_dialog_data.mode"
		@save-success="handleSaveCallDialog"
	/>

	<area-drawer
		ref="area_drawer"
		@refresh="handleSaveCallDialog"
	/>
</div>
</template>

<script setup lang="ts">
import {ref, shallowRef, nextTick, computed, watch} from "vue";
import {Notification, Form as ElForm} from "element-ui";

import {call_setting_route_name} from "@/Config";
import {usePageAuth} from "@/utils/js/authentication";
import {useLoading} from "@/composable/useLoading";
import {DIALOG_MODE} from "@/components/Dialog/constant";
import AnchorTitle from "@/components/AnchorTitle.vue";
import LabelButton from "@/components/Button/LabelButton.vue";
import FkTable from "@/components/ForThink/Table/FkTable.vue";
import FkTagTableColumn from "@/components/ForThink/Table/FkTagTableColumn.vue";
import ArchiveDialog from "@/components/ArchiveDialog/ArchiveDialog.vue";
import AreaTemplateDialog from "@/components/AreaTemplate/AreaTemplateDialog.vue";
import type AreaMap from "@/components/AreaMap/AreaMap.vue";
import AreaDrawer from "@/components/AreaDrawer/AreaDrawer.vue";
import type {AreaTemplateRow} from "@/api/area/areaTemplate";
import {getAreaTemplate} from "@/api/area/areaTemplate";
import type {AreaArchiveResult} from "@/api/archives/archives";
import {getAreaArchives} from "@/api/archives/archives";
import type {AddCallAreaParams, UpdateCallAreaParams} from "@/api/rollCall/rollCallArea";
import {addRollCallArea, updateRollCallArea} from "@/api/rollCall/rollCallArea";
import type {RollCallRuleRow} from "@/api/rollCall/rollCallRule";
import {checkAreaNameRepeat} from "@/api/area/area";

import CallPlansDialog from "@/views/call/components/callPlansDialog/CallPlansDialog.vue";

import type {DrawerFrom} from "./types";
import {AreaTypes} from "./constant";
import MapItem from "./MapItem.vue";
import DrawAreaButton from "./DrawAreaButton.vue";
import CallAssociationPlansDialog from "./CallAssociationPlansDialog.vue";
import {isCurrentPage, openDrawer} from "./utils";

const emits = defineEmits<{
	(event: "close"): void,
	(event: "refresh"): void,
	(event: "change-template", value: string): void,
	(event: "save", value: number): void,
	(event: "change-edit", value: boolean): void
}>();

interface Options {
	map_name: string,
	floor_id: number,
	jump_params?: any
}
interface Props {
	id: number,
	type: AreaTypes,
	from: DrawerFrom,
	options?: Options,
	getAreaCoordinates?: InstanceType<typeof AreaMap>["getZonePoints"]
}
const props = defineProps<Props>(); // 区域相关字段的初始值

const required_style = {
	"--content": "'*''",
	"--content-text": "#f56c6c",
	"--decorate-w": "auto",
	"--decorate-h": "auto",
	"--decorate-color": "transparent",
	"--gap-x": "4px"
};
const rules = {
	area_name: [
		{required: true, whitespace: true, message: "请输入名称", trigger: "blur"},
		{max: 20, message: "长度不能超过20个字符", trigger: "blur"},
		{validator: verifyRuleName, trigger: "blur"}
	]
};

const archive_dialog = ref<InstanceType<typeof ArchiveDialog> | null>(null);
const editable = ref(false);

type MapInfo = Pick<Options, "map_name" | "floor_id">;
const map_info = ref<MapInfo>({map_name: "", floor_id: 0});

interface FormData {
	area_name: string,
	area_template_id: number
}
const getDefaultFormData = () => ({area_name: "", area_template_id: 1});
const form = ref<FormData>(getDefaultFormData());
const form_ref = ref<InstanceType<typeof ElForm> | null>(null);

const area_template_list = shallowRef<AreaTemplateRow[]>([]);

const table_data = shallowRef<RollCallRuleRow[]>([]);
const plans_visible = ref(false);
const area_template_visible = ref(false);
const draw_area_verification = ref(true); // 绘制区域校验
const is_verification = ref(true); // 所有的校验之和
const area_id = ref(props.id);
let area_data: AreaArchiveResult<RollCallRuleRow> | null = null;

interface CallPlansDialogData {
	visible: boolean,
	id: number,
	mode: DIALOG_MODE
}
const call_plans_dialog_data = ref<CallPlansDialogData>({
	visible: false,
	id: 0,
	mode: DIALOG_MODE.add
});

const area_drawer = ref<InstanceType<typeof AreaDrawer> | null>(null);
const call_association_plans_dialog = ref<InstanceType<typeof CallAssociationPlansDialog> | null>(null);
const is_delete_rule = ref(false);

const auth = usePageAuth(call_setting_route_name);
const system_auth = usePageAuth("/systemManage#/systemConfig");

const real_area_id = computed(() => props.id || area_id.value);
const is_add = computed(() => !real_area_id.value);
const show_footer = computed(() => auth.value.handle && !is_delete_rule.value);

watch(real_area_id, async () => {
	initAreaDrawer();
	await fetchAreaTemplateData();
	if (is_add.value) {
		form.value.area_template_id = area_template_list.value[0]?.id;
		changeAreaTemplate(form.value.area_template_id);
	} else if (props.options?.jump_params) {
		changeAreaTemplate(props.options.jump_params.cache_form.form.area_template_id);
	}
}, {
	immediate: true
});

const {loading, startLoading, endLoading} = useLoading();

async function verifyRuleName(rule: any, value: any, callback: any) {
	const params = {
		name: value,
		id: real_area_id.value ? real_area_id.value : undefined
	};
	const {data: res} = await checkAreaNameRepeat(params).catch(() => ({data: undefined}));
	if (res?.type === 1) {
		const {check, msg} = res.result;
		check ? callback() : callback(new Error(msg));
	}
}

function jumpToDraw() {
	const {from} = props;
	if (isCurrentPage(call_setting_route_name) && from === "map") {
		updateEditable(true);
	} else {
		openDrawer(AreaTypes.CALL, {
			action: "view",
			from: "table",
			id: real_area_id.value,
			floor_id: map_info.value.floor_id,
			cache_form: {
				is_delete: area_data?.is_delete,
				map_info: {...map_info.value},
				form: {...form.value},
				table_data: [...table_data.value]
			}
		});
	}
}

function getShapeData() {
	const {getAreaCoordinates} = props;
	const circle_attribute = JSON.parse(area_data?.circle_attribute as unknown as string || "{}");
	return getAreaCoordinates?.() ?? {
		area: area_data?.area,
		circle_center: circle_attribute.center,
		circle_radius: circle_attribute.radius
	};
}

interface AreaData {
	map_info_data: MapInfo,
	form_data: FormData,
	list_data: RollCallRuleRow[]
}
function setAreaData(data: AreaData) {
	const {map_info_data, form_data, list_data} = data;
	map_info.value = {...map_info_data};
	form.value = {...form_data};
	table_data.value = [...list_data];
}
async function initAreaDrawer() {
	const {options} = props;
	const jump_params = options?.jump_params;

	// id为0/undefined，表示新增可编辑
	updateEditable(!real_area_id.value);

	if (is_add.value) {
		is_delete_rule.value = false;
		const {map_name, floor_id} = options ?? {};
		setAreaData({
			map_info_data: {map_name: map_name!, floor_id: floor_id!},
			form_data: getDefaultFormData(),
			list_data: []
		});
	} else if (jump_params) {
		const {map_info, form, table_data, is_delete} = jump_params.cache_form ?? {};
		is_delete_rule.value = Boolean(is_delete);
		setAreaData({
			map_info_data: map_info,
			form_data: form,
			list_data: table_data
		});
		updateEditable(true);
	} else {
		await fetchAreaData().catch((error) => console.error(error));
		is_delete_rule.value = Boolean(area_data?.is_delete);
		if (!area_data) return;
		const {map, floor_id, name, area_template_id, rule = []} = area_data;
		setAreaData({
			map_info_data: {map_name: floor_id === 2 ? "百度地图" : map, floor_id},
			form_data: {area_name: name, area_template_id},
			list_data: rule
		});
	}
}

async function fetchAreaData() {
	const {data: res} = await getAreaArchives({id: real_area_id.value}).catch(() => ({data: undefined}));
	if (res?.type === 1) {
		if (res.result) {
			area_data = res.result;
			return area_data;
		} else {
			return Promise.reject("不存在该电子点名区域");
		}
	} else {
		return Promise.reject("接口错误");
	}
}

async function fetchAreaTemplateData() {
	const {data: res} = await getAreaTemplate().catch(() => ({data: undefined}));
	if (res?.type === 1) {
		area_template_list.value = res.result.data;
	}
}

function changeAreaTemplate(area_template_id: number) {
	const find_item = area_template_list.value.find(({id}) => id === area_template_id);
	emits("change-template", find_item!.area_style);
}

function openAreaTemplateDialog() {
	area_template_visible.value = true;
}
function openAnchorDialog(row?: RollCallRuleRow) {
	call_plans_dialog_data.value = {
		visible: true,
		id: row?.id ?? 0,
		mode: row ? DIALOG_MODE.view : DIALOG_MODE.add
	};
}
function openArchiveDialog(uuid: number) {
	archive_dialog.value!.openArchiveDialog({uuid});
}
function openAreaDrawer({id}: RollCallRuleRow["areas"][0]) {
	area_drawer.value!.openDrawer({
		id,
		type: AreaTypes.CALL,
		from: "table",
		title: "点名区域设置",
		options: {}
	});
}

function openAssociationDialog() {
	plans_visible.value = true;
}

function handleSaveCallDialog() {
	call_association_plans_dialog.value?.refreshTable();
}

function handleDelete(row: RollCallRuleRow) {
	const find_index = table_data.value.findIndex(({id}) => id === row.id);
	if (find_index > -1) {
		table_data.value.splice(find_index, 1);
	}
}

async function postAddRollCallArea(params: AddCallAreaParams) {
	const {data: res} = await addRollCallArea(params).catch(() => ({data: undefined}));
	if (res?.type === 1) {
		Notification.success({title: "成功", message: "新增成功"});
		return {status: true, id: parseInt(res.result)};
	}
	Notification.error({title: "失败", message: res?.result || "新增失败"});
	return {status: false, id: null};
}
async function postUpdateRollCallArea(params: UpdateCallAreaParams) {
	const {data: res} = await updateRollCallArea(params).catch(() => ({data: undefined}));
	if (res?.type === 1) {
		Notification.success({title: "成功", message: "编辑成功"});
		return {status: true, id: params.id};
	}
	Notification.error({title: "失败", message: res?.result || "编辑失败"});
	return {status: false, id: params.id};
}

async function handleCancel() {
	if (is_add.value) {
		emits("close");
	} else {
		await fetchAreaData().catch((error) => console.error(error));
		if (!area_data) return;
		const {map, floor_id, name, area_template_id, rule = []} = area_data;
		setAreaData({
			map_info_data: {map_name: map, floor_id},
			form_data: {area_name: name, area_template_id},
			list_data: rule
		});
		updateEditable(false);
		nextTick(verifyForm);
		emits("refresh");
	}
}

async function verifyDrawArea() {
	const is_pass = Boolean(getShapeData().area);
	draw_area_verification.value = is_pass;
	return Promise.resolve(is_pass);
}
async function verifyForm() {
	const [first_pass, second_pass] = await Promise.all([
		verifyDrawArea(),
		form_ref.value!.validate().catch(() => false)
	]);
	return first_pass && second_pass;
}
async function handleSave() {
	const {area: area_coordinates, circle_center, circle_radius} = getShapeData();
	is_verification.value = await verifyForm();
	if (!is_verification.value) return;

	startLoading();
	const params = {
		name: form.value.area_name,
		area_template_id: form.value.area_template_id,
		floor_id: map_info.value.floor_id,
		area: area_coordinates!,
		is_use: 1,
		shape: circle_center ? 2 : 1,
		circle_attribute: circle_center ? JSON.stringify({radius: circle_radius, center: {x: circle_center[0], y: circle_center[1]}}) : undefined,
		alarm_rule_id_list: table_data.value.map(({id}) => id)
	};
	const {status, id: save_id} = is_add.value ? await postAddRollCallArea(params) : await postUpdateRollCallArea({...params, id: area_id.value});
	if (status && save_id !== null) {
		// 新增的区域保存成功后就不再是新增模式
		area_id.value = save_id;
		emits("save", save_id);
		emits("refresh");
		updateEditable(false);
	}
	endLoading();
}
function updateEditable(value: boolean) {
	editable.value = value;
	emits("change-edit", value);
}
</script>

<style lang="scss" scoped>
.call-area-drawer {
	display: flex;
	flex-direction: column;

	.call-area-body {
		flex: 1 1 100%;
		padding: 16px 16px 0;
		display: flex;
		flex-direction: column;
		row-gap: 24px;
	}

	.location-wrap {
		flex: 0 0 auto;
		position: relative;
	}

	.base-info-wrap {
		flex: 0 0 auto;

		:deep(.el-form-item .el-form-item__label) {
			line-height: 1;
		}

		.el-form-item:last-child {
			margin-bottom: 0;
		}

		.area-template-form-item {
			:deep(.el-form-item__label) {
				width: 100%;
			}

			.area-template-form-label {
				display: flex;
				justify-content: space-between;
				align-items: center;
			}
		}
	}

	.association-call-wrap {
		display: flex;
		flex-direction: column;
		row-gap: 12px;

		.call-plans-header {
			flex: 0 0 auto;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
	}

	.call-area-footer {
		flex: 0 0 auto;
		border-top: 1px solid #eff3f6;
		padding: 16px;
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}
}
</style>
