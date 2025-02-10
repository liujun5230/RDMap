import {Notification} from "element-ui";
import {getDeviceInfo} from "@/api/deviceManage/info";
import {base_url, base_station_info, session_storage_user_info_key} from "@/Config";
import InfoCardAvatarPlaceholder from "@/assets/images/common/default2.png";
import {UTYPES} from "@/utils/js/constant";

import {useDetailDialogStore} from "@index/store";

import {FeatureType} from "./constant";

export function closeDetailDialog() {
	useDetailDialogStore().closeAllDialog();
}

export function getSearchTimeString() {
	const now_time = new Date();

	const end = now_time.getFullYear() + "/" + transNumLessTen(now_time.getMonth() * 1 + 1) + "/" + transNumLessTen(now_time.getDate()) + " " + "23:59:59";
	const start = now_time.getFullYear() + "/" + transNumLessTen(now_time.getMonth() * 1 + 1) + "/" + transNumLessTen(now_time.getDate()) + " " + "00:00:00";
	return {
		start: start,
		end: end
	};
}

export function timeStampToString(str) {
	const time = new Date(parseInt(str));
	const year = time.getFullYear();
	const month = transNumLessTen(time.getMonth() * 1 + 1);
	const day = transNumLessTen(time.getDate());
	const hour = transNumLessTen(time.getHours());
	const minutes = transNumLessTen(time.getMinutes());
	const second = transNumLessTen(time.getSeconds());

	return year + "/" + month + "/" + day + " " + hour + ":" + minutes + ":" + second;
}

export function getSearchTimeStamp(value) {
	if (Date.parse(new Date(value))) {
		return Date.parse(new Date(value)) / 1000;
	} else {
		return undefined;
	}
}

export function getTimeLength(str) {
	const time = Math.trunc(parseInt(str) / 1000);
	const seconds = transNumLessTen(time % 60);
	const minutes = transNumLessTen(Math.trunc(time / 60) % 60);
	const hours = transNumLessTen(Math.trunc(time / 3600));
	return hours + ":" + minutes + ":" + seconds;
}

export function sliceStringByLength(string, length) {
	if (!string) {
		return "--";
	} else if (string.length > length) {
		return string.slice(0, length) + "...";
	} else {
		return string;
	}
}

export function transTimeToSecond(date) {
	return parseInt(Date.parse(date) / 1000);
}

function transNumLessTen(str) {
	return ("0" + str).slice(-2);
}

export function mapAutomaticSetting(map_zoom, x, y, times, extend, map_div) {
	const obj = {};
	// 如果缩放比为空
	if (map_zoom == null) {
		const map_x = parseFloat(
			Math.abs(parseFloat(extend[2]) - parseFloat(extend[0]))
		); // 得到地图文件的宽
		const map_y = parseFloat(
			Math.abs(parseFloat(extend[3]) - parseFloat(extend[0]))
		); // 得到地图文件的高
		const div_x = parseFloat(document.getElementById(map_div).clientWidth); // 得到显示地图的div的宽
		const div_y = parseFloat(document.getElementById(map_div).clientHeight); // 得到显示地图的div的高
		const max_x = parseFloat(div_x / (map_x * 45)); // 当缩放比为60时，地图1m对应像素值45px,当缩放比加1，对应像素值增加1.3倍。max_x为对应像素值还需要增加或减少多少倍才能等于div的宽度
		const max_y = parseFloat(div_y / (map_y * 45)); // max_y 同理max_x
		const zoom_x = Math.log(max_x) / Math.log(1.3); // 求出地图宽的对应像素值需要增加或减少的倍数值,1.3为地图的缩放比系数zoom_factor,详情可参考2dSDK文档
		const zoom_y = Math.log(max_y) / Math.log(1.3); // 高与宽同理
		obj.zoom = parseFloat(60 + Math.min(zoom_x, zoom_y)).toFixed(2); // 40加上或减去倍数，就是最合适的缩放比
	} else {
		obj.zoom = parseFloat(map_zoom);
	}
	// 如果中心视点为空
	let center_x, center_y, times_drag;
	if (x == null) {
		// 以地图文件的坐标系为原点算出地图文件的中心视点的x值
		center_x = parseFloat(
			(
				(parseFloat(extend[2]) - parseFloat(extend[0])) / 2
				+ parseFloat(extend[0])
			).toFixed(2)
		);
	} else {
		center_x = parseFloat(x);
	}
	if (y == null) {
		// 以地图文件的坐标系为原点算出地图文件的中心视点的y值
		center_y = parseFloat(
			(
				(parseFloat(extend[3]) - parseFloat(extend[1])) / 2
				+ parseFloat(extend[1])
			).toFixed(2)
		);
	} else {
		center_y = parseFloat(y);
	}
	obj.center = [center_x, center_y];
	// 如果拖拽倍数为空
	if (times == null || times <= 0) {
		// 拖拽倍数设为1
		times_drag = 1;
	} else {
		times_drag = parseFloat(times);
	}
	// 计算出限制地图离中心视点拖拽的距离(地图文件宽和高的times_drag倍)的坐标
	const extent = [
		center_x
		- times_drag * Math.abs(parseFloat(extend[2]) - parseFloat(extend[0])),
		center_y
		- times_drag * Math.abs(parseFloat(extend[3]) - parseFloat(extend[1])),
		center_x
		+ times_drag * Math.abs(parseFloat(extend[2]) - parseFloat(extend[0])),
		center_y
		+ times_drag * Math.abs(parseFloat(extend[3]) - parseFloat(extend[1]))
	];
	obj.extent = extent;
	return obj;
}

