<template>
<div
	ref="video_container_ref"
	v-drag="{disabled: !draggable}"
	class="live-video-container"
	:class="{'cursor-move': draggable, 'select-none': draggable, 'z-[9999]': draggable || is_fullscreen, 'aspect-video': !props.useSystemConfig}"
>
	<div
		v-show="!video_init_overlay && !video_error_overlay"
		class="box-border w-full h-full p-[12px] rounded-[4px] absolute z-10 pointer-events-none flex flex-col justify-between items-end"
	>
		<div class="inline-flex items-center gap-x-[8px]">
			<div
				v-if="props.showFullscreen"
				class="w-[22px] h-[22px] video-hover-icon"
				@click="handleFullscreen(!is_fullscreen)"
			>
				<fk-icon
					v-show="!is_fullscreen"
					class="text-white"
					tip="放大"
					size="20"
					placement="bottom"
					popper-class="video-tooltip-popper"
				>
					<fullscreen-icon />
				</fk-icon>
				<fk-icon
					v-show="is_fullscreen"
					class="text-white"
					tip="缩小"
					size="20"
					placement="bottom"
					popper-class="video-tooltip-popper"
				>
					<fullscreen-quit-icon />
				</fk-icon>
			</div>
			<div
				v-if="props.showClose"
				class="video-hover-icon"
				:class="[is_fullscreen ? 'w-[22px] h-[22px]' : 'w-[20px] h-[20px]']"
				@click="handleClose"
			>
				<fk-icon
					class="text-white"
					tip="关闭"
					:size="is_fullscreen ? 11 : 10"
					placement="bottom"
					popper-class="video-tooltip-popper"
				>
					<close-icon />
				</fk-icon>
			</div>
		</div>

		<div
			v-if="props.showVideoOperation"
			class="box-border pointer-events-auto px-[5px] py-[8px] rounded-[2px] bg-[#0000007f] flex flex-col gap-y-[8px]"
		>
			<fk-icon
				class="cursor-pointer text-white hover:text-[#b6b8bb]"
				:class="{recording: is_recording}"
				tip="录制"
				placement="left"
				popper-class="video-tooltip-popper"
				@click="handleRecord"
			>
				<record-icon />
			</fk-icon>

			<i class="w-[12px] border-b border-solid border-[#ffffff7f]" />

			<fk-icon
				class="cursor-pointer text-white hover:text-[#b6b8bb]"
				tip="截屏"
				placement="left"
				popper-class="video-tooltip-popper"
				@click="handleScreenshot"
			>
				<screenshot-icon />
			</fk-icon>
		</div>

		<div class="inline-flex gap-x-[8px] self-start pointer-events-auto">
			<div
				v-if="props.cameraName"
				class="tag-info"
			>
				{{ props.cameraName }}
			</div>
			<div
				v-if="props.tagName"
				class="tag-info"
			>
				跟随标签：{{ props.tagName }}
			</div>
		</div>
	</div>
	<div
		v-show="props.stretchable"
		ref="stretch_box_ref"
		class="stretch-box cursor-nwse-resize right-[-2px] bottom-[-2px]"
	/>

	<div
		v-show="video_init_overlay || video_error_overlay"
		class="video-overlay-wrap"
	>
		<div
			v-if="props.showClose"
			class="w-[20px] h-[20px] self-end flex-none video-hover-icon"
			@click="handleClose"
		>
			<fk-icon
				class="text-white"
				tip="关闭"
				size="10"
				placement="bottom"
				popper-class="video-tooltip-popper"
			>
				<close-icon />
			</fk-icon>
		</div>
		<div class="video-overlay">
			<div
				v-show="video_error_overlay"
			>
				<div>摄像头连接失败!</div>
				<div>正在重连,请稍等~</div>
			</div>
			<div
				v-show="video_init_overlay"
			>
				<div>初始化连接成功!</div>
				<div>等待数据~</div>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="ts">
