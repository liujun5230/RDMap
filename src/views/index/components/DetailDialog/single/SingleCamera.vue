<template>
<div class="h-full flex flex-col gap-y-[20px]">
	<module-header
		class="flex-none"
		title="设备"
	>
		<template #operate>
			<div class="flex justify-between items-center gap-[8px]">
				<fk-icon
					class="text-minor-2 cursor-pointer hover-icon hover:text-minor-1"
					style="--text-color: var(--text-minor-2, #94a6be)"
					tip="定位"
					:size="small ? 20 : 28"
					@click="onDeviceLocation({accurate_device_id: detail_data.device_no})"
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
		<div class="absolute w-full">
			<descriptions-title
				title="基本信息"
			/>

			<div class="mt-[12px] px-[12px] py-[8px] rounded-[4px] bg-[#3749637f] flex">
				<div class="avatar mr-[12px]">
					<img
						v-if="avatar_url"
						class="w-[48px] h-[48px]"
						:src="avatar_url"
					>
				</div>
				<descriptions-list
					class="py-[5px]"
					:columns="[
						{label: '设备名称', prop: 'name'},
						{label: '设备类型', prop: 'type'},
					]"
					:data="detail_data"
				/>
			</div>

			<descriptions-title
				class="mt-[20px]"
				title="位置数据"
			/>

			<div class="mt-[12px] border-box leading-none px-[12px] py-[8px] rounded-[4px] bg-[#3749637f] flex justify-between items-center">
				<descriptions-list
					:columns="[{label: '设备ID', prop: 'device_no'}]"
					:data="detail_data"
				/>
				<div
					class="border-box px-[5px] py-[4px] rounded-[4px] text-[0.875rem]"
					:class="[detail_data.online ? 'online' : 'offline']"
				>
					{{ detail_data.online ? "在线" : "离线" }}
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
							v-for="(item) in formatAreas(value)"
							:key="item.area_id"
							class="link name-split"
							:class="[small ? 'text-[14px]' : 'text-[16px]']"
							@click="onAreaDetailDialog(item)"
						>
							{{ item.area_name }}
						</span>
					</text-ellipsis>
					<span
						v-else
						:class="[small ? 'text-[14px]' : 'text-[16px]']"
					>
						未在电子围栏区域
					</span>
				</template>
			</descriptions-list>

			<descriptions-title
				class="mt-[20px]"
				title="视频数据"
			/>

			<live-video
				class="mt-[12px]"
				:style="fullscreen_style"
				:show-close="false"
				:camera-name="detail_data.name"
				:video-options="camera_options"
				@fullscreen="handleFullscreenVideo"
				@click.native="openVideoDialog"
			/>
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
import {ref, shallowRef, computed, onBeforeUnmount} from "vue";
import {useTimeoutPoll} from "@vueuse/core";

import {base_url} from "@/Config";
import TextEllipsis from "@/components/TextEllipsis.vue";
import FkIcon from "@/components/ForThink/FkIcon.vue";
import LocationIcon from "~icons/operation/location";
import CloseIcon from "~icons/operation/stroke-close";
import {getCameraDetail} from "@/api/homepage/device";
import type {CameraDetailResult} from "@/api/homepage/device";
import {small} from "@/utils/ts/breakpoints";

import ModuleHeader from "@index/components/ModuleHeader.vue";
import LiveVideo from "@index/components/liveVideo/Index.vue";
import type {VideoOptions} from "@index/components/liveVideo/Index.vue";
import {useDetailDialogStore, DetailDialogCategoryEnum} from "@index/store/useDetailDialogStore";
import type {SingleDetailCameraProps} from "@index/store";
import {useVideoDialog} from "@index/composable/useVideoDialog";
import {poll_interval} from "@index/utils/config";

import DetailBoxLoading from "../components/DetailBoxLoading.vue";
import DescriptionsTitle from "../components/DescriptionsTitle.vue";
import DescriptionsList from "../components/DescriptionsList.vue";
import {onDeviceLocation} from "../composable/onClickLocation";
import {onAreaDetailDialog} from "../composable/onDetailDialog";
import {device_location_descriptions_columns, formatAreas} from "../constant";

interface Props {
	category: DetailDialogCategoryEnum.BASE_STATION | DetailDialogCategoryEnum.DOOR | DetailDialogCategoryEnum.POWER | DetailDialogCategoryEnum.SWITCH | DetailDialogCategoryEnum.MACHINE;
}
const props = defineProps<Props>();

const loading = ref(true);

const detail_dialog_store = useDetailDialogStore();
const dialog = computed(() => detail_dialog_store.getDialog(props.category));
const dialog_props = computed(() => dialog.value.props as SingleDetailCameraProps);
const device_id = computed(() => dialog_props.value.device_id);

const detail_data = shallowRef<CameraDetailResult>({} as CameraDetailResult);
const avatar_url = computed(() => detail_data.value.photo ? `${base_url}${detail_data.value.photo}` : "");
const camera_options = computed<VideoOptions>(() => {
	const {rtsp_url, user, password} = detail_data.value;
	return {
		type: "h264",
		rtsp_url,
		user,
		password
	};
});

const fullscreen_style = shallowRef();

let destroyVideoDialog = () => {};
let is_open_video_dialog = false;

useTimeoutPoll(fetchDetailData, poll_interval, {immediate: true});

onBeforeUnmount(() => {
	closeVideoDialog();
});

function closeDialog() {
	detail_dialog_store.toggleVisible(props.category, false);
}

async function fetchDetailData() {
	const {data: res} = await getCameraDetail({device_id: device_id.value}).catch(() => ({data: undefined}));
	if (res?.type === 1) {
		detail_data.value = res.result;
	}
	loading.value = false;
}

function handleFullscreenVideo(val: boolean) {
	fullscreen_style.value = undefined;
	if (val) {
		fullscreen_style.value = {
			marginTop: 0,
			width: "100vw",
			height: "100vh",
			position: "fixed",
			top: 0,
			left: 0
		};
		// http://forthink.xin:8883/bug-view-18978.html
		closeVideoDialog();
	}
}

const {createVideo} = useVideoDialog({auto_destroy: true});

function closeVideoDialog() {
	is_open_video_dialog = false;
	destroyVideoDialog();
}

function openVideoDialog(event: MouseEvent) {
	const target = event.target as HTMLElement;
	if (target.nodeName === "CANVAS" && !is_open_video_dialog && !fullscreen_style.value) {
		destroyVideoDialog = createVideo({
			cameraName: detail_data.value.name,
			videoOptions: camera_options.value,
		}, {
			on: {
				close: () => {
					is_open_video_dialog = false;
				}
			}
		});
		is_open_video_dialog = true;
	}
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

.online {
	background: rgba(105, 214, 109, 0.10);
	color: #69d66d;
}

.offline {
	background: rgba(178, 196, 219, 0.10);
	color: var(--text-minor-1);
}
</style>