function zeroFillHex(num, digits) {
	let s = num.toString(16);
	while (s.length < digits) s = "0" + s;
	return s;
}

// 十六进制颜色值的正则表达式
export function rgbToHex(rgb) {
	if (rgb.charAt(0) === "#") {
		return rgb;
	}
	const ds = rgb.split(/\D+/);
	const decimal = Number(ds[1]) * 65536 + Number(ds[2]) * 256 + Number(ds[3]);
	return "#" + zeroFillHex(decimal, 6);
}

export function fromIntGetDex(value) {
	return "0x" + parseInt(value).toString(16).toUpperCase();
}

export function moveViewToArea(points) {
	let x = 0,
		y = 0;
	for (const i in points) {
		x += points[i][0];
		y += points[i][1];
	}
	x = x / points.length;
	y = y / points.length;

	return [x, y];
}

/**
 *  二分查找优化 找到数组中最接近target值的一项
 *
 * @param {目标数据,里面是对象形式} arr
 * @param {要查找对象里面的键值} key
 * @param {目标值} target
 * @returns 符合条件的下标
 */
export function findNearestTargetNum(arr, key, target) {
	let mid;
	let l = 0;
	let r = arr.length - 1;
	// 保证指针最终停留在相邻的两个数,所以这里是判断是否大于1
	while (r - l > 1) {
		mid = Math.floor((l + r) / 2);
		const mid_val = arr[mid][key];
		if (target === mid_val) {
			return {idx: mid, val: mid_val};
		}
		// 如果目标数比中间小，所以范围在左边
		if (target < mid_val) {
			r = mid;
		} else {
			l = mid;
		}
	}

	// 最后优先找到和target秒级相同的时间点，如果两个点和target秒级都不相同或者都相同则找差值最小的时间点
	const target_seconds = Math.floor(target / 1000) * 1000;
	const left_val = arr[l][key];
	const left_seconds = Math.floor(left_val / 1000) * 1000;
	const right_val = arr[r][key];
	const right_seconds = Math.floor(right_val / 1000) * 1000;
	if (left_seconds === target_seconds && right_seconds !== target_seconds) {
		return {idx: l, val: left_val};
	} else if (left_seconds !== target_seconds && right_seconds === target_seconds) {
		return {idx: r, val: right_val};
	} else {
		return Math.abs(target - left_val) <= Math.abs(target - right_val) ? {idx: l, val: left_val} : {
			idx: r,
			val: right_val
		};
	}
}

/**
 * 接口错误反馈
 * @param {string | undefined} result 服务器返回的错误提示，undefined 表示服务器未响应
 */
export function requestErrorNotify(result) {
	return Notification({type: "error", title: "错误", message: result || "服务器未响应"});
}

/**
 * 获取楼层的基站数据
 * @param {object} floor_data 楼层数据
 */
export async function fetchBaseStationData(floor_data) {
	if (!floor_data) return Promise.reject();
	const {data: res} = await getDeviceInfo({floor_id_list: [floor_data.id], type_id_list: [5]}).catch(() => ({}));
	if (res?.type === 1) {
		return res.result.data;
	} else {
		requestErrorNotify(res.result);
		return [];
	}
}

/**
 * 设置详情框内容
 * @param {object} data 内容数据
 * @param {number} card_num 回放时的卡号
 * @param {"person" | "visitor" | "car" | "material" | "station"} type 详情框的类型
 */
