import {unref} from "vue";
import {jsonp} from "vue-jsonp";
import store from "@/store";
import {mapAutomaticSetting, getScaleParam, getMaxAndMinZoom, getMapTypeByPostfix} from "@/utils/js/tools/map";
import {OUTDOOR_STOREY_ID} from "@/utils/js/constant";
import {base_url, zoom_factor} from "@/Config";
import {REPLAY_WAY} from "@/views/history/constant";

// 百度地图默认中心坐标
const baidu_center_location = [11574219.77990221, 3578416.998569895];

export function useCustomMapConfig(options) {
	const {
		scene_floors_inject,
		building_floors_inject,
		floor_obj_inject,
		config_inject,
		map_dom
	} = options;
	const getCustomMapConfig = (floor_id, replay_way) => {
		const floor_info = floor_obj_inject.value[floor_id];
		if (!floor_info) return;

		const postfix = floor_info.file_2d_postfix;
		// 图片对应实际的坐标范围，顺序为[左, 下, 右, 上]，且单位必须为米
		const extend = [floor_info.coordinate_left, floor_info.coordinate_down, floor_info.coordinate_right, floor_info.coordinate_upper];
		const obj = mapAutomaticSetting(floor_info.floor_scaling_ratio, floor_info.origin_x, floor_info.origin_y, floor_info.drop_multiple, extend, map_dom.clientWidth, map_dom.clientHeight);
		const {min_zoom, max_zoom, zoom} = getMaxAndMinZoom(zoom_factor, obj.zoom, floor_info.map_configure.zoom.min, floor_info.map_configure.zoom.max);
		let building_extent = {};
		if (replay_way === REPLAY_WAY.all && floor_info.storey_id === OUTDOOR_STOREY_ID) {
			const scene_id = floor_info.scene_id;
			building_extent = scene_floors_inject.value[scene_id].building_ids.reduce((result, building_id) => {
				const building_item = building_floors_inject.value[building_id];
				if (building_item) {
					const {coordinate_down, coordinate_left, coordinate_right, coordinate_upper} = building_item;
					if ([coordinate_down, coordinate_left, coordinate_right, coordinate_upper].every((val) => val !== null)) {
						const extent = [coordinate_left, coordinate_down, coordinate_right, coordinate_upper];
						result[building_id] = extent;
					}
				}
				return result;
			}, {});
		}
		return {
			url: base_url + floor_info.file_2d_path,
			type: getMapTypeByPostfix(postfix),
			center: obj.center,
			zoom,
			zoom_factor,
			min_zoom,
			max_zoom,
			extend,
			extent: obj.extent,
			enable_rotation: true, // 是否允许旋转
			rotation: parseFloat(floor_info.rotation),
			cluster_distance: 0, // 多少像素进行聚类，0为关闭聚类
			animation_enable: config_inject.value.ANIMATION_SWITCH, // 是否开启定位图标移动动画
			animation_cache_time: config_inject.value.MOVING_CACHE_TIME, // 动画缓存时间
			animation_delay_time_point: config_inject.value.ANIMATION_DELAY_TIME_POINT,
			animation_delay_time: config_inject.value.ANIMATION_DELAY_TIME,
			map_stroke_color: store.getters.kml_color,
			building_extent
		};
	};

	return getCustomMapConfig;
}

export function useBaiduMapConfig(config_inject) {
	let baidu_center = null;

	const fetchBaiduMapCenter = async (ak) => {
		if (baidu_center) return [...baidu_center];
		try {
			const data = await jsonp(`http://api.map.baidu.com/location/ip?ak=${ak}&callback=?`);
			baidu_center = [parseFloat(data.content.point.x), parseFloat(data.content.point.y)];
			return [...baidu_center];
		} catch (error) {
			return [...baidu_center_location];
		}
	};

	const getBaiduMapConfig = async (is_gps_earth_map) => {
		const is_earth = unref(is_gps_earth_map);
		const center = await fetchBaiduMapCenter(config_inject.value.BAIDU_AK);

		return {
			url: "",
			center,
			zoom: 16,
			type: is_earth ? "earth" : "baidu",
			min_zoom: 3,
			max_zoom: 23,
			animation_enable: config_inject.value.ANIMATION_SWITCH,
			animation_cache_time: config_inject.value.MOVING_CACHE_TIME,
		};
	};

	return getBaiduMapConfig;
}

export function generateLabelAndEquipScaleFn(floor_info, map_instance) {
	if (!floor_info) return;
	const min_zoom = map_instance.getMinZoom();
	const max_zoom = map_instance.getMaxZoom();
	const label_icon = floor_info.map_configure.label;
	const equip_icon = floor_info.map_configure.equipment;
	const inspection_icon = floor_info.map_configure.inspection_point;
	return {
		getLabelScale: getScaleParam(label_icon.min / 100, label_icon.max / 100, min_zoom, max_zoom),
		getEquipScale: getScaleParam(equip_icon.min / 100, equip_icon.max / 100, min_zoom, max_zoom),
		getPatrolPointScale: getScaleParam(inspection_icon.min / 100, inspection_icon.max / 100, min_zoom, max_zoom)
	};
}
