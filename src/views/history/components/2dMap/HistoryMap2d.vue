<template>
<div class="page-2d-map">
	<map-loading
		:loaded="loading_state.loaded"
		:progress="loading_state.progress"
		:speed="loading_state.speed"
		:state="loading_state.state"
		:total="loading_state.total"
		style="z-index: 1002;"
	/>

	<div
		id="map-2d"
		ref="map_ref"
		:style="{backgroundColor: engine_bg_color}"
	/>

	<statistics-panel
		v-for="(item) in building_label_positions"
		:key="item.id"
		:show-name="area_map_setting.building_config.includes('building_name')"
		:show-statistics="area_map_setting.building_config.includes('statistics')"
		:data="building_statistics_data[item.id]"
		:position="{left: item.x + 'px', top: item.y + 'px'}"
		:loading="false"
		:display-type="Dimension.Two"
		:building-clickable="false"
	/>

	<map-tool
		ref="map_tool_ref"
		:page-key="props.mapSettingKey"
		:is-loaded="loading_state.state === LOADING_STATE.PARSE_FINISH ? 1 : 0"
		:disabled-measure="false"
		:dimension="dimension"
		:disable-switch-dimension="props.disabledSwitchMap"
		:exclude="exclude_map_tools"
		@zoom-in="handleZoom('zoom_in')"
		@zoom-out="handleZoom('zoom_out')"
		@back-default-view="handleBackCenter"
		@switch-map="handleSwitchMap"
		@start-measure="startMeasureDistance"
	/>
	<measure-distance-buttons
		v-show="is_start_measure"
		@re-measure="reMeasureDistance"
		@exit-measure="stopMeasureDistance"
	/>

	<campass-icon
		class="map-campass-icon"
		:rotation="rotation_rad"
		@reset="handleRotateChange({is_reset: true})"
	/>

	<div
		v-show="is_baidu_map"
		class="gps-map-type"
	>
		<el-switch
			v-model="is_gps_earth_map"
			active-color="#07f"
			inactive-color="#ff4949"
			active-text="卫星"
			inactive-text="地图"
			@change="changeGPSMapType"
		/>
	</div>
</div>
</template>

<script setup>
import {isCancel} from "axios";
import {ref, shallowRef, computed, inject, onBeforeUnmount, onMounted, watch, nextTick} from "vue";
import {useEventBus} from "@vueuse/core";
import {storeToRefs} from "pinia";
import {Notification} from "element-ui";

import {map as MapSDK, control as Control, draw as Draw, feature as Feature} from "@/libs/HG2DMap.mjs";
import "@/libs/HG2DMap.min.css";
import store from "@/store";
import {base_url} from "@/Config";
import {AreaType} from "@/types/global";
import {Dimension} from "@/types/map";
import {getCardHistoryRequest, getHistoryHeatMapByUUID} from "@/api/history/history";
import {getGpsCardHistoryRequest} from "@/api/history/gpsHistory";
import {LOADING_STATE} from "@/utils/js/loadingStateTypes";
import MapIcons from "@/utils/js/tools/mapIcons";
import {stringAndArrayTransform} from "@/utils/js/tools/map";
import {UTYPES} from "@/utils/js/constant";
import MapLoading from "@/components/MapLoading.vue";
import MapTool from "@/components/AreaMap/components/MapTool.vue";
import MeasureDistanceButtons from "@/components/AreaMap/components/MeasureDistanceButtons.vue";
import CampassIcon from "@/components/Map/CampassIcon.vue";
import {useMapParams, useAreaMapStorage} from "@/composable";
import {SETTING_CHANGE_KEY, ROTATE_KEY} from "@/events";

import {useDetailDialogStore, DetailDialogCategoryEnum} from "@index/store";
import StatisticsPanel from "@index/components/StatisticsPanel.vue";

import {useApiData, useTrajectoryColorsStore, useHistoryStore, MAP_LOAD_STATUS} from "@/views/history/store";
import {FOCUS_TAG, DELETED_AREA} from "@/views/history/events";
import {UTYPE_NAME_KEY_MAP, FeatureType, REPLAY_WAY} from "@/views/history/constant";
import router from "@/views/history/router";

import {findNearestTargetNum, requestErrorNotify, setInfoCardContent, groupHistoryTrajectory, moveViewToArea, getInitBuildingStatisticsData} from "../../units";
import {useCustomMapConfig, useBaiduMapConfig, generateLabelAndEquipScaleFn} from "./composable/getMapConfig";
import {drawHeatmapFeature, drawSingleTrajectoryLine, locationMapCenter, removeDrawFeature} from "./composable/mapFeature";
import {OUTDOOR_STOREY_ID} from "@/utils/js/constant";

let map_instance = null;
let draw_instance = null;
// 绘制的 feature
let draw_feature = null;
let popup_instance = null;
// 定位卡和卡号的映射
const card_uuid_map = new Map();
// 定位卡图标和 label 缩放因数
let card_scale = {icon: 1, text: 1, offset_y: 0};
// 获取定位卡图标和label缩放对象函数
let getCardScale = null;
// 基站图标和 label 缩放因数
let base_station_scale = {icon: 1, text: 1, offset_y: 0};
let getBaseStationScale = null;
const base_station_features = new Map();
// 巡检点图标和 label 缩放因数
let patrol_point_scale = {icon: 1, text: 1, offset_y: -105};
let getPatrolPointScale = null;
const patrol_point_features = new Map();
// 完整的轨迹数据
let history_data = null;
let group_trajectory = new Map();
// 是否获取了完整的轨迹数据
let get_full_trajectory = false;
// 最后一条轨迹数据的时间戳
let last_trajectory_timestamp = 0;
// 完整的热力图数据
let history_heatmap_data = null;
// 完整轨迹线 feature_list
const full_trajectory_feature_map = new Map();
// 已绘制的轨迹线 feature_list
let drawn_trajectory_feature_list = [];
// 人车定位卡的坐标
let card_coordinate = null;
// 地图初始中心点
let map_init_center = [];
// 地图初始缩放大小
let map_init_zoom = 56;

const SCENE_FLOORS = inject("SCENE_FLOORS");
const FLOOR_OBJ = inject("FLOOR_OBJ");
const BUILDING_FLOORS = inject("BUILDING_FLOORS");
const PERSON_OBJ = inject("PERSON_OBJ");
const CAR_OBJ = inject("CAR_OBJ");
const VISITOR_OBJ = inject("VISITOR_OBJ");
const MATERIAL_OBJ = inject("MATERIAL_OBJ");
const CONTRACTOR_OBJ = inject("CONTRACTOR_OBJ");
const CONFIG = inject("CONFIG");

const emits = defineEmits(["draw-region-end", "map-loadend", "switch-map"]);

