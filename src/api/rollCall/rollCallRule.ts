import type {EHCommonResponse} from "@/types/request";
import type {ApplicableObjects} from "@/types/alarm";
import request from "@/utils/js/request";

export interface RollCallRuleParams {
	begin?: number,
	end?: number,
	is_use?: 0 | 1,
	name?: string,
	page?: number,
	limit?: number
}
export interface RollCallRuleRow {
	id: number,
	name: string,
	areas: {id: number, name: string}[],
	start_time: number,
	end_time: number,
	day_json: string,
	roll_call_time_json: string,
	metering: 0 | 1 | 2,
	offset_time: number,
	is_use: 0 | 1,
	applicable_objects: ApplicableObjects
}
export const getRollCallRule = (data: RollCallRuleParams) => request<EHCommonResponse<{
	count: number,
	data: RollCallRuleRow[]
}>>({
	url: "/EHCommon/rollcall/rollCallRule/getRollCallRule",
	method: "post",
	data
});

// 检测点名名称是否重复
export function checkRuleName(data: {id?: number, name: string}) {
	return request<EHCommonResponse<{check: boolean, msg: string}>>({
		url: "/EHCommon/rollcall/rollCallRule/checkRuleName",
		method: "post",
		data
	});
}

export interface AddRollCallRuleParams {
	name: string,
    is_use: 0 | 1,
    start_time: number,
    end_time: number,
    day_json: string | null,
    roll_call_time_json: string | null,
    offset_time: number,
	metering: 0 | 1 | 2,
    alarm_manual_handling_setting: 0 | 1,
    type_things_json: string,
    uuid_list: number[],
    branch_id_list: number[],
    person_class_id_list: number[],
    duty_id_list: number[],
    work_type_id_list: number[],
    truck_type_id_list: number[],
    material_type_id_list: number[]
}
// 新增电子点名计划
export function addRollCallRule(data: AddRollCallRuleParams) {
	return request<EHCommonResponse<number | string>>({
		url: "/EHCommon/rollcall/rollCallRule/addRollCallRule",
		method: "post",
		data
	});
}

// 更新电子点名计划
export function updateRollCallRule(data: AddRollCallRuleParams & {id: number}) {
	return request<EHCommonResponse<string>>({
		url: "/EHCommon/rollcall/rollCallRule/updateRollCallRule",
		method: "post",
		data
	});
}

// 批量删除点名计划
export function batchDeleteRollCallRule(data: {id_list: number[]}) {
	return request<EHCommonResponse<string>>({
		url: "/EHCommon/rollcall/rollCallRule/batchDeleteRollCallRule",
		method: "post",
		data
	});
}
