import request from "@/utils/js/request";
import {base_url} from "@/Config";

export function getScene(data) {
	return request({
		url: "/EHCommon/map/scene/getSceneInfo",
		method: "post",
		data
	});
}

export function addScene(data) {
	return request({
		url: "/EHCommon/map/scene/addScene",
		method: "post",
		data
	});
}

export function updateScene(data) {
	return request({
		url: "/EHCommon/map/scene/updateScene",
		method: "post",
		data
	});
}

export function delScene(data) {
	return request({
		url: "/EHCommon/map/scene/deleteScene",
		method: "post",
		data
	});
}

export function previewScene(data) {
	return request({
		method: "post",
		url: base_url + "/EHCommon/map/scene/previewScene",
		headers: {"Content-Type": "multipart/form-data"},
		data: data
	});
}

export function uploadScene(data) {
	return request({
		url: "/EHCommon/map/scene/uploadScene",
		method: "post",
		data
	});
}

export function deleteSceneMap(data) {
	return request({
		url: "/EHCommon/map/scene/deleteSceneMap",
		method: "post",
		data
	});
}

export function orderScene(data) {
	return request({
		url: "/EHCommon/map/scene/orderScene",
		method: "post",
		data
	});
}

export function checkSceneName(data) {
	return request({
		url: "/EHCommon/map/scene/checkName",
		method: "post",
		data
	});
}