const props = defineProps({
	isShow2d: {
		type: Boolean,
		required: true
	},
	// 楼层 id
	floor: {
		type: Number,
		required: true
	},
	// 轨迹开始时间
	start: {
		type: Number,
		required: true
	},
	// 轨迹结束时间
	end: {
		type: Number,
		required: true
	},
	// 标签回放-当前播放的uuid_list
	playUuidList: {
		type: Array,
		default: () => [],
		required: false
	},
	// heatMap-热力图模块，uuid-标签回放模块，area-区域回放模块
	historyType: {
		type: String,
		required: true
	},
	// true-开始播放轨迹，false-结束播放轨迹
	startPlayBack: {
		type: Boolean,
		required: true
	},
	// true-显示轨迹，false-关闭轨迹
	isShowTrack: {
		type: Boolean,
		required: true
	},
	// true-显示完整轨迹，false-关闭完整轨迹
	isShowAllTruck: {
		type: Boolean,
		required: true
	},
	// 区域 id，仅区域回放模块有用
	area: {
		type: String,
		required: false,
		default: undefined
	},
	mapSettingKey: {
		type: String,
		required: true,
	},
	disabledSwitchMap: {
		type: Boolean,
		required: true
	},
});

// state 设置为 -3 目的是让 MapLoading 组件 display:none
const loading_state = ref({total: 0, loaded: 0, speed: 0, progress: 0, state: -3});
// 信息框数据，地图上只能出现一个信息框
const info_card_obj = shallowRef(undefined);
const info_card_coordinate = shallowRef([]);
const map_info = ref("");
const is_gps_earth_map = ref(false);
const map_ref = ref();
const mouse_position_width = ref("100px");
const dimension = ref("two");
const is_start_measure = ref(false);
const map_tool_ref = ref(null);
const building_label_positions = shallowRef([]);
const building_statistics_data = ref({});

const engine_bg_color = computed(() => store.getters.engine_bg_color);
const is_baidu_map = computed(() => props.floor === 2);
const rotation_rad = computed(() => {
	const current_floor_info = FLOOR_OBJ.value[props.floor];
	return rotation.value - (current_floor_info?.direction ?? 0);
});
const exclude_map_tools = computed(() => {
	if (props.historyType === "area") {
		return ["application"];
	} else if (props.historyType === "uuid") {
		return is_start_measure.value ? ["switch_map"] : [];
	} else {
		return [];
	}
});
const on_scene_buildings = computed(() => {
	const scene_id = FLOOR_OBJ.value[props.floor]?.scene_id;
	return SCENE_FLOORS.value[scene_id]?.building_ids?.map((building_id) => BUILDING_FLOORS.value[building_id]) ?? [];
});
const on_scene_floor_ids = computed(() => {
	const scene_id = FLOOR_OBJ.value[props.floor]?.scene_id;
	const scene_info = SCENE_FLOORS.value[scene_id];
	if (!scene_info) return [];
	const floor_id_list = scene_info.floor_list.map(({floor_id}) => floor_id);
	const outdoor_id = scene_info.outdoor?.floor_id;
	return outdoor_id ? [...floor_id_list, outdoor_id] : floor_id_list;
}
);

const {trajectory_colors} = storeToRefs(useTrajectoryColorsStore());
const {fetchAreas, fetchBaseStations, fetchPatrolPoints} = useApiData();
const {base_station_map, areas_map, patrol_points_map} = storeToRefs(useApiData());
const {already_search_area, play_multiple, map_load_status, replay_way} = storeToRefs(useHistoryStore());
const detail_dialog_store = useDetailDialogStore();
const {on: onFocusTag} = useEventBus(FOCUS_TAG);
const {emit: emitDeletedArea} = useEventBus(DELETED_AREA);

useEventBus(ROTATE_KEY).on((payload) => {
	if (!props.isShow2d) return;
	handleRotateChange(payload);
});
useEventBus(SETTING_CHANGE_KEY).on(({checked, unchecked}, map_setting) => {
	if (!props.isShow2d) return;
	toggleTag(checked, unchecked);
	toggleTagFields(checked, unchecked, map_setting);
	toggleBs(checked, unchecked, map_setting);
	toggleBsFields(checked, unchecked, map_setting);
	toggleAreas(checked, unchecked, map_setting);
	togglePatrolPoints(checked, unchecked, map_setting);
});
const {rotation} = useMapParams();
const {area_map_setting} = useAreaMapStorage(props.mapSettingKey);

let getCustomMapConfig = null;
const getBaiduMapConfig = useBaiduMapConfig(CONFIG);
let is_from_emergency_report_page = false;

onMounted(() => {
	is_from_emergency_report_page = router.currentRoute.query.from === "emergencyReport";
	getCustomMapConfig = useCustomMapConfig({
		scene_floors_inject: SCENE_FLOORS,
		building_floors_inject: BUILDING_FLOORS,
		floor_obj_inject: FLOOR_OBJ,
		config_inject: CONFIG,
		map_dom: document.getElementById("map-2d")
	});

	onFocusTag((uuid) => {
		if (props.isShow2d && map_load_status.value === MAP_LOAD_STATUS.completed && props.startPlayBack && map_instance) {
			const find_one = Array.from(card_uuid_map.values()).find((item) => item.uuid === uuid);
			if (find_one) {
				map_instance.setCardFocus(find_one.card_id);
			}
		}
	});
});

onBeforeUnmount(() => {
	removeMapEvent();
});

watch(() => props.isShow2d, (new_value) => {
	if (!new_value) {
		// 退出2d
		dimension.value = "three";
		abortFetchCardHistory();
	} else {
		dimension.value = "two";
	}
}, {
	immediate: true
});

// 开始播放轨迹
watch(() => props.startPlayBack, (new_value) => {
	if (!props.isShow2d) return;
	const {historyType, floor} = props;
	if (["heatMap", "uuid"].includes(historyType)) {
		abortFetchCardHistory();
		new_value && changeMap(floor);
	} else if (historyType === "area") {
		new_value && changeMap(floor);
	}
});

watch(already_search_area, (new_value) => {
	if (!props.isShow2d) return;
	if (!new_value) {
		// 区域回放退出，清除地图上的定位对象
		removeAllTag();
	}
});

watch(play_multiple, () => {
	map_instance?.setAnimationSpeed(play_multiple.value);
});

watchUUIDModule();
watchAreaModule();

// 监听标签回放模块
function watchUUIDModule() {
	if (["uuid", "heatMap"].includes(props.historyType)) {
		// 标签回放模块，切换显示完整轨迹
		watch(() => props.isShowAllTruck, (new_value) => {
			if (!props.isShow2d || !map_instance) return;
			if (new_value) {
				card_uuid_map.forEach(({uuid}) => showTagAllTrack(uuid));
			} else {
				full_trajectory_feature_map.forEach((feature) => map_instance.removeFeature(feature));
				full_trajectory_feature_map.clear();
			}
		});
	}
}

// 监听区域回放模块
function watchAreaModule() {
	if (props.historyType === "area") {
		// 区域回放模块的楼层变化，切换不同的地图
		watch(() => props.floor, (new_floor_id) => {
			if (!props.isShow2d) return;
			nextTick(() => {
				new_floor_id && changeMap(new_floor_id);
			});
		}, {
			immediate: true
		});

		// 区域回放模块切换是否显示轨迹
		watch(() => props.isShowTrack, (new_value) => {
			if (!props.isShow2d) return;
			toggleCardTrack(new_value);
		});
	}
}

const handleBuildingLabelPosition = (e) => {
	getBuildingLabels(e.position);
};
function getBuildingLabels(position) {
	building_label_positions.value = Object
		.keys(position)
		.map(id => ({
			id: +id,
			...position[id],
		}));
}

