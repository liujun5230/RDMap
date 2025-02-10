// 获取软件接口服务器的地址，不包含端口信息
export const server = import.meta.env.VITE_APP_URL || window.SX_HOSTNAME || window.location.hostname;

export const http_protocol = import.meta.env.VITE_PROTOCOL || window.SX_PROTOCOL || "http";
const ws_protocol = import.meta.env.VITE_WS_PROTOCOL || window.SX_WS_PROTOCOL || "ws";

// 应用软件的端口
const app_port = import.meta.env.VITE_PORT || window.SX_PORT || (http_protocol === "http" ? ":80" : ":443");
const video_port = import.meta.env.VITE_VIDEO_PORT || window.SX_VIDEO_PORT || (ws_protocol === "ws" ? ":9100" : "/hg_video_record");
const mqtt_port = import.meta.env.VITE_MQTT_PORT || window.SX_MQTT_PORT || (ws_protocol === "ws" ? ":9001" : "/location");
const websocket_port = import.meta.env.VITE_WS_PORT || window.SX_WS_PORT || (ws_protocol === "ws" ? ":9802" : "/hg_home_page_web_socket");

export const base_url = `${http_protocol}://${server}${app_port}`;
export const video_ws_url = `${ws_protocol}://${server}${video_port}`;
export const mqtt_ws_url = `${ws_protocol}://${server}${mqtt_port}`;
export const websocket_ws_url = `${ws_protocol}://${server}${websocket_port}`;

export const session_storage_user_info_key = "user_info_general_system_sessions";
export const session_storage_app_state_key = "app_state_general_system_sessions";
export const disk_usage_alarm_last_time_key = "disk_usage_alarm_last_time";
export const disk_ratio_alarm_key = "disk_ratio_alarm";
export const index_map_options_last_time_key = "map_options_last_time";
export const feature_flags_key = "feature_flags_key";
export const default_app_state = {
	sidebar: {
		open: true,
		active: "/",
		opened_submenu: ["/"],
	},
	language: "zh-cn",
	name: "",
	version: "3.5.0",
	custom_version: "",
	kml_color: "#333",
	engine_bg_color: "#fff"
};

export const default_page_size = 20;

export const android_download_url = window.location.origin + "/EHCommon/down.html";

export const apple_download_url = `${http_protocol}://apps.apple.com/cn/app/id1435572519`;

export const default_2d_map_file = "/mapfile/gezi.kml";

export const drive_download_url = base_url + "/EHCommon/resources/drive/驱动压缩包.rar";

// 地图缩放比例
export const zoom_factor = 1.3;

// 出现热力图或基站等图标消失的icon_scale
export const min_icon_scale = 0.3;

// 查看某一个定位图标或摄像头等图标时需放大的缩放比
export const show_fit_zoom = 65;

export const mqtt_user_name = "admin";

export const mqtt_password = "eHIGH2014";
export const config_3d = {
	sky_box: true, // 天空盒子
	little_map: true, // 小地图
	card_type: 1, // 1 代表的fbx，2 代表的是json
	open_shadow: false, // 是否开启阴影
};
/**
 * @deprecated
 */
export const TASK_FAILED_ALARM = "/pos_business/ex_alarm_inform/patrol/task-failed";
/**
 * @deprecated
 */
export const SERVER_ALARM = "/pos_business/ex_alarm_inform/iot/server_alarm";
/**
 * @deprecated
 */
export const ACCIDENT_ALARM = "/pos_business/ex_alarm_inform/accident/alarm_web";
/**
 * @deprecated
 */
export const DETECT_DOOR_ALARM = "/pos_business/camera_alarm/detect_door";
/**
 * @deprecated
 */
export const CAMERA_ALARM = "/pos_business/camera_alarm";

// 加密狗
export const ENCRYPTION_ALARM = "/check_encryption/warning";

// 弹窗报警主题
export const ALARM_START_TOPIC = "/pos_business/camera_alarm";

/**
 * @deprecated
 */
export const alarm_topic = [
	TASK_FAILED_ALARM,
	SERVER_ALARM,
	ACCIDENT_ALARM,
	DETECT_DOOR_ALARM,
	CAMERA_ALARM,
	ENCRYPTION_ALARM
];
export const LOGIN_FAILURE_TOPIC = "/think_php/login_failure";
// 更新告警规则配置
export const REFRESH_ALARM_RULE_CONFIG = "/think_php/alarm/rule/configuration/refresh";

