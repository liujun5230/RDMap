import request from "@/utils/js/request";
import type {Response} from "@/types/global";
import type {IconModelAttr} from "@/types/map";

export interface GetIconListParams {
	icon_name?: string,
	/** 0-不区分男女，1-区分男女 */
	icon_sex?: 0 | 1,
	/** 可配标签类型 1-员工，2-车辆，3-访客，5-物资，6-基站 */
	icon_things_type?: number,
	is_custom?: 0 | 1,
	order?: "asc" | "desc" | string & {},
	field?: string,
	page?: number,
	limit?: number,
	/** 过滤可配标签类型 */
	filter_things_type_list: number[]
}
type IconPicture = Pick<IconModelAttr, "model_2d_off_s_url" | "model_2d_off_url" | "model_2d_url" | "model_2d_s_url">
export interface GetIconListRow {
	id: number,
	can_edt: 0 | 1,
	comment: string,
	icon_name: string,
	icon_picture_man: IconPicture | null,
	icon_picture_woman: IconPicture | null,
	icon_sex: 0 | 1,
	icon_things_type: number,
	is_custom: 0 | 1,
	create_time: string,
	update_time: string,
	icon_picture: IconPicture
}
export function getIconList(data?: GetIconListParams): Response<{count: number, data: GetIconListRow[]}> {
	return request({
		url: "/EHCommon/characterModel/icon/get",
		method: "post",
		data
	});
}

export function addIcon(data: unknown) {
	return request({
		url: "/EHCommon/characterModel/icon/add",
		method: "post",
		data
	});
}

export function editIcon(data: unknown) {
	return request({
		url: "/EHCommon/characterModel/icon/edt",
		method: "post",
		data
	});
}

export function deleteIcon(data: unknown) {
	return request({
		url: "/EHCommon/characterModel/icon/del",
		method: "post",
		data
	});
}

// 批量删除二维图标
export function batchDeleteIcon(data: unknown) {
	return request({
		url: "/EHCommon/characterModel/icon/batchDel",
		method: "post",
		data
	});
}

export function checkIconName(data: unknown) {
	return request({
		url: "/EHCommon/characterModel/icon/checkName",
		method: "post",
		data
	});
}

export function getDefaultIcon(data: unknown) {
	return request({
		url: "/EHCommon/characterModel/icon/getDefaultIcon",
		method: "post",
		data
	});
}
