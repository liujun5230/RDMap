import request from "@/utils/js/request";
import type {Response} from "@/types/global";

import type {HistoryListRow} from "./history";

/**
 * 一张图下的记录
 */
export const getHistoryRecord = (data: {begin: number, end: number, uuid_list: number[]}): Response<HistoryListRow[]> => request({
	url: "/EHCommon/history/scene/getRecord",
	method: "post",
	data
});

/**
 * 一张图下的记录（30分钟）
 */
export const getHistoryRecordLimit = (data: {begin: number, end: number, uuid_list: number[]}): Response<HistoryListRow[]> => request({
	url: "/EHCommon/history/scene/getRecordLimit",
	method: "post",
	data
});

export type TimeLineResult = {
	location_objects: {
		card_id: number,
		uuid: number,
		name: string
	}[],
	timeline_list: {
		time: number,
		type: number,
		name_list: string[],
		description_list: string[]
	}[]
}
export const getHistoryTimeLine = (data: {
	scene_id?: number,
	floor_id?: number,
	order?: "asc" | "desc",
	begin: number,
	end: number,
	uuid_list: number[]
}): Response<TimeLineResult> => request({
	url: "/EHCommon/history/scene/getTimeLine",
	method: "post",
	data
});