function setMousePositionWidth() {
	nextTick(() => {
		mouse_position_width.value = document.getElementsByClassName("hg_scale_line-inner")[0]?.style?.width;
	});
}

// 处理绘制完毕
function handleDrawEnd(e) {
	if (!map_instance || !draw_instance) return;
	const feature = e.feature;
	draw_feature = feature;
	const points = feature.getCoordinates()[0];
	if ((points[2][0] === points[1][0]) && (points[2][1] === points[1][1])) {
		return Notification({type: "error", title: "错误", message: "图形不能是一个点或一条直线"});
	} else if (Draw.isSelfIntersection(points)) {
		return Notification({type: "error", title: "错误", message: "图形不能自相交"});
	}
	map_instance.addFeature(feature);
	draw_instance.setActive(false);
	emits("draw-region-end", points);
}

function handleZoom(type) {
	const map_view = map_instance.getView();
	const zoom = map_view.getZoom();
	map_view.animate({
		center: map_view.getCenter(),
		zoom: type === "zoom_in" ? zoom + 1 : zoom - 1
	});
}

// 通过点击旋转icon旋转地图
function handleRotateChange({is_reset}) {
	let rotation;
	if (is_reset) {
		rotation = 0;
	} else {
		rotation = map_instance.getView().getRotation() + Math.PI / 2;
		const num = Math.abs(rotation - Math.PI * 2);
		if (num < 0.001) rotation = 0;
	}

	map_instance.getView().setRotation(rotation);
}

// 地图视图旋转时触发的事件，通过点击"回正"按钮（这是openLayer自带）
function handleMapViewChangeRotation() {
	rotation.value = map_instance.getView().getRotation();
}

// 回到地图初始中心点和缩放到初始大小
function handleBackCenter() {
	locationMapCenter(map_instance, map_init_center, map_init_zoom);
}

function handleSwitchMap(value) {
	dimension.value = value;
	emits("switch-map", value);
}

function startMeasureDistance() {
	is_start_measure.value = true;
	map_instance.removeControlMeasure();
	map_instance.addControlMeasure("line", {
		drawend: () => {
			map_instance.removeControlMeasure();
		}
	});
}
function reMeasureDistance() {
	stopMeasureDistance();
	startMeasureDistance();
}
function stopMeasureDistance() {
	is_start_measure.value = false;
	map_instance.clearMeasureFeature();
	map_instance.removeControlMeasure();
}

function loadBs(map_setting) {
	const {bs_type_list} = map_setting;
	map_instance.removeAllBaseStation();
	base_station_features.clear();
	base_station_map.value.forEach((item) => {
		const {status, device_no, x, y, icon_model_attr} = item;
		const {model_2d_url, model_2d_s_url, model_2d_off_url, model_2d_off_s_url} = icon_model_attr || {};
		const text = getBsLabel(item, map_setting);

		if (bs_type_list.includes(item.base_type)) {
			let icon_src, text_color, selected_url;
			if (status) {
				icon_src = model_2d_url;
				selected_url = model_2d_s_url;
				text_color = "#15F9F8";
			} else {
				icon_src = model_2d_off_url;
				selected_url = model_2d_off_s_url;
				text_color = "#D1D8E1";
			}
			const feature = map_instance.addBaseStation(
				device_no,
				`${base_url}${icon_src}`,
				x,
				y,
				text,
				{
					icon_scale: base_station_scale.icon,
					text_scale: base_station_scale.text,
					offset_y: base_station_scale.offset_y,
					text_color,
				}
			);
			feature.type = FeatureType.BASE_STATION;
			feature.card_num = device_no;
			feature.model_2d_url = icon_src;
			feature.model_2d_s_url = selected_url;
			base_station_features.set(item.device_no, feature);
		}
	});
	if (info_card_obj.value?.type === FeatureType.BASE_STATION) {
		const feature = base_station_features.get(info_card_obj.value.station_id);
		feature && updateSelectedFeature(feature);
	}
}
function toggleBs(checked, unchecked, map_setting) {
	if ("bs_type_list" in checked || "bs_type_list" in unchecked) {
		loadBs(map_setting);
	}
}
function getBsLabel(item, map_setting) {
	const {device_base_field} = map_setting;
	const text_list = [];
	if (device_base_field.includes("name")) {
		text_list.push(item.name);
	}
	if (device_base_field.includes("device_id")) {
		text_list.push(item.device_no);
	}
	if (device_base_field.includes("floor")) {
		const storey_name = FLOOR_OBJ.value[item.floor_id]?.storey_name;
		storey_name && text_list.push(storey_name);
	}
	return text_list.join("-");
}
function toggleBsFields(checked, unchecked, map_setting) {
	if ("device_base_field" in checked || "device_base_field" in unchecked) {
		loadBs(map_setting);
	}
}

function addZone(coordinates, id, name, style) {
	let area_coords = [];
	if (typeof coordinates === "string") {
		area_coords = stringAndArrayTransform(coordinates);
	}
	map_instance.addZone(area_coords, id, name, style);
	if (id.toString() === props.area) {
		// 当前选择的区域设置为视图中心
		const center = moveViewToArea(area_coords);
		map_instance.getView().animate({center: center});
	}
}
function loadAreas(map_setting) {
	const {floor} = props;
	const {area_id_list, is_show_obstacle_area, is_show_active_area, is_show_blind} = map_setting;
	map_instance.removeAllZone();
	areas_map.value.forEach((item) => {
		const {coords: area, id, name, color, type, floor_id} = item;
		if (floor_id === floor && [AreaType.OBSTACLE, AreaType.ACTIVITY, AreaType.BLIND].includes(type)) {
			// 定位优化区域
			if (is_show_obstacle_area && type === AreaType.OBSTACLE) {
				addZone(area, id, name, color);
			}
			if (is_show_active_area && type === AreaType.ACTIVITY) {
				addZone(area, id, name, color);
			}
			if (is_show_blind && type === AreaType.BLIND) {
				addZone(area, id, name, color);
			}
		} else {
			// area_id_list不包含定位优化区域
			if (area_id_list.includes(item.id)) {
				if (is_from_emergency_report_page && replay_way.value === REPLAY_WAY.all && on_scene_floor_ids.value.includes(item.floor_id)) {
					// 应急报告跳转过来要把场景下的安全、事故、疏散显示出来
					// 但是安全、事故、疏散都属于电子围栏，无法过滤非安全、事故、疏散区域
					addZone(area, id, name, color);
				} else if (floor_id === floor) {
					addZone(area, id, name, color);
				}
			}
		}
	});
}
function toggleAreas(checked, unchecked, map_setting) {
	if ("area_id_list" in checked || "area_id_list" in unchecked) {
		loadAreas(map_setting);
	}
	if ("is_show_obstacle_area" in checked || "is_show_obstacle_area" in unchecked) {
		loadAreas(map_setting);
	}
	if ("is_show_active_area" in checked || "is_show_active_area" in unchecked) {
		loadAreas(map_setting);
	}
	if ("is_show_blind" in checked || "is_show_blind" in unchecked) {
		loadAreas(map_setting);
	}
}

