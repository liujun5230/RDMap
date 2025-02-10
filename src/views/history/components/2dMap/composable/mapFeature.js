import {feature as Feature} from "@/libs/HG2DMap.mjs";
import {base_url} from "@/Config";
import {useTrajectoryColorsStore} from "@/views/history/store/useTrajectoryColorsStore";
import {getCheckedSettingStorage} from "../../../units";

/**
 * 绘制热力图
 * @param {object} map_instance 地图实例
 * @param {object} heatmap_data 热力图数据
 */
export function drawHeatmapFeature(map_instance, heatmap_data) {
	if (!heatmap_data || !map_instance) return;
	for (const [key, value] of Object.entries(heatmap_data)) {
		const [x, y] = key.split("_").map(xy => parseFloat(xy));
		const count = Math.min(
			1,
			Math.max(0.2, parseInt(value / 1000))
		);
		const feature = new Feature.point([x, y]);
		feature.set("weight", count);
		map_instance.heat_map_source.addFeature(feature);
	}
}

export function drawSingleTrajectoryLine(map_instance, uuid, group_trajectory) {
	if (!group_trajectory.size || !map_instance) return null;
	const line_points = group_trajectory.get(uuid)?.coords;
	if (Array.isArray(line_points) && line_points.length) {
		const {trajectory_colors} = useTrajectoryColorsStore();
		const feature = new Feature.line(line_points);
		const line_color = trajectory_colors[uuid] || "#3899ca";
		feature.updateStyle(line_color, 3);
		map_instance.addFeature(feature);
		return feature;
	}
	return null;
}

/**
 * 添加地图测量工具
 * @param {object} map_instance 地图实例
 */
export function addMapMeasureTool(map_instance) {
	if (!map_instance) return;
	map_instance.removeControlMeasure();
	map_instance.addControlMeasure("line", {
		drawend: () => {
			map_instance.removeControlMeasure();
		}
	});
}

/**
 * 定位到地图中心
 * @param {object} map_instance 地图实例
 * @param {number[]} init_center 地图初始中心点
 * @param {number} init_zoom 地图初始缩放大小
 */
export function locationMapCenter(map_instance, init_center, init_zoom) {
	if (!map_instance) return;
	map_instance.setCenter(init_center[0], init_center[1]);
	map_instance.setZoom(init_zoom);
}

/**
 * 在地图上切换基站的显示
 * @param {object} map_instance 地图实例
 * @param {object[]} base_station_data 基站数据
 * @param {object} base_station_scale 基站缩放对象
 */
export function toggleBaseStation(map_instance, base_station_data, base_station_scale) {
	if (!map_instance) return;
	map_instance.removeAllBaseStation();
	if (!getCheckedSettingStorage().includes("baseStation")) return;
	base_station_data.forEach((item) => {
		const {type, status, device_no, x, y, name, icon_model_attr} = item;
		const {model_2d_url, model_2d_s_url, model_2d_off_url, model_2d_off_s_url} = icon_model_attr || {};
		if (type === 5) {
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
				name,
				{
					icon_scale: base_station_scale.icon,
					text_scale: base_station_scale.text,
					offset_y: base_station_scale.offset_y,
					text_color,
				}
			);
			feature.type = "station";
			feature.card_num = device_no;
			feature.model_2d_url = icon_src;
			feature.model_2d_s_url = selected_url;
			item.feature = feature;
		}
	});
}

/**
 * 获取基站 feature
 * @param {number} card_num 基站的卡号
 * @param {array} base_station_data 基站数据
 */
export function getStationFeature(card_num, base_station_data) {
	return base_station_data.find(({device_no}) => device_no === card_num)?.feature;
}

/**
 * 移除绘制的 feature
 * @param {object} map_instance 地图实例
 * @param {object} draw_feature 绘制的 feature
 */
export function removeDrawFeature(map_instance, draw_feature) {
	map_instance && draw_feature && map_instance.removeFeature(draw_feature);
	return null;
}
