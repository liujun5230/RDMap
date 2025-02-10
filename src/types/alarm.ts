export const enum ALARM_TYPE {
		/** 区域入侵 */
		AREA_INTRUSION = 22,
		/** 区域超限 */
		AREA_OVER_LIMIT = 23,
		/** 区域缺员 */
		AREA_LACK_OF_PERSONNEL = 24,
		/** 井下超限 */
		BELOW_GROUND_OVER_LIMIT = 25,
		/** 井下缺员 */
		BELOW_GROUND_LACK_OF_PERSONNEL = 26,
		/** 区域超时 */
		AREA_OVERTIME = 5,
		/** 禁止离开 */
		PROHIBIT_LEAVE = 28,
		/** 工作超时 */
		WORK_OVERTIME = 14,
		/** 车辆超速 */
		VEHICLE_OVERSPEED = 29,
		/** 车辆超载 */
		VEHICLE_OVERLOAD = 18,
		/** 聚集 */
		AGGREGATE = 8,
		/** 静止不动 */
		STATIONARY = 6,
		/** 区域消失 */
		AREA_DISAPPEARANCE = 7,
		/** 危险源 */
		DANGER_SOURCE = 10,
		/** 陪同 */
		ESCORT = 11,
		/** 离群 */
		STRAGGLER = 12,
		/** 跌倒 */
		FALL = 30,
		/** 姿态异常 */
		POSTURE_ABNORMALITY = 21,
		/** 安全区域 */
		SAFE_AREA = 27,
		/** 强拆 */
		FORCED_DEMOLITION = 31,
		/** SOS */
		SOS = 32,
		/** 事故告警 */
		ACCIDENT_ALARM = 33,

		/** 双机热备离线 */
		SERVER_HOT_STANDBY_OFFLINE = 43,
		/** 磁盘空间不足 */
		DISK_SPACE_INSUFFICIENT = 44,
		/** 数据库同步异常  */
		DATABASE_SYNCHRONIZATION_ABNORMAL = 52,

		/** 标签低电量 */
		TAG_LOW_BATTERY = 34,
		/** 电源离线(浇封/隔爆/UPS) */
		POWER_OFFLINE_36 = 36,
		/** 电源低电量(浇封/隔爆/UPS) */
		POWER_LOW_BATTERY_37 = 37,
		/** 电源设备故障(UPS) */
		POWER_DEVICE_FAILURE_38 = 38,
		/** 电源设备告警(UPS) */
		POWER_DEVICE_ALARM_39 = 39,
		/** 交换机离线 */
		SWITCH_OFFLINE = 40,
		/** 发卡一体机离线 */
		CARD_MACHINE_OFFLINE = 41,
		/** 发卡一体机无卡 */
		CARD_MACHINE_NO_CARD = 42,
		/** 基站离线 */
		BASE_STATION_OFFLINE = 35,

		/** 巡检失败 */
		INSPECTION_FAILURE = 45,
		/** 点名未到 */
		ROLL_CALL_NOT_ARRIVED = 46,

		/** 心率异常 */
		HEART_RATE_ABNORMAL = 47,
		/** 血氧异常 */
		BLOOD_OXYGEN_ABNORMAL = 48,
		/** 体温异常 */
		TEMPERATURE_ABNORMAL = 49,

		/** 红绿灯离线 50 */
		TRAFFIC_LIGHT_OFFLINE = 50,

		/** 声光报警器离线 */
		SOUND_AND_LIGHT_ALARM_OFFLINE = 51,
}

