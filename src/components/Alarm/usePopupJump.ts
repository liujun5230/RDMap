import {Notification} from "element-ui";
import {menu_name_map} from "@/store/useMenuStore";
import {ACCIDENT_ALARM, ALARM_TYPE, AREA_ALARM, DEVICE_ALARM, HEALTH_MANAGEMENT, LOCATION_ALARM, ROLL_CALL, WISDOM_INSPECTION} from "@/types/alarm";
import {ALARM_JUMP_INDEX} from "@/events";
import {Dimension} from "@/types/map";
import {index_route_name} from "@/Config";
import {useEventBus} from "@vueuse/core";
import locationJump from "@/utils/js/locationHref";
import vuex_store from "@/store";

import type {MQTTAlarmStart} from "./type";

const DEVICE_TYPE = {
	// 基站
	BASE_STATION: 5,
	// 标签
	TAG: 9,
	// 电源
	POWER: 2,
	// 唯一性检测门
	DOOR: 1,
	// 交换机
	SWITCH: 4,
	// 发卡一体机
	CARD_MACHINE: 6,
	// 服务器
	SERVER: 7,
	// 红绿灯
	TRAFFIC_LIGHT: 10,
	// 声光报警器
	SOUND_AND_LIGHT: 11

};

function jump(url: string, sub_menu_index: string) {
	const path = url.split("?")[0];
	const user_info = vuex_store.getters.user_info;
	if (user_info.auth[path] === undefined || user_info.auth[path] === 0) {
		Notification.error({
			title: "错误",
			message: `跳转失败，无${menu_name_map.value.get(path)}页面权限`
		});
		return;
	}

	vuex_store.dispatch("app/changePage", {url, sub_menu_index});
	if (window.location.href === window.location.origin + url) {
		window.location.reload();
	} else {
		locationJump(url, true);
	}
}

function handleLocationAlarm(alarm: MQTTAlarmStart) {
	const params = new URLSearchParams([
		["id", alarm.id.toString()],
	]);
	jump(`/alarm#/alarm?${params.toString()}`, "/alarm");
}

function handleDeviceAlarm(alarm: MQTTAlarmStart) {
	const alarm_type = alarm.rule_type;
	// 设备类型
	let type;
	// 处理状态
	let status;
	// 告警原因
	let reason;
	switch (alarm_type) {
	// 标签低电量
	case ALARM_TYPE.TAG_LOW_BATTERY:
		type = DEVICE_TYPE.TAG;
		break;
		// 基站离线
	case ALARM_TYPE.BASE_STATION_OFFLINE:
		type = DEVICE_TYPE.BASE_STATION;
		break;
		// 电源离线
	case ALARM_TYPE.POWER_OFFLINE_36:
		type = DEVICE_TYPE.POWER;
		reason = "离线";
		break;
		// 电源低电量告警
	case ALARM_TYPE.POWER_LOW_BATTERY_37:
		type = DEVICE_TYPE.POWER;
		reason = "低电量";
		break;
		// 电源设备故障
	case ALARM_TYPE.POWER_DEVICE_FAILURE_38:
		type = DEVICE_TYPE.POWER;
		reason = "设备故障";
		break;
		// 电源设备告警
	case ALARM_TYPE.POWER_DEVICE_ALARM_39:
		type = DEVICE_TYPE.POWER;
		reason = "设备告警";
		break;
		// 交换机离线
	case ALARM_TYPE.SWITCH_OFFLINE:
		type = DEVICE_TYPE.SWITCH;
		reason = "离线";
		break;
		// 一体机离线
	case ALARM_TYPE.CARD_MACHINE_OFFLINE:
		type = DEVICE_TYPE.CARD_MACHINE;
		reason = "离线";
		break;
		// 一体机无卡
	case ALARM_TYPE.CARD_MACHINE_NO_CARD:
		type = DEVICE_TYPE.CARD_MACHINE;
		reason = "无卡";
		break;
	case ALARM_TYPE.SERVER_HOT_STANDBY_OFFLINE:
		reason = "双击热备离线";
		type = DEVICE_TYPE.SERVER;
		break;
	case ALARM_TYPE.DISK_SPACE_INSUFFICIENT:
		type = DEVICE_TYPE.SERVER;
		reason = "磁盘空间不足";
		break;
	case ALARM_TYPE.TRAFFIC_LIGHT_OFFLINE:
		type = DEVICE_TYPE.TRAFFIC_LIGHT;
		break;
	case ALARM_TYPE.SOUND_AND_LIGHT_ALARM_OFFLINE:
		type = DEVICE_TYPE.SOUND_AND_LIGHT;
		break;
	case ALARM_TYPE.DATABASE_SYNCHRONIZATION_ABNORMAL:
		type = DEVICE_TYPE.SERVER;
		break;
	}

	let url = "/alarm#/equip";

	const params = new URLSearchParams();
	Object.entries({type, status, reason, alarm_id: alarm.id})
		.forEach(([key, value]) => {
			if (value != null) {
				params.set(key, String(value));
			}
		});

	url += "?" + params.toString();
	jump(url, "/alarm");
}

