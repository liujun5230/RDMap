import request from "@/utils/js/request";
// 报警信息
export function getAlarm(data) {
	return request({
		url: "/EHCommon/alarm/alarm/getAlarm",
		method: "post",
		data
	});
}

// 员工、车辆、访客报警信息
export function getTotalAlarm(data) {
	return request({
		url: "/EHCommon/alarm/alarm/getTotalAlarm",
		method: "post",
		data
	});
}

// 删除报警
export function deleteAlarm(data) {
	return request({
		url: "/EHCommon/alarm/alarm/deleteAlarm",
		method: "post",
		data
	});
}

// 批量处理报警
export function handleAlarm(data) {
	return request({
		url: "/EHCommon/alarm/alarm/batchProcessing",
		method: "post",
		data
	});
}

// 修改报警信息-备注
export function updateAlarm(data) {
	return request({
		url: "/EHCommon/alarm/alarm/updateAlarm",
		method: "post",
		data
	});
}

// 查询求救
export function getHelp(data) {
	return request({
		url: "/EHCommon/alarm/alarm/getHelp",
		method: "post",
		data
	});
}

// 批量处理求救
export function handleHelp(data) {
	return request({
		url: "/EHCommon/alarm/alarm/batchHelpProcessing",
		method: "post",
		data
	});
}

// 删除求救
export function deleteHelp(data) {
	return request({
		url: "/EHCommon/alarm/alarm/deleteHelp",
		method: "post",
		data
	});
}

// 修改求救信息 - 备注
export function updateHelp(data) {
	return request({
		url: "/EHCommon/alarm/alarm/updateHelp",
		method: "post",
		data
	});
}

// 查询未处理报警数量
export function getAllCount(data) {
	return request({
		url: "/EHCommon/alarm/alarm/getAllCount",
		method: "post",
		data
	});
}

export function getSos(data) {
	return request({
		url: "/EHCommon/alarm/alarm/getSos",
		method: "post",
		data
	});
}

// 获取寻呼内容, 筛选下拉框取值
export function getCallContent() {
	return request({
		url: "/EHCommon/alarm/alarm/getCallContent",
		method: "post"
	});
}

// 获取寻呼状态, 筛选下拉框取值
export function getCallStatus() {
	return request({
		url: "/EHCommon/alarm/alarm/getCallStatus",
		method: "post"
	});
}

// 获取允许的规则
export function getEnableAlarm() {
	return request({
		url: "/EHCommon/alarm/alarm/getEnableAlarm",
		method: "post"
	});
}

// 获取区域超员,井下超员-人员列表
export function getAreaOverMan(data) {
	return request({
		url: "/EHCommon/alarm/alarm/getAreaOverMan",
		method: "post",
		data
	});
}

// 获取预警报警类型
export function getWarningType(data) {
	return request({
		url: "/EHCommon/alarm/alarm/getWarningType",
		method: "post",
		data
	});
}

// 获取报警记录
export function getHelpOrigin(data) {
	return request({
		url: "/EHCommon/alarm/alarm/getHelpOrigin",
		method: "post",
		data
	});
}

export function getGatherObjectHomePage(data) {
	return request({
		url: "/EHCommon/alarm/GatherAlarm/getGatherObjectHomePage",
		method: "post",
		data
	});
}

// 查询聚集报警
export function getGatherAlarm(data) {
	return request({
		url: "/EHCommon/alarm/GatherAlarm/get",
		method: "post",
		data
	});
}

// 删除聚集报警
export function deleteGatherAlarm(data) {
	return request({
		url: "/EHCommon/alarm/GatherAlarm/delete",
		method: "post",
		data
	});
}

// 批量删除聚集报警
export function batchDelete(data) {
	return request({
		url: "/EHCommon/alarm/GatherAlarm/batchDelete",
		method: "post",
		data
	});
}

// 处理聚集报警
export function handleProcess(data) {
	return request({
		url: "/EHCommon/alarm/GatherAlarm/process",
		method: "post",
		data
	});
}

// 批量处理聚集报警
export function batchProcess(data) {
	return request({
		url: "/EHCommon/alarm/GatherAlarm/batchProcess",
		method: "post",
		data
	});
}

// 编辑备注
export function editRemark(data) {
	return request({
		url: "/EHCommon/alarm/GatherAlarm/editComment",
		method: "post",
		data
	});
}

// 获取聚集对象
export function getGatherObject(data) {
	return request({
		url: "/EHCommon/alarm/GatherAlarm/getGatherObject",
		method: "post",
		data
	});
}

export function getGatherObjectMerge(data) {
	return request({
		url: "/EHCommon/alarm/GatherAlarm/getGatherObjectMerge",
		method: "post",
		data
	});
}

export function getRealTimeGatherAlarm(data) {
	return request({
		url: "/EHCommon/alarm/GatherAlarm/getRealTimeGatherAlarm",
		method: "post",
		data
	});
}

// 查询轨迹所需的uuids
export function getUuids(data) {
	return request({
		url: "/EHCommon/alarm/GatherAlarm/getUuids",
		method: "post",
		data
	});
}

// 查询合并报警轨迹所需的uuids
export function getMergeUuids(data) {
	return request({
		url: "/EHCommon/alarm/GatherAlarm/getMergeUuids",
		method: "post",
		data
	});
}

// 批量删除寻呼
export function batchDeleteHelp(data) {
	return request({
		url: "/EHCommon/alarm/alarm/batchDeleteHelp",
		method: "post",
		data
	});
}

// 批量处理寻呼
export function batchCallProcessing(data) {
	return request({
		url: "/EHCommon/alarm/alarm/batchCallProcessing",
		method: "post",
		data
	});
}

// 定位对象告警详情
export function getAlarmDetail(data) {
	return request({
		url: "/EHCommon/alarm/overManAlarm/detail",
		method: "post",
		data
	});
}

// 查询区域告警
export function getAreaAlarm(data) {
	return request({
		url: "/EHCommon/alarm/areaAlarm/get",
		method: "post",
		data
	});
}

// 批量删除区域告警
export function batchDeleteAreaAlarm(data) {
	return request({
		url: "/EHCommon/alarm/areaAlarm/batchDelete",
		method: "post",
		data
	});
}

// 批量处理区域告警
export function batchProcessing(data) {
	return request({
		url: "/EHCommon/alarm/areaAlarm/batchProcessing",
		method: "post",
		data
	});
}

// 获取区域告警uuid列表
export function getApplicableObjects(data) {
	return request({
		url: "/EHCommon/alarm/areaAlarm/getApplicableObjects",
		method: "post",
		data
	});
}
