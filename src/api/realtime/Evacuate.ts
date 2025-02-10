import request from "@/utils/js/request";
import type {Response, TableAreaItem} from "@/types/global";
import type {UTYPES} from "@/utils/js/constant";

export function getSecurityAreaRuleCard(data: unknown) {
	return request({
		url: "/EHCommon/realtime/Evacuate/getSecurityAreaRuleCard",
		method: "post",
		data,
	});
}

export interface GetEvacuateObjParams {
	record_id: number,
	/** 1-事故区域，2-疏散区域，3-安全岛 */
	evacuate_type?: 1 | 2 | 3,
	utype?: number,
	area_id?: number,
	field?: string,
	order?: string,
	page?: number,
	limit?: number,
}
export interface GetEvacuateObjRow {
	id: number,
	record_id: number,
	utype: UTYPES,
	uuid: number,
	name: string,
	licence: string,
	serial_num: string,
	card_id: number,
	leave_time: number,
	arrive_at_time: number,
	stay_time: number,
	in_area_time: number,
	areas: TableAreaItem[]
	related_info?: string,
	branch_name?: string,
	branch_id?: number,
	job_num?: string,
	type_name?: string,
	type?: number,
	unit_name?: string,
	unit_id?: number,
	company?: string
}
export function getEvacuateObj(data: GetEvacuateObjParams): Response<{
	all: {count: number, data: GetEvacuateObjRow[]},
	person: {count: number, data: GetEvacuateObjRow[]},
	visitor: {count: number, data: GetEvacuateObjRow[]},
	truck: {count: number, data: GetEvacuateObjRow[]},
	material: {count: number, data: GetEvacuateObjRow[]},
	contractor: {count: number, data: GetEvacuateObjRow[]},
}> {
	return request({
		url: "/EHCommon/realtime/Evacuate/getEvacuateObj",
		method: "post",
		data
	});
}

export function getEvacuateRecordId(): Response<{id: number}> {
	return request({
		url: "/EHCommon/realtime/Evacuate/getEvacuateRecordId",
		method: "post",
	});
}
