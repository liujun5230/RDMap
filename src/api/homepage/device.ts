import request from "@/utils/js/request";
import {LIGHT} from "@/utils/js/constant";
import type {Response} from "@/types/global";
import type {IconModelAttr} from "@/types/map";

export interface OnlineDeviceResult {
    name: string,
    online: number,
    total: number,
	type: string
}

export const getOnlineDevice = (): Response<OnlineDeviceResult[]> => request({
	url: "/EHCommon/homepage/DataStatisticsOther/getOnlineDevice",
	method: "post"
});

export interface BaseDeviceDetailResult {
	photo: string;
	name: string;
    type: string;
	floor_id: number;
	status: number,
	floor: string;
	areas: {
		area_id: number,
		area_name: string,
		group_id: number,
		group_name: string
	}[],
	x: number;
	y: number;
	z: number;
	bs_addr: string
    device_id?: string;
    id?: string;
    device_type?: string,
    power_name?: string,
    work_mode?: string,
    power?: string,
	icon_model_attr?: IconModelAttr
}

export interface StationDetailParams {
    device_uuid: string
}
/** 基站单详情 */
export const getStationDetail = (data: StationDetailParams): Response<BaseDeviceDetailResult> => request({
	url: "/EHCommon/homepage/WindowDetail/stationDetail",
	method: "post",
	data
});

/** 唯一性检测门单详情 */
export const getDoorDetail = (data: StationDetailParams): Response<BaseDeviceDetailResult> => request({
	url: "/EHCommon/homepage/WindowDetail/detectionDetail",
	method: "post",
	data
});

/** 电源单详情 */
export const getPowerDetail = (data: StationDetailParams): Response<BaseDeviceDetailResult> => request({
	url: "/EHCommon/homepage/WindowDetail/powerDetail",
	method: "post",
	data
});

/** 交换机单详情 */
export const getSwitchDetail = (data: StationDetailParams): Response<BaseDeviceDetailResult> => request({
	url: "/EHCommon/homepage/WindowDetail/switchDetail",
	method: "post",
	data
});

/**
 * 智能发卡一体机单详情
 */
export const getMachineDetail = (data: StationDetailParams): Response<BaseDeviceDetailResult> => request({
	url: "/EHCommon/homepage/WindowDetail/smartCardDetail",
	method: "post",
	data
});

export interface CameraDetailParams {
    device_id: number
}
export interface CameraDetailResult extends BaseDeviceDetailResult {
    device_id: string,
	device_no: string, // 设备ID
    ip: string,
    port: string,
    rtsp_url: string,
    user: string,
    password: string,
    with_ptz: number,
	online: boolean
}
/** 摄像头单详情 */
export const getCameraDetail = (data: CameraDetailParams): Response<CameraDetailResult> => request({
	url: "/EHCommon/homepage/WindowDetail/cameraDetail",
	method: "post",
	data
});

export interface PatrolDetailParams {
    id: number
}
export interface PatrolDetailResult {
    id: number;
	name: string;
	floor_id: number;
	x: number;
	y: number;
	distance: number;
	route: string;
}
/** 巡检点详情 */
export const getPatrolDetail = (data: PatrolDetailParams): Response<PatrolDetailResult> => request({
	url: "/EHCommon/homepage/WindowDetail/patrolPointDetail",
	method: "post",
	data
});

/** 声光报警器详情 */
export const getVoiceLightDetail = (data: {device_uuid: string}): Response<BaseDeviceDetailResult> => request({
	url: "/EHCommon/homepage/WindowDetail/voiceLightDetail",
	method: "post",
	data
});

export interface TrafficLightRuleRow {
	index: number,
	rule_index: number, // 单灯控制规则id,
	rule_name: string,
	left_light: LIGHT,
	straight_light: LIGHT,
	right_light: LIGHT,
	effective_time: string,
	begin: number,
	end: number
}

export interface TrafficLightDetailResult {
	device_id: string,
	photo: string,
	name: string,
	type: string,
	status: 0 | 1,
	floor: string,
	floor_id: number,
	areas: {
		area_id: number,
		area_name: string,
		group_id: number,
		group_name: string
	}[],
	x: number,
	y: number,
	z: number,
	left_light: LIGHT,
	straight_light: LIGHT,
	right_light: LIGHT,
	left_light_status: 0 | 1,
	straight_light_status: 0 | 1,
	right_light_status: 0 | 1,
	bs_addr: number | string,
	rules: TrafficLightRuleRow[],
}
export const getTrafficLightDetail = (data: {device_uuid: string}): Response<TrafficLightDetailResult> => request({
	url: "/EHCommon/homepage/WindowDetail/trafficLightDetail",
	method: "post",
	data
});
