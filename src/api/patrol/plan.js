import request from "@/utils/js/request";

// 新增巡检计划
export function addPlan(data) {
	return request({
		url: "/EHCommon/patrol/plan/add",
		method: "post",
		data
	});
}

export function updatePlan(data) {
	return request({
		url: "/EHCommon/patrol/plan/update",
		method: "post",
		data
	});
}

export function getPlan(data) {
	return request({
		url: "/EHCommon/patrol/plan/get",
		method: "post",
		data
	});
}

export function checkPlanName(data) {
	return request({
		url: "/EHCommon/patrol/plan/checkName",
		method: "post",
		data
	});
}

export function batchDeletePatrolPlan(data) {
	return request({
		url: "/EHCommon/patrol/plan/batchDelete",
		method: "post",
		data
	});
}
