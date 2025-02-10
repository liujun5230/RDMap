import request from "@/utils/js/request";
import {base_url} from "@/Config";

export function getFloorInfo(data) {
	return request({
		url: "/EHCommon/map/floor/getFloorInfo",
		method: "post",
		data
	});
}

export function addFloor(data) {
	return request({
		url: "/EHCommon/map/floor/addFloor",
		method: "post",
		data
	});
}

export function updateFloor(data) {
	return request({
		url: "/EHCommon/map/floor/updateFloor",
		method: "post",
		data
	});
}

export function delFloor(data) {
	return request({
		url: "/EHCommon/map/floor/deleteFloor",
		method: "post",
		data
	});
}

export function getMapResolution(data) {
	return request({
		url: "/EHCommon/map/floor/getResolution",
		method: "post",
		data
	});
}

export function uploadMap(data) {
	return request({
		url: "/EHCommon/map/floor/imageFloorFile",
		method: "post",
		data
	});
}

export function uploadBIgMap(data) {
	const param = new FormData();
	const file_arr = data.file_arr;
	file_arr.map((file, index) => {
		param.append("file_" + index, file);
	});
	param.append("row_num", data.row_num);
	param.append("floor_id", data.floor_id);
	return request({
		method: "post",
		url: base_url + "/EHCommon/map/floor/spellImages",
		headers: {"Content-Type": "multipart/form-data"},
		data: param
	});
}

export function fileUpload(fileobj, id) {
	const param = new FormData();
	param.append("file", fileobj.file);
	if (id) {
		param.append("floor_id", id);
	}
	return request({
		method: "post",
		// 上传地址
		url: base_url + "/EHCommon/map/floor/importFile",
		// 定义上传头
		headers: {"Content-Type": "multipart/form-data"},
		data: param
	});
}

export function uploadCoordinateImage(data) {
	return request({
		url: "/EHCommon/map/floor/uploadFloor",
		method: "post",
		data
	});
}

export function getStoreyList(data) {
	return request({
		url: "/EHCommon/map/floor/getStoreyList",
		method: "post",
		data

	});
}

export function getAllFloorInfo(data) {
	return request({
		url: "/EHCommon/map/floor/getAllFloorInfo",
		method: "post",
		data
	});
}

export function deleteFloorMap(data) {
	return request({
		url: "/EHCommon/map/floor/deleteFloorMap",
		method: "post",
		data
	});
}

export function orderFloor(data) {
	return request({
		url: "/EHCommon/map/floor/orderFloor",
		method: "post",
		data
	});
}

export function checkFloorName(data) {
	return request({
		url: "/EHCommon/map/floor/checkName",
		method: "post",
		data
	});
}
