import request from "@/utils/js/request";
import type {Response} from "@/types/global";
import type {ALARM_LEVEL, ALARM_TYPE} from "@/types/alarm";
import type {DEVICE_TYPE, UTYPES} from "@/utils/js/constant";
import {PositionObjTypeEnum} from "@index/store/useDetailDialogStore";

export interface MultipleDetailResponse {
    uuid: number,
    card_id: number,
    name: string,
    areas: {
        area_id: number,
        area_name: string,
        group_id: number,
        group_name: number
    }[],
    floor_id: number,
    in_area_time: string,
    stay_time: number,
    branch_id?: number,
    branch_name?: string,
    job_num?: string, // 员工工号
    company?: string, // 访客单位
    serial_num?: string,
    licence?: string,
    type_id?: number, // 物资类型id / 车辆类型id
    type?: string, // 物资类型名称 / 车辆类型名称
    driver?: string,
}

export interface SingleDetailParams {
    uuid?: number,
    time?:string,
    card_id?:number,
    use_gps?:number,
}

export interface SingleCardDetailParams {
    card_id?: number,
    use_gps?:number,
}

export interface SingleCardDetailResponse {
    card_id:number,
    power?:string,
    status?:number,
    floor?:string,
    area?:string,
    in_area_time?:number,
    stay_time?:number,
    bs_distance?:string,
    x?:number,
    y?:number,
    z?:number,
    floor_id?:number,
    photo?:string,
    is_lower_power?:boolean,
    is_video:boolean,
    is_message_distribution:boolean,
}
export interface SinglePersonDetailResponse {
    uuid: number,
    utype:PositionObjTypeEnum,
    danger_radius?:number | null,
    is_video:boolean,
    is_message_distribution:boolean,
    base_info: {
        photo?: string,
        name?: string,
        sex?:string,
        branch?:string,
        job_num?:string,
        work_type?:string,
        duty?:string,
        person_class?:string,
        phone?:string,
        id_code?:string,
        birthday?:string,
        degree?:string,
        age?:number,
        nation?:string,
        workplace?:string,
        address?:string,
        dict_json?:{}
    },
    in_out_data:{
        in_time?:number,
        out_time?:number,
        stay_time?:number
    },
    attendance:{
        group?:string,
        frequent?:string,
        start_time?:string,
        end_time?:string,
        work_time?:number
    },
    health:{
        heart_rate?:number,
        oxygen?:number,
        body_temperature?:number,
        distance?:number,
        step?:number
    },
    location:SingleCardDetailResponse
}

export interface SingleMaterialDetailResponse {
    uuid: number,
    is_video:boolean,
    is_message_distribution:boolean,
    base_info: {
        photo?: string,
        name?: string,
        serial_num?:string,
        type?:string,
        material_dict?:{}
    },
    location:SingleCardDetailResponse
}

export interface SingleVisitorDetailResponse {
    uuid: number,
    is_video:boolean,
    is_message_distribution:boolean,
    base_info: {
        photo?: string,
        name?: string,
        sex?:string,
        unit?:string,
        phone?:string,
        id_code?:string,
        visitor_dict?:{}
    },
    appointment:{
        status?:number,
        reserve_start_time?:string,
        reserve_end_time?:string
    },
    health:{
        heart_rate?:number,
        oxygen?:number,
        body_temperature?:number,
        distance?:number,
        step?:number
    },
    location:SingleCardDetailResponse
}

export interface SingleTruckDetailResponse {
    uuid: number,
    is_video:boolean,
    is_message_distribution:boolean,
    base_info: {
        photo?: string,
        licence?: string,
        driver?:string,
        type?:string,
        phone?:string,
        id_code?:string,
        truck_dict?:{}
    },
    location:SingleCardDetailResponse
}

/** 人员单详情 */
export const getPersonSingleDetail = (data: SingleDetailParams): Response<SinglePersonDetailResponse> => request({
	url: "/EHCommon/homepage/WindowDetail/personDetail",
	method: "post",
	data
});

/** 物资单详情 */
export const getMaterialSingleDetail = (data: SingleDetailParams): Response<SingleMaterialDetailResponse> => request({
	url: "/EHCommon/homepage/WindowDetail/materialDetail",
	method: "post",
	data
});

/** 访客单详情 */
export const getVisitorSingleDetail = (data: SingleDetailParams): Response<SingleVisitorDetailResponse> => request({
	url: "/EHCommon/homepage/WindowDetail/visitorDetail",
	method: "post",
	data
});

/** 车辆单详情 */
export const getTruckSingleDetail = (data: SingleDetailParams): Response<SingleTruckDetailResponse> => request({
	url: "/EHCommon/homepage/WindowDetail/truckDetail",
	method: "post",
	data
});

