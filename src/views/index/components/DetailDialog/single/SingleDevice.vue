<template>
<div class="h-full flex flex-col gap-y-[20px]">
	<module-header
		class="flex-none"
		title="设备"
	>
		<template #operate>
			<div class="flex justify-between items-center gap-[8px]">
				<fk-icon
					v-if="!dialog_props.is_backstage"
					class="text-minor-2 cursor-pointer hover-icon hover:text-minor-1"
					style="--text-color: var(--text-minor-2, #94a6be)"
					tip="定位"
					:size="small ? 20 : 28"
					@click="onDeviceLocation({device_uuid})"
				>
					<location-icon />
				</fk-icon>

				<fk-icon
					class="text-minor-2 px-[8px] cursor-pointer hover-icon hover:text-minor-1"
					style="--text-color: var(--text-minor-2, #94a6be)"
					tip="关闭"
					:size="small ? 24 : 28"
					@click="closeDialog"
				>
					<close-icon />
				</fk-icon>
			</div>
		</template>
	</module-header>

	<detail-box-loading v-if="loading" />
	<div
		v-else
		class="flex-1 relative overflow-auto"
	>
		<div
			class="absolute w-full"
		>
			<descriptions-title
				title="基本信息"
			/>

			<div class="mt-[12px] px-[12px] py-[8px] rounded-[4px] bg-[#3749637f] flex">
				<div
					class="avatar mr-[12px]"
				>
					<img
						class="w-[48px] h-[48px]"
						:src="avatar_url"
					>
				</div>
				<descriptions-list
					class="py-[5px] flex-1"
					:columns="[
						{label: '设备名称', prop: 'name'},
						{label: '设备类型', prop: 'type'},
					]"
					:data="detail_data"
				/>
			</div>

			<descriptions-list
				class="mt-[12px]"
				:columns="device_base_additional_descriptions_columns_map[props.category]"
				:span="2"
				:data="detail_data"
			/>

			<descriptions-title
				class="mt-[20px]"
				title="位置数据"
			/>

			<div class="mt-[12px] border-box px-[12px] py-[8px] rounded-[4px] bg-[#3749637f] flex justify-between items-center">
				<descriptions-list
					:columns="[{label: '设备ID', prop: 'id', formatter: formatDeviceId}]"
					:data="detail_data"
				/>
				<div
					v-if="category === DetailDialogCategoryEnum.MACHINE"
					class="flex items-center gap-x-[4px]"
				>
					<div
						class="border-box leading-none px-[5px] py-[4px] rounded-[4px] text-[0.875rem]"
						:style="formatMachineStatus(detail_data.status)?.style?.card_status"
					>
						{{ formatMachineStatus(detail_data.status)?.status?.card_status }}
					</div>
					<div
						class="border-box leading-none px-[5px] py-[4px] rounded-[4px] text-[0.875rem]"
						:style="formatMachineStatus(detail_data.status)?.style?.device_status"
					>
						{{ formatMachineStatus(detail_data.status)?.status?.device_status }}
					</div>
				</div>
				<div
					v-else
					class="border-box leading-none px-[5px] py-[4px] rounded-[4px] text-[0.875rem]"
					:style="formatDeviceStatus(detail_data.status)?.style"
				>
					{{ formatDeviceStatus(detail_data.status)?.status }}
				</div>
			</div>

			<descriptions-list
				class="mt-[12px]"
				:columns="device_location_descriptions_columns"
				:data="detail_data"
			>
				<template #areas="{value}">
					<span
						class="after:content-[':'] text-minor-2 mr-[8px] flex-none"
						:class="[small ? 'text-[12px]' : 'text-[14px]']"
					>所在区域</span>
					<text-ellipsis
						v-if="formatAreas(value).length"
						class="align-bottom"
					>
						<span
							v-for="item in formatAreas(value)"
							:key="item.area_id"
							class="name-split"
							:class="[dialog_props.is_backstage ? 'text-main-1' : 'link', small ? 'text-[14px]' : 'text-[16px]']"
							@click="handleClickArea(item)"
						>
							{{ item.area_name }}
						</span>
					</text-ellipsis>
					<span
						v-else
						class="text-main-1"
						:class="[small ? 'text-[14px]' : 'text-[16px]']"
					>
						未在电子围栏区域
					</span>
				</template>
			</descriptions-list>
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
import {shallowRef, computed, ref} from "vue";
import {useTimeoutPoll} from "@vueuse/core";

import {base_url} from "@/Config";
import FkIcon from "@/components/ForThink/FkIcon.vue";
import LocationIcon from "~icons/operation/location";
import CloseIcon from "~icons/operation/stroke-close";
import {getStationDetail, getDoorDetail, getPowerDetail, getSwitchDetail, getMachineDetail, getVoiceLightDetail} from "@/api/homepage/device";
import type {BaseDeviceDetailResult} from "@/api/homepage/device";
import {small} from "@/utils/ts/breakpoints";

