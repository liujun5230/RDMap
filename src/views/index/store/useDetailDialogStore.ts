import {defineStore} from "pinia";
import {ref, readonly} from "vue";
import {useEventListener} from "@vueuse/core";

import {ALARM_TYPE, ALARM_CATEGORY} from "@/types/alarm";

import {ModuleNameEnum, EvaModuleNameEnum} from "@index/container/modules/constant";
import {useMutexConfig} from "@index/composable";
import type {PositionObjMultiDetailParams, MultipleDetailAlarmParams, SingleCardDetailResponse} from "@/api/homepage/detail";
import type {AttendanceClassDetailParam} from "@/api/homepage/pageInformation";
import type {GetPitMultiDetailParams} from "@/api/pit/pitRecord";
import type {Module} from "@/api/configuration/homeTheme";
import type {GetEvacuateObjParams} from "@/api/realtime/Evacuate";
import {isHomePage} from "@/utils/ts/common";

/** 弹窗的分类 */
export enum DetailDialogCategoryEnum {
    POSITION_OBJECT = "position_obj",
    BASE_STATION = "base_station",
    CAMERA = "camera",
    DOOR = "door",
    POWER = "power",
    SWITCH = "switch",
    MACHINE = "machine",
    PATROL_POINT = "patrol_point",
	VOICE_LIGHT = "voice_light",
	TRAFFIC_LIGHT = "traffic_light",
    SCENE = "scene",
    BUILDING = "building",
    OUTDOOR = "outdoor",
    FLOOR = "floor",
    AREA_GROUP = "area_group",
    AREA_TYPE = "area_type",
    AREA_NAME = "area_name",
    AREA_TEMP = "area_temp",
    BRANCH = "branch",
    WORK_TYPE = "work_type",
    DUTY = "duty",
    PERSON_CLASSIFY = "person_classify",
    VISITOR_UNIT = "visitor_unit",
	CONTRACTOR_UNIT = "contractor_unit",
	CONTRACTOR_WORK_TYPE = "contractor_work_type",
    TRUCK_TYPE = "truck_type",
    MATERIAL_TYPE = "material_type",
    GATHER = "scope_gather",
	/** 上下井统计 */
	PIT_STATISTICS = "pit_statistics",
	/** 定位统计 */
	TAG_STATISTICS = "tag_statistics",
	/** 区域入侵 */
	AREA_INTRUSION = "area_intrusion",
	/** 区域超限 */
	AREA_OVER_LIMIT = "area_over_limit",
	/** 区域缺员 */
	AREA_LACK_OF_PERSONNEL = "area_lack_of_personnel",
	/** 井下超限 */
	BELOW_GROUND_OVER_LIMIT = "below_ground_over_limit",
	/** 井下缺员 */
	BELOW_GROUND_LACK_OF_PERSONNEL = "below_ground_lack_of_personnel",
	/** 区域超时 */
	AREA_OVERTIME = "area_overtime",
	/** 禁止离开 */
	PROHIBIT_LEAVE = "prohibit_leave",
	/** 工作超时 */
	WORK_OVERTIME = "work_overtime",
	/** 车辆超速 */
	VEHICLE_OVERSPEED = "vehicle_overspeed",
	/** 车辆超载 */
	VEHICLE_OVERLOAD = "vehicle_overload",
	/** 聚集 */
	AGGREGATE = "aggregate",
	/** 静止不动 */
	STATIONARY = "stationary",
	/** 区域消失 */
	AREA_DISAPPEARANCE = "area_disappearance",
	/** 危险源 */
	DANGER_SOURCE = "danger_source",
	/** 陪同 */
	ESCORT = "escort",
	/** 离群 */
	STRAGGLER = "straggler",
	/** 跌倒 */
	FALL = "fall",
	/** 姿态异常 */
	POSTURE_ABNORMALITY = "posture_abnormality",
	/** 安全区域 */
	SAFE_AREA = "safe_area",
	/** 强拆 */
	FORCED_DEMOLITION = "forced_demolition",
	/** SOS */
	SOS = "sos",
	/** 事故告警 */
	ACCIDENT_ALARM = "accident_alarm",
	/** 双机热备离线 */
	SERVER_HOT_STANDBY_OFFLINE = "server_hot_standby_offline",
	/** 磁盘空间不足 */
	DISK_SPACE_INSUFFICIENT = "disk_space_insufficient",
	/** 数据库同步异常 */
	DATABASE_SYNCHRONIZATION_ABNORMAL = "database_synchronization_abnormal",
	/** 标签低电量 */
	TAG_LOW_BATTERY = "tag_low_battery",
	/** 电源离线(浇封/隔爆/UPS) */
	POWER_OFFLINE_36 = "power_offline_36",
	/** 电源低电量(浇封/隔爆/UPS) */
	POWER_LOW_BATTERY_37 = "power_low_battery_37",
	/** 电源设备故障(UPS) */
	POWER_DEVICE_FAILURE_38 = "power_device_failure_38",
	/** 电源设备告警(UPS) */
	POWER_DEVICE_ALARM_39 = "power_device_alarm_39",
	/** 交换机离线 */
	SWITCH_OFFLINE = "switch_offline",
	/** 发卡一体机离线 */
	CARD_MACHINE_OFFLINE = "card_machine_offline",
	/** 发卡一体机无卡 */
	CARD_MACHINE_NO_CARD = "card_machine_no_card",
	/** 基站离线 */
	BASE_STATION_OFFLINE = "base_station_offline",
	/** 巡检失败 */
	INSPECTION_FAILURE = "inspection_failure",
	/** 点名未到 */
	ROLL_CALL_NOT_ARRIVED = "roll_call_not_arrived",
	/** 心率异常 */
	HEART_RATE_ABNORMAL = "heart_rate_abnormal",
	/** 血氧异常 */
	BLOOD_OXYGEN_ABNORMAL = "blood_oxygen_abnormal",
	/** 体温异常 */
	TEMPERATURE_ABNORMAL = "temperature_abnormal",
	/** 红绿灯离线 */
	TRAFFIC_LIGHT_OFFLINE = "traffic_light_offline",
	/** 声光报警器离线 */
	SOUND_AND_LIGHT_ALARM_OFFLINE = "sound_and_light_alarm_offline",
	/** 疏散对象总数 */
	EMERGENCY_EVACUATION_TOTAL = "emergency_evacuation_count",
	/** 事故区 */
	EMERGENCY_ACCIDENT_COUNT = "emergency_accident_count",
	/** 疏散中 */
	EMERGENCY_EVACUATING_COUNT = "emergency_evacuating_count",
	/** 安全岛 */
	EMERGENCY_SECURITY_COUNT = "emergency_security_count"
}

