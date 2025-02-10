import {useDateFormat} from "@vueuse/core";

import {useRuleTypeStore} from "@/store/useRuleStore";
import {DAY_MAP} from "@/utils/js/constant";
import {normalizeHMS} from "@/utils/js/dateShortcuts";
import {getDateTimeStr} from "@/utils/js/tools/time";

export function formatTime(row: any, col: any, value: any) {
	if (!value) {
		return "--";
	}
	const date_time = getDateTimeStr({time: value * 1000, dateStr: "-", timeStr: ":"});
	return date_time.date + " " + date_time.time;
}

export function formatURLParams() {
	const url_iterator = new URLSearchParams(window.location.href.split("?")[1]).entries();
	return Array.from(url_iterator).reduce((result, [key, value]) => {
		result[key] = value;
		return result;
	}, {} as Record<string, any>);
}

const utypeToName = {
	1: "员工",
	2: "车辆",
	3: "访客",
	5: "物资",
	6: "承包商",
	0: "陌生卡"
};

export function formatUtype(row: any, col: any, value: 0 | 1 | 2 | 3 | 5 | 6) {
	return utypeToName[value] || "--";
}

export const formatRuleType = (row: any, col: any, value: number) => {
	return useRuleTypeStore().rule_type_name_map.get(value)?.alias ?? "--";
};

export const formatEffectDate = (split = "至", start_key = "start_time", end_key = "end_time") => {
	return (row: any) => {
		const begin = [null, undefined, "--", 0].includes(row[start_key]) ? "--" : row[start_key];
		const end = [null, undefined, "--", 0].includes(row[end_key]) ? "--" : row[end_key];
		if (begin === "--" || end === "--") return "永久生效";
		return `${useDateFormat(begin * 1000, "YYYY-MM-DD").value}${split}${useDateFormat(end * 1000, "YYYY-MM-DD").value}`;
	};
};

export const formatDayJson = (format: "start" | "all" = "start", split = "、") => {
	return (row: any, col: any, val: string) => {
		if (!val) return "全部星期";
		const day = (JSON.parse(val) ?? []).sort((a: number, b: number) => Number(a) - Number(b));
		return day.map((value: keyof typeof DAY_MAP, index: number) => {
			if (format === "start") {
				return index === 0 ? `星期${DAY_MAP[value]}` : DAY_MAP[value];
			} else if (format === "all") {
				return `星期${DAY_MAP[value]}`;
			}
		}).join(split) || "--";
	};
};

export const formatTimeJson = (split = "、", range_split = "至") => {
	return (row: any, col: any, val: string) => {
		if (!val) return "全天时间";
		const time_list = (JSON.parse(val) ?? []);
		return time_list.map((maybe_time_array: number | number[]) => {
			if (Array.isArray(maybe_time_array)) {
				const [start, end] = maybe_time_array;
				const start_timestamp = normalizeHMS(new Date(), "start").getTime() + start * 1000;
				const end_timestamp = normalizeHMS(new Date(), "start").getTime() + end * 1000;
				return `${useDateFormat(start_timestamp, "HH:mm").value}${range_split}${new Date(start_timestamp).getDate() < new Date(end_timestamp).getDate() ? "次日" : ""}${useDateFormat(end_timestamp, "HH:mm").value}`;
			} else {
				const timestamp = normalizeHMS(new Date(), "start").getTime() + maybe_time_array * 1000;
				return useDateFormat(timestamp, "HH:mm").value;
			}
		}).join(split) || "--";
	};
};

const HANDLE_STATUS = {
	0: "未处理",
	1: "已处理"
};
export const formatHandleStatus = (row: any, col: any, val: 0 | 1) => HANDLE_STATUS[val] || "--";

export const formatDateTime = (row: unknown, col: unknown, val: number) => [null, undefined, "--", 0].includes(val) ? "--" : useDateFormat(new Date(val * 1000), "YYYY-MM-DD HH:mm:ss").value;

/**
 * 格式为"23小时59分钟59秒"
 * @param val 秒
 */
export const formatHMS = (row: unknown, col: unknown, val: number) => {
	if ([null, undefined, "--"].includes(val as any)) return "--";
	const hours = Math.floor(val / 3600);
	const minutes = Math.floor((val - hours * 3600) / 60);
	const second = val - hours * 3600 - minutes * 60;
	const hours_str = hours === 0 ? "" : `${hours}小时`;
	const minutes_str = hours === 0 && minutes === 0 ? "" : `${minutes}分钟`;
	const second_str = second === 0 ? "" : `${second}秒`;
	return `${hours_str}${minutes_str}${second_str}` || "--";
};

export const formatCardId = (row: unknown, col: unknown, val: number) => val || "--";
