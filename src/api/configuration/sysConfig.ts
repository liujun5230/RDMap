import request from "@/utils/js/request";
import {base_url} from "@/Config";
import type {EHCommonResponse} from "@/types/request";

export function getHomepageCustomization(data = {}) {
	return request({
		url: "/EHCommon/configuration/sysConfig/getHomepageCustomization",
		method: "post",
		data
	});
}

export function updateHomepageCustomization(data: any) {
	return request({
		url: "/EHCommon/configuration/sysConfig/updateHomepageCustomization",
		method: "post",
		data
	});
}

export type SystemConfig = {
	id: number;
	title: string;
	name: string;
	group_id: number;
	value: string;
	type: number;
	min: number | null;
	max: number | null;
	top_switch: number;
	unit_name: string;
	comment: string;
}
export function getConfig(data?: unknown) {
	return request<EHCommonResponse<SystemConfig[]>>({
		url: "/EHCommon/configuration/sysConfig/getSysConfig",
		method: "post",
		data
	});
}

export function resetConfig(data?: any) {
	return request({
		url: "/EHCommon/configuration/sysConfig/resetConfiguration",
		method: "post",
		data
	});
}

export function setConfig(data: any) {
	return request({
		url: "/EHCommon/configuration/sysConfig/setSysConfig",
		method: "post",
		data
	});
}

export function getGroup(data?: any) {
	return request({
		url: "/EHCommon/configuration/sysConfig/getGroup",
		method: "post",
		data
	});
}

export function getSysConfigWithGroup(data?: any) {
	return request({
		url: "/EHCommon/configuration/sysConfig/getSysConfigWithGroup",
		method: "post",
		data
	});
}

export function checkConfigValue(data?: any) {
	return request({
		url: "/EHCommon/configuration/sysConfig/checkValue",
		method: "post",
		data
	});
}

export function batchSetSysConfig(data?: any) {
	return request({
		url: "/EHCommon/configuration/sysConfig/batchSetSysConfig",
		method: "post",
		data
	});
}

export function getSysConfigTitle(data?: any) {
	return request({
		url: "/EHCommon/configuration/sysConfig/getSysConfigTitle",
		method: "post",
		data
	});
}

export function backgroundUpload(fileobj: any) {
	const param = new FormData();
	param.append("file", fileobj.file);
	return request({
		method: "post",
		// 上传地址
		url: base_url + "/EHCommon/configuration/sysConfig/uploadBackGround",
		// 定义上传头
		headers: {"Content-Type": "multipart/form-data"},
		data: param
	});
}

export function clearBackground(data: any) {
	return request({
		url: "/EHCommon/configuration/sysConfig/clearBackGround",
		method: "post",
		data
	});
}

/**
 * 获取所有的首页模块
 * @returns {Promise<Array<{module: string, module_display_name: string}>>}
 */
export function getAllHomepageCustomization(data: any) {
	return request({
		url: "/EHCommon/configuration/sysConfig/getAllHomepageCustomization",
		method: "post",
		data
	});
}

// 预警报警权限是否显示
export function alarmDisplay(data: any) {
	return request({
		url: "/EHCommon/configuration/sysConfig/alarmDisplay",
		method: "post",
		data
	});
}

export function getDoorServer(data: any) {
	return request({
		url: "/EHCommon/configuration/sysConfig/getDoorServer",
		method: "post",
		data
	});
}

// 查询指定配置
export function getSpecialConfig(data: any) {
	return request({
		url: "/EHCommon/configuration/sysConfig/getSpecialConfig",
		method: "post",
		data
	});
}
