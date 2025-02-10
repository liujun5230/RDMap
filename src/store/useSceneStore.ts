import {shallowRef} from "vue";
import {defineStore} from "pinia";

import {getFloorInfo} from "@/api/map/floor";
import {getBuilding} from "@/api/map/building";
import {getScene} from "@/api/map/scene";
import {OUTDOOR_STOREY_ID} from "@/utils/js/constant";

export const useSceneStore = defineStore("scene-store", () => {
	const scene_floors = shallowRef<Record<number, any>>({});
	const building_floors = shallowRef<Record<number, any>>({});
	const floor_obj = shallowRef<Record<number, any>>({});

	const handleFloorInfo = (scene_res: any, building_res: any, floor_res: any) => {
		if (floor_res?.data?.type === 1 && building_res?.data?.type === 1 && scene_res?.data?.type === 1) {
			floor_obj.value = floor_res.data.result.data.reduce((result: any, item: any) => {
				result[item.id] = item;
				return result;
			}, {});
			building_floors.value = building_res.data.result.data.reduce((result: any, item: any) => {
				result[item.id] = {
					id: item.id,
					file_path: item.file_path,
					building_scene_coordinate: item.building_scene_coordinate,
					comment: item.comment,
					name: item.name,
					expand_space: item.expand_space,
					file_3d_type: item.file_3d_type,
					map_configure: item.map_configure,
					view_json: item.view_json,
					coordinate_down: item.coordinate_down,
					coordinate_left: item.coordinate_left,
					coordinate_right: item.coordinate_right,
					coordinate_upper: item.coordinate_upper,
					scene_id: item.scene_id,
					floor_list: [],
					outdoor: null,
					is_outdoor_building: item.storey_id_list === String(OUTDOOR_STOREY_ID)
				};
				return result;
			}, {});
			scene_floors.value = scene_res.data.result.data.reduce((result: any, item: any) => {
				result[item.id] = {
					id: item.id,
					file_path: item.file_path,
					name: item.name,
					file_3d_type: item.file_3d_type,
					map_configure: item.map_configure,
					view_json: item.view_json,
					has_all: item.has_all,
					has_outdoor: item.has_outdoor,
					floor_list: [],
					outdoor: null,
					building_ids: [],
					outdoor_building_id: null
				};
				return result;
			}, {});

			Object.values(floor_obj.value).forEach((item) => {
				const {storey_id, building_id, scene_id} = item;
				const is_outdoor = storey_id === OUTDOOR_STOREY_ID;
				const scene_item = scene_floors.value[scene_id];
				const building_item = building_floors.value[building_id];
				if (scene_item) {
					if (is_outdoor) {
						scene_item.outdoor = item;
					} else {
						scene_item.floor_list.push(item);
					}
				}
				if (building_item) {
					if (is_outdoor) {
						building_item.outdoor = item;
					} else {
						building_item.floor_list.push(item);
					}
				}
			});
			Object.values(building_floors.value).forEach((item) => {
				const {id, scene_id, is_outdoor_building} = item;
				item.floor_list.sort((a: any, b: any) => a.storey_id - b.storey_id);
				const scene_item = scene_floors.value[scene_id];
				if (scene_item) {
					if (is_outdoor_building) {
						scene_item.outdoor_building_id = id;
					} else {
						scene_item.building_ids.push(id);
					}
				}
			});
		}
	};

	const fetch = async () => {
		try {
			const [scene_res, building_res, floor_res] = await Promise.all([
				getScene(),
				getBuilding(),
				getFloorInfo({scene_query: 1}),
			]);
			handleFloorInfo(scene_res, building_res, floor_res);
			return {
				scene_floors: scene_floors.value,
				building_floors: building_floors.value,
				floor_obj: floor_obj.value,
			};
		} catch (error) {
			return Promise.reject(error);
		}
	};

	return {
		scene_floors,
		building_floors,
		floor_obj,
		fetch
	};
});
