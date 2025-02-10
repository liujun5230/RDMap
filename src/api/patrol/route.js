import request from "@/utils/js/request";

export function getPatrolRoute(data) {
	return request({
		url: "/EHCommon/patrol/route/get",
		method: "post",
		data
	});
}

export function addPatrolRoute(data) {
	return request({
		url: "/EHCommon/patrol/route/add",
		method: "post",
		data
	});
}

export function updatePatrolRoute(data) {
	return request({
		url: "/EHCommon/patrol/route/update",
		method: "post",
		data
	});
}

export function deleteRoute(data) {
	return request({
		url: "/EHCommon/patrol/route/delete",
		method: "post",
		data
	});
}

export function getPatrolRouteArchive(data) {
	return request({
		url: "/EHCommon/patrol/route/archive",
		method: "post",
		data
	});
}

export function checkRouteName(data) {
	return request({
		url: "/EHCommon/patrol/route/checkRouteName",
		method: "post",
		data
	});
}
