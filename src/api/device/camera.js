import request from "@/utils/js/request";

export function getVideoSize() {
	return request({
		url: "/EHCommon/device/camera/getVideoSize",
		method: "post",
	});
}

export function getEquip(data) {
	return request({
		url: "/EHCommon/device/camera/getEquip",
		method: "post",
		data
	});
}

export function addCamera(data) {
	return request({
		url: "/EHCommon/device/camera/addEquip",
		method: "post",
		data
	});
}

export function deleteCamera(data) {
	return request({
		url: "/EHCommon/device/camera/deleteEquip",
		method: "post",
		data
	});
}

export function updateCamera(data) {
	return request({
		url: "/EHCommon/device/camera/updateEquip",
		method: "post",
		data
	});
}

export function getSearchList(data) {
	return request({
		url: "/EHCommon/device/camera/getSearchList",
		method: "post",
		data
	});
}

export function getEquipSupport(data) {
	return request({
		url: "/EHCommon/device/camera/getEquipSupport",
		method: "post",
		data
	});
}

export function getPtzInfo(data) {
	return request({
		url: "/EHCommon/device/camera/getEquipPtz",
		method: "post",
		data
	});
}

export function downloadVideos(data) {
	return request({
		url: "/EHCommon/device/camera/downloadVideos",
		method: "post",
		data
	});
}

export function getTheWatcher(data) {
	return request({
		url: "/EHCommon/device/camera/getTheWatcher",
		method: "post",
		data
	});
}

export function deleteEquip(data) {
	return request({
		url: "/EHCommon/device/camera/deleteEquip",
		method: "post",
		data
	});
}

export function checkCamaraName(data) {
	return request({
		url: "/EHCommon/device/camera/checkName",
		method: "post",
		data
	});
}

export function checkCamaraCode(data) {
	return request({
		url: "/EHCommon/device/camera/checkCode",
		method: "post",
		data
	});
}
