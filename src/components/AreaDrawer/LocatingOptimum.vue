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
					:area-id="form.id"
				/>
			</el-form-item>
			<!-- 绘制区域 -->
			<el-form-item
				prop="area"
				label="绘制区域"
				style="margin-bottom: 24px;"
			>
				<div class="shape-select-container">
					<draw-area-button
						v-show="props.from === 'map' && editable"
						:shape-options="shape_options"
					/>
					<el-button
						v-if="handle_auth"
						v-show="props.from !== 'map' || !editable"
						type="primary"
						plain
						class="without-mr"
						:disabled="false"
						@click="jumpToDraw"
					>
						前往绘制
					</el-button>
				</div>
			</el-form-item>
			<anchor-title title="基础信息" />
			<el-form-item
				label="区域名称"
				prop="name"
			>
				<el-input
					v-model="form.name"
					placeholder="请输入"
				/>
			</el-form-item>
			<el-form-item
				label="启用状态"
				prop="is_use"
				required
			>
				<status-select v-model="form.is_use" />
			</el-form-item>
			<el-form-item
				label="区域模板"
				prop="area_template"
				class="two-cols-item"
			>
				<template #label>
					<two-cols>
						<template #left>
							<span>区域模板</span>
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
				prop="area_type"
				label="定位优化区域类型"
				required
			>
				<el-select
					v-model="form.area_type"
					placeholder="请选择"
				>
					<el-option
						v-for="item in area_type_options"
						:key="item.value"
						:label="item.label"
						:value="item.value"
					/>
				</el-select>
			</el-form-item>
		</el-form>
	</div>
	<div
		v-if="handle_auth"
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
			:loading="save_loading"
			type="primary"
			size="small"
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
import MapItem from "@/components/AreaDrawer/MapItem.vue";
import AnchorTitle from "@/components/AnchorTitle.vue";
import StatusSelect from "@/components/StatusSelect.vue";
import LabelButton from "@/components/Button/LabelButton.vue";
import TwoCols from "@/components/Layout/TwoCols.vue";
import {computed, ref, watch} from "vue";
import {locating_optimum_route_name} from "@/Config";
import locationJump from "@/utils/js/locationHref";
import {getAreaTemplate} from "@/api/area/areaTemplate";
import AreaTemplateDialog from "@/components/AreaTemplate/AreaTemplateDialog.vue";
import DrawAreaButton from "@/components/AreaDrawer/DrawAreaButton.vue";
import type {Option} from "@/components/AreaDrawer/types";
import type {AreaTemplate} from "@/components/types";
import {addObstacle, checkObstacleName, updateObstacle} from "@/api/area/obstacle";
import {getAreaArchives} from "@/api/archives/archives";
import {Notification} from "element-ui";
import {isCurrentPage} from "@/components/AreaDrawer/utils";
import {LOCATING_OPTIMUM_CACHE_KEY} from "@/components/AreaDrawer/constant";
import {useAuthStore} from "@/store";
import {usePageAuth} from "@/utils/js/authentication";
const system_auth = usePageAuth("/systemManage#/systemConfig");

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
		default: () => {}
	}
});

type FormData = {
	id?: number
	name: string
	is_use: number
	area_template?: AreaTemplate
	area_type: number
	area: string
	center?: number[]
	radius?: number
	floor_id: number
	map: string
	shape: string
}
const getDefaultFormData = () => {
	return {
		name: "",
		is_use: 1,
		area_template: undefined,
		area_type: 13,
		area: "",
		map: "",
		shape: "rectangle",
		floor_id: 0
	};
};
const form = ref<FormData>(getDefaultFormData());

const auth_store = useAuthStore();
const handle_auth = computed(() => {
	return auth_store && (auth_store["/systemManage#/systemConfig"] === 2 || auth_store["/systemManage#/systemConfig"] === 4);
});

const validateArea = (rule, value, callback) => {
	if (form.value.area.length > 0) {
		callback();
	} else {
		callback(new Error("请绘制定位优化区域"));
	}
};
async function validateNameRepeat(rule, value, callback) {
	const {data: res} = await checkObstacleName({
		name: value,
		id: form.value.id
	}).catch(() => ({data: undefined}));
	if (res?.type === 1) {
		const {check, msg} = res.result;
		check ? callback() : callback(new Error(msg));
	}
}
const rules = ref({
	area_template: [
		{required: true, message: "请选择关联的区域模板", trigger: "blur"},
	],
	area: [
		{validator: validateArea, trigger: "blur"},
		{required: true, message: " ", trigger: "blur"},
	],
	name: [
		{required: true, message: "请输入区域名称", trigger: "blur"},
		{max: 20, message: "长度20个字符以下", trigger: "blur"},
		{validator: validateNameRepeat, trigger: "blur"},
	]
});
const editable = ref(false);
const save_loading = ref(false);
const area_form_ref = ref();
const area_template_options = ref<Option<AreaTemplate>[]>([]);
const show_add_template_dialog = ref(false);
const area_type_options = ref([
	{label: "障碍物区域", value: 13},
	{label: "活动区域", value: 14},
	{label: "盲区", value: 15},
]);
const shape_options = ref([
	{label: "矩形", value: "rectangle",},
	{label: "多边形", value: "polygon",},
]);
const area_info = ref();

