import request from "@/utils/js/request";
import type {Response} from "@/types/global";
import type {DICT_TYPE, DictOptionItem, AddDictParams, UpdateDictParams} from "@/types/dict";
import type {IconModelAttr} from "@/types/map";

export interface GetContractorUnitDictRow {
    id: number,
    name: string,
    sort_number: number,
    btn_delete: 0 | 1,
    btn_edit: 0 | 1,
    is_sort: 0 | 1,
    btn_name: 0 | 1,
    is_display: 0 | 1,
    btn_display: 0 | 1,
    is_require: 0 | 1,
    btn_require: 0 | 1,
    type: DICT_TYPE,
    btn_type: 0 | 1,
    type_size: number,
    btn_type_size: 0 | 1,
    option?: DictOptionItem[],
    option_length: number,
    option_sort: 0 | 1,
    option_system_edit: 0 | 1,
    option_user_edit: 0 | 1,
    field: string
}
export const getContractorUnitDict = (data: {
    name?: string,
    is_display?: 0 | 1,
    is_require?: 0 | 1
}): Response<GetContractorUnitDictRow[]> => {
	return request({
		url: "/EHCommon/contractor/Company/getDict",
		method: "post",
		data
	});
};

export const addContractorUnitDict = (data: AddDictParams): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Company/addDict",
		method: "post",
		data
	});
};

export const updateContractorUnitDict = (data: UpdateDictParams): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Company/updateDict",
		method: "post",
		data
	});
};

export const deleteContractorUnitDict = (data: {id: number}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Company/deleteDict",
		method: "post",
		data
	});
};

export const checkContractorUnitDictName = (data: {id?: number, name: string}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Company/checkDictName",
		method: "post",
		data
	});
};

export interface ContractorUnitRow {
	id: number
	name: string
	type_id: number
	icon_id: number
	icon_follow_type: number
	model_id: number
	leader: number
	manager: number
	comment: string
	type_name: string
	leader_name: string
	manager_name: string
	dict_data: {
		id: number
		type: number
		content: string
		option_id: number
		option_ay: number[]
		value: string
		icon_model_attr: IconModelAttr
		icon_name: string
		model_name: string
	}
}
export const getContractorUnit = (data: {
	page?: number
	limit?: number
	name?: string
	icon_id?: number
	model_id?: number
	type_id?: number
	leader_name?: string
	manager_name?: string
}): Response<{data: ContractorUnitRow[]; count: number}> => {
	return request({
		url: "/EHCommon/contractor/Company/getUnit",
		method: "post",
		data
	});
};

export const addContractorUnit = (data: {
	icon_id: number
	model_id: number
	type_id: number
	name: string,
	icon_follow_type:number,
	dict_data?:{
		dict_id?:number,
		content?:any
	}
}): Response<{data: ContractorUnitRow[]; count: number}> => {
	return request({
		url: "/EHCommon/contractor/Company/addUnit",
		method: "post",
		data
	});
};

export const updateContractorUnit = (data: {
	id:number
	icon_id: number
	model_id: number
	type_id: number
	name: string,
	icon_follow_type:number,
	dict_data?:{
		dict_id?:number,
		content?:any
	}
}): Response<{data: ContractorUnitRow[]; count: number}> => {
	return request({
		url: "/EHCommon/contractor/Company/updateUnit",
		method: "post",
		data
	});
};

export const orderContractorDict = (data: {display: string}): Response<{ display: string }> => {
	return request({
		url: "/EHCommon/contractor/Company/orderDict",
		method: "post",
		data
	});
};

export const deleteContractorUnit = (data: {id_list: number[]}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Company/deleteUnit",
		method: "post",
		data
	});
};

export const checkUnitTypeName = (data: {id?: number, name: string}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Company/checkTypeName",
		method: "post",
		data
	});
};

export const getUnitType = (): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Company/getType",
		method: "post"
	});
};

export const addUnitType = (data: {name: string}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Company/addType",
		method: "post",
		data
	});
};

export const editUnitType = (data: {id: number, name: string}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Company/updateType",
		method: "post",
		data
	});
};

export const deleteUnitType = (data: {id_list: number[]}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Company/deleteType",
		method: "post",
		data
	});
};

export const getUnitImportTemplate = (): Response<Blob> => {
	return request({
		url: "/EHCommon/contractor/Company/template",
		method: "post",
		responseType: "blob"
	});
};

export const batchChangeUnitType = (data: {unit_id_list: number[], type_id: number}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Company/batchChangeType",
		method: "post",
		data
	});
};

export const deleteUnit = (data: {id_list: number[]}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Company/deleteUnit",
		method: "post",
		data
	});
};

export const orderUnit = (data: {order: Record<string, number>}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Company/orderUnit",
		method: "post",
		data
	});
};

export const orderUnitType = (data: {order: Record<string, number>}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Company/orderType",
		method: "post",
		data
	});
};

export const checkUnitName = (data: {id?: number, name: string}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Company/checkName",
		method: "post",
		data
	});
};

export const batchChangeUnitIcon = (data: {
	id_list: number[]
	icon_id: number
	icon_follow_type: number
}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Company/batchChangeIcon",
		method: "post",
		data
	});
};

export const batchChangeUnitModel = (data: {
	id_list: number[]
	model_id: number
	model_follow_type: number
}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Company/batchChangeModel",
		method: "post",
		data
	});
};
