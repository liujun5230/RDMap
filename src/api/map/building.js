import request from "@/utils/js/request";
import {base_url} from "@/Config";

export function getBuilding(data) {
	return request({
		url: "/EHCommon/map/building/getBuildingInfo",
		method: "post",
		data
	});
}

export function addBuilding(data) {
	return request({
		url: "/EHCommon/map/building/addBuilding",
		method: "post",
		data
	});
}

export function updateBuilding(data) {
	return request({
		url: "/EHCommon/map/building/updateBuilding",
		method: "post",
		data
	});
}

export function delBuilding(data) {
	return request({
		url: "/EHCommon/map/building/deleteBuilding",
		method: "post",
		data
	});
}

export function previewBuilding(data) {
	return request({
		method: "post",
		url: base_url + "/EHCommon/map/building/previewBuilding",
		headers: {"Content-Type": "multipart/form-data"},
		data: data
	});
}

export function uploadBuilding(data) {
	return request({
		url: "/EHCommon/map/building/uploadBuilding",
		method: "post",
		data
	});
}

export function setBuildingSceneCoordinate(data) {
	return request({
		url: "/EHCommon/map/building/setBuildingSceneCoordinate",
		method: "post",
		data
	});
}

export function deleteBuildingMap(data) {
	return request({
		url: "/EHCommon/map/building/deleteBuildingMap",
		method: "post",
		data
	});
}

export function orderBuilding(data) {
	return request({
		url: "/EHCommon/map/building/orderBuilding",
		method: "post",
		data
	});
}

export function checkBuildingName(data) {
	return request({
		url: "/EHCommon/map/building/checkName",
		method: "post",
		data
	});
}