export default {
	name: "LiveVideo"
};
</script>
<script setup lang="ts">
import {ref, shallowRef, computed, watch, nextTick, onBeforeUnmount, onMounted, toRef} from "vue";
import {Notification, MessageBox} from "element-ui";

import {base_url, video_ws_url} from "@/Config";
import {VideoInfoCode} from "@/utils/js/constant";
import {downloadStaticFile} from "@/utils/js/common";
import {getDateTimeStr} from "@/utils/js/tools/time";
import {getDragDirectiveOptions} from "@/utils/js/directive/drag";
import FkIcon from "@/components/ForThink/FkIcon.vue";
import FullscreenIcon from "~icons/operation/fullscreen-stroke";
import FullscreenQuitIcon from "~icons/operation/fullscreen-quit";
import CloseIcon from "~icons/operation/stroke-close";
import RecordIcon from "~icons/operation/record";
import ScreenshotIcon from "~icons/operation/screenshot";
import HGPlayer from "@/libs/video/player";
import "@/libs/video/player.css";
import {minMaxWidth, minMaxHeight, useStretchElement} from "@/composable/useStretchElement";

import {useSystemConfigStore} from "@/store/useSystemConfigStore";

export interface VideoOptions {
	type: "h264" | "mpeg1" | "yushi" | "play" | "mp4",
	rtsp_url?: string,
	user: string,
	password: string,
	card_id?: number,
	alarm_id?: number
}

export interface EmitsOptions {
	(event: "close"): void,
	(event: "fullscreen", value: boolean): void,
	(event: "video-init", value: {data: any, player: HGPlayer}): void,
	(event: "video-info", value: {data: any, player: HGPlayer}): void,
	(event: "video-open", value: {data: any, player: HGPlayer}): void,
	(event: "video-error", value: {data: any, player: HGPlayer}): void,
}

export interface Props {
	videoOptions: VideoOptions,
	showFullscreen?: boolean,
	showClose?: boolean,
	showVideoOperation?: boolean,
	cameraName?: string,
	tagName?: string,
	draggable?: boolean,
	stretchable?: boolean,
	useSystemConfig?: boolean
}
const props = withDefaults(defineProps<Props>(), {
	showFullscreen: true,
	showClose: true,
	showVideoOperation: true,
	cameraName: undefined,
	tagName: undefined,
	draggable: false,
	stretchable: false,
	useSystemConfig: false
});

const emits = defineEmits<EmitsOptions>();

const vDrag = getDragDirectiveOptions();

const {getSystemConfig} = useSystemConfigStore();

const video_error_code = [
	VideoInfoCode.RTSP_CONNECT_FAILED,
	VideoInfoCode.DECODE_FAILED,
	VideoInfoCode.PROTOCOL_FAILED,
	VideoInfoCode.DECODE_TIMEOUT,
	VideoInfoCode.HEART_TIMEOUT,
	VideoInfoCode.NEAD_RESOURCE
];
const VIDEO_DIALOG_INIT_SIZE = {width: 530, height: 300};
const video_container_ref = ref<HTMLElement>();
const stretch_box_ref = ref<HTMLElement>();
let video_player: HGPlayer | undefined;
const is_fullscreen = ref(false);
const is_recording = ref(false);
const video_config = shallowRef({
	config_width: 640,
	config_height: 480,
	ratio: 640 / 480,
	speed: 15
});
const video_init_overlay = ref(false);
const video_error_overlay = ref(false);

const draggable = computed(() => props.draggable && !is_fullscreen.value);

watch(() => props.videoOptions, async () => {
	const {type, user, password} = props.videoOptions;
	if (type && user && password) {
		playVideo();
	}
}, {immediate: true});

onMounted(() => {
	setVideoConfig();
	useStretchElement(video_container_ref.value!, ({
		trigger_el: stretch_box_ref.value!,
		bubble: false,
		stretchable: toRef(props, "stretchable"),
		stretchCallback: stretchVideoSize
	}));
});