function loadPatrolPoints(map_setting) {
	const {is_show_patrol} = map_setting;
	patrol_point_features.forEach(({point, circle}) => {
		map_instance.removeFeature(point);
		map_instance.removeFeature(circle);
	});
	patrol_point_features.clear();
	if (!is_show_patrol) return;
	patrol_points_map.value.forEach((item) => {
		const circle_attribute = JSON.parse(item.circle_attribute);
		const options = {
			id: item.id,
			center: [parseFloat(circle_attribute.center.x), parseFloat(circle_attribute.center.y)],
			radius: parseFloat(circle_attribute.radius),
			icon: base_url + MapIcons.patrol.model_2d_url,
			text: item.name,
			area_style: item.area_template.area_style
		};
		const feature = addPatrolPointFeature(options);
		patrol_point_features.set(item.id, feature);
	});
}
function togglePatrolPoints(checked, unchecked, map_setting) {
	if ("is_show_patrol" in checked || "is_show_patrol" in unchecked) {
		loadPatrolPoints(map_setting);
	}
}

function addPatrolPointFeature(options) {
	const {center, radius, icon, text, anchor, text_color, area_style, id} = options;
	const point_feature = new Feature.point(center, {
		icon,
		text,
		icon_scale: patrol_point_scale.icon,
		text_scale: patrol_point_scale.text,
		offset_y: patrol_point_scale.offset_y,
		text_color,
		anchor
	});
	point_feature.patrol_point_id = id;
	point_feature.type = FeatureType.PATROL_POINT;
	point_feature.card_num = id;

	const circle_feature = new Feature.circle(center, radius);
	circle_feature.updateStyle(area_style, "#5B7397", 1);
	circle_feature.patrol_point_id = id;
	circle_feature.type = FeatureType.PATROL_POINT;
	circle_feature.card_num = id;

	map_instance.addFeature(point_feature);
	map_instance.addFeature(circle_feature);

	return {point: point_feature, circle: circle_feature};
}

// 更新信息弹窗的位置，保证和定位卡位置一样
function handleAnimateMove(e) {
	const coordinates = e.coordinates;
	if (info_card_obj.value && info_card_obj.value.card_num === e.feature.card_num) {
		info_card_coordinate.value = coordinates;
		popup_instance.setPosition(coordinates);
	}
}

function updateSelectedFeature(cur_feature) {
	if (cur_feature.type === FeatureType.BASE_STATION) {
		cur_feature.setIcon(`${base_url}${cur_feature.model_2d_s_url}`, {
			icon_scale: base_station_scale.icon,
			text_scale: base_station_scale.text,
			offset_y: base_station_scale.offset_y
		});
	} else if (cur_feature.type === FeatureType.TAG) {
		map_instance.setCardIcon(
			cur_feature.card_num,
			getTagIcon(cur_feature.uuid, true),
			{
				icon_scale: card_scale.icon,
				text_scale: card_scale.text,
				offset_y: card_scale.offset_y
			}
		);
	} else if (cur_feature.type === FeatureType.PATROL_POINT) {
		cur_feature.setIcon(`${base_url}${MapIcons.patrol.model_2d_s_url}`, {
			icon_scale: patrol_point_scale.icon,
			text_scale: patrol_point_scale.text,
			offset_y: patrol_point_scale.offset_y
		});
	}
}
function handlePointerdown(e) {
	if (e.dragging) return;
	const pixel = map_instance.getEventPixel(e.originalEvent);
	const hit = map_instance.hasFeatureAtPixel(pixel);

	if (hit) {
		const feature = map_instance.forEachFeatureAtPixel(e.pixel, feature => feature);
		const {card_num, uuid, type} = feature;
		if (type === FeatureType.TAG || type === FeatureType.BASE_STATION || type === FeatureType.PATROL_POINT) {
			if (card_num === info_card_obj.value?.card_num) return;
			// 把之前选择的定位卡图标设置为正常， 把当前的选择的定位卡设置为高亮
			hidePopup();
			updateSelectedFeature(feature);

			if (type === FeatureType.TAG) {
				info_card_obj.value = setInfoCardContent(PERSON_OBJ.value[uuid], card_num, FeatureType.PERSON)
					|| setInfoCardContent(VISITOR_OBJ.value[uuid], card_num, FeatureType.VISITOR)
					|| setInfoCardContent(CAR_OBJ.value[uuid], card_num, FeatureType.CAR)
					|| setInfoCardContent(MATERIAL_OBJ.value[uuid], card_num, FeatureType.MATERIAL)
					|| setInfoCardContent(CONTRACTOR_OBJ.value[uuid], card_num, FeatureType.CONTRACTOR);

				openTagDialog(card_uuid_map.get(card_num));
				detail_dialog_store.toggleVisible(DetailDialogCategoryEnum.POSITION_OBJECT, true);
			} else if (type === FeatureType.BASE_STATION) {
				const station_data = base_station_map.value.get(card_num);
				info_card_obj.value = setInfoCardContent(station_data, card_num, FeatureType.BASE_STATION);

				detail_dialog_store.setProps(DetailDialogCategoryEnum.BASE_STATION, {
					direction: "rtl", // 控制弹窗的方向，优先级比 from 高
					device_uuid: info_card_obj.value.device_uuid,
					is_backstage: true,
					close: () => {
						hidePopup();
					}
				});
				detail_dialog_store.toggleVisible(DetailDialogCategoryEnum.BASE_STATION, true);
			} else if (type === FeatureType.PATROL_POINT) {
				// 巡检点的card_num就是巡检点的id
				const patrol_point_data = patrol_points_map.value.get(card_num);
				info_card_obj.value = setInfoCardContent(patrol_point_data, card_num, FeatureType.PATROL_POINT);

				detail_dialog_store.setProps(DetailDialogCategoryEnum.PATROL_POINT, {
					direction: "rtl", // 控制弹窗的方向，优先级比 from 高
					id: info_card_obj.value.patrol_point_id,
					close: () => {
						hidePopup();
					}
				});
				detail_dialog_store.toggleVisible(DetailDialogCategoryEnum.PATROL_POINT, true);
			}
		}
	}
}

function openTagDialog(card_item) {
	if (!info_card_obj.value || !card_item) return;
	const {card_x: x, card_y: y, card_z: z, floor_id: card_floor_id} = card_item;
	const {card_num, utype, uuid, type_name: truck_type_name} = info_card_obj.value;
	const floor_info = FLOOR_OBJ.value[card_floor_id];
	const is_outdoor = floor_info?.storey_id === OUTDOOR_STOREY_ID;
	detail_dialog_store.setProps(DetailDialogCategoryEnum.POSITION_OBJECT, {
		direction: "rtl", // 控制弹窗的方向，优先级比 from 高
		utype,
		uuid,
		is_history: true,
		history_location: {
			card_id: card_num,
			power: null,
			is_lower_power: false,
			status: null,
			floor: is_outdoor ? [floor_info?.scene_name, "室外"].filter(Boolean).join("-") : [floor_info?.scene_name, floor_info?.building_name, floor_info?.name].filter(Boolean).join("-"),
			in_area_time: null,
			stay_time: null,
			bs_distance: null,
			x,
			y,
			z,
			floor_id: card_floor_id,
			type_name: null,
			card_type_id: null,
			truck: truck_type_name,
			areas: []
		},
		close: () => {
			hidePopup();
		}
	});
}

