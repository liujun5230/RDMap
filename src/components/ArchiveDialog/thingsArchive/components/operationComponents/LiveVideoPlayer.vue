<template>
<div>
	<div
		v-for="(camera, key) in cameraData"
		v-show="liveVideoShow[key]"
		:key="key"
		class="hg-video-container"
		:style="videoContainerPosition[key]"
	>
		<div class="hg-video-container-header">
			<el-button
				v-if="is_full_screen === 0"
				class="el-icon-full-screen"
				circle
				@click.stop="clickFullVideo(key)"
			/>
			<el-button
				v-else
				icon="fk-icon-mini-screen"
				circle
				size="mini"
				@click.stop="clickMiniVideo(key)"
			/>
			<el-button
				icon="el-icon-close"
				circle
				@click.stop="clickCloseVideo(key)"
			/>
		</div>

		<div
			:id="'video_play_' + key"
			v-drag
			:data-full="is_full_screen"
			class="hg-video-play-container"
		/>
		<div class="video-name">
			<el-tooltip
				effect="dark"
				:content="camera_name[key]"
				placement="top"
				:disabled="!isOverflow('video-name')"
			>
				<span>{{ camera_name[key] }}</span>
			</el-tooltip>
		</div>
		<div
			v-if="camera.tagInfo"
			class="tag-info"
		>
			{{ camera.tagInfo }}
		</div>
		<div class="hg-video-container-right-btns">
			<i
				class="el-icon-video-camera hg-btn-video"
				:class="{ heart: is_video_id[key] }"
				@mousedown="videoMouseDown(key)"
			/>
			<el-image
				class="hg-btn-screenshot"
				src="/images/common/screenshot.png"
				alt="截屏"
				@mousedown.native="pictureMouseDown(key)"
			/>
		</div>

		<div
			v-show="camera.ptz_support"
			class="hg-video-container-footer"
		>
			<el-button
				icon="el-icon-caret-top"
				circle
				@mousedown.native="ptzMouseDown('up', camera, key)"
				@mouseup.native="ptzMouseUp(camera, key)"
				@mouseleave.native="ptzMouseLeave('up', camera, key)"
			/>
			<el-button
				icon="el-icon-caret-bottom"
				circle
				@mousedown.native="ptzMouseDown('down', camera, key)"
				@mouseup.native="ptzMouseUp(camera, key)"
				@mouseleave.native="ptzMouseLeave('down', camera, key)"
			/>
			<el-button
				icon="el-icon-caret-left"
				circle
				@mousedown.native="ptzMouseDown('left', camera, key)"
				@mouseup.native="ptzMouseUp(camera, key)"
				@mouseleave.native="ptzMouseLeave('left', camera, key)"
			/>
			<el-button
				icon="el-icon-caret-right"
				circle
				@mousedown.native="ptzMouseDown('right', camera, key)"
				@mouseup.native="ptzMouseUp(camera, key)"
				@mouseleave.native="ptzMouseLeave('right', camera, key)"
			/>
			<el-button
				icon="el-icon-zoom-out"
				circle
				@mousedown.native="ptzMouseDown('in', camera, key)"
				@mouseup.native="ptzMouseUp(camera, key)"
				@mouseleave.native="ptzMouseLeave('in', camera, key)"
			/>
			<el-button
				icon="el-icon-zoom-in"
				circle
				@mousedown.native="ptzMouseDown('out', camera, key)"
				@mouseup.native="ptzMouseUp(camera, key)"
				@mouseleave.native="ptzMouseLeave('out', camera, key)"
			/>
		</div>
		<div
			v-dragMove
			:data-full="is_full_screen"
			:data-width="video_width"
			:data-height="video_height"
			:data-drag="is_drag_video"
			class="mouse-div"
			:data-camera="key"
			@mousedown="changeVideoSize(key, -1, -1)"
		/>
	</div>
</div>
</template>

<script>
import {mapGetters} from "vuex";
import {video_ws_url} from "@/Config";
import {getVideoSize} from "@/api/device/camera";
import {downloadStaticFile} from "@/utils/js/common";
import {getDateTimeStr} from "@/utils/js/tools/time";
import {base_url} from "@/Config";
import "@/utils/css/iconFonts/fkIcon.css";
import HGPlayer from "@/libs/video/player";
import "@/libs/video/player.css";

