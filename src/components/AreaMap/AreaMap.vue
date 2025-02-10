<template>
<div class="area-map-container">
	<map-select
		class="map-select"
		:current-floor="current_floor"
		:disabled="props.isEdit"
		:map-type="props.mapType"
		@change-map="changeMap"
	/>
	<map-loading
		:loaded="loading_state.loaded"
		:progress="loading_state.progress"
		:speed="loading_state.speed"
		:state="loading_state.state"
		:total="loading_state.total"
	/>
	<map-tool
		:page-key="props.pageKey"
		:is-loaded="loading_state.state === LOADING_STATE.PARSE_FINISH ? 1 : 0"
		:disabled-measure="disabled_measure"
		@zoom-in="zoomIn"
		@zoom-out="zoomOut"
		@back-default-view="backDefaultView"
		@start-measure="startMeasureDistance"
	/>
	<campass-icon
		class="map-campass-icon"
		:rotation="rotation_rad"
		@reset="changeDirection({is_reset: true})"
	/>
	<measure-distance-buttons
		v-show="is_start_measure"
		@re-measure="reMeasureDistance"
		@exit-measure="stopMeasureDistance"
	/>
	<div
		id="area_map"
		ref="area_map_ref"
		class="area-map"
		:style="{backgroundColor:map_bg_color}"
	/>
	<div
		v-show="right_panel_show"
		id="right-handle-panel"
	>
		<span
			v-for="item in right_panel_options"
			:key="item.value"
			@click="selectRightHandle(item.value)"
		>{{ item.label }}</span>
	</div>
</div>
</template>
<script setup>
import {Notification} from "element-ui";
import {ref, computed, watch, nextTick} from "vue";
import "@/libs/HG2DMap.min.css";
import {jsonp} from "vue-jsonp";
import MapLoading from "@/components/MapLoading.vue";
import MapSelect from "@/components/AreaMap/components/MapSelect.vue";
import MapTool from "@/components/AreaMap/components/MapTool.vue";
import MeasureDistanceButtons from "@/components/AreaMap/components/MeasureDistanceButtons.vue";
import CampassIcon from "@/components/Map/CampassIcon.vue";
import {mapAutomaticSetting, getScaleParam, getMaxAndMinZoom, getMapTypeByPostfix, stringAndArrayTransform} from "@/utils/js/tools/map";
import {LOADING_STATE} from "@/utils/js/loadingStateTypes";
import {getConfig} from "@/api/configuration/sysConfig";
import {getFloorInfo} from "@/api/map/floor";
import {map as HG_MAP, feature as Feature, draw, control} from "@/libs/HG2DMap.mjs";
import {base_url, zoom_factor, OFFLINE_LABEL_COLOR, ONLINE_LABEL_COLOR, mqtt_password, mqtt_user_name, mqtt_ws_url, BASE_STATION, DEVICE, CAMERA} from "@/Config";
import {useEventBus} from "@vueuse/core";
import {ROTATE_KEY} from "@/events/mapEventKeys";
import {useMapParams} from "@/composable/map/useMapParams.ts";
import {useAreaMapStorage} from "@/composable/map/useAreaMapStorage.ts";
import {UTYPES, DEVICE_TYPES} from "@/views/index/utils/types";
import {getCardList, getFixedList} from "@/api/realtime/realTime";
import {getDeviceInfo} from "@/api/deviceManage/info";
import {getEquip} from "@/api/device/camera";
import map_icons from "@/utils/js/tools/mapIcons";
import mqtt from "mqtt";
import {SETTING_KEY} from "@/components/mapSettings/pageConfig";
const {rotation} = useMapParams();

const MqttClient = {value: undefined};
let IsMqttOK = false, SubscribeTopicList = [];
let IS_LOCATION_MQTT_RECONNECT = false; // mqtt重连标识
const TRAFFIC_LIGHT_TYPE = 10;
const TRAFFIC_ALARM_TYPE = 11;
const DEFAULT_TRAFFIC_ICON_WIDTH = 188;

let map_obj = null;
let baidu_default_center = [11574219.77990221, 3578416.998569895];
let draw_obj = null;
let draw_tip = null;
let modify_tip = null;
let device_position_tip = null;
let right_handle_popup = null;
let move_feature = null;
const default_view = {
	zoom: 34,
	center: [0, 0]
};
let	getEquipScale,
	equip_scale = {
		icon: 1,
		text: 1,
		offset_y: -105
	},
	getPatrolScale,
	patrol_scale = {
		icon: 1,
		text: 1,
		offset_y: -105
	},
	getLabelScale,
	label_scale = {
		icon: 1,
		text: 1
	};
const default_color = {
	text_background_color: "#0F2133D9",
	text_color: ONLINE_LABEL_COLOR,
	text_background_border_color: "rgba(0,0,0,0)"
};
const selected_area = ref(null);
const temp_area_id = 99999;
const area_map_ref = ref();
let area_features = [];
let all_floor_data = {};
let all_config_data = {};
let all_card_info = {};
let all_card_list = {};
let all_card_features = {};
let now_floor_device_data = new Map();
let now_floor_baseStation_data = new Map();
let now_floor_camera_data = [];
let all_device_features = {};
let all_baseStation_features = {};
let all_camera_features = {};
const floor_id = ref(0);

const current_floor_info = computed(() => all_floor_data[floor_id.value]);
const current_floor = computed(() => current_floor_info.value ? (current_floor_info.value.type ? [current_floor_info.value.id] : [current_floor_info.value.scene_id, current_floor_info.value.building_id, current_floor_info.value.id]) : []);
const rotation_rad = computed(() => {
	return (rotation.value - (current_floor_info.value?.direction ?? 0));
});
const is_device_position_page = computed(() => ["device_power", "device_switch", "device_smart_machine"].includes(props.pageKey));
const loading_state = ref({
	total: 0,
	loaded: 0,
	speed: 0,
	progress: 0,
	state: LOADING_STATE.GET_DATA
});
const progress_obj = ref({});
const right_panel_options = computed(() => {
	const common_options = [
		{label: "编辑节点", value: "modify"},
		{label: "平移", value: "translate"},
		{label: "拉伸", value: "scale"},
		{label: "旋转", value: "rotate"},
		{label: "重新绘制", value: "redraw"},
	];
	return selected_area.value?.type === "patrol" ? [{label: "平移", value: "translate"}] : common_options;
});
const right_panel_show = ref(false);
const handle_type = ref("");
const map_bg_color = ref("#fff");

const shape_type = ref("rectangle");
const mouse_position_width = ref(0);

const is_start_measure = ref(false);
const zone_template_style = ref("#DCC60080");