export const ALARM_TYPE_DETAIL_CATEGORY = {
	[ALARM_TYPE.AREA_INTRUSION]: DetailDialogCategoryEnum.AREA_INTRUSION,
	[ALARM_TYPE.AREA_OVER_LIMIT]: DetailDialogCategoryEnum.AREA_OVER_LIMIT,
	[ALARM_TYPE.AREA_LACK_OF_PERSONNEL]: DetailDialogCategoryEnum.AREA_LACK_OF_PERSONNEL,
	[ALARM_TYPE.BELOW_GROUND_OVER_LIMIT]: DetailDialogCategoryEnum.BELOW_GROUND_OVER_LIMIT,
	[ALARM_TYPE.BELOW_GROUND_LACK_OF_PERSONNEL]: DetailDialogCategoryEnum.BELOW_GROUND_LACK_OF_PERSONNEL,
	[ALARM_TYPE.AREA_OVERTIME]: DetailDialogCategoryEnum.AREA_OVERTIME,
	[ALARM_TYPE.PROHIBIT_LEAVE]: DetailDialogCategoryEnum.PROHIBIT_LEAVE,
	[ALARM_TYPE.WORK_OVERTIME]: DetailDialogCategoryEnum.WORK_OVERTIME,
	[ALARM_TYPE.VEHICLE_OVERSPEED]: DetailDialogCategoryEnum.VEHICLE_OVERSPEED,
	[ALARM_TYPE.VEHICLE_OVERLOAD]: DetailDialogCategoryEnum.VEHICLE_OVERLOAD,
	[ALARM_TYPE.AGGREGATE]: DetailDialogCategoryEnum.AGGREGATE,
	[ALARM_TYPE.STATIONARY]: DetailDialogCategoryEnum.STATIONARY,
	[ALARM_TYPE.AREA_DISAPPEARANCE]: DetailDialogCategoryEnum.AREA_DISAPPEARANCE,
	[ALARM_TYPE.DANGER_SOURCE]: DetailDialogCategoryEnum.DANGER_SOURCE,
	[ALARM_TYPE.ESCORT]: DetailDialogCategoryEnum.ESCORT,
	[ALARM_TYPE.STRAGGLER]: DetailDialogCategoryEnum.STRAGGLER,
	[ALARM_TYPE.FALL]: DetailDialogCategoryEnum.FALL,
	[ALARM_TYPE.POSTURE_ABNORMALITY]: DetailDialogCategoryEnum.POSTURE_ABNORMALITY,
	[ALARM_TYPE.SAFE_AREA]: DetailDialogCategoryEnum.SAFE_AREA,
	[ALARM_TYPE.FORCED_DEMOLITION]: DetailDialogCategoryEnum.FORCED_DEMOLITION,
	[ALARM_TYPE.SOS]: DetailDialogCategoryEnum.SOS,
	[ALARM_TYPE.ACCIDENT_ALARM]: DetailDialogCategoryEnum.ACCIDENT_ALARM,
	[ALARM_TYPE.SERVER_HOT_STANDBY_OFFLINE]: DetailDialogCategoryEnum.SERVER_HOT_STANDBY_OFFLINE,
	[ALARM_TYPE.DISK_SPACE_INSUFFICIENT]: DetailDialogCategoryEnum.DISK_SPACE_INSUFFICIENT,
	[ALARM_TYPE.DATABASE_SYNCHRONIZATION_ABNORMAL]: DetailDialogCategoryEnum.DATABASE_SYNCHRONIZATION_ABNORMAL,
	[ALARM_TYPE.TAG_LOW_BATTERY]: DetailDialogCategoryEnum.TAG_LOW_BATTERY,
	[ALARM_TYPE.POWER_OFFLINE_36]: DetailDialogCategoryEnum.POWER_OFFLINE_36,
	[ALARM_TYPE.POWER_LOW_BATTERY_37]: DetailDialogCategoryEnum.POWER_LOW_BATTERY_37,
	[ALARM_TYPE.POWER_DEVICE_FAILURE_38]: DetailDialogCategoryEnum.POWER_DEVICE_FAILURE_38,
	[ALARM_TYPE.POWER_DEVICE_ALARM_39]: DetailDialogCategoryEnum.POWER_DEVICE_ALARM_39,
	[ALARM_TYPE.SWITCH_OFFLINE]: DetailDialogCategoryEnum.SWITCH_OFFLINE,
	[ALARM_TYPE.CARD_MACHINE_OFFLINE]: DetailDialogCategoryEnum.CARD_MACHINE_OFFLINE,
	[ALARM_TYPE.CARD_MACHINE_NO_CARD]: DetailDialogCategoryEnum.CARD_MACHINE_NO_CARD,
	[ALARM_TYPE.BASE_STATION_OFFLINE]: DetailDialogCategoryEnum.BASE_STATION_OFFLINE,
	[ALARM_TYPE.INSPECTION_FAILURE]: DetailDialogCategoryEnum.INSPECTION_FAILURE,
	[ALARM_TYPE.ROLL_CALL_NOT_ARRIVED]: DetailDialogCategoryEnum.ROLL_CALL_NOT_ARRIVED,
	[ALARM_TYPE.HEART_RATE_ABNORMAL]: DetailDialogCategoryEnum.HEART_RATE_ABNORMAL,
	[ALARM_TYPE.BLOOD_OXYGEN_ABNORMAL]: DetailDialogCategoryEnum.BLOOD_OXYGEN_ABNORMAL,
	[ALARM_TYPE.TEMPERATURE_ABNORMAL]: DetailDialogCategoryEnum.TEMPERATURE_ABNORMAL,
	[ALARM_TYPE.TRAFFIC_LIGHT_OFFLINE]: DetailDialogCategoryEnum.TRAFFIC_LIGHT_OFFLINE,
	[ALARM_TYPE.SOUND_AND_LIGHT_ALARM_OFFLINE]: DetailDialogCategoryEnum.SOUND_AND_LIGHT_ALARM_OFFLINE,
};

