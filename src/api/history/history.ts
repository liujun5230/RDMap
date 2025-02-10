import request from "@/utils/js/request";
import type {Response} from "@/types/global";

export interface ObjectListParams {
	person_name?: string,
	visitor_name?: string,
	licence?: string,
	serial_num?: string,
	card_id?: string,
	uuid_list?: number[],
}
export interface ObjectListItem {
	card_id: number,
	uuid: number,
	name: string,
	utype: number,
	is_delete: "0" | "1" | null
}
export const getSearchPerson = (data: ObjectListParams): Response<ObjectListItem[]> => request({
	url: "/EHCommon/history/history/getObjectList",
	method: "post",
	data
});

export const getHistoryHeatMapByUUID = (data: any): Response<any> => request({
	url: "/EHCommon/history/history/getHistoryHeatMapByUUID",
	method: "post",
	data
});

// 合并接口
export const getCardHistory = (data: any): Response<any> => {
	return request({
		url: "/EHCommon/history/history/getCardHistory",
		method: "post",
		data
	});
};

export const getCardHistoryRequest = () => {
	const controller = new AbortController();
	const getCardHistory = (data: any) => request({
		url: "/EHCommon/history/history/getCardHistory",
		method: "post",
		data,
		signal: controller.signal
	});

	const abortGetCardHistory = () => controller.abort();

	return {
		getCardHistory,
		abortGetCardHistory
	};
};

export interface HistoryListParams {
	begin: number,
	end: number,
	uuid_list: number[],
	page?: number,
	limit?: number,
	floor_id_list?: number[],
	building_id?: number,
	scene_id?: number
}
export interface HistoryListRow {
	scene_id?: number,
	floor_id?: number,
	uuid_list: number[],
	start: number,
	end: number,
	name: string
}
export const getHistoryList = (data: HistoryListParams): Response<{count: number, data: HistoryListRow[]}> => request({
	url: "/EHCommon/history/history/getCardFloorDataTime",
	method: "post",
	data
});

export const getHistoryListLimit = (data: HistoryListParams): Response<HistoryListRow[]> => request({
	url: "/EHCommon/history/history/getCardFloorDataTimeLimit",
	method: "post",
	data
});

// 合并后
export const getSysConfig = (data?: any): Response<any> => request({
	url: "/EHCommon/configuration/sysConfig/getSysConfig",
	method: "post",
	data
});

export interface Icon_model_attr {
	model_2d_url: string;
	model_2d_s_url: string;
	model_3d_url: string;
}

export interface MaterialInfoResult {
	uuid: number;
	serial_num: string;
	name: string;
	type: number;
	type_name: string;
	icon_id: number;
	icon_follow_type: number;
	model_id: number;
	model_follow_type: number;
	picture: string;
	card_id: number | null;
	/** 0-未删除，1-已删除，null-已删除 */
	is_delete: 0 | 1 | null;
	utype: number;
	icon_model_attr: Icon_model_attr;
}
/**
 * 查询物资信息（包含假删除物资）
 */
export const getMaterialInfo = (data?: {uuid_list: number[]}): Response<MaterialInfoResult[]> => request({
	url: "/EHCommon/history/history/getMaterialInfo",
	method: "post",
	data
});

export interface PersonInfoResult {
	uuid: number;
	card_id: number | null;
	name: string;
	branch_id: number;
	branch_name: string;
	/** 0-未删除，1-已删除，null-已删除 */
	is_delete: 0 | 1 | null;
	picture: string;
	sex: 1 | 2;
	icon_id: number;
	model_id: number;
	icon_follow_type: number;
	model_follow_type: number;
	utype: number;
	icon_model_attr: Icon_model_attr;
}
/**
 * 查询员工信息（包含假删除员工）
 */
export const getPersonInfo = (data?: {uuid_list: number}): Response<PersonInfoResult[]> => request({
	url: "/EHCommon/history/history/getPersonInfo",
	method: "post",
	data
});