// 设备告警
export const DEVICE_ALARM = [
	ALARM_TYPE.SERVER_HOT_STANDBY_OFFLINE,
	ALARM_TYPE.TAG_LOW_BATTERY,
	ALARM_TYPE.POWER_OFFLINE_36,
	ALARM_TYPE.POWER_LOW_BATTERY_37,
	ALARM_TYPE.POWER_DEVICE_FAILURE_38,
	ALARM_TYPE.POWER_DEVICE_ALARM_39,
	ALARM_TYPE.SWITCH_OFFLINE,
	ALARM_TYPE.CARD_MACHINE_OFFLINE,
	ALARM_TYPE.CARD_MACHINE_NO_CARD,
	ALARM_TYPE.BASE_STATION_OFFLINE,
	ALARM_TYPE.DISK_SPACE_INSUFFICIENT,
	ALARM_TYPE.TRAFFIC_LIGHT_OFFLINE,
	ALARM_TYPE.SOUND_AND_LIGHT_ALARM_OFFLINE,
	ALARM_TYPE.DATABASE_SYNCHRONIZATION_ABNORMAL
];

// 健康管理
export const HEALTH_MANAGEMENT = [
	ALARM_TYPE.HEART_RATE_ABNORMAL,
	ALARM_TYPE.BLOOD_OXYGEN_ABNORMAL,
	ALARM_TYPE.TEMPERATURE_ABNORMAL,
];

// 电子点名
export const ROLL_CALL = [
	ALARM_TYPE.ROLL_CALL_NOT_ARRIVED,
];

// 智慧巡检
export const WISDOM_INSPECTION = [
	ALARM_TYPE.INSPECTION_FAILURE,
];

// 事故报警
export const ACCIDENT_ALARM = [
	ALARM_TYPE.ACCIDENT_ALARM,
];

// 定位对象告警
export const LOCATION_ALARM = [
	ALARM_TYPE.AREA_INTRUSION,
	ALARM_TYPE.AREA_OVERTIME,
	ALARM_TYPE.PROHIBIT_LEAVE,
	ALARM_TYPE.WORK_OVERTIME,
	ALARM_TYPE.VEHICLE_OVERSPEED,
	ALARM_TYPE.VEHICLE_OVERLOAD,
	ALARM_TYPE.AGGREGATE,
	ALARM_TYPE.STATIONARY,
	ALARM_TYPE.AREA_DISAPPEARANCE,
	ALARM_TYPE.DANGER_SOURCE,
	ALARM_TYPE.ESCORT,
	ALARM_TYPE.STRAGGLER,
	ALARM_TYPE.FALL,
	ALARM_TYPE.POSTURE_ABNORMALITY,
	ALARM_TYPE.FORCED_DEMOLITION,
	ALARM_TYPE.BELOW_GROUND_LACK_OF_PERSONNEL
];

// 区域告警，不要轻易修改 AREA_ALARM，因为首页和后台对 井下超限 归属定义不一样，这里都统一按后台的归类定义的，参考下面的getAlarmCategory方法
export const AREA_ALARM = [
	ALARM_TYPE.AREA_OVER_LIMIT,
	ALARM_TYPE.AREA_LACK_OF_PERSONNEL,
	ALARM_TYPE.BELOW_GROUND_OVER_LIMIT,
];

// SOS告警
export const SOS_ALARM = [ALARM_TYPE.SOS];

export type ALARM_LEVEL = "a" | "b" | "c";

// 规则的适用对象
export interface ApplicableObjects {
    person?: {
        all_person: 0 | 1,
        single_person: {uuid: number, name: string, branch_name: string}[],
        branch: {id: number, name: string}[],
        person_class: {id: number, name: string}[],
        duty: {id: number, name: string}[],
        work_type: {id: number, name: string}[]
    },
    visitor?: {
        all_visitor: 0 | 1,
        single_visitor: {uuid: number, name: string}[],
    },
    truck?: {
        all_truck: 0 | 1,
        single_truck: {uuid: number, name: string}[],
        truck_type: {id: number, name: string}[],
    },
    material?: {
        all_material: 0 | 1,
        single_material: {uuid: number, name: string}[],
        material_type: {id: number, name: string}[],
    },
	card_type?: {
		all_card_type?: 0 | 1,
		card_type?: {id: number, name: string}[]
	},
	contractor?: {
		all_contractor: 0 | 1,
        single_contractor: {uuid: number, name: string, unit_name: string}[],
        unit: {id: number, name: string}[],
		work_type: {id: number, name: string}[],
	}
}

