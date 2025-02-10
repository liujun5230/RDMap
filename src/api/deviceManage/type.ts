import request from "@/utils/js/request";
import type {EHCommonResponse} from "@/types/request";
import type {IconModelAttr} from "@/types/map";

// 获取设备类型
export function getDeviceType(data: any) {
	return request({
		url: "/iot/device_manager/type/getDeviceType",
		method: "post",
		data
	});
}

export function checkBaseTypeName(data: any) {
	return request({
		url: "/iot/device_manager/type/checkBaseTypeName",
		method: "post",
		data
	});
}

export type BSTypeInfo = {
	id: number;
	name: string;
	icon_id: number;
	model_id: number;
	number: number;
	is_sort: number;
	sort_number: number;
	icon_model_attr: IconModelAttr
}
export function getBaseType(data?: any) {
	return request<EHCommonResponse<{count: number, data: BSTypeInfo[]}>>({
		url: "/iot/device_manager/type/getBaseType",
		method: "post",
		data
	});
}

export function addBaseType(data: any) {
	return request({
		url: "/iot/device_manager/type/addBaseType",
		method: "post",
		data
	});
}

export function updateBaseType(data: any) {
	return request({
		url: "/iot/device_manager/type/editBaseType",
		method: "post",
		data
	});
}

export function deleteBaseType(data: any) {
	return request({
		url: "/iot/device_manager/type/deleteBaseType",
		method: "post",
		data
	});
}

export function batchChangeBaseType(data: any) {
	return request({
		url: "/iot/device_manager/type/batchChangeBaseType",
		method: "post",
		data
	});
}

export function orderBaseType(data: any) {
	return request({
		url: "/iot/device_manager/type/orderBaseType",
		method: "post",
		data
	});
}