const props = defineProps({
	isEdit: {
		type: Boolean,
		default: false
	},
	pageKey: {
		type: String,
		default: ""
	},
	mapType: {
		type: Number,
		default: 1
	}
});

const disabled_measure = computed(() => is_start_measure.value || props.isEdit);

const map_store = useAreaMapStorage(props.pageKey);
const {area_map_setting} = map_store;

const locationFilter = (utype, branch_or_unit_id) => {
	const {branch_id_list, contractor_unit_id_list, is_show_visitor, is_show_material, is_show_car, is_show_stranger} = area_map_setting.value;
	const filter_strategy = {
		[UTYPES.PERSON]: branch_id_list.includes(branch_or_unit_id),
		[UTYPES.VISITOR]: is_show_visitor,
		[UTYPES.MATERIAL]: is_show_material,
		[UTYPES.CAR]: is_show_car,
		[UTYPES.CAR_SEMI]: is_show_car,
		[UTYPES.CONTRACTOR]: contractor_unit_id_list.includes(branch_or_unit_id),
	};
	return filter_strategy[utype] === undefined ? is_show_stranger : filter_strategy[utype];
};

useEventBus("start-draw").on((data) => {
	shape_type.value = data.shape_type;
	startDraw(data.is_temp_area);
});

useEventBus("re-draw").on((data) => {
	shape_type.value = data.shape_type;
	if (handle_type.value) clearHandleActive();
	reDraw(data.is_temp_area);
});

useEventBus("change-shape-type").on((val) => {
	shape_type.value = val;
});

useEventBus(ROTATE_KEY).on((payload) => {
	changeDirection(payload);
});

const getAllNecessaryData = async () => {
	const response_list = await Promise.all([getConfig(), getCardList(), getFloorInfo({scene_query: 1})]);
	return await processFloorData(response_list[0], response_list[1], response_list[2]);
};

const processFloorData = async (config_res, card_list_res, floor_res) => {
	const res_failed = [config_res, floor_res]
		.find(res => (res.data.type !== 1));

	if (res_failed) {
		console.warn("获取楼层数据失败", res_failed.data);
	}

	if (config_res.data.type === 1) {
		all_config_data = {};
		const data = config_res.data.result;
		for (const i in data) {
			const name = data[i].name;
			all_config_data[name] = data[i].value;
		}
	}

	if (card_list_res.data.type === 1) {
		all_card_info = card_list_res.data.result;
	}

	if (floor_res.data.type === 1) {
		all_floor_data = {};
		const data = floor_res.data.result.data;
		for (const i in data) {
			const id = data[i].id;
			all_floor_data[id] = data[i];
		}
	}
	map_bg_color.value = all_config_data["ENGINE_BACKGROUND_COLOR"];
	// 设置首显地图
	setDefaultFloor();
};

const hasFloorMap = () => {
	if (!current_floor_info.value || !current_floor_info.value.file_2d_path || !current_floor_info.value.floor_2d_file) return false;
	return true;
};

const setDefaultFloor = () => {
	floor_id.value = map_store.area_floor_info.value.floor_id;
	if (!hasFloorMap()) {
		floor_id.value = Object.values(all_floor_data).find(item => item.file_2d_path)?.id;
		if (!hasFloorMap()) {
			loading_state.value.state = LOADING_STATE.NO_MAP;
			return;
		}
	}
	if (current_floor_info.value.type) {
		setBaiDuMap();
	} else {
		setMap(map_store.area_floor_info.value);
	}
	connectMQTT();
};

const setMap = (store_info) => {
	const {file_2d_path, file_2d_postfix, coordinate_left, coordinate_down, coordinate_right, coordinate_upper, floor_scaling_ratio, origin_x, origin_y, drop_multiple, map_configure} = current_floor_info.value;
	const extend = [coordinate_left, coordinate_down, coordinate_right, coordinate_upper];
	const obj = mapAutomaticSetting(floor_scaling_ratio, origin_x, origin_y, drop_multiple, extend, area_map_ref.value.clientWidth || 500, area_map_ref.value.clientHeight || 500);
	const {min_zoom, max_zoom, zoom} = getMaxAndMinZoom(zoom_factor, obj.zoom, map_configure.zoom.min, map_configure.zoom.max);
	rotation.value = current_floor_info.value.rotation;
	default_view.center = obj.center;
	default_view.zoom = zoom;
	const map_param = {
		url: base_url + file_2d_path,
		dom: "area_map",
		center: store_info?.center || obj.center,
		zoom: store_info?.zoom || zoom,
		type: getMapTypeByPostfix(file_2d_postfix),
		extend: extend,
		max_zoom,
		min_zoom,
		zoom_factor: zoom_factor,
		extent: obj.extent,
		enable_rotation: true,
		rotation: rotation.value,
		map_stroke_color: all_config_data["KML_LINE_COLOR"],
		animation_enable: +all_config_data["ANIMATION_SWITCH"] === 1 ? true : false,
		animation_speed_point: +all_config_data["ANIMATION_MOVEMENT_SPEED_OPTIMIZATION"],
		animation_cache_time: +all_config_data["MOVING_CACHE_TIME"],
	};
	if (map_obj) {
		map_obj.reset();
		removeDrawTip(device_position_tip);
		right_panel_show.value = false;
		handle_type.value = "";
		all_card_list = {};
		all_card_features = {};
		all_baseStation_features = {};
		all_device_features = {};
		map_obj.clearMeasureFeature();
		map_obj.changeMap(map_param);
	} else {
		map_obj = new HG_MAP(map_param);
		const my_mouse_position = new control.mouse_position(true);
		const my_scale_line = new control.scale_line();
		map_obj.addControl(my_mouse_position);
		map_obj.addControl(my_scale_line);
		right_handle_popup = map_obj.addPopup("right-handle-panel");
		bindMapEvent();
	}
	bindMapViewEvent();
};

