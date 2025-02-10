import request from "@/utils/js/request";

// 查询员工字典
export function getPersonDict(data) {
	return request({
		url: "/EHCommon/company/personDict/get",
		method: "post",
		data
	});
}

// 员工字典排序
export function setPersonDictOrder(data) {
	return request({
		url: "/EHCommon/company/personDict/setOrder",
		method: "post",
		data
	});
}

// 删除人员字典选项
export function delPersonDict(data) {
	return request({
		url: "/EHCommon/company/personDict/del",
		method: "post",
		data
	});
}

// 添加人员字典选项
export function addPersonDict(data) {
	return request({
		url: "/EHCommon/company/personDict/add",
		method: "post",
		data
	});
}

// 编辑人员字典选项
export function editPersonDict(data) {
	return request({
		url: "/EHCommon/company/personDict/edt",
		method: "post",
		data
	});
}

// 判断字典名称是否重复
export function checkPersonDictName(data) {
	return request({
		url: "/EHCommon/company/personDict/checkDictName",
		method: "post",
		data
	});
}