onBeforeUnmount(() => {
	destroyVideo();
});

function destroyVideo() {
	video_player?.close();
	video_player = undefined;
}

function setVideoConfig() {
	const width = getSystemConfig("CAMERA_USER_WIDTH") as string | undefined;
	const height = getSystemConfig("CAMERA_USER_HEIGHT") as string | undefined;
	const speed = getSystemConfig("CAMERA_PTZ_SPEED") as string;
	if (!width || !height) return Notification.error({title: "错误", message: "获取视频配置失败"});
	const width_num = parseFloat(width);
	const height_num = parseFloat(height);
	video_config.value = {
		config_width: width_num,
		config_height: height_num,
		ratio: width_num / height_num,
		speed: parseFloat(speed)
	};
}

function setVideoSize() {
	const {ratio} = video_config.value;
	if (video_container_ref.value) {
		const client_width = video_container_ref.value.clientWidth;
		const client_height = video_container_ref.value.clientHeight;
		const hg_player_content_element = video_container_ref.value.querySelector(".hg_player_content") as HTMLElement;
		const video_height = Math.min(client_width / ratio, client_height);
		const video_width = Math.min(client_height * ratio, client_width);
		hg_player_content_element.style.width = video_width + "px";
		hg_player_content_element.style.height = video_height + "px";
	}
}
function setVideoBoxSize(width: number, height: number) {
	const real_width = minMaxWidth(width);
	const real_height = minMaxHeight(height);
	video_container_ref.value!.style.width = `${real_width}px`;
	video_container_ref.value!.style.height = `${real_height}px`;
	video_container_ref.value!.dataset.width = `${real_width}px`;
	video_container_ref.value!.dataset.height = `${real_height}px`;
}
function stretchVideoSize(width: number, height: number) {
	setVideoBoxSize(width, height);
	setVideoSize();
}

function handleFullscreen(val: boolean) {
	is_fullscreen.value = val;
	emits("fullscreen", val);
	setTimeout(() => {
		setVideoSize();
	});
}

async function handleClose() {
	let end_recording: "confirm" | "cancel" | "close" = "confirm";
	if (is_recording.value) {
		end_recording = await MessageBox.confirm("正在录像中，是否终止录像？", "终止录像", {
			type: "warning",
			confirmButtonText: "确定",
			cancelButtonText: "取消",
			closeOnClickModal: false,
			customClass: "fk-index-message-box video-message-box",
			confirmButtonClass: "fk-index-button",
			cancelButtonClass: "fk-index-button"
		}).catch((e) => e);
		if (end_recording === "cancel") return;
	}
	destroyVideo();
	emits("close");
}

function handleRecord() {
	if (!video_player) return;
	if (is_recording.value) {
		video_player.stopRecord();
	} else {
		video_player.startRecord();
	}

	is_recording.value = !is_recording.value;
}

function handleScreenshot() {
	if (!video_player) return;
	const {cameraName: camera_name} = props;
	const time = getDateTimeStr({time: null, dateStr: "-", timeStr: ":"}).date;
	video_player.getImage((data: any) => {
		const src = data.getAttribute("src");
		const a = document.createElement("a");
		a.href = src;
		a.download = `${camera_name}-${time}.png`;
		a.click();
	});
}

function handleVideoInit(event: any) {
	console.log("video-init", event);
	video_init_overlay.value = true;
	video_error_overlay.value = false;
	emits("video-init", {data: event, player: video_player!});
}

