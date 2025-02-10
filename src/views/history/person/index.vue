<template>
<div
	id="container"
	class="page-person"
>
	<div class="history-header">
		<person-search-form
			ref="person_search_form"
			@change-uuid="handleChangeUUID"
			@search="handleSearchForm"
		>
			<template #default>
				<el-form-item>
					<el-button
						class="btn-search"
						type="primary"
						size="small"
						plain
						style="vertical-align: top;"
						@click="clickAreaDetail"
					>
						进出区域详情
					</el-button>

					<div
						class="show-track"
					>
						<el-checkbox v-model="is_show_all_truck">
							显示完整轨迹
						</el-checkbox>
					</div>
				</el-form-item>
			</template>
		</person-search-form>

		<!-- 历史列表 -->
		<history-table
			v-show="is_show_history_table"
			ref="historyTable"
			:loading="loading"
			:table-cur-idx.sync="table_cur_idx"
			:history-list="history_list"
			@play-back-history="playBackPersonHistory"
		/>
	</div>

	<!-- loding -->
	<div
		v-show="map_default_img"
		class="preview-img"
	>
		<div
			class="img"
			style="overflow: visible"
		>
			<span
				v-if="!no_map_flag"
				class="no-map-text"
				style="text-align: center;"
			>
				{{ history_list.length ? "请选择历史列表进行播放" : "请输入需要查询的信息！" }}
			</span>
		</div>
		<no-map v-if="no_map_flag" />
	</div>

	<div class="page-person-map-container">
		<history-2dMap
			v-show="show_2d_map"
			ref="map2D"
			:is-show2d="show_2d_map"
			:start-play-back="start_play_back"
			:floor="floor"
			:start="start"
			:end="end"
			:play-uuid-list="play_uuid_list"
			:type="type"
			:start-draw="false"
			:history-type="type == 'heatMap' ? 'heatMap': 'uuid'"
			:is-show-all-truck="is_show_all_truck"
			:is-show-track="true"
			:map-setting-key="SETTING_KEY.HISTORY_CARD_REPLAY"
			:disabled-switch-map="turn_btn_disable"
			@switch-map="changeMapType"
		/>

		<history-3dMap
			v-show="!show_2d_map"
			ref="map3D"
			:is-show2d="show_2d_map"
			:start-play-back="start_play_back"
			:floor="floor"
			:start="start"
			:end="end"
			:play-uuid-list="play_uuid_list"
			:type="type"
			:history-type="type == 'heatMap' ? 'heatMap': 'uuid'"
			:is-show-all-truck="is_show_all_truck"
			:is-show-track="true"
			:map-setting-key="SETTING_KEY.HISTORY_CARD_REPLAY_3D"
			:disabled-switch-map="turn_btn_disable"
			:replay-way="search_form.replay_way"
			@switch-map="changeMapType"
		/>
	</div>

	<history-slider
		v-show="type !== 'heatMap' && start_play_back"
		ref="slider"
		:start="start"
		:end="end"
		:start-play-back="start_play_back"
		:play-uuid-list="play_uuid_list"
		:type="type"
		:floor="floor"
		:floor-type="FLOOR_OBJ[floor]?.type"
		:history-type="type == 'heatMap' ? 'heatMap': 'uuid'"
		:pre-btn-disable="pre_btn_disable"
		:next-btn-disable="next_btn_disable"
		@click-other-btn="playOtherData"
		@update-card-position="updateCardPosition"
		@handle-slider-drag="handleDrag"
	/>

	<time-line
		:visible.sync="timeline_visible"
		:start-time="start"
		:end-time="end"
		:floor-id="floor"
		:uuid-list="play_uuid_list"
		@click="handleTimelineClick"
	/>
</div>
</template>

<script>
import {useDateFormat} from "@vueuse/core";
import {storeToRefs} from "pinia";

import {getHistoryListLimit, getHistoryList} from "@/api/history/history";
import {getVideoByUUID} from "@/api/device/nvr";
import {getHistoryRecord} from "@/api/history/scene";
import NoMap from "@/components/NoMap.vue";
import {SETTING_KEY} from "@/components/mapSettings/pageConfig";
import locationJump from "@/utils/js/locationHref";
import {OUTDOOR_STOREY_ID, UTYPES} from "@/utils/js/constant";
import {getSecondsTimestamp} from "@/utils/js/tools/time";
import {usePageAuth} from "@/utils/js/authentication";
import {useLoading} from "@/composable";

import PersonSearchForm from "../components/personSearchForm/PersonSearchForm.vue";
import HistoryTable from "../components/HistoryTable.vue";
import History2dMap from "../components/2dMap/HistoryMap2d.vue";
import History3dMap from "../components/3dMap.vue";
import HistorySlider from "../components/SliderBar.vue";
import TimeLine from "../components/timeLine/TimeLine.vue";
import {transTimeToSecond, closeDetailDialog} from "../units";
import {REPLAY_WAY, SEARCH_KEY_LABEL_MAP} from "../constant";
import {useTrajectoryColorsStore, useHistoryStore, MAP_LOAD_STATUS} from "../store";

