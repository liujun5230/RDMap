<template>
<div>
	<div class="drawer-body">
		<el-form
			ref="camera_setting_form"
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
			<el-form-item
				required
				style="margin-bottom: 20px;"
			>
				<template #label>
					<span style="margin-right: 4px;">坐标</span>
					<fk-icon tip="H为距离楼层地图地面的相对高度">
						<i
							class="hg-icons hg-icon-tooltip-question"
							style="font-size: 14px;"
						/>
					</fk-icon>
				</template>
				<el-row :gutter="12">
					<el-col :span="8">
						<el-form-item
							prop="x"
							class="coords-item"
						>
							<el-input v-model="form.x">
								<template #prepend>
									X
								</template>
							</el-input>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item
							prop="y"
							class="coords-item"
						>
							<el-input v-model="form.y">
								<template #prepend>
									Y
								</template>
							</el-input>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item
							prop="z"
							class="coords-item"
						>
							<el-input v-model="form.z">
								<template #prepend>
									H
								</template>
							</el-input>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form-item>
			<!-- 绘制区域 -->
			<el-form-item
				prop="area"
				label="监控范围"
				style="margin-bottom: 24px;"
			>
				<div class="shape-select-container">
					<draw-area-button v-show="props.from === 'map' && editable" />
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
					<el-button
						v-show="from === 'map' && show_realtime_btn"
						type="primary"
						plain
						class="without-mr"
						:disabled="from !== 'map'"
						@click="viewRealtimeVideo"
					>
						实时画面
					</el-button>
				</div>
			</el-form-item>
			<anchor-title title="基础信息" />
			<el-form-item
				label="摄像头名称"
				prop="camera_name"
			>
				<el-input
					v-model="form.camera_name"
					placeholder="请输入"
				/>
			</el-form-item>
			<el-form-item
				label="设备ID"
				prop="device_no"
			>
				<el-input
					v-model="form.device_no"
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
				label="用户名"
				prop="user_name"
			>
				<el-input
					v-model="form.user_name"
					placeholder="请输入"
				/>
			</el-form-item>
			<el-form-item
				label="密码"
				prop="password"
			>
				<el-input
					v-model="form.password"
					placeholder="请输入"
				/>
			</el-form-item>
			<el-form-item
				label="摄像头IP"
				prop="camera_ip"
			>
				<el-input
					v-model="form.camera_ip"
					placeholder="请输入"
				/>
			</el-form-item>
			<el-form-item
				label="摄像头端口"
				prop="camera_port"
			>
				<el-input
					v-model="form.camera_port"
					placeholder="请输入"
				/>
			</el-form-item>
			<el-form-item
				label="链接地址"
				prop="camera_url"
			>
				<el-input
					v-model="form.camera_url"
					placeholder="请输入"
				>
					<template #append>
						<el-select
							v-model="select_stream"
							placeholder="请选择码流"
							:loading="loading_camera_info"
							class="stream-select"
							@focus="getCameraInfo"
							@change="changeSelectStream"
						>
							<el-option
								v-for="stream in streams"
								:key="stream.url"
								:label="stream.label"
								:value="stream.url"
							/>
						</el-select>
					</template>
				</el-input>
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
import {computed, ref, watch} from "vue";
import MapItem from "@/components/AreaDrawer/MapItem.vue";
import AnchorTitle from "@/components/AnchorTitle.vue";
import FkIcon from "@/components/ForThink/FkIcon.vue";
import LabelButton from "@/components/Button/LabelButton.vue";
import TwoCols from "@/components/Layout/TwoCols.vue";
import {
	addCamera,
	checkCamaraCode,
	checkCamaraName,
	getEquip,
	getEquipSupport,
	updateCamera
} from "@/api/device/camera";
import {Notification} from "element-ui";
import AreaTemplateDialog from "@/components/AreaTemplate/AreaTemplateDialog.vue";
import {getAreaTemplate} from "@/api/area/areaTemplate";
import locationJump from "@/utils/js/locationHref";
import {camera_manage_route_name} from "@/Config";
import DrawAreaButton from "@/components/AreaDrawer/DrawAreaButton.vue";
import type {AreaTemplate} from "@/components/types";
import type {Option} from "@/components/AreaDrawer/types";
import {debounce} from "lodash-es";
import {useAuthStore} from "@/store";
import {CAMERA_CACHE_KEY} from "@/components/AreaDrawer/constant";
import {isCurrentPage} from "@/components/AreaDrawer/utils";
import {usePageAuth} from "@/utils/js/authentication";

const system_auth = usePageAuth("/systemManage#/systemConfig");
const auth_store = useAuthStore();
const handle_auth = computed(() => {
	return auth_store && (auth_store["/video#/camera"] === 2 || auth_store["/video#/camera"] === 4);
});

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

