import type {EHCommonResponse} from "@/types/request";
import request from "@/utils/js/request";

// 新增障碍区域
export function addObstacle(data: unknown) {
	return request({
		url: "/EHCommon/area/obstacle/add",
		method: "post",
		data
	});
}

// 删除障碍区域
export function delObstacle(data: unknown) {
	return request({
		url: "/EHCommon/area/obstacle/delete",
		method: "post",
		data
	});
}

// 查询定位优化区域
type OptimizeArea = {
		id: number; // 区域id
		name: string; // 区域名
		type: number; // 区域类型, [13-障碍物区域,14-活动区域,15-盲区]
		shape: number; // 形状，1非圆形，2圆形，此接口只会返回1
		area: string; // 区域坐标字符串, 每个点x,y由逗号分隔，点与点由空格分隔
		is_use: number; // 是否启用区域
		floor_id: number; // 楼层id
		area_template: {
			area_style: string; // 区域颜色
			relative_start: number; // 定位优化区域高度起始
			relative_end: number; // 定位优化区域高度结束
		};
		z_start: number; // 定位优化区域绝对高度结束
		z_end: number; // 巡检点绝对高度结束
	};
export function getObstacle(data: {
	name?:string
	floor_id?: number
}) {
	return request<EHCommonResponse<OptimizeArea[]>>({
		url: "/EHCommon/area/obstacle/get",
		method: "post",
		data
	});
}

// 更新障碍区域
export function updateObstacle(data: unknown) {
	return request({
		url: "/EHCommon/area/obstacle/update",
		method: "post",
		data
	});
}

export function createObstacleAreaPic(data: unknown) {
	return request({
		url: "/EHCommon/area/Obstacle/createObstacleAreaPic",
		method: "post",
		data
	});
}

export function checkObstacleName(data: unknown) {
	return request({
		url: "/EHCommon/area/Obstacle/checkName",
		method: "post",
		data
	});
}