const setBaiDuMap = async() => {
	try {
		const response = await jsonp("http://api.map.baidu.com/location/ip?ak=" + all_config_data["BAIDU_AK"] + "&callback=?");
		baidu_default_center = [parseFloat(response.content.point.x), parseFloat(response.content.point.y)];
	} catch (e) {
		console.log(e);
	}
	const map_param = {
		url: "",
		dom: "area_map",
		center: baidu_default_center,
		zoom: 14,
		max_zoom: 23,
		type: "baidu",
		map_stroke_color: all_config_data["KML_LINE_COLOR"],
		animation_enable: +all_config_data["ANIMATION_SWITCH"] === 1 ? true : false,
		animation_speed_point: +all_config_data["ANIMATION_MOVEMENT_SPEED_OPTIMIZATION"],
		animation_cache_time: +all_config_data["MOVING_CACHE_TIME"]
	};
	default_view.center = baidu_default_center;
	default_view.zoom = 14;
	if (map_obj) {
		map_obj.reset();
		right_panel_show.value = false;
		handle_type.value = "";
		removeDrawTip(device_position_tip);
		map_obj.clearMeasureFeature();
		map_obj.changeMap(map_param);
	} else {
		map_obj = new HG_MAP(map_param);
		const my_mouse_position = new control.mouse_position(true);
		const my_scale_line = new control.scale_line();
		map_obj.addControl(my_mouse_position);
		map_obj.addControl(my_scale_line);
		right_handle_popup = map_obj.addPopup("right-handle-panel");
		bindMapEvent();
	}
	bindMapViewEvent();
};

const changeMap = async (floor) => {
	if (floor_id.value === floor) return;
	changeTopic();
	floor_id.value = floor;
	if (!current_floor_info.value) {
		return;
	}
	if (current_floor_info.value.type) {
		setBaiDuMap();
	} else {
		setMap();
	}
};

const getFloorConfigParam = () => {
	if (!current_floor_info.value) return;
	const min_zoom = map_obj.getMinZoom();
	const max_zoom = map_obj.getMaxZoom();
	const equip_icon = current_floor_info.value.map_configure.equipment;
	const inspection_icon = current_floor_info.value.map_configure.inspection_point;
	const label_icon = current_floor_info.value.map_configure.label;
	getEquipScale = getScaleParam(equip_icon.min / 100, equip_icon.max / 100, min_zoom, max_zoom);
	getPatrolScale = getScaleParam(inspection_icon.min / 100, inspection_icon.max / 100, min_zoom, max_zoom);
	getLabelScale = getScaleParam(label_icon.min / 100, label_icon.max / 100, min_zoom, max_zoom);
};

const updateScale = () => {
	if (!current_floor_info.value?.type) {
		const zoom = map_obj.getZoom();
		equip_scale = getEquipScale(zoom);
		patrol_scale = getPatrolScale(zoom);
		label_scale = getLabelScale(zoom);
	}
};

const setMousePositionWidth = () => {
	nextTick(() => {
		mouse_position_width.value = document.getElementsByClassName("hg_scale_line-inner")[0].style.width;
	});
};

const saveCurrentInfo = () => {
	const center = map_obj?.getCenter();
	const zoom = map_obj?.getZoom();
	map_store.storageCurrentFloor({center, zoom, floor_id: floor_id.value});
};

const getMapDisplayData = async () => {
	const param = {floor_id_list: floor_id.value ? [floor_id.value] : undefined};
	const responses = await Promise.allSettled([
		getFixedList(param),
		getEquip(param),
		getDeviceInfo(param),
	]);
	const [
		process_static_card,
		process_video,
		process_device,
	] = responses;
	await processStaticCardData(process_static_card.value);
	processVideoData(process_video.value);
	processDeviceData(process_device.value);
	return Promise.resolve();
};
const handleMessage = (topic, data) => {
	const suffix = topic.split("/")[2];

	switch (suffix) {
	case "card_now_forweb":
	case "gps":
		for (const card_id of Object.keys(data)) {
			const card_info = {
				card_id,
				on_line: 1,
				utype: all_card_info[card_id]?.utype || UTYPES.UNKNOWN,
				x: data[card_id].card_x,
				y: data[card_id].card_y,
				time: data[card_id].time,
				floor_id: data[card_id].floor_id
			};
			all_card_list[card_id] = card_info;
			processCard(card_info);
		}
		break;
	case "server_restart":
		map_obj?.reset();
		all_card_list = {};
		all_card_features = {};
		break;
	/**
	 * 变灰
	 */
	case "del_zigbee_card_ay":
	case "del_zigbee_card_ay_gps":
		for (const card_id in data) {
			updateCardStatus(card_id, data[card_id]);
		}
		break;
	/**
	 * 消失
	 */
	case "del_card_timely":
	case "del_card_timely_gps":
		for (const card_id in data) {
			if (all_card_features[card_id]) {
				map_obj.removeOneCard(card_id);
				delete all_card_features[card_id];
				delete all_card_list[card_id];
			}
		}
		break;
	case "refresh":
		useEventBus("device-refresh").emit();
		refreshAllDevice();
		break;
	case "traffic_refresh":
		refreshAllDevice();
		break;
	case "init_person":
	case "init_truck_type":
	case "change_icon":
		getCardList()
			.then((res) => {
				if (res.data.type === 1) all_card_info = res.data.result;
				for (const card_id of Object.keys(all_card_features)) {
					updateCardStatus(card_id, all_card_features[card_id].online);
				}
			});
		break;
	}
};

const refreshAllDevice = () => {
	getDeviceInfo({floor_id_list: floor_id.value ? [floor_id.value] : undefined}).then(response => {
		processDeviceData(response);
	});
};

const updateCardStatus = (card_id, online) => {
	const card_info = getCardMapInfo(card_id, online);
	const {icon, display_info, text_color, background_color, border_color} = card_info;
	setCardIcon(parseInt(card_id), base_url + icon);
	setCardText(parseInt(card_id), display_info, {
		text_color: text_color,
		text_background_color: background_color,
		text_background_border_color: border_color,
	});
	if (all_card_features[card_id]) all_card_features[card_id].online = online;
};
const connectMQTT = () => {
	MqttClient.value = mqtt.connect(mqtt_ws_url, {username: mqtt_user_name, password: mqtt_password});

	MqttClient.value.on("connect", () => {
		IsMqttOK = true;
		changeTopic();
	});
	MqttClient.value.on("message", (topic, payload) => {
		const data = JSON.parse(payload.toString());
		if (loading_state.value.state === LOADING_STATE.PARSE_FINISH && map_obj) {
			handleMessage(topic, data);
		}
	});
	// 当mqtt连接上后，重连标识为true时，结束之前的CLIENT，重连一次
	MqttClient.value.on("connect", () => {
		if (IS_LOCATION_MQTT_RECONNECT) {
			MqttClient.value.end();
			connectMQTT();
			subscribeTopic();
			IS_LOCATION_MQTT_RECONNECT = false;
		}
	});
	MqttClient.value.on("error", function () {
		console.debug("[ \"mqtt client is error\" ] >");
	});
	MqttClient.value.on("reconnect", function () {
		IS_LOCATION_MQTT_RECONNECT = true;
		console.debug("[ \"mqtt client try to reconnect\" ] >");
	});
};