export enum PositionObjTypeEnum {
    CARD = 0,
    PERSON = 1,
    TRUCK = 2,
    VISITOR = 3,
	TRUCK_ASSISTANT_CARD = 4,
    MATERIAL = 5,
	CONTRACTOR = 6,
}

/** 弹窗共有 Props */
type BaseDetailProps = {
	from?: ModuleNameEnum | EvaModuleNameEnum | "Map", // 从那个数据模块打开弹窗
	dialog_id?: string, // 弹窗 id
	direction?: "ltr" | "rtl", // 控制弹窗的方向，优先级比 from 高
	title?: string, // 弹窗标题
	close?: () => void, // 弹窗关闭回调
}

/** 定位对象单详情弹窗 Props */
export type SingleDetailPositionObjProps = BaseDetailProps & {
	utype:PositionObjTypeEnum
	uuid?: number,
	card_id?:number,
	use_gps?:number,
	time?:string,
	is_history?:boolean,
	history_location?:SingleCardDetailResponse
}

/** 基站、检测门、电源、交换机、一体机单详情弹窗 Props */
export type SingleDetailDeviceCategory =
	DetailDialogCategoryEnum.BASE_STATION
	| DetailDialogCategoryEnum.DOOR
	| DetailDialogCategoryEnum.POWER
	| DetailDialogCategoryEnum.SWITCH
	| DetailDialogCategoryEnum.MACHINE
	| DetailDialogCategoryEnum.VOICE_LIGHT
	| DetailDialogCategoryEnum.TRAFFIC_LIGHT

