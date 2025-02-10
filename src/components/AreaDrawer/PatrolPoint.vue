<template>
<div>
	<div class="drawer-body">
		<el-form
			ref="area_form_ref"
			label-position="top"
			:rules="rules"
			:model="form"
			size="small"
			:disabled="!editable"
			class="drawer-form"
		>
			<!-- 位置数据 -->
			<anchor-title title="位置数据" />
			<!-- 所在地图 -->
			<el-form-item
				class="map-form-item"
				style="margin-bottom: 20px;"
			>
				<map-item
					:map="form.map"
					:disabled="editable"
					:floor-id="form.floor_id"
				/>
			</el-form-item>
			<!-- 绘制区域 -->
			<el-form-item
				prop="x"
				label="绘制区域"
				style="margin-bottom: 24px;"
			>
				<div class="shape-select-container">
					<shape-select
						v-model="shape"
						class="shape-select"
						:shape-options="shape_options"
						:disabled="true"
					/>
					<el-button
						v-if="handle_auth"
						v-show="editable && props.from !== 'map'"
						type="primary"
						plain
						class="without-mr"
						@click="jumpToDraw"
					>
						前往绘制
					</el-button>
				</div>
			</el-form-item>
			<anchor-title title="基础信息" />
			<el-form-item
				label="巡检点名称"
				prop="name"
			>
				<el-input
					v-model="form.name"
					placeholder="请输入"
				/>
			</el-form-item>
			<el-form-item
				label="关联区域模板"
				prop="area_template"
				class="two-cols-item"
			>
				<template #label>
					<two-cols>
						<template #left>
							<span>关联区域模板</span>
						</template>
						<template #right>
							<label-button
								v-if="system_auth.handle"
								:disabled="!editable"
								@click="addAreaTemplate"
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
						v-for="item in area_template_options"
						:key="item.value.id"
						:label="item.label"
						:value="item.value"
					/>
				</el-select>
			</el-form-item>
			<el-form-item
				label="巡检范围"
				prop="radius"
			>
				<el-input
					v-model="form.radius"
					class="input-with-slot"
					placeholder="请输入"
					@input="onRadiusInput"
				>
					<template #append>
						<span style="display: inline-block; text-align: center;">米</span>
					</template>
				</el-input>
			</el-form-item>
			<el-form-item
				label="停留时间"
				prop="stay_time"
			>
				<el-input
					v-model="form.stay_time"
					class="input-with-slot"
					placeholder="请输入"
				>
					<template #append>
						<el-select v-model="form.unit">
							<el-option
								v-for="unit in unit_options"
								:key="unit.value"
								:label="unit.label"
								:value="unit.value"
							/>
						</el-select>
					</template>
				</el-input>
			</el-form-item>
			<!-- 所在巡检路线 -->
			<anchor-title title="所在巡检路线" />
			<fk-table
				:data="patrol_routes"
			>
				<el-table-column
					label="巡检路线名称"
					prop="name"
					show-overflow-tooltip
				>
					<template #default="scope">
						<span
							class="clickable-text"
							@click="openPatrolRouteDrawer(scope.row.id)"
						>{{ scope.row.name }}</span>
					</template>
				</el-table-column>
				<el-table-column
					label="巡检点数量"
					prop="number"
					:formatter="formatNumber"
				/>
				<el-table-column
					label="是否按巡检顺序"
					prop="is_ordered"
					:formatter="formatOrder"
				/>
			</fk-table>
		</el-form>
	</div>
	<div
		v-if="handle_auth && !is_deleted"
		class="drawer-footer"
	>
		<el-button
			v-show="!editable"
			type="primary"
			size="small"
			@click="handleEdit"
		>
			编辑
		</el-button>
		<el-button
			v-show="editable"
			size="small"
			plain
			@click="handleCancel"
		>
			取消
		</el-button>

		<el-button
			v-show="editable"
			type="primary"
			size="small"
			:loading="is_save_loading"
			@click="handleSave"
		>
			保存
		</el-button>
	</div>
	<area-template-dialog
		:visible.sync="show_add_template_dialog"
		@get-area-template="getAreaTemplateOption"
	/>
