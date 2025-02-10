import request from "@/utils/js/request";

/**
 *获取人员进出区域
 * @param data
 * @returns {AxiosPromise}
 */
export function getPersonAccessArea(data) {
	return request({
		url: "/EHCommon/accessarea/accessArea/peopleGetAccessArea",
		method: "post",
		data
	});
}

/**
 *获取访客进出区域
 * @param data
 * @returns {AxiosPromise}
 */
export function getVisitorAccessArea(data) {
	return request({
		url: "/EHCommon/accessarea/accessArea/visitorGetAccessArea",
		method: "post",
		data
	});
}

/**
 *获取车辆进出区域
 * @param data
 * @returns {AxiosPromise}
 */
export function getCarAccessArea(data) {
	return request({
		url: "/EHCommon/accessarea/accessArea/carGetAccessArea",
		method: "post",
		data
	});
}

export function getMaterialAccessArea(data) {
	return request({
		url: "/EHCommon/accessarea/accessArea/materialAreaRecord",
		method: "post",
		data
	});
}

export function getObjectAccessArea(data) {
	return request({
		url: "/EHCommon/accessarea/accessArea/get",
		method: "post",
		data
	});
}