const changeTopic = () => {
	if (!IsMqttOK) return;
	if (SubscribeTopicList.length > 0) {
		MqttClient.value.unsubscribe(SubscribeTopicList, subscribeTopic);
	} else {
		subscribeTopic();
	}
};

const subscribeTopic = () => {
	const now_info = current_floor_info.value?.type ? "/pos_business/gps/web/card_now_info/#" : "/pos_business/card_now_forweb/scene_id/" + current_floor_info.value.scene_id + "/building_id/" + current_floor_info.value.building_id + "/floor_id/" + floor_id.value;
	const del_card = current_floor_info.value?.type ? "/pos_business/del_zigbee_card_ay_gps" : "/pos_business/del_zigbee_card_ay";
	const del_card_timely = current_floor_info.value?.type ? "/pos_business/del_card_timely_gps" : "/pos_business/del_card_timely";
	SubscribeTopicList = [
		"/think_php/init_person",
		"/pos_business/server_restart",
		"/baidu-transform-failed/",
		"/think_php/init_truck_type",
		"/device_manager/refresh",
		"/think_php/change_icon",
		"/equipment/device/message",
		"/think_php/branch_change",
		"/device_manager/traffic_refresh",
		del_card_timely,
		del_card,
		now_info
	];
	MqttClient.value.subscribe(SubscribeTopicList);
};

const processVideoData = (response) => {
	if (response.data.type === 1) {
		now_floor_camera_data = response.data.result.data;
		showCamera();
	}
};

const processDeviceData = (response) => {
	const mapDevice = item => ([item.id.toString(), item]);
	const mapBS = item => ([item.device_no.toString(), item]);

	const filterDevice = item => item?.type !== DEVICE_TYPES.BASE_STATION;
	const filterBaseStation = item => item?.type === DEVICE_TYPES.BASE_STATION;

	if (response.data.type === 1) {
		const all_device = response.data.result.data;
		now_floor_device_data = new Map(all_device.filter(filterDevice).map(mapDevice));
		now_floor_baseStation_data = new Map(all_device.filter(filterBaseStation).map(mapBS));
		showBaseStation();
		showDevice();
	}
};

const bs_filter = (base_station) => {
	const bs_type = base_station?.base_type.toString();
	return area_map_setting.value.bs_type_list.map(type => +type).includes(+bs_type);
};
const showBaseStation = () => {
	const bs_list = Array
		.from(now_floor_baseStation_data.values())
		.filter(bs_filter);
	for (const device_no of Object.keys(all_baseStation_features)) {
		map_obj.removeOneBaseStation(device_no);
	}
	all_baseStation_features = {};
	for (const base_station of bs_list) {
		const {device_no, x, y, status, icon_model_attr} = base_station;
		const is_online = status === 1;
		if (base_station.floor_id !== floor_id.value) return;
		const label = getDeviceLabel(base_station, BASE_STATION);
		const target_url = is_online ? icon_model_attr.model_2d_url : icon_model_attr.model_2d_off_url;
		const feature = map_obj.addBaseStation(device_no, base_url + target_url, x, y, label, {
			icon_scale: equip_scale.icon,
			text_scale: equip_scale.text,
			offset_y: equip_scale.offset_y,
			text_color: is_online ? ONLINE_LABEL_COLOR : OFFLINE_LABEL_COLOR
		});
		feature.type = BASE_STATION;
		feature.id = device_no;
		all_baseStation_features[device_no] = feature;
	}
};

const showCamera = () => {
	if (props.pageKey === SETTING_KEY.CAMERA_2D) return;
	const camera_list = Array
		.from(now_floor_camera_data.values())
		.filter(() => area_map_setting.value.is_show_camera);
	for (const feature of Object.values(all_camera_features)) {
		removeFeature(feature);
	}
	all_camera_features = {};
	for (const camera of camera_list) {
		const {id, place_x, place_y, status, icon_model_attr} = camera;
		const is_online = status === 1;
		if (camera.floor_id !== floor_id.value) return;
		const text = getDeviceLabel(camera, CAMERA);
		const target_url = is_online ? icon_model_attr.model_2d_url : icon_model_attr.model_2d_off_url;
		const feature = new Feature.point([place_x, place_y], {
			icon: base_url + target_url,
			text,
			icon_scale: equip_scale.icon,
			text_scale: equip_scale.text,
			offset_y: equip_scale.offset_y,
			text_color: is_online ? ONLINE_LABEL_COLOR : OFFLINE_LABEL_COLOR
		});
		feature.type = CAMERA;
		feature.id = id;
		map_obj?.addFeature(feature);
		all_camera_features[id] = feature;
	}
};

const showDevice = () => {
	if (is_device_position_page.value) return;
	const device_list = Array
		.from(now_floor_device_data.values())
		.filter(device => area_map_setting.value.device_type_list.includes(device?.type));
	for (const feature of Object.values(all_device_features)) {
		removeFeature(feature);
	}
	all_device_features = {};
	for (const device of device_list) {
		const {id, status, type, x, y, info, icon_model_attr} = device ?? {};
		if (device.floor_id !== floor_id.value) return;
		const is_online = status !== 0;

		if (![1, 2, 3, 4, 6, TRAFFIC_LIGHT_TYPE, TRAFFIC_ALARM_TYPE].includes(type))
			return;

		const is_traffic_light = (Number(type) === TRAFFIC_LIGHT_TYPE);
		const is_traffic = is_traffic_light;
		const getIconWidth = (device_info) => {
			return [device_info?.straight_light, device_info?.left_light, device_info?.right_light]
				.map(Number)
				.filter(Boolean)
				.length * (DEFAULT_TRAFFIC_ICON_WIDTH / 3);
		};
		const label = getDeviceLabel(device, DEVICE);

		const icon_url = is_online ? icon_model_attr.model_2d_url : icon_model_attr.model_2d_off_url;

		const options = {
			text_color: is_online ? ONLINE_LABEL_COLOR : OFFLINE_LABEL_COLOR,
			rotation: info.rotate,
			anchor: is_traffic ? [0.5, 0.5] : undefined,
			icon_width: is_traffic ? getIconWidth(info) : undefined,
			icon_height: is_traffic ? 76 : undefined
		};
		addDevice(id, type, base_url + icon_url, x, y, label, options, is_traffic);
	}
};
const addDevice = (id, type, icon, x, y, text, options, is_traffic) => {
	const computeOffsetY = (scale, base, rad, w, h) => {
		const gap = -44;
		const y = gap + (-Math.abs(Math.sin(rad) * (w / 2)) + -Math.abs(Math.cos(rad) * (h / 2)));
		return y * scale - 5;
	};

	const offset_y = is_traffic ? computeOffsetY(
		equip_scale.icon,
		equip_scale.offset_y,
		options?.rotation ?? 0,
		options.icon_width ?? 0,
		options.icon_height ?? 0
	) : equip_scale.offset_y;
	const feature = new Feature.point([x, y], {
		icon: icon,
		text: text,
		icon_scale: equip_scale.icon,
		text_scale: equip_scale.text,
		offset_y,
		rotate_with_view: is_traffic,
		...options
	});

	feature.type = is_traffic ? "device_traffic" : "setting_device";
	feature.id = id;
	feature.getOffsetY = (scale) => {
		return computeOffsetY(
			scale,
			equip_scale.offset_y,
			options?.rotation ?? 0,
			options.icon_width ?? 0,
			options.icon_height ?? 0
		);
	};

	feature.rotation = options?.rotation;
	map_obj?.addFeature(feature);
	all_device_features[id] = feature;
};

