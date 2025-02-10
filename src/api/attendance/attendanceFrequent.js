import request from "@/utils/js/request";

/**
 * 添加班次
 * @param data
 * @returns {AxiosPromise}
 */
export function addAttendanceFrequent(data) {
	return request({
		url: "/EHCommon/attendance/attendanceFrequent/addAttendanceFrequent",
		method: "post",
		data
	});
}

/**
 * 获取班次
 * @param data
 * @returns {AxiosPromise}
 */
export function getAttendanceFrequent(data) {
	return request({
		url: "/EHCommon/attendance/attendanceFrequent/getAttendanceFrequent",
		method: "post",
		data
	});
}

/**
 * 更新班次
 * @param data
 * @returns {AxiosPromise}
 */
export function updateAttendanceFrequent(data) {
	return request({
		url: "/EHCommon/attendance/attendanceFrequent/updateAttendanceFrequent",
		method: "post",
		data
	});
}

/**
 * 删除班次
 * @param data
 * @returns {AxiosPromise}
 */
export function deleteAttendanceFrequent(data) {
	return request({
		url: "/EHCommon/attendance/attendanceFrequent/deleteAttendanceFrequent",
		method: "post",
		data
	});
}

export function updateAttendanceFrequentCheck(data) {
	return request({
		url: "/EHCommon/attendance/attendanceFrequent/updateAttendanceFrequentCheck",
		method: "post",
		data
	});
}

export function getUniqueId() {
	return request({
		url: "/EHCommon/attendance/attendanceFrequent/getUniqueId",
		method: "post"
	});
}
