<template>
<div
	class="history-map3d"
	:style="{backgroundColor: engine_bg_color}"
>
	<map-loading
		:loaded="loading_state.loaded"
		:progress="loading_state.progress"
		:speed="loading_state.speed"
		:state="loading_state.state"
		:total="loading_state.total"
		style="z-index: 1002;"
	/>
	<div
		id="map"
		ref="map"
	/>
	<statistics-panel
		v-for="(item) in building_label_positions"
		v-show="Number(unfold_building_id) !== Number(item.id)"
		:key="item.id"
		:show-name="area_map_setting.building_config.includes('building_name')"
		:show-statistics="area_map_setting.building_config.includes('statistics')"
		:data="building_statistics_data[item.id]"
		:position="{left: item.x + 'px', top: item.y + 'px'}"
		:loading="false"
		:display-type="Dimension.Three"
		:building-clickable="building_clickable"
		@select-building="foldBuilding(item.id);"
	/>

	<map-tool
		ref="map_tool_ref"
		:page-key="mapSettingKey"
		:is-loaded="loading_state.state === LOADING_STATE.PARSE_FINISH ? 1 : 0"
		:disabled-measure="false"
		:dimension="dimension"
		:disable-switch-dimension="disabledSwitchMap"
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
	/>

	<!-- 坐标 -->
	<div class="coordinate-text">
		{{ coordinate_text }}
	</div>
</div>
</template>

<script>
import {isCancel} from "axios";
import {storeToRefs} from "pinia";
import {useEventBus} from "@vueuse/core";
import {Map as MAP_SDK, ModelType} from "@/libs/HG3DMap.es";
import store from "@/store";

import {useMapParams, useAreaMapStorage} from "@/composable";
import {SETTING_CHANGE_KEY} from "@/events";
import {base_url} from "@/Config";
import {Dimension} from "@/types/map";
import {getCardHistoryRequest} from "@/api/history/history";
import {LOADING_STATE} from "@/utils/js/loadingStateTypes";
import MapIcons from "@/utils/js/tools/mapIcons";
import {stringAndArrayTransform} from "@/utils/js/tools/map";
import {UTYPES} from "@/utils/js/constant";
import MapLoading from "@/components/MapLoading.vue";
import {AreaType} from "@/components/mapSettings/filters";
import MapTool from "@/components/AreaMap/components/MapTool.vue";
import MeasureDistanceButtons from "@/components/AreaMap/components/MeasureDistanceButtons.vue";
import CampassIcon from "@/components/Map/CampassIcon.vue";

import {useDetailDialogStore, DetailDialogCategoryEnum} from "@index/store";
import StatisticsPanel from "@index/components/StatisticsPanel.vue";

import {useTrajectoryColorsStore} from "@/views/history/store/useTrajectoryColorsStore";
import {FOCUS_TAG, DELETED_AREA} from "@/views/history/events";
import {UTYPE_NAME_KEY_MAP, FeatureType, REPLAY_WAY} from "@/views/history/constant";
import {useApiData} from "@/views/history/store/useApiData";

import {MAP_LOAD_STATUS, useHistoryStore} from "../store";
import {rgbToHex, findNearestTargetNum, setInfoCardContent, groupHistoryTrajectory, resolveCameraParams, getBuildingIconScale, getInitBuildingStatisticsData} from "../units";
import {OUTDOOR_STOREY_ID} from "@/utils/js/constant";

const CONFIG_3D = {
	sky_box: true, // 天空盒子
	little_map: true, // 小地图
	card_type: 1, // 1 代表的fbx，2 代表的是json
	open_shadow: true // 是否开启阴影
};

let MAP = null;

