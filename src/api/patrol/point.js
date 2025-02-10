import request from "@/utils/js/request";

// 查询巡检点
export function getAllPoint(data) {
	return request({
		url: "/EHCommon/patrol/point/get",
		method: "post",
		data
	});
}

export function addPatrolPoint(data) {
	return request({
		url: "/EHCommon/patrol/point/add",
		method: "post",
		data
	});
}

export function updatePatrolPoint(data) {
	return request({
		url: "/EHCommon/patrol/point/update",
		method: "post",
		data
	});
}

// 删除巡检点
export function deletePoint(data) {
	return request({
		url: "/EHCommon/patrol/point/delete",
		method: "post",
		data
	});
}

// 检查巡检范围是否重复
export function checkDistance(data) {
	return request({
		url: "/EHCommon/patrol/point/checkDistance",
		method: "post",
		data
	});
}

export function checkPointName(data) {
	return request({
		url: "/EHCommon/patrol/point/checkName",
		method: "post",
		data
	});
}
