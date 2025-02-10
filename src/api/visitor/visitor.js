import request from "@/utils/js/request";

export function getDisplayField(data) {
	return request({
		url: "/EHCommon/visitor/visitor/getDisplayField",
		method: "post",
		data
	});
}

export function getVisitorList(data) {
	return request({
		url: "/EHCommon/visitor/visitor/getVisitorList",
		method: "post",
		data
	});
}

export function setDisplayField(data) {
	return request({
		url: "/EHCommon/visitor/visitor/setDisplayField",
		method: "post",
		data
	});
}

export function createVisitor(data) {
	return request({
		url: "/EHCommon/visitor/visitor/createVisitor",
		method: "post",
		data
	});
}

export function batchUnBind(data) {
	return request({
		url: "/EHCommon/visitor/visitor/batchUnBind",
		method: "post",
		data
	});
}

export function unBind(data) {
	return request({
		url: "/EHCommon/visitor/visitor/unBind",
		method: "post",
		data
	});
}

export function updateVisitor(data) {
	return request({
		url: "/EHCommon/visitor/visitor/updateVisitor",
		method: "post",
		data
	});
}

export function canVisitorUnBind(data) {
	return request({
		url: "/EHCommon/visitor/visitor/whetherCanUnBind",
		method: "post",
		data
	});
}

export function cardUsable(data) {
	return request({
		url: "/EHCommon/visitor/visitor/cardUsable",
		method: "post",
		data
	});
}

/**
 * @method getRollCallRuleList
 * 批量修改访客模型
 * @param {Object}[data = {}]
 * @param {number[]}[data.uuid_list = null] 访客uuid列表
 * @param {number}[data.model_id = null] 人物模型id
 * @return {Promise}
 */
export function batchUpdateVisitorModel(data) {
	return request({
		url: "/EHCommon/visitor/visitor/batchUpdateVisitorModel",
		method: "post",
		data
	});
}

export function batchUpdateVisitorIcon(data) {
	return request({
		url: "/EHCommon/visitor/visitor/batchUpdateVisitorIcon",
		method: "post",
		data
	});
}

export function delVisitor(data) {
	return request({
		url: "/EHCommon/visitor/visitor/deleteVisitor",
		method: "post",
		data
	});
}

export function batchDelVisitor(data) {
	return request({
		url: "/EHCommon/visitor/visitor/batchDeleteVisitor",
		method: "post",
		data
	});
}

/**
 * 获取收发卡记录
 */
export function getSendReceiveCardRecord(data) {
	return request({
		url: "/EHCommon/visitor/visitor/getSendReceiveCardRecord",
		method: "post",
		data
	});
}

/**
 * 更改卡号
 */
export function changeCard(data) {
	return request({
		url: "/EHCommon/visitor/visitor/changeCard",
		method: "post",
		data
	});
}

export function importTemplateFile(data) {
	return request({
		url: "/EHCommon/visitor/visitor/downloadTemplateFile",
		method: "post",
		responseType: "blob",
		data
	});
}

// 查询访客预约记录
export function getAppointmentRecord(data) {
	return request({
		url: "/EHCommon/visitor/visitorRecord/getAppointmentRecord",
		method: "post",
		data
	});
}

export function getAllVisitor(data) {
	return request({
		url: "/EHCommon/visitor/visitor/getAllVisitor",
		method: "post",
		data
	});
}

export function addAppointmentRecord(data) {
	return request({
		url: "/EHCommon/visitor/visitorRecord/addAppointmentRecord",
		method: "post",
		data
	});
}

export function editAppointmentRecord(data) {
	return request({
		url: "/EHCommon/visitor/visitorRecord/editAppointmentRecord",
		method: "post",
		data
	});
}

export function removeAppointmentRecord(data) {
	return request({
		url: "/EHCommon/visitor/visitorRecord/removeAppointmentRecord",
		method: "post",
		data
	});
}

// 批量编辑预约来访记录
export function editBatchAppointmentRecord(data) {
	return request({
		url: "/EHCommon/visitor/visitorRecord/batchEditAppointmentRecord",
		method: "post",
		data
	});
}

export function validateIdCode(data) {
	return request({
		url: "/EHCommon/visitor/visitor/validateIDCode",
		method: "post",
		data
	});
}
