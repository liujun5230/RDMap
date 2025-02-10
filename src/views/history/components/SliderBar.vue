<template>
<div class="player-content">
	<div class="player-progress">
		<el-slider
			v-model="nowTime"
			v-bind="options"
			:format-tooltip="formatterToolTip"
			:show-tooltip="true"
			:disabled="sliderDisabled || historyDataNull"
			@change="handleDrag"
		/>
	</div>

	<div class="playder-tool">
		<div class="tool-time">
			<div
				class="icons"
				style="margin-right: 16px;"
			>
				<el-tooltip
					effect="dark"
					content="上一条"
					placement="top"
				>
					<i
						v-show="historyType==='uuid'"
						:class="{disabled: preBtnDisable}"
						class="hg-icons hg-icon-play-pre"
						@click="playOtherHistory('pre')"
					/>
				</el-tooltip>

				<i
					class="hg-icons"
					:class="[isShowPlay ? 'hg-icon-play-play' : sliderDisabled ? 'el-icon-loading' : 'hg-icon-play-pause']"
					@click="playAction(isShowPlay ? 'play' : sliderDisabled ? 'loading' : 'pause')"
				/>

				<el-tooltip
					effect="dark"
					content="下一条"
					placement="top"
				>
					<i
						v-show="historyType==='uuid'"
						class="hg-icons hg-icon-play-next"
						:class="{disabled: nextBtnDisable}"
						@click="playOtherHistory('next')"
					/>
				</el-tooltip>
			</div>

			<div class="player-time">
				<span>{{ `${getHistoryTime(nowTime)} / ${getHistoryTime(options.max)}` }}</span>
				<el-tooltip content="轨迹回放过程中会跳过无定位数据的时间段">
					<i class="hg-icons hg-icon-warning-info" />
				</el-tooltip>
			</div>

			<div>
				<label>回放时刻: </label>
				<span>{{ formatterToolTip(nowTime) }}</span>
			</div>
		</div>

		<div class="tool-speed">
			<fk-icon
				v-if="historyType==='uuid' && replay_way === REPLAY_WAY.all"
				size="20"
				class="timeline-icon"
				:class="{'icons-active': timeline_visible}"
				@click="openTimeline"
			>
				<timeline-icon />
			</fk-icon>

			<div
				class="speed-btn"
				@click="showSpeedMenu=!showSpeedMenu"
			>
				<fk-icon
					v-if="currentSpeed==='1'"
					size="20"
					class="play-speed-icon"
					:class="{'icons-active':showSpeedMenu}"
				>
					<play-speed-icon />
				</fk-icon>
				<span
					v-else
					class="speed-text"
				>
					{{ currentSpeed }}
					<fk-icon size="12">
						<speed-icon />
					</fk-icon>
				</span>
				<transition name="el-zoom-in-bottom">
					<ul
						v-show="showSpeedMenu"
						class="speed-menu-list"
						:class="high_speed"
						@mouseleave="showSpeedMenu=false"
					>
						<li
							v-for="item in speedMenu"
							:key="item.value"
							@click="playSpeed(item.value)"
						>
							{{ item.label }}
							<fk-icon size="12">
								<speed-icon />
							</fk-icon>
						</li>
					</ul>
				</transition>
			</div>

			<fk-icon
				v-show="historyType==='area'"
				size="20"
				class="exit-area-play-icon"
				@click="handleExit"
			>
				<exit-area-play-icon />
			</fk-icon>
		</div>
	</div>

	<div
		v-show="isShowVideo"
		class="hg-video-container"
	>
		<div
			v-drag
			class="player-video"
		>
			<div class="hg-video-container-header">
				<el-button
					icon="el-icon-close"
					circle
					@click.stop="closeVideo"
				/>
			</div>
			<div class="video-name">
				历史视频
			</div>
			<div id="history-video" />
		</div>
	</div>
</div>
</template>

<script>
import {storeToRefs} from "pinia";

