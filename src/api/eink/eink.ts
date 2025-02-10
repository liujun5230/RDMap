import request from "@/utils/js/request";
import type {Response, AreaSelectData, TableAreaItem} from "@/types/global";

import {UTYPES} from "@/views/messagePush/common/constant";

export interface PushMessageApiParams {
	utype: UTYPES,
	branch_id: number,
	person_class_id: number,
	truck_type_id: number,
	material_type_id: number,
	scene_id: number,
	building_id: number,
	floor_id: number,
	areas: AreaSelectData,
	person_name: string,
	visitor_name: string,
	licence: string,
	driver: string,
	serial_num: string,
	material_name: string,
	card_id: number,
	order: "ASC" | "DESC",
	field: string,
	page: number,
	limit: number
}
export interface PushMessageApiRow {
	uuid: number,
	utype: UTYPES,
	card_id: number,
	scene_id: number,
	building_id: number,
	floor_id: number,
	scene_name: string,
	floor_name: string,
	build_name: string,
	map: string,
	name: string,
	utype_name: string,
	related_info: string,
	ready: 0 | 1,
	show_area: string,
	areas: TableAreaItem
}
export function getEinkInfo(data: PushMessageApiParams): Response<{count: number, data: PushMessageApiRow[]}> {
	return request({
		url: "/EHCommon/eink/eink/getEinkCard",
		method: "post",
		data
	});
}

export interface PublishEinkApiParams {
	type: 0 | 1,
	message: string,
	card_id_list: number[],
	time?: number,
	shake?: 0 | 1,
	voice?: 0 | 1
}
export function publishEink(data: PublishEinkApiParams): Response<string> {
	return request({
		url: "/EHCommon/eink/eink/publishEink",
		method: "post",
		data
	});
}

export type PublishAllEinkApiParams = Omit<PublishEinkApiParams, "card_id_list"> & Omit<PushMessageApiParams, "page" | "limit" | "order" | "field">
export function publishAllEink(data: PublishAllEinkApiParams): Response<string> {
	return request({
		url: "/EHCommon/eink/eink/publishAllEink",
		method: "post",
		data
	});
}
