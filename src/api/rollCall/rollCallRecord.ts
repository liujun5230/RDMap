import type {EHCommonResponse} from "@/types/request";
import request from "@/utils/js/request";

export interface RollCallRecordParams {
	begin?: number,
	end?: number,
    area_id?: number,
    status?: 0 | 1,
    dispose_status?: 0 | 1,
	name?: string,
    order?: string,
    field?: string,
	page?: number,
	limit?: number
}
export interface RollCallRecordRow {
	id: number,
    task_name: string,
    rule_id: number,
    rule_name: string,
    time: number,
    expected_count: number,
    actual_count: number,
    actual: {uuid: number, name: string}[],
    absent_count: number,
    absent: {uuid: number, name: string}[],
    status: 0 | 1,
    dispose_status: 0 | 1,
    dispose: string,
    dispose_time: string,
    comment: string,
    show_area: string,
    areas: {area_id: number, area_name: string, type: number}[],
    alarm_manual_handling_setting: 0 | 1
}
export const getRollCallRecord = (data: RollCallRecordParams) => request<EHCommonResponse<{
	count: number,
	data: RollCallRecordRow[]
}>>({
	url: "/EHCommon/rollcall/rollCallRecord/get",
	method: "post",
	data
});

export interface RollCallRecordDetailParams {
    id: number,
    area_id?: number,
    status?: 0 | 1,
    page?: number,
    limit?: number
}
export type RollCallRecordDetailData = Omit<RollCallRecordRow, "actual" | "absent" | "dispose_status" | "dispose" | "dispose_time" | "comment"> & {
    roll_call_details: {
        count: number,
        data: {
            uuid: number,
            card_id: number,
            utype: number,
            name: string,
            related_info: string,
            status: 0 | 1,
        }[]
    }
}
// 点名记录详情
export const getRollCallRecordDetail = (data: RollCallRecordDetailParams) => request<EHCommonResponse<RollCallRecordDetailData>>({
	url: "/EHCommon/rollcall/rollCallRecord/details",
	method: "post",
	data
});

// 批量删除点名记录
export const batchDeleteRollCallRecord = (data: {id_list: number[]}) => request<EHCommonResponse<string>>({
	url: "/EHCommon/rollcall/rollCallRecord/batchDeleteRollCallRecord",
	method: "post",
	data
});

// 批量处理点名记录
export const batchDisposeRollCallRecord = (data: {id_list: number[], is_batch: 0 | 1, comment?: string, status?: 0 | 1}) => request<EHCommonResponse<string>>({
	url: "/EHCommon/rollcall/rollCallRecord/batchDispose",
	method: "post",
	data
});
