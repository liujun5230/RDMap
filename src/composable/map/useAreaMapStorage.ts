import {computed} from "vue";

import {useUserStorage} from "./useUserStorage";
import {cloneDeep} from "lodash-es";
import {getMapSettingDefaultValue, type MapSetting} from "@/components/mapSettings/defaultValueConfig";
import type {SETTING_KEY} from "@/components/mapSettings/pageConfig";

export type MapConfig2D = {
  floor_id: string;
  center: [number, number];
  zoom: number;
}

export function useAreaMapStorage(map_key: SETTING_KEY) {
	const store = useUserStorage(`area_map_${map_key}`, {} as MapConfig2D);
	const area_setting_key = map_key.replace("3", "2"); // 3D 2D共用一份值（但是要显示出来的内容可能不同）
	const area_map_setting = useUserStorage(`area_map_setting_${area_setting_key}`, cloneDeep(getMapSettingDefaultValue(map_key)) as MapSetting);
	const area_floor_info = computed({
		get: () => store.value,
		set: (value: MapConfig2D) => {
			store.value = value;
		}
	});
	const storageCurrentFloor = (map_info:MapConfig2D) => {
		area_floor_info.value = cloneDeep(map_info);
	};

	const resetMapSetting = () => {
		area_map_setting.value = cloneDeep(getMapSettingDefaultValue(map_key) as MapSetting);
	};

	return {area_map_setting, area_floor_info, storageCurrentFloor, resetMapSetting};
}
