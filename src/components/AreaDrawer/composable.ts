import {computed} from "vue";
import {toRef} from "@vueuse/core";
import type {MaybeRefOrGetter} from "@vueuse/core";

import type {FloorInfo} from "./types";

export function useFloorInfo (floor_info: MaybeRefOrGetter<FloorInfo | undefined>) {
	return computed(() => {
		const info = toRef(floor_info);
		const map = [
			info.value?.scene_name,
			info.value?.building_name,
			info.value?.name
		].filter(Boolean).join("-");

		const floor_id = info.value?.id;

		return {
			map,
			floor_id,
			is_gps: info.value?.type,
		};
	});
}
