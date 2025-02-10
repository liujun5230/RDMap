import request from "@/utils/js/request";

/**
 * 获取所有设备
 * @param data
 * @returns {AxiosPromise}
 */
export const getDeviceList = (data) => request({
	url: "/EHCommon/monitor/Device/get",
	method: "post",
	data
});

export const updateDevice = (data) => request({
	url: "/EHCommon/monitor/Device/update",
	method: "post",
	data
});

/**
 * 设备 - 获取模拟量/位移量树状图
 */
export const getAnalogHistory = (data) => request({
	url: "/EHCommon/monitor/Device/getAnalogHistory",
	method: "post",
	data
});

export const getSwitchHistory = data => request({
	url: "/EHCommon/monitor/Device/getSwitchHistory",
	method: "post",
	data
});

// 触发记录
export const getTriggerRecord = (data) => request({
	url: "/EHCommon/monitor/Device/getRuleRecord",
	method: "post",
	data
});

// 触发设置
export const getTriggerSetting = (data) => request({
	url: "/EHCommon/monitor/Device/getRule",
	method: "post",
	data
});

/**
 * 下载设备信息导入模板
 */
export const downloadTemplateFile = () => request({
	url: "/EHCommon/monitor/Device/downloadTemplateFile",
	method: "post",
	responseType: "blob"
});

// 用于首页实时
export const getMonitorDevice = (data) => request({
	url: "/EHCommon/monitor/Device/getMonitorDevice",
	method: "post",
	data
});

// 导出触发记录
export const exportRecord = (data) => request({
	url: "/EHCommon/monitor/Device/exportRuleRecord",
	method: "post",
	data
});

export const getEnum = (data) => request({
	url: "/EHCommon/monitor/Device/getEnum",
	method: "post",
	data
});
