import request from "@/utils/js/request";
import type {EHCommonResponse} from "@/types/request";

// 获取全部上下井记录
export function getPitRecordPrimitive(data: any) {
	return request({
		url: "/EHCommon/pit/pitRecord/getPitRecordPrimitive",
		method: "post",
		data
	});
}

// 按天查询上下井记录
export function getDayPitRecord(data: any) {
	return request({
		url: "/EHCommon/pit/pitRecord/getDayPitRecord",
		method: "post",
		data
	});
}

// 按月查询上下井记录
export function getMonthPitRecord(data: any) {
	return request({
		url: "/EHCommon/pit/pitRecord/getMonthPitRecord",
		method: "post",
		data
	});
}

// 按周查询上下井记录
export function getWeekPitRecord(data: any) {
	return request({
		url: "/EHCommon/pit/pitRecord/getWeekPitRecord",
		method: "post",
		data
	});
}

// 按次查询
export function getTimesPitRecord(data: any) {
	return request({
		url: "/EHCommon/pit/pitRecord/getRecord",
		method: "post",
		data
	});
}

// 详情查看
export function getPitRecordDetail(data: any) {
	return request({
		url: "/EHCommon/pit/pitRecord/getPitRecordDetail",
		method: "post",
		data
	});
}

// 获取按天统计的上下井筛选条件
export function getUpDownPitStatusForDay(data: any) {
	return request({
		url: "/EHCommon/pit/pitRecord/getUpDownPitStatusForDay",
		method: "post",
		data
	});
}

// 获取全部统计的上下井筛选条件
export function getUpDownPitStatusForAll(data: any) {
	return request({
		url: "/EHCommon/pit/pitRecord/getUpDownPitStatusForAll",
		method: "post",
		data
	});
}

// 设置离开井下区域时间
export function leaveUpDownArea(data: any) {
	return request({
		url: "/EHCommon/pit/pitRecord/leaveUpDownArea",
		method: "post",
		data
	});
}

// 设置进入井下时间
export function inUpDownArea(data: any) {
	return request({
		url: "/EHCommon/pit/pitRecord/inUpDownArea",
		method: "post",
		data
	});
}

export function getRecordNum(data: any) {
	return request({
		url: "/EHCommon/pit/pitRecord/getRecordNum",
		method: "post",
		data
	});
}

export function getRecordByPerson(data: any) {
	return request({
		url: "/EHCommon/pit/pitRecord/getRecordByPerson",
		method: "post",
		data
	});
}

export function getRecordByVisitor(data: any) {
	return request({
		url: "/EHCommon/pit/pitRecord/getRecordByVisitor",
		method: "post",
		data
	});
}

export function getRecordByContractor(data: any) {
	return request({
		url: "/EHCommon/pit/pitRecord/getRecordByContractor",
		method: "post",
		data
	});
}

export function getRecordByTruck(data: any) {
	return request({
		url: "/EHCommon/pit/pitRecord/getRecordByTruck",
		method: "post",
		data
	});
}

export function getRecordByMaterial(data: any) {
	return request({
		url: "/EHCommon/pit/pitRecord/getRecordByMaterial",
		method: "post",
		data
	});
}

export function getValidScene() {
	return request({
		url: "/EHCommon/pit/pitRecord/getValidScene",
		method: "post",
	});
}

export function getPitRecordPressureHistory(data: any) {
	return request({
		url: "/EHCommon/pit/pitRecord/getPitRecordPressureHistory",
		method: "post",
		data
	});
}

// 上下井多详情
export function personMultiDetail(data: any) {
	return request({
		url: "/EHCommon/pit/pitRecord/personMultiDetail",
		method: "post",
		data
	});
}

export function getRecordStatistics(data: any) {
	return request({
		url: "/EHCommon/pit/pitRecord/getRecordStatistics",
		method: "post",
		data
	});
}

export function truckMultiDetail(data: any) {
	return request({
		url: "/EHCommon/pit/pitRecord/truckMultiDetail",
		method: "post",
		data
	});
}

export function visitorMultiDetail(data: any) {
	return request({
		url: "/EHCommon/pit/pitRecord/visitorMultiDetail",
		method: "post",
		data
	});
}

export function materialMultiDetail(data: any) {
	return request({
		url: "/EHCommon/pit/pitRecord/materialMultiDetail",
		method: "post",
		data
	});
}

export function getPitLocatorData(data: any) {
	return request({
		url: "/EHCommon/pit/pitRecord/getPitLocatorData",
		method: "post",
		data
	});
}

export interface GetPitMultiDetailParams {
	utype: number[],
	scene_id: number,
	rule_id?: number,
	card_type_name?: string,
	order?: string,
	field?: string,
	personnel_id?: number,
	branch_id?: number,
	duty_id?: number,
	work_type_id?: number,
	type_id?: number,
	company?: string,
	unit_id?:number,
	page?: number,
	limit?: number
}
export interface GetPitMultiDetailResponse {
	data: {
		person_pit_num: number,
		truck_pit_num: number,
		visitor_pit_num: number,
		contractor_pit_num: number,
		material_pit_num: number,
		/** 1-定位对象，0-标签卡 */
		pit_rule_flag: 0 | 1,
		person_card_type_num_list?: {
			name: string,
			person_pit_num: number,
			truck_pit_num: number,
			visitor_pit_num: number,
			contractor_pit_num: number,
			material_pit_num: number,
		}[]
		count: number,
		data: {
			uuid: number,
			name: string,
			card_id: number,
			company: string,
			branch_id: number,
			branch_name: string,
			unit_id: number,
			unit_name: string,
			job_num: string,
			utype: number,
			serial_num: string,
			type_id: number,
			type_name: string,
			in_pit_time: number,
			pit_stay_time: number,
			related_info: string,
			stay_time: number,
			in_area_time: number,
			x: number,
			y: number,
			z: number,
			floor_id: number,
			areas: {
				area_id: number,
				area_name: string,
				area_group_id: number | null,
				area_group_name: number | null,
				type: number
			}[]
		}[]
	}
}
export function getPitMultiDetail(data: GetPitMultiDetailParams) {
	return request<EHCommonResponse<GetPitMultiDetailResponse>>({
		url: "/EHCommon/pit/PitRecord/multiDetail",
		method: "post",
		data
	});
}
