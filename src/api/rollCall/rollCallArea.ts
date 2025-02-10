import request from "@/utils/js/request";
import type {Response} from "@/types/global";

export interface GetCallAreaParams {
	name?: string,
	page?: number,
	limit?: number,
	floor_id?: number,
	homepage_start_time?: number,
	homepage_stop_time?: number,
}
export interface CallAreaRuleItem {
	id: number,
	name: string
}
export interface GetCallAreaRow {
	id: number,
	name: string,
	area: string,
	area_template_name: string,
	area_template: {
		area_style: string,
		relative_end: number,
		relative_start: number,
	},
	floor_id: number,
	z_end: number,
	z_start: number,
	rules: CallAreaRuleItem[]
}
/**
 * 查询电子点名区域
 * @param data
 */
export const getRollCallArea = (data?: GetCallAreaParams): Response<{count: number, data: GetCallAreaRow[]}> => request({
	url: "/EHCommon/rollcall/rollCallArea/getRollCallArea",
	method: "post",
	data
});

export interface DeleteCallAreaParams {
	id: number
}
/**
 * 删除电子点名区域
 * @param data
 */
export const deleteRollCallArea = (data: DeleteCallAreaParams): Response<string> => request({
	url: "/EHCommon/rollcall/rollCallArea/deleteRollCallArea",
	method: "post",
	data
});

export interface AddCallAreaParams {
	name: string,
	floor_id: number,
	// is_use: 0 | 1,
	area: string,
	shape: number, // 1-非圆形，2-圆形
	area_template_id: number,
	alarm_rule_id_list: number[]
	circle_attribute?: string,
}
/**
 * 新增点名区域
 */
export const addRollCallArea = (data: AddCallAreaParams): Response<string> => request({
	url: "/EHCommon/rollcall/rollCallArea/addRollCallArea",
	method: "post",
	data
});

export interface UpdateCallAreaParams extends AddCallAreaParams {
	id: number
}
/**
 * 更新点名区域
 * @param data
 */
export const updateRollCallArea = (data: UpdateCallAreaParams): Response<string> => request({
	url: "/EHCommon/rollcall/rollCallArea/updateRollCallArea",
	method: "post",
	data
});
