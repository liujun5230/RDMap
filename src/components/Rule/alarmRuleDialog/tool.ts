import {TIME_UNIT} from "./constant";

const SECONDS_MAP = {
	[TIME_UNIT.second]: 1,
	[TIME_UNIT.minute]: 60,
	[TIME_UNIT.hour]: 3600
};

/**
 * 时/分/秒统一成秒
 */
export const normalizeSeconds = (value: number, unit: TIME_UNIT) => SECONDS_MAP[unit] * value;

/**
 * 把值转换对应单位
 */
export const normalizeTimeUnit = (value: number, unit: TIME_UNIT) => value / SECONDS_MAP[unit];

/**
 * 处理告警规则设置值
 */
export const normalizeRuleAlarmSetting = (value: number, unit: string, type: "second" | "unit") => {
	const assert_unit = unit as TIME_UNIT;
	if (Object.values(TIME_UNIT).includes(assert_unit)) {
		return type === "second" ? normalizeSeconds(value, assert_unit) : normalizeTimeUnit(value, assert_unit);
	} else {
		return value;
	}
};

/**
 * 过滤输入的非整数字符
 * @param input_string 输入字符
 * @param is_zero 是否可以输入0
 */
export const filterNonNegativeInteger = (input_string: string, is_zero = false) => {
	if (!is_zero) {
		input_string = parseInt(input_string).toString();
		input_string === "0" && (input_string = "");
	}
	return input_string.replace(/[^\d]/g, "");
};
