import request from "@/utils/js/request";

/**
 * 录像机管理相关接口
 * */
export function getNvrList(data) {
	return request({
		url: "/EHCommon/device/nvr/getNVR",
		method: "post",
		data
	});
}

export function addNvr(data) {
	return request({
		url: "/EHCommon/device/nvr/addNVR",
		method: "post",
		data
	});
}

export function editNvr(data) {
	return request({
		url: "/EHCommon/device/nvr/editNVR",
		method: "post",
		data
	});
}

export function deleteNvr(data) {
	return request({
		url: "/EHCommon/device/nvr/deleteNVR",
		method: "post",
		data
	});
}

export function requestNvrInfo(data) {
	return request({
		url: "/EHCommon/device/nvr/getNVRChanInfo",
		method: "post",
		data
	});
}

export function editNvrCamera(data) {
	return request({
		url: "/EHCommon/device/nvr/editNVRCamera",
		method: "post",
		data
	});
}

export function getNvrInfo(data) {
	return request({
		url: "/EHCommon/device/nvr/getNVRInfo",
		method: "post",
		data
	});
}

export function getRecordHistory(data) {
	return request({
		url: "/EHCommon/device/nvr/getRecordHistory",
		method: "post",
		data
	});
}

export function startVideoDownload(data) {
	return request({
		url: "/EHCommon/device/nvr/startDownload",
		method: "post",
		data
	});
}

export function getVideoDownload(data) {
	return request({
		url: "/EHCommon/device/nvr/getDownload",
		method: "post",
		data
	});
}

export const getVideoByUUID = data => request({
	url: "/EHCommon/device/nvr/getNVRFile",
	method: "post",
	data
});

export const batchDeleteNVR = data => request({
	url: "/EHCommon/device/nvr/batchDeleteNVR",
	method: "post",
	data
});

export const batchDelRecordHistory = data => request({
	url: "/EHCommon/device/nvr/batchDelRecordHistory",
	method: "post",
	data
});