/** 陌生卡单详情 */
export const getCardSingleDetail = (data: SingleCardDetailParams): Response<SingleCardDetailResponse> => request({
	url: "/EHCommon/homepage/WindowDetail/cardDetail",
	method: "post",
	data
});

export const getSingleDetail = (data: SingleDetailParams): Response<SinglePersonDetailResponse> => request({
	url: "/EHCommon/homepage/WindowDetail/detail",
	method: "post",
	data
});

/** 上下井和考勤是否显示 */
export const getDisplaySetting = (): any => request({
	url: "/EHCommon/homepage/WindowDetail/getDisplaySetting",
	method: "post",
});

export interface MultipleDetailAlarmParams {
    flag: 0 | 1, // 0-不包含点名数据，1-包含点名数据
    type: number, // 1-区域，2-区域分组，3-区域类型
    id: number, // 区域id 或 区域分组id 或 区域类型id
    column: number // 1-全部，2-定位对象，3-区域，4-SOS，5-设备，6-事故，7-健康，8-点名
    begin: number,
    end: number,
    rule_type_list: number[],
    page?: number,
    limit?: number
}

export interface AlarmMultipleDetailResponse {
    id: number, // 告警id
    level: ALARM_LEVEL | null,
    rule_type: ALARM_TYPE,
    rule_type_name: string,
    rule_name: string,
    area_name: string,
    area_id: number,
    name: string,
    time: number,
    related_info: string,
    utype: UTYPES | null, // 设备下utype为null
    uuid: number | string, // 定位对象和设备id
    card_id: number,
    device_type: DEVICE_TYPE | null, // 设备类型，定位对象和sos告警不返回
    alarm_manual_handling_setting: 0 | 1, // 0-处理内容非必填，1-处理内容必填
}

/** 报警多详情 */
export const getDayAlarmByAreaDetails = (data: MultipleDetailAlarmParams): Response<{count: Record<number, number>, data: AlarmMultipleDetailResponse[]}> => request({
	url: "/EHCommon/homepage/DataStatisticsDayAlarm/getDayAlarmByAreaDetails",
	method: "post",
	data
});

export interface PositionObjMultiDetailParams {
    utype_list?: number[], // 传递1就只返回员工
    areas?: Record<number, number[]>,
    area_type?: number,
    tmp_area?: string,
    tmp_area_floor_id?: number,
    tmp_area_scene_id?: number,
    tmp_area_relative_start?: number,
    tmp_area_relative_end?: number,
    floor_id_list?: number[],
    building_id?: number,
    scene_id?: number,
    person_class_id?: number,
    branch_id?: number | number[],
    duty_id?: number,
    work_type_id?: number,
    truck_type_id?: number,
	material_type_id?: number
    visitor_company?: string,
    unit_id?:number,
    page?: number,
    limit?: number
}

export type PositionObjMultiDetailBaseResult = {
    uuid: number,
    name: string,
    card_id: number,
    in_area_time: number,
    stay_time: number,
    x: number,
    y: number,
    z: number,
    floor_id: number,
    utype:number,
    areas: {
        area_id: number,
        area_name: string,
        group_id: number,
        group_name: string,
        type: number
    }[],
}

export interface PositionObjMultiDetailResult {
    all: {
        count: number,
        data: (PositionObjMultiDetailBaseResult & {
            related_info: string
        })[]
    },
    person: {
        count: number,
        data: (PositionObjMultiDetailBaseResult & {
            branch_id: number,
            branch_name: string,
            job_num: string
        })[]
    },
    visitor: {
        count: number,
        data: (PositionObjMultiDetailBaseResult & {
            company: string
        })[]
    },
    contractor: {
        count: number,
        data: (PositionObjMultiDetailBaseResult & {
            unit_id: number,
            unit_name:string
        })[]
    },
    truck: {
        count: number,
        data: (PositionObjMultiDetailBaseResult & {
            licence: string,
            type: number,
            type_name: string,
            driver: string
        })[]
    },
    material: {
        count: number,
        data: (PositionObjMultiDetailBaseResult & {
            serial_num: string,
            type: number,
            type_name: string,
        })[]
    },
}

// 统计员工、访客、承包商、车辆、物资多详情框
export const getPositionObjMultiDetail = (data: PositionObjMultiDetailParams): Response<PositionObjMultiDetailResult> => request({
	url: "/EHCommon/homepage/WindowDetail/multiDetail",
	method: "post",
	data
});

export interface AlarmTrendResponse {
    date: string,
    rules: {
        rule_id: number,
        rule_type: number,
        rule_name: string,
        count: number
    }[]
}

export interface AlarmTrendParams {
    begin: string
    end: string
    rule_types?: number[]
}

// 告警趋势
export const getAlarmTrend = (data: AlarmTrendParams): Response<AlarmTrendResponse> => request({
	url: "EHCommon/homepage/WindowDetail/getAlarmTrend",
	method: "post",
	data
});
