import request from "@/utils/js/request";

/**
 * 查询事故报警列表数据
 * @param {*} data
 */
export const getAccidentAlarm = (data) => request({
	url: "/EHCommon/alarm/AccidentAlarm/get",
	method: "post",
	data
});

/**
 * 批量删除事故报警
 * @param {{id_list: number[]}} data
 */
export const batchDelete = (data) => request({
	url: "/EHCommon/alarm/AccidentAlarm/batchDelete",
	method: "post",
	data
});

/**
 * 批量处理事故报警
 * @param {{id_list: number[], status: number}} data
 */
export const batchProcess = (data) => request({
	url: "/EHCommon/alarm/AccidentAlarm/batchProcess",
	method: "post",
	data
});

/**
 * 更新事故报警
 * @param {{id: number, comment: string}} data
 */
export const updateAccidentAlarm = (data) => request({
	url: "/EHCommon/alarm/AccidentAlarm/update",
	method: "post",
	data
});

export const process = (data) => request({
	url: "/EHCommon/alarm/AccidentAlarm/process",
	method: "post",
	data
});

export const getAlarmReasonDropdown = (data) => request({
	url: "/EHCommon/alarm/AccidentAlarm/getAlarmReasonDropdown",
	method: "post",
	data
});