export default {
	name: "HisoryMap3D",
	components: {MapLoading, MapTool, CampassIcon, MeasureDistanceButtons, StatisticsPanel},
	inject: ["SCENE_FLOORS", "BUILDING_FLOORS", "FLOOR_OBJ", "PERSON_OBJ", "CAR_OBJ", "VISITOR_OBJ", "CONFIG", "MATERIAL_OBJ", "CONTRACTOR_OBJ"],
	props: {
		isShow2d: {
			type: Boolean,
			required: true
		},
		floor: {
			type: Number,
			required: true
		},
		start: {
			type: Number,
			required: true
		},
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
		// 区域 id，仅区域回放模块有用
		area: {
			type: String,
			required: false,
			default: undefined
		},
		type: {
			type: String,
			required: true
		},
		historyType: {
			type: String,
			required: true
		},
		startPlayBack: {
			type: Boolean,
			required: true
		},
		isShowAllTruck: {
			type: Boolean,
			required: false
		},
		isShowTrack: {
			type: Boolean,
			required: false
		},
		mapSettingKey: {
			type: String,
			required: true,
		},
		disabledSwitchMap: {
			type: Boolean,
			required: true
		},
	},
	emits: ["switch-map", "map-loadend"],
	setup(props) {
		const {trajectory_colors} = storeToRefs(useTrajectoryColorsStore());
		const {on: onFocusTag} = useEventBus(FOCUS_TAG);
		const {on: onMapSettingChange} = useEventBus(SETTING_CHANGE_KEY);
		const {emit: emitDeletedArea} = useEventBus(DELETED_AREA);
		const detail_dialog_store = useDetailDialogStore();
		const {area_map_setting} = useAreaMapStorage(props.mapSettingKey);
		const {fetchAreas, fetchBaseStations} = useApiData();
		const {base_station_map, areas_map} = storeToRefs(useApiData());
		const {already_search_area, map_load_status, replay_way, play_multiple} = storeToRefs(useHistoryStore());
		const {rotation} = useMapParams();

		return {
			trajectory_colors,
			detail_dialog_store,
			area_map_setting,
			base_station_map,
			areas_map,
			rotation,
			FeatureType,
			UTYPE_NAME_KEY_MAP,
			already_search_area,
			map_load_status,
			replay_way,
			play_multiple,
			onFocusTag,
			onMapSettingChange,
			emitDeletedArea,
			fetchAreas,
			fetchBaseStations,
		};
	},
	data() {
		return {
			Dimension,
			is_start_measure: false,
			mouse_position: {x: 0, y: 0, z: 0},
			cardInfoObj: undefined,
			popupType: 0,
			is_follow: false,
			loading_state: {
				total: 0,
				loaded: 0,
				speed: 0,
				progress: 0,
				state: -3,
			},
			LOADING_STATE,
			dimension: "two",
			building_label_positions: [],
			building_statistics_data: {},
			unfold_building_id: null,
		};
	},
	computed: {
		// 是否显示3d模型
		isShowModel() {
			return this.FLOOR_OBJ[this.floor].map_configure.config_3d.display_style === "1";
		},

		// 图标缩放尺寸
		scaleSize() {
			const iconSize = this.FLOOR_OBJ[this.floor].map_configure.config_3d.label;
			return parseInt(iconSize) / 100;
		},
		// 设备缩放尺寸
		scale_equipment_size() {
			const size = this.FLOOR_OBJ[this.floor].map_configure.config_3d.equipment;
			return parseInt(size) / 100;
		},

		camera_model_patrol_dist() {
			const dist = this.FLOOR_OBJ[this.floor].map_configure.config_3d.camera_model_patrol_dist;
			return parseInt(dist);
		},

		engine_bg_color() {
			return store.getters.engine_bg_color;
		},

		rotation_rad() {
			const current_floor_info = this.FLOOR_OBJ[this.floor];
			return this.rotation - (current_floor_info?.direction ?? 0);
		},

		exclude_map_tools() {
			if (this.historyType === "area") {
				return ["application", "rotation"];
			} else if (this.historyType === "uuid") {
				return this.is_start_measure ? ["rotation", "switch_map"] : ["rotation"];
			} else {
				return ["rotation"];
			}
		},
		on_scene_buildings() {
			const scene_id = this.FLOOR_OBJ[this.floor]?.scene_id;
			return this.SCENE_FLOORS[scene_id]?.building_ids?.map((building_id) => this.BUILDING_FLOORS[building_id]) ?? [];
		},
		on_scene_floor_ids() {
			const scene_id = this.FLOOR_OBJ[this.floor]?.scene_id;
			const scene_info = this.SCENE_FLOORS[scene_id];
			if (!scene_info) return [];
			const floor_id_list = scene_info.floor_list.map(({floor_id}) => floor_id);
			const outdoor_id = scene_info.outdoor?.floor_id;
			return outdoor_id ? [...floor_id_list, outdoor_id] : floor_id_list;
		},
		building_clickable() {
			return this.area_map_setting?.building_config?.includes("layer");
		},
		coordinate_text() {
			const {x = 0, y = 0, z = 0} = this.mouse_position;
			return `${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)}`;
		}
	},
	watch: {
		isShow2d(new_val) {
			if (!new_val) {
				this.dimension = "three";
				this.already_search_area = false;
			} else {
				this.dimension = "two";
				this.abortFetchCardHistory();
				this.removeAllDragLine();
			}
		},
		startPlayBack: function () {
			if (this.isShow2d) return;
			// 移除上次卡走的轨迹
			MAP?.removeAllTrack();
			if (this.startPlayBack) {
				this.abortFetchCardHistory();
				this.changeMap(this.floor);
			}
		},
		floor: function () {
			if (this.isShow2d) return;
			if (this.floor !== 0) {
				window.cancelAnimationFrame(this.animation_frame);
				this.animation_frame = window.requestAnimationFrame(() => {
					// 区域回放切换地图，该地图只有3d跳转过来因为mapLoad的限制，导致无法加载地图
					if (this.historyType === "area") {
						this.changeMap(this.floor);
					}
				});
			}
		},
		isShowTrack: function (show_track) {
			if (this.isShow2d) return;
			this.toggleCardTrack(show_track);
		},
		isShowAllTruck: function (newVal) {
			if (this.isShow2d) return;
			if (newVal && this.isGetDataEnd) {
				this.card_uuid_map.forEach(({uuid}) => this.showTruckMap(uuid));
			} else {
				this.allLineId.forEach(i => {
					MAP.removePathLine(i);
				});
				this.allLineId = [];
			}
		},
		already_search_area(newVal) {
			if (this.isShow2d) return;
			if (!newVal) {
				// 区域回放退出，清除地图上的定位对象
				this.removeAllTag();
			}
		},
		"$store.getters.sidebar.open": function () {
			if (this.isShow2d) return;
			setTimeout(() => MAP.updateSize(), 520);
		},
		play_multiple() {
			MAP?.setAnimationSpeed(this.play_multiple);
		}
	},
	created() {
		this.crateUnObserveData();
	},
	mounted() {
		this.is_from_emergency_report_page = this.$route.query.from === "emergencyReport";
		this.onFocusTag((uuid) => {
			if (!this.isShow2d && this.map_load_status === MAP_LOAD_STATUS.completed && this.startPlayBack && MAP) {
				const find_one = Array.from(this.card_uuid_map.values()).find((item) => item.uuid === uuid);
				if (find_one) {
					const floor_info = this.FLOOR_OBJ[find_one.floor_id];
					const is_outdoor = floor_info?.storey_id === OUTDOOR_STOREY_ID;
					if (this.replay_way === REPLAY_WAY.all && !is_outdoor) {
						// 楼层展开后禁止建筑分层或者允许建筑分层
						if (this.unfold_building_id !== null || this.building_clickable) {
							this.unfold_building_id = floor_info.building_id;
							MAP.selectFloor(find_one.floor_id);
						}
					}
					MAP.setCameraPosition(find_one.card_x, find_one.card_y, find_one.card_z, 0, -3, 10);
				}
			}
		});
		this.onMapSettingChange(({checked, unchecked}, map_setting) => {
			if (this.isShow2d) return;
			this.toggleTag(checked, unchecked);
			this.toggleTagFields(checked, unchecked, map_setting);
			this.toggleBs(checked, unchecked, map_setting);
			this.toggleBsFields(checked, unchecked, map_setting);
			this.toggleBuilding(checked, unchecked, map_setting);
			this.toggleAreas(checked, unchecked, map_setting);
		});
		this.already_search_area = false;
		document.addEventListener("keydown", this.backFollowCardStatus);
	},
	beforeDestroy() {
		document.removeEventListener("keydown", this.backFollowCardStatus);
		if (MAP) {
			this.removeAllDragLine();
			MAP.removeEventListener("sceneload", this.mapLoad);
			MAP.removeEventListener("loadmodelfinish", this.modelLoad);
			MAP.removeEventListener("mousedown", this.hidePopup);
			MAP.removeEventListener("click", this.handleMapClick);
			MAP.removeEventListener("selectedmodel", this.selectedModel);
			MAP.removeEventListener("mousemove", this.handleMousePosition);
			MAP.removeEventListener("sceneparsefinish", this.handleSceneParseFinish);
			MAP.removeEventListener("maploadfailed", this.handleMapLoadFailed);
			MAP.removeEventListener("hover", this.handleMapHover);
			MAP.removeEventListener("change:rotation", this.handleRotateChange);
			// 3dSDK 的 requestAnimation 没有被停止，显式调用 reset() 方法终止 requestAnimation
			MAP.reset();
			MAP = null;
		}
	},
	methods: {
		// 创建非响应式数据，提升性能
		crateUnObserveData() {
			// 完整轨迹数据
			this.historyData = null;
			this.group_trajectory = new Map();
			// 完整轨迹数据是否获取完成
			this.isGetDataEnd = false;
			this.dataLastTime = 0;
			this.allLineId = [];
			this.areaList = {};
			this.card_uuid_map = new Map();
			this.progress = 0;
			this.animation_frame = 0;
			// 拖拽滚动条后绘制的轨迹线
			this.halfTruckId = [];
			this.current_follow_card = undefined;
			// 存储加载的模型，键名为 model_key，键值 0-加载未完成，1-加载完成
			this.model_key_obj = {};
			// 基站模型是否全部加载完成
			this.load_bs_model = false;
			// 陌生卡图标
			this.stranger_model_data = {
				icon_model_attr: {
					model_3d_url: MapIcons.stranger.model_3d_url,
					model_2d_url: MapIcons.stranger.model_2d_url,
					model_2d_s_url: MapIcons.stranger.model_2d_s_url
				}
			};
			this.is_from_emergency_report_page = false;
			this.abortFetchCardHistory = () => {};
		},
		toggleCardTrack(show_track) {
			if (!MAP) return;
			if (show_track) {
				this.card_uuid_map.forEach((_, card_id) => {
					MAP.showCardTrack(card_id);
				});
			} else {
				this.card_uuid_map.forEach((_, card_id) => {
					MAP.hideCardTrack(card_id);
				});
			}
		},
		addCardTrack(card_item) {
			if (!MAP) return;
			const {card_id, uuid, utype} = card_item;
			let break_point_time = undefined;
			switch (utype) {
			case UTYPES.PERSON:
			case UTYPES.VISITOR:
			case UTYPES.CONTRACTOR:
				break_point_time = this.CONFIG.PLAYBACK_LINE_BROKEN_TIME_PERSON;
				break;
			case UTYPES.CAR:
				break_point_time = this.CONFIG.PLAYBACK_LINE_BROKEN_TIME_TRUCK;
				break;
			case UTYPES.MATERIAL:
				break_point_time = this.CONFIG.PLAYBACK_LINE_BROKEN_TIME_MATERIAL;
				break;
			}
			MAP.addTrack(card_id, this.trajectory_colors[uuid], break_point_time);
		},

		// 切换跟随、取消跟随模式
		switchFollowStatus() {
			this.is_follow = !this.is_follow;
			this.is_follow ? this.followCard(this.cardInfoObj.card_num) : this.backFollowCardStatus();
		},

		// 取消跟随模式，可通过 Esc 退出
		backFollowCardStatus(e) {
			if (this.isShow2d) return;
			if ((e?.code === "Escape" || e === undefined) && MAP) {
				// 通过 Esc 退出跟随模式需要更新跟随状态
				this.is_follow = false;
				this.current_follow_card = undefined;
				MAP.stopThirdPersonFollow();
			}
		},

		// 打开跟随模式
		followCard(card) {
			MAP.startThirdPersonFollow(card);
			this.current_follow_card = card;
		},

		getSceneNodes(floor_id, replay_way) {
			const floor_info = this.FLOOR_OBJ[floor_id];
			if (!floor_info) return;
			const scene_id = floor_info?.scene_id;
			const scene_info = this.SCENE_FLOORS[scene_id];
			let buildings = [];
			let path = "";
			let type = 0;
			let camera_params = {};
			if (replay_way === REPLAY_WAY.all && floor_info.storey_id === OUTDOOR_STOREY_ID) {
				path = scene_info.file_path;
				if (!path) return;
				type = scene_info.file_3d_type === 1 ? 0 : 1;
				camera_params = scene_info.view_json?.camera_params || {};
				buildings = scene_info.building_ids.flatMap((building_id) => {
					const building_info = this.BUILDING_FLOORS[building_id];
					if (building_info.file_path) {
						return [{
							id: building_info.id,
							url: base_url + building_info.file_path,
							matrix: building_info.building_scene_coordinate.matrix,
							type: building_info.file_3d_type === 1 ? 0 : 1,
							floors: building_info.floor_list.flatMap((floor_info) => {
								if (floor_info.file_3d_path) {
									return [{
										id: floor_info.id,
										url: base_url + floor_info.file_3d_path,
										matrix: floor_info.floor_scene_coordinate.matrix,
										type: floor_info.file_3d_type === 1 ? 0 : 1
									}];
								}
								return [];
							})
						}];
					}
					return [];
				});
			} else {
				path = floor_info.file_3d_path;
				if (!path) return;
				type = floor_info.file_3d_type === 1 ? 0 : 1;
				camera_params = floor_info.view_json?.camera_params || {};
			}
			return {
				url: base_url + path,
				buildings,
				type,
				camera_params
			};
		},

		initMap(scene_nodes) {
			// 建筑的默认视角
			const building_all_view_json = Object.entries(this.BUILDING_FLOORS).reduce((result, [id, building]) => {
				const camera_params = building?.view_json?.camera_params;

				return {
					...result,
					[id]: resolveCameraParams(camera_params)
				};
			}, {});
			// 建筑的默认楼层间距
			const building_all_floor_dist = Object.entries(this.BUILDING_FLOORS).reduce((result, [id, building]) => {
				const floor_dist = building?.expand_space;
				return {
					...result,
					[id]: floor_dist
				};
			}, {});

			MAP = new MAP_SDK({
				scene_url: scene_nodes.url,
				track_height: 0.07, // 轨迹高度
				shadow_model_url: "/3dModel/shadow.json", // 阴影模型路径
				show_click_marker: true, // 开启点击位置标记
				marker_model_url: "/3dModel/xyz.json", // 点击位置标记模型
				card_type: CONFIG_3D.card_type, // 1 代表的fbx，2 代表的是json
				dom_element: "map", // 使用的html容器id号
				camera_model_patrol_dist: this.camera_model_patrol_dist, // 配置巡视卡号的摄像机高度
				scale_dist: 30, // 扎堆的距离
				animation_enable: this.CONFIG.ANIMATION_SWITCH,
				animation_delay_time_point: this.CONFIG.ANIMATION_DELAY_TIME_POINT,
				animation_delay_time: this.CONFIG.ANIMATION_DELAY_TIME,
				cluster_enable: false,
				cache_time: this.CONFIG.MOVING_CACHE_TIME, // 数据缓存时间
				track_position_length: this.CONFIG.TRACK_RECORD_POINTS,
				track_animation_length: this.CONFIG.TRACK_RECORD_POINTS * 30,
				offset_top: this.$refs.map.offsetTop, // 场景偏移
				offset_left: this.$refs.map.offsetLeft, // 场景偏移
				is_render_outline: this.CONFIG.RENDER_MODEL_OUTLINE, // 是否渲染轮廓
				open_fps: false, // 是否显示帧率
				open_tips: false,
				select_color: 0xff8c08,
				type: scene_nodes.type,
				overview_dom_x: 10,
				overview_dom_y: 36,
				is_always_show_floor_data: this.replay_way === REPLAY_WAY.all,
				building_default_view: building_all_view_json,
				building_distance: building_all_floor_dist,
				buildings: scene_nodes.buildings,
				...resolveCameraParams(scene_nodes.camera_params) // 默认视角
			});

			MAP.setCardSpriteMapScale(this.scaleSize);
			MAP.setSpriteMapScale(this.scale_equipment_size);

			MAP.addEventListener("sceneload", this.mapLoad);
			MAP.addEventListener("loadmodelfinish", this.modelLoad);
			// 在跟随模式下不会触发
			MAP.addEventListener("mousedown", this.hidePopup);
			MAP.addEventListener("click", this.handleMapClick);
			MAP.addEventListener("selectedmodel", this.selectedModel);
			MAP.addEventListener("mousemove", this.handleMousePosition);
			MAP.addEventListener("sceneparsefinish", this.handleSceneParseFinish);
			MAP.addEventListener("maploadfailed", this.handleMapLoadFailed);
			MAP.addEventListener("hover", this.handleMapHover);
			MAP.addEventListener("change:rotation", this.handleRotateChange);
			MAP.addEventListener("framerenderfinish", this.handleFrameRenderFinish);
			MAP.addEventListener("unfoldbuilding", this.handleUnFoldBuilding);
			MAP.addEventListener("foldbuilding", this.handleFoldBuilding);
		},

		changeMap(floor) {
			const scene_nodes = this.getSceneNodes(floor, this.replay_way);
			if (!scene_nodes) return;
			this.loading_state = {
				total: 0,
				loaded: 0,
				speed: 0,
				progress: 0,
				state: LOADING_STATE.GET_DATA
			};
			this.building_label_positions = [];
			this.mouse_position = {x: 0, y: 0, z: 0};
			this.cardInfoObj = undefined;
			this.map_load_status = MAP_LOAD_STATUS.no_start;
			this.progress = 0;
			this.card_uuid_map.clear();
			// 重置完整轨迹相关参数
			this.allLineId.forEach(i => MAP.removePathLine(i));
			this.historyData = null;
			this.group_trajectory.clear();
			this.isGetDataEnd = false;
			this.dataLastTime = 0;
			this.allLineId = [];
			if (!MAP) {
				this.initMap(scene_nodes);
				MAP.setAnimationSpeed(this.play_multiple);
				return;
			}
			// 移除之前的半截历史轨迹
			this.removeAllDragLine();
			MAP.reset();

			const options = {
				is_render_outline: this.CONFIG.is_render_outline,
				...resolveCameraParams(scene_nodes.camera_params),
				is_always_show_floor_data: this.replay_way === REPLAY_WAY.all
			};
			MAP.changeScene(scene_nodes.url, scene_nodes.type, scene_nodes.buildings, options);
			MAP.setAnimationSpeed(this.play_multiple);
			this.is_start_measure && this.startMeasureDistance();
		},

		removeAllDragLine() {
			if (!MAP) return;
			this.halfTruckId.forEach((key) => MAP.removePathLine(key));
			this.halfTruckId = [];
		},

		getTagBaseInfo(uuid) {
			return this.PERSON_OBJ[uuid] || this.VISITOR_OBJ[uuid] || this.CAR_OBJ[uuid] || this.MATERIAL_OBJ[uuid] || this.CONTRACTOR_OBJ[uuid];
		},

		getTagTextClass() {
			return this.isShowModel ? "model-label" : "icon-label";
		},

		getTagLabel(card_item, map_setting) {
			const {show_field} = map_setting;
			const {card_id, floor_id, uuid} = card_item;

			const handleCardStr = (data) => {
				const label_arr = [];
				if (!data) return "";

				if (show_field.includes("name")) {
					const name_key = this.UTYPE_NAME_KEY_MAP[data.utype];
					const name = data[name_key];
					label_arr.push(name ?? "陌生卡");
				}
				if (show_field.includes("card_id")) {
					label_arr.push(card_id);
				}
				if (show_field.includes("floor_name")) {
					const floor_name = this.FLOOR_OBJ[floor_id]?.storey_name;
					floor_name && label_arr.push(floor_name);
				}
				return label_arr.join("-");
			};

			return handleCardStr(this.getTagBaseInfo(uuid));
		},
		setTagLabel(card_list, map_setting = this.area_map_setting) {
			card_list.forEach((item) => {
				const label = this.getTagLabel(item, map_setting);
				MAP.setCardText(item.card_id, label, {
					text_class: this.getTagTextClass()
				});
			});
		},
		toggleTagFields(checked, unchecked, map_setting) {
			if ("show_field" in checked || "show_field" in unchecked) {
				this.setTagLabel(this.card_uuid_map, map_setting);
			}
		},

		// 一张图模式&&楼层上的定位对象/设备/区域&&建筑地图存在，调用sdk方法需要floor_id
		getFloorIdParamToSDK(floor_id) {
			const floor_info = this.FLOOR_OBJ[floor_id];
			if (!floor_info) return undefined;
			const building_info = this.BUILDING_FLOORS[floor_info.building_id];
			if (this.replay_way === REPLAY_WAY.all && floor_info.storey_id !== OUTDOOR_STOREY_ID && Boolean(floor_info.file_3d_path) && Boolean(building_info.file_path)) {
				return floor_id;
			}
			return undefined;
		},

		addCard(card_item) {
			const {uuid, card_id, card_x, card_y, card_z, time, floor_id} = card_item;
			const handleModelKey = (data) => {
				if (!data) return "";
				const {icon_model_attr: {model_3d_url, model_2d_url}} = data;
				return this.isShowModel ? model_3d_url : model_2d_url;
			};

			const model_key = handleModelKey(this.PERSON_OBJ[uuid])
				|| handleModelKey(this.VISITOR_OBJ[uuid])
				|| handleModelKey(this.CAR_OBJ[uuid])
				|| handleModelKey(this.MATERIAL_OBJ[uuid])
				|| handleModelKey(this.CONTRACTOR_OBJ[uuid])
				|| handleModelKey(this.stranger_model_data);

			const floor_id_param = this.getFloorIdParamToSDK(floor_id);
			MAP.addCardInfo(card_id, card_x, card_y, card_z, model_key, time, {text_class: this.getTagTextClass(), text: this.getTagLabel(card_item, this.area_map_setting)}, false, floor_id_param);
			this.card_uuid_map.set(card_id, {...card_item});
			if (this.current_follow_card) {
				MAP.startThirdPersonFollow(this.current_follow_card);
			}
			this.addCardTrack(card_item);
			!this.isShowTrack && this.toggleCardTrack(false);
		},

		removeOneTag(card_id) {
			const {floor_id, uuid} = this.card_uuid_map.get(card_id) ?? {};
			const building_id = this.FLOOR_OBJ[floor_id]?.building_id;
			const utype = this.getTagBaseInfo(uuid)?.utype;
			if (this.replay_way === REPLAY_WAY.all && building_id && utype && this.building_statistics_data[building_id]) {
				this.building_statistics_data[building_id].stat[utype].value--;
			}
			MAP.clearTrack(card_id);
			MAP.removeCard(card_id);
			this.card_uuid_map.delete(card_id);
		},
		removeAllTag(utype, unchecked) {
			this.card_uuid_map.forEach(({card_id, utype: i_utype, branch_id, contractor_unit_id}) => {
				if (utype === undefined) {
					this.removeOneTag(card_id);
				} else if (utype === UTYPES.PERSON) {
					unchecked?.branch_id_list?.includes(branch_id) && this.removeOneTag(card_id);
				} else if (utype === UTYPES.CONTRACTOR) {
					unchecked?.contractor_unit_id_list?.includes(contractor_unit_id) && this.removeOneTag(card_id);
				} else if (i_utype === utype) {
					this.removeOneTag(card_id);
				}
			});
		},
		loadTag(map_setting, card_item) {
			const {branch_id_list, contractor_unit_id_list, is_show_visitor, is_show_car, is_show_material} = map_setting;
			const {branch_id, contractor_unit_id, utype, floor_id} = card_item;

			if (this.historyType === "uuid") {
				if (this.CONFIG.SCENE_SHOW_DEVICE) {
					this.addCard(card_item);
				} else if (floor_id === this.floor) {
					this.addCard(card_item);
				}
			} else if (this.historyType === "area") {
				if (utype === UTYPES.PERSON && branch_id_list.includes(branch_id)) {
					this.addCard(card_item);
				}
				if (utype === UTYPES.VISITOR && is_show_visitor) {
					this.addCard(card_item);
				}
				if (utype === UTYPES.CONTRACTOR && contractor_unit_id_list.includes(contractor_unit_id)) {
					this.addCard(card_item);
				}
				if (utype === UTYPES.CAR && is_show_car) {
					this.addCard(card_item);
				}
				if (utype === UTYPES.MATERIAL && is_show_material) {
					this.addCard(card_item);
				}
			}
		},
		toggleTag(checked, unchecked) {
			if ("branch_id_list" in unchecked) {
				this.removeAllTag(UTYPES.PERSON, unchecked);
			}
			if ("is_show_visitor" in unchecked) {
				this.removeAllTag(UTYPES.VISITOR);
			}
			if ("contractor_unit_id_list" in unchecked) {
				this.removeAllTag(UTYPES.CONTRACTOR, unchecked);
			}
			if ("is_show_car" in unchecked) {
				this.removeAllTag(UTYPES.CAR);
			}
			if ("is_show_material" in unchecked) {
				this.removeAllTag(UTYPES.MATERIAL);
			}
		},

		// 加载模型资源
		loadModelResource(data, type = "label_card") {
			if (!data) return false;
			const {icon_model_attr: {model_3d_url, model_2d_url, model_2d_s_url, model_2d_off_url, model_2d_off_s_url} = {}} = data;
			if (this.isShowModel) {
				if (model_3d_url && this.model_key_obj[model_3d_url] === undefined) {
					const temp = model_3d_url.split("/");
					const suffix = temp[temp.length - 1].split(".")[1];
					this.model_key_obj[model_3d_url] = 0;
					MAP.loadModel(`${base_url}${model_3d_url}`, model_3d_url, suffix);
				}
			} else {
				if (model_2d_url && this.model_key_obj[model_2d_url] === undefined) {
					this.model_key_obj[model_2d_url] = 0;
					MAP.loadModel(`${base_url}${model_2d_url}`, model_2d_url, "texture");
				}
				if (model_2d_s_url && this.model_key_obj[model_2d_s_url] === undefined) {
					this.model_key_obj[model_2d_s_url] = 0;
					MAP.loadModel(`${base_url}${model_2d_s_url}`, model_2d_s_url, "texture");
				}
				if (type === "station") {
					if (model_2d_off_url && this.model_key_obj[model_2d_off_url] === undefined) {
						this.model_key_obj[model_2d_off_url] = 0;
						MAP.loadModel(`${base_url}${model_2d_off_url}`, model_2d_off_url, "texture");
					}
					if (model_2d_off_s_url && this.model_key_obj[model_2d_off_s_url] === undefined) {
						this.model_key_obj[model_2d_off_s_url] = 0;
						MAP.loadModel(`${base_url}${model_2d_off_s_url}`, model_2d_off_s_url, "texture");
					}
				}
			}
			return true;
		},

		// 检查模型是否加载完成
		checkModelLoadEnd(data, type = "label_card") {
			if (!data) return false;
			const {icon_model_attr: {model_3d_url, model_2d_url, model_2d_s_url, model_2d_off_url, model_2d_off_s_url} = {}} = data;
			const load_3d_model = this.model_key_obj[model_3d_url];
			const load_icon_model = this.model_key_obj[model_2d_url];
			const load_icon_s_model = this.model_key_obj[model_2d_s_url];
			const load_icon_off_model = this.model_key_obj[model_2d_off_url];
			const load_icon_off_s_model = this.model_key_obj[model_2d_off_s_url];

			if (this.isShowModel) {
				return load_3d_model === 1;
			} else {
				return type === "label_card"
					? load_icon_model === 1 && load_icon_s_model === 1
					: load_icon_model === 1 && load_icon_s_model === 1 && load_icon_off_model && load_icon_off_s_model;
			}
		},

		// 区域回放在每段时间里回放到最后一个点后移除定位卡
		removeLastPointCard(card, is_last_point) {
			// is_last_point 有可能是 undefined
			if (this.historyType === "area" && is_last_point === true) {
				setTimeout(() => {
					if (this.cardInfoObj?.card_num === card) {
						this.cardInfoObj = undefined;
					}
					this.removeOneTag(card);
				}, 500);
			}
		},

		// 处理换卡，0-10s 卡号1-uuid1, 11s-20s 卡号2-uuid1
		handleSwitchCard(new_uuid) {
			const find_one = Array.from(this.card_uuid_map.values()).find(({uuid}) => new_uuid === uuid);
			if (find_one) {
				// 新增的uuid在之前已经添加，说明已经换卡
				// 移除之前的卡和轨迹
				const {card_id} = find_one;
				this.removeOneTag(card_id);
			}
		},

		// 处理换定位对象，0-10s 卡号1-uuid1, 11s-20s 卡号1-uuid2
		// handleSwitchTag() {}
		updateCardPosition(item) {
			if (this.map_load_status !== MAP_LOAD_STATUS.completed) return;
			const {uuid, card_id, card_x, card_y, card_z, is_last_point, time} = item;
			const {utype, branch_id, unit_id} = this.getTagBaseInfo(uuid) ?? {};
			item.utype = utype;
			item.branch_id = branch_id;
			item.contractor_unit_id = unit_id;
			this.loadModelResource(this.PERSON_OBJ[uuid]);
			this.loadModelResource(this.VISITOR_OBJ[uuid]);
			this.loadModelResource(this.CAR_OBJ[uuid]);
			this.loadModelResource(this.MATERIAL_OBJ[uuid]);
			this.loadModelResource(this.CONTRACTOR_OBJ[uuid]);

			// 员工/访客/车辆/物资 的 3d 和 2d图标，2d选中图标，模型都加载完成才添加定位卡或更新定位卡位置
			const is_load_end = this.checkModelLoadEnd(this.PERSON_OBJ[uuid])
				|| this.checkModelLoadEnd(this.VISITOR_OBJ[uuid])
				|| this.checkModelLoadEnd(this.CAR_OBJ[uuid])
				|| this.checkModelLoadEnd(this.MATERIAL_OBJ[uuid])
				|| this.checkModelLoadEnd(this.CONTRACTOR_OBJ[uuid]);

			if (!is_load_end) return;

			const old_card_item = this.card_uuid_map.get(card_id);
			if (old_card_item) {
				if (old_card_item.floor_id !== item.floor_id) {
					this.setTagLabel([item]);
				}
				if (item.is_cached !== 2) {
					this.card_uuid_map.set(card_id, {...item});
					MAP.updateCardCoordinate(card_id, card_x, card_y, card_z, time);
				}
				this.openTagDialog(this.card_uuid_map.get(card_id));
			} else {
				this.handleSwitchCard(uuid);
				this.loadTag(this.area_map_setting, item);
			}
			this.removeLastPointCard(card_id, is_last_point);
			this.showTruckMap(uuid);
			this.statisticsTagQuantityInBuilding(this.card_uuid_map.values());
		},

		statisticsTagQuantityInBuilding(card_iterator) {
			const floor_info = this.FLOOR_OBJ[this.floor];
			if (this.replay_way === REPLAY_WAY.all && floor_info?.storey_id === OUTDOOR_STOREY_ID) {
				this.building_statistics_data = getInitBuildingStatisticsData(this.on_scene_buildings);
				for (const {uuid, floor_id} of card_iterator) {
					const floor_info = this.FLOOR_OBJ[floor_id];
					if (floor_info.storey_id === OUTDOOR_STOREY_ID) continue;
					const building_id = floor_info.building_id;
					if (this.building_statistics_data[building_id]) {
						const tag_info = this.getTagBaseInfo(uuid);
						this.building_statistics_data[building_id].stat[tag_info.utype].value++;
					}
				}
			}
		},
		foldBuilding(id, immediate) {
			if (this.building_clickable) {
				this.clickBuilding({model: {type: ModelType.Building, id}}, immediate);
			}
		},

		clickBuilding(e, immediate) {
			if (e && e.model.type === ModelType.Floor) return;

			// 点中了建筑或者场景
			if (e && e.model.type !== ModelType.Scene) {
				if (e.model.type === ModelType.Building) {
					this.unfold_building_id = e.model.id;
					MAP.unfoldBuilding(e.model.id, immediate);
				}
			}

			this.perspective_arr = e;
		},

		openTagDialog(card_item) {
			if (!this.cardInfoObj || !card_item) return;
			const {card_x: x, card_y: y, card_z: z, floor_id: card_floor_id} = card_item;
			const {card_num, utype, uuid, type_name: truck_type_name} = this.cardInfoObj;
			const floor_info = this.FLOOR_OBJ[card_floor_id];
			const is_outdoor = floor_info?.storey_id === OUTDOOR_STOREY_ID;
			this.detail_dialog_store.setProps(DetailDialogCategoryEnum.POSITION_OBJECT, {
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
					this.hidePopup({buttons: 1});
				}
			});
		},

		// 已经获取到完整的历史轨迹数据
		finishFullHistoryTrajectoryData() {
			this.isGetDataEnd = true;
			this.group_trajectory = groupHistoryTrajectory(this.historyData, false);
		},

		showTruckMap(uuid) {
			if (this.floor === 0 || !this.isShowAllTruck || !this.isGetDataEnd || this.allLineId.includes(uuid)) return;
			const line_points = this.group_trajectory.get(uuid)?.coords;
			if (!line_points) return;
			MAP.drawPathLine(uuid, line_points, this.trajectory_colors[uuid] || "rgb(117, 13, 32)");
			this.allLineId.push(uuid);
		},

		async getHistoryTruck(start = parseInt(this.start) * 1000) {
			if (!this.FLOOR_OBJ[this.floor] || this.historyType !== "uuid") return;
			if (this.dataLastTime + 1000 >= this.end * 1000) return;
			if (this.historyData && this.isGetDataEnd) return;
			const {getCardHistory, abortGetCardHistory} = getCardHistoryRequest();
			this.abortFetchCardHistory = abortGetCardHistory;
			const {data: {type, result, is_cancel}} = await getCardHistory({
				begin: start,
				end: parseInt(this.end) * 1000,
				uuid_list: this.playUuidList,
				floor_id: this.replay_way === REPLAY_WAY.floor ? this.floor : undefined,
				scene_id: this.replay_way === REPLAY_WAY.floor ? undefined : this.FLOOR_OBJ[this.floor].scene_id
			}).catch((error) => {
				return {data: {is_cancel: isCancel(error)}};
			});

			if (is_cancel) return;

			if (type === 1 && result.length > 0) {
				const filter_fake_data = result.filter((item) => item.is_cached !== 2);
				// historyData为null赋值
				this.dataLastTime = filter_fake_data[filter_fake_data.length - 1].time;
				this.historyData = !this.historyData ? filter_fake_data : this.historyData.concat(filter_fake_data);

				// 接口最后一个time的下一秒 小于 查询时间段的end
				// 查到最后只有几条数据时 传的begin参数一直与返回数组最后一位的time相等
				if (this.dataLastTime + 1000 < this.end * 1000) {
					this.isGetDataEnd = false;
					await this.getHistoryTruck(this.dataLastTime + 1000);
				} else {
					this.isGetDataEnd = true;
					this.finishFullHistoryTrajectoryData();
				}
			} else {
				this.isGetDataEnd = true;
				this.finishFullHistoryTrajectoryData();
			}
		},

		handleDrag({nowTime}) {
			this.current_follow_card && this.backFollowCardStatus();
			// 移除定位卡的轨迹和定位卡本身
			const removeCardTrack = () => {
				this.card_uuid_map.forEach((_, card_id) => {
					this.removeOneTag(card_id);
				});
				this.card_uuid_map.clear();
			};
			// 人员回放，拖拽滚动条绘制前面时间段的轨迹
			if (this.historyType === "uuid") {
				this.removeAllDragLine();
				removeCardTrack();
				const current_time_str = nowTime + this.start * 1000;
				if (!this.historyData) return;
				const {idx: nearest_index} = findNearestTargetNum(this.historyData, "time", current_time_str);
				const group_trajectory = groupHistoryTrajectory(this.historyData.slice(0, nearest_index + 1), false);
				for (const [uuid, item] of group_trajectory.entries()) {
					const {coords, list} = item;
					if (list.length === 0) continue;
					this.updateCardPosition(list.slice(-1)[0]);
					const line_key = `${uuid}_truck`;
					MAP.drawPathLine(line_key, coords, this.trajectory_colors[uuid] || "rgb(72, 186, 34)");
					this.halfTruckId.push(line_key);
				}
			} else if (this.historyType === "area") {
				removeCardTrack();
			}
		},

		addZone(zone, floor_id) {
			MAP.addZone(zone, floor_id);
			if (zone.id.toString() === this.area) {
				// 当前选择的区域设置为视图中心
				MAP.lookAtZone(zone.id, 20, 20, 20);
			}
		},
		loadAreas(map_setting) {
			const {area_id_list} = map_setting;
			MAP.removeAllZone();
			const formatZone = (item) => {
				const {coords: area, id, name, color, relative_start, relative_end, type, start = 0} = item;
				const area_coords = stringAndArrayTransform(area, "three");
				return {
					id,
					zone_color: rgbToHex(color),
					z_start: (parseFloat(relative_start) || 0) + parseFloat(start),
					z_end: (parseFloat(relative_end) || 0) + parseFloat(start),
					area_list: [{area: area_coords}],
					type,
					name,
				};
			};
			this.areas_map.forEach((item) => {
				const zone = formatZone(item);
				// area_id_list不包含定位优化区域
				if (area_id_list.includes(item.id)
					&& ![AreaType.Obstacle, AreaType.Activity, AreaType.Blind].includes(item.type)
				) {
					const sdk_floor_id = this.getFloorIdParamToSDK(item.floor_id);
					if (this.replay_way === REPLAY_WAY.all) {
						// 一张图: 渲染场景下所有的区域
						this.on_scene_floor_ids.includes(item.floor_id) && this.addZone(zone, sdk_floor_id);
					} else {
						// 分楼层: 只渲染该楼层的区域
						item.floor_id === this.floor && this.addZone(zone, sdk_floor_id);
					}
				}
			});
		},
		toggleAreas(checked, unchecked, map_setting) {
			if ("area_id_list" in checked || "area_id_list" in unchecked) {
				this.loadAreas(map_setting);
			}
			if ("is_show_obstacle_area" in checked || "is_show_obstacle_area" in unchecked) {
				this.loadAreas(map_setting);
			}
			if ("is_show_active_area" in checked || "is_show_active_area" in unchecked) {
				this.loadAreas(map_setting);
			}
			if ("is_show_blind" in checked || "is_show_blind" in unchecked) {
				this.loadAreas(map_setting);
			}
		},

		// 加载基站模型
		loadBaseStationModel() {
			this.base_station_map.forEach((item) => this.loadModelResource(item, "station"));
			if (this.load_bs_model) {
				this.loadBs(this.area_map_setting);
			}
		},
		loadBs(map_setting) {
			const {bs_type_list} = map_setting;
			MAP.removeAllBaseStation();
			this.base_station_map.forEach((item) => {
				const {device_no, status, x, y, z, icon_model_attr: {model_2d_url, model_3d_url, model_2d_off_url}, floor_id} = item;
				const text = this.getBsLabel(item, map_setting);
				if (bs_type_list.includes(item.base_type)) {
					let model_key = "";
					if (this.isShowModel) {
						model_key = model_3d_url;
					} else {
						model_key = status ? model_2d_url : model_2d_off_url;
					}
					const floor_id_param = this.getFloorIdParamToSDK(floor_id);
					MAP.addBaseStation(device_no, x, y, z, model_key, {
						text,
						text_class: status ? "online" : "offline"
					}, floor_id_param);
				}
			});
		},
		toggleBs(checked, unchecked, map_setting) {
			if ("bs_type_list" in checked || "bs_type_list" in unchecked) {
				this.loadBs(map_setting);
			}
		},
		getBsLabel(item, map_setting) {
			const {device_base_field} = map_setting;
			const text_list = [];
			if (device_base_field.includes("name")) {
				text_list.push(item.name);
			}
			if (device_base_field.includes("device_id")) {
				text_list.push(item.device_no);
			}
			if (device_base_field.includes("floor")) {
				const storey_name = this.FLOOR_OBJ[item.floor_id]?.storey_name;
				storey_name && text_list.push(storey_name);
			}
			return text_list.join("-");
		},
		toggleBsFields(checked, unchecked, map_setting) {
			if ("device_base_field" in checked || "device_base_field" in unchecked) {
				this.loadBs(map_setting);
			}
		},

		toggleBuildingClickable(is_click) {
			is_click ? MAP?.enableBuildingMouseEvents() : MAP?.disableBuildingMouseEvents();
		},
		toggleBuilding(checked, unchecked, map_setting) {
			if ("building_config" in checked || "building_config" in unchecked) {
				this.toggleBuildingClickable(map_setting.building_config.includes("layer"));
			}
		},

		// 处理告警和应急报告跳转的区域显示
		async handleJumpAreas() {
			const {area_id_list, area_id} = this.$route.query;
			const normal_area_id_list = [], deleted_area_id_list = [];
			new Set((area_id_list + "," + area_id).split(",").map(Number)).forEach((area_id) => {
				const is_delete = Boolean(this.areas_map.get(area_id)?.is_delete);
				is_delete ? deleted_area_id_list.push(area_id) : normal_area_id_list.push(area_id);
			});
			try {
				// 等下轮dom更新，否则map_tool_ref为null
				await this.$nextTick();
				// 勾选上后会触发SETTING_CHANGE_KEY事件
				await this.$refs.map_tool_ref.checkAreas(normal_area_id_list);
				deleted_area_id_list.forEach((area_id) => {
					const item = this.areas_map.get(area_id);
					if (item) {
						!this.is_from_emergency_report_page && this.emitDeletedArea({name: item.name, id: area_id});
						const area_coords = stringAndArrayTransform(item.coords, "three");
						const zone = {
							id: area_id,
							zone_color: rgbToHex(item.color),
							z_start: (parseFloat(item.relative_start) || 0) + parseFloat(item.start),
							z_end: (parseFloat(item.relative_end) || 0) + parseFloat(item.start),
							area_list: [{area: area_coords}],
							type: item.type,
							name,
						};
						this.addZone(zone, item.floor_id);
					}
				});
			} catch (error) {
				console.error(error);
			}
		},

		async handleMapLoadEnd() {
			window.cancelAnimationFrame(this.animation_frame);
			await Promise.allSettled([
				this.fetchAreas(),
				this.fetchBaseStations(this.floor, this.replay_way, {scene_floors: this.SCENE_FLOORS, floor_obj: this.FLOOR_OBJ, sys_config: this.CONFIG}),
			]).catch((error) => console.debug(error));
			this.loadAreas(this.area_map_setting);
			this.loadBaseStationModel();
			this.handleJumpAreas();
			this.toggleBuildingClickable(this.building_clickable);
			if (this.historyType === "uuid" && this.startPlayBack) this.getHistoryTruck();
			this.loading_state = {...this.loading_state, loaded: 0, state: LOADING_STATE.PARSE_FINISH};
			this.map_load_status = MAP_LOAD_STATUS.completed;
			this.$emit("map-loadend");
		},
		mapLoad(e) {
			const {total = 0, loaded = 0, progress, speed = 0} = e;
			this.loading_state = {...this.loading_state, total, loaded, progress, speed};
			this.map_load_status = MAP_LOAD_STATUS.loading;
			if (e.progress === 1) {
				this.loading_state.state = LOADING_STATE.PARSING_MAP;
			} else {
				this.loading_state.state = LOADING_STATE.DOWNLOAD_MAP;
			}
		},

		handleSceneParseFinish() {
			this.handleMapLoadEnd();
		},

		handleMapLoadFailed() {
			this.loading_state.state = LOADING_STATE.DOWNLOAD_FAILED;
		},

		handleMapHover(e) {
			this.$refs.map.style.cursor = e?.model?.type ? "pointer" : "default";
		},

		modelLoad({key}) {
			if (key === "marker") return;
			this.model_key_obj[key] = 1;
			this.load_bs_model = [...this.base_station_map.values()].every((item) => this.checkModelLoadEnd(item, "station"));
			if (this.load_bs_model) {
				this.loadBs(this.area_map_setting);
			}
		},

		handleRotateChange(rotation) {
			this.rotation = rotation;
		},

		handleFrameRenderFinish() {
			const positions = MAP.getBuildingLabelPosition();
			this.building_label_positions = Object
				.keys(positions)
				.map(t => ({
					id: +t,
					...positions[t],
					scale: getBuildingIconScale(positions[t].z.toFixed(5))
				}));
		},

		handleUnFoldBuilding(building_id) {
			if (this.building_clickable) {
				this.unfold_building_id = Number(building_id);
			}
		},
		handleFoldBuilding() {
			this.unfold_building_id = null;
		},

		handleBackCenter() {
			if (this.is_follow) {
				return;
			}
			MAP.goBackToCenter();
		},

		handleZoom(type) {
			type === "zoom_in" ? MAP.zoomIn() : MAP.zoomOut();
		},

		handleSwitchMap(value) {
			this.dimension = value;
			this.$emit("switch-map", value);
		},

		startMeasureDistance() {
			this.is_start_measure = true;
			MAP.disableMeasureTool();
			MAP.enableMeasureTool();
		},
		reMeasureDistance() {
			MAP.disableMeasureTool();
			MAP.enableMeasureTool();
		},
		stopMeasureDistance() {
			this.is_start_measure = false;
			MAP.disableMeasureTool();
		},

		// 更新模型图标
		updateSelectedModel(now_model_id, old_model_id, type) {
			if (this.isShowModel) return;
			if (type === this.FeatureType.TAG) {
				const old_uuid = this.cardInfoObj?.uuid;
				const now_uuid = this.card_uuid_map.get(parseInt(now_model_id))?.uuid;
				if (old_uuid !== undefined) {
					// 把之前的 model 还原
					const {icon_model_attr: {model_2d_url} = {}}
						= this.PERSON_OBJ[old_uuid]
							|| this.VISITOR_OBJ[old_uuid]
							|| this.CAR_OBJ[old_uuid]
							|| this.MATERIAL_OBJ[old_uuid]
							|| this.CONTRACTOR_OBJ[old_uuid]
							|| this.stranger_model_data;
					old_model_id && MAP.updateCardModel(old_model_id, model_2d_url);
				}
				if (now_uuid !== undefined) {
					// 把当前 model 高亮
					const {icon_model_attr: {model_2d_s_url} = {}}
						= this.PERSON_OBJ[now_uuid]
							|| this.VISITOR_OBJ[now_uuid]
							|| this.CAR_OBJ[now_uuid]
							|| this.MATERIAL_OBJ[now_uuid]
							|| this.CONTRACTOR_OBJ[now_uuid]
							|| this.stranger_model_data;
					now_model_id && MAP.updateCardModel(now_model_id, model_2d_s_url);
				}
			} else if (type === this.FeatureType.BASE_STATION) {
				const {icon_model_attr: {model_2d_url, model_2d_off_url} = {}, status: old_status} = this.base_station_map.get(old_model_id) || {};
				const {icon_model_attr: {model_2d_s_url, model_2d_off_s_url} = {}, status: now_status} = this.base_station_map.get(now_model_id) || {};
				old_model_id && MAP.updateBaseStationIcon(old_model_id, old_status ? model_2d_url : model_2d_off_url);
				now_model_id && MAP.updateBaseStationIcon(now_model_id, now_status ? model_2d_s_url : model_2d_off_s_url);
			}
		},

		selectedModel(e) {
			this.popupType = +e.model_type;

			if (e.model_id === this.cardInfoObj?.card_num) return;
			if (this.popupType === 1) {
				const card_item = this.card_uuid_map.get(parseInt(e.model_id));
				const uuid = card_item?.uuid;
				this.updateSelectedModel(e.model_id, this.cardInfoObj?.card_num, this.FeatureType.TAG);

				this.cardInfoObj = setInfoCardContent(this.PERSON_OBJ[uuid], e.model_id, this.FeatureType.PERSON)
					|| setInfoCardContent(this.VISITOR_OBJ[uuid], e.model_id, this.FeatureType.VISITOR)
					|| setInfoCardContent(this.CAR_OBJ[uuid], e.model_id, this.FeatureType.CAR)
					|| setInfoCardContent(this.MATERIAL_OBJ[uuid], e.model_id, this.FeatureType.MATERIAL)
					|| setInfoCardContent(this.CONTRACTOR_OBJ[uuid], e.model_id, this.FeatureType.CONTRACTOR);
				this.openTagDialog(card_item);
				this.detail_dialog_store.toggleVisible(DetailDialogCategoryEnum.POSITION_OBJECT, true);
			} else if (this.popupType === 2) {
				this.updateSelectedModel(e.model_id, this.cardInfoObj?.station_id, this.FeatureType.BASE_STATION);
				this.cardInfoObj = setInfoCardContent(this.base_station_map.get(e.model_id), e.model_id, this.FeatureType.BASE_STATION);
				this.detail_dialog_store.setProps(DetailDialogCategoryEnum.BASE_STATION, {
					direction: "rtl", // 控制弹窗的方向，优先级比 from 高
					device_uuid: this.cardInfoObj.device_uuid,
					is_backstage: true,
					close: () => {
						this.hidePopup({buttons: 1});
					}
				});
				this.detail_dialog_store.toggleVisible(DetailDialogCategoryEnum.BASE_STATION, true);
			}
		},

		// 处理在跟随模式下，无法触发 MAP 的 mousedown 事件
		// 在跟随模式下，点击除模型外的地方，要关闭信息框，否则会引起 #12395 bug
		handleMapClick() {
			if (this.current_follow_card !== undefined) {
				this.hidePopup({buttons: 1});
			}
		},

		hidePopup(e) {
			// 鼠标左键 buttons 为 1，鼠标右键 buttons 为 2
			// 点击地图并且不是跟随模式才关闭信息框
			if (e.buttons === 1) {
				const old_model_id = this.cardInfoObj?.card_num || this.cardInfoObj?.station_id;
				old_model_id && this.updateSelectedModel(undefined, old_model_id, this.cardInfoObj?.type);
				this.cardInfoObj = undefined;
			}
		},

		// 获取鼠标点击的坐标
		handleMousePosition(position) {
			this.mouse_position = position;
		},
	}
};
</script>