// 告警模块按定位对象、区域、设备、SOS、事故、点名、健康、巡检划分的告警类别
export const enum ALARM_CATEGORY {
	/** 定位对象告警 */
	tag = "tag",
	/** 区域告警 */
	area = "area",
	/** 设备告警 */
	device = "device",
	/** SOS告警 */
	sos = "sos",
	/** 事故告警 */
	accident = "accident",
	/** 点名告警 */
	call = "call",
	/** 健康告警 */
	healthy = "healthy",
	/** 巡检告警 */
	patrol = "patrol"
}

// 告警类别对应的所有规则类型
const TYPE_OF_ALARM_CATEGORY = {
	[ALARM_CATEGORY.tag]: LOCATION_ALARM,
	[ALARM_CATEGORY.area]: AREA_ALARM,
	[ALARM_CATEGORY.device]: DEVICE_ALARM,
	[ALARM_CATEGORY.sos]: SOS_ALARM,
	[ALARM_CATEGORY.accident]: ACCIDENT_ALARM,
	[ALARM_CATEGORY.call]: ROLL_CALL,
	[ALARM_CATEGORY.healthy]: HEALTH_MANAGEMENT,
	[ALARM_CATEGORY.patrol]: WISDOM_INSPECTION
};
/**
 * 告警类别下所有的规则类型
 *
 * 注意：首页的 *井下超限* 被归属于定位对象，但是在后台中还是被归属于区域告警
 *
 * 可能你会有获取所有类别下的规则类型需求，但是这里没有提供`all`选项，是因为某个功能块的全部并不是真正意义的`all`（如果把某个告警类别隐藏了）
 * @param category
 * @param is_home true-从首页获取，false-从后台获取，默认值true
 */
export function getRuleTypeOfAlarmCategory(category: ALARM_CATEGORY, is_home = true) {
	if (is_home) {
		if (category === ALARM_CATEGORY.area) return AREA_ALARM.filter((type) => type !== ALARM_TYPE.BELOW_GROUND_OVER_LIMIT);
		if (category === ALARM_CATEGORY.tag) return [...LOCATION_ALARM, ALARM_TYPE.BELOW_GROUND_OVER_LIMIT];
	}
	return [...TYPE_OF_ALARM_CATEGORY[category]];
}

/**
 * 具体的规则类型被归属于那种告警类别
 *
 * 注意：首页的 *井下超限* 被归属于定位对象，但是在后台中还是被归属于区域告警
 * @param rule_type 规则类型
 * @param is_home true-从首页获取，false-从后台获取，默认值true
 * @returns
 */
export function getAlarmCategory(rule_type: number, is_home = true) {
	if (is_home && rule_type === ALARM_TYPE.BELOW_GROUND_OVER_LIMIT) return ALARM_CATEGORY.tag;
	if (LOCATION_ALARM.includes(rule_type)) return ALARM_CATEGORY.tag;
	if (AREA_ALARM.includes(rule_type)) return ALARM_CATEGORY.area;
	if (DEVICE_ALARM.includes(rule_type)) return ALARM_CATEGORY.device;
	if (SOS_ALARM.includes(rule_type)) return ALARM_CATEGORY.sos;
	if (ACCIDENT_ALARM.includes(rule_type)) return ALARM_CATEGORY.accident;
	if (ROLL_CALL.includes(rule_type)) return ALARM_CATEGORY.call;
	if (HEALTH_MANAGEMENT.includes(rule_type)) return ALARM_CATEGORY.healthy;
	if (WISDOM_INSPECTION.includes(rule_type)) return ALARM_CATEGORY.patrol;
	console.error(`rule_type=${rule_type}不是合法的告警规则类型`);
	return null;
}

/**
 * 规则档案类型
 */
export const enum RULE_ARCHIVE_TYPE {
	alarm = 1,
	call = 2,
	patrol = 3,
	evacuation = 4
}