import HGPlayer from "@/libs/video/player";
import {video_ws_url} from "@/Config";
import {getCardHistory} from "@/api/history/history";
import {getGpsCardHistory} from "@/api/history/gpsHistory";
import FkIcon from "@/components/ForThink/FkIcon.vue";
import ExitAreaPlayIcon from "~icons/operation/exit-area-play.svg";
import PlaySpeedIcon from "~icons/operation/play-speed.svg";
import TimelineIcon from "~icons/operation/timeline.svg";
import SpeedIcon from "~icons/operation/close.svg";

import {REPLAY_WAY, SPEED_MENU} from "@/views/history/constant";

import {getTimeLength, timeStampToString} from "../units";
import {Replay} from "../static/js/replay";
import {MAP_LOAD_STATUS, useHistoryStore} from "../store";

export default {
	name: "HistorySlider",
	components: {
		FkIcon,
		ExitAreaPlayIcon,
		PlaySpeedIcon,
		TimelineIcon,
		SpeedIcon
	},
	inject: ["FLOOR_OBJ"],
	props: {
		floor: {
			type: Number,
			required: true
		},
		isShowVideoOnAlarm: {
			type: Boolean,
			required: false
		},
		start: {
			type: Number,
			required: true
		},
		end: {
			type: Number,
			required: true
		},
		playUuidList: {
			type: Array,
			default: () => [],
			required: false
		},
		area: {
			type: String,
			default: ""
		},
		cardStr: {
			type: Array,
			default: () => [],
			required: false
		},
		drawArea: {
			type: Array,
			default: () => [],
			required: false
		},
		type: {
			type: String,
			required: true
		},
		historyType: {
			type: String,
			required: true
		},
		floorType: {
			type: Number,
			default: 0,
			required: false
		},
		startPlayBack: {
			type: Boolean,
			required: false
		},
		preBtnDisable: {
			type: Boolean,
			required: false
		},
		nextBtnDisable: {
			type: Boolean,
			required: false
		}
	},
	setup() {
		const {already_search_area, timeline_visible, play_speed, map_load_status, replay_way} = storeToRefs(useHistoryStore());

		return {
			play_speed,
			already_search_area,
			timeline_visible,
			map_load_status,
			replay_way,
			REPLAY_WAY
		};
	},
	data() {
		return {
			nowTime: 0,
			dataLastTime: 0,
			speed: 1000,
			options: {
				min: 0,
				max: 1000,
				step: 1000
			},
			player: null,
			historyData: [],
			historyPointer: 0,
			historyDataBuffer: [],
			isShowPlay: false,
			sliderDisabled: false,
			historyDataNull: false,
			historyNotEnd: true,
			videoPlayer: null,
			isShowVideo: false,
			replay: null,
			showSpeedMenu: false,
			speedMenu: SPEED_MENU.trajectory(),
			currentSpeed: "1",
		};
	},

	computed: {
		high_speed() {
			if (this.isShowVideoOnAlarm || this.isShowVideo) {
				return "";
			} else {
				return "high-speed";
			}
		}
	},

	watch: {
		startPlayBack(newVal) {
			if (this.historyType === "uuid") {
				if (this.replay) this.destroySlider();
				if (newVal) {
					this.options.max = (parseInt(this.end) - parseInt(this.start)) * 1000;
					this.initSliderPlay();
				}
			}
		},
		type(newVal) {
			this.initSpeedConfigByType(newVal);
		},
		// 将视频窗口关闭后可保持32倍速(适用于Alarm组件的视频弹窗【注意】：Alarm组件中还有一个id为history_video的视频组件！！！)
		isShowVideoOnAlarm(newVal, oldVal) {
			if (oldVal === true && newVal === false) {
				this.setHighSpeed();
			} else {
				this.setNormalSpeed();
				if (["32", "16", "8"].includes(this.currentSpeed)) { // 切换到视频时不支持高倍速
					this.currentSpeed = "4";
					this.speed = 250;
				}
			}
		},
		// 将视频窗口关闭后可保持32倍速(适用于本组件的视频弹窗)
		isShowVideo(newVal, oldVal) {
			if (oldVal === true && newVal === false) {
				this.setHighSpeed();
			} else {
				this.setNormalSpeed();
				if (["32", "16", "8"].includes(this.currentSpeed)) { // 切换到视频时不支持高倍速
					this.currentSpeed = "4";
					this.speed = 250;
				}
			}
		},
		speed: {
			handler() {
				this.play_speed = this.speed;
			},
			immediate: true
		},
		map_load_status: {
			handler() {
				if (!this.replay) return;
				const play_status = {
					[MAP_LOAD_STATUS.no_start]: "pause",
					[MAP_LOAD_STATUS.loading]: "loading",
					[MAP_LOAD_STATUS.completed]: "play",
				};
				this.playAction(play_status[this.map_load_status]);
			},
			immediate: false
		}
	},

	mounted() {
		if (this.historyType === "area" || this.historyType === "card") {
			this.options.max = (parseInt(this.end) - parseInt(this.start)) * 1000;
			this.initSliderPlay();
		}
		this.initSpeedConfigByType(this.type);
	},

	beforeDestroy() {
		if (this.replay) this.destroySlider();
	},

	methods: {
		setHighSpeed() {
			this.speedMenu = SPEED_MENU.trajectory();
		},
		setNormalSpeed() {
			this.speedMenu = SPEED_MENU.video();
		},
		initSpeedConfigByType(type) {
			if (type === "video" || this.isShowVideoOnAlarm) {
				this.setNormalSpeed();
				if (["32", "16", "8"].includes(this.currentSpeed)) { // 切换到视频时不支持高倍速
					this.currentSpeed = "4";
					this.speed = 250;
				}
			} else {
				this.setHighSpeed();
			}
		},
		initSliderPlay() {
			const params = {
				start: this.start * 1000,
				end: this.end * 1000,
				speed: this.speed,
				history_type: this.historyType
			};
			const replay_callback_map = {
				"data_end_callback": () => {
					if (this.nextBtnDisable || this.historyType === "area" || this.historyType === "card") {
						this.setSliderEnd(true);
					} else {
						this.playOtherHistory("next");
					}
				},
				"long_search_callback": () => {
					this.$notify({
						type: "error",
						title: "错误",
						message: this.$i18n.t("notice.search_time_too_long")
					});
				},
				// 5.1 改为绝对高度
				"update_card_callback": (item) => {
					const emit_data = {
						...item,
						card_x: parseFloat(item.card_x),
						card_y: parseFloat(item.card_y),
						card_z: parseFloat(item.card_z),
					};
					this.$emit("update-card-position", emit_data);
				},
				"get_play_data": async (start, end) => {
					this.sliderDisabled = true;
					let res = [];
					const fetchCardHistory = this.floorType === 0 ? getCardHistory : getGpsCardHistory;
					if (this.historyType === "area") {
						const params = {
							begin: parseInt(start),
							end: parseInt(end),
							floor_id: this.floor
						};
						if (this.drawArea.length > 0) {
							params.area_xy = this.drawArea;
						} else {
							params.area_id_list = [this.area];
						}
						res = await fetchCardHistory(params);
					} else if (this.historyType === "uuid") {
						res = await fetchCardHistory({
							begin: parseInt(start),
							end: parseInt(end),
							uuid_list: this.playUuidList,
							floor_id: this.replay_way === REPLAY_WAY.floor ? this.floor : undefined,
							scene_id: this.replay_way === REPLAY_WAY.floor ? undefined : this.FLOOR_OBJ[this.floor].scene_id
						});
					}
					if (this.map_load_status === MAP_LOAD_STATUS.completed) {
						this.sliderDisabled = false;
					}
					return res;
				},
				"update_nowTime": () => {
					this.nowTime += 1000;
				},
				// 数据间隔超出6s 修改nowTime
				"change_nowTime": (val) => {
					this.nowTime = val;
				},
				"history_request_null_callback": () => {
					this.$notify({
						type: "warning",
						title: "警告",
						message: this.$i18n.t("notice.no_history")
					});
					this.setSliderEnd(true);
				}
			};
			// 初始化按钮状态
			this.historyDataNull = false;
			this.isShowPlay = false;
			this.replay = new Replay(params, replay_callback_map);

			// video
			this.videoPlayer && this.closeVideo();
			if (this.type === "video") {
				this.isShowVideo = true;
				this.initVideo();
			}
		},

		resetSpeed() {
			this.currentSpeed = "1";
			this.speed = 1000;
		},

		destroySlider() {
			this.handleExit();
			this.replay.destroy();
			this.replay = null;
			this.nowTime = 0;
			this.videoPlayer && this.closeVideo();
		},

		setSliderEnd(isNoData = false) {
			this.historyDataNull = true;
			this.nowTime = this.options.max;
			this.isShowPlay = true;
			if (!isNoData) {
				this.playOtherHistory("next");
			}
		},
		getHistoryTime(time) {
			return getTimeLength(time);
		},
		formatterToolTip(value) {
			return timeStampToString(parseInt(this.start) * 1000 + value);
		},
		playAction(action) {
			if (this.historyDataNull) return;
			if (action === "loading") {
				this.replay.pause();
				this.isShowPlay = false;
				this.sliderDisabled = true;
			} else if (action === "pause") {
				this.replay.pause();
				this.isShowPlay = true;
				this.sliderDisabled = true;
			} else if (action === "play") {
				this.replay.play();
				this.isShowPlay = false;
				this.sliderDisabled = false;
			} else {
				return false;
			}
		},

		playOtherHistory(flag) {
			if (flag === "pre" && this.preBtnDisable) return;
			if (flag === "next" && this.nextBtnDisable) return;
			this.$emit("click-other-btn", flag);
		},

		playSpeed(speed) {
			if (this.sliderDisabled || this.historyDataNull) return;
			this.currentSpeed = this.speedMenu.find(t => t.value === speed).label;
			this.speed = speed;
			this.showSpeedMenu = false;
			this.isShowPlay = false;
			this.replay.changeSpeed(speed);
			if (this.videoPlayer) {
				this.videoPlayer.sendSpeed({card_id: this.playUuidList[0], speed: 1000 / this.speed});
			}
		},
		handleExit() {
			if (this.already_search_area) {
				this.isShowPlay = false;
				this.sliderDisabled = false;
				this.already_search_area = false;
			}
		},
		handleDrag() {
			if (this.videoPlayer) {
				this.closeVideo();
				if (this.type === "video") {
					this.isShowVideo = true;
					this.initVideo();
				}
			}
			this.isShowPlay = false;
			this.replay.handleDrag(this.nowTime);
			this.$emit("handle-slider-drag", {nowTime: this.nowTime});
			// if (this.nowTime >= this.options.max) this.playOtherHistory("next");
		},
		initVideo() {
			const video = document.getElementById("history-video");
			const opts = {
				width: 480,
				height: 320,
				autoplay: false,
				time_start: parseInt(this.start),
				time_end: parseInt(this.end),
				// TODO: card_id 为什么会传uuid，从4.l0版本就是这样的
				card_id: this.playUuidList[0],
				onerr: () => {
					// console.log(e);
				},
				onopen: () => {
					// console.log(e);
				},
				oninfo: () => {
					// console.log(msg);
				},
			};
			this.videoPlayer = new HGPlayer(video, "play", "nvr", video_ws_url, opts);
			this.videoPlayer.send_time_timer = setInterval(() => {
				this.videoPlayer.sendTime({
					// sdk 的这个方法已经把card_id作废
					card_id: this.playUuidList[0],
					utime: parseInt(this.start) * 1000 + this.nowTime
				});
			}, 1000);
		},
		closeVideo() {
			this.videoPlayer.close();
			clearInterval(this.videoPlayer.send_time_timer);
			this.videoPlayer = null;
			this.isShowVideo = false;
		},

		openTimeline() {
			this.timeline_visible = true;
		},

		dragSlider(now_time) {
			this.historyDataNull = false;
			this.isShowPlay = false;
			this.sliderDisabled = false;
			this.nowTime = now_time;
			this.handleDrag();
		}
	}
};
</script>