function getDeviceLabel(device, type) {
	const {device_base_field} = area_map_setting.value;
	const {name, device_no, id} = device;

	let device_id = device_no;
	if (type === CAMERA) {
		device_id = id;
	}
	const labels = [];

	if (device_base_field.includes("name")) {
		labels.push(name);
	}

	if (device_base_field.includes("device_id")) {
		labels.push(device_id);
	}

	if (device_base_field.includes("floor")) {
		labels.push(current_floor_info.value?.storey_name);
	}

	const label = labels.join("-");
	return getTextOverflow(label, 54);
}

const processStaticCardData = async (response) => {
	if (response.data.type === 1) {
		const static_card_list = response.data.result;
		for (const static_card of static_card_list) {
			all_card_list[static_card.card_id] = static_card;
			processCard(static_card);
		}
	}
};

const processCard = async (card_data) => {
	const {card_id, on_line, utype, x, y, time, floor_id: floor} = card_data;
	if (utype === UTYPES.CAR_SEMI) {
		return;
	}
	if (!locationFilter(utype, all_card_info[card_id]?.branch_id || all_card_info[card_id]?.unit_id) || floor !== floor_id.value) {
		if (all_card_features[card_id]) {
			map_obj?.removeOneCard(card_id);
			delete all_card_features[card_id];
		}
		return;
	}
	const card_info = getCardMapInfo(card_id, on_line);
	const options = {
		text_color: card_info.text_color,
		text_background_color: card_info.background_color,
		text_background_border_color: card_info.border_color,
	};
	setCardInfo(card_id, card_info.icon, x, y, card_info.display_info, time, on_line, options);
};

// 获取不同定位对象的label
function getTagName(utype, card) {
	switch (utype) {
	case UTYPES.CAR:
		return card.licence || "";
	case UTYPES.PERSON:
	case UTYPES.VISITOR:
		return card.name || "";
	case UTYPES.CONTRACTOR:
		return card.contractor_name || "";
	case UTYPES.MATERIAL:
		return card.serial_num || "";
	default:
		return "陌生卡";
	}
}

function getTagLabel (card_id) {
	const card = all_card_info[card_id];
	const fields = {
		name: getTagName(card?.utype, card),
		card_id,
		floor_name: current_floor_info.value?.storey_name,
	};

	const show_fields = area_map_setting.value.show_field;

	// 名称 标签卡号 所在楼层
	const label = Object.entries(fields)
		.filter(([option, value]) => show_fields.includes(option) && value)
		.map(([, value]) => value)
		.join("-");

	return getTextOverflow(label, 54);
}

const getTextOverflow = (text, max_length) => {
	if (text.length > max_length) {
		return text.slice(0, max_length) + "...";
	}
	return text;
};

const getCardLabelStyle = (is_online) => {
	const label_style = {...default_color};
	if (!is_online) {
		label_style.text_color = OFFLINE_LABEL_COLOR;
	}
	return label_style;
};

const getCardMapInfo = (card_id, on_line = 1) => {
	const {model_2d_off_url, model_2d_url} = all_card_info[card_id] ? all_card_info[card_id].icon_model_attr : map_icons.stranger;
	const icon = on_line ? model_2d_url : model_2d_off_url;
	const {text_color, text_background_border_color: border_color, text_background_color: background_color} = getCardLabelStyle(on_line);
	const display_info = getTagLabel(card_id);
	return {
		icon,
		text_color,
		border_color,
		display_info,
		background_color
	};
};

const setCardInfo = (card_id, icon, x, y, text, time, online, options) => {
	if (loading_state.value.state !== LOADING_STATE.PARSE_FINISH || !map_obj) return;
	x = parseFloat(x);
	y = parseFloat(y);
	time = new Date(time).getTime();
	if (options === undefined) options = {};
	options.icon_scale = label_scale.icon;
	options.text_scale = label_scale.text;
	options.offset_y = label_scale.offset_y;

	const card_feature = all_card_features[card_id];
	if (card_feature == null) {
		const feature = map_obj.addCardInfo(card_id, base_url + icon, x, y, card_id + "", time, options);
		all_card_features[card_id] = feature;
		feature.type = "tag";
		feature.id = card_id;
		feature.card_x = x;
		feature.card_y = y;
		feature.online = online;
	} else {
		card_feature.card_x = x;
		card_feature.card_y = y;
		map_obj.setCardCoordinate(card_id, x, y, time);
	}

	setCardText(card_id, text, options);
};

const setCardText = (card_id, text, options) => {
	if (loading_state.value.state !== LOADING_STATE.PARSE_FINISH || !all_card_features[card_id]) return;
	map_obj.setCardText(card_id, text, options);
};
const setCardIcon = (card_id, icon, options) => {
	if (loading_state.value.state !== LOADING_STATE.PARSE_FINISH || !all_card_features[card_id]) return;
	if (options == null) options = {};
	options.icon_scale = label_scale.icon;
	options.text_scale = label_scale.text;
	options.offset_y = label_scale.offset_y;

	map_obj.setCardIcon(card_id, icon, options);
};