export interface VisitorInfoResult {
	uuid: number;
	card_id: number | null;
	name: string;
	company: string;
	picture: string;
	icon_id: number;
	icon_follow_type: number;
	model_id: number;
	sex: 1 | 2;
	/** 0-未删除，1-已删除，null-已删除 */
	is_delete: 0 | 1 | null;
	icon_model_attr: Icon_model_attr;
	utype: number;
}
/**
 * 查询访客信息（包含假删除访客）
 */
export const getVisitorInfo = (data?: {uuid_list: number[]}): Response<VisitorInfoResult[]> => request({
	url: "/EHCommon/history/history/getVisitorInfo",
	method: "post",
	data
});

export interface TruckInfoResult {
	uuid: number;
	driver: string;
	licence: string;
	unit: string;
	/** 0-未删除，1-已删除，null-已删除  */
	is_delete: 0 | 1 | null;
	type: number;
	type_name: string;
	icon_id: number;
	icon_follow_type: number;
	model_id: number;
	model_follow_type: number;
	picture: string;
	card_id: number | null;
	truck_dict: string;
	utype: number;
	icon_model_attr: Icon_model_attr;
}
/**
 * 查询车辆信息（包含假删除车辆）
 */
export const getTruckInfo = (data?: {uuid_list: number[]}): Response<TruckInfoResult[]> => request({
	url: "/EHCommon/history/history/getTruckInfo",
	method: "post",
	data
});

export interface ContractorInfoResult {
	uuid: number;
	name: string;
	/** 0-未删除，1-已删除，null-已删除 */
	is_delete: 0 | 1 | null;
	unit_id: string;
	unit_name: string;
	sex: 1 | 2,
	icon_id: number;
	icon_follow_type: number;
	model_id: number;
	model_follow_type: number;
	photo: string | null;
	card_id: number | null;
	dict_data: Record<number, any>;
	utype: number;
	icon_model_attr: Icon_model_attr;
}
/**
 * 查询承包商人员信息（包含假删除承包商人员）
 */
export const getContractorInfo = (data?: {uuid_list: number[]}): Response<ContractorInfoResult[]> => request({
	url: "/EHCommon/history/history/getContractorInfo",
	method: "post",
	data
});

export interface HistoryDistributionParams {
	time: string,
	page?: number,
	limit?: number,
	card_id?: number,
	branch_id?: number,
	person_name?: string,
	visitor_name?: string,
	licence?: string,
	serial_num?: string,
	utype?: number,
	scene_id?: number,
	building_id?: number,
	floor_id?: number,
	areas?: Record<number, number[]>
}
interface Area {
	area_id: number;
	area_name: string;
	group_id: number;
	group_name: number;
	type: number;
}
export interface HistoryDistributionRow {
	id: number;
	uuid: number;
	name: string;
	time: string;
	card_id: number;
	related_info: string;
	scene_id: number;
	building_id: number;
	floor_id: number;
	map: string;
	areas: Area[];
	show_area: string;
	area_id_list: string;
	x: number;
	y: number;
	z: number;
	utype: number;
	coordinate: string;
}
export interface HistoryDistributionResult {
	count: number,
	data: HistoryDistributionRow[]
}
/**
 * 用于轨迹回放和首页历史分布查询
 * @param data
 */
export const getHistoricalDistributionList = (data: HistoryDistributionParams): Response<HistoryDistributionResult> => request({
	url: "/EHCommon/history/history/historicalDistribution",
	method: "post",
	data
});

interface HistoryDistributionMapResult {
	scene_id_list: number[],
	building_id_list: number[],
	floor_id_list: number[]
}
/**
 * 获取指定时刻有历史数据的楼层
 */
export const getHistoricalDistributionMapInfo = (data: {time: string}): Response<HistoryDistributionMapResult> => request({
	url: "/EHCommon/history/history/getHistoricalDistributionMapInfo",
	method: "post",
	data
});
