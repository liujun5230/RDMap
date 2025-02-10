/**
 * 格式化表格单元格值或物资弹窗的表单值
 * @param {Object} row 物资数据
 * @param {Object} column 物资动态字典
 * @param {Boolean} display_on_table 默认 true, 是否在表格显示
 */
// TODO 这里代码和物资高度重复需要优化
export function formatterCellValue(row, column, display_on_table = true) {
	const {label, prop, type, field} = column;
	const value = field ? row[prop] : row.material_dict?.[prop];
	if (!Array.isArray(value)) return label === "定位图标" && display_on_table && value === 0 ? row.follow_icon : value;

	if (display_on_table) {
		switch (type) {
		case 7:
			return value?.length || "0";
		default:
			return (value || []).map(item => item.name).join("，");
		}
	} else {
		switch (type) {
		case 5:
			return value?.[0]?.id;
		case 7:
			return row.material_dict?.[prop];
		default:
			return (value || []).map(item => item.id);
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
	return is_strict ? (custom_filter.includes(value) ? custom_empty_placeholder : value) : (value || custom_empty_placeholder);
}
