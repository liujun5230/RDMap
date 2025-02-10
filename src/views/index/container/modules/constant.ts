import type {PositionObjectType} from "@index/container/modules/types";

export enum ModuleNameEnum {
	/** 定位统计 */
	POSITION = "定位统计",
	/** 定位分类统计 */
	POSITION_CLASSIFY = "定位分类统计",
	/** 当日告警统计 */
	DAY_ALARM = "当日告警统计",
	/** 告警区域统计 */
	DAY_ALARM_AREA = "告警区域统计",
	/** 当日告警动态 */
	DAY_ALARM_DYNAMIC = "当日告警动态",
	/** 上下井统计 */
	PIT = "上下井统计",
	/** 上下井分类统计 */
	PIT_CLASSIFY = "上下井分类统计",
	/** 上下井趋势 */
	PIT_TENDENCY = "上下井趋势",
	/** 当日上下井动态 */
	DAY_PIT_DYNAMIC = "当日上下井动态",
	/** 考勤班次统计 */
	ATTENDANCE_FREQUENT = "考勤班次统计",
	/** 考勤分类统计 */
	ATTENDANCE_CLASSIFY = "考勤分类统计",
	/** 当日考勤动态 */
	DAY_ATTENDANCE_DYNAMIC = "当日考勤动态",
	/** 设备在线统计 */
	DEVICE_ONLINE = "设备在线统计",
	/** 视频监控 */
	VIDEO_MONITOR = "视频监控",
	/** 当日巡检监控 */
	DAY_PATROL_MONITOR = "当日巡检监控",
	/** 告警趋势 */
	ALARM_TENDENCY = "告警趋势",
}

export enum EvaModuleNameEnum {
	STATISTICS = "紧急撤离统计",
	AREA = "安全岛统计",
	DYNAMIC = "应急动态"
}

const person_options = [
	{label: "按部门", value: 1},
	{label: "按工种", value: 2},
	{label: "按职务", value: 3},
	{label: "按员工分类", value: 4},
];

const person_table_header: Record<number, string> = {
	1: "部门",
	2: "工种",
	3: "职务",
	4: "员工分类",
};

const person_key_map: Record<number, string> = {
	1: "branch",
	2: "work_type",
	3: "duty",
	4: "classify"
};

const contractor_options = [
	{label: "按单位", value: 1},
	{label: "按工种", value: 2},
];

const contractor_table_header: Record<number, string> = {
	1: "单位",
	2: "工种",
};

const contractor_key_map: Record<number, string> = {
	1: "unit",
	2: "work_type",
};

/** 模块设置显示内容为表格的模块名 */
const show_table_module_name = [
	ModuleNameEnum.POSITION,
	ModuleNameEnum.POSITION_CLASSIFY,
	ModuleNameEnum.DAY_ALARM_DYNAMIC,
	ModuleNameEnum.DAY_ALARM,
	ModuleNameEnum.DAY_ALARM_AREA,
	ModuleNameEnum.PIT,
	ModuleNameEnum.PIT_CLASSIFY,
	ModuleNameEnum.DEVICE_ONLINE,
	ModuleNameEnum.ALARM_TENDENCY,
] as string[];

const DISPLAY_MAP: {[key: number]: PositionObjectType} = {
	1: "person",
	2: "truck",
	3: "visitor",
	5: "material",
	6: "contractor"
};

const UTYPE_NAME_MAP: Record<string, number> = {
	"员工": 1,
	"车辆": 2,
	"访客": 3,
	"物资": 5,
	"承包商": 6,
};

export {
	person_options,
	person_table_header,
	contractor_options,
	contractor_table_header,
	contractor_key_map,
	show_table_module_name,
	DISPLAY_MAP,
	person_key_map,
	UTYPE_NAME_MAP,
};
