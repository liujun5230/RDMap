/**
 *
 * @param {number} year
 * @returns
 */
export function getYearStartDate(year) {
	return new Date(year, 0, 1);
}

/**
 * 获取今年的结束日期
 * @param {number} year 年
 * @returns 结束日期
 */
export function getYearEndDate(year) {
	return new Date(year, 11, 31);
}

// 获取月的开始日期对象
export function getFirstDayOfMonth(year, month) {
	return new Date(year, month, 1);
}

// 获取月的结束日期对象
export function getLastDayOfMonth(year, month) {
	const next_month = month + 1;
	return new Date(year, next_month, 0);
}

// 获取秒时间戳
export function getSecondsTimestamp(date) {
	date = new Date(date);
	return Math.round(date.getTime() / 1000);
}

// 分别获取日期和时间
export function getDateAndTime(raw_date, {date_separator, time_separator}) {
	const date_time = new Date(raw_date);
	const date_formatter = new Intl.DateTimeFormat("zh", {
		year: "numeric",
		month: "numeric",
		day: "numeric",
	});

	const time_formatter = new Intl.DateTimeFormat("zh", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	const date = date_formatter.format(date_time).replace(/\//g, date_separator);
	const time = time_formatter.format(date_time).replace(/:/g, time_separator);

	return [
		date,
		time,
	];
}

// FIX 变量风格
export function getZHTimeSegment(seconds) {
	const days = Math.floor(seconds / (3600 * 24));
	const hours = Math.floor((seconds % (3600 * 24)) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;

	let formattedTime = "";

	if (days > 0) {
		formattedTime += `${days}天`;
	}
	if (hours > 0) {
		formattedTime += `${hours}小时`;
	}
	if (minutes > 0) {
		formattedTime += `${minutes}分`;
	}
	formattedTime += `${remainingSeconds}秒`;

	return formattedTime;
}
