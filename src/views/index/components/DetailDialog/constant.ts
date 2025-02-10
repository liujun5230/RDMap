import {base_url} from "@/Config";
import {DetailDialogCategoryEnum} from "@index/store";
import {numberToTime, formatTimeStampString} from "@/utils/js/tools/time";
import {PositionObjTypeEnum} from "@index/store/useDetailDialogStore";
import {useStore} from "@/store/index";
import {resolveCustomText} from "@/store/modules/featureFlags";
import {getHexStringFromIntLower} from "@/utils/js/common";

import type {Column} from "./components/DescriptionsList.vue";
import MultipleDetail from "./multiple/multipleDetail/MultipleDetail.vue";
import MultipleGatherScopeVue from "./multiple/MultipleGatherScope.vue";
import SingleCamera from "./single/SingleCamera.vue";
import SingleDevice from "./single/SingleDevice.vue";
import SinglePatrol from "./single/SinglePatrol.vue";
import SinglePositionObj from "./single/SinglePositionObj.vue";
import SingleTraffic from "./single/singleTraffic/SingleTraffic.vue";
import MultipleAlarmType from "./multiple/MultipleAlarmType.vue";
import MultipleEmergency from "./multiple/MultipleEmergency.vue";
import {cloneDeep} from "lodash-es";

const dict_store = useStore();

export const PAGINATOR_LIMIT = 300;

