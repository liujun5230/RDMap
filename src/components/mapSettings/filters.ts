import type {ComputedRef} from "vue";

import {BS_TYPE} from "@/views/index/utils/types";

import type {MapSetting} from "./defaultValueConfig";

export type Filter<T> = (data: T) => boolean

// 区域类型1普通,2考勤区域,3电子点名区域,9第一区域,10第二区域,11摄像机区域,12巡检点区域,13障碍物区域,14活动区域,15盲区
export const enum AreaType {
	Normal = 1,
	Attendance = 2,
	Sign = 3,
	First = 9,
	Second = 10,
	Camera = 11,
	Inspection = 12,
	Obstacle = 13,
	Activity = 14,
	Blind = 15
}

export type Area =
|	{ type: AreaType, id: string } & {[key: string]: any}
| { type: AreaType.Second | AreaType.First, area_id: number} & {[key: string]: any}

export const area_filter = (data: Area, map_setting: ComputedRef<MapSetting>) => {
	return map_setting.value.area_id_list.includes(data.area_id ?? data.id);
};

export type BaseStation = {
	reading: {
		basestation_type: BS_TYPE;
	},
	[key: string]: any;
}

export const bs_filter = (data: BaseStation, map_setting:ComputedRef<MapSetting>) => {
	return map_setting.value.bs_type_list.includes(data.reading.basestation_type);
};

export function createAreaFilter<T extends Area>(map_setting: ComputedRef<MapSetting>): Filter<T> {
	return (data: T) => area_filter(data, map_setting);
}

export function createBaseStationFilter<T extends BaseStation>(map_setting: ComputedRef<MapSetting>): Filter<T> {
	return (data: T) => bs_filter(data, map_setting);
}

export const MAP_MAX_LABEL_LENGTH = 54;
export const BASE_STATION = "base_station"; // 基站
export const CAMERA = "camera"; // 摄像头
export const DEVICE = "device"; // 设备
/**
 * Truncates a text if it exceeds the maximum length and adds ellipsis at the end.
 * @param {string} text - The text to truncate.
 * @param {number} max_length - The maximum length of the truncated text.
 * @returns {string} The truncated text with ellipsis if necessary.
 */
export const getTextOverflow = (text: string, max_length: number) => {
	if (text.length > max_length) {
		return text.slice(0, max_length) + "...";
	}
	return text;
};

// 获取设备显示Label内容 设备名称 设备ID
type Device = {
	name: string;
	device_no: string;
	type: typeof DEVICE
}

type Camera = {
	name: string;
	id: string;
	type: typeof CAMERA
}

export function createDeviceLabelGenerator(map_setting_store: ComputedRef<MapSetting>) {
	return (data: Device | Camera) => {
		let device_id;
		if (data.type === CAMERA) {
			device_id = data.id;
		} else {
			device_id = data.device_no;
		}
		const labels = [];
		if (map_setting_store.value.device_base_field.includes("name")) {
			labels.push(data.name);
		}
		if (map_setting_store.value.device_base_field.includes("device_id")) {
			labels.push(device_id);
		}

		const label = labels.join("-");
		return getTextOverflow(label, MAP_MAX_LABEL_LENGTH);
	};
}