export const alarm_config = {
	enter_cross_area: true, // 进入越界
	leave_cross_area: true, // 离开越界
	super_layer_cross_area: true, // 超层越界
	danger_source: true, // 危险源
	over_man: true, // 聚集
	area_disappear: true, // 消失
	area_over_time: true, // 超时
	area_static: true, // 不动
	escort: true, // 陪同
	stray: true, // 离群
	dismantle: true, // 强拆
	get_help: true, // 求救
	video: true, // 视频
	fall: true, // 跌落
	station: true, // 基站报警
	heart_error: true, // 心率异常
	blood_error: true, // 血压异常
	overmanned: true, // 超员
	work_over_time: true, // 工作超时
	well_over_man: true, // 井下超员
	device_fault: true, // 设备故障
	car_over_time: true,
	car_over_man: true,
	car_over_speed: true,
	off_duty: true, // 脱岗报警
	abnormal_posture: true, // 姿态异常
	accident: true // 事故报警
};

// 输入自动查询延迟时间
export const input_search_delay_time = 600;

export const base_station_type = {
	"G02D09": {
		type: 1
	},
	"A02D02": {
		type: 2
	},
	"A02D04": {
		type: 3
	},
	"B02D15": {
		type: 4
	},
	"G02D12": {
		type: 5
	},
	"G02D15": {
		type: 6
	},
	"O02D12": {
		type: 7
	},
	"G05B01": {
		type: 8
	},
	"G02B01": {
		type: 9
	},
};

export const base_station_info = {
	"-1": {
		model_key: "unknown",
		name: "未知"
	},
	"0": {
		name: "UWB基站",
		model_key: "uwb",
	},
	"1": {
		name: "蓝牙AOA",
		model_key: "aoa",
	},
	"2": {
		name: "UWB基站",
		model_key: "uwb",
	},
	"3": {
		name: "iBeacon",
		model_key: "ibeacon",
	},
	"4": {
		name: "通信基站",
		model_key: "com",
	},
	"5": {
		name: "uBeacon",
		model_key: "ubeacon",
	},
	"6": {
		name: "通信基站",
		model_key: "com_D38",
	},
	"7": {
		name: "UWB基站",
		model_key: "uwb_D38",
	},
	"D19": {
		name: "UWB基站(D19)",
		model_key: "uwb_D19",
	},
	"D17": {
		name: "UWB基站(D17)",
		model_key: "uwb_D17",
	},
};

// =========== 路由名称 start ==========
export const real_time_route_name = "/display#/realTime";
export const alarm_equip_route_name = "/alarm#/equip";
export const index_route_name = "/";
export const real_time_position_route_name = "/display#/list";
export const camera_manage_route_name = "/video#/camera";
export const locating_optimum_route_name = "/systemManage#/systemConfig";
export const patrol_route_name = "/patrol#/setting";
export const call_setting_route_name = "/call#/setting";
// =========== 路由名称 end ==========

// 图标显示模式 mode_3d 代表3d模型，mode_2d 代表2d图标
export const model_3d = "1", model_icon = "2";
export const model_3d_prefix = "";
// 防止和3d模型 key 冲突
export const model_icon_prefix = "_xxx_2d_icon_";
export const default_icon_size = {
	equipment: 0.8,
	label: 0.8
};

export function getModel3DKey(model_key) {
	return model_key;
}

export function getModelIconKey(model_key) {
	if (model_key.includes(model_icon_prefix)) {
		return model_key;
	}
	return model_icon_prefix + model_key;
}

export function getModelKey(model_key, display_style) {
	return display_style === model_3d ? getModel3DKey(model_key) : getModelIconKey(model_key);
}

// 需要兼容的最大低分辨率
export const low_resolution = 1440;

// =========== 系统主题色 start ============
export const THEME_COLOR = {
	"custom-theme-blue": "#07f",
	"custom-theme-green": "#3eb2a9"
};

// =========== 系统主题色 end ============
export const ONLINE_LABEL_COLOR = "#15F9F8";
export const OFFLINE_LABEL_COLOR = "#D1D8E1";

// ===========   模型的类型  ============
export const BASE_STATION = "base_station"; // 基站
export const CAMERA = "camera"; // 摄像头
export const DEVICE = "device"; // 设备
export const TAG = "tag"; // 定位标签
export const AREA = "area"; // 区域
export const TEMP_AREA = "temp_area"; // 区域
export const SENSOR = "sensor"; // 监测监控设备
export const PICKER = "picker-id"; // 拾取坐标的图标
export const PATROL = "patrol_point"; // 巡检点
export const SCOPE_DANGER_SOURCE = "scope_danger"; // 范围
export const SCOPE_GATHER = "scope_gather"; // 范围

export const TYPE_TABLE = {
	[TAG]: 1,
	[BASE_STATION]: 2,
	[CAMERA]: 3,
	[DEVICE]: 5,
	[SENSOR]: 6,

	[PATROL]: 7,
	[SCOPE_DANGER_SOURCE]: 8,
	[SCOPE_GATHER]: 9,
	[AREA]: 20, // 3D SDK 固定值

	[PICKER]: 999

};

// 打印表格数据数量上限
export const MAX_PRINT_COUNT = 1000;

// 生成用户链接的默认访问路径
export const LOGIN_URL = "/#/";
