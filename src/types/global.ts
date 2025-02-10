import type {AxiosPromise} from "axios";

/**
 * TODO 类型定义和./request.ts中的类型定义一致,可以删除
 */
export type Response<T> = AxiosPromise<{
	type: number;
	message: string;
	result: T
}>;

export type Order = {
	[key: `${number}`]: number;
}

export type Color = `rgba(${number},${number},${number},${number})`

export type Option<T = unknown, U = string> = {
	label: string;
	value: T;
	id: U;
}

export const enum FloorCascadeType {
	SCENE = "scene",
	BUILDING = "building",
	FLOOR = "floor",
	ALL = "all"
}

export interface FloorCascadeData {
	cascade_data: number[],
	id: number,
	type: FloorCascadeType,
	path_node: any[]
}

export type AreaSelectData = { [key: number]: number[] };

// 列表页搜索项合并的key
export type InputSearchTagKey =
	"person_name"
	| "visitor_name"
	| "licence"
	| "driver"
	| "serial_num"
	| "material_name"
	| "card_id";

export const enum AreaType {
	/** 电子围栏 */
	VIRTUAL_FENCE = 1,
	/** 考勤 */
	ATTENDANCE = 2,
	/** 电子点名 */
	CALL = 3,
	/** 第一区域 */
	UP_DOWN_PIT_FIRST = 9,
	/** 第二区域 */
	UP_DOWN_PIT_SECOND = 10,
	/** 摄像机 */
	CAMERA = 11,
	/** 巡检点 */
	PATROL_POINT = 12,
	/** 障碍物 */
	OBSTACLE = 13,
	/** 活动 */
	ACTIVITY = 14,
	/** 盲区 */
	BLIND = 15
}

// 列表所在区域值
export interface TableAreaItem {
	area_id: number,
	area_name: string,
	type: AreaType,
	group_id: number,
	group_name: string
	is_all_map: number
}

export interface TableSortOrder {
	prop: string,
	order: "ascending" | "descending" | null
}
