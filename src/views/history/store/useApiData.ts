import {computed, shallowRef} from "vue";
import {defineStore} from "pinia";

import {AreaType} from "@/types/global";
import {getReplayArea} from "@/api/area/area";
import {getAllPoint} from "@/api/patrol/point";
import {getDeviceInfo} from "@/api/deviceManage/info";
import {DEVICE_TYPE} from "@/utils/js/constant";

import type {ConfigItem, FloorItem} from "../type";
import {REPLAY_WAY} from "../constant";

export const useApiData = defineStore("api-data-store", () => {
	const base_station_list = shallowRef<any[]>([]);
	const area_list = shallowRef<any[]>([]);
	const patrol_point_list = shallowRef<any[]>([]);

	const base_station_map = computed(() => {
		const map = new Map<number, any>();
		base_station_list.value.forEach((item) => map.set(item.device_no, item));
		return map;
	});
	const areas_map = computed(() => {
		const map = new Map<number, any>();
		area_list.value.forEach((item) => map.set(item.id, item));
		return map;
	});
	const patrol_points_map = computed(() => {
		const map = new Map<number, any>();
		patrol_point_list.value.forEach((item) => map.set(item.id, item));
		return map;
	});

	const fetchBaseStations = async (floor_id: number, replay_way: REPLAY_WAY, option: {
		scene_floors: Record<number, {floor_list: FloorItem[], outdoor: FloorItem | null, scene_id: number}>;
		floor_obj: Record<number, FloorItem>;
		sys_config: ConfigItem
	}) => {
		const {sys_config, scene_floors, floor_obj} = option;
		let floor_id_list: number[] = [];
		if (!sys_config.SCENE_SHOW_DEVICE) {
			floor_id_list = [floor_id];
		} else {
			const scene_id = floor_obj[floor_id].scene_id;
			floor_id_list = replay_way === REPLAY_WAY.floor ? [floor_id] : [floor_id, ...scene_floors[scene_id].floor_list.map((item) => item.id)];
		}
		const {data: res} = await getDeviceInfo({floor_id_list}).catch(() => ({data: undefined}));
		if (res?.type === 1) {
			base_station_list.value = res.result.data.filter((item: any) => Number(item.type) === DEVICE_TYPE.base_station);
		}
	};

	const fetchAreas = async () => {
		const [area_res] = await Promise.all([
			getReplayArea()
		]).catch(() => []);

		if (
			area_res?.data?.type === 1
		) {
			area_list.value = area_res.data.result.filter((item) => item.type !== AreaType.PATROL_POINT);
		}
	};

	const fetchPatrolPoints = async (floor_id: number) => {
		const {data: res} = await getAllPoint({floor_id}).catch(() => ({data: undefined}));
		if (res?.type === 1) {
			patrol_point_list.value = res.result;
		}
	};

	return {
		base_station_map,
		areas_map,
		patrol_points_map,
		fetchBaseStations,
		fetchAreas,
		fetchPatrolPoints
	};
});
