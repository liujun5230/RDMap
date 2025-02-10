import type {EHCommonResponse} from "@/types/request";
import request from "@/utils/js/request";

export type AttendanceArea = {
	id: number;
	name: string;
	is_use: number;
	floor_id: number;
	is_gps: number;
	area: string;
	area_template_info: {
		id: number;
		name: string;
		area_style: string;
		relative_start: number;
		relative_end: number;
		disappear_time: number;
	};
	attendance_group_info: {
		id: number;
		attendance_group_name: string;
		attendance_type: number;
		person_count: number;
		frequent: string;
	}[];
}
// 获取考勤区域
export function getAttendanceArea(data: {name?: string, floor_id: number}) {
	return request<EHCommonResponse<AttendanceArea[]>>({
		url: "/EHCommon/attendance/attendanceArea/getAttendanceArea",
		method: "post",
		data
	});
}

// 新增考勤区域
type AddParams = {
	name: string;
	is_gps: number;
	floor_id: number;
	is_use: number;
	area: string;
	area_template_id: number;
}
export function addAttendanceArea(data: AddParams) {
	return request<EHCommonResponse<number | string>>({
		url: "/EHCommon/attendance/attendanceArea/addAttendanceArea",
		method: "post",
		data
	});
}

type UpdateParams = {
	id: number;
	name: string;
	is_gps: number;
	floor_id: number;
	is_use: number;
	area: string;
	area_template_id: number;
}

// 修改考勤区域
export function updateAttendanceArea(data: UpdateParams) {
	return request<EHCommonResponse<string>>({
		url: "/EHCommon/attendance/attendanceArea/updateAttendanceArea",
		method: "post",
		data
	});
}

// 删除考勤区域
export function deleteAttendanceArea(data: {id: number}) {
	return request<EHCommonResponse<string>>({
		url: "/EHCommon/attendance/attendanceArea/deleteAttendanceArea",
		method: "post",
		data
	});
}
