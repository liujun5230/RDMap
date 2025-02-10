import request from "@/utils/js/request";

// 获取人员分类列表
export function getPersonClassify(data) {
	return request({
		url: "/EHCommon/company/personClassify/getPersonClass",
		method: "post",
		data
	});
}

// 添加人员分类
export function addPersonClassify(data) {
	return request({
		url: "/EHCommon/company/personClassify/addPersonClass",
		method: "post",
		data
	});
}

// 更新人员分类
export function updatePersonClassify(data) {
	return request({
		url: "/EHCommon/company/personClassify/updatePersonClass",
		method: "post",
		data
	});
}

// 删除人员分类
export function deletePersonClassify(data) {
	return request({
		url: "/EHCommon/company/personClassify/deletePersonClass",
		method: "post",
		data
	});
}

// 添加人员到分类
export function addPersonClassRel(data) {
	return request({
		url: "/EHCommon/company/personClassify/addPersonClassRel",
		method: "post",
		data
	});
}

// 移出分类人员
export function deletePersonClassRel(data) {
	return request({
		url: "/EHCommon/company/personClassify/deletePersonClassRel",
		method: "post",
		data
	});
}