let Z_INDEX = 1000;
export default {
	name: "LiveVideoPlayer",
	directives: {
		drag: {
			bind(element) {
				const drag_box = element; // 获取当前元素
				drag_box.onmousedown = e => {
					if (drag_box.dataset.full === "1") {
						return;
					}
					const container = drag_box.parentNode;
					container.style.zIndex = Z_INDEX + 41;
					Z_INDEX = parseInt(container.style.zIndex);
					e.stopPropagation();
					// 算出鼠标相对元素的位置
					const dis_x = e.clientX - container.offsetLeft;
					const dis_y = e.clientY - container.offsetTop;

					document.onmousemove = e => {
						// 用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
						const left = e.clientX - dis_x;
						const top = e.clientY - dis_y;

						// 移动当前元素
						container.style.left = left + "px";
						container.style.top = top + "px";
					};

					document.onmouseup = () => {
						// 鼠标弹起来的时候不再移动
						document.onmousemove = null;
						// 预防鼠标弹起来后还会循环（即预防鼠标放上去的时候还会移动）
						document.onmouseup = null;
					};
				};
			},
		},
		dragMove: {
			bind(element) {
				const drag_box = element; // 获取当前元素

				drag_box.onmousedown = e => {
					e.stopPropagation();
					if (drag_box.dataset.full === "1" || drag_box.dataset.drag === "1") {
						return;
					}
					const default_width = parseFloat(drag_box.dataset.width);
					const default_height = parseFloat(drag_box.dataset.height);
					const play_id = drag_box.dataset.camera;
					const play_div = document.getElementById("video_play_" + play_id);
					// 算出鼠标相对元素的位置
					const x = e.clientX;
					const y = e.clientY;
					const container = drag_box.parentNode;
					const width = container.clientWidth;
					const height = container.clientHeight;
					document.onmousemove = event => {
						const change_width = event.clientX - x;
						const parent_width = width + change_width;
						let parent_height;
						if (event.ctrlKey) {
							parent_height = parent_width / (default_width / default_height);
						} else {
							const change_height = event.clientY - y;
							parent_height = height + change_height;
						}
						parent_height = parent_width < default_width ? default_width : parent_height < default_height ? default_height : parent_height;
						container.style.width = parent_width + "px";
						container.style.height = parent_height + "px";
						play_div.style.width = parent_width + "px";
						play_div.style.height = parent_height + "px";
						play_div.firstChild.style.width = parent_width + "px";
						play_div.firstChild.style.height = parent_height + "px";
						play_div.firstChild.firstChild.style.width = parent_width + "px";
						play_div.firstChild.firstChild.style.height = parent_height + "px";
					};

					document.onmouseup = () => {
						// 鼠标弹起来的时候不再移动
						document.onmousemove = null;
						// 预防鼠标弹起来后还会循环（即预防鼠标放上去的时候还会移动）
						document.onmouseup = null;
					};
				};
			},
		},
	},

	props: {
		cameraInfo: {
			type: Object,
			required: true,
		},
		cameraData: {
			type: Object,
			default() {
				return {};
			},
		},
		liveVideoShow: {
			type: Object,
			default() {
				return {};
			},
		},
		videoContainerPosition: {
			type: Object,
			default() {
				return {};
			},
		}
	},

	data() {
		return {
			player: {},
			video_speed: 0.2,
			video_width: 640,
			video_height: 480,
			active_direction: "",
			is_video_id: {},
			is_full_screen: 0,
			camera_name: {},
			is_drag_video: 1,
			first: {},
			second: {},
			route_name: "",
			route_change: false,
		};
	},
	computed: {
		...mapGetters({
			sidebar: "sidebar",
			my_player: "player",
			video_download: "video_download",
		}),
	},
	watch: {
		my_player() {
			if (this.my_player) {
				window.onbeforeunload = e => {
					e = e || window.event;
					if (e) {
						return "关闭提示";
					}
					return "关闭提示";
				};
			} else {
				window.onbeforeunload = null;
			}
		},

		cameraInfo: {
			handler() {
				this.playVideo();
			},
			deep: true,
		},

		cameraData: {
			handler() {
				for (const i in this.cameraData) {
					this.camera_name[i] = this.cameraData[i].name;
				}
			},
		},
	},
	created() {
		this.getVideoInfo();
	},
	mounted() {
		this.route_name = this.$router.history.current.path;
	},
	beforeUnmount() {
		this.closeAllVideo();
	},
	unmounted() {
		window.onbeforeunload = null;
		this.$store.dispatch("user/changePlayer", false);
	},
	methods: {
		clickFullVideo(id) {
			if (!this.player[id] && this.player[id].source_obj.status !== 1 && this.player[id].source_obj.status !== 2) {
				this.$notify({
					title: "错误",
					type: "error",
					message: "视频还未加载成功，无法操作",
				});
				return;
			}
			this.is_full_screen = 1;
			const play_div = document.getElementById("video_play_" + id);
			console.log(document.querySelector("body").clientWidth, document.querySelector("body").clientHeight);
			const width = document.querySelector("body").clientWidth - 20;
			const height = document.querySelector("body").clientHeight - 20;

			play_div.parentNode.style.left = "0";
			play_div.parentNode.style.top = "0";
			play_div.parentNode.style.zIndex = Z_INDEX + 41;
			Z_INDEX = parseInt(play_div.parentNode.style.zIndex);
			play_div.style.width = width + "px";
			play_div.style.height = height + "px";
			play_div.parentNode.style.width = width + "px";
			play_div.parentNode.style.height = height + "px";
			play_div.firstChild.style.width = width + "px";
			play_div.firstChild.style.height = height + "px";
			play_div.firstChild.firstChild.style.width = width + "px";
			play_div.firstChild.firstChild.style.height = height + "px";
			this.changeVideoSize(id, -1, -1);
		},

		clickMiniVideo(id) {
			if (!this.player[id] && this.player[id].source_obj.status !== 1 && this.player[id].source_obj.status !== 2) {
				this.$notify({
					title: "错误",
					type: "error",
					message: "视频还未加载成功，无法操作",
				});
				return;
			}
			this.is_full_screen = 0;
			const play_div = document.getElementById("video_play_" + id);
			const width = this.video_width;
			const height = this.video_height;
			play_div.parentNode.style.top = "100px";
			play_div.parentNode.style.left = "100px";
			play_div.style.width = width + "px";
			play_div.style.height = height + "px";
			play_div.parentNode.style.width = width + "px";
			play_div.parentNode.style.height = height + "px";
			play_div.firstChild.style.width = width + "px";
			play_div.firstChild.style.height = height + "px";
			play_div.firstChild.firstChild.style.width = width + "px";
			play_div.firstChild.firstChild.style.height = height + "px";
			this.changeVideoSize(id, this.video_width, this.video_height);
		},

		clickCloseVideo(player) {
			if (this.video_download) {
				this.$msgbox.confirm("正在录像中，是否终止录像？", "终止录像", {
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					type: "warning",
					closeOnClickModal: false,
				}).then(() => {
					this.$set(this.is_video_id, player, false);
					this.$store.dispatch(
						"user/changeVideoDownload",
						false
					);
					this.$store.dispatch("user/changePlayer", false);
					window.onbeforeunload = null;
					this.closeVideo(player);
					this.$emit("close-live-video", player);
				});
			} else {
				if (this.player[player]) {
					this.closeVideo(player);
				}
				this.$emit("close-live-video", player);
			}
		},

		closeVideo(player) {
			this.is_full_screen = 0;
			this.route_change = false;
			this.$emit("route-change", this.route_change);
			this.player[player].close();
			this.player[player] = null;
		},

		playVideo() {
			this.$nextTick(() => {
				const type = "h264";
				const url = this.cameraInfo.url;
				const element = document.getElementById(
					"video_play_" + this.cameraInfo.playerId
				);
				const onInfoEx = msg => {
					this.onInfo(msg, this.cameraInfo.track_card, this.cameraInfo.alarm_id);
				};
				const opts = {
					width: this.video_width,
					height: this.video_height,
					oninfo: onInfoEx,
					user: this.cameraInfo.user,
					password: this.cameraInfo.password,
					onerr: e => {
						console.log(e);
					},
					onopen: e => {
						console.log(e);
					},
				};
				// if (this.cameraInfo.track_card) {
				// 	opts.card_id = this.cameraInfo.track_card;
				// } else if (this.cameraInfo.alarm_id) {
				// 	opts.alarm_id = this.cameraInfo.alarm_id;
				// }
				element.parentNode.style.width = this.video_width + "px";
				element.parentNode.style.height = this.video_height + "px";
				element.style.width = this.video_width + "px";
				element.style.height = this.video_height + "px";
				this.$set(
					this.player,
					this.cameraInfo.playerId,
					new HGPlayer(element, type, url, video_ws_url, opts)
				);
				if (!this.player[this.cameraInfo.playerId].success) {
					this.$notify({
						title: "错误",
						type: "error",
						message: "视频链接无效",
					});
					delete this.player[this.cameraInfo.playerId];
					this.$set(this.liveVideoShow, this.cameraInfo.playerId, false);
				}
			});
		},

		getVideoInfo() {
			getVideoSize().then(response => {
				const {type, result} = response.data;
				if (type === 1) {
					this.video_speed = parseFloat(result.CAMERA_PTZ_SPEED);
					this.video_width = parseFloat(result.CAMERA_USER_WIDTH);
					this.video_height = parseFloat(
						result.CAMERA_USER_HEIGHT
					);
				} else {
					this.$notify.error({
						title: this.$t("common.notify.title.error"),
						message: result,
					});
				}
			});
		},

		pictureMouseDown(camera_id) {
			this.player[camera_id].getImage(data => {
				const src = data.getAttribute("src");
				const a = document.createElement("a");
				a.href = src;
				a.download = this.cameraInfo.name + "-" + getDateTimeStr({}).date + ".png";
				a.click();
			});
		},

		videoMouseDown(camera_id) {
			if (!this.is_video_id[camera_id]) {
				this.route_change = true;
				this.player[camera_id].startRecord();
				this.$set(this.is_video_id, camera_id, true);
				this.$emit("route-change", this.route_change);
				this.$store.dispatch("user/changePlayer", true);
				this.$store.dispatch("user/changeVideoDownload", true);
			} else {
				this.route_change = false;
				this.$emit("route-change", this.route_change);

				this.player[camera_id].stopRecord();
				this.$set(this.is_video_id, camera_id, false);
				window.onbeforeunload = null;
				this.$store.dispatch("user/changePlayer", false);
				this.$store.dispatch("user/changeVideoDownload", false);
			}
		},

		onInfo(msg, card, alarm_id) {
			if (msg.code === 11) {
				this.$set(
					this.is_video_id,
					this.cameraInfo.playerId,
					false
				);
				const src = base_url + "/EHCommon/" + msg.msg;
				downloadStaticFile(src, this.cameraInfo.name + "-" + getDateTimeStr({}).date + getDateTimeStr({}).time + ".mp4");
			}
			if (msg.code === 80) {
				if (card) {
					delete this.camera_name["track_" + card];
					const name = JSON.parse(msg.msg).name;
					this.$set(this.camera_name, "track_" + card, name);
				} else if (alarm_id) {
					delete this.camera_name["alarm_" + alarm_id];
					const name = JSON.parse(msg.msg).name;
					this.$set(this.camera_name, "alarm_" + alarm_id, name);
				}
			}
		},

		ptzMouseDown(direction, camera, key) {
			this.active_direction = direction;
			const data = {
				ip: camera.ip,
				port: camera.port,
				user: camera.user,
				pwd: camera.password,
			};

			switch (direction) {
			case "up":
				data["up_speed"] = this.video_speed;
				break;
			case "right":
				data["right_speed"] = this.video_speed;
				break;
			case "down":
				data["up_speed"] = -this.video_speed;
				break;
			case "left":
				data["right_speed"] = -this.video_speed;
				break;
			case "out":
				data["far_speed"] = this.video_speed;
				break;
			case "in":
				data["far_speed"] = -this.video_speed;
				break;
			}
			this.player[key].moveRelative(data);
		},

		ptzMouseUp(camera, key) {
			const data = {
				ip: camera.ip,
				port: camera.port,
				user: camera.user,
				pwd: camera.password,
			};
			this.active_direction = "";
			this.player[key].moveStop(data);
		},

		ptzMouseLeave(direction, camera, key) {
			if (direction !== this.active_direction) return;
			const data = {
				ip: camera.ip,
				port: camera.port,
				user: camera.user,
				pwd: camera.password,
			};
			this.player[key].moveStop(data);
		},

		changeVideoSize(id, width, height) {
			if (!this.player[id] && this.player[id].source_obj.status !== 1 && this.player[id].source_obj.status !== 2) {
				this.$notify({
					title: "错误",
					type: "error",
					message: "视频还未加载成功，无法操作",
				});
				this.is_drag_video = 1;
			} else {
				console.log(width, height);
				const pa = {
					width: width,
					height: height,
					onreso: function () {
					},
				};
				this.player[id].changeResolution(pa);
				this.is_drag_video = 0;
			}
		},

		isOverflow(className) {
			const ele = document.getElementsByClassName(className)[0];
			if (ele) {
				return ele.scrollWidth > ele.clientWidth;
			} else {
				return false;
			}
		},

		closeAllVideo() {
			for (const i in this.player) {
				if (this.player[i]) {
					this.player[i].close();
					this.player[i] = null;
				}
			}
		}
	},
};
</script>

