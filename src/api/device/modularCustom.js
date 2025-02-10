import request from "@/utils/js/request";

export function adjustMenu(data) {
	return request({
		url: "/EHCommon/device/modularCustom/adjustMenu",
		method: "post",
		data
	});
}

export function getMenu(data) {
	return request({
		url: "/EHCommon/device/modularCustom/getMenu",
		method: "post",
		data
	});
}

export function addMenu(data) {
	return request({
		url: "/EHCommon/device/modularCustom/addMenu",
		method: "post",
		data
	});
}

export function updateMenu(data) {
	return request({
		url: "/EHCommon/device/modularCustom/updateMenu",
		method: "post",
		data
	});
}

export function delMenu(data) {
	return request({
		url: "/EHCommon/device/modularCustom/deleteMenu",
		method: "post",
		data
	});
}

export function resetMenu(data) {
	return request({
		url: "/EHCommon/device/modularCustom/resetModular",
		method: "post",
		data
	});
}

export function resetNameLogo(data) {
	return request({
		url: "/EHCommon/device/modularCustom/resetNameLogo",
		method: "post",
		data
	});
}