// 电子点名
function handleRollCall(alarm: MQTTAlarmStart) {
	const params = new URLSearchParams([
		["abnormal_status", "0"],
		["id", alarm.id.toString()],
	]);

	jump(`/call#/record?${params.toString()}`, "/record");
}

// 智慧巡检
function handleWisdomInspection(alarm: MQTTAlarmStart) {
	const params = new URLSearchParams([
		["id", alarm.id.toString()],
		["active", "record"],
	]);
	jump(`/patrol#/info?${params.toString()}`, "/patrol");
}

function jumpHealth(alarm: MQTTAlarmStart) {
	let check_type = 1;
	let status = 0;
	switch (alarm.rule_type) {
	// 心率异常
	case ALARM_TYPE.HEART_RATE_ABNORMAL:
		check_type = 1;
		status = 0;
		break;
	// 血氧异常
	case ALARM_TYPE.BLOOD_OXYGEN_ABNORMAL:
		check_type = 3;
		status = 0;
		break;
	// 体温异常
	case ALARM_TYPE.TEMPERATURE_ABNORMAL:
		check_type = 2;
		status = 0;
		break;
	default:
		break;
	}
	const params = new URLSearchParams([
		["status", status.toString()],
		["id", alarm.id.toString()],
		["check_type", check_type.toString()]
	]);
	jump(`/healthy#/error?${params.toString()}`, "/health");
}

function handleAccidentAlarm(alarm: MQTTAlarmStart) {
	const params = new URLSearchParams([
		["id", alarm.id.toString()],
	]);
	jump(`/alarm#/accident?${params.toString()}`, "/accident");
}

function handleAreaAlarm(alarm: MQTTAlarmStart) {
	const params = new URLSearchParams([
		["id", alarm.id.toString()],
	]);
	jump(`/alarm#/area?${params.toString()}`, "/area");
}

export function usePopupJump() {
	const {emit: emitJump} = useEventBus(ALARM_JUMP_INDEX);
	function isIndexPage() {
		const href = window.location.href;
		const index = href.indexOf("#");
		const route_name = href.substring(index + 1);
		return route_name === index_route_name;
	}

	function viewAlarm(alarm: MQTTAlarmStart) {
		switch (true) {
		/**
			 * !!!注意顺序!!!
			 * 上下井超限/缺员告警在全局弹窗里面跳转区域告警，在小铃铛里面跳转定位对象告警
			 * 因此这里优先判断上下井缺员报警
			 */
		case AREA_ALARM.includes(alarm.rule_type) || [ALARM_TYPE.BELOW_GROUND_LACK_OF_PERSONNEL, ALARM_TYPE.BELOW_GROUND_OVER_LIMIT].includes(alarm.rule_type):
			handleAreaAlarm(alarm);
			break;
		case LOCATION_ALARM.includes(alarm.rule_type):
			handleLocationAlarm(alarm);
			break;
		case DEVICE_ALARM.includes(alarm.rule_type):
			handleDeviceAlarm(alarm);
			break;
		case HEALTH_MANAGEMENT.includes(alarm.rule_type):
			jumpHealth(alarm);
			break;
		case ROLL_CALL.includes(alarm.rule_type):
			handleRollCall(alarm);
			break;
		case WISDOM_INSPECTION.includes(alarm.rule_type):
			handleWisdomInspection(alarm);
			break;
		case ACCIDENT_ALARM.includes(alarm.rule_type):
			handleAccidentAlarm(alarm);
			break;
		case alarm.rule_type === ALARM_TYPE.DISK_SPACE_INSUFFICIENT:
			jump("/deviceManage#/status?device_name=server", "/deviceManage");
			break;
		case ALARM_TYPE.SOS === alarm.rule_type:{
			const params = new URLSearchParams([
				["id", alarm.id.toString()],
			]);
			jump(`/alarm#/help?${params.toString()}`, "/alarm");
		}
			break;
		}
	}

	function locateAlarm(alarm: MQTTAlarmStart) {
		if (!alarm.scene_id && !alarm.building_id && !alarm.floor_id) {
			return;
		}

		const display_type = Dimension.Two;
		let type = "location";
		if (alarm.area_id) {
			type = "area";
		} else if (alarm.device_uuid) {
			type = "device";
		}
		const locations = {
			type,
			result: [
				{
					scene_id: alarm.scene_id,
					building_id: alarm.building_id,
					floor_id: alarm.floor_id,
					alarm_id: alarm.id,
					card_id: alarm.card_id,
					area_id: alarm.area_id,
					device_no: alarm.device_no,
					device_uuid: alarm.device_uuid,
					display_type,
				},
			],
			source: "alarm",
		};
		if (!isIndexPage()) {
			localStorage.setItem("locations", JSON.stringify(locations));
			locationJump(index_route_name + "?time=" + new Date().getTime(), true);
		} else {
			emitJump(locations);
		}
	}

	return {
		locate: locateAlarm,
		view: viewAlarm
	};
}