export default {
	name: "PagePerson",
	components: {
		PersonSearchForm,
		HistoryTable,
		History2dMap,
		HistorySlider,
		History3dMap,
		NoMap,
		TimeLine
	},
	inject: ["SCENE_FLOORS", "FLOOR_OBJ", "CONFIG"],
	setup() {
		const trajectory_store = useTrajectoryColorsStore();
		const {timeline_visible, replay_way, map_load_status} = storeToRefs(useHistoryStore());
		const {loading, startLoading, endLoading} = useLoading();

		return {
			trajectory_store,
			loading,
			SETTING_KEY,
			timeline_visible,
			replay_way,
			map_load_status,
			startLoading,
			endLoading,
		};
	},
	data() {
		return {
			search_form: {},
			show_2d_map: true,
			type: "",
			start: 0,
			end: 0,
			floor: 0,
			start_play_back: false,
			history_list: [],
			play_uuid_list: [], // 当前播放的uuid_list
			is_show_history_table: false,
			is_show_all_truck: false,
			map_default_img: true,
			no_map_flag: false,
			turn_btn_disable: false,
			pre_btn_disable: false,
			next_btn_disable: false,
			table_cur_idx: -1,
			map_loadend: false,
		};
	},
	watch: {
		show_2d_map: function () {
			this.start_play_back = false;
			if (this.$refs.slider.replay) {
				this.$refs.slider.destroySlider();
			}
			this.$refs.slider.resetSpeed();
			this.searchHistory();
		},
		table_cur_idx: function (newVal) {
			this.next_btn_disable = false;
			this.pre_btn_disable = false;
			if (newVal === 0) this.pre_btn_disable = true;
			if (newVal === this.history_list.length - 1) this.next_btn_disable = true;
		},

		// 其他页面跳转到轨迹回放
		$route: {
			handler() {
				const {is2dMap = 1} = this.$route.query;
				this.show_2d_map = !!is2dMap;
			},
			immediate: true
		},
	},
	beforeDestroy() {
		this.replay_way = REPLAY_WAY.floor;
		closeDetailDialog();
	},
	methods: {
		// 进出区域详情
		clickAreaDetail() {
			const auth = usePageAuth("/display#/areaRecordStatistic").value;
			if (auth.no_permission) {
				return this.$notify.error({title: "错误", message: "暂无权限！"});
			}
			const area_info_route = {
				[UTYPES.PERSON]: "person", // 员工
				[UTYPES.CAR]: "truck", // 车辆
				[UTYPES.VISITOR]: "visitor", // 访客
				[UTYPES.MATERIAL]: "serial_num", // 物资
				[UTYPES.CONTRACTOR]: "contractor"
			};
			const {time: search_time, uuid_list, floor_cascade_data, selected_input_key, select_list} = this.$refs.person_search_form.getFormData();
			if (uuid_list.length === 0) {
				this.$notify.error({
					title: "错误",
					message: `请输入正确的${SEARCH_KEY_LABEL_MAP[selected_input_key].label}`
				});
			} else {
				const time = [getSecondsTimestamp(search_time[0]), getSecondsTimestamp(search_time[1])];
				let params_str = "";
				if (select_list.length > 1) {
					// 根据uuid_list精确搜索
					const uuid_list = select_list.map(({uuid}) => uuid);
					params_str = `?time=${time}&floor=${floor_cascade_data}&uuid_list=${uuid_list}`;
				} else {
					// 填充搜索框，按name模糊搜索
					const {name, utype} = select_list[0];
					params_str = `?type=${area_info_route[utype]}&time=${time}&floor=${floor_cascade_data}&name=${name}&time_type=3`;
				}
				if (window.location.href.includes("withoutHead")) params_str += "&withoutHead";
				locationJump(`/display#/areaRecordStatistic${params_str}`, true);
			}
		},

		handleChangeUUID() {
			this.is_show_history_table = false;
		},

		handleSearchForm(data) {
			this.search_form = data;
			this.replay_way = data.replay_way;
			this.searchHistory();
		},
		async searchHistory() {
			this.map_default_img = true;
			this.start_play_back = false;
			this.is_show_history_table = true;
			this.history_list = [];
			this.startLoading();
			const list = await this.getSearchList();
			this.endLoading();
			this.history_list = list.map((ele, index) => {
				if (ele.camera_id) {
					ele.links = [{
						index: 1,
						type: "video"
					}];
					// getNVRFile 接口的name表示视频的名称，#16260
					ele.name = this.search_form.select_list[0].name;
					ele.uuid_list = [ele.uuid];
				} else {
					ele.links = [
						{index: 1, type: "truck"},
						{index: 2, type: "heatMap"}
					];
					if (this.show_2d_map === false || ele.uuid_list.length > 1) {
						// 3d 和多人不支持热力图
						ele.links.pop();
					}
				}
				ele.is_delete && (ele.links = []);
				ele.index = index;
				ele.start_str = useDateFormat(parseInt(ele.start) * 1000, "YYYY-MM-DD HH:mm:ss").value;
				ele.end_str = useDateFormat(parseInt(ele.end) * 1000, "YYYY-MM-DD HH:mm:ss").value;
				ele.floor_str = ele.map;
				return ele;
			});
			this.trajectory_store.setTrajectoryColors(this.search_form.uuid_list);
		},
		async getSearchList() {
			let list = [];
			const {time, uuid_list, selected_map_keyvalue} = this.search_form;
			if (uuid_list.length === 0) return [];
			let video_res, history_res;
			const begin = transTimeToSecond(time[0]);
			const end = transTimeToSecond(time[1]);
			let requestFn = () => Promise.reject();
			if (this.replay_way === REPLAY_WAY.all) {
				requestFn = getHistoryRecord;
			} else if (this.replay_way === REPLAY_WAY.floor) {
				requestFn = this.show_2d_map ? getHistoryList : getHistoryListLimit;
			}
			if (uuid_list.length > 1 || this.replay_way === REPLAY_WAY.all) {
				// 多人回放和一张图不支持视频回放
				history_res = await requestFn({begin, end, uuid_list, ...selected_map_keyvalue}).catch(() => undefined);
			} else {
				const [{value: video_response}, {value: history_response}] = await Promise.allSettled([
					getVideoByUUID({begin, end, uuid: uuid_list[0]}),
					requestFn({begin, end, uuid_list, ...selected_map_keyvalue})
				]).catch(() => [{}, {}]);
				video_res = video_response;
				history_res = history_response;
			}
			if (video_res?.data?.type === 1) {
				list = list.concat(video_res.data.result);
			}
			if (history_res?.data?.type === 1) {
				const res_data = Array.isArray(history_res.data.result.data) ? history_res.data.result.data : history_res.data.result;
				list = list.concat(res_data);
			}
			return list;
		},

		playBackPersonHistory(row) {
			// 地图正在加载过程中忽略点击操作
			if (this.map_load_status === MAP_LOAD_STATUS.loading && row.index === this.table_cur_idx) return;
			const {start, end, floor_id, scene_id, type, uuid_list} = row;
			const real_floor_id = floor_id ?? this.SCENE_FLOORS[scene_id]?.outdoor?.id;
			const map_exist = this.checkMapExist(real_floor_id);
			this.handleMap(map_exist, type);
			this.floor = parseInt(real_floor_id);
			this.start = parseInt(start);
			this.end = parseInt(end);
			this.type = type;
			this.start_play_back = false;
			this.play_uuid_list = uuid_list;
			this.timeline_visible = false;
			closeDetailDialog();
			this.$nextTick(function () {
				if (type === "truck" && this.replay_way === REPLAY_WAY.all) {
					this.timeline_visible = true;
				}
				this.start_play_back = true;
				this.verifyPrevNextBtnDisable();
			});
		},

		// 点击查看轨迹时再次验证选中index与总数据量保持的上下页关系
		verifyPrevNextBtnDisable() {
			if (this.table_cur_idx === 0 && this.history_list.length > 1) {
				this.pre_btn_disable = true;
				this.next_btn_disable = false;
			}
		},

		updateCardPosition(item) {
			if (this.show_2d_map) {
				this.$refs.map2D.updateCardPosition(item);
			} else {
				this.$refs.map3D.updateCardPosition(item);
			}
		},

		handleTimelineClick(item) {
			const {start, time} = item;
			const now_time = time - start;
			this.$refs.slider.dragSlider(now_time);
		},

		handleDrag({nowTime}) {
			this.$refs[this.show_2d_map ? "map2D" : "map3D"].handleDrag({nowTime});
		},

		playOtherData(flag) {
			this.$refs.historyTable.playOtherData(flag);
		},

		// 检查是否存在 2d, 3d 地图
		checkMapExist(floor) {
			// 为百度地图
			if (floor === 2) {
				return {
					hasBaidu: true,
					has2d: false,
					has3d: false
				};
			}

			const floor_info = this.FLOOR_OBJ[floor];
			let has2d = true;
			let has3d = true;
			if (!floor_info) {
				has2d = false;
				has3d = false;
			} else if (this.replay_way === REPLAY_WAY.all && floor_info.storey_id === OUTDOOR_STOREY_ID) {
				has2d = Boolean(floor_info.floor_2d_file);
				has3d = Boolean(floor_info.scene_file_path);
			} else {
				has2d = Boolean(floor_info.floor_2d_file);
				has3d = Boolean(floor_info.floor_3d_file);
			}
			return {
				hasBaidu: false,
				has2d,
				has3d
			};
		},

		// 处理地图文件
		handleMap({hasBaidu, has2d, has3d}, type) {
			const flag = `${Number(hasBaidu)}${Number(has2d)}${Number(has3d)}`;

			const heatMapNotify = () => {
				this.$notify(
					{
						type: "error",
						title: "错误",
						message: "该地图未上传2D地图，无法查看轨迹及热力图。"
					}
				);
			};

			const handleFn = {
				// 百度地图存在
				"100": () => {
					this.map_default_img = false;
					this.no_map_flag = false;
					this.turn_btn_disable = true;
					this.show_2d_map = true;
				},
				// 百度不存在的四种情况
				// 2d 存在，3d 不存在
				"010": () => {
					this.map_default_img = false;
					this.no_map_flag = false;
					this.turn_btn_disable = true;
					this.show_2d_map = true;
				},
				// 2d 不存在，3d 存在
				"001": () => {
					type === "heatMap" && heatMapNotify();
					this.map_default_img = false;
					this.no_map_flag = false;
					this.turn_btn_disable = true;
					this.show_2d_map = false;
				},
				// 2d、3d 存在
				"011": () => {
					this.map_default_img = false;
					this.no_map_flag = false;
					this.turn_btn_disable = false;
				},
				// 2d、3d 不存在
				"000": () => {
					type === "heatMap" && heatMapNotify();
					this.map_default_img = true;
					this.no_map_flag = true;
					this.turn_btn_disable = true;
					// 重置为初始状态
					this.show_2d_map = true;
				},
			};
			if (type === "heatMap") {
				// 销毁进度播放器
				if (this.$refs.slider.replay) {
					this.$refs.slider.destroySlider();
				}
			}
			handleFn[flag]();
		},

		changeMapType(dimension) {
			if (this.turn_btn_disable) return;
			this.show_2d_map = dimension === "two";
			if (this.show_2d_map) this.map_default_img = true;
			closeDetailDialog();
		}
	}
};
</script>

