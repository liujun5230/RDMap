import request from "@/utils/js/request";
import store from "@/store";

export function isInitializeSys() {
	return request({
		url: "/EHCommon/admin/user/isInitializeSystem",
		method: "get"
	});
}

export function login(data) {
	return request({
		url: "/EHCommon/admin/user/login",
		method: "post",
		data
	});
}

export function getUserInfo() {
	return request({
		headers: {"Authorization": store.state.user.token},
		url: "/EHCommon/admin/user/info",
		method: "post"
	});
}

export function logout(data) {
	return request({
		url: "/EHCommon/admin/user/loginOut",
		method: "post",
		data
	});
}

export function getSSOSite() {
	return request({
		url: "/EHCommon/admin/user/getSsoSite",
		method: "get"
	});
}

export function changePassword(data) {
	return request({
		url: "/EHCommon/admin/user/changePassword",
		method: "post",
		data
	});
}

export function addUser(data) {
	return request({
		url: "/EHCommon/admin/user/addUser",
		method: "post",
		data
	});
}

export function deleteUser(data) {
	return request({
		url: "/EHCommon/admin/user/deleteUser",
		method: "post",
		data
	});
}

export function updateUser(data) {
	return request({
		url: "/EHCommon/admin/user/updateUser",
		method: "post",
		data
	});
}

export function getUserList(data) {
	return request({
		url: "/EHCommon/admin/user/getUser",
		method: "post",
		data
	});
}

export function checkAdminIsChangePwd() {
	return request({
		url: "/EHCommon/admin/user/isChangePassword",
		method: "post",
	});
}

export function changeAdminPassword(data) {
	return request({
		url: "/EHCommon/admin/user/adminChangePassword",
		method: "post",
		data
	});
}

export function changeOtherUserPassword(data) {
	return request({
		url: "/EHCommon/admin/user/changeOtherUserPassword",
		method: "post",
		data
	});
}

export function getCheckEncryption() {
	return request({
		url: "/EHCommon/admin/user/getCheckEncryption",
		method: "post",
	});
}

export function validatePWD(data) {
	return request({
		url: "/EHCommon/admin/user/validatePWD",
		method: "post",
		data
	});
}

export function checkUserName(data) {
	return request({
		url: "/EHCommon/admin/user/checkName",
		method: "post",
		data
	});
}

export function getToken() {
	return request({
		url: "/EHCommon/admin/user/token",
		method: "post",
	});
}

export function setLoginLink(data) {
	return request({
		url: "/EHCommon/admin/user/setLoginLink",
		method: "post",
		data
	});
}

export function checkToken(data) {
	return request({
		url: "/EHCommon/admin/user/checkToken",
		method: "post",
		data
	});
}

export function getUserNameByToken() {
	return request({
		url: "/EHCommon/admin/user/getUserNameByToken",
		method: "post",
	});
}