const bindMapEvent = () => {
	map_obj.on("progress", event => {
		const {progress} = event;
		progress_obj.value = progress;
		handleMap2DProgress({...progress});
	});

	map_obj.on("loadingfailed", () => {
		handleMap2DProgress({...progress_obj.value, loading_failed: true});
	});

	map_obj.on("parsefinish", () => {
		handleMap2DProgress({...progress_obj.value, parse_finish: true});
		getMapDisplayData();
		setMousePositionWidth();
		saveCurrentInfo();
		getFloorConfigParam();
		updateScale();
		if (is_start_measure.value) startMeasureDistance();
		if (is_device_position_page.value && !is_start_measure.value) device_position_tip = createTipPopup("device_position_tip", "选择设备位置");
		const device_change_scale = {icon_scale: equip_scale.icon, text_scale: equip_scale.text, offset_y: equip_scale.offset_y};
		map_obj.setAllCardScale({icon_scale: label_scale.icon, text_scale: label_scale.text, offset_y: label_scale.offset_y});
		map_obj.setAllBaseStationScale(device_change_scale);
		map_obj.setAllFeatureScale("setting_device", device_change_scale);
		map_obj.setAllFeatureScale("device", device_change_scale);
		map_obj.setAllFeatureScale(CAMERA, device_change_scale);
		map_obj.setAllFeatureScale("patrol", {icon_scale: patrol_scale.icon, text_scale: patrol_scale.text, offset_y: patrol_scale.offset_y});
		emits("map-loaded");
	});
	map_obj.on("pointermove", e => {
		if (is_device_position_page.value && device_position_tip?.popup) {
			device_position_tip.popup.setPosition(e.coordinate);
		}
		if (selected_area.value && modify_tip?.popup) {
			modify_tip.popup.setPosition(e.coordinate);
		}
		if (draw_obj && draw_tip?.popup) {
			draw_tip.popup.setPosition(e.coordinate);
		}
		if (props.isEdit) return;
		const pixel = map_obj.getEventPixel(e.originalEvent);
		const hit = map_obj.hasFeatureAtPixel(pixel);
		map_obj.cancelZoneHandleStatus(true);
		if (hit) {
			const feature = map_obj.forEachFeatureAtPixel(e.pixel, feature => feature);
			if (feature.area_id) {
				map_obj.getTarget().style.cursor = "pointer";
				map_obj.setZoneHover(feature.area_id);
			}
		}
		map_obj.getTarget().style.cursor = "";
	});
	map_obj.on("click", (e) => {
		if (e.dragging) return;
		if (!is_start_measure.value) emits("map-click", e.coordinate);
		const pixel = map_obj.getEventPixel(e.originalEvent);
		const hit = map_obj.hasFeatureAtPixel(pixel);
		if (handle_type.value === "modify" && hit) return;
		right_panel_show.value = false;
		handle_type.value = "";
		if (props.isEdit) return;
		map_obj.cancelZoneHandleStatus();
		if (hit) {
			// 拿到该图标对象
			const feature = map_obj.forEachFeatureAtPixel(e.pixel, feature => feature);

			if (feature.area_id) {
				map_obj.setZoneChecked(feature.area_id);
				selected_area.value = feature;
				zone_template_style.value = feature.area_style;
				emits("checked-area", feature.area_id);
			}
			if (feature.type === "device") {
				emits("map-click-device", feature);
			}
			if (feature.type === "patrol") {
				selected_area.value = feature;
				emits("map-click-patrol", feature);
			}
		}
	});
	map_obj.on("contextmenu", e => {
		e.preventDefault();
		if (draw_obj) {
			map_obj.removeInteraction(draw_obj);
			removeDrawTip(draw_tip);
			useEventBus("is-start-draw").emit(false);
			draw_obj = null;
		} else if (props.isEdit && selected_area.value && !selected_area.value.is_temp_area) {
			right_panel_show.value = false;
			const pixel = map_obj.getEventPixel(e.originalEvent);
			const hit = map_obj.hasFeatureAtPixel(pixel);
			if (hit) {
				const feature = map_obj.forEachFeatureAtPixel(e.pixel, feature => feature);
				if ((feature.area_id && feature.area_id === selected_area.value.area_id) || (feature.type === "patrol" && feature.feature_checked)) {
					right_handle_popup.setPosition(e.coordinate);
					right_panel_show.value = true;
				}
			}
		}
	});
};
const bindMapViewEvent = () => {
	map_obj.getView().on("change", () => {
		saveCurrentInfo();
	});

	map_obj.getView().on("change:zoom", () => {
		setMousePositionWidth();
		updateScale();
		const device_change_scale = {icon_scale: equip_scale.icon, text_scale: equip_scale.text, offset_y: equip_scale.offset_y};
		map_obj.setAllCardScale({icon_scale: label_scale.icon, text_scale: label_scale.text, offset_y: label_scale.offset_y});
		map_obj.setAllBaseStationScale(device_change_scale);
		map_obj.setAllFeatureScale("setting_device", device_change_scale);
		for (const i in all_device_features) {
			const device = all_device_features[i];
			if (device.type === "device_traffic" && typeof device?.getOffsetY === "function") {
				const offset_y = device.getOffsetY(equip_scale.icon);
				device.setIcon(undefined, {icon_scale: equip_scale.icon, offset_y, anchor: [0.5, 0.5]});
				device.setText(undefined, {text_scale: equip_scale.text});
			}
		}
		map_obj.setAllFeatureScale("device", device_change_scale);
		map_obj.setAllFeatureScale(CAMERA, device_change_scale);
		map_obj.setAllFeatureScale("patrol", {icon_scale: patrol_scale.icon, text_scale: patrol_scale.text, offset_y: patrol_scale.offset_y});
	});
	map_obj.getView().on("change:rotation", () => {
		let raw_rotation = map_obj.getView().getRotation();

		while (raw_rotation > Math.PI * 2) {
			raw_rotation -= Math.PI * 2;
		}

		while (raw_rotation < -Math.PI * 2) {
			raw_rotation += Math.PI * 2;
		}

		rotation.value = raw_rotation;
	});
};
const handleMap2DProgress = ({total = 0, loaded = 0, percent_complete = 0, speed = 0, parse_finish, loading_failed}) => {
	loading_state.value = {...loading_state.value, progress: percent_complete, loaded, speed, total};
	if (percent_complete > 0 && percent_complete < 1) {
		loading_state.value.state = LOADING_STATE.DOWNLOAD_MAP;
	} else if (percent_complete === 1) {
		loading_state.value.state = LOADING_STATE.PARSING_MAP;
	}
	if (parse_finish) {
		loading_state.value.state = LOADING_STATE.PARSE_FINISH;
	}
	if (loading_failed) {
		loading_state.value.state = LOADING_STATE.DOWNLOAD_FAILED;
	}
};
const createTipPopup = (id, text) => {
	const dom = document.createElement("span");
	dom.id = id;
	dom.className = "draw-tip";
	dom.innerText = text;
	document.body.appendChild(dom);
	return {dom, popup: map_obj.addPopup(id)};
};
const startDraw = (is_temp_area) => {
	if (draw_obj) {
		map_obj.removeInteraction(draw_obj);
		removeDrawTip(draw_tip);
	}
	map_obj.cancelZoneHandleStatus();
	switch (shape_type.value) {
	case "circle":
		draw_obj = new draw.regular_polygon(64);
		break;
	case "rectangle":
		draw_obj = new draw.rectangle();
		break;
	case "polygon":
		draw_obj = new draw.polygon();
		break;
	}
	map_obj.addInteraction(draw_obj);

	draw_tip = createTipPopup("draw_tip", "点击开始绘制，鼠标右键取消绘制"); // 提示语
	useEventBus("is-start-draw").emit(false);
	draw_obj.on("drawstart", () => {
		useEventBus("is-start-draw").emit(true);
		removeDrawTip(draw_tip);
	});
	draw_obj.on("drawend", (e) => {
		const polygon_point = e.feature.getGeometry().getCoordinates()[0]; // 获取图形坐标点
		// 多边形绘制完成后会判断图形是否自相交,使用SDK中的isSelfIntersection()判断
		if (!(draw.isSelfIntersection(polygon_point))) {
			map_obj.removeInteraction(draw_obj); // 删除绘制方式
			draw_obj = null;

			selected_area.value = addZone({area_points: polygon_point, area_style: zone_template_style.value, area_id: temp_area_id, area_name: ""});
			selected_area.value.is_temp_area = is_temp_area;
			map_obj.setZoneChecked(temp_area_id);
			emits("map-draw-end", stringAndArrayTransform(polygon_point));
		} else {
			Notification({
				title: "错误",
				type: "error",
				message: "图形不能自相交"
			});
		}
	});
};

