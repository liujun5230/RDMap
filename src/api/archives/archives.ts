import request from "@/utils/js/request";
import type {Response} from "@/types/global";
import type {ApplicableObjects} from "@/types/alarm";
import type {EHCommonResponse} from "@/types/request";
import type {ALARM_RULE_TYPE} from "@/utils/js/constant";

export const getArchivesThings = (data: any): Response<any> => request({
	url: "/EHCommon/archives/Archives/getArchivesThings",
	method: "post",
	data
});

export const getArchivesCard = (data: any): Response<any> => request({
	url: "/EHCommon/archives/Archives/getArchivesCard",
	method: "post",
	data
});

export const getBindObject = (data: any): Response<any> => request({
	url: "/EHCommon/archives/Archives/getBindObject",
	method: "post",
	data
});

export const setArchiveConfig = (data: any): Response<any> => request({
	url: "/EHCommon/archives/Archives/setArchivesConfig",
	method: "post",
	data
});

export const getArchiveConfig = (data?: any): Response<any> => request({
	url: "/EHCommon/archives/Archives/getArchivesConfig",
	method: "post",
	data
});

export interface AreaArchivesParams {
	id: number,
}

export interface AreaArchiveResult<R = any> {
	id: number,
	map: string,
	floor_id: number,
	shape: 1 | 2,
	name: string,
	area_template_id: number,
	area_template_name: string,
	rule: R[],

	is_use: 0 | 1,
	type: number
	area_type_id: number,
	area_type_name: string,
	area_dict: {
		[key: string]: string
	},
	area_group: {id: number, name: string}[],
	circle_attribute: unknown,
	extra_attribute: unknown,
	area: string,
	area_groups: string | null,

	// 上下井区域使用
	pit_id?: number
	// 区域是否删除 0: 未删除 1: 已删除
	is_delete: 0 | 1
}
export const getAreaArchives = (data: AreaArchivesParams) => request<EHCommonResponse<AreaArchiveResult>>({
	url: "/EHCommon/archives/Archives/getAreaArchives",
	method: "post",
	data
});

export interface AlarmRuleArchivesData {
	base: {
		id: number,
		type: ALARM_RULE_TYPE,
		is_delete: 0 | 1,
		is_use: 0 | 1,
		name: string,
		rule_group_id: number,
		rule_group_name: string,
		comment: string,
		special_json: string,
		is_all_map: 0 | 1,
		area_ids_inverse: 0 | 1,
		areas: {
			map: string,
			area_id: number,
			area_name: string,
			type: number,
			group_name: string,
			group_id: number,
			is_use: 0 | 1
		}[],
		applicable_object: 1 | 2,
		uuids_inverse: 0 | 1,
		unbind_alarm: 0 | 1,
		type_things_json: string,
		start_time: number,
		end_time: number,
		day_json: string,
		time_json: string,
		alarm_manual_handling_setting: 0 | 1,
		hazard_source?: {
			applicable_objects: ApplicableObjects
		},
		accompany?: {
			applicable_objects: ApplicableObjects
		}
	},
	applicable_objects: ApplicableObjects
}
export interface CallRuleArchivesData {
	base: {
		id: number,
		name: string,
		is_use: 0 | 1,
		start_time: number,
		end_time: number,
		day_json: string | null,
		roll_call_time_json: string,
		offset_time: number,
		metering: number,
		alarm_manual_handling_setting: 0 | 1,
		type_things_json: string,
		is_delete: 0 | 1,
		areas: {
			area_id: number,
			area_name: string,
			type: number,
			group_id: number,
			group_name: string,
			map: string,
			floor_id: string
		}[]
	},
	applicable_objects: ApplicableObjects
}
type EvacuationAreaItem = {
	map: string
	/** 1-场景，2-区域 */
	type: 1 | 2,
	scene_area_id: number,
	area_name: string | null,
	area_type: number | null,
	group_id: number | null,
	group_name: string | null,
	is_use: 0 | 1 | null,
	rule_area?: {
		area_id: number,
		rule_id: number,
		rule_name: string,
		is_use: 0 | 1
	}[]
}
export interface EvacuationArchivesData {
	base: {
		id: number,
		is_delete: 0 | 1,
		name: string,
		time: number,
		uuid: number,
		plan_content: string,
		attachment_path: {
			name: string,
			size: number,
			path: string
		}[],
		accident_is_all_map: 0 | 1,
		accident_scene_area: EvacuationAreaItem[],
		evacuate_is_all_map: 0 | 1,
		evacuate_scene_area: EvacuationAreaItem[],
		security_is_all_map: 0 | 1,
		security_scene_area: EvacuationAreaItem[]
		type_things_json: string,
	},
	applicable_objects: ApplicableObjects
}
// 获取报警规则档案
export const getRuleArchives = <T = any>(data: {id: number, type: number}, signal?: AbortSignal) => request<EHCommonResponse<T>>({
	url: "/EHCommon/archives/Archives/getRuleArchives",
	method: "post",
	data,
	signal
});
