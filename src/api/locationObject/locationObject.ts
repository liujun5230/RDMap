import request from "@/utils/js/request";

import type {Response} from "@/types/global";
import {SHUTTLE_TYPE} from "@/components/Dialog/constant";

export interface GetLocationObjectParams {
	name?: string,
	name_id_code?: string,
	/** 1-包含假删除，0-不包含假删除，默认为0 */
	soft_delete?: 0 | 1
}
export interface GetLocationObjectItem {
	id: number,
	name: string,
	pid: number,
	type: SHUTTLE_TYPE,
	branch_name?: string,
	unit?: string
	nodes?: GetLocationObjectItem[]
}
export interface GetFlatLocationObjectItem {
	id: number,
	name: string,
	type: SHUTTLE_TYPE,
	id_code?: string,
	branch_name?: string,
	unit?: string
}

export const getPersonName = (data: GetLocationObjectParams): Response<GetFlatLocationObjectItem[]> => request({
	url: "/EHCommon/locationobject/LocationObject/getPerson",
	method: "post",
	data
});

export const getPersonClass = (data: GetLocationObjectParams): Response<GetLocationObjectItem[]> => request({
	url: "/EHCommon/locationobject/LocationObject/getPersonClass",
	method: "post",
	data
});

export const getWorkType = (data: GetLocationObjectParams): Response<GetLocationObjectItem[]> => request({
	url: "/EHCommon/locationobject/LocationObject/getWorkType",
	method: "post",
	data
});

export const getDuty = (data: GetLocationObjectParams): Response<GetLocationObjectItem[]> => request({
	url: "/EHCommon/locationobject/LocationObject/getDuty",
	method: "post",
	data
});

export interface GetBranchItem extends GetLocationObjectItem {
	person_list?: GetFlatLocationObjectItem[],
	nodes?: GetBranchItem[]
}
export const getBranch = (data: GetLocationObjectParams): Response<GetBranchItem[]> => request({
	url: "/EHCommon/locationobject/LocationObject/getBranch",
	method: "post",
	data
});

export const getVisitor = (data: GetLocationObjectParams): Response<GetFlatLocationObjectItem[]> => request({
	url: "/EHCommon/locationobject/LocationObject/getVisitor",
	method: "post",
	data
});

export const getTruck = (data: GetLocationObjectParams): Response<GetFlatLocationObjectItem[]> => request({
	url: "/EHCommon/locationobject/LocationObject/getTruck",
	method: "post",
	data
});
export const getTruckType = (data: GetLocationObjectParams): Response<GetLocationObjectItem[]> => request({
	url: "/EHCommon/locationobject/LocationObject/getTruckType",
	method: "post",
	data
});

export const getMaterial = (data: GetLocationObjectParams): Response<GetFlatLocationObjectItem[]> => request({
	url: "/EHCommon/locationobject/LocationObject/getMaterial",
	method: "post",
	data
});
export const getMaterialType = (data: GetLocationObjectParams): Response<GetLocationObjectItem[]> => request({
	url: "/EHCommon/locationobject/LocationObject/getMaterialType",
	method: "post",
	data
});

export const getContractor = (data: GetLocationObjectParams): Response<GetFlatLocationObjectItem[]> => request({
	url: "/EHCommon/locationobject/LocationObject/getContractor",
	method: "post",
	data
});
export const getContractorUnit = (data: GetLocationObjectParams): Response<GetLocationObjectItem[]> => request({
	url: "/EHCommon/locationobject/LocationObject/getContractorUnit",
	method: "post",
	data
});
export const getContractorWorkType = (data: GetLocationObjectParams): Response<GetLocationObjectItem[]> => request({
	url: "/EHCommon/locationobject/LocationObject/getContractorWork",
	method: "post",
	data
});

export const getCardType = (data: GetLocationObjectParams): Response<GetFlatLocationObjectItem[]> => request({
	url: "/EHCommon/locationobject/LocationObject/getCardType",
	method: "post",
	data
});

export const getScene = (data: GetLocationObjectParams): Response<GetFlatLocationObjectItem[]> => request({
	url: "/EHCommon/locationobject/LocationObject/getScene",
	method: "post",
	data
});

export const getArea = (data: GetLocationObjectParams): Response<GetFlatLocationObjectItem[]> => request({
	url: "/EHCommon/locationobject/LocationObject/getArea",
	method: "post",
	data
});
