import request from "@/utils/js/request";

export function delCard(data) {
	return request({
		url: "/EHCommon/device/deviceCard/delCard",
		method: "post",
		data
	});
}

export function getHistory(data) {
	return request({
		url: "/EHCommon/device/deviceCard/getConsumePowerHistory",
		method: "post",
		data
	});
}

// 获取标签状态列表
export function getTagList(data) {
	return request({
		url: "/EHCommon/device/deviceCard/getTag",
		method: "post",
		data
	});
}

// 获取标签绑定记录列表
export function getCardRecord(data) {
	return request({
		url: "/EHCommon/device/deviceCard/getCardRecord",
		method: "post",
		data
	});
}

// 校验标签卡是否为gps卡
export function validateCardIsGps(data) {
	return request({
		url: "/EHCommon/device/deviceCard/verifyGPS",
		method: "post",
		data: data
	});
}

// 获取标签状态
export function getCardStatus(data) {
	return request({
		url: "/EHCommon/device/deviceCard/getCardStatus",
		method: "post",
		data: data
	});
}

export function getOneMachineList(data) {
	return request({
		url: "/EHCommon/device/deviceCard/getOneMachineList",
		method: "post",
		data
	});
}

export function getCardType(data) {
	return request({
		url: "/EHCommon/device/deviceCard/getCardType",
		method: "post",
		data
	});
}

export function addCardType(data) {
	return request({
		url: "/EHCommon/device/deviceCard/addCardType",
		method: "post",
		data
	});
}

export function updateCardType(data) {
	return request({
		url: "/EHCommon/device/deviceCard/updateCardType",
		method: "post",
		data
	});
}

export function updateTagType(data) {
	return request({
		url: "/EHCommon/device/deviceCard/updateTagType",
		method: "post",
		data
	});
}

export function delCardType(data) {
	return request({
		url: "/EHCommon/device/deviceCard/delCardType",
		method: "post",
		data
	});
}

export function batchHandleCardType(data) {
	return request({
		url: "/EHCommon/device/deviceCard/batchCardType",
		method: "post",
		data
	});
}

export function batchDelCard(data) {
	return request({
		url: "/EHCommon/device/deviceCard/batchDelCard",
		method: "post",
		data
	});
}

export function orderCardType(data) {
	return request({
		url: "/EHCommon/device/deviceCard/orderCardType",
		method: "post",
		data
	});
}

export function addCard(data) {
	return request({
		url: "/EHCommon/device/deviceCard/addCard",
		method: "post",
		data
	});
}

export function exportTypeTag(data) {
	return request({
		url: "/EHCommon/device/deviceCard/exportTypeTag",
		method: "post",
		responseType: "blob",
		data
	});
}

export function checkCardRepeat(data) {
	return request({
		url: "/EHCommon/device/deviceCard/checkCard",
		method: "post",
		data
	});
}

export function checkCardTypeName(data) {
	return request({
		url: "/EHCommon/device/deviceCard/checkCardTypeName",
		method: "post",
		data
	});
}