function handlePointerMove(e) {
	if (e.dragging) return;
	const moveable_feature_type = [FeatureType.TAG, FeatureType.BASE_STATION, FeatureType.PATROL_POINT];
	const pixel = map_instance.getEventPixel(e.originalEvent);
	const hit = map_instance.hasFeatureAtPixel(pixel);
	const setTargetCursorStyle = (is_cursor) => map_instance.getTarget().style.cursor = is_cursor ? "pointer" : "";
	if (hit) {
		const feature = map_instance.forEachFeatureAtPixel(e.pixel, feature => feature);
		const {type} = feature;
		if (moveable_feature_type.includes(type)) {
			setTargetCursorStyle(true);
		} else {
			setTargetCursorStyle(false);
		}
	} else {
		setTargetCursorStyle(false);
	}
}

function hidePopup() {
	if (info_card_obj.value) {
		const {type, card_num, station_id, uuid} = info_card_obj.value;
		if (type === FeatureType.BASE_STATION) {
			const feature = base_station_features.get(station_id);
			feature && feature.setIcon(`${base_url}${feature.model_2d_url}`, {
				icon_scale: base_station_scale.icon,
				text_scale: base_station_scale.text,
				offset_y: base_station_scale.offset_y
			});
		} else if (type === FeatureType.PERSON || type === FeatureType.VISITOR || type === FeatureType.CAR || type === FeatureType.MATERIAL) {
			map_instance.setCardIcon(
				card_num,
				getTagIcon(uuid, false),
				{
					icon_scale: card_scale.icon,
					text_scale: card_scale.text,
					offset_y: card_scale.offset_y
				}
			);
		} else if (type === FeatureType.PATROL_POINT) {
			const feature = patrol_point_features.get(card_num)?.point;
			feature && feature.setIcon(`${base_url}${MapIcons.patrol.model_2d_url}`, {
				icon_scale: patrol_point_scale.icon,
				text_scale: patrol_point_scale.text,
				offset_y: patrol_point_scale.offset_y
			});
		}
	}
	info_card_obj.value = undefined;
}

// 缩放时设置定位卡和基站图标和label的缩放大小
function handleChangeZoom() {
	const zoom = map_instance.getZoom();
	card_scale = getCardScale(zoom);
	base_station_scale = getBaseStationScale(zoom);
	patrol_point_scale = getPatrolPointScale(zoom);

	if (is_baidu_map.value) {
		card_scale = {icon: 1, text: 1, offset_y: card_scale.offset_y};
		base_station_scale = {icon: 1, text: 1, offset_y: base_station_scale.offset_y};
		patrol_point_scale = {icon: 1, text: 1, offset_y: patrol_point_scale.offset_y};
	}
	map_instance.setAllCardScale({
		icon_scale: card_scale.icon,
		text_scale: card_scale.text,
		offset_y: card_scale.offset_y
	});
	map_instance.setAllBaseStationScale({
		icon_scale: base_station_scale.icon,
		text_scale: base_station_scale.text,
		offset_y: base_station_scale.offset_y
	});
	map_instance.setAllFeatureScale(FeatureType.PATROL_POINT, {icon_scale: patrol_point_scale.icon, text_scale: patrol_point_scale.text, offset_y: patrol_point_scale.offset_y});
	setMousePositionWidth();
}

// 处理地图加载进度
function handleMapProgress(e) {
	const {total = 0, loaded = 0, percent_complete = 0, speed = 0} = e.progress;
	loading_state.value = {...loading_state.value, total, loaded, progress: percent_complete, speed};
	map_load_status.value = MAP_LOAD_STATUS.loading;
	if (percent_complete > 0 && percent_complete < 1) {
		loading_state.value.state = LOADING_STATE.DOWNLOAD_MAP;
		return;
	}
	if (percent_complete === 1) {
		loading_state.value.state = LOADING_STATE.PARSING_MAP;
	}
}

// 处理地图加载失败
function handleMapLoadingFailed() {
	loading_state.value.state = LOADING_STATE.DOWNLOAD_FAILED;
}

// 处理地图解析完成
function handleMapParseFinish() {
	handleMapLoadend();
}

// 处理告警和应急报告跳转的区域显示
async function handleJumpAreas() {
	const {area_id_list, area_id} = router.currentRoute.query;
	const normal_area_id_list = [], deleted_area_id_list = [];
	new Set((area_id_list + "," + area_id).split(",").map(Number)).forEach((area_id) => {
		const is_delete = Boolean(areas_map.value.get(area_id)?.is_delete);
		is_delete ? deleted_area_id_list.push(area_id) : normal_area_id_list.push(area_id);
	});
	try {
		// 等下轮dom更新，否则map_tool_ref为null
		await nextTick();
		// 勾选上后会触发SETTING_CHANGE_KEY事件
		await map_tool_ref.value.checkAreas(normal_area_id_list);
		deleted_area_id_list.forEach((area_id) => {
			const item = areas_map.value.get(area_id);
			if (item) {
				!is_from_emergency_report_page && emitDeletedArea({name: item.name, id: area_id});
				addZone(item.coords, area_id, item.name, item.color);
			}
		});
	} catch (error) {
		console.error(error);
	}
}

// 处理地图加载完成
async function handleMapLoadend() {
	// 防止地图加载完成后，组件已经被销毁(MAP置为null)
	if (!map_instance) return;
	const {floor, historyType} = props;
	const map_view = map_instance.getView();
	map_view.on("change:zoom", handleChangeZoom);
	map_view.on("change:rotation", handleMapViewChangeRotation);
	map_init_center = map_instance.getCenter();
	map_init_zoom = map_instance.getZoom();
	rotation.value = map_view.getRotation();

	const floor_info = FLOOR_OBJ.value[floor];
	if (!is_baidu_map.value) {
		const max_zoom = Math.ceil(map_instance.getZoomForResolution(floor_info.map_configure.zoom.max / 80));
		if (max_zoom <= map_instance.getMinZoom()) {
			map_instance.setZoom(max_zoom);
			map_instance.setMinZoom(max_zoom);
			Notification({
				title: "警告",
				type: "warning",
				message: "当前地图最大最小尺寸配置异常"
			});
		}
		map_instance.setMaxZoom(max_zoom);
	}

	const scaleFnObj = generateLabelAndEquipScaleFn(FLOOR_OBJ.value[floor], map_instance);
	getCardScale = scaleFnObj.getLabelScale;
	getBaseStationScale = scaleFnObj.getEquipScale;
	getPatrolPointScale = scaleFnObj.getPatrolPointScale;
	// 根据浏览器 Storage 显示基站
	await Promise.allSettled([
		fetchAreas(), // 应急报告跳转过来要显示所有楼层的安全岛、事故区、疏散区
		fetchBaseStations(floor, replay_way.value, {scene_floors: SCENE_FLOORS.value, floor_obj: FLOOR_OBJ.value, sys_config: CONFIG.value}),
		fetchPatrolPoints(floor),
	]).catch((error) => console.debug(error));

	loadBs(area_map_setting.value);
	loadAreas(area_map_setting.value);
	loadPatrolPoints(area_map_setting.value);
	// 设置定位卡和基站初始 scale
	handleChangeZoom();

	if (historyType === "heatMap") {
		// 查看轨迹，查询热力图数据
		history_heatmap_data = {};
		fetchHistoryHeatmapData();
	} else if (historyType === "uuid") {
		history_data = null;
		// 人车回放，查看完整的轨迹，拖拽进度条，显示之前的轨迹
		fetchHistoryTrajectoryData();
	}
	handleJumpAreas();
	loading_state.value.state = LOADING_STATE.PARSE_FINISH;
	map_load_status.value = MAP_LOAD_STATUS.completed;
	emits("map-loadend");
}