export type SingleDetailDeviceProps = BaseDetailProps & {
	device_uuid: string,
	is_backstage?: boolean
}

/** 摄像头单详情弹窗 Props */
export type SingleDetailCameraProps = BaseDetailProps & {
	device_id: number,
}

/** 巡检点单详情弹窗 Props */
export type SingleDetailPatrolProps = BaseDetailProps & {
	id: number,
}

export type MultipleDetailPositionObjCategory =
	DetailDialogCategoryEnum.SCENE
	| DetailDialogCategoryEnum.BUILDING
	| DetailDialogCategoryEnum.OUTDOOR
	| DetailDialogCategoryEnum.FLOOR
	| DetailDialogCategoryEnum.VISITOR_UNIT
	| DetailDialogCategoryEnum.CONTRACTOR_UNIT
	| DetailDialogCategoryEnum.CONTRACTOR_WORK_TYPE
	| DetailDialogCategoryEnum.TRUCK_TYPE
	| DetailDialogCategoryEnum.MATERIAL_TYPE
	| DetailDialogCategoryEnum.TAG_STATISTICS
	| DetailDialogCategoryEnum.BRANCH
	| DetailDialogCategoryEnum.WORK_TYPE
	| DetailDialogCategoryEnum.DUTY
	| DetailDialogCategoryEnum.PERSON_CLASSIFY
	| DetailDialogCategoryEnum.AREA_TEMP
	| DetailDialogCategoryEnum.AREA_GROUP // 同时也属于 MultipleDetailAlarmCategory
	| DetailDialogCategoryEnum.AREA_TYPE // 同时也属于 MultipleDetailAlarmCategory
	| DetailDialogCategoryEnum.AREA_NAME // 同时也属于 MultipleDetailAlarmCategory

