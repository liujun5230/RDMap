import request from "@/utils/js/request";
import type {EHCommonResponse} from "@/types/request";
import type {UTYPES} from "@/utils/js/constant";

export interface HeartAbnormalParams {
	start_time?: number,
	end_time?: number,
	utype?: number,
	branch_id?: number,
	person_class_id?: number,
	health_type_code?: 1 | 2 | 3,
	alarm_status?: 1 | 2,
	state?: 0 | 1,
	person_name?: string,
	visitor_name?: string,
	card_id?: number,
	field?: string,
	order?: string,
	page?: number,
	limit?: number,
	homepage_start_time?: number,
	homepage_stop_time?: number,
}

export interface HeartAbnormalRow {
	id: number;
	card_id: number;
	uuid: number;
	health_type: string;
	utype: UTYPES,
	health_type_code: 1 | 2 | 3,
	alarm_status: 1 | 2;
	state: 0 | 1;
	start_time: string;
	end_time: string;
	duration_time: string;
	threshold: string;
	max_num: number | null;
	max_time: number | null;
	min_num: number | null;
	min_time: number | null;
	mean: number | null;
	unit: string;
	alarm_info: string;
	operation_time: string;
	operation_person: string;
	operation_content: string;
	related_info: string;
	map: string,
	show_area: string;
}
// 查询健康异常记录
export function getHeartErrorList(data: HeartAbnormalParams) {
	return request<EHCommonResponse<{
		count: number,
		data: HeartAbnormalRow[]
	}>>({
		url: "/EHCommon/health/abnormal/getHeartAbnormal",
		method: "post",
		data
	});
}

// 批量删除健康异常记录
export function batchDeleteHeartAbnormal(data: {id_list: number[]}) {
	return request<EHCommonResponse<string>>({
		url: "/EHCommon/health/abnormal/deleteHeartAbnormal",
		method: "post",
		data
	});
}

export function getBloodErrorList(data: unknown) {
	return request({
		url: "/EHCommon/health/abnormal/getBloodAbnormal",
		method: "post",
		data
	});
}

export function updateHeartError(data: unknown) {
	return request({
		url: "/EHCommon/health/abnormal/updateHeartAbnormal",
		method: "post",
		data
	});
}

export function updateBloodError(data: unknown) {
	return request({
		url: "/EHCommon/health/abnormal/updateBloodAbnormal",
		method: "post",
		data
	});
}

