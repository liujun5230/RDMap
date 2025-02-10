import {base_url} from "@/Config";

/**
 * 格式化表格单元格值或车辆弹窗的表单值
 * @param {Object} row 车辆数据
 * @param {Object} column 车辆动态字典
 * @param {Boolean} display_on_table 默认 true, 是否在表格显示，档案也会用到这个函数
 */
export function formatterCellValue(row, column, display_on_table = true) {
	// 1-文本，2-图片，3-时间，4-日期，5-单选，6-多选，7-附件
	const {label, prop, type, field} = column;
	const value = field ? row[prop] : row.truck_dict?.[prop];

	if (display_on_table) {
		const real_value = label === "车辆类型" ? row.type_name : value;
		switch (type) {
		case 7:
			return real_value?.length || "0";
		default:
			return Array.isArray(real_value) ? real_value.map(item => item.name).join("，") : real_value;
		}
	} else {
		// 非表格显示，单选转换成字符串，多选转换成数组
		switch (type) {
		case 5:
			return ["车辆类型", "二维图标", "三维模型"].includes(label) ? value : value?.[0]?.id;
		case 6:
			return value?.map(item => item.id) || [];
		case 2:
			return value || undefined;
		case 7:
			return row.truck_dict?.[prop];
		default:
			return value;
		}
	}
}

/**
 * 格式化空值
 * @param {string} value 需要被格式化的值
 * @param {boolean} is_strict true-严格模式，false-非严格模式，只要 Boolean(value) === false 就格式化，默认 false
 * @param {string[]} custom_filter 只在严格模式下才生效，在 custom_filter 中包含的值才会被格式化，默认 ["", NaN, undefined]
 * @param {string} custom_empty_placeholder 空值被格式化后的值，默认 --
 */
export function formatterEmptyValue(value, is_strict = false, custom_filter = ["", NaN, undefined], custom_empty_placeholder = "--") {
	const strict_filter_value = custom_filter.includes(value) ? custom_empty_placeholder : value;
	return is_strict ? strict_filter_value : (value || custom_empty_placeholder);
}

/**
 * 格式化三维模型和二维图标
 * @param {object} row 行数据
 * @param {object} col 列数据
 */
export function formatterModelIconCell(row, col) {
	const {icon_model_attr: {fullbody_url, model_2d_url, model_name, icon_name}} = row;
	const {label} = col;
	return {
		name: label === "三维模型" ? model_name : icon_name,
		url: `${base_url}${label === "三维模型" ? fullbody_url : model_2d_url}`
	};
}