/** 定位对象多详情弹窗 Props */
export type MultipleDetailPositionObjProps = BaseDetailProps & PositionObjMultiDetailParams & {
	area_id?: number, // 安全岛区域id
	area_group_name?: string, // 区域分组名
	area_type_name?: string, // 区域类型名
	default_tab?: "all" | "person" | "visitor" | "contractor" | "truck" | "material" // 默认选择的tab，不传则默认选中第一个 tab
}

export type MultipleDetailEmergencyCategory = DetailDialogCategoryEnum.EMERGENCY_EVACUATION_TOTAL | DetailDialogCategoryEnum.EMERGENCY_ACCIDENT_COUNT | DetailDialogCategoryEnum.EMERGENCY_EVACUATING_COUNT | DetailDialogCategoryEnum.EMERGENCY_SECURITY_COUNT;
export type MultipleDetailEmergencyProps = BaseDetailProps & Pick<GetEvacuateObjParams, "evacuate_type" | "utype"> & {
	default_tab?: "all" | "person" | "visitor" | "contractor" | "truck" | "material"
}

export type MultipleDetailPitCategory =
	DetailDialogCategoryEnum.VISITOR_UNIT
	| DetailDialogCategoryEnum.CONTRACTOR_UNIT
	| DetailDialogCategoryEnum.CONTRACTOR_WORK_TYPE
	| DetailDialogCategoryEnum.TRUCK_TYPE
	| DetailDialogCategoryEnum.MATERIAL_TYPE
	| DetailDialogCategoryEnum.BRANCH
	| DetailDialogCategoryEnum.WORK_TYPE
	| DetailDialogCategoryEnum.DUTY
	| DetailDialogCategoryEnum.PERSON_CLASSIFY
	| DetailDialogCategoryEnum.PIT_STATISTICS
export type MultipleDetailPitProps = BaseDetailProps & Omit<GetPitMultiDetailParams, "utype" | "card_type_name"> & {
	default_tab: "total" | "person" | "visitor" | "contractor" | "truck" | "material" | string & {} // 默认选择的tab，不传则默认选中第一个 tab
	pit_card_flag?: boolean,
	module_setting?: Module
}

export type MultipleDetailAttendanceClassCategory = DetailDialogCategoryEnum.BRANCH | DetailDialogCategoryEnum.WORK_TYPE | DetailDialogCategoryEnum.DUTY | DetailDialogCategoryEnum.PERSON_CLASSIFY;
export type MultipleDetailAttendanceClassProps = BaseDetailProps & AttendanceClassDetailParam & {
	default_tab?: "actual_num" | "not_off_duty_num" | "off_duty_num" | string & {} // 默认选择的tab，不传则默认选中第一个 tab
}

export type MultipleDetailAlarmCategory = DetailDialogCategoryEnum.AREA_GROUP | DetailDialogCategoryEnum.AREA_NAME | DetailDialogCategoryEnum.AREA_TYPE;

/** 告警多详情弹窗 Props */
export type MultipleDetailAlarmProps = BaseDetailProps & Omit<MultipleDetailAlarmParams, "column"> & {
	tabs: {label: string, key: string}[],
	area_group_name?: string, // 区域分组名
	area_type_name?: string // 区域类型名
	default_tab?: "all" | Exclude<ALARM_CATEGORY, ALARM_CATEGORY.patrol> // 默认选择的tab，不传则默认选中第一个 tab
}