const selectRightHandle = (type) => {
	handle_type.value = type;
	right_panel_show.value = false;
};

const checkedArea = (id) => {
	map_obj.cancelZoneHandleStatus();
	selected_area.value = map_obj.setZoneChecked(id);
};
const checkedPatrolFeature = (feature) => {
	selected_area.value = feature;
};
const setZoneFocus = () => {
	if (!selected_area.value) return;
	const center = map_obj.getGeometryCenter(selected_area.value.getGeometry());
	map_obj.getView().animate({center});
};
const pointerMoveFn = (event) => {
	move_feature?.setCoordinates(event.coordinate);
};
const addPointerMoveEvent = (feature) => {
	move_feature = feature;
	map_obj.on("pointermove", pointerMoveFn);
};
const removePointerMoveEvent = () => {
	map_obj.un("pointermove", pointerMoveFn);
	move_feature = null;
};

const removeDrawTip = (tip_obj) => {
	if (tip_obj) {
		tip_obj.dom.parentNode.remove();
		tip_obj = null;
	}
};

const reDraw = (is_temp_area) => {
	map_obj.removeOneZone(selected_area.value.area_id);
	selected_area.value = null;
	startDraw(is_temp_area);
};

const addZone = ({area_points, area_id, area_name, area_style = "#DCC60080"}) => {
	if (!map_obj) return;
	const points = typeof area_points === "string" ? stringAndArrayTransform(area_points) : area_points;
	const zone = map_obj.addZone(points, area_id, area_name, area_style);
	zone.area_id = area_id;
	zone.area_style = area_style;
	return zone;
};

const createDeviceFeature = ({coordinate, icon, anchor, text, text_color}) => {
	const device_feature = new Feature.point(coordinate, {
		icon,
		text,
		icon_scale: equip_scale.icon,
		text_scale: equip_scale.text,
		offset_y: equip_scale.offset_y,
		text_color,
		anchor
	});
	device_feature.type = "device";
	return device_feature;
};
const createPatrolFeature = ({coordinate, icon, anchor, text, text_color}) => {
	const patrol_feature = new Feature.point(coordinate, {
		icon,
		text,
		icon_scale: patrol_scale.icon,
		text_scale: patrol_scale.text,
		offset_y: patrol_scale.offset_y,
		text_color,
		anchor
	});
	patrol_feature.type = "patrol";
	return patrol_feature;
};

const createCircleFeature = ({coordinate, radius}) => {
	return new Feature.circle(coordinate, radius);
};

const addFeature = (feature) => {
	map_obj?.addFeature(feature);
	area_features.push(feature);
};

const removeFeature = (feature) => {
	map_obj?.removeFeature(feature);
};

const setCenter = (x, y) => {
	map_obj?.setCenter(x, y);
};

const setFeatureHighLight = (feature, icon_src) => {
	let icon_scale = equip_scale.icon, offset_y = equip_scale.offset_y;
	if (feature.type === "patrol") {
		icon_scale = patrol_scale.icon;
		offset_y = patrol_scale.offset_y;
	}
	feature?.setIcon(icon_src, {icon_scale, offset_y});
};

const getTwoPointsDistance = (point_one, point_two) => {
	return Math.sqrt(Math.pow(point_one[0] - point_two[0], 2) + Math.pow(point_one[1] - point_two[1], 2)).toFixed(6);
};

const getZonePoints = () => {
	const area_data = {
		area: "",
		circle_center: "",
		circle_radius: ""
	};
	if (!selected_area.value) return area_data;
	const coordinates = selected_area.value.getGeometry().getCoordinates()[0];
	const center = map_obj.getGeometryCenter(selected_area.value.getGeometry());
	const radius = getTwoPointsDistance(coordinates[0], center);
	const res = coordinates.reduce((result, cur) => {
		return getTwoPointsDistance(cur, center) - result;
	}, radius);
	area_data.area = stringAndArrayTransform(selected_area.value.getGeometry().getCoordinates()[0]);
	if (res === 0 && shape_type.value === "circle") {
		area_data.circle_center = center;
		area_data.circle_radius = radius;
	}
	return area_data;
};

const getPatrolPointCoordinate = () => {
	return selected_area.value ? selected_area.value.getGeometry().getCoordinates() : null;
};

const changeZoneTemplate = (area_style) => {
	zone_template_style.value = area_style;
	if (!selected_area.value) return;
	map_obj?.setZoneColor(selected_area.value.area_id, area_style);
};

const changeCircleTemplate = (feature, area_style) => {
	feature?.updateStyle(area_style, "#5B7397", 1);
};

const getCurrentFloorInfo = () => {
	return current_floor_info.value;
};

const zoomIn = () => {
	map_obj.getView().animate({
		center: map_obj.getView().getCenter(),
		zoom: map_obj.getView().getZoom() + 1
	});
};

const zoomOut = () => {
	map_obj.getView().animate({
		center: map_obj.getView().getCenter(),
		zoom: map_obj.getView().getZoom() - 1
	});
};

