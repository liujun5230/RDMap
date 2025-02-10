import request from "@/utils/js/request";

export function getCardList(data) {
	return request({
		url: "/EHCommon/realtime/realTime/getCardList",
		method: "post",
		data
	});
}

export function getEvacuateStat(data) {
	return request({
		url: "/EHCommon/realtime/realTime/getEvacuateStat",
		method: "post",
		data
	});
}

export function evacuateAreaByCard(data) {
	const url = "/EHCommon/realtime/realTime/evacuateAreaByCard";
	return request({
		url: url,
		method: "post",
		data
	});
}

export function callCard(data) {
	return request({
		url: "/EHCommon/realtime/realTime/callCardList",
		method: "post",
		data
	});
}

export function getPersonInfo(data) {
	return request({
		url: "/EHCommon/realtime/realTime/getNowInfo",
		method: "post",
		data
	});
}

export function getCarInfo(data) {
	return request({
		url: "/EHCommon/realtime/realTime/getCarInfo",
		method: "post",
		data
	});
}

export function evacuateArea(data) {
	return request({
		url: "/EHCommon/realtime/realTime/evacuateArea",
		method: "post",
		data
	});
}

export function evacuateAreaGPS(data) {
	return request({
		url: "/EHCommon/realtime/realTimeGPS/evacuateAreaGPS",
		method: "post",
		data
	});
}

export function showTempCall(data) {
	return request({
		url: "/EHCommon/realtime/realTime/tempStatisticalData",
		method: "post",
		data
	});
}

export function getAllCardNowPos(data) {
	return request({
		url: "/EHCommon/realtime/realTime/getAllCardNowPos",
		method: "post",
		data
	});
}

export function getFixedList(data) {
	return request({
		url: "/EHCommon/realtime/realTime/getFixedList",
		method: "post",
		data
	});
}

export function evacuateAll(data) {
	return request({
		url: "/EHCommon/realtime/Evacuate/evacuateAllCard",
		method: "post",
		data
	});
}

// 再次发布撤离指令
export function againEvacuateAllCard() {
	return request({
		url: "/EHCommon/realtime/Evacuate/againEvacuateAllCard",
		method: "post",
	});
}

// 退出紧急撤离状态
export function closeEmergencyEvacuate() {
	return request({
		url: "/EHCommon/realtime/Evacuate/closeEmergencyEvacuate",
		method: "post",
	});
}

// 紧急撤离进度统计
export function getWithdrawalSchedule() {
	return request({
		url: "/EHCommon/realtime/Evacuate/getWithdrawalSchedule",
		method: "post"
	});
}

export function getSafeArea(data) {
	return request({
		url: "/EHCommon/realtime/Evacuate/getSecurityAreaDistribution",
		method: "post",
		data
	});
}

export function listenEvacuation(data) {
	return request({
		url: "/EHCommon/realtime/Evacuate/listenEvacuate",
		method: "post",
		data
	});
}

export function getTagCount(data) {
	return request({
		url: "/EHCommon/realtime/realTime/tagStatistics",
		method: "post",
		data
	});
}

/**
 * @params {{scene_id: number}} 场景id
 */
export function getBuildingStatistics(data) {
	return request({
		url: "/EHCommon/realtime/realTime/getUuidStat",
		method: "post",
		data
	});
}

export function getPositionInfo(data) {
	return request({
		url: "/EHCommon/realtime/realTimeTag/get",
		method: "post",
		data
	});
}
