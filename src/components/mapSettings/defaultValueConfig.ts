import {
	type AreaDivide,
	BS_TYPE,
	type BuildingConfig,
	DEVICE_TYPES,
	type DeviceBaseField,
	type DisplayMode,
	type LocationLabelField
} from "@index/utils/types";
import {SETTING_KEY} from "@/components/mapSettings/pageConfig";

export type SettingName = keyof MapSetting;

export type MapSetting = {
	branch_checked_all_list: number[];
	branch_id_list: number[];
	contractor_unit_id_list: number[];
	selected_all_person: boolean;
	area_id_list: number[];
	area_select_by: AreaDivide;
	is_show_obstacle_area: boolean;
	is_show_patrol: boolean;
	is_show_visitor: boolean;
	is_show_material: boolean;
	is_show_car: boolean;
	is_show_stranger: boolean;
	show_field: LocationLabelField[];
	show_type: DisplayMode[];
	is_show_cluster: boolean;
	bs_type_list: BS_TYPE[];
	is_show_camera: boolean;
	is_show_camera_area: boolean;
	device_type_list: DEVICE_TYPES[];
	is_show_overview: boolean;
	is_show_danger: boolean;
	is_show_gather_alarm: boolean;
	is_dynamic_merge_gather: boolean;
	device_base_field: DeviceBaseField[];
	building_config: BuildingConfig[];
	is_show_blind: boolean;
	is_show_active_area: boolean;
	selected_all_pit_area: boolean;
	selected_all_roll_call_area: boolean;
	selected_all_electronic_fence: boolean;
	selected_all_attendance_area: boolean;
	selected_area_types: string[];
	selected_area_groups: string[];
	selected_all_bs: boolean;
	selected_all_contractor: boolean;
}

// 首页 *号仅map-settings使用
const index_default_setting: Readonly<MapSetting> = {
	// *全选状态的部门id
	branch_checked_all_list: [],
	// 根据部门id筛选员工
	branch_id_list: [],
	// *是否选择的显示所有人员
	selected_all_person: true,
	// 承包商单位
	contractor_unit_id_list: [],
	// 根据区域id进行筛选区域
	area_id_list: [],
	// *区域根据分组还是类型来选择
	area_select_by: "type",
	// 是否显示障碍物区域
	is_show_obstacle_area: false,
	// 是否显示巡检点
	is_show_patrol: false,
	// 是否显示访客
	is_show_visitor: true,
	// 是否显示物资
	is_show_material: true,
	// 是否显示车辆
	is_show_car: true,
	// 是否显示陌生卡
	is_show_stranger: false,
	// 定位对象显示的字段，控制名称、卡号、所在楼层显示
	show_field: ["name"],
	// 控制定位对象的显示方式, 模型/图标、热力图
	show_type: ["model_icon"],
	// 聚类、不聚类
	is_show_cluster: false,
	// 基站类型
	bs_type_list: [],
	// 是否显示摄像头
	is_show_camera: false,
	// 是否显示指定类型设备
	is_show_camera_area: false,
	// 是否显示指定类型设备
	device_type_list: [],
	// 是否显示鹰眼地图
	is_show_overview: false,
	// 是否显示危险源范围
	is_show_danger: false,
	// 是否显示聚集报警范围
	is_show_gather_alarm: false,
	// 聚集数量动态合并
	is_dynamic_merge_gather: true,
	// 设备基础字段 名称 设备ID
	device_base_field: ["name"],
	// 3D建筑显示配置
	building_config: ["layer", "building_name", "statistics"],
	// 活动区域
	is_show_active_area: false,
	// 盲区
	is_show_blind: false,
	// *全选上下井 标记全选 新增的时候自动将全选的勾上
	selected_all_pit_area: false,
	// *全选电子点名
	selected_all_roll_call_area: false,
	// *全选电子围栏
	selected_all_electronic_fence: false,
	// *全选考勤区域
	selected_all_attendance_area: false,
	// *全选区域类型
	selected_area_types: [],
	// *全选区域分组
	selected_area_groups: [],
	// *全选的基站类型
	selected_all_bs: false,
	// *全选承包商单位
	selected_all_contractor: true,
};

