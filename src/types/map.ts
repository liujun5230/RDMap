import {
	BASE_STATION,
	CAMERA,
	DEVICE,
	TAG,
	PATROL,
	SENSOR,
	AREA
} from "@/Config";
import {Map2D, Map3D, MapContainer} from "@/components/Map";
import type {UTYPES} from "@/views/index/utils/types";

export const enum Dimension {
	Two = 1,
	Three = 2,
}

export type Map2DInstance = InstanceType<typeof Map2D>
export type Map3DInstance = InstanceType<typeof Map3D>
export type MapContainerInstance = InstanceType<typeof MapContainer>

export type FloorOption = {
	id: number,
	is_file: number,
	map_type: string,
	name: string,
}

export type MapType = "floor" | "scene" | "building" | "baidu";

export type CheckedFloor = {
	id: number,
	type: MapType,
	map_type: string,
	name?: string,
	outdoor_id?: number
	is_file?: number,
	cascade_data?: number[],
	path_node?: unknown[],
}

// 用于定位卡/设备/区域等可定位元素搜索
export type SelectedElement = {
	// 相对z坐标
	card_relative_z?: number,
	// 唯一id
	uuid?: number,
	// 标签类型(0陌生卡/1人员/2车辆/3访客/4车箱卡)
	utype?: number,
	// 事物类型(1标签卡/2设备/3区域)
	thing?: number,
	// 楼层id
	floor_id?: number,
	// 是否在线
	on_line?: number,
	// 卡号
	card_id?: number,
	// 是否静止
	static?: number,
	// 时间戳
	time?: number,
	// x坐标
	x?: number,
	// y坐标
	y?: number,
	// z坐标
	z?: number,
	// 主键id
	id?: number,
	// 是否为zigbee
	zigbee?: number,
	// 楼层名称
	floor_name?: string,
	// 建筑id
	building_id?: number,
	// 建筑名称
	building_name?: string,
	// 场景id
	scene_id?: number,
	// 场景名称
	scene_name?: string,
	// 人员名称
	person_name?: string,
	// 承包商名称
	contractor_name?: string,
	// 人员工号
	job_num?: string,
	// 访客名称
	visitor_name?: string,
	// 车牌
	licence?: string,
	// 部门id
	branch_id?: number,
	// 部门名称
	branch_name?: string,
	// 车辆信息的时候有副卡对应主卡信息
	relation?: unknown,
	// 物资编号
	serial_num?: string,
	// 物资名称
	material_name?: string,
	// 司机名称
	driver?: string,
	// 单位
	unit?: string,
	// 区域名称
	area_name?: string,
	device_id?: number,
	device_name?: string,
	type: number,
	type_name?: string
	contractor_unit?: string
	device_uuid?: string
}

export type Label =
	"员工姓名"
	| "员工工号"
	| "访客姓名"
	| "承包商姓名"
	| "车牌号"
	| "物资编号"
	| "卡号"
	| "设备名称"
	| "设备ID"
	| "区域名称";

export type Field =
	"person_name"
	| "job_num"
	| "visitor_name"
	| "contractor_name"
	| "licence"
	| "serial_num"
	| "card_id"
	| "device_name"
	| "device_id"
	| "area_name"
	| "accurate_card_id"
	| "accurate_device_id"
	| "device_uuid";

export type FloorInfo = {
	id: number
	name: string
	type: number
	start: number
	height: number
	building_id: number
	floor_2d_file: number
	floor_3d_file: number
	floor_scaling_ratio: any
	coordinate_left: number
	coordinate_right: number
	coordinate_upper: number
	coordinate_down: number
	origin_x: null | string,
	origin_y: null | string,
	drop_multiple: number
	upload_2d_time: number
	upload_3d_time: number
	rotation: number
	mercator_json: MercatorJson[]
	wgs84_json: Wgs84Json[]
	direction: number
	direction_vector: string
	floor_scene_coordinate: FloorSceneCoordinate
	storey_id: number
	storey_name: string
	file_2d_path: string
	file_3d_path: string
	file_3d_type: number
	map_configure: MapConfigure
	origin_data: OriginData
	view_json: ViewJson
	origin_file: string
	scene_id: number
	scene_name: string
	scene_file_path: string
	scene_file_3d_type: number
	scene_download_3d_path: string
	building_name: string
	download_3d_path: string
	is_file: number
	file_2d_postfix: string
}

