import request from "@/utils/js/request";
import type {EHCommonResponse} from "@/types/request";

// 报警规则设置ID
export type AlarmConfigParams = {
	id: number;
	// 报警弹窗是否开启[0不开启,1开启]
	window_enable?: number;
	// 告警级别
	alarm_level?: number;
	// 报警弹窗优先级
	window_level?: number;
	// 语音播报是否开启[0不开启,1开启]
	video_enable?: number;
	// 语音文件类型[1跟随系统,2自定义]
	video_file_type?: number;
	// 语音文件
	video_file?: string;
	// 闪屏是否开启[0不开启,1开启]
	shake_screen_enable?: number;
	// 标签告警推送是否开启[0不开启,1开启]
	message_publish_enable?: number;
	// 标签告警推送是否携带告警级别[0不携带,1携带]
	message_alarm_level_enable?: number;
	// 推送文字消息内容
	message_content?: string;
	// 消息重复推送是否开启[0不开启,1开启]
	message_repeat_publish_enable?: number;
	// 告警重复推送周期，单位秒
	message_repeat_publish_interval?: number;
};

export function updateAlarmConfiguration(data: AlarmConfigParams) {
	return request<EHCommonResponse<string>>({
		url: "/EHCommon/alarm/configuration/update",
		method: "post",
		data
	});
}

export type TableFilterParams = {
	alarm_type_id?: number;
	rule_type_id?: number;
	alarm_level_value?: number;
	page?: number;
	limit?: number;
};

export type AlarmConfig = {
	id: number;
	// 报警弹窗是否开启[0不开启,1开启]
	window_enable: number;
	// 告警级别
	alarm_level_value: string;
	alarm_level_name: string;
	alarm_level_alias: string;
	// 报警弹窗优先级
	window_level: number;
	// 语音播报是否开启[0不开启,1开启]
	video_enable: number;
	// 语音文件类型[1跟随系统,2自定义]
	video_file_type: 1 | 2;
	// 语音文件
	video_file: string;
	// 闪屏是否开启[0不开启,1开启]
	shake_screen_enable: number;
	// 标签告警推送是否开启[0不开启,1开启]
	message_publish_enable: number;
	// 标签告警推送是否携带告警级别[0不携带,1携带]
	message_alarm_level_enable: number;
	// 推送文字消息内容
	message_content: string;
	// 消息重复推送是否开启[0不开启,1开启]
	message_repeat_publish_enable: number;
	// 告警重复推送周期，单位秒
	message_repeat_publish_interval: number;
}

export type AlarmRuleResponseItem = {
	id: number;
	alarm_type_name: string;
	rule_type_name: string;
	rule_type_alias: string;
	rule_type_id: number;
	configuration: AlarmConfig
};

export function getAlarmConfiguration(data?: TableFilterParams) {
	return request<EHCommonResponse<{
		data: AlarmRuleResponseItem[];
		count: number;
	}>>({
		url: "/EHCommon/alarm/configuration/get",
		method: "post",
		data
	});
}

export interface AlarmLevelResponseItem {
	value: string,
	name: string,
	alias: string
}
export function getAlarmLevel() {
	return request<EHCommonResponse<AlarmLevelResponseItem[]>>({
		url: "/EHCommon/alarm/configuration/getAlarmLevel",
		method: "post"
	});
}

export type BatchUpdateAlarmConfig = {
	id_list: number[];
	window_enable?: number;
	window_level?: number;
	video_enable?: number;
	shake_screen_enable?: number;
	message_publish_enable?: number;
};

export function batchUpdateAlarmConfiguration(data: BatchUpdateAlarmConfig) {
	return request<EHCommonResponse<string>>({
		url: "/EHCommon/alarm/configuration/batchUpdate",
		method: "post",
		data
	});
}

export function setAlarmLevel(config: {
	value: string;
	alias: string;
}[]) {
	return request<EHCommonResponse<string>>({
		url: "/EHCommon/alarm/configuration/setAlarmLevel",
		method: "post",
		data: {
			config
		}
	});
}

export function updateRuleTypeAlias(data: {
	id: number;
	alias: string;
}) {
	return request<EHCommonResponse<string>>({
		url: "/EHCommon/alarm/configuration/updateRuleTypeAlias",
		method: "post",
		data
	});
}

export function checkRuleTypeAliasName(data: {
	id?: number;
	name: string;
}) {
	return request<EHCommonResponse<{
		check: boolean;
		message: string;
	}>>({
		url: "/EHCommon/alarm/configuration/checkRuleTypeAliasName",
		method: "post",
		data
	});
}

export interface RuleTypeResultItem {
	id: number,
	name: string,
	alias: string
}

export function getRuleType(data?: {only_area_alarm?: number, alarm_type_id?: number}) {
	return request<EHCommonResponse<RuleTypeResultItem[]>>({
		url: "/EHCommon/alarm/configuration/getRuleType",
		method: "post",
		data
	});
}

/**
 * @description 更新语音文件
 */
export function updateAudioFile(data: {
	// 告警规则设置ID
	id: number
	// 语音文件类型[1跟随系统,2自定义]
	video_file_type: number;
	// 语音文件
	video_file?: unknown;
}) {
	return request<EHCommonResponse<string>>({
		url: "/EHCommon/alarm/configuration/uploadVideoFile",
		method: "post",
		data
	});
}

export type AlarmType = {
	id: number;
	name: string;
};

export function getAlarmType() {
	return request<EHCommonResponse<AlarmType[]>>({
		url: "/EHCommon/alarm/configuration/getAlarmType",
		method: "post"
	});
}
