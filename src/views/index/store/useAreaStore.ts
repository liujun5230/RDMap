import {shallowRef, computed} from "vue";
import {defineStore} from "pinia";

import {getArea} from "@/api/area/area";
import {getAreaDict} from "@/api/area/areaDict";

export interface AreaTypeOption {
    id: number,
    name: string
}

export interface AreaGroupItem {
    area_group_id: number,
    area_id: number,
    id: number,
    name: string
}

export interface AreaItem {
    id: number; // 区域id
	name: string; // 区域名
	type: 1 | 2 | 3 | 7 | 8; // 1普通, 7信号围栏, 8手动设定的盲区, 2考勤区域, 3电子点名区域
	is_use: 0 | 1; // 是否使用区域
	floor_id: number;
	is_gps: 0 | 1; // 0-uwb区域，1-gps区域
	branch_id: number;
	area: string; // 区域实际坐标串 "163.25288622145663,52.57227248883721 166.43701310593832,52.57227248883721"
	is_del: 0 | 1; // 是否删除
	is_show: 0 | 1; // 是否显示
	area_type_option_id: number | null; // 电子围栏区域类型id，其他为 null
	floor_name: string;
	start: number; // 楼层起始高度
	height: number; // 楼层高度
	building_id: number;
	building_name: string;
	scene_id: number;
	scene_name: string;
	area_dict: Record<number, any>[] | ""; // 区域字典，没有则为 ""
	area_template: AreaTemplate;
	area_group: AreaGroupItem[];
	alarm_rule_ids: number[];
	alarm_rule_info: any[];
	alarm_rule_group_info: any[];
}

export interface AreaTemplate {
	id: number;
	name: string;
	area_style: string;
	relative_start: number;
	relative_end: number;
	disappear_time: number;
	area_id: number;
	offline_time: number;
}

export interface AreaIdInfoValue extends AreaItem {
    area_group_id?: number,
    area_group_name?: string,
    area_type_name?: string,
}

export const useAreaStore = defineStore("area-store", () => {
	const area_list = shallowRef<AreaItem[]>([]);
	const area_type_options = shallowRef<AreaTypeOption[]>([]);

	// 1-电子围栏区域，2-考勤区域，3-电子点名区域，7-信号围栏，8-盲区，9-第一区域， 10-第二区域
	// 所有楼层的区域id-info映射
	const area_id_info = computed(() => {
		const area_type_obj = area_type_options.value.reduce((result: Record<number, string>, item) => {
			result[item.id] = item.name;
			return result;
		}, {} as Record<number, string>);

		const result = area_list.value.reduce((result: Record<number, AreaIdInfoValue>, item) => {
			const area_group_info = item.area_group?.length ? item.area_group[0] : null;
			result[item.id] = {
				...item,
				area_group_id: area_group_info?.area_group_id,
				area_group_name: area_group_info?.name,
				area_type_name: item.area_type_option_id == null ? undefined : area_type_obj[item.area_type_option_id]
			};
			return result;
		}, {} as Record<number, AreaIdInfoValue>);

		return result;
	});

	const fetch = async () => {
		const [area_res, area_dict_res] = await Promise.all([
			getArea(undefined),
			getAreaDict(undefined)
		]).catch(() => []);

		if (
			area_res?.data?.type === 1
			&& area_dict_res?.data?.type === 1
		) {
			area_list.value = area_res.data.result.data;
			const find_item = area_dict_res.data.result.find(({field}: {field: string}) => field === "area_type");
			area_type_options.value = find_item?.option || [];
		}
	};

	return {
		area_id_info,
		fetch
	};
});
