import type {Order} from "@/types/global";
import type {EHCommonResponse, TableResult} from "@/types/request";
import request from "@/utils/js/request";

// 查询区域字典
export function getAreaDict(data: unknown) {
	return request({
		url: "/EHCommon/area/AreaDict/getAreaDict",
		method: "post",
		data
	});
}

// 添加区域字典
export function addAreaDict(data: unknown) {
	return request({
		url: "/EHCommon/area/AreaDict/addAreaDict",
		method: "post",
		data
	});
}

// 编辑区域字典
export function editAreaDict(data: unknown) {
	return request({
		url: "/EHCommon/area/AreaDict/editAreaDict",
		method: "post",
		data
	});
}

// 删除区域字典
export function delAreaDict(data: unknown) {
	return request({
		url: "/EHCommon/area/AreaDict/delAreaDict",
		method: "post",
		data
	});
}

// 新增或编辑区域类型的规则设置
export function addRuleSetting(data: unknown) {
	return request({
		url: "/EHCommon/area/AreaDict/ruleSettings",
		method: "post",
		data
	});
}

// 区域字典列表排序
export function sortAreaDict(data: unknown) {
	return request({
		url: "/EHCommon/area/AreaDict/order",
		method: "post",
		data
	});
}

export function sortAreaType(data: { order: Order }) {
	return request({
		url: "/EHCommon/area/AreaDict/orderAreaType",
		method: "post",
		data
	});
}

export function updateAreaType(data: { id: number, name: string }) {
	return request<EHCommonResponse<string>>({
		url: "/EHCommon/area/AreaDict/updateAreaType",
		method: "post",
		data
	});
}

export function addAreaType(data: { name: string }) {
	return request<EHCommonResponse<string>>({
		url: "/EHCommon/area/AreaDict/addAreaType",
		method: "post",
		data
	});
}

type AreaOption = EHCommonResponse<TableResult<{
	id: number;
	name: string;
	btn_name: 1 | 0
	btn_delete: 1 | 0
	sort_key: number;
	is_sort: true | false;
	num: number;
}[]>>

export function getAreaTypeOption(data: { name: string }) {
	return request<AreaOption>({
		url: "/EHCommon/area/AreaDict/getAreaTypeOption",
		method: "post",
		data
	});
}

export function deleteAreaType(data: { id: number }) {
	return request<EHCommonResponse<string>>({
		url: "/EHCommon/area/AreaDict/deleteAreaType",
		method: "post",
		data
	});
}

export function checkAreaTypeName(data: { id: number, name: string }) {
	return request<EHCommonResponse<{check: boolean, msg: string}>>({
		url: "/EHCommon/area/AreaDict/checkAreaTypeName",
		method: "post",
		data
	});
}

export function checkAreaDictName(data: { id?: number, name: string }) {
	return request<EHCommonResponse<{check: boolean, msg: string}>>({
		url: "/EHCommon/area/AreaDict/checkDictName",
		method: "post",
		data
	});
}
