import request from "@/utils/js/request";

export function getDisplayInfo(data) {
	return request({
		url: "/EHCommon/company/systemSetting/getDisplayInfo",
		method: "post",
		data
	});
}

export function setDisplayInfo(data) {
	return request({
		url: "/EHCommon/company/systemSetting/setDisplayInfo",
		method: "post",
		data
	});
}

export function getDiskUsage() {
	return request({
		url: "/EHCommon/company/systemSetting/diskUsage",
		method: "post",
	});
}
