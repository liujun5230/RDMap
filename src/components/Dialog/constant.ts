import type {GetLocationObjectParams} from "@/api/locationObject/locationObject";
import {
	getPersonName,
	getPersonClass,
	getWorkType,
	getDuty,
	getVisitor,
	getTruck,
	getTruckType,
	getMaterial,
	getMaterialType,
	getContractor,
	getContractorUnit,
	getContractorWorkType,
	getBranch,
	getCardType,
	getScene,
	getArea
} from "@/api/locationObject/locationObject";
import {AreaType} from "@/types/global";

const getVirtualFence = async (data: GetLocationObjectParams) => {
	try {
		const {data: res} = await getArea(data);
		if (res.type === 1) {
			const result = res.result.filter(({type}) => type === SHUTTLE_TYPE.virtual_fence);
			return {data: {...res, result}};
		}
		return {data: res};
	} catch (error) {
		return Promise.reject(error);
	}
};

const getAttendance = async (data: GetLocationObjectParams) => {
	try {
		const {data: res} = await getArea(data);
		if (res.type === 1) {
			const result = res.result.filter(({type}) => type === SHUTTLE_TYPE.attendance);
			return {data: {...res, result}};
		}
		return {data: res};
	} catch (error) {
		return Promise.reject(error);
	}
};

const getRollCallAreas = async (data: GetLocationObjectParams) => {
	try {
		const {data: res} = await getArea(data);
		if (res.type === 1) {
			const result = res.result.filter(({type}) => type === SHUTTLE_TYPE.roll_call);
			return {data: {...res, result}};
		}
		return {data: res};
	} catch (error) {
		return Promise.reject(error);
	}
};

export const enum SHUTTLE_TYPE {
    branch = 1,
    duty = 2,
    work_type = 3,
    person_class = 4,
    truck_type = 5,
    material_type = 6,
    person = 7,
    truck = 8,
    visitor = 9,
    material = 10,
    card_type = 11,
    scene = 12,
    virtual_fence = 13,
    attendance = 14,
	roll_call = 15,
	contractor_unit = 17,
	contractor = 18,
	contractor_work_type = 19
}

export const SHUTTLE_FETCH = {
	[SHUTTLE_TYPE.branch]: getBranch,
	[SHUTTLE_TYPE.duty]: getDuty,
	[SHUTTLE_TYPE.work_type]: getWorkType,
	[SHUTTLE_TYPE.person_class]: getPersonClass,
	[SHUTTLE_TYPE.truck_type]: getTruckType,
	[SHUTTLE_TYPE.material_type]: getMaterialType,
	[SHUTTLE_TYPE.person]: getPersonName,
	[SHUTTLE_TYPE.truck]: getTruck,
	[SHUTTLE_TYPE.visitor]: getVisitor,
	[SHUTTLE_TYPE.material]: getMaterial,
	[SHUTTLE_TYPE.card_type]: getCardType,
	[SHUTTLE_TYPE.scene]: getScene,
	[SHUTTLE_TYPE.virtual_fence]: getVirtualFence,
	[SHUTTLE_TYPE.attendance]: getAttendance,
	[SHUTTLE_TYPE.roll_call]: getRollCallAreas,
	[SHUTTLE_TYPE.contractor]: getContractor,
	[SHUTTLE_TYPE.contractor_unit]: getContractorUnit,
	[SHUTTLE_TYPE.contractor_work_type]: getContractorWorkType,
};

export const SHUTTLE_API_PARAMS_KEY = {
	[SHUTTLE_TYPE.branch]: "branch_id_list",
	[SHUTTLE_TYPE.duty]: "duty_id_list",
	[SHUTTLE_TYPE.work_type]: "work_type_id_list",
	[SHUTTLE_TYPE.person_class]: "person_class_id_list",
	[SHUTTLE_TYPE.truck_type]: "truck_type_id_list",
	[SHUTTLE_TYPE.material_type]: "material_type_id_list",
	[SHUTTLE_TYPE.person]: "uuid_list",
	[SHUTTLE_TYPE.truck]: "uuid_list",
	[SHUTTLE_TYPE.visitor]: "uuid_list",
	[SHUTTLE_TYPE.material]: "uuid_list",
	[SHUTTLE_TYPE.card_type]: "card_type_id_list",
	[SHUTTLE_TYPE.scene]: "area_id_list",
	[SHUTTLE_TYPE.virtual_fence]: "area_id_list",
	[SHUTTLE_TYPE.attendance]: "area_id_list",
	[SHUTTLE_TYPE.roll_call]: "area_id_list",
	[SHUTTLE_TYPE.contractor]: "uuid_list",
	[SHUTTLE_TYPE.contractor_unit]: "contractor_unit_id_list",
	[SHUTTLE_TYPE.contractor_work_type]: "contractor_work_type_id_list"
};

// 区域类型-穿梭框类型的映射
export const AREA_TYPE_SHUTTLE_TYPE = {
	[AreaType.VIRTUAL_FENCE]: SHUTTLE_TYPE.virtual_fence,
	[AreaType.ATTENDANCE]: SHUTTLE_TYPE.attendance
};

export interface CheckedItem {
    id: number,
    name: string,
    type: SHUTTLE_TYPE
	branch_name?: string,
	unit_name?: string
}

export const enum DIALOG_MODE {
	add = "add",
	edit = "edit",
	view = "view"
}

export const ADD_INFO = {
	[SHUTTLE_TYPE.virtual_fence]: {
		text: "新增电子围栏",
		url: "/gpsManage#/regionalManagement"
	},
	[SHUTTLE_TYPE.roll_call]: {
		text: "新增点名区域",
		url: "/call#/setting"
	}
};
