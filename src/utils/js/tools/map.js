import {checkRequiredParameters} from "./paramCheck";
import {Notification} from "element-ui";
import {map_type, view} from "@/libs/HG2DMap.mjs";
import {zoom_factor} from "@/Config";

// 获取地图自适应缩放比和中心点
export function mapAutomaticSetting(map_zoom, x, y, times, extend, div_x, div_y) {
	checkRequiredParameters([extend, div_x, div_y]);
	const view_obj = new view({zoomFactor: zoom_factor});

	const obj = {};
	// 如果缩放比为空
	if (map_zoom === null) {
		const map_x = parseFloat(Math.abs(parseFloat(extend[2]) - parseFloat(extend[0]))); // 得到地图文件的宽
		const map_y = parseFloat(Math.abs(parseFloat(extend[3]) - parseFloat(extend[1]))); // 得到地图文件的高
		const zoom_x = view_obj.getZoomForResolution(parseFloat(map_x / div_x));
		const zoom_y = view_obj.getZoomForResolution(parseFloat(map_y / div_y));
		obj.zoom = parseFloat(Math.min(zoom_x, zoom_y)).toFixed(2);
	} else {
		obj.zoom = parseFloat(map_zoom);
	}
	// 如果中心视点为空
	let center_x, center_y, times_drag;
	if (x === null) {
		// 以地图文件的坐标系为原点算出地图文件的中心视点的x值
		center_x = parseFloat(
			((parseFloat(extend[2]) - parseFloat(extend[0])) / 2 + parseFloat(extend[0])).toFixed(2)
		);
	} else {
		center_x = parseFloat(x);
	}
	if (y === null) {
		// 以地图文件的坐标系为原点算出地图文件的中心视点的y值
		center_y = parseFloat(
			((parseFloat(extend[3]) - parseFloat(extend[1])) / 2 + parseFloat(extend[1])).toFixed(2)
		);
	} else {
		center_y = parseFloat(y);
	}
	obj.center = [center_x, center_y];
	// 如果拖拽倍数为空
	if (times === null || times <= 0) {
		// 拖拽倍数设为1
		times_drag = 1;
	} else {
		times_drag = parseFloat(times);
	}
	// 计算出限制地图离中心视点拖拽的距离(地图文件宽和高的times_drag倍)的坐标
	const extent = [
		center_x - times_drag * Math.abs(parseFloat(extend[2]) - parseFloat(extend[0])),
		center_y - times_drag * Math.abs(parseFloat(extend[3]) - parseFloat(extend[1])),
		center_x + times_drag * Math.abs(parseFloat(extend[2]) - parseFloat(extend[0])),
		center_y + times_drag * Math.abs(parseFloat(extend[3]) - parseFloat(extend[1])),
	];
	obj.extent = extent;
	return obj;
}

// 获得icon_scale和text_scale
export function getScaleParam(min_icon, max_icon, min_zoom, max_zoom) {
	const x_s = (73 - max_zoom) * min_icon - (73 - min_zoom) * max_icon;
	const x = (min_icon - max_icon) / x_s;
	const y_s = 1 - (73 - max_zoom) * x;
	const y = max_icon / y_s;
	return function (zoom) {
		const icon = (x_s === 0 || y_s === 0) ? max_icon : ((1 - (73 - parseFloat(zoom)) * x) * y);
		const text = (x_s === 0 || y_s === 0) ? 1 : (1 + (parseFloat(zoom) - max_zoom) * x);
		const offset_y = -(80 * icon + 20 * text + 5);
		return {icon, text, offset_y};
	};
}

// 区域点字符串和区域点数组的互相转换
export function stringAndArrayTransform(value, dimension = "two") {
	checkRequiredParameters([value]);

	if (typeof value === "string") {
		const points = [];
		const string_array = value.split(" ");
		for (const coord of string_array) {
			const [x, y] = coord.split(",");
			if (dimension === "two") {
				points.push([parseFloat(x), parseFloat(y)]);
			} else {
				points.push({x: parseFloat(x), y: parseFloat(y)});
			}
		}
		return points;
	} else {
		const array_change = value.map((item) => item.join(","));
		return array_change.join(" ");
	}
}