export const category_component_map = {
	[DetailDialogCategoryEnum.POSITION_OBJECT]: SinglePositionObj,
	[DetailDialogCategoryEnum.BASE_STATION]: SingleDevice,
	[DetailDialogCategoryEnum.CAMERA]: SingleCamera,
	[DetailDialogCategoryEnum.DOOR]: SingleDevice,
	[DetailDialogCategoryEnum.POWER]: SingleDevice,
	[DetailDialogCategoryEnum.SWITCH]: SingleDevice,
	[DetailDialogCategoryEnum.MACHINE]: SingleDevice,
	[DetailDialogCategoryEnum.PATROL_POINT]: SinglePatrol,
	[DetailDialogCategoryEnum.VOICE_LIGHT]: SingleDevice,
	[DetailDialogCategoryEnum.TRAFFIC_LIGHT]: SingleTraffic,
	[DetailDialogCategoryEnum.SCENE]: MultipleDetail,
	[DetailDialogCategoryEnum.BUILDING]: MultipleDetail,
	[DetailDialogCategoryEnum.OUTDOOR]: MultipleDetail,
	[DetailDialogCategoryEnum.FLOOR]: MultipleDetail,
	[DetailDialogCategoryEnum.AREA_GROUP]: MultipleDetail,
	[DetailDialogCategoryEnum.AREA_TYPE]: MultipleDetail,
	[DetailDialogCategoryEnum.AREA_NAME]: MultipleDetail,
	[DetailDialogCategoryEnum.AREA_TEMP]: MultipleDetail,
	[DetailDialogCategoryEnum.BRANCH]: MultipleDetail,
	[DetailDialogCategoryEnum.WORK_TYPE]: MultipleDetail,
	[DetailDialogCategoryEnum.DUTY]: MultipleDetail,
	[DetailDialogCategoryEnum.PERSON_CLASSIFY]: MultipleDetail,
	[DetailDialogCategoryEnum.VISITOR_UNIT]: MultipleDetail,
	[DetailDialogCategoryEnum.TRUCK_TYPE]: MultipleDetail,
	[DetailDialogCategoryEnum.MATERIAL_TYPE]: MultipleDetail,
	[DetailDialogCategoryEnum.CONTRACTOR_UNIT]: MultipleDetail,
	[DetailDialogCategoryEnum.CONTRACTOR_WORK_TYPE]: MultipleDetail,
	[DetailDialogCategoryEnum.TAG_STATISTICS]: MultipleDetail,
	[DetailDialogCategoryEnum.PIT_STATISTICS]: MultipleDetail,
	[DetailDialogCategoryEnum.GATHER]: MultipleGatherScopeVue,
	// 告警类型
	[DetailDialogCategoryEnum.AREA_INTRUSION]: MultipleAlarmType,
	[DetailDialogCategoryEnum.AREA_OVER_LIMIT]: MultipleAlarmType,
	[DetailDialogCategoryEnum.AREA_LACK_OF_PERSONNEL]: MultipleAlarmType,
	[DetailDialogCategoryEnum.BELOW_GROUND_OVER_LIMIT]: MultipleAlarmType,
	[DetailDialogCategoryEnum.BELOW_GROUND_LACK_OF_PERSONNEL]: MultipleAlarmType,
	[DetailDialogCategoryEnum.AREA_OVERTIME]: MultipleAlarmType,
	[DetailDialogCategoryEnum.PROHIBIT_LEAVE]: MultipleAlarmType,
	[DetailDialogCategoryEnum.WORK_OVERTIME]: MultipleAlarmType,
	[DetailDialogCategoryEnum.VEHICLE_OVERSPEED]: MultipleAlarmType,
	[DetailDialogCategoryEnum.VEHICLE_OVERLOAD]: MultipleAlarmType,
	[DetailDialogCategoryEnum.AGGREGATE]: MultipleAlarmType,
	[DetailDialogCategoryEnum.STATIONARY]: MultipleAlarmType,
	[DetailDialogCategoryEnum.AREA_DISAPPEARANCE]: MultipleAlarmType,
	[DetailDialogCategoryEnum.DANGER_SOURCE]: MultipleAlarmType,
	[DetailDialogCategoryEnum.ESCORT]: MultipleAlarmType,
	[DetailDialogCategoryEnum.STRAGGLER]: MultipleAlarmType,
	[DetailDialogCategoryEnum.FALL]: MultipleAlarmType,
	[DetailDialogCategoryEnum.POSTURE_ABNORMALITY]: MultipleAlarmType,
	[DetailDialogCategoryEnum.SAFE_AREA]: MultipleAlarmType,
	[DetailDialogCategoryEnum.FORCED_DEMOLITION]: MultipleAlarmType,
	[DetailDialogCategoryEnum.SOS]: MultipleAlarmType,
	[DetailDialogCategoryEnum.ACCIDENT_ALARM]: MultipleAlarmType,
	[DetailDialogCategoryEnum.SERVER_HOT_STANDBY_OFFLINE]: MultipleAlarmType,
	[DetailDialogCategoryEnum.DISK_SPACE_INSUFFICIENT]: MultipleAlarmType,
	[DetailDialogCategoryEnum.DATABASE_SYNCHRONIZATION_ABNORMAL]: MultipleAlarmType,
	[DetailDialogCategoryEnum.TAG_LOW_BATTERY]: MultipleAlarmType,
	[DetailDialogCategoryEnum.POWER_OFFLINE_36]: MultipleAlarmType,
	[DetailDialogCategoryEnum.POWER_LOW_BATTERY_37]: MultipleAlarmType,
	[DetailDialogCategoryEnum.POWER_DEVICE_FAILURE_38]: MultipleAlarmType,
	[DetailDialogCategoryEnum.POWER_DEVICE_ALARM_39]: MultipleAlarmType,
	[DetailDialogCategoryEnum.SWITCH_OFFLINE]: MultipleAlarmType,
	[DetailDialogCategoryEnum.CARD_MACHINE_OFFLINE]: MultipleAlarmType,
	[DetailDialogCategoryEnum.CARD_MACHINE_NO_CARD]: MultipleAlarmType,
	[DetailDialogCategoryEnum.BASE_STATION_OFFLINE]: MultipleAlarmType,
	[DetailDialogCategoryEnum.INSPECTION_FAILURE]: MultipleAlarmType,
	[DetailDialogCategoryEnum.ROLL_CALL_NOT_ARRIVED]: MultipleAlarmType,
	[DetailDialogCategoryEnum.HEART_RATE_ABNORMAL]: MultipleAlarmType,
	[DetailDialogCategoryEnum.BLOOD_OXYGEN_ABNORMAL]: MultipleAlarmType,
	[DetailDialogCategoryEnum.TEMPERATURE_ABNORMAL]: MultipleAlarmType,
	[DetailDialogCategoryEnum.TRAFFIC_LIGHT_OFFLINE]: MultipleAlarmType,
	[DetailDialogCategoryEnum.SOUND_AND_LIGHT_ALARM_OFFLINE]: MultipleAlarmType,
	// 紧急撤离
	[DetailDialogCategoryEnum.EMERGENCY_EVACUATION_TOTAL]: MultipleEmergency,
	[DetailDialogCategoryEnum.EMERGENCY_ACCIDENT_COUNT]: MultipleEmergency,
	[DetailDialogCategoryEnum.EMERGENCY_EVACUATING_COUNT]: MultipleEmergency,
	[DetailDialogCategoryEnum.EMERGENCY_SECURITY_COUNT]: MultipleEmergency,
} as const;

