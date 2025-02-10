import type {InjectionKey} from "vue";
import type {Ref} from "vue";
import {resolveCustomText} from "@/store/modules/featureFlags";

export const enum AreaTypes {
	UP_DOWN_PIT = "up_down_pit",
	VIRTUAL_FENCE = "virtual_fence",
	CAMERA = "camera",
	LOCATING_OPTIMUM = "locating_optimum",
	CALL = "call",
	PATROL_ROUTE = "patrol_route",
	PATROL_POINT = "patrol_point",
	ATTENDANCE_AREA = "attendance_area",
}
/**
 * 区域类型
 * 1普通,
 * 2考勤区域,
 * 3电子点名区域,
 * 9第一区域,
 * 10第二区域,
 * 11摄像机区域,
 * 12巡检点区域,
 * 13障碍物区域,
 * 14活动区域,
 * 15盲区
 */

export const numberToAreaTypes = {
	1: AreaTypes.VIRTUAL_FENCE,
	2: AreaTypes.ATTENDANCE_AREA,
	3: AreaTypes.CALL,
	9: AreaTypes.UP_DOWN_PIT,
	10: AreaTypes.UP_DOWN_PIT,
	11: AreaTypes.CAMERA,
	12: AreaTypes.PATROL_POINT,
	13: AreaTypes.LOCATING_OPTIMUM,
	14: AreaTypes.LOCATING_OPTIMUM,
	15: AreaTypes.LOCATING_OPTIMUM
};

export const typeToTitle = {
	[AreaTypes.VIRTUAL_FENCE]: "电子围栏设置",
	[AreaTypes.ATTENDANCE_AREA]: "考勤区域设置",
	[AreaTypes.CALL]: "点名区域设置",
	[AreaTypes.UP_DOWN_PIT]: resolveCustomText("pit") + "区域设置",
	[AreaTypes.CAMERA]: "摄像机区域设置",
	[AreaTypes.PATROL_POINT]: "巡检点区域设置",
	[AreaTypes.LOCATING_OPTIMUM]: "定位优化区域设置"
};

export const LOCATING_OPTIMUM_CACHE_KEY = "locating_optimum_drawer_form";
export const CAMERA_CACHE_KEY = "camera_drawer_form";

export const AreaDrawerProvideKey = Symbol("AreaDrawerProvideKey") as InjectionKey<Ref<{
	area_id?: number
	area_type: AreaTypes
	from: "map" | "table",
	title?: string,
	options?: any
	is_show: boolean
}>>;