<style scoped>
.history-map3d {
	height: 100%;
	position: relative;
}

#map {
	position: absolute;
	width: 100%;
	height: 100%;
	/* z-index: 1000; */
}

#map :deep(.measure-tool-notify) {
	position: absolute;
	color: white;
	pointer-events: none;
	background-color: rgba(0, 0, 0, 0.4);
	margin: 16px 0;
	border-radius: 4px;
	padding: 5px 8px;
}

.map-tools {
	position: absolute;
	bottom: 20px;
	display: flex;
	flex-direction: column;
	left: 20px;
}

.map-tools .pop-setting {
	margin-bottom: 4px;
}

.map-tools .icon-setting {
	display: inline-block;
	font-size: 16px;
	color: #a2b2c2;
	background-color: #fff;
	width: 26px;
	height: 26px;
	text-align: center;
	line-height: 26px;
	cursor: pointer;
	box-shadow: 0 0 2px 0 hsl(0deg, 0%, 44%, 30%);
}

.mouse-position {
	position: absolute;
	bottom: 18px;
	left: 55px;
	z-index: 1001;
	color: #a2b2c2;
	font-size: 14px;
	width: 154px;
	padding: 3px 8px;
	background-color: rgba(255, 255, 255, 0.7);
}

/* sdk 自带的label-icon类 */
.history-map3d :deep(.label) {
	color: #15F9F8;
	border-radius: 2px;
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	/** padding 和 line-height不能合并，否则取消名称之后会存在白框 */
	padding: 0px 10px;
	line-height: 24px;
	gap: 10px;
	font-weight: 400;
	font-size: 12px;
}

