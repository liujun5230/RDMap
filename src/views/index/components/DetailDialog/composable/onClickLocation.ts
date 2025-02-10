import {useEventBus} from "@vueuse/core";
import {Notification} from "element-ui";

import {getLocatorData} from "@/api/homepage/pageInformation";
import {SELECT_ELEMENT_KEY, MAP_LOCATION_KEY} from "@/events";
import {useMapParams} from "@/composable";

import {useAreaStore} from "@index/store";

function emitTagLocation(element: any) {
	useEventBus(SELECT_ELEMENT_KEY).emit({element, options: {is_open_dialog: false}});
}

export interface SearchParams {
	device_uuid?: string,
	accurate_device_id?: string
}
export async function onDeviceLocation(params: SearchParams) {
	const {data: res} = await getLocatorData(params as any).catch(() => ({data: undefined}));
	if (res?.type === 1) {
		const element = res.result[0];
		if (!element) {
			Notification.error({title: "定位失败", message: "设备已被删除"});
			return;
		}
		emitTagLocation(element);
	}
}

export function onAreaLocation(area_id: number) {
	const {area_id_info} = useAreaStore();
	const area_item = area_id_info[area_id];
	if (!area_item) {
		Notification.error({title: "定位失败", message: "区域已被删除"});
		return;
	}
	const element = {
		area_name: area_item.name,
		floor_id: area_item.floor_id,
		is_gps: area_item.is_gps,
		id: area_item.id,
		area: area_item.area,
		floor_name: area_item.floor_name,
		start: area_item.start,
		height: area_item.height,
		building_id: area_item.building_id,
		building_name: area_item.building_name,
		scene_id: area_item.scene_id,
		scene_name: area_item.scene_name,
		thing: 3
	};
	emitTagLocation(element);
}

const {emit: emitMapLocation} = useEventBus(MAP_LOCATION_KEY);
export function onMapLocation(map_id: number, map_type: "floor" | "building") {
	const {now_floor} = useMapParams();
	if (!now_floor.value) return;
	const {id, type, display_type} = now_floor.value as any;
	if (type === map_type && id === map_id) {
		// 地图移动到视图中心
		emitMapLocation({change_map: false});
	} else {
		// 切换到 floor_id 楼层
		emitMapLocation({change_map: true, map_params: {id: map_id, type: map_type, display_type}});
	}
}
