import type {EHCommonResponse} from "@/types/request";
import type {ApplicableObjects} from "@/types/alarm";
import request from "@/utils/js/request";
import type {ALARM_RULE_TYPE} from "@/utils/js/constant";

type AlarmRuleQuery = {
	begin?: number;
	end?: number;
	type?: number;
	is_use?: 0 | 1;
	group_id?: number;
	name?: string;
	order?: string;
	field?: string;
	filter_rules?: number;
	page?: number;
	limit?: number;
};

export type AlarmRuleData = {
	applicable_object: 1 | 2,
	applicable_objects: ApplicableObjects,
	area_ids_inverse: 0 | 1,
	areas: {
		area_id: number;
		area_name: string;
		type: number;
		group_id: number;
		group_name: string;
	}[],
	comment: string,
	day_json: string | null,
	end_time: number,
	id: number,
	is_all_map: 0 | 1,
	is_use: 0 | 1,
	name: string,
	rule_group: string | null,
	rule_group_id: number | null,
	special_json: string,
	start_time: number,
	time_json: string | null,
	type: number,
	type_things_json: string,
	uuids_inverse: 0 | 1
 }

export function getAlarmRule(data?: AlarmRuleQuery) {
	return request<EHCommonResponse<{
		data: AlarmRuleData[]
		count: number;
	}>>({
		url: "/EHCommon/area/alarmRule/getAlarmRule",
		method: "post",
		data
	});
}

// 获取卡号
export function getRulePerson(data: any) {
	return request({
		url: "/EHCommon/area/alarmRule/cardList",
		method: "post",
		data
	});
}

// 获取车辆列表
export function getAlarmTruck(data: any) {
	return request({
		url: "/EHCommon/area/alarmRule/getAlarmTruck",
		method: "post",
		data
	});
}

interface ApplyObject {
	uuid_list?: number[],
	branch_id_list?: number[],
	person_class_id_list?: number[],
	duty_id_list?: number[],
	work_type_id_list?: number[],
	truck_type_id_list?: number[],
	material_type_id_list?: number[],
	contractor_unit_id_list?: number[],
	contractor_work_type_id_list?: number[]
	card_type_id_list?: number[],
}
export interface AddAlarmRuleParams {
	name: string,
	is_use: 0 | 1,
	type: ALARM_RULE_TYPE,
	rule_group_id?: number,
	comment?: string,
	special_json: string
	is_all_map?: 0 | 1,
	area_ids_inverse?: 0 | 1,
	area_id_list?: number[],
	applicable_object?: 1 | 2,
	uuids_inverse?: 0 | 1,
	unbind_alarm?: 0 | 1,
	type_things_json: string,
	uuid_list: number[],
	branch_id_list: number[],
	person_class_id_list: number[],
	duty_id_list: number[],
	work_type_id_list: number[],
	truck_type_id_list: number[],
	material_type_id_list: number[],
	contractor_unit_id_list: number[],
	contractor_work_type_id_list: number[],
	card_type_id_list: number[],
	hazard_source?: ApplyObject,
	accompany?: ApplyObject,
	start_time: number,
	end_time: number,
	day_json: string | null,
	time_json?: string | null,
	alarm_manual_handing_setting?: 0 | 1,
}
// 新增报警规则
export function addAreaAlarmRule(data: AddAlarmRuleParams) {
	return request<EHCommonResponse<number | string>>({
		url: "/EHCommon/area/alarmRule/addAlarmRule",
		method: "post",
		data
	});
}

// 修改报警规则
export function editAreaAlarmRule(data: AddAlarmRuleParams & {id: number}) {
	return request<EHCommonResponse<string>>({
		url: "/EHCommon/area/alarmRule/updateAlarmRule",
		method: "post",
		data
	});
}

// 删除报警规则
export function delAreaAlarmRule(data: any) {
	return request({
		url: "/EHCommon/area/alarmRule/deleteAlarmRule",
		method: "post",
		data
	});
}

// 批量删除报警规则
export function batchDeleteAlarmRule(data: {id_list: number[]}) {
	return request<EHCommonResponse<string>>({
		url: "/EHCommon/area/alarmRule/batchDeleteAlarmRule",
		method: "post",
		data
	});
}

// 查询规则超时时间设置单位
export function getSelectTimeType() {
	return request({
		url: "/EHCommon/area/alarmRule/getSelectTimeType",
		method: "post",
	});
}

// 查询可用的规则类型
export function getAlarmRuleType(data: any) {
	return request({
		url: "/EHCommon/area/alarmRule/getAlarmRuleType",
		method: "post",
		data
	});
}

// 检测规则名称是否重复
export function checkRuleName(data: {id?: number, name: string}) {
	return request<EHCommonResponse<{check: boolean, msg: string}>>({
		url: "/EHCommon/area/AlarmRule/checkRuleName",
		method: "post",
		data
	});
}
