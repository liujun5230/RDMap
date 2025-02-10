import {computed} from "vue";

/**
 * 根据物资字典生成动态列
 * @param {ShallowRef} material_dict 物资字典数据
 */
export function useDynamicColumns(material_dict) {
	return computed(() => material_dict.value.flatMap(item => {
		return ["serial_num", "name"].includes(item.field) ? [] : [{
			...item,
			label: item.name,
			prop: item.prop_name,
		}];
	}));
}