const changeDirection = ({is_reset}) => {
	let rotation;
	if (is_reset) {
		rotation = 0;
	} else {
		rotation = map_obj.getView().getRotation() + Math.PI / 2;
		const num = Math.abs(rotation - Math.PI * 2);
		if (num < 0.001) rotation = 0;
	}

	map_obj.getView().setRotation(rotation);
};

const backDefaultView = () => {
	const {zoom, center} = default_view;
	map_obj.getView().animate({zoom, center});
};

const startMeasureDistance = () => {
	is_start_measure.value = true;
	map_obj.removeControlMeasure();
	map_obj.addControlMeasure("line", {
		drawend: () => {
			map_obj.removeControlMeasure();
		}
	});
};

const stopMeasureDistance = () => {
	is_start_measure.value = false;
	map_obj.clearMeasureFeature();
	map_obj.removeControlMeasure();
};
const reMeasureDistance = () => {
	stopMeasureDistance();
	startMeasureDistance();
};

const clearHandleActive = () => {
	map_obj.clearZoneHandleActive();
	removeDrawTip(modify_tip);
	map_obj.setModifyInteractionActive(false);
	map_obj.setScaleInteractionActive(false);
	map_obj.setRotateInteractionActive(false);
	map_obj.setTranslateInteractionActive(false);
};
const cancelSaveArea = () => {
	if (draw_obj) {
		map_obj?.removeInteraction(draw_obj);
		draw_obj = null;
	}
	if (handle_type.value) clearHandleActive();
	right_panel_show.value = false;
	selected_area.value = null;
	handle_type.value = "";
	shape_type.value = "rectangle";
	removeDrawTip(draw_tip);
	removeDrawTip(modify_tip);
	map_obj?.removeAllZone();
	for (const feature of area_features) {
		removeFeature(feature);
	}
	area_features = [];
};

getAllNecessaryData();

watch(() => area_map_setting.value, () => {
	if (loading_state.value.state !== LOADING_STATE.PARSE_FINISH || !map_obj) return;
	for (const card_id in all_card_list) {
		processCard(all_card_list[card_id]);
	}
	showBaseStation();
	showDevice();
	showCamera();
});

watch(() => handle_type.value, (val) => {
	clearHandleActive();
	switch (val) {
	case "modify":
		modify_tip = createTipPopup("modify_tip", "选中元素后，单击添加节点，按住alt单击删除节点，按住鼠标可拖动节点");
		map_obj.setModifyInteractionActive(true);
		break;
	case "scale":
		map_obj.setScaleInteractionActive(true);
		break;
	case "rotate":
		map_obj.setRotateInteractionActive(true);
		break;
	case "translate":
		map_obj.setTranslateInteractionActive(true);
		break;
	case "redraw":
		reDraw();
		break;
	}
});

watch(() => selected_area.value, (val) => {
	const is_area = val ? true : false;
	useEventBus("is-exist-area").emit(is_area);
}, {
	immediate: true
});

watch(() => shape_type.value, () => {
	if (!draw_obj) return;
	startDraw();
});

watch(() => is_start_measure.value, (val) => {
	if (is_device_position_page.value && !val && map_obj) {
		device_position_tip = createTipPopup("device_position_tip", "选择设备位置");
	} else {
		removeDrawTip(device_position_tip);
	}
});

const emits = defineEmits(["checked-area", "map-loaded", "map-draw-end", "map-click", "map-click-device", "map-click-patrol"]);

defineExpose({
	changeMap,
	startDraw,
	reDraw,
	addZone,
	getZonePoints,
	cancelSaveArea,
	changeZoneTemplate,
	getCurrentFloorInfo,
	createDeviceFeature,
	createCircleFeature,
	createPatrolFeature,
	addFeature,
	removeFeature,
	checkedArea,
	addPointerMoveEvent,
	removePointerMoveEvent,
	setCenter,
	setFeatureHighLight,
	changeCircleTemplate,
	setZoneFocus,
	getPatrolPointCoordinate,
	clearHandleActive,
	checkedPatrolFeature
});

</script>
<style scoped lang="scss">
.area-map-container {
    position:relative;
    width:100%;
    height:100%;
}

.map-select {
	position:absolute;
    top:20px;
    left:20px;
	z-index:2000
}

.add-btn {
    position:absolute;
    top:100px;
	left:20px;
}

.area-map {
    position:relative;
    width:100%;
    height:100%;
}

.area-map :deep(.ol-zoom),
.area-map :deep(.ol-rotate){
	display: none;
}

.area-map :deep(.draw-tip) {
	display: inline-block;
	position: absolute;
	left: 18px;
	top: -12px;
	width: max-content;
	padding: 8px;
	border-radius: 4px;
	background-color: #13213699;
	color: #ECF3FF;
	font-size: 12px;
	line-height: 12px;
	font-family: "DingTalk JinBuTi";
}

.area-map :deep(.hg_mouse_position) {
    bottom: 43px;
    position: absolute;
    left: 62px;
    color: #fff;
    font-size: 12px;
    text-align: center;
	width: v-bind(mouse_position_width);
	font-family: "DingTalk JinBuTi";
	white-space: nowrap;
}

.area-map :deep(.hg_scale_line) {
  position: absolute;
  bottom: 20px;
  left: 60px;
  background-color: transparent;
  font-family: "DingTalk JinBuTi";
  color: white;
  text-shadow:
    1px 0 0 #293F54, /*right */
    0 1px 0 #293F54, /*top */
    -1px 0 0 #293F54, /*left */
    0 -1px 0 #293F54; /*bottom */
}

.area-map :deep(.hg_scale_line-inner) {
  color: white;
  border: 1px solid white;
  outline: 0px solid #293F54;
  box-shadow: inset 0 0 0 0px #293F54;
  clip-path: inset(0 -2px -2px -2px);
  border-top: none;
}
.area-map :deep(.measure-tool-notify) {
	position: absolute;
	color: white;
	pointer-events: none;
	background-color: rgba(0, 0, 0, 0.4);
	margin: 16px 0;
	border-radius: 4px;
	padding: 5px 8px;
}

#right-handle-panel {
	display: flex;
	flex-direction: column;
	width: 88px;
	border-radius: 4px;
	border: 1px solid #EFF3F6;
	background-color: #FFF;
	span{
		padding: 8px 12px;
		font-size: 14px;
		color: #748BA4;
		cursor: pointer;
	}
	span:hover {
		background-color: #E2EEFB;
	}
}

.map-campass-icon {
	position: absolute;
	top: 20px;
	right: 20px;
	z-index: 200;
	cursor: pointer;
}

</style>