<style scoped>
.hg-video-container {
	position: absolute;
	width: 480px;
	height: 360px;
	background-color: #c4c4c4;
	-moz-user-select: none;
	-webkit-user-select: none;
	user-select: none;
	z-index: 10000;
	top: 100px;
	left: 100px;
	padding: 10px;
	cursor: move;
	box-sizing: content-box;
}

.heart {
	animation: glow 800ms ease-out infinite alternate;
}

@keyframes glow {
	0% {
		color: #52e21f;
	}

	100% {
		color: #fff;
	}
}

.hg-video-play-container {
	width: 100%;
	height: 100%;
	background-color: white;
	-moz-user-select: none;
	-webkit-user-select: none;
	user-select: none;
}

.mouse-div {
	width: 20px;
	height: 20px;
	position: absolute;
	right: -3px;
	bottom: -12px;
	cursor: nw-resize;
}

.hg-video-container-header {
	position: absolute;
	right: 12px;
	top: 20px;
	z-index: 1;
}
:deep(.hg-video-container-header) .el-button.is-circle,
:deep(.hg-video-container-footer) .el-button.is-circle {
	background-color: rgba(8, 8, 9, 0.5) !important;
	color: #fff;
	border: none;
	font-size: 20px;
}

.hg-video-container-header .el-button.is-circle:hover {
	color: #fff;
	border: none;
}