/** 聚集范围多详情弹窗 */
export type MultipleDetailGatherScopeProps = BaseDetailProps & {
  params: Array<{card_id: number, rule_id: number}>
}

// 告警类型多详情类别
export type MultipleDetailAlarmTypeCategory =
	DetailDialogCategoryEnum.AREA_INTRUSION
	| DetailDialogCategoryEnum.AREA_OVER_LIMIT
	| DetailDialogCategoryEnum.AREA_LACK_OF_PERSONNEL
	| DetailDialogCategoryEnum.BELOW_GROUND_OVER_LIMIT
	| DetailDialogCategoryEnum.BELOW_GROUND_LACK_OF_PERSONNEL
	| DetailDialogCategoryEnum.AREA_OVERTIME
	| DetailDialogCategoryEnum.PROHIBIT_LEAVE
	| DetailDialogCategoryEnum.WORK_OVERTIME
	| DetailDialogCategoryEnum.VEHICLE_OVERSPEED
	| DetailDialogCategoryEnum.VEHICLE_OVERLOAD
	| DetailDialogCategoryEnum.AGGREGATE
	| DetailDialogCategoryEnum.STATIONARY
	| DetailDialogCategoryEnum.AREA_DISAPPEARANCE
	| DetailDialogCategoryEnum.DANGER_SOURCE
	| DetailDialogCategoryEnum.ESCORT
	| DetailDialogCategoryEnum.STRAGGLER
	| DetailDialogCategoryEnum.FALL
	| DetailDialogCategoryEnum.POSTURE_ABNORMALITY
	| DetailDialogCategoryEnum.SAFE_AREA
	| DetailDialogCategoryEnum.FORCED_DEMOLITION
	| DetailDialogCategoryEnum.SOS
	| DetailDialogCategoryEnum.ACCIDENT_ALARM
	| DetailDialogCategoryEnum.SERVER_HOT_STANDBY_OFFLINE
	| DetailDialogCategoryEnum.DISK_SPACE_INSUFFICIENT
	| DetailDialogCategoryEnum.DATABASE_SYNCHRONIZATION_ABNORMAL
	| DetailDialogCategoryEnum.TAG_LOW_BATTERY
	| DetailDialogCategoryEnum.POWER_OFFLINE_36
	| DetailDialogCategoryEnum.POWER_LOW_BATTERY_37
	| DetailDialogCategoryEnum.POWER_DEVICE_FAILURE_38
	| DetailDialogCategoryEnum.POWER_DEVICE_ALARM_39
	| DetailDialogCategoryEnum.SWITCH_OFFLINE
	| DetailDialogCategoryEnum.CARD_MACHINE_OFFLINE
	| DetailDialogCategoryEnum.CARD_MACHINE_NO_CARD
	| DetailDialogCategoryEnum.BASE_STATION_OFFLINE
	| DetailDialogCategoryEnum.INSPECTION_FAILURE
	| DetailDialogCategoryEnum.ROLL_CALL_NOT_ARRIVED
	| DetailDialogCategoryEnum.HEART_RATE_ABNORMAL
	| DetailDialogCategoryEnum.BLOOD_OXYGEN_ABNORMAL
	| DetailDialogCategoryEnum.TEMPERATURE_ABNORMAL
	| DetailDialogCategoryEnum.TRAFFIC_LIGHT_OFFLINE
	| DetailDialogCategoryEnum.SOUND_AND_LIGHT_ALARM_OFFLINE
// 告警类型多详情props
export type MultipleDetailAlarmTypeProps = BaseDetailProps & {
	rule_type: number,
	// ==== 接口参数 =====
	begin: number,
	end: number,
	rule_type_list: number[]
}

