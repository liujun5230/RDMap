import {shallowRef, computed} from "vue";
import {defineStore} from "pinia";

import type {AlarmLevelResponseItem} from "@/api/alarm/configuration";
import {getAlarmLevel} from "@/api/alarm/configuration";

export const useAlarmLevelStore = defineStore("alarm-level-store", () => {
	const alarm_level_list = shallowRef<AlarmLevelResponseItem[]>([]);

	const alarm_level_name_map = computed(() => {
		return alarm_level_list.value.reduce((result: Record<string, string>, {value, alias, name}) => {
			result[value] = alias || name;
			return result;
		}, {} as Record<string, string>);
	});

	const fetch = async () => {
		const {data: res} = await getAlarmLevel().catch(() => ({data: undefined}));

		if (res?.type === 1) {
			alarm_level_list.value = res.result;
		}
	};

	return {
		alarm_level_list,
		alarm_level_name_map,
		fetch
	};
});
