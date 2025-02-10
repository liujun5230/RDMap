import request from "@/utils/js/request";
import type {RequireAtLeastOne} from "@/types/utils";
import type {Response} from "@/types/global";
import type {SelectedElement, Field} from "@/types/map";
import type {ModuleSorting} from "@index/utils/types";

// TODO 此文件之前是js文件，暂时使用Params类型处理，需要细化 api 参数类型
type Params = {
  [key: string]: any;
}

export function getStatisticsAreaList () {
	return request({
		url: "/EHCommon/homepage/pageInformation/getArea",
		method: "post",
	});
}

export function getStatisticsGroupList () {
	return request({
		url: "/EHCommon/homepage/pageInformation/getGroup",
		method: "post",
	});
}

export function getStatisticsAttendanceDayList () {
	return request({
		url: "/EHCommon/homepage/pageInformation/getPersonAttendance",
		method: "post",
	});
}

export function getStatisticsAttendanceBranchList (data: Params) {
	return request({
		url: "/EHCommon/homepage/pageInformation/getBranch",
		method: "post",
		data: data
	});
}

export function getStatisticsInfoList (data: Params) {
	return request({
		url: "/EHCommon/homepage/pageInformation/getInfo",
		method: "post",
		data: data
	});
}

export function getStatisticsDeviceCount () {
	return request({
		url: "/EHCommon/homepage/pageInformation/getDevice",
		method: "post",
	});
}

export function getAttendanceStatisticsData () {
	return request({
		url: "/EHCommon/homepage/pageInformation/attendanceStatistics ",
		method: "post",
	});
}

export function getAreaRecordStatisticsData () {
	return request({
		url: "/EHCommon/homepage/pageInformation/accessArea",
		method: "post",
	});
}

export function getDownHoleStatistics () {
	return request({
		url: "/EHCommon/homepage/pageInformation/downholeStatistics",
		method: "post"
	});
}

export function getRealTimeAttendance (data: Params) {
	return request({
		url: "/EHCommon/homepage/pageInformation/realTimeAttendance",
		method: "post",
		data
	});
}

export function getAttendanceStatistics (data: Params) {
	return request({
		url: "/EHCommon/homepage/pageInformation/attendanceStatistics",
		method: "post",
		data
	});
}

interface DeviceStatisticsItem {
	device_type_name: string,
	device_count: number,
	device_online_count: number
}
export interface AllDeviceNowInfoResult {
	vehicle: DeviceStatisticsItem,
	person: DeviceStatisticsItem,
	visitor: DeviceStatisticsItem,
	material: DeviceStatisticsItem,
	contractor: DeviceStatisticsItem,
}
export function getAllDeviceNowInfo(): Response<AllDeviceNowInfoResult> {
	return request({
		url: "/EHCommon/homepage/pageInformation/getAllDeviceNowInfo",
		method: "post",
	});
}

export type SearchParams = RequireAtLeastOne<Record<Field, string>>

export function getLocatorData (data: SearchParams): Response<SelectedElement[]> {
	return request({
		url: "/EHCommon/homepage/pageInformation/getLocatorData",
		method: "post",
		data
	});
}

export type SelectElementAPI = typeof getLocatorData

export type AttendanceClassParam = {flag: number, tree: ModuleSorting[], frequent_id?: number, filter_zero?: number}
export type AttendanceClassResponse = {name: string, id: number, actual_num: number, not_off_duty_num: number, off_duty_num: number, node?: AttendanceClassResponse[]}
export function getAttendanceClass(data: AttendanceClassParam): Response<AttendanceClassResponse[]> {
	return request({
		url: "/EHCommon/homepage/pageInformation/attendanceClass",
		method: "post",
		data
	});
}

export type AttendanceClassDetailParam = {
	branch_id?: number[],
	work_id?: number,
	duty_id?: number,
	class_id?: number,
	status?: 1 | 2, // 1-未下班，2-以下班
	flag: number,
	frequent_id?: number
}
export type AttendanceClassDetailRow = {branch_name: string, frequent_name: string, uuid: number, name: string, start_time: string, end_time: string, status: number}
export type AttendanceClassDetailResponse = {actual_num: number, not_off_duty_num: number, off_duty_num: number, data: AttendanceClassDetailRow[]}
export function getAttendanceClassDetail(data: AttendanceClassDetailParam): Response<AttendanceClassDetailResponse> {
	return request({
		url: "/EHCommon/homepage/pageInformation/attendanceClassEdit",
		method: "post",
		data
	});
}

