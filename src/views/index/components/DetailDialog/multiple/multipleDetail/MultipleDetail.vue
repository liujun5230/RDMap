<template>
<div class="h-full flex flex-col gap-y-[12px] font-main">
	<module-header :title="dialog_props.title">
		<template #icon>
			<el-tooltip
				v-show="show_multiple_pit_component"
				:content="pit_tip"
				placement="top"
			>
				<div class="px-[3px] py-[3px] cursor-pointer">
					<img
						src="@/assets/images/index/warning.png"
						:width="small ? '12px' : medium ? '14px' : '16px'"
					>
				</div>
			</el-tooltip>
		</template>
		<template #operate>
			<div class="flex justify-between items-center gap-[8px]">
				<fk-icon
					v-if="show_location_icon"
					class="text-minor-2 cursor-pointer hover-icon hover:text-minor-1"
					tip="定位"
					:size="small ? 20 : 28"
					@click="clickLocation"
				>
					<location-icon />
				</fk-icon>

				<fk-icon
					v-if="show_evacuate_icon && handle_auth"
					class="text-btn-red cursor-pointer hover-icon"
					tip="撤离"
					:size="small ? 20 : 28"
					@click="clickTagEvacuate"
				>
					<evacuate-icon />
				</fk-icon>

				<fk-icon
					class="text-minor-2 px-[8px] cursor-pointer hover-icon hover:text-minor-1"
					tip="关闭"
					:size="small ? 24 : 28"
					@click="closeDialog"
				>
					<close-icon />
				</fk-icon>
			</div>
		</template>
	</module-header>

	<multiple-alarm-content
		v-if="show_multiple_alarm_component"
		:category="props.category"
	/>
	<multiple-attendance-content
		v-else-if="show_multiple_attendance_component"
		:category="props.category"
	/>
	<multiple-pit-content
		v-else-if="show_multiple_pit_component"
		ref="pit_content_ref"
		:category="props.category"
	/>
	<multiple-position-obj-content
		v-else
		ref="position_obj_content_ref"
		:category="props.category"
	/>
</div>
</template>

<script setup lang="ts">
import {computed, inject, ref} from "vue";
import {useEventBus} from "@vueuse/core";

import FkIcon from "@/components/ForThink/FkIcon.vue";
import LocationIcon from "~icons/operation/location";
import EvacuateIcon from "~icons/operation/evacuate";
import CloseIcon from "~icons/operation/stroke-close";
import {TAG_EVACUATE_KEY} from "@/events";
import {resolveCustomText} from "@/store/modules/featureFlags";
import {small, medium} from "@/utils/ts/breakpoints";

import ModuleHeader from "@index/components/ModuleHeader.vue";
import {DetailDialogCategoryEnum, useDetailDialogStore, useAreaStore} from "@index/store";
import type {MultipleDetailPositionObjCategory, MultipleDetailAlarmCategory, MultipleDetailAlarmProps, MultipleDetailPositionObjProps, MultipleDetailPitCategory} from "@index/store";
import {ModuleNameEnum} from "@index/container/modules/constant";
import {BTN_HANDLE_AUTH_KEY} from "@index/inject/keys";

import MultipleAlarmContent from "./MultipleAlarmContent.vue";
import MultiplePositionObjContent from "./MultiplePositionObjContent.vue";
import MultipleAttendanceContent from "./MultipleAttendanceContent.vue";
import MultiplePitContent from "./MultiplePitContent.vue";
import {onAreaLocation, onMapLocation} from "../../composable/onClickLocation";

interface Props {
	category: MultipleDetailAlarmCategory | MultipleDetailPositionObjCategory | MultipleDetailPitCategory
}
const props = defineProps<Props>();

const detail_dialog_store = useDetailDialogStore();
const area_store = useAreaStore();

const dialog_props = computed(() => detail_dialog_store.getDialog(props.category).props);
const show_location_icon = computed(() => {
	if (props.category === DetailDialogCategoryEnum.AREA_NAME) {
		const {area_id, areas = {}} = dialog_props.value as any;
		const real_area_id = area_id ?? (Object.values(areas)[0] as any)?.[0];
		const area_type = area_store.area_id_info[real_area_id]?.type;
		// 只有电子围栏和考勤区域可以定位
		return [1, 2].includes(area_type);
	}
	return [DetailDialogCategoryEnum.OUTDOOR, DetailDialogCategoryEnum.FLOOR, DetailDialogCategoryEnum.BUILDING].includes(props.category);
});
const show_multiple_alarm_component = computed(() => {
	const from = dialog_props.value.from;
	return from === ModuleNameEnum.DAY_ALARM_AREA || from === ModuleNameEnum.DAY_ALARM_DYNAMIC;
});
const show_multiple_attendance_component = computed(() => dialog_props.value.from === ModuleNameEnum.ATTENDANCE_CLASSIFY);
const show_multiple_pit_component = computed(() => dialog_props.value.from === ModuleNameEnum.PIT_CLASSIFY || dialog_props.value.from === ModuleNameEnum.PIT);
const show_evacuate_icon = computed(() => !show_multiple_alarm_component.value && !show_multiple_attendance_component.value);
const pit_tip = computed(() => `数据来源于${resolveCustomText("pit")}统计`);

const position_obj_content_ref = ref<InstanceType<typeof MultiplePositionObjContent>>();
const pit_content_ref = ref<InstanceType<typeof MultiplePitContent>>();

const handle_auth = inject(BTN_HANDLE_AUTH_KEY);

function clickTagEvacuate() {
	let card_id_list: number[];
	if (show_multiple_pit_component.value) {
		card_id_list = pit_content_ref.value!.getAllCard();
	} else {
		card_id_list = position_obj_content_ref.value!.getAllCard();
	}
	useEventBus(TAG_EVACUATE_KEY).emit({card_id: card_id_list});
}

function clickLocation() {
	const {category} = props;
	const {from} = dialog_props.value;
	// 区域定位
	if (category === DetailDialogCategoryEnum.AREA_NAME) {
		if (from === ModuleNameEnum.DAY_ALARM_AREA || from === ModuleNameEnum.DAY_ALARM_DYNAMIC) {
			const assets_props = dialog_props.value as MultipleDetailAlarmProps;
			onAreaLocation(assets_props.id);
		} else {
			const assets_props = dialog_props.value as MultipleDetailPositionObjProps;
			const area_id = assets_props.area_id || Object.values(assets_props.areas || {})?.[0]?.[0];
			if (area_id) {
				onAreaLocation(area_id);
			} else {
				console.warn(`area_id=${area_id}不存在`);
			}
		}
	}
	// 楼层和建筑定位
	if (category === DetailDialogCategoryEnum.FLOOR || category === DetailDialogCategoryEnum.OUTDOOR) {
		const assets_props = dialog_props.value as MultipleDetailPositionObjProps;
		onMapLocation(assets_props.floor_id_list?.[0]!, "floor");
	}

	if (category === DetailDialogCategoryEnum.BUILDING) {
		const assets_props = dialog_props.value as MultipleDetailPositionObjProps;
		onMapLocation(assets_props.building_id!, "building");
	}
}

function closeDialog() {
	detail_dialog_store.toggleVisible(props.category, false);
}
</script>
<style scoped>
	.el-icon-warning {
		-webkit-text-fill-color:#9FB8DA;
	}
</style>