export type DetailDialogProps =
	SingleDetailPositionObjProps
	| SingleDetailCameraProps
	| SingleDetailPatrolProps
	| MultipleDetailGatherScopeProps
	| SingleDetailDeviceProps
	| MultipleDetailPositionObjProps
	| MultipleDetailAlarmProps
	| MultipleDetailAlarmTypeProps

export interface DialogInfo {
    readonly category: DetailDialogCategoryEnum,
    visible: boolean,
		direction: "ltr" | "rtl",
    props: DetailDialogProps
    custom_class?: string
}

const getInitDialogList = () => {
	return Object.values(DetailDialogCategoryEnum).reduce((result: Record<DetailDialogCategoryEnum, DialogInfo>, category) => {
		result[category] = {
			category,
			visible: false,
			direction: "ltr",
			props: {
				from: undefined,
				title: undefined,
				uuid: undefined,
				device_uuid: undefined,
				device_id: undefined,
				id: undefined,
				areas: undefined,
				area_type: undefined,
				tmp_area: undefined,
				tmp_area_floor_id: undefined,
				tmp_area_scene_id: undefined,
				tmp_area_relative_start: undefined,
				tmp_area_relative_end: undefined,
				floor_id_list: undefined,
				building_id: undefined,
				scene_id: undefined,
				person_class_id: undefined,
				branch_id: undefined,
				duty_id: undefined,
				work_type_id: undefined,
				truck_type_id: undefined,
				material_type_id: undefined,
				visitor_company: undefined,
				unit_id: undefined,
				area_group_name: undefined,
				area_type_name: undefined,
				type: undefined,
				column: undefined,
				active_tab: undefined
			} as unknown as DetailDialogProps
		};
		return result;
	}, {} as Record<DetailDialogCategoryEnum, DialogInfo>);
};

const resetDialogPosition = (category: DetailDialogCategoryEnum) => {
	const el = document.querySelector(`#${category} .el-drawer`) as HTMLElement;
	if (el) {
		el.style.left = "";
		el.style.top = "";
	}
};

const useDialogDirection = () => {
	let dialog_direction: DialogInfo["direction"] = ("rtl");

	useEventListener(document.body, "click", (event) => {
		const {clientX: client_x} = event;
		const current_target = event.currentTarget as HTMLElement;
		dialog_direction = client_x > (current_target.clientWidth / 2) ? "ltr" : "rtl";
	}, {capture: true});

	const getDirection = (dialog_props: DetailDialogProps) => {
		const {direction, from} = dialog_props;
		if (direction !== undefined) {
			dialog_direction = direction;
		} else if (from === "Map") {
			dialog_direction = "rtl";
		}

		return dialog_direction;
	};

	return getDirection;
};

const setDrawerBoxSize = (category: DetailDialogCategoryEnum) => {
	const {has} = useMutexConfig();
	const drawer_el = document.querySelector(`#${category} .el-drawer`) as HTMLDivElement;
	const module_container = has("history_distribution") ? document.querySelector("#app .history-module") as HTMLDivElement : document.querySelector("#app .module-left") as HTMLDivElement;
	if (drawer_el) {
		drawer_el.style.width = "";
		drawer_el.style.height = "";
		drawer_el.style.left = "";
		drawer_el.style.top = "";
		drawer_el.style.bottom = "";
		const {width, height, top} = module_container?.getBoundingClientRect?.() ?? {width: 0, height: 0, top: 0};
		if (isHomePage()) {
			if (has("history_distribution")) {
				drawer_el.style.width = "var(--min-grid-width)";
				drawer_el.style.height = height ? `${height.toFixed(2)}px` : "calc(var(--min-grid-height) * 3 + 16px)";
			} else {
				drawer_el.style.width = width ? `${width.toFixed(2)}px` : "var(--min-grid-width)";
				drawer_el.style.height = height ? `${height.toFixed(2)}px` : "calc(var(--min-grid-height) * 3 + 16px)";
			}
			if (top) {
				drawer_el.style.top = `${top}px`;
				drawer_el.style.bottom = "unset";
			}
		} else {
			drawer_el.style.width = "var(--min-grid-width)";
			// 112px = header + content_mt + content_mb
			drawer_el.style.height = "calc(100vh - 112px)";
		}
	}
};

