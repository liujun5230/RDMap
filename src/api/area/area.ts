import request from "@/utils/js/request";
import type {EHCommonResponse, TableRequestParams, TableResult} from "@/types/request";

// 查询区域
export function getArea(data?: unknown) {
	return request({
		url: "/EHCommon/area/area/getArea",
		method: "post",
		data
	});
}

// 新增区域
export function addArea(data: unknown) {
	return request({
		url: "/EHCommon/area/area/addArea",
		method: "post",
		data
	});
}

// 更新区域
export function updateArea(data: unknown) {
	return request({
		url: "/EHCommon/area/area/updateArea",
		method: "post",
		data
	});
}

// 删除区域
export function deleteArea(data: unknown) {
	return request({
		url: "/EHCommon/area/area/deleteArea",
		method: "post",
		data
	});
}

// 查询实时区域
export function getAreaInfo(data?: unknown) {
	return request<EHCommonResponse<{id: number}[]>>({
		url: "/EHCommon/area/area/getRealTimeArea",
		method: "post",
		data
	});
}

type AreaRequestParams = {
  scene_id?: number;
  building_id?: number;
  floor_id?: number;
  is_use?: number;
  area_template_id?: number;
  area_group_id?: number;
  area_name?: string;
  area_type_id?: number;
  order?: "ASC" | "DESC";
}

export type AreaItem = {
  name: string;
  id: number;
  map: string;
  area_template_name: string;
  is_use: string;
  area_type_name: string;
	area_group_names: string
	floor_id: number
  rule: {
    id: number;
    name: string;
  }[];
	area_dict?: Record<number, string>
}

export function getAreaList(data: AreaRequestParams & TableRequestParams) {
	return request<EHCommonResponse<TableResult<AreaItem[]>>>({
		url: "/EHCommon/area/area/getAreaList",
		method: "post",
		data
	});
}

export function batchDeleteAreaList(data: {id_list: number[]}) {
	return request<EHCommonResponse<string>>({
		url: "/EHCommon/area/area/batchDeleteAreaList",
		method: "post",
		data
	});
}

// 检查区域名称是否重复
export function checkAreaNameRepeat(data:{name: string, id?: number}) {
	return request<EHCommonResponse<{
		check: boolean,
		msg: string
	}>>({
		url: "/EHCommon/area/area/checkAreaNameRepeat",
		method: "post",
		data
	});
}

export function checkNameDeny(data:{name: string}) {
	return request<EHCommonResponse<{
		check: boolean,
		msg: string
	}>>({
		url: "/EHCommon/area/area/checkNameDeny",
		method: "post",
		data
	});
}
export function getCascaderArea(data?: {type_id_list?: number[]}) {
	return request<EHCommonResponse<string>>({
		url: "/EHCommon/area/Area/area",
		method: "post",
		data
	});
}

// 进出区域所在区域查询接口
export function areaTypeQuery() {
	return request<EHCommonResponse<{id:number;name:string;rel_area?:[]}[]>>({
		url: "/EHCommon/area/Area/areaTypeQuery",
		method: "post",
	});
}

export interface GetReplayAreaItem {
	id: number,
	name: string,
	type: number,
	coords: string,
	color: string,
	relative_start: number,
	relative_end: number,
	floor_id: number,
	start: number,
	is_delete: 0 | 1
}
export function getReplayArea(data?: {id_list: number[]}) {
	return request<EHCommonResponse<GetReplayAreaItem[]>>({
		url: "/EHCommon/area/Area/replayArea",
		method: "post",
		data
	});
}
