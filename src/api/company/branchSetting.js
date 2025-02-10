import request from "@/utils/js/request";

export function getBranchList(data) {
	return request({
		url: "/EHCommon/company/branchSetting/getBranchList",
		method: "post",
		data
	});
}

export function addBranch(data) {
	return request({
		url: "/EHCommon/company/branchSetting/addBranch",
		method: "post",
		data
	});
}

export function updateBranchInfo(data) {
	return request({
		url: "/EHCommon/company/branchSetting/updateBranchInfo",
		method: "post",
		data
	});
}

export function deleteBranchInfo(data) {
	return request({
		url: "/EHCommon/company/branchSetting/deleteBranchInfo",
		method: "post",
		data
	});
}

export function checkBranchName(data) {
	return request({
		url: "/EHCommon/company/branchSetting/checkBranchName",
		method: "post",
		data
	});
}