</div>
</template>

<script setup lang="ts">
import AnchorTitle from "@/components/AnchorTitle.vue";
import MapItem from "@/components/AreaDrawer/MapItem.vue";
import {computed, ref, watch} from "vue";
import locationJump from "@/utils/js/locationHref";
import {patrol_route_name} from "@/Config";
import TwoCols from "@/components/Layout/TwoCols.vue";
import LabelButton from "@/components/Button/LabelButton.vue";
import AreaTemplateDialog from "@/components/AreaTemplate/AreaTemplateDialog.vue";
import {getAreaTemplate} from "@/api/area/areaTemplate";
import FkTable from "@/components/ForThink/Table/FkTable.vue";
import ShapeSelect from "@/components/AreaDrawer/ShapeSelect.vue";
import {addPatrolPoint, checkDistance, checkPointName, updatePatrolPoint} from "@/api/patrol/point";
import type {Option} from "@/components/AreaDrawer/types";
import type {AreaTemplate} from "@/components/types";
import {Notification} from "element-ui";
import {getAreaArchives} from "@/api/archives/archives";
import {useAuthStore} from "@/store";
import {usePageAuth} from "@/utils/js/authentication";

const PATROL_POINT_CACHE_KEY = "patrol_point_cache_key";
const props = defineProps({
	id: {
		type: Number,
		required: true
	},
	from: {
		type: String,
		required: true
	},
	options: {
		type: Object,
		default() {
			return {};
		}
	}
});
const system_auth = usePageAuth("/systemManage#/systemConfig");
const auth_store = useAuthStore();
const handle_auth = computed(() => {
	return auth_store && (auth_store["/patrol#/setting"] === 2 || auth_store["/patrol#/setting"] === 4);
});

const getDefaultFormData = () => {
	return {
		name: "",
		area_template: undefined,
		map: "",
		floor_id: 0,
		radius: "",
		stay_time: "",
		unit: UNIT.HOUR,
		x: 0,
		y: 0
	};
};

enum UNIT {
	SECOND = "s",
	MINUTE = "m",
	HOUR = "h",
}

type FormData = {
	id?: number
	name: string,
	area_template?: AreaTemplate,
	map: string,
	floor_id: number,
	radius: string,
	stay_time: string,
	unit: UNIT,
	x: number,
	y: number
}

const unit_rate: Record<UNIT, number> = {
	[UNIT.SECOND]: 1,
	[UNIT.MINUTE]: 60,
	[UNIT.HOUR]: 3600
};
const form = ref<FormData>(getDefaultFormData());
const validateRadius = (rule: any, value: any, callback: any) => {
	if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
		return callback(new Error("请输入正数"));
	}
	if (parseFloat(value) > 1000) {
		return callback(new Error("输入超出限制，最大支持1000米"));
	}
	return callback();
};
const validateAreaOverlap = async (rule: any, value: any, callback: any) => {
	emits("save", (coordinate: number[]) => {
		if (coordinate) {
			form.value.x = coordinate[0];
			form.value.y = coordinate[1];
		}
	});
	const {floor_id, x, y, radius, area_template, id} = form.value;
	if (!area_template) return callback(); // 未选择模板 模板校验会不通过 此处无需抛错
	const data = {
		id,
		floor_id,
		circle_attribute: JSON.stringify({center: {x, y}, radius}),
		area_template_id: (area_template as AreaTemplate).id
	};
	const res = await checkDistance(data);
	if (res?.data?.type === 1 && res?.data?.result) {
		return callback();
	}
	return callback(new Error("巡检点范围覆盖有重合，请重新输入"));
};
const validateStayTime = (rule: any, value: any, callback: any) => {
	if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
		return callback(new Error("请输入正数"));
	}
	if (parseFloat(value) * unit_rate[form.value.unit] > 86400) {
		return callback(new Error("输入超出限制，最大支持24小时"));
	}
	return callback();
};
const validatePatrolName = async (rule:any, value: any, callback: any) => {
	const {data: res} = await checkPointName({
		name: value,
		id: form.value.id
	}).catch(() => ({data: undefined}));
	if (res?.type === 1) {
		const {check, msg} = res.result;
		check ? callback() : callback(new Error(msg));
	}
};
const rules = {
	name: [
		{required: true, message: "请输入巡检点名称", trigger: "blur",},
		{min: 1, max: 20, message: "长度限制为20，请重新输入", trigger: "blur"},
		{validator: validatePatrolName, trigger: "blur"}
	],
	radius: [
		{required: true, message: "请输入巡检范围", trigger: "blur"},
		{pattern: /^[\d.]*$/, message: "请输入正数", trigger: "change"},
		{validator: validateRadius, trigger: "blur"},
		{validator: validateAreaOverlap, trigger: "blur"},
	],
	stay_time: [
		{required: true, message: "请输入停留时间", trigger: "blur"},
		{pattern: /^[\d.]*$/, message: "请输入正数", trigger: "change"},
		{validator: validateStayTime, trigger: "blur"}
	],
	area_template: [
		{required: true, message: "请选择区域模板"},
	],
	x: [
		{required: true, message: " "},
	]
};
const show_add_template_dialog = ref(false);
const editable = ref(true);
const shape = ref("circle");
const shape_options = ref([
	{
		label: "圆形",
		value: "circle",
	},
]);
const is_save_loading = ref(false);
const area_template_options = ref<Option<AreaTemplate>[]>([]);
const unit_options = ref([
	{value: "s", label: "秒"},
	{value: "m", label: "分钟"},
	{value: "h", label: "小时"},
]);
const patrol_routes = ref([]);
const area_form_ref = ref();
const point_info = ref();

