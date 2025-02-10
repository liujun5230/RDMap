import {cloneDeep} from "lodash-es";
import {defineStore, storeToRefs} from "pinia";
import {computed, ref, watch} from "vue";

import {useMutexConfig, useStorageByTheme} from "@index/composable";
import {getMapSettingDefaultValue, type MapSetting} from "@/components/mapSettings/defaultValueConfig";
import {SETTING_KEY} from "@/components/mapSettings/pageConfig";
import {useGlobalStore} from "@index/store/useGlobalStore";

const {modes} = useMutexConfig();
const history_distribution_mode = computed(() => modes.value.includes("history_distribution"));

export const useMapSettingStore = defineStore("map setting", () => {
	const {is_emergency} = storeToRefs(useGlobalStore());
	const default_setting = getMapSettingDefaultValue(SETTING_KEY.INDEX_2D); // 首页2d 3d默认值是一样的
	const map_setting_by_theme = useStorageByTheme<MapSetting>("map_setting", cloneDeep(default_setting) as MapSetting);
	const history_map_setting = ref<MapSetting>(cloneDeep(default_setting) as MapSetting); // 历史分布用
	const emergency_map_setting = ref<MapSetting>(cloneDeep(default_setting) as MapSetting); // 紧急撤离用
	const map_setting = computed({
		get() {
			if (history_distribution_mode.value) return history_map_setting.value;
			if (is_emergency.value) return emergency_map_setting.value;
			return map_setting_by_theme.value;
		},
		set(val) {
			if (history_distribution_mode.value) {
				history_map_setting.value = val;
			} else if (is_emergency.value) {
				emergency_map_setting.value = val;
			} else {
				map_setting_by_theme.value = val;
			}
		}
	});

	watch(
		() => history_distribution_mode.value,
		(val) => {
			if (!val) {
				history_map_setting.value = cloneDeep(default_setting) as MapSetting;
			}
		}
	);

	watch(
		() => is_emergency.value,
		(val) => {
			if (!val) {
				emergency_map_setting.value = cloneDeep(default_setting) as MapSetting;
			}
		}
	);

	const resetMapSetting = () => {
		if (history_distribution_mode.value) {
			history_map_setting.value = cloneDeep(default_setting) as MapSetting;
		} else if (is_emergency.value) {
			emergency_map_setting.value = cloneDeep(default_setting) as MapSetting;
		} else {
			map_setting.value = cloneDeep(default_setting) as MapSetting;
		}
	};

	return {resetMapSetting, map_setting};
});
