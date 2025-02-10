import request from "@/utils/js/request";
// 新增设备信息
export function addDevice(data) {
	return request({
		url: "/iot/device_manager/info/addDevice",
		method: "post",
		data
	});
}

// 获取设备信息
export function getDeviceInfo(data) {
	return request({
		url: "/iot/device_manager/info/getDeviceInfo",
		method: "post",
		data
	});
}

// 更新设备信息
export function updateDevice(data) {
	return request({
		url: "/iot/device_manager/info/updateDevice",
		method: "post",
		data
	});
}

// 删除设备信息
export function deleteDevice(data) {
	return request({
		url: "/iot/device_manager/info/deleteDevice",
		method: "post",
		data
	});
}

// 改变电源状态
export function changePowerStatus(data) {
	return request({
		url: "/iot/device_manager/info/changePowerStatus",
		method: "post",
		data: data
	});
}

// 检查设备id是否重复
export function checkDevice(data) {
	return request({
		url: "/iot/device_manager/info/checkDevice",
		method: "post",
		data: data
	});
}

// 获取供电电源
export function getPowerSupply() {
	return request({
		url: "/iot/device_manager/info/getPowerSupply",
		method: "post"
	});
}

// 批量修改供电电源
export function batchPowerSupply(data) {
	return request({
		url: "/iot/device_manager/info/batchPowerSupply",
		method: "post",
		data
	});
}

// 获取充放电记录
export function getPowerRecord(data) {
	return request({
		url: "/iot/device_manager/info/getPowerRecord",
		method: "post",
		data
	});
}

/**
 * 修改低电量报警阈值
 * @param {{id_list: number[], power_threshold: number}} data
 */
export function batchPowerThreshold(data) {
	return request({
		url: "/iot/device_manager/info/batchPowerThreshold",
		method: "post",
		data
	});
}

export function batchDeleteDevice(data) {
	return request({
		url: "/iot/device_manager/info/batchDeleteDevice",
		method: "post",
		data
	});
}

/**
 * 获取设备uuid
 * @param {{code: string | number, type: number}} data
 * @returns number
 */
export function getDeviceUuid(data) {
	return request({
		url: "/iot/device_manager/info/getDeviceUuid",
		method: "post",
		data
	});
}

export function searchTrafficLight(data) {
	return request({
		url: "/iot/device_manager/info/searchTrafficLight",
		method: "post",
		data
	});
}

export function searchVoiceLight(data) {
	return request({
		url: "/iot/device_manager/info/searchVoiceLight",
		method: "post",
		data
	});
}

// 检测设备名称是否有效
export function checkName(data) {
	return request({
		url: "/iot/device_manager/info/checkName",
		method: "post",
		data
	});
}