const is_deleted = computed(() => form.value.id && point_info.value?.is_delete);

const changeStatus = (edit: boolean) => {
	editable.value = edit;
	emits("change-status", editable.value);
};

watch(
	() => props.id,
	async (val) => {
		changeStatus(!val);
		if (val) {
			form.value.id = val;
			getAreaInfoById(val);
		} else {
			form.value = getDefaultFormData();
			getAreaTemplateOptions();
			const {map_name, floor_id, center} = props.options;
			form.value.map = map_name;
			form.value.floor_id = floor_id;
			form.value.x = center.x;
			form.value.y = center.y;
		}
	},
	{immediate: true}
);

function getAreaInfoById(id: number) {
	getAreaArchives({id}).then(res => {
		const {type, result} = res.data;
		if (type === 1) {
			point_info.value = result;
			setPointInfo(false, true);
			// 显示草稿
			const cache_form_str = localStorage.getItem(PATROL_POINT_CACHE_KEY);
			if (cache_form_str) {
				form.value = JSON.parse(cache_form_str);
				localStorage.removeItem(PATROL_POINT_CACHE_KEY);
				changeStatus(true);
			}
		}
	});
}

function setPointInfo(change_circle: boolean, refresh_template_option: boolean) {
	const {name, floor_id, area_template_id, extra_attribute, circle_attribute, map, rule} = point_info.value;
	const {center, radius} = JSON.parse(circle_attribute);
	const {unit_name, stay_time} = JSON.parse(extra_attribute);
	const unit = unit_name || UNIT.SECOND; // 兼容之前没有单位
	form.value = {
		id: form.value.id,
		name,
		area_template: undefined,
		map,
		floor_id,
		radius,
		stay_time: (stay_time / unit_rate[unit as UNIT]).toString(),
		unit,
		x: center.x,
		y: center.y
	};
	patrol_routes.value = rule;
	getAreaTemplateOption(area_template_id, change_circle, refresh_template_option);
	change_circle && emits("set-radius", [form.value.x, form.value.y], parseFloat(radius));
}

async function getAreaTemplateOptions() {
	return getAreaTemplate().then(res => {
		const {type, result} = res.data;
		if (type === 1) {
			area_template_options.value = result.data.map(it => {
				return {
					label: it.name,
					value: it as AreaTemplate
				};
			});
			if (!props.id && area_template_options.value.length) {
				form.value.area_template = area_template_options.value[0].value;
				changeTemplate();
			}
			return Promise.resolve();
		}
		return Promise.reject();
	});
}