function changeMap(floor_id) {
	const floor_obj = FLOOR_OBJ.value[floor_id];
	if (!is_baidu_map.value && (!floor_obj || !floor_obj.file_2d_path)) return;

	// 重置地图状态
	base_station_features.clear();
	patrol_point_features.clear();
	map_load_status.value = MAP_LOAD_STATUS.no_start;
	history_data = null;
	group_trajectory.clear();
	history_heatmap_data = null;
	get_full_trajectory = false;
	last_trajectory_timestamp = 0;
	full_trajectory_feature_map.clear();
	drawn_trajectory_feature_list = [];
	card_coordinate = null;
	card_uuid_map.clear();
	info_card_obj.value = undefined;
	// 开始加载地图
	loading_state.value.state = LOADING_STATE.GET_DATA;
	map_info.value = is_baidu_map.value ? "百度地图" : `${floor_obj.scene_name}-${floor_obj.building_name}-${floor_obj.name}`;

	if (map_instance) {
		// 把上个地图的 view 注册事件清除
		map_instance.getView().un("change:zoom", handleChangeZoom);
		map_instance.getView().un("change:rotation", handleMapViewChangeRotation);
		map_instance.clearMeasureFeature();
		map_instance.reset();
		draw_feature && map_instance.addFeature(draw_feature);
		is_baidu_map.value ? changeGpsMap() : map_instance.changeMap(getCustomMapConfig(floor_id, replay_way.value));
		if (is_start_measure.value) startMeasureDistance();
		return;
	}

	if (is_baidu_map.value) {
		initBaiduMap();
		map_instance.setAnimationSpeed(play_multiple.value);
		return;
	}

	initMap(floor_id);
	map_instance.setAnimationSpeed(play_multiple.value);
	return;
}

function addMapEventAndTools() {
	draw_instance = new Draw.rectangle();
	draw_instance.setActive(false);
	map_instance.addControl(new Control.mouse_position(true));
	map_instance.addControl(new Control.scale_line());
	map_instance.addInteraction(draw_instance);
	popup_instance = map_instance.addPopup("popup2D");
	map_instance.on("progress", handleMapProgress);
	map_instance.on("loadingfailed", handleMapLoadingFailed);
	map_instance.on("parsefinish", handleMapParseFinish);
	map_instance.on("animate_move", handleAnimateMove);
	map_instance.on("pointerdown", handlePointerdown);
	map_instance.on("pointermove", handlePointerMove);
	map_instance.on("updateBuildingLabelPosition", handleBuildingLabelPosition);
	draw_instance.on("drawend", handleDrawEnd);
}

function removeMapEvent() {
	if (!map_instance || !draw_instance) return;
	map_instance.un("progress", handleMapProgress);
	map_instance.un("loadingfailed", handleMapLoadingFailed);
	map_instance.un("parsefinish", handleMapParseFinish);
	map_instance.un("animate_move", handleAnimateMove);
	map_instance.un("pointerdown", handlePointerdown);
	map_instance.un("pointermove", handlePointerMove);
	map_instance.un("updateBuildingLabelPosition", handleBuildingLabelPosition);
	map_instance.getView().un("change:zoom", handleChangeZoom);
	map_instance.getView().un("change:rotation", handleMapViewChangeRotation);
	draw_instance.un("drawend", handleDrawEnd);
}

function initMap(floor_id) {
	map_instance = new MapSDK({...getCustomMapConfig?.(floor_id, replay_way.value), dom: "map-2d"});
	addMapEventAndTools();
}

async function initBaiduMap() {
	const baidu_map_config = await getBaiduMapConfig(is_gps_earth_map);
	map_instance = new MapSDK({...baidu_map_config, dom: "map-2d"});
	addMapEventAndTools();
}

async function changeGpsMap() {
	is_gps_earth_map.value = false;
	const baidu_map_config = await getBaiduMapConfig(is_gps_earth_map);
	// 避免区域回放切换到百度地图，然后又切换到其他楼层，最终加载的是百度地图的数据竟态问题，见bug#9137
	is_baidu_map.value && map_instance.changeMap(baidu_map_config);
}

async function changeGPSMapType() {
	const {historyType} = props;
	const baidu_map_config = await getBaiduMapConfig(is_gps_earth_map);
	let real_baidu_map_config = {};
	if (historyType === "uuid") {
		real_baidu_map_config = card_coordinate ? {...baidu_map_config, center: [...card_coordinate]} : {...baidu_map_config};
	} else {
		real_baidu_map_config = {...baidu_map_config};
	}
	map_instance.changeMap(real_baidu_map_config);
}

function getTagBaseInfo(uuid) {
	return PERSON_OBJ.value[uuid] || VISITOR_OBJ.value[uuid] || CAR_OBJ.value[uuid] || MATERIAL_OBJ.value[uuid] || CONTRACTOR_OBJ.value[uuid];
}

// 设置定位卡的 label
function getTagLabel(card_item, map_setting) {
	const {show_field} = map_setting;
	const {card_id, uuid, floor_id} = card_item;
	const handleCardStr = (data) => {
		const label_arr = [];
		if (!data) return "";

		if (show_field.includes("name")) {
			const name_key = UTYPE_NAME_KEY_MAP[data.utype];
			const name = data[name_key];
			label_arr.push(name ?? "陌生卡");
		}
		if (show_field.includes("card_id")) {
			label_arr.push(card_id);
		}
		if (show_field.includes("floor_name")) {
			const floor_name = FLOOR_OBJ.value[floor_id]?.storey_name;
			floor_name && label_arr.push(floor_name);
		}
		return label_arr.join("-");
	};

	return handleCardStr(getTagBaseInfo(uuid));
}
function setTagLabel(card_list, map_setting = area_map_setting.value) {
	card_list.forEach((item) => {
		const label = getTagLabel(item, map_setting);
		map_instance.setCardText(item.card_id, label, {
			icon_scale: card_scale.icon,
			text_scale: card_scale.text,
			offset_y: card_scale.offset_y,
			text_color: "#15F9F8",
		});
	});
}
function toggleTagFields(checked, unchecked, map_setting) {
	if ("show_field" in checked || "show_field" in unchecked) {
		setTagLabel(card_uuid_map, map_setting);
	}
}

// 设置定位卡的图标，active 表示是否选中定位卡
function getTagIcon(uuid, active) {
	const handleIcon = (data) => {
		if (data) {
			return active ? `${base_url}${data.icon_model_attr?.model_2d_s_url}` : `${base_url}${data.icon_model_attr?.model_2d_url}`;
		}
		return "";
	};

	const handleStrangeIcon = () => {
		return active ? `${base_url}${MapIcons.stranger.model_2d_s_url}` : `${base_url}${MapIcons.stranger.model_2d_url}`;
	};

	return handleIcon(getTagBaseInfo(uuid)) || handleStrangeIcon();
}