.history-map3d :deep(.model-label.label) {
	background: #0F2133D9;
	top: -20px !important;
}

.history-map3d :deep(.icon-label.label),
.history-map3d :deep(.label-icon.label) {
	background: #0F2133D9;
	top: 20px !important;
}

.history-map3d :deep(.zone-label) {
	width: fit-content;
	font-size: 14px;
	line-height: 14px;
	font-family: "Noto Sans CJK SC Regular", sans-serif;
	color: white;
	-webkit-text-stroke: 0.5px rgba(0, 0, 0, 1);
	text-shadow: 0 1px black, 1px 0 black, -1px 0 black, 0 -1px black;
	font-weight: 600;
}
.history-map3d :deep(.zone-label.zone-label-highlight) {
	color: #15F9F8;
}

.history-map3d :deep(.online) {
	color: #15F9F8;
	background: #0F2133D9;
	top: -20px !important;
}

.history-map3d :deep(.offline) {
	color: #D1D8E1;
	background: #0F2133D9;
	top: -20px !important;
}

.map-campass-icon {
	position: absolute;
	top: 20px;
	right: 20px;
	z-index: 1001;
	cursor: pointer;
}

.coordinate-text {
	position: absolute;
	bottom: 20px;
	left: 66px;
	font-size: 12px;
	font-family: "DingTalk JinBuTi";
	color: #fff;
}
</style>
