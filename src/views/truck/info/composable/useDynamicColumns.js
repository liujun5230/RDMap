import {computed, unref} from "vue";

import {TABLE_COLUMN_WIDTH} from "@/utils/js/constant";

const MIN_WIDTH_COLUMN = {
	"id_code": TABLE_COLUMN_WIDTH.id_code
};

const NON_DYNAMIC_COLUMN = ["licence"];

/**
 * 根据物资字典生成动态列
 * @param {ShallowRef} dict 字典数据
 */
export function useDynamicColumns(dict) {
	return computed(() => unref(dict).flatMap(item => {
		return NON_DYNAMIC_COLUMN.includes(item.field) ? [] : [{
			...item,
			label: item.name,
			prop: item.prop_name,
			min_width: MIN_WIDTH_COLUMN[item.field] || 120
		}];
	}));
}
