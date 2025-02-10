import request from "@/utils/js/request";

export function addPatrolTask(data) {
	return request({
		url: "/EHCommon/patrol/task/create",
		method: "post",
		data
	});
}

export function updatePatrolTask(data) {
	return request({
		url: "/EHCommon/patrol/task/update",
		method: "post",
		data
	});
}

export function getPatrolTaskArchive(data) {
	return request({
		url: "/EHCommon/patrol/task/archive",
		method: "post",
		data
	});
}