/**
 * 设备单详情框的基本信息
 */
export const device_base_descriptions_columns: Column[] = [
	{label: "设备名称", prop: "name"},
	{label: "设备类型", prop: "type"},
];

/**
 * 设备单详情框的基本附加信息
 */
export const device_base_additional_descriptions_columns_map: Record<string, Column[]> = {
	[DetailDialogCategoryEnum.BASE_STATION]: [
		{label: "基站类型", prop: "device_type"},
		{label: "SN", prop: "sn"},
		{label: "供电电源", prop: "power_name"},
	],
	[DetailDialogCategoryEnum.DOOR]: [
		{label: "装置类型", prop: "device_type"},
		{label: "工作模式", prop: "work_mode"},
	],
	[DetailDialogCategoryEnum.POWER]: [
		{label: "电源类型", prop: "device_type"},
		{label: "状态", prop: "power_state"},
		{label: "电量", prop: "power", formatter: (val: string) => ["--", undefined, null].includes(val) ? "--" : val},
	],
	[DetailDialogCategoryEnum.SWITCH]: [],
	[DetailDialogCategoryEnum.MACHINE]: [],
	[DetailDialogCategoryEnum.VOICE_LIGHT]: [
		{label: "通信基站", prop: "bs_addr", formatter: (val: string) => getHexStringFromIntLower(val)},
	],
};

const formatCoords = (val: any, col: any, data: any) => {
	const coords = [data.x, data.y, data.z].filter((value) => ![undefined, null, "--"].includes(value));
	return coords.map(val => Number(val).toFixed(2)).join("，");
};

const formatPicture = (val: any) => {
	const url = !val || (val && val.startsWith("data:image/")) ? val : base_url + val;
	return url;
};

const formatAttachment = (arr_str?: string) => {
	if (!arr_str) return 0;
	return arr_str.split("、").length;
};

const formatTime = (val: any) => {
	if (typeof val === "string") return val;
	return val ? numberToTime(val, undefined, undefined) : "--";
};

const formatUpDownStatus = (val:any) => {
	if (["", null, undefined, "--"].includes(val)) return "--";
	return val ? resolveCustomText("leave_pit") : resolveCustomText("enter_pit");
};

const formatTimeString = (val: any) => {
	if (typeof val === "string") return val;
	return val ? formatTimeStampString(val) : "--";
};

export interface AreaItem {
	area_group_id: number | null;
	area_group_name: string | null;
	area_id: number,
	area_name: string
}
export const formatAreas = (val: AreaItem[]) => {
	const filter_areas = val?.filter(({area_id}) => area_id !== null || area_id !== undefined) ?? [];
	return filter_areas;
};

/**
 * 设备单详情框的位置数据详情
 */