export type MercatorJson = {
	x: string
	y: number
}

export type Wgs84Json = {
	x: string
	y: string
}

export type FloorSceneCoordinate = {
	matrix: string[]
	translate: Translate
}

export type Translate = {
	translate_x: string
	translate_y: string
	translate_z: string
}

export type MapConfigure = {
	zoom: LimitRange
	label: LimitRange
	equipment: LimitRange
	inspection_point: LimitRange
	config_3d: Config3d
}

export type LimitRange = {
	max: string
	min: string
}

export type Config3d = {
	layered_icon_size: string
	display_style: string
	label: string
	equipment: string
}

export type OriginData = {
	width: string
	height: string
	input_x: string
	input_y: string
	select_x: string
	select_y: string
	default_width: string
	default_height: string
}

export type ViewJson = {
	camera_params: CameraParams
}

export type CameraParams = {
	camera_position: Position
	target_position: Position
}

export type Position = {
	x: string
	y: string
	z: string
}

/**
 * 2D SDK 和 3D SDK 聚类数据
 */
export type Cluster3D = {
	[key: string]: {
		cluster_center_point: {
			x: number,
			y: number,
			z: number
		},
		card_list: number[],
		camera_dist: number,
		cluster_center: {
			x: number,
			y: number,
			z: number
		}
	}
}

export type Cluster2D = {
	cluster_list: {
		cluster_center_point: {
			x: number,
			y: number
		},
		card_list: number[],
		camera_dist: number,
		cluster_center: {
			x: number,
			y: number
		}
	}[],
	type: string
	target: unknown
}

export type ClusterCard = {
	utype: UTYPES
	uuid?: number
	card_id: number
	label: string
	time: number
}

export type Card = {
	uuid: number
	name: string
	sex: number
	person_photo: string
	id_code: string
	phone: string
	origin: any
	nation: string
	political: any
	address: string
	birthday: any
	emergency_person: any
	emergency_phone: any
	job_num: string
	branch_id: number
	duty_id: number
	auth: number
	status: number
	entry_time: any
	leave_time: any
	sort_num: number
	custom_a: any
	custom_b: any
	custom_c: any
	is_del: number
	work_type_id: number
	workplace: string
	icon_id: number
	icon_follow_type: number
	model_id: number
	model_follow_type: number
	utype: number
	card_id: number
	card_type: number
	branch_name: string
	model_name: string
	model_3d_url: string
	model_2d_url: string
	hat_url: string
	clothing_url: string
	select_model_2d_url: string
	offline_model_3d_url: string
	offline_model_2d_url: string
	licence: any
	is_in_security_area: number
	icon_model_attr: IconModelAttr
}

export type IconModelAttr = {
	model_name: string
	model_id: number
	model_2d_url: string
	model_2d_s_url: string
	model_2d_off_url: string
	model_2d_off_s_url: string
	model_3d_url: string
	model_3d_off_url: string
	fullbody_url: string
	icon_name: string
}

export const enum Thing {
	CARD = 1,
	DEVICE = 2,
	AREA = 3,
}

export interface NowClickFeature {
	id: number,
	type: typeof BASE_STATION | typeof CAMERA | typeof DEVICE | typeof TAG | typeof SENSOR | typeof PATROL | typeof AREA | SCOPE_TYPE,
	coordinate: number[]
	uuid?: number
}

// 范围类型
export const enum SCOPE_TYPE {
	DANGER_SOURCE = "scope_danger",
	GATHER = "scope_gather",
}
