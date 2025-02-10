import request from "@/utils/js/request";

export function getPatrolRecord(data) {
	return request({
		url: "/EHCommon/patrol/record/get",
		method: "post",
		data
	});
}

export function deletePatrolRecord(data) {
	return request({
		url: "/EHCommon/patrol/record/delete",
		method: "post",
		data
	});
}

export function getPatrolRecordDetail(data) {
	return request({
		url: "/EHCommon/patrol/record/detail",
		method: "post",
		data
	});
}

export function disposePatrolRecord(data) {
	return request({
		url: "/EHCommon/patrol/record/dispose",
		method: "post",
		data
	});
}

export function batchDisposePatrolRecord(data) {
	return request({
		url: "/EHCommon/patrol/record/batchDispose",
		method: "post",
		data
	});
}