// 定位优化区域
const locating_optimum_default_setting: Readonly<MapSetting> = {
	branch_checked_all_list: [],
	branch_id_list: [],
	selected_all_person: false,
	contractor_unit_id_list: [],
	area_id_list: [],
	area_select_by: "type",
	// 是否显示障碍物区域
	is_show_obstacle_area: true,
	is_show_patrol: false,
	is_show_visitor: false,
	is_show_material: false,
	is_show_car: false,
	is_show_stranger: false,
	show_field: [],
	show_type: [],
	is_show_cluster: false,
	bs_type_list: [],
	is_show_camera: false,
	is_show_camera_area: false,
	device_type_list: [],
	is_show_overview: false,
	is_show_danger: false,
	is_show_gather_alarm: false,
	is_dynamic_merge_gather: false,
	device_base_field: [],
	building_config: ["layer", "building_name", "statistics"],
	// 活动区域
	is_show_active_area: true,
	// 盲区
	is_show_blind: true,
	selected_all_pit_area: false,
	selected_all_roll_call_area: false,
	selected_all_electronic_fence: false,
	selected_all_attendance_area: false,
	selected_area_types: [],
	selected_area_groups: [],
	selected_all_bs: false,
	selected_all_contractor: false,
};

// 上下井区域
const up_down_pit_default_setting: Readonly<MapSetting> = {
	branch_checked_all_list: [],
	branch_id_list: [],
	selected_all_person: false,
	contractor_unit_id_list: [],
	area_id_list: [],
	area_select_by: "type",
	is_show_obstacle_area: false,
	is_show_patrol: false,
	is_show_visitor: false,
	is_show_material: false,
	is_show_car: false,
	is_show_stranger: false,
	show_field: [],
	show_type: [],
	is_show_cluster: false,
	// 基站类型
	bs_type_list: [],
	is_show_camera: false,
	is_show_camera_area: false,
	device_type_list: [],
	is_show_overview: false,
	is_show_danger: false,
	is_show_gather_alarm: false,
	is_dynamic_merge_gather: false,
	// 设备基础字段 名称 设备ID
	device_base_field: [],
	building_config: ["layer", "building_name", "statistics"],
	is_show_active_area: false,
	is_show_blind: false,
	// *全选上下井
	selected_all_pit_area: true,
	selected_all_roll_call_area: false,
	selected_all_electronic_fence: false,
	selected_all_attendance_area: false,
	selected_area_types: [],
	selected_area_groups: [],
	selected_all_bs: false,
	selected_all_contractor: false,
};

// 电子点名
const roll_call_default_setting: Readonly<MapSetting> = {
	branch_checked_all_list: [],
	branch_id_list: [],
	selected_all_person: false,
	contractor_unit_id_list: [],
	area_id_list: [],
	area_select_by: "type",
	is_show_obstacle_area: false,
	is_show_patrol: false,
	is_show_visitor: false,
	is_show_material: false,
	is_show_car: false,
	is_show_stranger: false,
	show_field: [],
	show_type: [],
	is_show_cluster: false,
	bs_type_list: [],
	is_show_camera: false,
	is_show_camera_area: false,
	device_type_list: [],
	is_show_overview: false,
	is_show_danger: false,
	is_show_gather_alarm: false,
	is_dynamic_merge_gather: false,
	device_base_field: [],
	building_config: ["layer", "building_name", "statistics"],
	is_show_active_area: false,
	is_show_blind: false,
	selected_all_pit_area: false,
	// 点名区域
	selected_all_roll_call_area: true,
	selected_all_electronic_fence: false,
	selected_all_attendance_area: false,
	selected_area_types: [],
	selected_area_groups: [],
	selected_all_bs: false,
	selected_all_contractor: false,
};

// 电子围栏
const electronic_fence_default_setting: Readonly<MapSetting> = {
	branch_checked_all_list: [],
	branch_id_list: [],
	selected_all_person: false,
	contractor_unit_id_list: [],
	area_id_list: [],
	// *按区域分组选择
	area_select_by: "type",
	is_show_obstacle_area: false,
	is_show_patrol: false,
	is_show_visitor: false,
	is_show_material: false,
	is_show_car: false,
	is_show_stranger: false,
	show_field: [],
	show_type: [],
	is_show_cluster: false,
	bs_type_list: [],
	is_show_camera: false,
	is_show_camera_area: false,
	device_type_list: [],
	is_show_overview: false,
	is_show_danger: false,
	is_show_gather_alarm: false,
	is_dynamic_merge_gather: false,
	device_base_field: [],
	building_config: ["layer", "building_name", "statistics"],
	is_show_active_area: false,
	is_show_blind: false,
	selected_all_pit_area: false,
	selected_all_roll_call_area: false,
	// *全选电子围栏
	selected_all_electronic_fence: true,
	selected_all_attendance_area: false,
	selected_area_types: [],
	selected_area_groups: [],
	selected_all_bs: false,
	selected_all_contractor: false,
};

