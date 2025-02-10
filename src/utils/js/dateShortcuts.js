import {getFirstDayOfMonth, getLastDayOfMonth, getYearEndDate, getYearStartDate} from "./dateUtils";

/**
 * 统一时分秒
 * @param {Date} date 日期对象
 * @param {'start' | 'end'} type 开始日期或者结束日期
 * @returns 日期对象
 */
export function normalizeHMS(date, type) {
	if (type === "start") {
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
	} else {
		date.setHours(23);
		date.setMinutes(59);
		date.setSeconds(59);
	}
	return normalMilliseconds(date);
}

/**
 *
 * @param {number | Date} date
 * @param {"start" | "end"} type
 */
export function normalizeSeconds(date, type) {
	const new_date = new Date(date);
	type === "start" && new_date.setSeconds(0, 0);
	type === "end" && new_date.setSeconds(59, 0);
	return new_date;
}

export function normalMilliseconds(date) {
	date.setMilliseconds(0);
	return date;
}

export function getRangeShortcut(diff_start, diff_end, is_normalize = true) {
	const start = new Date();
	const end = new Date();
	start.setTime(start.getTime() + diff_start);
	end.setTime(end.getTime() + diff_end);
	if (is_normalize) {
		normalizeHMS(start, "start");
		normalizeHMS(end, "end");
	} else {
		normalMilliseconds(start);
		normalMilliseconds(end);
	}
	return [start, end];
}

export function getShortcut(diff) {
	const start = new Date();
	start.setTime(start.getTime() + diff);
	return normalMilliseconds(start);
}

export function getLastMonday() {
	const date = new Date();
	const today = date.getDate();
	const current_day = date.getDay();
	const new_date = date.setDate(today - ((current_day + 6) % 7));
	return new Date(new_date);
}

export function getLastSunday() {
	const date = new Date();
	const today = date.getDate();
	const current_day = date.getDay();
	const new_date = date.setDate(today - (current_day || 7));
	return new Date(new_date);
}

export function getUpcomingSunday() {
	const date = new Date();
	const today = date.getDate();
	const current_day = date.getDay() || 7;
	const new_date = date.setDate(today - current_day + 7);
	return new Date(new_date);
}

export function getNextWeek() {
	const upcoming_sunday = getUpcomingSunday();
	const start = new Date(upcoming_sunday.setDate(upcoming_sunday.getDate() + 1));
	const end = new Date(upcoming_sunday.setDate(upcoming_sunday.getDate() + 6));
	return [normalizeHMS(start, "start"), normalizeHMS(end, "end")];
}

export function getLastWeek() {
	const last_sunday = getLastSunday();
	const start = new Date(last_sunday.setDate(last_sunday.getDate() - 6));
	const end = new Date(last_sunday.setDate(last_sunday.getDate() + 6));
	return [normalizeHMS(start, "start"), normalizeHMS(end, "end")];
}

export function getWeek() {
	const start = getLastMonday();
	const end = getUpcomingSunday();
	return [normalizeHMS(start, "start"), normalizeHMS(end, "end")];
}

export function getMonth() {
	const current_date = new Date();
	const current_year = current_date.getFullYear();
	const current_month = current_date.getMonth();

	const first_day_of_month = getFirstDayOfMonth(current_year, current_month);
	const last_day_of_month = getLastDayOfMonth(current_year, current_month);
	return [normalizeHMS(first_day_of_month, "start"), normalizeHMS(last_day_of_month, "end")];
}

export function getLastMonth() {
	const date = new Date();
	const year = date.getFullYear();
	const month = date.getMonth() - 1;

	const start = getFirstDayOfMonth(year, month);
	const end = getLastDayOfMonth(year, month);
	return [normalizeHMS(start, "start"), normalizeHMS(end, "end")];
}

export function getNextMonth() {
	const date = new Date();
	const year = date.getFullYear();
	const month = date.getMonth() + 1;

	const start = getFirstDayOfMonth(year, month);
	const end = getLastDayOfMonth(year, month);
	return [normalizeHMS(start, "start"), normalizeHMS(end, "end")];
}

export function getYear() {
	const year = new Date().getFullYear();
	const start = getYearStartDate(year);
	const end = getYearEndDate(year);
	return [normalizeHMS(start, "start"), normalizeHMS(end, "end")];
}

export function getLastYear() {
	const year = new Date().getFullYear() - 1;
	const start = getYearStartDate(year);
	const end = getYearEndDate(year);
	return [normalizeHMS(start, "start"), normalizeHMS(end, "end")];
}

export function getNextYear() {
	const year = new Date().getFullYear() + 1;
	const start = getYearStartDate(year);
	const end = getYearEndDate(year);
	return [normalizeHMS(start, "start"), normalizeHMS(end, "end")];
}

export function getToday() {
	return [normalizeHMS(new Date(), "start"), normalizeHMS(new Date(), "end")];
}

export const range_shortcuts_generator = {
	"今天": () => getToday(),
	"昨天": () => getRangeShortcut(-3600 * 1000 * 24, -3600 * 1000 * 24),
	"明天": () => getRangeShortcut(3600 * 1000 * 24, 3600 * 1000 * 24),
	"本周": () => getWeek(),
	"上周": () => getLastWeek(),
	"下周": () => getNextWeek(),
	"本月": () => getMonth(),
	"上个月": () => getLastMonth(),
	"下个月": () => getNextMonth(),
	"今年": () => getYear(),
	"去年": () => getLastYear(),
	"明年": () => getNextYear(),
	"过去7天": () => getRangeShortcut(-3600 * 1000 * 24 * 7, 0, false),
	"将来7天": () => getRangeShortcut(0, 3600 * 1000 * 24 * 7, false),
	"过去30天": () => getRangeShortcut(-3600 * 1000 * 24 * 30, 0, false),
	"将来30天": () => getRangeShortcut(0, 3600 * 1000 * 24 * 30, false),
};
