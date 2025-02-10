import {model_3d} from "@/Config";

/**
 * TODO 此文件之前是js文件，所有没有使用常量枚举，可优化
 */

/**
 * 卡类型
 */
export const enum UTYPES {
	UNKNOWN = 0, // 陌生卡
	PERSON = 1, // 员工
	CAR = 2, // 车辆
	VISITOR = 3, // 访客
	CAR_SEMI = 4, // 车辆副卡
	MATERIAL = 5, // 物资
	CONTRACTOR = 6 // 承包商
}

/**
 * 跟随状态
 */
export const PATROL_STATUS = {
	SCENE: 1, // 地图视角跟随
	PERSON: 2, // 人员视角跟随
	STOP: 0, // 无跟随
};

/**
 * 设备类型
 */
export const enum DEVICE_TYPES {
	DOOR = 1, // 检测门
	POWER_SOURCE = 2, // 浇封电源
	POWER_BOX = 3, // 隔爆电源
	POWER_UPS = 8, // ups电源
	SWITCH = 4, // 交换机
	BASE_STATION = 5, // 基站
	SMART_CARD_MACHINE = 6, // 智能发卡一体机
	CAMERA = 9, // 摄像头
	TRAFFIC_LIGHT = 10, // 红绿灯
	LIGHT_ALARM = 11, // 声光报警器
}

/**
 * 设备状态
 */
export const DEVICE_STATUS = {
	OFFLINE: 0, // 在线
	ONLINE: 1, // 离线
	FAULT: 2 // 故障
};

/**
 * 地图类型
 */
export const MAP_TYPE = {
	BAIDU: "baidu", // 百度地图
	FLOOR: "floor", // 楼层
	BUILDING: "building", // 建筑
	SCENE: "scene", // 场景
};

/**
 * 自定义模型加载状态
 */
export const MODEL_LOADING_STATE = {
	INITIAL: "initial", // 准备加载
	PENDING: "pending", // 正在加载
	SUCCESS: "success", // 加载完成
};

export const TWO_DIMENSION = 1;
export const THREE_DIMENSION = 2;

/**
 * 返回模型文件状态的前缀
 * @param {number} status 设备状态
 * @returns 模型前缀
 */
export function getStatus (status: number) {
	if (status === DEVICE_STATUS.OFFLINE)
		return "offline_";
	return "";
}
/**
 * 返回对应的模型key
 * @param {number} device_type 设备类型
 * @param {number} status 设备状态
 * @param {boolean} display_style 图标/模型
 * @return {string} 设备模型key
 */
export function getDeviceModelKey (device_type:string, status: string, display_style: number) {
	if (+display_style === +model_3d)
		return "device" + device_type;

	const prefix = getStatus(+status);
	return prefix + "device" + device_type;
}

/**
 * 基站类型
 */
export const enum BS_TYPE {
	UNKNOWN = -1,
	AOA = 1,
	UWB = 2,
	IBEACON = 3,
	COM = 4,
	UBEACON = 5,
	COM_D38 = 6,
	UWB_D38 = 7,
}
export const UWB_TYPE = {
	D19: "D19",
	D17: "D17"
};

/**
 * 定位对象的显示字段
 */
export type LocationLabelField = "name" | "card_id" | "floor_name";
export type DisplayMode = "heat" | "model_icon";
export type DeviceBaseField = "name" | "device_id" | "floor_name";
export type AreaDivide = "group" | "type";
export type BuildingConfig = "layer" | "building_name" | "statistics"

/**
 * 模块的排序设置
 */
export interface ModuleSorting {
	id: number | string,
	pid: number | string,
	sorting: number,
	node?: ModuleSorting[]
}
/**
 * 模块的显示设置
 */
export type ModuleDisplay = Record<number | string, boolean>;

export const enum AREA_TYPE {
	OBSTACLE = 13, // 障碍物区域
	ACTIVITY = 14, // 活动区域
	BLIND = 15, // 盲区
}
