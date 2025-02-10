import i18n from "@/lang/common";

/**
 * 获取指定时间或当前时间字符串
 * @param {time,dateStr,timeStr}
 * @param time 指定时间戳
 * @param dateStr 日期间隔符
 * @param timeStr 时间间隔符
 */
export function getDateTimeStr(options) {
	const date = options.time ? new Date(options.time) : new Date();
	const dateStr = options.dateStr || "";
	const timeStr = options.timeStr || "";
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	const hour = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");
	const second = date.getSeconds().toString().padStart(2, "0");
	return {
		date: `${year}${dateStr}${month}${dateStr}${day}`,
		time: `${hour}${timeStr}${minutes}${timeStr}${second}`
	};
}

// 获取当天或者指定时间的00：00的时间戳和23：59的时间戳
export function getDayTimeStamp(date) {
	const now = date ? new Date(date) : new Date();
	return {
		start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime(),
		end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime()
	};
}

// 获得当天00：00和23：59的时间字符串
export function getTodayTime() {
	const now = new Date();
	return {
		start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0),
		end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
	};
}

// 规则的时间的选择显示
export function timeIsForeverValid(start, end) {
	if (start === 0 || end === 0) {
		return i18n.t("rule.time_is_forever");
	} else {
		return `${getDateTimeStr({time: start, dateStr: "-", timeStr: ":"}).date} ${getDateTimeStr({
			time: start,
			dateStr: "-",
			timeStr: ":"
		}).time}${i18n.t("rule.to")}${getDateTimeStr({
			time: end,
			dateStr: "-",
			timeStr: ":"
		}).date} ${getDateTimeStr({time: end, dateStr: "-", timeStr: ":"}).time}`;
	}
}

/**
 * 数字转时间
 * @param value
 * @param timeStr 默认用时分秒间隔
 * @param fill_zero 是否补零
 * @param show_seconds 是否显示0秒
 * @returns {string}
 */
export function numberToTime(value, timeStr, fill_zero, show_seconds = false) {
	let seconds = parseInt(value); // 秒
	let minute = 0; // 分
	let hour = 0; // 小时
	let day = 0;
	if (seconds > 59) {
		minute = parseInt(seconds / 60);
		seconds = parseInt(seconds % 60);
		if (minute > 59) {
			hour = parseInt(minute / 60);
			minute = parseInt(minute % 60);
			if (hour > 24) {
				day = parseInt(hour / 24);
				hour = parseInt(hour % 24);
			}
		}
	}
	const pad_num = fill_zero ? 2 : 0;
	let result = "" + parseInt(seconds).toString().padStart(pad_num, "0") + (timeStr ? "" : "秒");
	if (!show_seconds && seconds === 0 && (minute || hour || day)) {
		result = "";
	}
	if (minute > 0) {
		result = "" + parseInt(minute).toString().padStart(pad_num, "0") + (timeStr || "分钟") + result;
	}
	if (hour > 0) {
		result = "" + parseInt(hour).toString().padStart(pad_num, "0") + (timeStr || "小时") + result;
	}
	if (day > 0) {
		result = "" + parseInt(day).toString().padStart(pad_num, "0") + (timeStr || "天") + result;
	}
	return result;
}

// 获取当前自然周时间区间
export function getWeekSection() {
	const now_time_stamp = new Date(Date.now());
	const week_days = new Date().getDay() - 1;
	const last_time_stamp = new Date(Date.now() - 86400000 * (week_days >= 0 ? week_days : 6));
	const now_year = now_time_stamp.getFullYear();
	const last_year = last_time_stamp.getFullYear();
	const now_month = ("0" + now_time_stamp.getMonth()).slice(-2);
	const last_month = ("0" + last_time_stamp.getMonth()).slice(-2);
	const now_day = ("0" + now_time_stamp.getDate()).slice(-2);
	const last_day = ("0" + last_time_stamp.getDate()).slice(-2);
	return [
		new Date(last_year, last_month, last_day, 0, 0, 0),
		new Date(now_year, now_month, now_day, 23, 59, 59)
	];
}

/**
 * 获取最近一周的时间区间
 * 从当前开始算往前数6天，共七天，比如今天2023-04-19，那么返回2023-04-13 00:00:00 - 2023-04-19 23:59:59
 * @returns {Date[]}
 */
export function getLastWeek() {
	return [
		new Date((new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)).setHours(0, 0, 0, 0)),
		new Date(new Date().setHours(23, 59, 59, 0))
	];
}