// 考勤区域
const attendance_area_default_setting: Readonly<MapSetting> = {
	branch_checked_all_list: [],
	branch_id_list: [],
	selected_all_person: false,
	contractor_unit_id_list: [],
	area_id_list: [],
	area_select_by: "type",
	is_show_obstacle_area: false,
	is_show_patrol: false,
	is_show_visitor: false,
	is_show_material: false,
	is_show_car: false,
	is_show_stranger: false,
	show_field: [],
	show_type: [],
	is_show_cluster: false,
	bs_type_list: [],
	is_show_camera: false,
	is_show_camera_area: false,
	device_type_list: [],
	is_show_overview: false,
	is_show_danger: false,
	is_show_gather_alarm: false,
	is_dynamic_merge_gather: false,
	device_base_field: [],
	building_config: ["layer", "building_name", "statistics"],
	is_show_active_area: false,
	is_show_blind: false,
	selected_all_pit_area: false,
	selected_all_roll_call_area: false,
	selected_all_electronic_fence: false,
	// *全选考勤区域
	selected_all_attendance_area: true,
	selected_area_types: [],
	selected_area_groups: [],
	selected_all_bs: false,
	selected_all_contractor: false,
};

// 巡检
const patrol_default_setting: Readonly<MapSetting> = {
	branch_checked_all_list: [],
	branch_id_list: [],
	selected_all_person: false,
	contractor_unit_id_list: [],
	area_id_list: [],
	area_select_by: "type",
	is_show_obstacle_area: false,
	// 显示全部巡检点
	is_show_patrol: true,
	is_show_visitor: false,
	is_show_material: false,
	is_show_car: false,
	is_show_stranger: false,
	show_field: [],
	show_type: [],
	is_show_cluster: false,
	bs_type_list: [],
	is_show_camera: false,
	is_show_camera_area: false,
	device_type_list: [],
	is_show_overview: false,
	is_show_danger: false,
	is_show_gather_alarm: false,
	is_dynamic_merge_gather: false,
	device_base_field: [],
	building_config: ["layer", "building_name", "statistics"],
	is_show_active_area: false,
	is_show_blind: false,
	selected_all_pit_area: false,
	selected_all_roll_call_area: false,
	selected_all_electronic_fence: false,
	selected_all_attendance_area: false,
	selected_area_types: [],
	selected_area_groups: [],
	selected_all_bs: false,
	selected_all_contractor: false,
};

// 摄像头
const camera_default_setting: Readonly<MapSetting> = {
	branch_checked_all_list: [],
	branch_id_list: [],
	selected_all_person: false,
	contractor_unit_id_list: [],
	area_id_list: [],
	area_select_by: "type",
	is_show_obstacle_area: false,
	is_show_patrol: false,
	is_show_visitor: false,
	is_show_material: false,
	is_show_car: false,
	is_show_stranger: false,
	show_field: [],
	show_type: [],
	is_show_cluster: false,
	bs_type_list: [],
	is_show_camera: true,
	is_show_camera_area: true,
	device_type_list: [],
	is_show_overview: false,
	is_show_danger: false,
	is_show_gather_alarm: false,
	is_dynamic_merge_gather: false,
	device_base_field: ["name"],
	building_config: ["layer", "building_name", "statistics"],
	is_show_active_area: false,
	is_show_blind: false,
	selected_all_pit_area: false,
	selected_all_roll_call_area: false,
	selected_all_electronic_fence: false,
	selected_all_attendance_area: false,
	selected_area_types: [],
	selected_area_groups: [],
	selected_all_bs: false,
	selected_all_contractor: false,
};

