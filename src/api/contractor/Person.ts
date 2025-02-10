import request from "@/utils/js/request";
import type {Response} from "@/types/global";
import type {DICT_TYPE, DictOptionItem, AddDictParams, UpdateDictParams} from "@/types/dict";
import type {UTYPES} from "@/utils/js/constant";

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
export const getContractorDict = (data: {
    name: string,
    is_display: 0 | 1,
    is_require: 0 | 1
}): Response<{count: number, data: GetContractorUnitDictRow[]}> => {
	return request({
		url: "/EHCommon/contractor/Person/getDict",
		method: "post",
		data
	});
};

export const addContractorDict = (data: AddDictParams): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Person/addDict",
		method: "post",
		data
	});
};

export const updateContractorDict = (data: UpdateDictParams): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Person/updateDict",
		method: "post",
		data
	});
};

export const deleteContractorDict = (data: {id: number}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Person/deleteDict",
		method: "post",
		data
	});
};

export const checkContractorDictName = (data: {id?: number, name: string}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Person/checkDictName",
		method: "post",
		data
	});
};

export const batchUnbindContractorCard = (data: {uuid_list: number[]}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Person/batchUnbindCard",
		method: "post",
		data
	});
};

export const whetherCanUnBind = (data: {card_id: number}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Person/whetherCanUnBind",
		method: "post",
		data
	});
};

export interface ContractorPersonRow {
	id: number
	uuid: number
	card_id: number
	utype: UTYPES
	unit_id: number
	unit_name: string
	id_code: string
	name: string
	picture: number
	icon_id: number
	icon_follow_type: 1 | 2
	model_id: number
	model_follow_type: number
}
export const getContractorPerson = (data?: {
	page?: number
	limit?: number
	icon_id?: number
	model_id?: number
	unit_id?: number
	id_code?: string
	name?: string
	work_type_id?: number
	card_id?: string
	binding_card?: 1 | 0
}): Response<{data: ContractorPersonRow[], count: number}> => {
	return request({
		url: "/EHCommon/contractor/Person/getPerson",
		method: "post",
		data
	});
};

export interface ContractorPersonRequest {
	uuid?: number
	unit_id: number
	name: string
	card_id?:number
	id_code: string
	icon_id: number
	icon_follow_type: number
	model_id: number
	model_follow_type: number
	dict_data?:{}
}

export const getContractorImportTemplate = (): Blob => {
	return request({
		url: "/EHCommon/contractor/Person/template",
		method: "post",
		responseType: "blob",
	});
};

export const batchChangeContractorIcon = (data: {
	uuid_list: number[]
	icon_id: number
	icon_follow_type: number
}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Person/batchChangeIcon",
		method: "post",
		data
	});
};

export const batchChangeContractorModel = (data: {
	uuid_list: number[]
	model_id: number
	model_follow_type: number
}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Person/batchChangeModel",
		method: "post",
		data
	});
};

export const batchChangeContractorUnit = (data: {
	uuid_list: number[]
	unit_id: number
}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Person/batchChangeUnit",
		method: "post",
		data
	});
};

export const getContractorManager = (data: {
	uuid?: number
	name_id_code?: string
}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Person/getManager",
		method: "post",
		data
	});
};

export const addContractorPerson = (data: ContractorPersonRequest): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Person/addPerson",
		method: "post",
		data
	});
};

export const updateContractorPerson = (data: ContractorPersonRequest): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Person/updatePerson",
		method: "post",
		data
	});
};

export const deleteContractorPerson = (data: {
	uuid_list: number[]
}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Person/deletePerson",
		method: "post",
		data
	});
};

export const changeContractorCard = (data: {
	uuid: number,
	card_id:number
}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Person/changeCard",
		method: "post",
		data
	});
};

export const unBindContractorCard = (data: {
	uuid: number
}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Person/unbindCard",
		method: "post",
		data
	});
};

export const validateIDCode = (data: {
	id_code:string
	uuid?: number
}): Response<string> => {
	return request({
		url: "/EHCommon/contractor/Person/validateIDCode",
		method: "post",
		data
	});
};
