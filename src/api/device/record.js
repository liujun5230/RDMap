import request from "@/utils/js/request";

export function getDiskInfo() {
	return request({
		url: "/EHCommon/device/record/getDiskInfo",
		method: "post",
	});
}

export function deleteVideo(data) {
	return request({
		url: "/EHCommon/device/record/delRecordInfo",
		method: "post",
		data
	});
}

export function getRecordOrder(data) {
	return request({
		url: "/EHCommon/device/record/getAllRecordOrder",
		method: "post",
		data
	});
}

export function saveRecordOrder(data) {
	return request({
		url: "/EHCommon/device/record/addAllRecordOrder",
		method: "post",
		data
	});
}

export function getTrackTargetList(data) {
	return request({
		url: "/EHCommon/device/record/getTrackTargetInfo",
		method: "post",
		data
	});
}

export function deleteTrackTarget(data) {
	return request({
		url: "/EHCommon/device/record/delTrackTarget",
		method: "post",
		data
	});
}

export function addTrackTarget(data) {
	return request({
		url: "/EHCommon/device/record/addTrackTarget",
		method: "post",
		data
	});
}

export function getTrackVideoList(data) {
	return request({
		url: "/EHCommon/device/record/getTrackVideoInfo",
		method: "post",
		data
	});
}

export function deleteTrackVideo(data) {
	return request({
		url: "/EHCommon/device/record/delTrackVideo",
		method: "post",
		data
	});
}

export function startPackVideo(data) {
	return request({
		url: "/EHCommon/device/record/startPack",
		method: "post",
		data
	});
}

export function getPackStatus(data) {
	return request({
		url: "/EHCommon/device/record/getPack",
		method: "post",
		data
	});
}

export function getRecordInfo(data) {
	return request({
		url: "/EHCommon/device/record/getRecordInfo",
		method: "post",
		data
	});
}

export function disableAllRecordOrder(data) {
	return request({
		url: "/EHCommon/device/record/disableAllRecordOrder",
		method: "post",
		data
	});
}

export function batchDelTrackTarget(data) {
	return request({
		url: "/EHCommon/device/record/batchDelTrackTarget",
		method: "post",
		data
	});
}

export function batchDelRecordInfo(data) {
	return request({
		url: "/EHCommon/device/record/delRecordInfo",
		method: "post",
		data
	});
}

export function batchDelTrackVideo(data) {
	return request({
		url: "/EHCommon/device/record/batchDelTrackVideo",
		method: "post",
		data
	});
}

// 编辑单灯控制规则
export function addVoiceLightRule(data) {
	return request({
		url: "/EHCommon/device/record/addVoiceLightRule",
		method: "post",
		data
	});
}

// 编辑单灯控制规则
export function updateVoiceLightRule(data) {
	return request({
		url: "/EHCommon/device/record/updateVoiceLightRule",
		method: "post",
		data
	});
}

export function getVoiceLightRule(data) {
	return request({
		url: "/EHCommon/device/record/getVoiceLightRule",
		method: "post",
		data
	});
}

export function deleteVoiceLightRule(data) {
	return request({
		url: "/EHCommon/device/record/deleteVoiceLightRule",
		method: "post",
		data
	});
}

export function validateVoiceLightRule(data) {
	return request({
		url: "/EHCommon/device/record/validateVoiceLightRule",
		method: "post",
		data
	});
}