// 把定位卡添加到地图上
function addCard(card_item) {
	const {uuid, card_id, card_x, card_y, time} = card_item;
	const {historyType, isShowTrack} = props;
	if (historyType === "uuid") {
		card_coordinate = [card_x, card_y];
	}
	const feature = map_instance.addCardInfo(
		card_id,
		getTagIcon(uuid, false),
		card_x,
		card_y,
		// 直接设置为""，再次调用 setCardText 时会没有作用，因为找不到对应的card_id
		card_id,
		time,
		{
			icon_scale: card_scale.icon,
			text_scale: card_scale.text,
			offset_y: card_scale.offset_y,
			text_color: "#15F9F8",
		}
	);
	if (!feature) return;
	// 因为在addCardInfo时设置了card_id，就会始终有
	setTagLabel([card_item]);
	feature.card_num = card_id;
	feature.uuid = uuid;
	feature.type = FeatureType.TAG;
	card_uuid_map.set(card_id, {...card_item});
	addCardTrack(card_item);
	!isShowTrack && toggleCardTrack(false);
}

function removeOneTag(card_id) {
	if (!map_instance) return;
	const {floor_id, uuid} = card_uuid_map.get(card_id) ?? {};
	const building_id = FLOOR_OBJ.value[floor_id]?.building_id;
	const utype = getTagBaseInfo(uuid)?.utype;
	if (replay_way.value === REPLAY_WAY.all && building_id && utype && building_statistics_data.value[building_id]) {
		building_statistics_data.value[building_id].stat[utype].value--;
	}
	map_instance.removeOneTrack(card_id);
	map_instance.removeOneCard(card_id);
	card_uuid_map.delete(card_id);
}
function removeAllTag(utype, unchecked) {
	card_uuid_map.forEach(({card_id, utype: i_utype, branch_id, contractor_unit_id}) => {
		if (utype === undefined) {
			removeOneTag(card_id);
		} else if (utype === UTYPES.PERSON) {
			unchecked?.branch_id_list?.includes(branch_id) && removeOneTag(card_id);
		} else if (utype === UTYPES.CONTRACTOR) {
			unchecked?.contractor_unit_id_list?.includes(contractor_unit_id) && removeOneTag(card_id);
		} else if (i_utype === utype) {
			removeOneTag(card_id);
		}
	});
}

function loadTag(map_setting, card_item) {
	const {historyType, floor} = props;
	const {branch_id_list, contractor_unit_id_list, is_show_visitor, is_show_car, is_show_material} = map_setting;
	const {branch_id, contractor_unit_id, utype, floor_id} = card_item;

	if (historyType === "uuid") {
		if (CONFIG.value.SCENE_SHOW_DEVICE) {
			addCard(card_item);
		} else if (floor_id === floor) {
			addCard(card_item);
		}
	} else if (historyType === "area") {
		if (utype === UTYPES.PERSON && branch_id_list.includes(branch_id)) {
			addCard(card_item);
		}
		if (utype === UTYPES.VISITOR && is_show_visitor) {
			addCard(card_item);
		}
		if (utype === UTYPES.CONTRACTOR && contractor_unit_id_list.includes(contractor_unit_id)) {
			addCard(card_item);
		}
		if (utype === UTYPES.CAR && is_show_car) {
			addCard(card_item);
		}
		if (utype === UTYPES.MATERIAL && is_show_material) {
			addCard(card_item);
		}
	}
}
function toggleTag(checked, unchecked) {
	if ("branch_id_list" in unchecked) {
		removeAllTag(UTYPES.PERSON, unchecked);
	}
	if ("is_show_visitor" in unchecked) {
		removeAllTag(UTYPES.VISITOR);
	}
	if ("contractor_unit_id_list" in unchecked) {
		removeAllTag(UTYPES.CONTRACTOR, unchecked);
	}
	if ("is_show_car" in unchecked) {
		removeAllTag(UTYPES.CAR);
	}
	if ("is_show_material" in unchecked) {
		removeAllTag(UTYPES.MATERIAL);
	}
}

// 区域回放在每段时间里回放到最后一个点后移除定位卡
function removeLastPointCard(card, is_last_point) {
	const {historyType} = props;
	// is_last_point 有可能是 undefined
	if (historyType === "area" && is_last_point === true) {
		setTimeout(() => {
			if (info_card_obj.value?.card_num === card) {
				info_card_obj.value = undefined;
			}
			if (card_uuid_map.get(card)) {
				removeOneTag(card);
			}
		}, 500);
	}
}

// 显示某个标签的完整轨迹
function showTagAllTrack(uuid) {
	if (props.isShowAllTruck && get_full_trajectory && !full_trajectory_feature_map.get(uuid)) {
		const feature = drawSingleTrajectoryLine(map_instance, uuid, group_trajectory);
		full_trajectory_feature_map.set(uuid, feature);
	}
}

// 处理换卡，0-10s 卡号1-uuid1, 11s-20s 卡号2-uuid1
function handleSwitchCard(new_uuid) {
	const find_one = Array.from(card_uuid_map.values()).find(({uuid}) => new_uuid === uuid);
	if (find_one) {
		// 新增的uuid在之前已经添加，说明已经换卡
		// 移除之前的卡和轨迹
		const {card_id} = find_one;
		removeOneTag(card_id);
	}
}
// 处理换定位对象，0-10s 卡号1-uuid1, 11s-20s 卡号1-uuid2
// function handleSwitchTag() {}
function updateCardPosition(item) {
	if (map_load_status.value !== MAP_LOAD_STATUS.completed) return;
	const {uuid, card_id, card_x, card_y, is_last_point, time} = item;
	const {utype, branch_id, unit_id} = getTagBaseInfo(uuid) ?? {};
	item.utype = utype;
	item.branch_id = branch_id;
	item.contractor_unit_id = unit_id;
	const old_card_item = card_uuid_map.get(card_id);
	if (old_card_item) {
		if (old_card_item.floor_id !== item.floor_id) {
			setTagLabel([item]);
		}
		if (item.is_cached !== 2) {
			// 补点数据不需要更新
			card_uuid_map.set(card_id, {...item});
			map_instance.setCardCoordinate(card_id, card_x, card_y, time);
		}
		openTagDialog(card_uuid_map.get(card_id));
	} else {
		handleSwitchCard(uuid);
		loadTag(area_map_setting.value, item);
	}
	removeLastPointCard(card_id, is_last_point);
	showTagAllTrack(uuid);
	statisticsTagQuantityInBuilding(card_uuid_map.values());
}

function statisticsTagQuantityInBuilding(card_iterator) {
	const floor_info = FLOOR_OBJ.value[props.floor];
	if (replay_way.value === REPLAY_WAY.all && floor_info?.storey_id === OUTDOOR_STOREY_ID) {
		building_statistics_data.value = getInitBuildingStatisticsData(on_scene_buildings.value);
		for (const {uuid, floor_id} of card_iterator) {
			const floor_info = FLOOR_OBJ.value[floor_id];
			if (floor_info.storey_id === OUTDOOR_STOREY_ID) continue;
			const building_id = floor_info.building_id;
			if (building_statistics_data.value[building_id]) {
				const tag_info = getTagBaseInfo(uuid);
				building_statistics_data.value[building_id].stat[tag_info.utype].value++;
			}
		}
	}
}