import ModuleHeader from "@index/components/ModuleHeader.vue";
import {useDetailDialogStore, DetailDialogCategoryEnum} from "@index/store/useDetailDialogStore";
import type {SingleDetailDeviceProps, SingleDetailDeviceCategory} from "@index/store/useDetailDialogStore";
import {poll_interval} from "@index/utils/config";

import DetailBoxLoading from "../components/DetailBoxLoading.vue";
import DescriptionsTitle from "../components/DescriptionsTitle.vue";
import DescriptionsList from "../components/DescriptionsList.vue";
import {onDeviceLocation} from "../composable/onClickLocation";
import {onAreaDetailDialog} from "../composable/onDetailDialog";
import type {AreaItem} from "../constant";
import {device_base_additional_descriptions_columns_map, device_location_descriptions_columns, formatAreas} from "../constant";

interface Props {
	category: Exclude<SingleDetailDeviceCategory, DetailDialogCategoryEnum.TRAFFIC_LIGHT>
}
const props = defineProps<Props>();

const fetch_map = {
	[DetailDialogCategoryEnum.BASE_STATION]: getStationDetail,
	[DetailDialogCategoryEnum.DOOR]: getDoorDetail,
	[DetailDialogCategoryEnum.POWER]: getPowerDetail,
	[DetailDialogCategoryEnum.SWITCH]: getSwitchDetail,
	[DetailDialogCategoryEnum.MACHINE]: getMachineDetail,
	[DetailDialogCategoryEnum.VOICE_LIGHT]: getVoiceLightDetail
} as const;

const loading = ref(true);

const detail_dialog_store = useDetailDialogStore();
const dialog = computed(() => detail_dialog_store.getDialog(props.category));
const dialog_props = computed(() => dialog.value.props as SingleDetailDeviceProps);
const device_uuid = computed(() => dialog_props.value.device_uuid);

const detail_data = shallowRef<BaseDeviceDetailResult>({} as BaseDeviceDetailResult);
const avatar_url = computed(() => {
	if (props.category === DetailDialogCategoryEnum.BASE_STATION) {
		return `${base_url}${detail_data.value.icon_model_attr?.model_2d_url}`;
	}
	return `${base_url}${detail_data.value.photo}`;
});

useTimeoutPoll(fetchDetailData, poll_interval, {immediate: true});

function closeDialog() {
	detail_dialog_store.toggleVisible(props.category, false);
}

function formatDeviceId(val: any, col: any, data: any) {
	return data.device_id || data.id;
}

const online_style = {background: "rgba(105, 214, 109, 0.10)", color: "#69d66d"};
const offline_style = {background: "rgba(178, 196, 219, 0.10)", color: "#b2c4db"};
const fault_style = {background: "rgba(230, 162, 60, 0.10)", color: "#e6a23c"};
const nocard_style = {background: "rgba(230, 162, 60, 0.10)", color: "#e6a23c"};
const door_status_map: Record<number, string> = {
	0: "离线",
	1: "在线",
	2: "故障"
};
const door_style_map: Record<number, Record<string, string>> = {
	0: offline_style,
	1: online_style,
	2: fault_style
};
const machine_status_map: Record<number, {card_status: string, device_status: string}> = {
	0: {card_status: "--", device_status: "离线"},
	1: {card_status: "有卡", device_status: "在线"},
	2: {card_status: "无卡", device_status: "在线"}
};
const machine_style_map: Record<number, {card_status: Record<string, string>, device_status: Record<string, string>}> = {
	0: {card_status: offline_style, device_status: offline_style},
	1: {card_status: online_style, device_status: online_style},
	2: {card_status: nocard_style, device_status: online_style}
};
function formatDeviceStatus(val: number) {
	const {category} = props;
	switch (category) {
	case DetailDialogCategoryEnum.BASE_STATION:
	case DetailDialogCategoryEnum.POWER:
	case DetailDialogCategoryEnum.SWITCH:
	case DetailDialogCategoryEnum.VOICE_LIGHT:
		return {
			status: val ? "在线" : "离线",
			style: val ? online_style : offline_style
		};
	case DetailDialogCategoryEnum.DOOR:
		return {
			status: door_status_map[val],
			style: door_style_map[val]
		};
	default:
		return {status: "--", style: offline_style};
	}
}

function formatMachineStatus(val: number) {
	return {
		status: machine_status_map[val],
		style: machine_style_map[val]
	};
}

function handleClickArea(item: AreaItem) {
	if (dialog_props.value.is_backstage) return;
	onAreaDetailDialog(item);
}

async function fetchDetailData() {
	const {category} = props;
	const fetchFn = fetch_map[category];
	const {data: res} = await fetchFn({device_uuid: device_uuid.value}).catch(() => ({data: undefined}));
	if (res?.type === 1) {
		detail_data.value = res.result;
	}
	loading.value = false;
}
</script>

<style scoped>
.avatar {
	width: 58px;
	height: 58px;
	display: flex;
	justify-content: center;
	align-items: center;
}

.area-split::after {
	content: "、";
}
</style>
