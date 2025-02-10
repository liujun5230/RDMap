import request from "@/utils/js/request";

// 个人统计-按日

export function getDayAttendanceDate(data) {
	return request({
		url: "/EHCommon/attendance/attendanceRecord/getDayAttendanceDate",
		method: "post",
		data
	});
}

// 个人统计-按月
export function getDayAttendanceMonth(data) {
	return request({
		url: "/EHCommon/attendance/attendanceRecord/getDayAttendanceMonth",
		method: "post",
		data
	});
}

// 个人统计-汇总
export function getDayAttendanceSum(data) {
	return request({
		url: "/EHCommon/attendance/attendanceRecord/getDayAttendanceSum",
		method: "post",
		data
	});
}

// 部门统计-按日
export function getBranchDay(data) {
	return request({
		url: "/EHCommon/attendance/attendanceRecord/getBranchDay",
		method: "post",
		data
	});
}

// 部门统计-按月
export function getBranchMonth(data) {
	return request({
		url: "/EHCommon/attendance/attendanceRecord/getBranchMonth",
		method: "post",
		data
	});
}

// 部门统计-汇总
export function getBranchSum(data) {
	return request({
		url: "/EHCommon/attendance/attendanceRecord/getBranchSum",
		method: "post",
		data
	});
}

// 全平台统计
export function getTerraceSum(data) {
	return request({
		url: "/EHCommon/attendance/attendanceRecord/getTerraceSum",
		method: "post",
		data
	});
}

// 数据统计-考勤数据-打卡数据
export function getAttendClock(data) {
	return request({
		url: "/EHCommon/attendance/attendanceRecord/getAttendClock",
		method: "post",
		data
	});
}

/**
 * @method getDayAttendanceDateEdit
 * 个人统计按日详情
 * @param {Object}[data = {}]
 * @param {number}[data.attendance_id] 考勤统计ID
 * @return {Promise}
 */
export function getDayAttendanceDateEdit(data) {
	return request({
		url: "/EHCommon/attendance/attendanceRecord/getDayAttendanceDateEdit",
		method: "post",
		data
	});
}

/**
 * @method getEfficiencyWeek
 * 个人统计周效能
 * @param {Object}[data = {}]
 * @param {number}[data.uuid] 人员uuid
 * @param {string}[data.week] 时间，年-周（字符串 2021-31）
 * @return {Promise}
 */
export function getEfficiencyWeek(data) {
	return request({
		url: "/EHCommon/attendance/attendanceRecord/getEfficiencyWeek",
		method: "post",
		data
	});
}

/**
 * @method getEfficiencyMonth
 * 个人统计月效能
 * @param {Object}[data = {}]
 * @param {number}[data.uuid] 人员uuid
 * @param {number}[data.begin] 时间（时间戳）
 * @return {Promise}
 */
export function getEfficiencyMonth(data) {
	return request({
		url: "/EHCommon/attendance/attendanceRecord/getEfficiencyMonth",
		method: "post",
		data
	});
}

/**
 * @method getEfficiencyMonth
 * 汇总效能
 * @param {Object}[data = {}]
 * @param {number}[data.uuid] 人员uuid
 * @param {number}[data.begin] 起始时间，时间戳，从选择开始当天的凌晨开始
 * @param {number}[data.end] 结束时间，时间戳，结束当天的凌晨
 * @return {Promise}
 */
export function getEfficiencySum(data) {
	return request({
		url: "/EHCommon/attendance/attendanceRecord/getEfficiencySum",
		method: "post",
		data
	});
}

// 添加打卡
export function addAttendClock(data) {
	return request({
		url: "/EHCommon/attendance/attendanceRecord/addAttendClock",
		method: "post",
		data
	});
}

// 更新打卡
export function updateAttendClock(data) {
	return request({
		url: "/EHCommon/attendance/attendanceRecord/upAttendClock",
		method: "post",
		data
	});
}