/* eslint-disable no-redeclare */
export const useDetailDialogStore = defineStore("detail-dialog", () => {
	const dialog_list = ref(getInitDialogList());

	const getDirection = useDialogDirection();
	const getDialog = (category: DetailDialogCategoryEnum) => readonly(dialog_list.value[category]);

	useEventListener("resize", () => {
		Object.values(dialog_list.value).forEach(({category, visible}) => {
			if (visible) {
				setDrawerBoxSize(category);
			}
		});
	});

	// 打开/关闭弹窗
	function toggleVisible(category: DetailDialogCategoryEnum, visible: boolean) {
		const dialog = dialog_list.value[category];
		if (!dialog) return;

		// 关闭该类别弹窗
		if (dialog.visible && !visible) {
			// 达到抽屉从两侧消失
			resetDialogPosition(category);
			dialog.visible = false;
			dialog.props.close?.();
			return;
		}

		// 打开该类别弹窗
		if (!dialog.visible && visible) {
			dialog.direction = getDirection(dialog.props);
			dialog.visible = true;
			setDrawerBoxSize(category);
			return;
		}

		// 切换同一类别的弹窗内容
		if (dialog.visible && visible) {
			dialog.visible = false;
			setDrawerBoxSize(category);
			// 有一个关闭再打开的过渡效果
			setTimeout(() => {
				dialog.direction = getDirection(dialog.props);
				dialog.visible = true;
			});
			return;
		}
	}

	function setProps(category: DetailDialogCategoryEnum.POSITION_OBJECT, props: SingleDetailPositionObjProps): void;
	function setProps(category: DetailDialogCategoryEnum.CAMERA, props: SingleDetailCameraProps): void;
	function setProps(category: DetailDialogCategoryEnum.PATROL_POINT, props: SingleDetailPatrolProps): void;
	function setProps(category: DetailDialogCategoryEnum.GATHER, props: MultipleDetailGatherScopeProps): void;
	function setProps(category: SingleDetailDeviceCategory, props: SingleDetailDeviceProps): void;
	function setProps(category: MultipleDetailAlarmTypeCategory, props: MultipleDetailAlarmTypeProps): void;
	function setProps(category: MultipleDetailPositionObjCategory, props: MultipleDetailPositionObjProps): void;
	function setProps(category: MultipleDetailEmergencyCategory, props: MultipleDetailEmergencyProps): void;
	function setProps(category: MultipleDetailAttendanceClassCategory, props: MultipleDetailAttendanceClassProps, from: ModuleNameEnum.ATTENDANCE_CLASSIFY): void;
	function setProps(category: MultipleDetailAlarmCategory, props: MultipleDetailAlarmProps, from: ModuleNameEnum.DAY_ALARM_AREA | ModuleNameEnum.DAY_ALARM_DYNAMIC): void;
	function setProps(category: MultipleDetailPitCategory, props: MultipleDetailPitProps, from: ModuleNameEnum.PIT | ModuleNameEnum.PIT_CLASSIFY): void;
	function setProps(category: DetailDialogCategoryEnum, props: any, from?: ModuleNameEnum) {
		const dialog = dialog_list.value[category];
		if (!dialog) return;
		from && (dialog.props.from = from); // 避免 eslint 提示，from 作用主要是区分函数重载
		dialog.props = props;
	}

	function closeAllDialog() {
		Object.values(DetailDialogCategoryEnum).forEach((category) => {
			toggleVisible(category, false);
		});
	}

	return {
		dialog_list,
		getDialog,
		toggleVisible,
		setProps,
		closeAllDialog
	};
});
