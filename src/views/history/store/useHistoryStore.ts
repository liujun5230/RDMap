import {defineStore} from "pinia";
import {computed, ref} from "vue";

import {REPLAY_WAY, SPEED_MENU} from "@/views/history/constant";

export const enum MAP_LOAD_STATUS {
	no_start = 1,
	loading = 2,
	completed = 3
}
export const useHistoryStore = defineStore("history-store", () => {
	const timeline_visible = ref(false);
	const already_search_area = ref(false);
	const play_speed = ref(1000);
	// MAP2d和MAP3d组件地图加载完成，和实际的地图加载完成有区别
	const map_load_status = ref<MAP_LOAD_STATUS>(MAP_LOAD_STATUS.no_start);
	const replay_way = ref<REPLAY_WAY>(REPLAY_WAY.floor);

	const toggleTimelineVisible = (visible?: boolean) => {
		if (visible === undefined) {
			timeline_visible.value = !timeline_visible.value;
		} else {
			timeline_visible.value = visible;
		}
	};

	const play_multiple = computed(() => {
		const multiple = SPEED_MENU.trajectory().find((item) => item.value === play_speed.value)?.label ?? "1";
		return parseFloat(multiple);
	});

	return {
		timeline_visible,
		already_search_area,
		play_speed,
		play_multiple,
		map_load_status,
		replay_way,
		toggleTimelineVisible
	};
});