function handleVideoInfo(event: any) {
	console.log("video-info", event);
	const {code} = event;
	const {cameraName: camera_name} = props;

	if (code === VideoInfoCode.READY_FOR_WATCH) {
		video_error_overlay.value = false;
		video_init_overlay.value = true;
	} else if (video_error_code.includes(code)) {
		video_error_overlay.value = true;
		video_init_overlay.value = false;
	} else {
		video_error_overlay.value = false;
		video_init_overlay.value = false;
	}

	if (code === VideoInfoCode.RECORD_STOP) {
		// 录制结束
		const time = getDateTimeStr({time: 0, dateStr: "-", timeStr: ":"}).date;
		const src = `${base_url}/EHCommon/${event.msg}`;
		downloadStaticFile(src, `${camera_name}-${time}.mp4`);
	}
	emits("video-info", {data: event, player: video_player!});
}

// 视频开始播放时触发
function handleVideoOpen(event: any) {
	console.log("video-open", event);
	video_init_overlay.value = false;
	video_error_overlay.value = false;
	setVideoSize();
	emits("video-open", {data: event, player: video_player!});
}

function handleVideoError(event: any) {
	console.log("video-error", event);
	video_init_overlay.value = false;
	video_error_overlay.value = true;
	emits("video-error", {data: event, player: video_player!});
}

function playVideo() {
	nextTick(() => {
		// 只初始化一次
		if (!video_container_ref.value || video_player) return;
		const {clientWidth, clientHeight} = video_container_ref.value;
		const {config_width, config_height} = video_config.value;
		const {useSystemConfig: use_system_config} = props;
		const {type, rtsp_url, user, password, card_id, alarm_id} = props.videoOptions;
		const video_box_size = {
			width: use_system_config ? VIDEO_DIALOG_INIT_SIZE.width : clientWidth,
			height: use_system_config ? VIDEO_DIALOG_INIT_SIZE.height : clientHeight,
		};
		const video_options = {
			user,
			password,
			card_id,
			alarm_id,
			width: config_width,
			height: config_height,
			oninit: handleVideoInit,
			oninfo: handleVideoInfo,
			onopen: handleVideoOpen,
			onerr: handleVideoError,
		};

		setVideoBoxSize(video_box_size.width, video_box_size.height);
		video_player = new HGPlayer(video_container_ref.value, type, rtsp_url, video_ws_url, video_options);
	});
}

defineExpose({
	destroyVideo,
	getVideoInstance: () => video_player
});
</script>

<style>
.el-message-box__wrapper[aria-label="终止录像"] {
	z-index: 10000 !important;
}
</style>
<style scoped>
.live-video-container {
	position: relative;
	border-radius: 4px;
	font-family: DingTalk JinBuTi;
	background-color: #0E1520;
	box-sizing: content-box;
}

.video-hover-icon {
	pointer-events: auto;
	border-radius: 50%;
	display: inline-flex;
	justify-content: center;
	align-items: center;
	background-color: rgba(0, 0, 0, 0.5);
	cursor: pointer;
}

.video-hover-icon:hover {
	background-color: #6b6c6e;
}

.tag-info {
	color: #fff;
	box-sizing: border-box;
	padding: 6px 10px;
	border-radius: 2px;
	background-color: rgba(0, 0, 0, 0.5);
	font-size: 12px;
	line-height: 1;
}

.recording {
	animation: record-animation 800ms ease-out infinite alternate;
}

@keyframes record-animation {
	0% {
		color: #52e21f;
	}

	100% {
		color: #fff;
	}
}

.video-overlay-wrap {
	width: 100%;
	height: 100%;
	padding: 12px;
	border-radius: 4px;
	position: absolute;
	top: 0;
	left: 0;
	z-index: 12;
	display: flex;
	flex-direction: column;
	background: rgb(13, 14, 27);
}

.video-overlay {
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	color: var(--text-minor-2);
	text-align: center;
	font-size: 14px;
	border-radius: 4px;
	background: rgb(13, 14, 27);
}

:deep(.hg_player_content) {
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	margin: auto;
}

:deep(.hg_player_loading_div) {
	display: none;
}

.stretch-box {
	position: absolute;
	width: 6px;
	height: 6px;
	background-color: transparent;
}
</style>
