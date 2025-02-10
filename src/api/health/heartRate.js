import request from "@/utils/js/request";

export function getHeartList(data) {
	return request({
		url: "/EHCommon/health/heartRate/getHeartRate",
		method: "post",
		data
	});
}

export function getHeartHistory(data) {
	return request({
		url: "/EHCommon/health/heartRate/getHistory",
		method: "post",
		data
	});
}

export function getOxygenPressureHistory(data) {
	return request({
		url: "/EHCommon/health/heartRate/getOxygenPressureHistory",
		method: "post",
		data
	});
}

export function getBodyTemperaturePressureHistory(data) {
	return request({
		url: "/EHCommon/health/heartRate/getBodyTemperaturePressureHistory",
		method: "post",
		data
	});
}

export function updateHeartRate(data) {
	return request({
		url: "/EHCommon/health/heartRate/updateHeartRate",
		method: "post",
		data
	});
}

export function getBloodPressureHistory(data) {
	return request({
		url: "/EHCommon/health/heartRate/getBloodPressureHistory",
		method: "post",
		data
	});
}

export function getHealthHistory(data) {
	return request({
		url: "/EHCommon/health/heartRate/getHealthHistory",
		method: "post",
		data
	});
}
