import {getConfig, type SystemConfig} from "@/api/configuration/sysConfig";
import {rgbToHex} from "@/utils/js/common";
import {removeColorAlpha} from "@/views/index/utils/tool";

export const enum RULE_TYPE {
  GATHER = 8,
	DANGER_SOURCE = 10,
}

export async function getSystemConfig() {
	const resp = await getConfig();
	if (resp.data.type === 1) {
		return resp.data.result;
	}
	return [];
}

export function getAlarmColor(rule_type: number, level: string, sys_configs?: SystemConfig[], use_sysconfig = false) {
	let color = ["rgba(255,89,100, 1)", "rgba(246,141,45, 1)", "rgba(210,175,0, 1)"];

	if (use_sysconfig) {
		color
      = rule_type === RULE_TYPE.GATHER && sys_configs
				? sys_configs?.filter((config) => ["GATHER_ALARM_COLOR_A", "GATHER_ALARM_COLOR_B", "GATHER_ALARM_COLOR_C"].includes(config.name))?.map((config) => config.value)
				: ["rgba(255,89,100, 1)", "rgba(246,141,45, 1)", "rgba(210,175,0, 1)"];
	}

	const level_index = {
		a: 0,
		b: 1,
		c: 2,
	} as Record<string, number>;

	return color[level_index[level]] ?? "rgba(255,89,100, 1)";
}

export function getGatherAlarmColor(level: string, sys_configs?: SystemConfig[]) {
	const main_color = getAlarmColor(RULE_TYPE.GATHER, level, sys_configs, true);
	const pure_color = rgbToHex(removeColorAlpha(main_color));
	return {
		scope_style: {
			is_gradient: true,

			background_color: main_color,
			border_color: main_color,
			border_width: 1,

			hover_background_color: main_color,
			hover_border_color: "#00FFFE",
			hover_border_width: 2,

			click_background_color: main_color,
			click_border_color: "#00fffe",
			click_border_width: 2,
		},

		label_style: {
			background_color: "#332E2C",
			border_color: pure_color,
			color: pure_color,

			hover_background_color: pure_color,
			hover_border_color: pure_color,
			hover_color: "#FFF",
			hover_border_width: 1,

			click_background_color: pure_color,
			click_border_color: "#00fffe",
			click_border_width: 1,
			click_color: "#FFF",
		},
	};
}

export function getDangerSourceStyle(level: string) {
	const main_color = getAlarmColor(RULE_TYPE.DANGER_SOURCE, level);
	const pure_color = rgbToHex(removeColorAlpha(main_color));
	return {
		scope_style: {
			is_gradient: false,
			background_color: pure_color?.toUpperCase() + "4D",
			border_color: main_color,
			border_width: 1,

			hover_background_color: pure_color?.toUpperCase() + "4D",
			hover_border_color: "#00FFFE",
			hover_border_width: 2,

			click_background_color: pure_color?.toUpperCase() + "4D",
			click_border_color: "#00fffe",
			click_border_width: 2,
		},

		label_style: {
			background_color: "#332E2C",
			border_color: main_color,
			color: main_color,

			hover_background_color: main_color,
			hover_border_color: main_color,
			hover_color: "#FFF",
			hover_border_width: 1,

			click_background_color: main_color,
			click_border_color: "#00fffe",
			click_border_width: 1,
			click_color: "#FFF",
		},
	};
}