// 唯一性检测门
const device_door_default_setting: Readonly<MapSetting> = {
	branch_checked_all_list: [],
	branch_id_list: [],
	selected_all_person: false,
	contractor_unit_id_list: [],
	area_id_list: [],
	area_select_by: "type",
	is_show_obstacle_area: false,
	is_show_patrol: false,
	is_show_visitor: false,
	is_show_material: false,
	is_show_car: false,
	is_show_stranger: false,
	show_field: ["name"],
	show_type: [],
	is_show_cluster: false,
	bs_type_list: [],
	is_show_camera: false,
	is_show_camera_area: false,
	device_type_list: [DEVICE_TYPES.DOOR],
	is_show_overview: false,
	is_show_danger: false,
	is_show_gather_alarm: false,
	is_dynamic_merge_gather: false,
	device_base_field: ["name"],
	building_config: ["layer", "building_name", "statistics"],
	is_show_active_area: false,
	is_show_blind: false,
	selected_all_pit_area: false,
	selected_all_roll_call_area: false,
	selected_all_electronic_fence: false,
	selected_all_attendance_area: false,
	selected_area_types: [],
	selected_area_groups: [],
	selected_all_bs: false,
	selected_all_contractor: false,
};

// 电源
const device_power_default_setting: Readonly<MapSetting> = {
	branch_checked_all_list: [],
	branch_id_list: [],
	selected_all_person: false,
	contractor_unit_id_list: [],
	area_id_list: [],
	area_select_by: "type",
	is_show_obstacle_area: false,
	is_show_patrol: false,
	is_show_visitor: false,
	is_show_material: false,
	is_show_car: false,
	is_show_stranger: false,
	show_field: ["name"],
	show_type: [],
	is_show_cluster: false,
	bs_type_list: [],
	is_show_camera: false,
	is_show_camera_area: false,
	device_type_list: [DEVICE_TYPES.POWER_UPS, DEVICE_TYPES.POWER_SOURCE, DEVICE_TYPES.POWER_BOX],
	is_show_overview: false,
	is_show_danger: false,
	is_show_gather_alarm: false,
	is_dynamic_merge_gather: false,
	device_base_field: ["name"],
	building_config: ["layer", "building_name", "statistics"],
	is_show_active_area: false,
	is_show_blind: false,
	selected_all_pit_area: false,
	selected_all_roll_call_area: false,
	selected_all_electronic_fence: false,
	selected_all_attendance_area: false,
	selected_area_types: [],
	selected_area_groups: [],
	selected_all_bs: false,
	selected_all_contractor: false,
};

// 交换机
const device_switch_default_setting: Readonly<MapSetting> = {
	branch_checked_all_list: [],
	branch_id_list: [],
	selected_all_person: false,
	contractor_unit_id_list: [],
	area_id_list: [],
	area_select_by: "type",
	is_show_obstacle_area: false,
	is_show_patrol: false,
	is_show_visitor: false,
	is_show_material: false,
	is_show_car: false,
	is_show_stranger: false,
	show_field: ["name"],
	show_type: [],
	is_show_cluster: false,
	bs_type_list: [],
	is_show_camera: false,
	is_show_camera_area: false,
	device_type_list: [DEVICE_TYPES.SWITCH],
	is_show_overview: false,
	is_show_danger: false,
	is_show_gather_alarm: false,
	is_dynamic_merge_gather: false,
	device_base_field: ["name"],
	building_config: ["layer", "building_name", "statistics"],
	is_show_active_area: false,
	is_show_blind: false,
	selected_all_pit_area: false,
	selected_all_roll_call_area: false,
	selected_all_electronic_fence: false,
	selected_all_attendance_area: false,
	selected_area_types: [],
	selected_area_groups: [],
	selected_all_bs: false,
	selected_all_contractor: false,
};

// 智能发卡一体机
const device_smart_machine_default_setting: Readonly<MapSetting> = {
	branch_checked_all_list: [],
	branch_id_list: [],
	selected_all_person: false,
	contractor_unit_id_list: [],
	area_id_list: [],
	area_select_by: "type",
	is_show_obstacle_area: false,
	is_show_patrol: false,
	is_show_visitor: false,
	is_show_material: false,
	is_show_car: false,
	is_show_stranger: false,
	show_field: ["name"],
	show_type: [],
	is_show_cluster: false,
	bs_type_list: [],
	is_show_camera: false,
	is_show_camera_area: false,
	device_type_list: [DEVICE_TYPES.SMART_CARD_MACHINE],
	is_show_overview: false,
	is_show_danger: false,
	is_show_gather_alarm: false,
	is_dynamic_merge_gather: false,
	device_base_field: ["name"],
	building_config: ["layer", "building_name", "statistics"],
	is_show_active_area: false,
	is_show_blind: false,
	selected_all_pit_area: false,
	selected_all_roll_call_area: false,
	selected_all_electronic_fence: false,
	selected_all_attendance_area: false,
	selected_area_types: [],
	selected_area_groups: [],
	selected_all_bs: false,
	selected_all_contractor: false,
};