<style scoped>
.player-content {
	position: absolute;
	bottom: 20px;
	width: calc(100% - 258px);
	margin: 0 20px 0 238px;
	padding: 16px;
	background: #fff;
	box-shadow: 0 0 1px 1px rgb(20, 50, 80, 10%);
	box-sizing: border-box;
	height: 66px;
}

.playder-tool {
	margin-top: 8px;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.player_play,
.player_pause {
	cursor: pointer;
}
:deep(.hg_player_content) {
	box-sizing: border-box;
	padding: 10px;
	left: 0;
	top: 0;
}

:deep(.hg_player_loading_div) {
	top: 10px;
}

.hg-icons {
	font-size: 20px;
	cursor: pointer;
	margin-right: 8px;
	color: #a2b2c2;
}

.hg-icon-play-exit {
	vertical-align: bottom;
	margin: 0;
}

.hg-icon-play-pre.disabled,
.hg-icon-play-next.disabled {
	color: #d1d8e1 !important;
	cursor: not-allowed;
}

.hg-icons.hg-icon-warning-info {
	cursor: default;
}
.hg-icons.hg-icon-warning-info:hover {
	color: #a2b2c2;
}

.player-time {
	font-size: 16px;
	margin-right: 20px;
	display: inline-flex;
	align-items: center;
}

.speed-text {
	font-size: 16px;

	&:hover,
	&:active {
		color: var(--icon-active);
	}
}

.speed-menu-list {
	position: absolute;
	top: -161px;
	z-index: 800;
	color: #a2b2c2;
	transform: translateX(-50%);
	box-shadow: 0px 0px 4px 1px rgba(20, 50, 80, 0.2);
	background-color: #fff;
}

.speed-menu-list.high-speed {
	top: -257px;
}

.speed-menu-list li {
	width: 89px;
	height: 32px;
	line-height: 32px;
	text-align: center;
	cursor: pointer;
}

.speed-menu-list li:hover {
	color: #748ba4;
	background: #e2eefb;
}

.player-progress {
	width: calc(100% - 12px);
	margin-left: 8px;

	& :deep(.el-slider .el-slider__button-wrapper) {
		z-index: 19;
	}
}

.speed-btn {
	position: relative;
	display: inline-block;
	margin-right: 16px;
	color: var(--theme-text-color-normal);
}

.tool-time {
	display: flex;
	align-items: center;
	color: #a2b2c2;
	font-size: 14px;
}

.tool-speed {
	font-size: 14px;
	color: #a2b2c2;

	.timeline-icon {
		cursor: pointer;
		margin-right: 16px;

		&:hover,
		&:active {
			color: var(--icon-active);
		}
	}

	.play-speed-icon {
		cursor: pointer;

		&:hover,
		&:active {
			color: var(--icon-active);
		}
	}
}

.exit-area-play-icon {
	cursor: pointer;

	&:hover,
	&:active {
		color: var(--icon-active);
	}
}

:deep(.player-progress) .el-slider__runway {
	margin: 0;
}

:deep(.player-progress) .el-slider__button-wrapper {
	top: -10px;
	height: 20px;
	width: 20px;
}

.player_icon {
	display: inline-block;
}

.hg-video-container {
	position: absolute;
	left: -46px;
	top: -689px;
	width: 500px;
	height: 340px;
	z-index: 1003;
}

.player-video {
	width: 100%;
	height: 100%;
	padding: 10px;
	background-color: #c4c4c4;
	box-sizing: border-box;
	border-radius: 4px;
	cursor: move;
}

#history-video {
	width: 100%;
	height: calc(100% - 40px);
	background-color: white;
	user-select: none;
}

.hg-video-container-header {
	position: absolute;
	right: 12px;
	top: 20px;
	z-index: 1;
}

.hg-video-container-header .el-button.is-circle {
	background-color: rgba(8, 8, 9, 0.5);
	color: #fff;
	border: none;
	font-size: 20px;
}

.video-name {
	position: absolute;
	bottom: 20px;
	left: 20px;
	padding: 0 10px;
	height: 30px;
	line-height: 30px;
	color: #fff;
	font-size: 14px;
	border-radius: 4px;
	background-color: rgba(8, 8, 9, 0.5);
	z-index: 1;
}

.player_speed {
	display: inline-block;
	width: 80px;
	text-align: center;
	color: #748ba4;
}
</style>