type CameraType = {
	id: number
	device_no: string
	place_x: number
	place_y: number
	relative_h: number
	ptz_support: number
	name: string
	user: string
	password: string
	ip: string
	port: number
	rtsp_url: string
	area: string
	scene_id: number
	build_id: number
	floor_id: number
	scene_name: string
	building_name: string
	floor_name: string
	area_template: AreaTemplate
	circle_attribute: string
	map: string
}

type FormData = {
	id?: number
	shape: string
	map: string
	camera_name: string
	x: string
	y: string
	z: string
	device_no: string
	area_template?: AreaTemplate
	user_name: string
	password: string
	camera_ip: string
	camera_port: string
	camera_url: string
	ptz_support: number
	area: string
	floor_id: number
	circle_attribute?: {
		center: {x: number; y: number},
		radius: string
	}
}

const getDefaultFormData = () => {
	return {
		shape: "rectangle",
		map: "楼层一",
		camera_name: "",
		x: "",
		y: "",
		z: "2",
		device_no: "",
		area_template: undefined,
		user_name: "",
		password: "",
		camera_ip: "",
		camera_port: "",
		camera_url: "",
		ptz_support: 0,
		area: "",
		circle_attribute: undefined,
		floor_id: 0
	};
};
const editable = ref(false);
const camera_setting_form = ref();
const form = ref<FormData>(getDefaultFormData());
const camera_info = ref<CameraType>();
const show_add_template_dialog = ref(false);
const area_template_options = ref<Option<AreaTemplate>[]>([]);
const select_stream = ref();
const loading_camera_info = ref(false);
const streams = ref([]);
const save_loading = ref(false);

const changeStatus = (edit: boolean) => {
	editable.value = edit;
	emits("change-status", editable.value);
};

watch(
	() => props.id,
	async (val) => {
		save_loading.value = false;
		changeStatus(!val);
		camera_setting_form.value?.clearValidate();
		form.value = getDefaultFormData();
		await getAreaTemplateOptions();
		if (val) { // 查看
			form.value.id = val;
			editable.value = false;
			getEquipInfo();
		} else { // 新增
			form.value.id = undefined;
			editable.value = true;
			const {place_x, place_y, floor_id, map_name, ip, port, name, device_no, password, rtsp_url, user} = props.options;
			form.value.x = place_x;
			form.value.y = place_y;
			form.value.floor_id = floor_id;
			form.value.map = map_name;
			form.value.camera_ip = ip || "";
			form.value.camera_port = port || "";
			form.value.camera_name = name || "";
			form.value.device_no = device_no || "";
			form.value.password = password || "";
			form.value.user_name = user || "";
			form.value.camera_url = rtsp_url || "";
			camera_setting_form.value?.clearValidate();
		}
	},
	{immediate: true}
);

const show_realtime_btn = computed(() => form.value.user_name && form.value.password);

