import request from "@/utils/js/request";

export function getPersonList(data) {
	return request({
		url: "/EHCommon/company/personSetting/getPersonList",
		method: "post",
		data
	});
}

export function addPersonInfo(data) {
	return request({
		url: "/EHCommon/company/personSetting/addPersonInfo",
		method: "post",
		data
	});
}

export function deletePersonInfo(data) {
	return request({
		url: "/EHCommon/company/personSetting/deletePersonInfo",
		method: "post",
		data
	});
}

export function updatePersonInfo(data) {
	return request({
		url: "/EHCommon/company/personSetting/updatePersonInfo",
		method: "post",
		data
	});
}

export function unbindCard(data) {
	return request({
		url: "/EHCommon/company/personSetting/unbindCard",
		method: "post",
		data
	});
}

export function updatePersonBatch(data) {
	return request({
		url: "/EHCommon/company/personSetting/updatePersonBatch",
		method: "post",
		data
	});
}

export function batDelPers(data) {
	return request({
		url: "/EHCommon/company/personSetting/batDelPers",
		method: "post",
		data
	});
}

export function batUnbindPers(data) {
	return request({
		url: "/EHCommon/company/personSetting/batUnbindingCard",
		method: "post",
		data
	});
}

export function personChangeCard(data) {
	return request({
		url: "/EHCommon/company/personSetting/changeCard",
		method: "post",
		data
	});
}

export function canPersonUnBind(data) {
	return request({
		url: "/EHCommon/company/personSetting/whetherCanUnBind",
		method: "post",
		data
	});
}

export function validatePersonIDCode(data) {
	return request({
		url: "/EHCommon/company/personSetting/validateIDCode",
		method: "post",
		data
	});
}

// 批量修改人物模型
export function batchUpdatePersonModel(data) {
	return request({
		url: "/EHCommon/company/personSetting/batchUpdatePersonModel",
		method: "post",
		data
	});
}

// 批量修改人物图标
export function batchUpdatePersonIcon(data) {
	return request({
		url: "/EHCommon/company/personSetting/batchUpdatePersonIcon",
		method: "post",
		data
	});
}

//  获取导入人员模板
export function getPersonImportTemplate(data) {
	return request({
		url: "/EHCommon/company/personSetting/personImportTemplate",
		method: "post",
		responseType: "blob",
		data
	});
}

// mock人员身份证号
export function fakeCode(data) {
	return request({
		url: "/EHCommon/company/personSetting/fakeCode",
		method: "post",
		data
	});
}