export const device_location_descriptions_columns: Column[] = [
	{label: "所在地图", prop: "floor"},
	{label: "所在区域", prop: "areas", style: {display: "flex"}},
	{label: "坐标", prop: "coords", formatter: formatCoords}
];

/**
 * 人员划分类型映射
 */
export const person_divide_type_map: Record<string, number> = {
	[DetailDialogCategoryEnum.BRANCH]: 1,
	[DetailDialogCategoryEnum.WORK_TYPE]: 2,
	[DetailDialogCategoryEnum.DUTY]: 3,
	[DetailDialogCategoryEnum.PERSON_CLASSIFY]: 4,
};

export const getBaseInfo = (utype:PositionObjTypeEnum, data:any, position_settings_store:any) => {
	if (utype === PositionObjTypeEnum.CARD) return {};
	let setting_base_data:any, dict_items:any, dict_info:any;
	if (utype === PositionObjTypeEnum.PERSON) {
		setting_base_data = cloneDeep(position_settings_store.person_base);
		dict_items = dict_store.getters.person_dict_items;
		dict_info = data.base_info?.dict_json;
	}
	if (utype === PositionObjTypeEnum.VISITOR) {
		setting_base_data = cloneDeep(position_settings_store.visitor_base);
		dict_items = dict_store.getters.visitor_dict_items;
		dict_info = data.base_info?.visitor_dict;
	}
	if (utype === PositionObjTypeEnum.TRUCK) {
		setting_base_data = cloneDeep(position_settings_store.truck_base);
		dict_items = dict_store.getters.car_dict_items;
		dict_info = data.base_info?.truck_dict;
	}
	if (utype === PositionObjTypeEnum.MATERIAL) {
		setting_base_data = cloneDeep(position_settings_store.material_base);
		dict_items = dict_store.getters.material_dict_items;
		dict_info = data.base_info?.material_dict;
	}
	if (utype === PositionObjTypeEnum.CONTRACTOR) {
		setting_base_data = cloneDeep(position_settings_store.contractor_base);
		dict_items = dict_store.getters.contractor_items;
		dict_info = data.base_info?.dict_data;
	}

	const info = {...data.base_info};
	const main_columns: Column[] = setting_base_data.filter((item:any) => item.disable_display || item.is_display && item.disable_drag && !["头像", "性别"].includes(item.label));
	const photo_is_display = setting_base_data.find((item:any) => item.label === "头像")?.is_display;
	let other_columns: Column[] = setting_base_data.filter((item:any) => !item.disable_drag && item.is_display && dict_items.find((i:any) => i.name === item.label)?.is_display);
	for (const i in dict_info) {
		if (Array.isArray(dict_info[i])) {
			info[i] = dict_info[i].join("、");
		} else {
			info[i] = dict_info[i];
		}
	}
	const sex_item = setting_base_data.find((item:any) => item.label === "性别");
	if (sex_item) {
		info["sex"] = sex_item.is_display ? info["sex"] : "";
	}
	if (data.danger_radius) {
		info["danger_radius"] = data.danger_radius;
	}
	other_columns = other_columns.map((item:any) => {
		if (item.type === "picture") {
			item.formatter = formatPicture;
		}
		if (item.is_attachment) item.formatter = formatAttachment;
		return item;
	});
	return {
		photo_is_display,
		main_columns,
		other_columns,
		info
	};
};

