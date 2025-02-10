import request from "@/utils/js/request";

export function getTruckType(data) {
	return request({
		url: "/EHCommon/truck/truck/getTruckType",
		method: "post",
		data
	});
}

export function addTruckType(data) {
	return request({
		url: "/EHCommon/truck/truck/addTruckType",
		method: "post",
		data
	});
}

export function edtTruckType(data) {
	return request({
		url: "/EHCommon/truck/truck/edtTruckType",
		method: "post",
		data
	});
}

/**
 * 删除单个车辆或者批量删除车辆
 * @param {*} data
 */
export function delTruckType(data) {
	return request({
		url: "/EHCommon/truck/truck/delTruckType",
		method: "post",
		data
	});
}

export function getTruck(data) {
	return request({
		url: "/EHCommon/truck/truck/getTruck",
		method: "post",
		data
	});
}

export function addTruck(data) {
	return request({
		url: "/EHCommon/truck/truck/addTruck",
		method: "post",
		data
	});
}

export function updateTruck(data) {
	return request({
		url: "/EHCommon/truck/truck/updateTruck",
		method: "post",
		data
	});
}

/**
 * 删除车辆
 * @param {*} data
 */
export function deleteTruck(data) {
	return request({
		url: "/EHCommon/truck/truck/deleteTruck",
		method: "post",
		data
	});
}

/**
 * 解绑车辆
 * @param {*} data
 */
export function liftedTruck(data) {
	return request({
		url: "/EHCommon/truck/truck/liftedTruck",
		method: "post",
		data
	});
}

export function liftedTruckCheck(data) {
	return request({
		url: "/EHCommon/truck/truck/liftedTruckCheck",
		method: "post",
		data
	});
}

export function getTruckUnit(data) {
	return request({
		url: "/EHCommon/truck/truck/getTruckUnit",
		method: "post",
		data
	});
}

export function getAccessTruck(data) {
	return request({
		url: "/EHCommon/truck/truck/getAccessTruck",
		method: "post",
		data
	});
}

export function truckChangeCard(data) {
	return request({
		url: "/EHCommon/truck/truck/changeCard",
		method: "post",
		data
	});
}

export function checkTruckLicenseName(data) {
	return request({
		url: "/EHCommon/truck/truck/checkTruckLicenseName",
		method: "post",
		data
	});
}

/**
 * 查询车辆字典
 *
 * 提示：如果该接口还没有field字段，调用获取到数据后增加一个field字段，参考 DictPage 组件
 * @param {*} data
 */
export function getTruckDict(data) {
	return request({
		url: "/EHCommon/truck/TruckDict/getTruckDict",
		method: "post",
		data
	});
}

/**
 * 新增车辆字典
 * @param {*} data
 */
export function addTruckDict(data) {
	return request({
		url: "/EHCommon/truck/TruckDict/addTruckDict",
		method: "post",
		data
	});
}

/**
 * 删除车辆字典
 * @param {*} data
 */
export function deleteTruckDict(data) {
	return request({
		url: "/EHCommon/truck/TruckDict/deleteTruckDict",
		method: "post",
		data
	});
}

/**
 * 编辑车辆字典
 * @param {*} data
 */
export function editTruckDict(data) {
	return request({
		url: "/EHCommon/truck/TruckDict/editTruckDict",
		method: "post",
		data
	});
}

/**
 * 排序车辆字典
 * @param {*} data
 */
export function sortTruckDict(data) {
	return request({
		url: "/EHCommon/truck/TruckDict/order",
		method: "post",
		data
	});
}

export function checkTruckDictName(data) {
	return request({
		url: "/EHCommon/truck/TruckDict/checkDictName ",
		method: "post",
		data
	});
}

export function getCarImportTemplate(data) {
	return request({
		url: "/EHCommon/truck/truck/exportTruck",
		method: "post",
		responseType: "blob",
		data
	});
}

export function updateTruckType(data) {
	return request({
		url: "/EHCommon/truck/truck/updateTruckType ",
		method: "post",
		data
	});
}

export function orderTruckType(data) {
	return request({
		url: "/EHCommon/truck/truck/orderTruckType ",
		method: "post",
		data
	});
}

export function checkTruckTypeName (data) {
	return request({
		url: "/EHCommon/truck/truck/checkTruckTypeName  ",
		method: "post",
		data
	});
}