async function getAreaTemplateOptions() {
	return getAreaTemplate().then(res => {
		const {type, result} = res.data;
		if (type === 1) {
			area_template_options.value = result.data.map(it => {
				return {
					label: it.name,
					value: it
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

const onGetAreaInfo = (area_data) => {
	const {area} = area_data;
	form.value.area = area;
	area_form_ref.value.validate(async (valid: boolean) => {
		if (valid) {
			save_loading.value = true;
			const data = {
				name: form.value.name,
				type: form.value.area_type,
				floor_id: form.value.floor_id,
				area: form.value.area,
				is_use: form.value.is_use,
				area_template_id: form.value.area_template.id
			};
			let res;
			if (form.value.id) {
				res = await updateObstacle({id: form.value.id, ...data});
			} else {
				res = await addObstacle(data);
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
			save_loading.value = false;
		}
	});
};

const handleSave = () => {
	emits("save", onGetAreaInfo);
};

const handleCancel = () => {
	area_form_ref.value?.clearValidate();
	changeStatus(false);
	if (!form.value.id) {
		emits("close");
		form.value = getDefaultFormData();
	} else {
		setAreaInfo();
		emits("refresh");
	}
};

const handleEdit = () => {
	changeStatus(true);
};

const changeStatus = (edit: boolean) => {
	editable.value = edit;
	emits("change-status", editable.value);
};

function jumpToDraw() {
	localStorage.setItem(LOCATING_OPTIMUM_CACHE_KEY, JSON.stringify(form.value));
	locationJump(locating_optimum_route_name + "?active_name=fourth", true);
}

async function getAreaTemplateOption(area_template_id: number, refresh = true) {
	if (refresh) {
		await getAreaTemplateOptions();
	}
	const area_template = area_template_options.value.find(item => item.value.id === area_template_id);
	if (area_template) {
		form.value.area_template = area_template.value;
		emits("change-template", form.value.area_template);
	}
}

function addAreaTemplate() {
	show_add_template_dialog.value = true;
}

function changeTemplate() {
	emits("change-template", form.value.area_template);
}

watch(() => props.id, async (val) => {
	changeStatus(!val);
	form.value = getDefaultFormData();
	await getAreaTemplateOptions();
	if (val) {
		form.value.id = val;
		getAreaInfoById(val);
	} else {
		form.value.id = undefined;
		form.value.map = props.options.map_name;
		form.value.floor_id = props.options.floor_id;
		area_form_ref.value?.clearValidate();
	}
}, {
	immediate: true
});

function getAreaInfoById(id: number) {
	getAreaArchives({id}).then(res => {
		const {type, result} = res.data;
		if (type === 1) {
			area_info.value = result;
			setAreaInfo();
			// 显示草稿
			const cache_form_str = localStorage.getItem(LOCATING_OPTIMUM_CACHE_KEY);
			if (cache_form_str) {
				form.value = JSON.parse(cache_form_str);
				localStorage.removeItem(LOCATING_OPTIMUM_CACHE_KEY);
				changeStatus(true);
			}
		}
	});
}

function setAreaInfo() {
	const {name, floor_id, is_use, type, area_template_id, map, area} = area_info.value;
	form.value.name = name;
	form.value.floor_id = floor_id;
	form.value.is_use = is_use;
	form.value.area_type = type;
	form.value.map = map;
	form.value.area = area;
	getAreaTemplateOption(area_template_id, false);
}

const emits = defineEmits(["close", "save", "change-template", "saved-success", "start-draw", "change-status", "refresh"]);
</script>

<style scoped>
.drawer-form .el-form-item.two-cols-item :deep(.el-form-item__label) {
	display: flex;
	width: 100%;
}

.layout-two-cols {
	flex:1;
}

.shape-select-container {
	display: flex;
	align-items: center;
	column-gap: 12px;
}

.drawer-form {
	.without-mr {
		margin-right: 0 !important;
	}
}
</style>