function getEquipInfo() {
	getEquip({id: form.value.id}).then(res => {
		const {type, result} = res.data;
		if (type === 1 && result?.data?.length) {
			camera_info.value = result.data[0] as CameraType;
			fillCameraForm(camera_info.value);
			// 显示草稿
			const cache_form_str = localStorage.getItem(CAMERA_CACHE_KEY);
			if (cache_form_str) {
				form.value = JSON.parse(cache_form_str);
				localStorage.removeItem(CAMERA_CACHE_KEY);
				changeStatus(true);
			}
		}
	});
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

function changeTemplate() {
	emits("change-template", form.value.area_template);
}

async function getAreaTemplateOption(area_template_id: number, refresh = true) {
	if (refresh) {
		await getAreaTemplateOptions();
	}
	const area_template = area_template_options.value.find(item => item.value.id === area_template_id);
	if (area_template) {
		form.value.area_template = area_template.value;
	}
}

const fillCameraForm = (camera: CameraType) => {
	form.value.device_no = camera.device_no;
	form.value.x = camera.place_x.toString();
	form.value.y = camera.place_y.toString();
	form.value.z = camera.relative_h.toString();
	form.value.ptz_support = camera.ptz_support;
	form.value.camera_name = camera.name;
	form.value.user_name = camera.user;
	form.value.password = camera.password;
	form.value.camera_ip = camera.ip;
	form.value.camera_port = camera.port ? camera.port.toString() : "";
	form.value.camera_url = camera.rtsp_url;
	form.value.area = camera.area;
	form.value.map = camera.map;
	form.value.floor_id = camera.floor_id;
	form.value.area_template = camera.area_template;
	streams.value = [];
	select_stream.value = undefined;
};

const validateArea = (rule: any, value: any, callback: any) => {
	if (form.value.area && form.value.area.length > 0) {
		callback();
	} else {
		callback(new Error("请绘制摄像头监控区域"));
	}
};

const checkPortNumber = (rule: any, value: any, callback: any) => {
	if (value) {
		if (/^[1-9][0-9]*$/.test(value)) {
			if (Number(value) <= 65535) {
				callback();
			}
		}
		callback(new Error("请输入正确的端口号"));
	} else {
		callback(new Error("请输入端口号"));
	}
};

const checkNameRepeat = async (rule: any, value: any, callback: any) => {
	try {
		const res = await checkCamaraName({id: form.value.id || undefined, name: value});
		if (res?.data?.type === 1) {
			const {check, msg} = res.data.result;
			if (check) {
				return callback();
			}
			return callback(new Error(msg));
		} else {
			return callback(new Error("接口请求错误"));
		}
	} catch (e) {
		return callback(new Error("接口请求错误"));
	}
};

const checkDeviceNo = async (rule: any, value: any, callback: any) => {
	try {
		const res = await checkCamaraCode({id: form.value.id || undefined, device_no: value});
		if (res?.data?.type === 1) {
			const {check, msg} = res.data.result;
			if (check) {
				return callback();
			}
			return callback(new Error(msg));
		} else {
			return callback(new Error("接口请求错误"));
		}
	} catch (e) {
		return callback(new Error("接口请求错误"));
	}
};

const rules = ref({
	camera_name: [
		{required: true, whitespace: true, message: "请输入摄像头名称", trigger: "blur"},
		{min: 1, max: 40, message: "摄像机名称的长度在1-40个字符", trigger: "blur"},
		{validator: checkNameRepeat, trigger: "blur"}
	],
	x: [{required: true, message: "请输入摄像头坐标X", trigger: "blur"}],
	y: [{required: true, message: "请输入摄像头坐标Y", trigger: "blur"}],
	z: [{required: true, message: "请输入相对高度H", trigger: "blur"}],
	device_no: [
		{required: true, message: "请输入设备ID", trigger: "blur"},
		{min: 1, max: 40, message: "设备ID的长度在1-40个字符", trigger: "blur"},
		{validator: checkDeviceNo, trigger: "blur"},
	],
	user_name: [{
		required: true,
		whitespace: true,
		message: "请输入摄像头用户名",
		trigger: "blur"
	}, {
		min: 1, max: 40, message: "用户名的长度在1-40个字符", trigger: "blur"
	}],
	password: [{
		required: true,
		whitespace: true,
		message: "请输入摄像头密码",
		trigger: "blur"
	}, {
		min: 1, max: 40, message: "密码长度在1-40个字符", trigger: "blur"
	}],
	camera_url: [{
		required: true,
		whitespace: true,
		message: "请输入摄像头访问地址",
		trigger: "blur"
	}],
	camera_ip: [{
		required: true,
		whitespace: true,
		message: "请输入摄像头IP",
		trigger: "blur"
	}],
	camera_port: [{
		required: true,
		whitespace: true,
		validator: checkPortNumber,
		trigger: "blur"
	}, {
		pattern: /^[\d]*$/,
		message: "请输入正确的端口号",
		trigger: "change"
	}],
	area_template: [
		{required: true, message: "请选择关联的区域模板", trigger: "blur"},
	],
	area: [
		{validator: validateArea, trigger: "blur"},
		{required: true, message: " "},
	]
});

type DrawInfo = {
	area: string
	circle_center: number[]
	circle_radius: string
}
const onGetAreaInfo = (area_data: DrawInfo) => {
	const {area, circle_center, circle_radius} = area_data;
	form.value.area = area;
	if (circle_radius && circle_center) {
		form.value.circle_attribute = {
			center: {x: circle_center[0], y: circle_center[1]},
			radius: circle_radius
		};
	}
	camera_setting_form.value.validate(async (valid: boolean) => {
		if (valid) {
			save_loading.value = true;
			const {camera_name, x, y, z, device_no, user_name, password, camera_ip, camera_port, camera_url, floor_id, area_template, area, circle_attribute, ptz_support} = form.value;
			const data = {
				id: form.value.id || undefined,
				ptz_support,
				user: user_name,
				password,
				ip: camera_ip,
				port: camera_port,
				floor_id,
				rtsp_url: camera_url,
				name: camera_name,
				shape: circle_attribute ? 2 : 1,
				area,
				circle_attribute: circle_attribute ? JSON.stringify(circle_attribute) : undefined,
				place_x: x,
				place_y: y,
				relative_h: z,
				device_no,
				area_template_id: area_template!.id
			};
			let res;
			if (form.value.id) {
				res = await updateCamera(data);
			} else {
				res = await addCamera(data);
			}
			if (res?.data?.type === 1) {
				Notification.success({
					title: "成功",
					message: form.value.id ? "编辑成功" : "新增成功"
				});
				form.value.id = form.value.id ? form.value.id : res.data.result;
				emits("saved-success", form.value.id);
				changeStatus(false);
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
	if (props.from !== "map") {
		const data = {
			area: form.value.area,
			circle_center: [],
			circle_radius: ""
		};
		if (camera_info.value?.circle_attribute) {
			const {center, radius} = JSON.parse(camera_info.value.circle_attribute);
			data.circle_center = [center.x, center.y];
			data.circle_radius = radius;
		}
		onGetAreaInfo(data);
	} else {
		emits("save", onGetAreaInfo);
	}
};

const handleCancel = () => {
	changeStatus(false);
	if (!form.value.id) {
		emits("close");
		form.value = getDefaultFormData();
	} else {
		if (camera_info.value) {
			fillCameraForm(camera_info.value);
		}
		emits("refresh");
	}
};

const handleEdit = () => {
	changeStatus(true);
};

function jumpToDraw() {
	if (isCurrentPage(camera_manage_route_name) && props.from === "map") {
		changeStatus(true);
	} else {
		localStorage.setItem(CAMERA_CACHE_KEY, JSON.stringify({...form.value, id: form.value.id}));
		locationJump(camera_manage_route_name, true);
	}
}

function viewRealtimeVideo() {
	const camera_info = {
		name: form.value.camera_name,
		url: form.value.camera_url,
		user: form.value.user_name,
		password: form.value.password,
		with_ptz: false
	};
	emits("open-live-video", camera_info);
}

function validateMajorInfo() {
	const field_list = ["user_name", "password", "camera_ip", "camera_port"];
	let count = 0;
	return new Promise((resolve, reject) => {
		camera_setting_form.value.validateField(field_list, (error_msg: string) => {
			count++;
			if (error_msg) {
				return reject(error_msg);
			}
			if (count === field_list.length) {
				return resolve(true);
			}
		});
	});
}

watch(
	() => form.value.camera_name,
	debounce(function (val) {
		if (!val || !editable.value) return;
		camera_setting_form.value.validateField("camera_name");
	}, 500)
);

watch(
	() => form.value.device_no,
	debounce(function (val) {
		if (!val || !editable.value) return;
		camera_setting_form.value.validateField("device_no");
	}, 500)
);

function getCameraInfo() {
	validateMajorInfo().then(() => {
		const data = {
			user: form.value.user_name,
			password: form.value.password,
			ip: form.value.camera_ip,
			port: form.value.camera_port
		};
		loading_camera_info.value = true;
		form.value.ptz_support = 0;
		getEquipSupport(data).then(response => {
			const {type, result} = response.data;
			if (type === 1) {
				const data = [];
				const streams_res = result.stream ? result.stream : null;
				if (result.is_ptz) {
					form.value.ptz_support = 1;
				}
				for (const i in streams_res) {
					let name = "";
					if (i === "0") {
						name = "主码流";
					} else if (i === "1") {
						name = "次码流";
					} else {
						name = "第三码流";
					}
					if (streams_res[i].video_width && streams_res[i].video_height) {
						name += "：" + streams_res[i].video_width + "*" + streams_res[i].video_height;
					}
					data.push({
						label: name,
						url: streams_res[i].url
					});
				}
				streams.value = data;
			} else {
				streams.value = [];
				Notification({
					type: "error",
					title: "错误",
					message: result
				});
			}
			loading_camera_info.value = false;
		});
	});
}

function changeSelectStream(value: string) {
	form.value.camera_url = value;
	camera_setting_form.value.validateField("camera_url");
}

function addAreaTemplate() {
	show_add_template_dialog.value = true;
}

const emits = defineEmits(["close", "save", "open-live-video", "change-template", "saved-success", "change-status", "refresh"]);
</script>

<style scoped>
.drawer-form .el-form-item.two-cols-item :deep(.el-form-item__label) {
	display: flex;
	width: 100%;
}

.layout-two-cols {
	flex:1;
}

.shape-select.el-select {
	width: 90px;
}

.shape-select-container {
	display: flex;
	align-items: center;
	column-gap: 12px;
}

.drawer-form.el-form {
	:deep(.el-form-item.coords-item) {
		margin-bottom: 0;
	}

	.without-mr {
		margin-right: 0 !important;
	}
}

.el-form-item {
	.el-input.is-disabled {
		background-color: #f5f7fa;
	}
	:deep(.el-input-group__append),
	:deep(.el-input-group__prepend) {
		padding: 0 12px;
		background-color: transparent;
		border-color: #D1D8E1;
		color: #748ba4;
	}
}

.el-form-item :deep(.el-input-group__append) {
	.stream-select {
		width: 130px;
		.el-input__inner {
			border: 0;
		}
	}
}
</style>
