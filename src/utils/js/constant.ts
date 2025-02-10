/**
 * localstorage key 用于其他页面跳转到首页，存储需要的地图以及区域信息
 */
export const INDEX_PAGE_KEY = "INDEX_PAGE_JUMP_MAP";

// 匹配 #ffffff 格式
export const HEX_REG1 = /^#([0-9a-fA-F]{6})$/;

// 匹配 #fff 格式
export const HEX_REG2 = /^#([0-9a-fA-F]{3})$/;

export const RGB_REG = /^rgb\(\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*\)$/;

// 监听视频SDK oninfo回调，所传的code
export enum VideoInfoCode {
    READY_FOR_WATCH = 1,
    RTSP_CONNECT_FAILED = 2,
    DECODE_FAILED = 3,
    NEAD_RESOURCE = 4,
    PROTOCOL_FAILED = 5,
    DECODE_TIMEOUT = 12,
    HEART_TIMEOUT = 13,
    CHANGE_SUCCESS = 20,
    TRACKING_START = 6,
    TRACKING_STOP = 7,
    RECORD_START = 8,
    RECORD_FAILED = 9,
    RECORD_TIMEOUT = 10,
    RECORD_STOP = 11,
    PTZ_START = 15,
    PTZ_FAILED = 16,
    PTZ_STOP = 17,
    CMD_SER_INFO = 80
}

export const enum UTYPES {
	UNKNOWN = 0, // 陌生卡
	PERSON = 1, // 员工
	CAR = 2, // 车辆
	VISITOR = 3, // 访客
	CAR_SEMI = 4, // 车辆副卡
	MATERIAL = 5, // 物资
	CONTRACTOR = 6 // 承包商
}

export const LOCATE_OPTIONS = [
	{value: "all", label: "全部"},
	{value: UTYPES.PERSON, label: "员工"},
	{value: UTYPES.VISITOR, label: "访客"},
	{value: UTYPES.CONTRACTOR, label: "承包商"},
	{value: UTYPES.CAR, label: "车辆"},
	{value: UTYPES.MATERIAL, label: "物资"},
	{value: UTYPES.UNKNOWN, label: "陌生卡"},
];

export const LOCATING_OPTIMUM_TYPE = {
	13: "障碍物区域",
	14: "活动区域",
	15: "盲区",
};

// 输入防抖时间
export const DEBOUNCE_INPUT_WAIT = 300;

// 表单内表格高度限制
export const MAX_FORM_TABLE_HEIGHT = 454;
export const MIN_FORM_TABLE_HEIGHT = 142;

export enum ALARM_RULE_TYPE {
	/** 静止不动 */
	stationary = 6,
	/** 区域超时 */
	region_timeout = 5,
	/** 区域消失 */
    region_disappearance = 7,
	/** 区域入侵 */
	region_intrusion = 22,
	/** 区域超限 */
    region_overcrowded= 23,
	/** 区域缺员 */
    region_shortage = 24,
	/** 聚集 */
    gather = 8,
	/** 危险源 */
    hazard_source = 10,
	/** 陪同 */
    accompany = 11,
	/** 离群 */
    outlier = 12,
	/** 工作超时 */
    work_timeout = 14,
	/** 车辆超载 */
    vehicle_overload = 18,
	/** 车辆超速 */
    vehicle_speeding = 29,
	/** 姿态异常 */
    abnormal_posture = 21,
	/** 上下井(出入口)超限 */
    pit_overcrowded = 25,
	/** 上下井(出入口)缺员 */
    pit_shortage = 26,
	/** 安全区域 */
    safe_region = 27,
	/** 禁止离开 */
    forbidden_departure = 28,
	/** 跌落 */
    fall = 30,
	/** 强拆 */
    forced_demolition = 31,
}

export const DAY_MAP = {
	0: "一",
	1: "二",
	2: "三",
	3: "四",
	4: "五",
	5: "六",
	6: "日"
};

export enum LIGHT {
	UNCONTROLLED = -1,
	NOT_EXISTS = 0,
	RED = 1,
	GREEN = 2,
	YELLOW = 3,
	GRAY = 4,
}

export const TABLE_COLUMN_WIDTH = {
	"date_time": 145,
	"date": 92,
	"month": 70,
	"duration": 145,
	"status": 80,
	"name": 66,
	"area": 140,
	"map": 200,
	"alarm_level": 80,
	"handle_base": 16,
	"handle_icon": 39,
	"id_code": 150,
	"coordinate": 170,
	"device_id": 90,
	"device_name": 100
};

// 告警级别对应的色值
export enum ALARM_LEVEL_COLOR {
	a = "#ff5964",
	b = "#f68d2d",
	c = "#d2af00"
}

export const enum DEVICE_TYPE {
	door = 1,
	jf_power = 2,
	gb_power = 3,
	ups_power = 8,
	switch = 4,
	base_station = 5,
	machine = 6,
	server = 7,
	label = 9,
	traffic_light = 10,
	voice_light = 11
}

/**
 * 声光报警器播报内容
 */
export const VOICE_LIGHT_CONTENT = {
	1: "闭锁区域有车，禁止进入！",
	2: "有车转弯，请停车让行！"
};

export const TRAFFIC_LIGHT_TEXT_MAP = {
	[LIGHT.GREEN]: "绿灯",
	[LIGHT.RED]: "红灯",
	[LIGHT.YELLOW]: "黄灯",
	[LIGHT.GRAY]: "灰灯",
	[LIGHT.NOT_EXISTS]: "无",
	[LIGHT.UNCONTROLLED]: "不控制",
};

export const DEBOUNCE_TIME = 800;

export const CHEMICAL_COLORS = {
	normal: ["rgb(255, 0, 0)", "rgba(255, 111, 0)", "rgb(201, 201, 0)", "rgb(0, 128, 255)"],
	transparent: ["rgba(255, 0, 0, .5)", "rgba(255, 140, 0, .5)", "rgba(255, 255, 0, .5)", "rgba(0, 128, 255, .5)"]
};

export const EVACUATE_COLOR = {
	normal: "rgb(0, 255, 0)",
	transparent: "rgba(0, 255, 0, .5)"
};

export const OTHER_COLORS = {
	normal: ["rgb(160, 50, 255)", "rgb(0, 11, 126)", "rgb(64, 48, 255)", "rgb(0, 229, 255)", "rgb(235, 72, 208)"],
	transparent: ["rgba(160, 50, 255, .5)", "rgba(0, 11, 126, .5)", "rgba(64, 48, 255, .5)", "rgba(0, 229, 255, .5)", "rgba(235, 72, 208, .5)"]
};
/** 室外楼层 */
export const OUTDOOR_STOREY_ID = 34;
