import request from "@/utils/js/request";
import type {Response} from "@/types/global";

export type OperateSequence = {
	system_name: string
	edit: Theme[]
	add: Array<Omit<Theme, "id">>
	delete: Theme[]
}

export type ThemeSortItem = {
  theme_id: number,
  sorting: number
}

export type Module = {
	id: number,
	name: string,
	group_name: string,
	show_name: string,
	show_space: 1 | 2 | 3,
	sorting: number,
	auto_scrolling: number,
	filter_zero: number,
	options: {
		id: number,
		pid: number,
		name: string,
		sorting: number,
		is_display: number,
		is_use: number,
		group_name?: number, // 告警类别，当日告警统计和告警趋势模块特有字段
		rule_type?: string, // 规则类型type，当日告警统计和告警趋势模块特有字段
		alias?: string, // 当日告警区域统计/当日告警动态模块特有字段
		type?: string // 设备在线统计模块类型id，设备类型-基站类型(不是基站的基站类型为0)
	}[],
	settings: any,
	theme_id: number
}

export type Theme = {
	id: number,
	name: string,
	sorting: number,
	is_system: number,
	module: Module[]
}

export type System = {
	system_name: string,
	themes: Theme[]
}
export function getHomeTheme ():Response<Theme[]> {
	return request({
		url: "/EHCommon/configuration/HomeTheme/getHomeTheme",
		method: "post"
	});
}

export function getSystemName ():Response<string> {
	return request({
		url: "/EHCommon/configuration/HomeTheme/getSystemName",
		method: "post"
	});
}

export function operateThemes (data: OperateSequence) {
	return request({
		url: "/EHCommon/configuration/HomeTheme/setAllTheme",
		method: "post",
		data
	});
}

export function getDeafultSetting ():Response<Module[]> {
	return request({
		url: "/EHCommon/configuration/HomeTheme/getDefaultSetting",
		method: "post"
	});
}

export function setAccount (data: {theme_id: number, map_setting_json: string, modules: string}) {
	return request({
		url: "/EHCommon/configuration/HomeTheme/setAccount",
		method: "post",
		data
	});
}

export function getAccount () {
	return request({
		url: "/EHCommon/configuration/HomeTheme/getAccount",
		method: "post",
	});
}

export function delAccount (data: {id: number}) {
	return request({
		url: "/EHCommon/configuration/HomeTheme/delAccount",
		method: "post",
		data
	});
}