// 标签回放
const history_card_replay_default_setting: Readonly<MapSetting> = {
	branch_checked_all_list: [],
	branch_id_list: [],
	selected_all_person: false,
	contractor_unit_id_list: [],
	area_id_list: [],
	area_select_by: "type",
	is_show_obstacle_area: false,
	is_show_patrol: false,
	is_show_visitor: false,
	is_show_material: false,
	is_show_car: false,
	is_show_stranger: false,
	show_field: ["name"],
	show_type: [],
	is_show_cluster: false,
	bs_type_list: [],
	is_show_camera: false,
	is_show_camera_area: false,
	device_type_list: [],
	is_show_overview: false,
	is_show_danger: false,
	is_show_gather_alarm: false,
	is_dynamic_merge_gather: false,
	device_base_field: ["name"],
	building_config: ["layer", "building_name", "statistics"],
	is_show_active_area: false,
	is_show_blind: false,
	selected_all_pit_area: false,
	selected_all_roll_call_area: false,
	selected_all_electronic_fence: false,
	selected_all_attendance_area: false,
	selected_area_types: [],
	selected_area_groups: [],
	selected_all_bs: false,
	selected_all_contractor: false,
};

// 区域回放
const history_area_replay_default_setting: Readonly<MapSetting> = {
	branch_checked_all_list: [],
	branch_id_list: [],
	selected_all_person: true,
	contractor_unit_id_list: [],
	area_id_list: [],
	area_select_by: "type",
	is_show_obstacle_area: false,
	is_show_patrol: false,
	is_show_visitor: true,
	is_show_material: true,
	is_show_car: true,
	is_show_stranger: false,
	show_field: ["name"],
	show_type: [],
	is_show_cluster: false,
	bs_type_list: [],
	is_show_camera: false,
	is_show_camera_area: false,
	device_type_list: [],
	is_show_overview: false,
	is_show_danger: false,
	is_show_gather_alarm: false,
	is_dynamic_merge_gather: false,
	device_base_field: ["name"],
	building_config: ["layer", "building_name", "statistics"],
	is_show_active_area: false,
	is_show_blind: false,
	selected_all_pit_area: false,
	selected_all_roll_call_area: false,
	selected_all_electronic_fence: false,
	selected_all_attendance_area: false,
	selected_area_types: [],
	selected_area_groups: [],
	selected_all_bs: false,
	selected_all_contractor: true,
};

const default_value_map = {
	[SETTING_KEY.INDEX_2D]: index_default_setting,
	[SETTING_KEY.INDEX_3D]: index_default_setting,
	[SETTING_KEY.INDEX_HISTORY_2D]: index_default_setting,
	[SETTING_KEY.INDEX_HISTORY_3D]: index_default_setting,
	[SETTING_KEY.LOCATING_OPTIMUM_2D]: locating_optimum_default_setting,
	[SETTING_KEY.UP_DOWN_PIT_2D]: up_down_pit_default_setting,
	[SETTING_KEY.ROLL_CALL_2D]: roll_call_default_setting,
	[SETTING_KEY.ELECTRONIC_FENCE_2D]: electronic_fence_default_setting,
	[SETTING_KEY.ATTENDANCE_AREA_2D]: attendance_area_default_setting,
	[SETTING_KEY.PATROL_2D]: patrol_default_setting,
	[SETTING_KEY.CAMERA_2D]: camera_default_setting,
	[SETTING_KEY.DEVICE_DOOR]: device_door_default_setting,
	[SETTING_KEY.DEVICE_POWER]: device_power_default_setting,
	[SETTING_KEY.DEVICE_SWITCH]: device_switch_default_setting,
	[SETTING_KEY.DEVICE_SMART_MACHINE]: device_smart_machine_default_setting,
	[SETTING_KEY.HISTORY_CARD_REPLAY]: history_card_replay_default_setting,
	[SETTING_KEY.HISTORY_AREA_REPLAY]: history_area_replay_default_setting,
	[SETTING_KEY.HISTORY_CARD_REPLAY_3D]: history_card_replay_default_setting,
	[SETTING_KEY.HISTORY_AREA_REPLAY_3D]: history_area_replay_default_setting,
};

export const getMapSettingDefaultValue = (key: SETTING_KEY) => {
	return default_value_map[key] || index_default_setting;
};