function jumpToDraw() {
	localStorage.setItem(PATROL_POINT_CACHE_KEY, JSON.stringify(form.value));
	locationJump(patrol_route_name, true);
}

function addAreaTemplate() {
	show_add_template_dialog.value = true;
}

function changeTemplate() {
	emits("change-template", form.value.area_template);
}

async function getAreaTemplateOption(area_template_id: number, change_circle = true, refresh = true) {
	if (refresh) {
		await getAreaTemplateOptions();
	}
	const area_template = area_template_options.value.find(item => item.value.id === area_template_id);
	if (area_template) {
		form.value.area_template = area_template.value;
		change_circle && emits("change-template", form.value.area_template);
	}
}

const onGetAreaInfo = (coordinate: number[]) => {
	if (coordinate) {
		form.value.x = coordinate[0];
		form.value.y = coordinate[1];
	}
	area_form_ref.value.validate(async (valid: boolean) => {
		console.log(valid);
		if (valid) {
			is_save_loading.value = true;
			const {name, floor_id, x, y, radius, stay_time, area_template, unit} = form.value;
			const data = {
				id: form.value.id || undefined,
				name,
				floor_id,
				circle_attribute: JSON.stringify({center: {x, y}, radius}),
				extra_attribute: JSON.stringify({stay_time: parseFloat(parseFloat(stay_time).toFixed(2)) * unit_rate[unit], unit_name: form.value.unit}),
				area_template_id: (area_template as AreaTemplate).id
			};
			let res;
			if (form.value.id) {
				res = await updatePatrolPoint(data);
			} else {
				res = await addPatrolPoint(data);
			}
			if (res?.data?.type === 1) {
				Notification.success({
					title: "成功",
					message: form.value.id ? "编辑成功" : "新增成功"
				});
				form.value.id = form.value.id ? form.value.id : res.data.result;
				changeStatus(false);
				emits("saved-success", form.value.id);
			} else {
				Notification.error({
					title: "错误",
					message: res?.data?.result || (form.value.id ? "编辑失败" : "新增失败")
				});
			}
			is_save_loading.value = false;
		}
	});
};

const handleSave = () => {
	if (props.from === "map") {
		emits("save", onGetAreaInfo);
	} else {
		onGetAreaInfo([form.value.x, form.value.y]);
	}
};

const handleCancel = () => {
	area_form_ref.value?.clearValidate();
	changeStatus(false);
	if (!form.value.id) {
		emits("close");
		form.value = getDefaultFormData();
	} else {
		setPointInfo(true, false);
		emits("cancel-edit");
	}
};

const handleEdit = () => {
	changeTemplate();
	changeStatus(true);
};

const onRadiusInput = (val: string) => {
	if (!isNaN(parseFloat(val))) {
		emits("set-radius", [form.value.x, form.value.y], parseFloat(val));
	} else {
		emits("set-radius", [form.value.x, form.value.y], 0);
	}
};

function formatOrder(row: any, col: any, val: number) {
	return val ? "是" : "否";
}

function formatNumber(row: any, col: any, val: number) {
	return val + "个";
}

function openPatrolRouteDrawer(id: number) {
	emits("open-patrol-route-drawer", id);
}

const emits = defineEmits(["close", "save", "change-template", "change-status", "set-radius", "saved-success", "cancel-edit", "open-patrol-route-drawer"]);
</script>

<style scoped>
.drawer-form .el-form-item.two-cols-item :deep(.el-form-item__label) {
	display: flex;
	width: 100%;
	max-height: 24px;
}

.drawer-form.el-form {
	display: flex;
	flex-direction: column;
	min-height: calc(100% - 16px);
}

.layout-two-cols {
	flex:1;
}

.drawer-form .el-form-item .input-with-slot.el-input :deep(.el-input-group__append) {
	padding: 0;
	width: 70px;
	box-sizing: border-box;
	text-align: center;
}

.shape-select.el-select {
	width: 90px;
	margin-right: 12px;
}

.without-mr {
	margin-right: 0 !important;
}
</style>
