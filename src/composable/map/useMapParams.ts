import {ref, computed} from "vue";

import {Dimension} from "@/types/map";
import {THREE_DIMENSION, TWO_DIMENSION} from "@index/utils/types";
import type {CheckedFloor, FloorOption, FloorInfo, SelectedElement} from "@/types/map";

// 是否有地图
const has_map = ref(true);

// 旋转
const rotation = ref(0);

// 2D/3D
const display_type = ref<Dimension>(Dimension.Two);

// 地图选择器的所有楼层
const floor_all_options = ref<FloorOption[]>([]);

// 默认楼层
const default_floor = ref<number[]>([]);

// 当前楼层
const now_floor = ref<CheckedFloor>({
	id: 0,
	type: "floor",
	map_type: "floor",
});
const now_floor_info = ref<FloorInfo>();

// 禁止切换地图
const change_icon_disabled = ref(false);

// 开启楼层间距slider
const show_floor_slider = ref(false);

// 开启楼层选择器
const show_floor_selector = ref(false);

const is_2d = computed(() => display_type.value === Dimension.Two);
const is_3d = computed(() => display_type.value === Dimension.Three);

const is_loading = ref(true);
const floor_changer_list = ref<Array<{storey_name: string, id: number}>>([]);

// 轨迹跟踪的卡号列表
const track_card_id_list = ref<number[]>([]);
const track_card_id_set = computed(() => {
	return new Set(track_card_id_list.value);
});

function addTrackCardId (card_id: number) {
	if (!track_card_id_list.value.includes(card_id))
		track_card_id_list.value.push(card_id);
}

function removeTrackCardId (card_id: number) {
	const index = track_card_id_list.value.indexOf(card_id);
	if (index !== -1) {
		track_card_id_list.value.splice(index, 1);
	}
}

// 视角跟随的卡号
const always_follow_card = ref<number>(0);

// 鼠标坐标
const coordinate = ref<{
  x: number
  y: number
  z?: number
}>({
	x: 0,
	y: 0,
	z: 0
});

// 当前搜索的对象
const search_element = ref<SelectedElement[]>([]);

// 建筑的楼层间距
const floor_distance = ref<number>(6);

const current_select_building_id = ref<number>();

export function useMapParams () {
	const switchDimension = () => {
		if (display_type.value === TWO_DIMENSION) {
			display_type.value = THREE_DIMENSION;
		} else {
			display_type.value = TWO_DIMENSION;
		}
	};

	return {
		rotation,
		display_type,
		floor_all_options,
		default_floor,
		now_floor,
		change_icon_disabled,
		now_floor_info,
		is_2d,
		is_3d,
		is_loading,
		show_floor_slider,
		show_floor_selector,
		floor_changer_list,
		track_card_id_set,
		track_card_id_list,
		always_follow_card,
		coordinate,
		search_element,
		floor_distance,

		switchDimension,
		addTrackCardId,
		removeTrackCardId,
		current_select_building_id,
		has_map
	};
}