export function setInfoCardContent(data, card_num, type) {
	if (!data) return;
	const {
		uuid = "--",
		picture,
		photo,
		name = "--",
		branch_name = "--",
		unit = "--",
		company = "--",
		driver = "--",
		licence = "--",
		serial_num = "--",
		sn_type,
		device_no = "--",
		device_uuid,
		type_name = "--",
		reading,
		status,
		id
	} = data;

	const avatar = picture ? `${base_url}${picture}` : InfoCardAvatarPlaceholder;
	if (type === FeatureType.PERSON) {
		return {type: FeatureType.PERSON, uuid, avatar, name, card_num, unit: branch_name, utype: UTYPES.PERSON};
	} else if (type === FeatureType.VISITOR) {
		return {type: FeatureType.VISITOR, uuid, avatar, name, card_num, unit: company, utype: UTYPES.VISITOR};
	} else if (type === FeatureType.CAR) {
		return {type: FeatureType.CAR, uuid, avatar, name: driver, card_num, unit, licence, type_name, utype: UTYPES.CAR};
	} else if (type === FeatureType.MATERIAL) {
		return {type: FeatureType.MATERIAL, uuid, avatar: picture || InfoCardAvatarPlaceholder, card_num, name, serial_num, utype: UTYPES.MATERIAL};
	} else if (type === FeatureType.CONTRACTOR) {
		return {type: FeatureType.CONTRACTOR, uuid, avatar: photo || InfoCardAvatarPlaceholder, card_num, name, utype: UTYPES.CONTRACTOR};
	} else if (type === FeatureType.BASE_STATION) {
		let station_type = "";
		if (["D17", "D19"].includes(sn_type)) {
			station_type = base_station_info[sn_type]?.name;
		} else {
			const base_station_type = reading.basestation_type;
			const suffix = [6, 7].includes(base_station_type) ? "(D38)" : "";
			station_type = `${base_station_info[reading.basestation_type]?.name}${suffix}`;
		}
		return {
			type: FeatureType.BASE_STATION,
			name,
			status: status === 1 ? "在线" : "离线",
			station_id: device_no,
			station_type,
			device_uuid
		};
	} else if (type === FeatureType.PATROL_POINT) {
		return {type: FeatureType.PATROL_POINT, card_num, patrol_point_id: id};
	} else {
		return {};
	}
}

/**
 * 从浏览器 Storage 中读取 map-tool 中的设置
 */
export function getCheckedSettingStorage() {
	const user = JSON.parse(window.localStorage.getItem(session_storage_user_info_key));
	if (!user?.username || !window.localStorage.getItem(`${user.username}_history`)) {
		return [];
	}
	return [...JSON.parse(window.localStorage.getItem(`${user.username}_history`))];
}

/**
 * 把 map-tool 中的设置内容保存到 Storage 中
 * @param {any[]} checked_setting 设置内容值
 */
export function updateCheckedSettingStorage(checked_setting) {
	const user = JSON.parse(window.localStorage.getItem(session_storage_user_info_key));
	if (!user) return;
	window.localStorage.setItem(`${user.username}_history`, JSON.stringify(checked_setting));
}

/**
 * 生成每个uuid对应的轨迹线
 * @param {*} history_data
 * @param {*} is_2d
 */
export function groupHistoryTrajectory(history_data, is_2d) {
	const group_uuid = new Map();
	for (const item of (history_data || [])) {
		const {card_x, card_y, card_z, uuid} = item;
		const trajectory_data = group_uuid.get(uuid);
		if (!trajectory_data) {
			group_uuid.set(uuid, is_2d ? {coords: [[card_x, card_y]], list: [item]} : {coords: [{x: card_x, y: card_y, z: card_z}], list: [item]});
		} else {
			if (is_2d) {
				trajectory_data.coords.push([card_x, card_y]);
			} else {
				trajectory_data.coords.push({x: card_x, y: card_y, z: card_z});
			}
			trajectory_data.list.push(item);
			group_uuid.set(uuid, trajectory_data);
		}
	}
	return group_uuid;
}

export const resolvePosition = (position) => {
	if (!position) return;
	const {x, y, z} = position;
	return {
		x: parseFloat(x),
		y: parseFloat(y),
		z: parseFloat(z)
	};
};

export const resolveCameraParams = (camera_params) => {
	if (!camera_params) return;
	const {camera_position, target_position} = camera_params;
	return {
		camera_position: resolvePosition(camera_position),
		target_position: resolvePosition(target_position)
	};
};

export const getBuildingIconScale = (z) => {
	let scale = (1 - z) / (1 - 0.99990);
	if (scale >= 1) scale = 1;
	return scale;
};

export const getInitBuildingStatisticsData = (building_floor_list) => {
	const data = building_floor_list.reduce((result, item) => {
		result[item.id] = {
			id: item.id,
			name: item.name,
			stat: {
				[UTYPES.PERSON]: {label: "员工", value: 0},
				[UTYPES.CAR]: {label: "车辆", value: 0},
				[UTYPES.VISITOR]: {label: "访客", value: 0},
				[UTYPES.MATERIAL]: {label: "物资", value: 0},
				[UTYPES.CONTRACTOR]: {label: "承包商", value: 0}
			}
		};
		return result;
	}, {});
	return data;
};