export function getFirstDayOfWeek(date) {
	const weekday = date.getDay() || 7; // 获取星期几,getDay()返回值是 0（周日） 到 6（周六） 之间的一个整数。0||7为7，即weekday的值为1-7
	date.setDate(date.getDate() - weekday + 1); // 往前算（weekday-1）天，年份、月份会自动变化
	return date;
}

/**
 * 获取日期的周内数，跟后端保持一致 0-周一, 1-周二, ..., 6-周天
 * @param {Date | number | string} date
 */
export function getWeekDay(date) {
	const real_date = new Date(date);
	return (real_date.getDay() + 6) % 7;
}

/**
 * 获取一段时间内的包含的周内数
 * @param {Date | number | string} start
 * @param {Date | number | string} end
 */
export function getWeekRanges(start, end) {
	const start_timestamp = getDayTimeStamp(start).start;
	const end_timestamp = getDayTimeStamp(end).start;
	let loop_timestamp = start_timestamp;
	const week_ranges = new Set();
	while (loop_timestamp <= end_timestamp) {
		week_ranges.add(getWeekDay(loop_timestamp));
		loop_timestamp += 24 * 60 * 60 * 1000;
		if (week_ranges.size > 6) {
			const week_ranges_string = [...week_ranges].sort((a, b) => a - b).join("");
			if (week_ranges_string === "0123456") break;
		}
	}
	return [...week_ranges];
}

/**
 * 将时间戳转换为显示的字符串，如输入1652544000， 输出2022-05-016 23:00:00
 * @param time_stamp
 */
export function formatTimeStampString(time_stamp) {
	const date = new Date(time_stamp * 1000);
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	const hour = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");
	const second = date.getSeconds().toString().padStart(2, "0");

	return `${year}-${month}-${day} ${hour}:${minutes}:${second}`;
}

/**
 * 将时间戳转换为显示的本地字符串，如输入1652544000， 输出2022年05月16日 23:00:00
 * @param time_stamp
 */
export function formatTimeStampLocalString(time_stamp) {
	const date = new Date(time_stamp * 1000);
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	const hour = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");
	const second = date.getSeconds().toString().padStart(2, "0");

	return `${year}年${month}月${day}日 ${hour}:${minutes}:${second}`;
}

/**
 * 获得时间戳当前00:00的时间戳
 * @param time_stamp
 */
export function getThatDayTimeStamp(time_stamp) {
	const now = new Date(time_stamp);
	return Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime() / 1000);
}

export function getCurrentDay(date = new Date()) {
	const start = new Date(date);
	const end = new Date(date);
	start.setHours(0);
	start.setMinutes(0);
	start.setSeconds(0);
	start.setMilliseconds(0);

	end.setHours(23);
	end.setMinutes(59);
	end.setSeconds(59);
	end.setMilliseconds(999);
	return {
		start,
		end
	};
}

function getHoursAndMinutesFromSeconds(seconds) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	return {hours, minutes};
}

// 秒数转时间点 86400 -> 24:00
export function getFormatTimeString(seconds, show_seconds = false) {
	let next_day = "";
	if (seconds > 86400) next_day = "次日";
	const {hours: init_hours, minutes} = getHoursAndMinutesFromSeconds(seconds);
	const hours = init_hours >= 24 ? init_hours - 24 : init_hours;
	let s = "";
	if (show_seconds) s = Math.floor(seconds % 60);

	return `${next_day}${("0" + hours).slice(-2)}:${("0" + minutes).slice(-2)}${show_seconds ? ":" + ("0" + s).slice(-2) : ""}`;
}

// 1700551185 -> 15:19
export function getClockFromTimestamp(timestamp) {
	const date = new Date(timestamp * 1000);
	const hour = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");
	return hour + ":" + minutes;
}

export function getDurationTime(time_stamp) {
	const second = time_stamp % 60 + "秒";
	const minute = Math.floor(time_stamp / 60) % 60 + "分";
	const hour = Math.floor(time_stamp / 3600) % 60 + "小时";
	const day = Math.floor(time_stamp / 3600 / 24) ? Math.floor(time_stamp / 3600 / 24) + "天" : "";
	return `${day}${hour}${minute}${second}`;
}

/**
 * 把日期转换成秒级时间戳
 */
export function getSecondsTimestamp(val) {
	const timestamp = new Date(val).getTime();
	return Math.floor(timestamp / 1000);
}
