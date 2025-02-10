import request from "@/utils/js/request";

export function getSystemInfo(data) {
	return request({
		url: "/EHCommon/configuration/configuration/getSystemInfo",
		method: "post",
		data
	});
}

export function getConfigCategory(data) {
	return request({
		url: "/EHCommon/configuration/configuration/getConfigCategory",
		method: "post",
		data
	});
}

export function updateAlarmPopUpWindowConfig(data) {
	return request({
		url: "/EHCommon/configuration/configuration/updateAlarmPopUpWindowConfig",
		method: "post",
		data
	});
}