function toggleCardTrack(show_track) {
	if (!map_instance) return;
	show_track ? map_instance.showAllTrack() : map_instance.hideAllTrack();
}
function addCardTrack(card_item) {
	if (!map_instance) return;
	const {card_id, uuid, utype} = card_item;
	let break_point_time = undefined;
	switch (utype) {
	case UTYPES.PERSON:
	case UTYPES.VISITOR:
	case UTYPES.CONTRACTOR:
		break_point_time = CONFIG.value.PLAYBACK_LINE_BROKEN_TIME_PERSON;
		break;
	case UTYPES.CAR:
		break_point_time = CONFIG.value.PLAYBACK_LINE_BROKEN_TIME_TRUCK;
		break;
	case UTYPES.MATERIAL:
		break_point_time = CONFIG.value.PLAYBACK_LINE_BROKEN_TIME_MATERIAL;
		break;
	}
	map_instance.addTrack(card_id, CONFIG.value.TRACK_RECORD_POINTS, trajectory_colors.value[uuid], undefined, break_point_time);
}

// 获取热力图数据
async function fetchHistoryHeatmapData(start_time) {
	const {start, end, playUuidList, historyType} = props;
	const {data: {result, type}} = await getHistoryHeatMapByUUID({
		begin: start_time ? start_time : parseInt(start) * 1000,
		end: parseInt(end) * 1000,
		uuid: playUuidList[0],
		area_grid_size: 0.1
	}).catch(() => ({data: {}}));
	if (type === 1) {
		if (result.get_all) {
			historyType === "heatMap" && drawHeatmapFeature(map_instance, history_heatmap_data);
		} else {
			history_heatmap_data = !history_heatmap_data ? result.data : {...history_heatmap_data, ...result.data};
			fetchHistoryHeatmapData(result.last_time);
		}
	} else {
		requestErrorNotify(result);
	}
}

// 已经获取到完整的历史轨迹数据
function finishFullHistoryTrajectoryData() {
	get_full_trajectory = true;
	group_trajectory = groupHistoryTrajectory(history_data, true);
}

let abortFetchCardHistory = () => {};
// 获取完整的历史轨迹数据
async function fetchHistoryTrajectoryData(start_time = parseInt(props.start) * 1000) {
	const {end, playUuidList, floor} = props;
	if (!FLOOR_OBJ.value[floor]) return;
	const {getCardHistory, abortGetCardHistory} = getCardHistoryRequest();
	const {getGpsCardHistory, abortGetGpsCardHistory} = getGpsCardHistoryRequest();
	const fetchCardHistory = is_baidu_map.value ? getGpsCardHistory : getCardHistory;
	abortFetchCardHistory = is_baidu_map.value ? abortGetGpsCardHistory : abortGetCardHistory;

	const {data: {type, result, is_cancel}} = await fetchCardHistory({
		begin: start_time,
		end: parseInt(end) * 1000,
		uuid_list: playUuidList,
		floor_id: replay_way.value === REPLAY_WAY.floor ? floor : undefined,
		scene_id: replay_way.value === REPLAY_WAY.floor ? undefined : FLOOR_OBJ.value[floor].scene_id
	}).catch((error) => {
		return {data: {is_cancel: isCancel(error)}};
	});
	if (is_cancel) return;
	if (type === 1) {
		const filter_fake_data = result.filter((item) => item.is_cached !== 2);
		if (filter_fake_data.length === 0) {
			return finishFullHistoryTrajectoryData();
		}
		last_trajectory_timestamp = filter_fake_data[filter_fake_data.length - 1].time;
		history_data = !history_data ? filter_fake_data : history_data.concat(filter_fake_data);

		// 当前查询到的最后一条轨迹数据时间小于结束时间，则继续查询剩余的轨迹数据
		if (last_trajectory_timestamp + 1000 < end * 1000) {
			get_full_trajectory = false;
			fetchHistoryTrajectoryData(last_trajectory_timestamp + 1000);
		} else {
			finishFullHistoryTrajectoryData();
		}
	} else {
		requestErrorNotify(result);
	}
}

// 点击进度条，标签回放显示之前的轨迹
function handleDrag({nowTime}) {
	const {historyType, start} = props;

	// 移除定位卡的轨迹和定位卡本身
	const removeCardTrack = () => {
		card_uuid_map.forEach((_, card_id) => {
			removeOneTag(card_id);
		});
	};

	// 人员回放
	if (historyType === "uuid") {
		// 拖拽进度条先把之前的轨迹线清除
		drawn_trajectory_feature_list.forEach((feature) => map_instance.removeFeature(feature));
		drawn_trajectory_feature_list = [];
		removeCardTrack();
		const current_timestamp = nowTime + start * 1000;
		if (!history_data) return;
		const {idx: nearest_index} = findNearestTargetNum(history_data, "time", current_timestamp);
		const group_trajectory = groupHistoryTrajectory(history_data.slice(0, nearest_index + 1), true);
		for (const [uuid, item] of group_trajectory.entries()) {
			const {list} = item;
			if (list.length === 0) continue;
			updateCardPosition(list.slice(-1)[0]);
			const feature = drawSingleTrajectoryLine(map_instance, uuid, group_trajectory);
			drawn_trajectory_feature_list.push(feature);
		}
	} else if (historyType === "area") {
		removeCardTrack();
	}
}

defineExpose({
	updateCardPosition,
	handleDrag,
	setDrawStatus: (active) => {
		// 先清除之前的绘制区域
		draw_feature = removeDrawFeature(map_instance, draw_feature);
		draw_instance?.setActive(active);
	}
});
</script>

<style lang="scss" scoped>
.page-2d-map {
    #map-2d {
        position: absolute;
        width: 100%;
        height: 100%;

        :deep(.hg_mouse_position) {
			bottom: 43px;
			position: absolute;
			left: 62px;
			color: #fff;
			font-size: 12px;
			text-align: center;
			width: v-bind(mouse_position_width);
			font-family: "DingTalk JinBuTi";
        }

        :deep(.ol-rotate) {
			display: none;
        }

        :deep(.ol-zoom) {
			display: none;
        }

        :deep(.hg_scale_line) {
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

        :deep(.hg_scale_line-inner) {
			color: white;
			border: 1px solid white;
			outline: 0px solid #293F54;
			box-shadow: inset 0 0 0 0px #293F54;
			clip-path: inset(0 -2px -2px -2px);
			border-top: none;
        }

		:deep(.measure-tool-notify) {
			position: absolute;
			color: white;
			pointer-events: none;
			background-color: rgba(0, 0, 0, 0.4);
			margin: 16px 0;
			border-radius: 4px;
			padding: 5px 8px;
		}
    }
}

.gps-map-type {
	position: absolute;
	bottom: 109px;
	right: 40px;
	z-index: 2;
}

.map-campass-icon {
	position: absolute;
	top: 20px;
	right: 20px;
	z-index: 1001;
	cursor: pointer;
}
</style>
