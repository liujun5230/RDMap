import request from "@/utils/js/request";

// 查询访客字典
export function getVisitorDict(data) {
	return request({
		url: "/EHCommon/visitor/visitorDict/getVisitorDict",
		method: "post",
		data
	});
}

// 访客字典排序
export function setVisitorDictOrder(data) {
	return request({
		url: "/EHCommon/visitor/visitorDict/order",
		method: "post",
		data
	});
}

// 添加访客字典
export function addVisitorDict(data) {
	return request({
		url: "/EHCommon/visitor/visitorDict/addVisitorDict",
		method: "post",
		data
	});
}

// 编辑访客字典
export function editVisitorDict(data) {
	return request({
		url: "/EHCommon/visitor/visitorDict/editVisitorDict",
		method: "post",
		data
	});
}

// 删除访客字典
export function delVisitorDict(data) {
	return request({
		url: "/EHCommon/visitor/visitorDict/deleteVisitorDict",
		method: "post",
		data
	});
}

export function checkVisitorDictName(data) {
	return request({
		url: "/EHCommon/visitor/visitorDict/checkDictName",
		method: "post",
		data
	});
}
