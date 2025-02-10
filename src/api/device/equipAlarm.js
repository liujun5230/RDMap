import request from "@/utils/js/request";

export function getBaseStationAlarm(data) {
	return request({
		url: "/EHCommon/device/equipAlarm/getBaseStationAlarm",
		method: "post",
		data
	});
}

export function getEquipAlarm(data) {
	return request({
		url: "/EHCommon/device/equipAlarm/getEquipAlarm",
		method: "post",
		data
	});
}

export function getFaultAlarm(data) {
	return request({
		url: "/EHCommon/device/equipAlarm/getFaultAlarm",
		method: "post",
		data: data
	});
}

export function updateEquipAlarm(data) {
	return request({
		url: "/EHCommon/device/equipAlarm/updateEquipAlarm",
		method: "post",
		data
	});
}

export function deleteEquipAlarm(data) {
	return request({
		url: "/EHCommon/device/equipAlarm/deleteEquipAlarm",
		method: "post",
		data
	});
}
