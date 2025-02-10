import request from "@/utils/js/request";
import type {Response, AreaType} from "@/types/global";
import {type ALARM_TYPE, type ALARM_LEVEL, type ApplicableObjects, ALARM_CATEGORY} from "@/types/alarm";
import type {UTYPES, DEVICE_TYPE} from "@/utils/js/constant";

export interface AlarmAreaParams {
    query_way: number,
	order_area: any[],
	order_alarm_num?: {field: string, order: "asc" | "desc"},
	begin: number,
	end: number,
	rule_type_list?: number[],
	filter_zero?: number
}

export interface TileRow {
    id: number,
    pid: number,
    name: string,
    alarm_object: {
        all_total: number,
        all_untreated: number,
		location_object_total: number,
		location_object_untreated: number,
		area_total: number,
		area_untreated: number,
        sos_total: number,
        sos_untreated: number,
        device_total: number,
        device_untreated: number,
		accident_total: number,
		accident_untreated: number,
        health_total: number,
        health_untreated: number
    }
}
export interface TreeRow extends TileRow {
    node?: TreeRow[]
}

/** 当日报警区域统计 */
export const getDayAlarmByArea = (data: AlarmAreaParams): Response<TreeRow[]> => request({
	url: "/EHCommon/homepage/DataStatisticsDayAlarm/getDayAlarmByArea",
	method: "post",
	data
});

export interface DayAlarmResult {
    name: string,
    total: number,
    untreated: number,
    type: number
}

/** 当日报警统计 */
export const getDayAlarm = (): Response<DayAlarmResult[]> => request({
	url: "/EHCommon/homepage/DataStatisticsDayAlarm/getDayAlarm",
	method: "post"
});

export interface AlarmTypeDetailParams {
	begin: number,
	end: number,
	rule_type_list: number[],
	category: number, // 1-全部，2-sos，3-定位对象，4-区域，5-设备，6-事故，7-巡检，8-点名，9-健康
	page?: number,
	limit?: number
}
export interface AlarmTypeDetailResult {
    id: number,
	rule_name: string,
	rule_type: ALARM_TYPE,
	rule_type_name: string,
	level: ALARM_LEVEL,
	name: string,
	uuid: number | string,
	utype: UTYPES | null,
	device_type: DEVICE_TYPE | null,
	card_id: number,
	related_info: null | string | {status: 1 | 2, executor_uuid: number, executor_name: string, applicable_objects: ApplicableObjects},
	time: number,
	alarm_manual_handling_setting: 0 | 1, // 0-处理内容非必填，1-处理内容必填
	areas: {
		scene_id: number,
		scene_name: string,
		area_id: number,
		area_name: string,
		type: AreaType,
		group_id: number,
		group_name: string
	}[],
}
export const GET_DAY_DYNAMICS_CATEGORY = {
	all: 1,
	[ALARM_CATEGORY.sos]: 2,
	[ALARM_CATEGORY.tag]: 3,
	[ALARM_CATEGORY.area]: 4,
	[ALARM_CATEGORY.device]: 5,
	[ALARM_CATEGORY.accident]: 6,
	[ALARM_CATEGORY.patrol]: 7,
	[ALARM_CATEGORY.call]: 8,
	[ALARM_CATEGORY.healthy]: 9
};
export const getDayDynamics = (data: AlarmTypeDetailParams, signal?: AbortSignal): Response<{count: number, data: AlarmTypeDetailResult[]}> => request({
	url: "/EHCommon/homepage/DataStatisticsDayAlarm/getDayDynamics",
	method: "post",
	data,
	signal
});
