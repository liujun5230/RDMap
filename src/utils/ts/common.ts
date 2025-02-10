export function assertExists<T>(
	val: T | null | undefined,
	message: string | Error = "val does not exist"
): asserts val is T {
	if (val === null || val === undefined) {
		if (message instanceof Error) {
			throw message;
		}
		throw new Error(message);
	}
}

export function resolveGetter<P, Q>(val: P | ((v: Q) => P)): (v: Q) => P {
	if (typeof val === "function") {
		return val as (v: Q) => P;
	}
	return () => val;
}

/**
 * 过滤非负小数
 * @param input_string 过滤的字符
 * @param decimal_places 指定保留小数点后几位，默认小数点后两位
 */
export function filterNonNegativeFloat(input_string: string, decimal_places = 2) {
	// 过滤非数字和多余的小数点
	let filtered_string = input_string.replace(/[^\d.]/g, "");
	// 只保留一个小数点
	filtered_string = filtered_string.replace(/(\..*)\./g, "$1");
	// 保留小数点后指定位数
	const decimal_point_index = filtered_string.indexOf(".");
	if (decimal_point_index > -1) {
		filtered_string = filtered_string.substring(0, decimal_point_index + decimal_places + 1);
	}

	return filtered_string;
}

/**
 * 判断是否在首页
 */
export function isHomePage() {
	const {pathname} = window.location;
	return ["/", "/index"].includes(pathname);
}

/**
 * 支持x.y格式调用
 * ```javascript
 * const data = {person: {name: "张三"}}
 * const key="person.name";
 * const name = data[key]; // 张三
 * ```
 */
export function getChainPropValue(data: Record<string | number, any>, key: string) {
	const keys = key.split(".");
	return keys.reduce((result: any, key) => {
		try {
			result = result[key];
			return result;
		} catch (error) {
			return "";
		}
	}, data);
}

export function escapeSafeString(str: string) {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
