import request from "@/utils/js/request";

// 新增规则分组
export function addAlarmRuleGroup(data) {
	return request({
		url: "/EHCommon/area/alarmRuleGroup/add",
		method: "post",
		data
	});
}

// 删除规则分组
export function delAlarmRuleGroup(data) {
	return request({
		url: "/EHCommon/area/alarmRuleGroup/delete",
		method: "post",
		data
	});
}

// 查询规则分组
export function getAlarmRuleGroup(data) {
	return request({
		url: "/EHCommon/area/alarmRuleGroup/query",
		method: "post",
		data
	});
}

// 更新规则分组
export function updateAlarmRuleGroup(data) {
	return request({
		url: "/EHCommon/area/alarmRuleGroup/update",
		method: "post",
		data
	});
}

export function checkRuleGroupName(data) {
	return request({
		url: "/EHCommon/area/alarmRuleGroup/checkRuleGroupName",
		method: "post",
		data
	});
}