// 移动2D地图视角至区域中心位置
export function moveViewToArea(points, div_x, div_y) {
	checkRequiredParameters([points, div_x, div_y]);

	let x = 0, y = 0;
	const array_x = [], array_y = [];

	for (const i in points) {
		x += points[i][0];
		y += points[i][1];
		array_x.push(points[i][0]);
		array_y.push(points[i][1]);
	}
	const area_width = Math.max.apply(null, array_x) - Math.min.apply(null, array_x);
	const area_height = Math.max.apply(null, array_y) - Math.min.apply(null, array_y);
	const resolution = (area_width > area_height ? area_width / div_x : area_height / div_y) * 4;
	x = x / points.length;
	y = y / points.length;

	const area_obj = {
		center: [x, y],
		resolution: resolution
	};
	return area_obj;
}

/**
 * 获取第一张有效的地图
 */
export function getFirstValidFloorOption(floor_all_options) {
	const valid_map = [];
	const isValid = node => !!node.is_file;

	const findValidItem = (nodes) => {
		return nodes.find(isValid);
	};

	floor_all_options.find(scene => {
		const buildings = scene.node;
		if (Array.isArray(buildings)) {
			buildings.find(building => {
				const floors = building.node;
				let valid_floor;
				if (Array.isArray(floors)) {
					valid_floor = findValidItem(floors);
				}
				if (valid_floor) {
					return valid_map.unshift(scene, building, valid_floor);
				} else if (isValid(building)) {
					return valid_map.unshift(scene, building);
				}
				return false;
			});
		}
		if (!valid_map.length) {
			if (isValid(scene)) {
				valid_map.unshift(scene);
			}
		}
		return valid_map.length;
	});
	return valid_map.length ? valid_map : null;
}

/**
 * @params {number | Array<number>} types{0陌生卡 1人员 2车辆 3访客 4车辆副卡}
 */
export function filterSpecifyTypeCard(cards, types) {
	const keys = Object.keys(cards);
	const cardInfoData = cards instanceof Array ? [] : {};

	if (typeof types === "number") {
		types = [types];
	}

	for (const key of keys) {
		if (!types.includes(cards[key].utype)) {
			cardInfoData[key] = cards[key];
		}
	}
	return cardInfoData;
}

export function getMaxAndMinZoom(zoom_factor, now_zoom, min_value, max_value) {
	const view_obj = new view({zoomFactor: zoom_factor});
	let min_zoom = now_zoom - Math.ceil(Math.log(100 / min_value) / Math.log(zoom_factor));
	const max_zoom = Math.ceil(view_obj.getZoomForResolution(max_value / 80));
	let zoom = now_zoom;
	if (max_zoom <= min_zoom) {
		min_zoom = max_zoom;
		zoom = max_zoom;
		Notification({
			title: "警告",
			type: "warning",
			message: "当前地图最大最小尺寸配置异常"
		});
	}
	return {min_zoom, max_zoom, zoom};
}

export const UNKNOWNS = 0, UTYPE_PERSON = 1, UTYPE_CAR = 2, UTYPE_VISITOR = 3, UTYPE_SECONDARY_CAR = 4;

// 根据文件后缀名获取对应2D type类型
export function getMapTypeByPostfix(postfix) {
	switch (postfix) {
	case "kml":
		return map_type.KML;
	case "json":
		return map_type.GEOJSON;
	case "jpg":
	case "png":
		return map_type.IMAGE;
	default:
		throw new Error("Unknown file type", postfix);
	}
}

// 根据场景名，建筑名和楼层名，拼接完整所在地图内容
export function sliceSceneBuildingFloor(scene, building, floor) {
	let result = "";
	if (scene) {
		result += `${scene}-`;
	}
	if (building) {
		result += `${building}-`;
	}
	if (floor) {
		result += floor;
	}
	return result;
}