export const getLocationInfo = (utype:PositionObjTypeEnum, data:any, position_settings_store:any, is_history_distribution?:boolean, is_history?:boolean, history_location?:any) => {
	const location_setting_info = cloneDeep(position_settings_store.location_info);
	const info = is_history ? {...history_location} : (utype === PositionObjTypeEnum.CARD ? {...data} : {...data.location});
	const main_columns: Column[] = [
		{label: "卡号", prop: "card_id"}
	];
	info["power"] = location_setting_info[1].is_display && !is_history ? info["power"] : null;
	info["status"] = location_setting_info[2].is_display && !is_history ? info["status"] : "";
	info["coordinate"] = formatCoords(null, null, info);
	info["areas"] = info["areas"] && info["areas"].length ? info["areas"] : [{}];
	const columns_arr = location_setting_info.slice(3).filter((item:any) => item.is_display);
	const other_columns: Column[] = [];
	let area_columns: Column[] = [];
	let pit_columns: Column[] = [];
	columns_arr.forEach((item:any) => {
		if (item.children && item.children.length) {
			let children_arr = item.children;
			if (item.prop === "area_data") {
				if (utype === PositionObjTypeEnum.CARD) {
					children_arr = item.children.slice(0, 1);
				}
				area_columns = children_arr.filter((child:any) => child.is_display && (!is_history_distribution || (is_history_distribution && child.prop !== "stay_time")) && (!is_history || (is_history && !["entry_time", "areas", "stay_time"].includes(child.prop)))).map((col:any) => {
					if (col.prop === "stay_time") {
						col.formatter = (val:any) => formatTime(val);
					}
					if (col.prop === "entry_time") {
						col.formatter = (val:any) => formatTimeString(val);
					}
					return col;
				});

				if (area_columns.length) other_columns.push({prop: "areas", label: "区域"});
			} else if (item.prop === "pit_data" && utype !== PositionObjTypeEnum.CARD) {
				pit_columns = children_arr.filter((child:any) => child.is_display && (!is_history_distribution || (is_history_distribution && child.prop !== "pit_stay_time")) && (!is_history || (is_history && !["up_down_status", "up_time", "down_time", "pit_stay_time"].includes(child.prop)))).map((col:any) => {
					if (["up_time", "down_time"].includes(col.prop)) {
						col.formatter = (val:any) => formatTimeString(val);
					}
					if (col.prop === "pit_stay_time") {
						col.formatter = (val:any) => formatTime(val);
					}
					if (col.prop === "up_down_status") {
						col.formatter = (val:any) => formatUpDownStatus(val);
					}
					return col;
				});
				if (pit_columns.length) other_columns.push({prop: "pit_data", label: item.name});
			}
		} else if (item.prop !== "truck" || (item.prop === "truck" && (utype === PositionObjTypeEnum.PERSON || utype === PositionObjTypeEnum.VISITOR))) {
			if ((!is_history_distribution || (is_history_distribution && !["bs_distance", "truck"].includes(item.prop))) && (!is_history || (is_history && !["bs_distance", "truck", "type_name"].includes(item.prop)))) {
				other_columns.push(item);
			}
		}
	});
	return {
		main_columns,
		other_columns,
		area_columns,
		pit_columns,
		info
	};
};

export const getBusinessInfo = (utype:PositionObjTypeEnum, data:any, position_settings_store:any) => {
	if (![PositionObjTypeEnum.PERSON, PositionObjTypeEnum.VISITOR, PositionObjTypeEnum.CONTRACTOR].includes(utype)) {
		return [];
	}
	const {person_business, visitor_business, contractor_business} = position_settings_store;
	let business_data = utype === PositionObjTypeEnum.PERSON ? cloneDeep(person_business) : cloneDeep(visitor_business);
	if (utype === PositionObjTypeEnum.CONTRACTOR) business_data = cloneDeep(contractor_business);
	const info_data = business_data.map((item:any) => {
		const columns = item.children.filter((info:any) => info.is_display).map((item:any) => {
			if (["work_time", "stay_time"].includes(item.prop)) {
				item.formatter = (val:any) => formatTime(val);
			}
			if (["in_time", "out_time", "start_time", "end_time", "reserve_start_time", "reserve_end_time"].includes(item.prop)) {
				item.formatter = (val:any) => formatTimeString(val);
			}
			return item;
		});
		const info = {...data[item.prop]};
		const title = item.label;
		const columns_num = item.prop === "health" ? 2 : 1;
		return {
			is_display: item.is_display,
			columns,
			title,
			info,
			columns_num
		};
	});
	return info_data;
};