.video-name,
.tag-info {
	position: absolute;
	bottom: 20px;
	padding: 0 10px;
	height: 30px;
	line-height: 30px;
	color: #fff;
	font-size: 14px;
	border-radius: 4px;
	background-color: rgba(8, 8, 9, 0.5);
}

.video-name {
	left: 20px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	width: 60px;
}

.tag-info {
	left: 105px;
}

.hg-video-container-right-btns {
	position: absolute;
	top: calc(50% - 33px);
	right: 20px;
	width: 36px;
	height: 74px;
	padding: 5px 6px 10px;
	box-sizing: border-box;
	background-color: rgba(8, 8, 9, 0.5);
	border-radius: 4px;
	cursor: pointer;
}

.hg-btn-video {
	padding-bottom: 6px;
	border-bottom: 1px solid #fff;
	color: #fff;
	font-size: 24px;
}
:deep(.el-image__inner) {
	width: 22px;
}

.hg-btn-screenshot {
	padding-top: 8px;
}

.hg-video-container-footer {
	position: absolute;
	right: 12px;
	bottom: 20px;
}
:deep(.hg_player_content) {
	box-sizing: border-box;
	padding: 10px;
	left: 0;
	top: 0;
	width: 100% !important;
	height: 100% !important;
}
</style>
