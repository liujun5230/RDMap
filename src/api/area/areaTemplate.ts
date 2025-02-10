import request from "@/utils/js/request";
import type {Response} from "@/types/global";

export interface GetAreaTemplateParams {
	name?: string,
	area_name?: string,
	page?: number,
	limit?: number
}
export interface AreaTemplateRow {
    id: number,
    name: string,
    area_style: string,
    relative_start: number,
    relative_end: number,
    disappear_time: number,
    offline_time: number,
    uwb_area_entry_exit_detection_time: number,
    uwb_area_entry_exit_effective_points: number,
    bluetooth_area_entry_exit_detection_time: number,
    bluetooth_area_entry_exit_effective_points: number,
	rel_area: {id: number, name: string}[]
}
// 查询区域模板
export function getAreaTemplate(data?: GetAreaTemplateParams): Response<{count: number, data: AreaTemplateRow[]}> {
	return request({
		url: "/EHCommon/area/areaTemplate/query",
		method: "post",
		data
	});
}

// 新增区域模板
export function addAreaTemplate(data: any): any {
	return request({
		url: "/EHCommon/area/areaTemplate/add",
		method: "post",
		data
	});
}

// 更新区域模板
export function updateAreaTemplate(data: any): any {
	return request({
		url: "/EHCommon/area/areaTemplate/update",
		method: "post",
		data
	});
}

// 删除区域模板
export function delAreaTemplate(data: any): any {
	return request({
		url: "/EHCommon/area/areaTemplate/delete",
		method: "post",
		data
	});
}

// 批量删除区域模板
export function batchDelete(data: any): any {
	return request({
		url: "/EHCommon/area/areaTemplate/batchDelete",
		method: "post",
		data
	});
}

// 检查区域模板名称重复
export function checkTemplateName(data: any): any {
	return request({
		url: "/EHCommon/area/areaTemplate/checkName",
		method: "post",
		data
	});
}

// 按照id来查询区域模板
export function queryDetail(data: any): any {
	return request({
		url: "/EHCommon/area/areaTemplate/queryDetail",
		method: "post",
		data
	});
}
