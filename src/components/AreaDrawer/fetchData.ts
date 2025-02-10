import {Notification} from "element-ui";
import {getAlarmRuleType} from "@/api/area/alarmRule";

import {getAreaGroup} from "@/api/area/areaGroup";
import {getAreaTemplate} from "@/api/area/areaTemplate";
import {getAreaDict} from "@/api/area/areaDict";

import type {AreaGroup, Option, AreaDict} from "./types";
import type {AreaTemplate} from "@/types/area";

async function getTemplateOptions(): Promise<Option<AreaTemplate>[]> {
	try {
		const response = await getAreaTemplate({});
		const {type, result} = response.data;
		if (type === 1) {
			return (result.data as AreaTemplate[]).map(
				template => {
					return {
						label: template.name,
						value: template,
					};
				}
			);
		} else {
			Notification.error({
				title: "错误",
				message: result
			});
			return [];
		}
	} catch (error) {
		console.error("Error fetching template options:", error);
	}
	return [];
}

async function getAreaGroupOptions() {
	const response = await getAreaGroup();
	if (response.data.type === 1) {
		return (response.data.result.data as AreaGroup[]).map(value => ({
			label: value.name,
			value: value
		}));
	} else {
		Notification.error({
			title: "错误",
			message: response.data.result
		});
	}
}

// 获取区域字典
async function getAreaDictData(): Promise<AreaDict[]> {
	const response = await getAreaDict();
	if (response.data && response.data.type === 1) {
		return response.data.result as AreaDict[];
	}

	Notification.error({
		title: "错误",
		message: response.data.result
	});
	return [];
}

/**
 * 获取规则类型
 * @param search_type 类型，普通规则类型，区域规则类型
 */
async function fetchRuleType(search_type: "rule" | "area") {
	const response = await getAlarmRuleType({search_type});
	if (response.data.type === 1 && Array.isArray(response.data.result)) {
		return response.data.result;
	}
	console.error("获取规则类型错误: getAlarmRuleType");
}

export {
	getTemplateOptions,
	getAreaGroupOptions,
	getAreaDictData,
	fetchRuleType,
};