<style lang="scss" scoped>
.history-header {
	position: absolute;
	top: 20px;
	left: 20px;
	width: calc(100% - 88px);
	z-index: 1003;

	.search-form {
		display: flex;
		align-items: flex-start;
	}
}

.page-person-map-container {
	position: relative;
	width: 100%;
	height: 100%;
}

.map-tool-icon {
	text-align: center;
	cursor: pointer;
	font-size: 26px;
}

.turn-btn-disable {
	cursor: not-allowed !important;
}

.map-to-3d {
	position: absolute;
	bottom: 226px;
	left: 20px;
	z-index: 1;
	box-sizing: border-box;
	width: 26px;
	height: 26px;
	cursor: pointer;
	padding: 4px;
	background: #fff;
	color: #a2b2c2;
	box-shadow: 0px 0px 2px 0px #7070704d;
	font-size: 18px;
	line-height: 18px;
}

.map-to-2d {
	position: absolute;
	bottom: 80px;
	left: 20px;
	width: 26px;
	height: 26px;
	font-size: 16px;
	line-height: 26px;
	z-index: 1;
	cursor: pointer;
	color: #a2b2c2;
	background-color: #fff;
}

.preview-img {
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	background-color: #fff;
	z-index: 1002;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.preview-img .img {
	width: 228px;
	height: 176px;
}

.el-form.map-form {
	.el-form-item {
		height: 32px;
		margin-bottom: 10px;
	}

	:deep(.el-form-item__label) {
		height: 32px;
		line-height: 32px;
		border: 1px solid #dcdfe6;
		border-radius: 4px 0 0 4px;
		border-right: none;
		background-color: #fff;
		color: #748ba4;
		padding: 0 12px;
	}

	:deep(.el-input__inner) {
		border-radius: 0 4px 4px 0;
	}

	:deep(.el-date-editor .el-range-separator),
	:deep(.el-date-editor .el-range-input) {
		color: #a2b2c2;
	}
}

.date-form-item {
	:deep(.el-range__icon) {
		display: none;
	}
}

.el-form.map-form .label-form-item {
	:deep(.el-form-item__label) {
		padding: 0;
		vertical-align: bottom;
	}

	:deep(.fk-label .el-dropdown) {
		padding: 0 12px;
	}
}
</style>

<style>
/* 搜索框下拉宽度与label宽度一致 */
.el-dropdown-menu.label-dropdown.el-popper {
	width: 98px;
	transform: none;
}

.el-dropdown-menu.label-dropdown.el-popper .el-dropdown-menu__item {
	padding: 0 12px;
}
</style>
