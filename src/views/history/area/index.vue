<template>
<div
	id="container"
	class="page-area"
>
	<header class="history-header">
		<el-form
			:inline="true"
			class="fk-map-filter-form"
		>
			<el-form-item class="date-selected">
				<template #label>
					<el-button
						class="label-btn"
						size="small"
					>
						时间选择
					</el-button>
				</template>
				<fk-date-picker
					v-model="time"
					class="date-picker"
					size="small"
					format="yyyy-MM-dd HH:mm"
					type="datetimerange"
					style="width: 282px !important;"

					:default-time="['00:00:00', '23:59:59']"
					:clearable="false"
					prefix-icon="none"
					:editable="false"
					:use-cache="true"
					cache-key="date"
				/>
			</el-form-item>

			<section>
				<el-button
					class="label-btn"
					size="small"
				>
					地图
				</el-button>
				<el-form-item>
					<floor-cascader
						:disabled="already_search_area"
						:default-floor="default_floor"
						:enable-types="['floor']"
						@get-checked-floor="changeFloor"
						@get-map-info="setFloorOptions"
					/>
				</el-form-item>

				<!-- 2d时的区域checkbox label_select -->
				<el-select
					v-show="show2dMap"
					v-model="areaType"
					:disabled="already_search_area"
					size="small"
					class="select_area_type"
					@change="changeAreaType"
				>
					<el-option
						label="区域"
						:value="1"
					/>
					<el-tooltip
						:disabled="!is_no_map"
						placement="right"
						content="地图不存在，不可绘制"
					>
						<el-option
							label="绘制"
							:value="2"
							:disabled="is_no_map"
							@click.native="drawRectArea"
						/>
					</el-tooltip>
				</el-select>
				<!-- 3d时的区域checkbox label -->
				<el-button
					v-show="!show2dMap"
					class="label-btn"
					size="small"
				>
					区域
				</el-button>
				<!-- 区域下拉 -->
				<el-form-item
					v-show="isShowAreaSelect"
					class="select-area"
				>
					<el-select
						v-model="area"
						:disabled="already_search_area"
						size="small"
					>
						<el-option
							v-for="item in areaColumns"
							:key="item.id"
							:label="item.name"
							:value="item.id"
						/>
					</el-select>
				</el-form-item>
				<!-- 区域绘制时 -->
				<el-form-item v-show="!isShowAreaSelect">
					<el-input
						class="draw_area"
						size="small"
						:placeholder="$t('search_bar.daw_tip')"
						disabled
					/>
				</el-form-item>
			</section>

			<el-form-item>
				<!-- 置灰条件：正在查询 无区域可选 正在绘制 -->
				<!-- 翻译一波这里的置灰逻辑 查询时alreadySearchArea=true必置灰  未查询时：1.在查询区域时由区域数组决定  2.在绘制时 由是否绘制结束决定-->
				<el-button
					class="btn-search"
					type="primary"
					size="small"
					:disabled=" ( areaType === 2 ? !is_draw_end : !areaColumns.length ) || already_search_area"
					style="vertical-align: top;"
					@click="sendDataToPlayBack"
				>
					查询
				</el-button>

				<div class="show-track">
					<el-checkbox v-model="isShowTrack">
						显示轨迹
					</el-checkbox>
				</div>
			</el-form-item>
		</el-form>
	</header>

	<no-map v-if="is_no_map" />

	<div class="page-area-map-container">
		<history-2dMap
			v-if="show2dMap"
			ref="map2D"
			:is-show2d="show2dMap"
			:start-play-back="startPlayBack"
			:floor="floor||0"
			:start="start"
			:end="end"
			:type="'truck'"
			:area="area"
			:history-type="'area'"
			:is-show-area="true"
			:is-show-track="isShowTrack"
			:is-show-all-truck="false"
			:map-setting-key="SETTING_KEY.HISTORY_AREA_REPLAY"
			:disabled-switch-map="turnBtnDisable"
			@draw-region-end="drawRegionEnd"
			@switch-map="changeMapType"
		/>

		<history-3dMap
			v-show="!show2dMap"
			ref="map3D"
			:is-show2d="show2dMap"
			:start-play-back="startPlayBack"
			:floor="floor||0"
			:start="start"
			:end="end"
			type="truck"
			:area="area"
			history-type="area"
			:is-show-area="true"
			:is-show-track="isShowTrack"
			:map-setting-key="SETTING_KEY.HISTORY_AREA_REPLAY_3D"
			:disabled-switch-map="turnBtnDisable"
			@switch-map="changeMapType"
		/>
	</div>

	<history-slider
		v-if="startPlayBack"
		ref="slider"
		:start="start"
		:end="end"
		:area="area"
		type="truck"
		:draw-area="drawArea"
		:floor="floor || 0"
		:floor-type="FLOOR_OBJ[floor].type"
		:history-type="'area'"
		@update-card-position="updateCardPosition"
		@handle-slider-drag="handleDrag"
	/>
</div>
</template>

<script>
import {useEventBus} from "@vueuse/core";
import {storeToRefs} from "pinia";

import {SETTING_KEY} from "@/components/mapSettings/pageConfig";
import NoMap from "@/components/NoMap.vue";
import FloorCascader from "@/components/FloorCascader.vue";
import FkDatePicker from "@/components/ForThink/Form/FkDatePicker.vue";
import {getArea} from "@/api/area/area";
import {normalizeHMS} from "@/utils/js/dateShortcuts";
import {useAreaMapStorage} from "@/composable";

import {getSearchTimeStamp, closeDetailDialog} from "../units";
import History2dMap from "../components/2dMap/HistoryMap2d.vue";
import History3dMap from "../components/3dMap.vue";
import HistorySlider from "../components/SliderBar.vue";
import {DELETED_AREA} from "../events";
import {useHistoryStore} from "../store";

const getDefaultTime = () => {
	const start = normalizeHMS(new Date(), "start");
	const end = normalizeHMS(new Date(), "end");
	return [start, end];
};

export default {
	name: "HistoryArea",
	components: {
		History2dMap,
		HistorySlider,
		History3dMap,
		NoMap,
		FloorCascader,
		FkDatePicker
	},
	inject: ["FLOOR_OBJ", "CONFIG"],
	setup() {
		const {on: onDeletedArea} = useEventBus(DELETED_AREA);
		const {already_search_area} = storeToRefs(useHistoryStore());
		const {resetMapSetting} = useAreaMapStorage(SETTING_KEY.HISTORY_AREA_REPLAY);

		return {
			SETTING_KEY,
			already_search_area,
			onDeletedArea,
			resetMapSetting
		};
	},
	data() {
		return {
			area: "",
			start: 0,
			end: 0,
			floor: "",
			startPlayBack: false,
			time: getDefaultTime(),
			drawArea: [],
			floor2dColumns: [],
			areaColumns: [],
			isShowAreaSelect: true,
			// 是否绘制完毕
			is_draw_end: false,
			areaType: 1,
			isShowTrack: false,
			is_no_map: false,
			show2dMap: true,
			turnBtnDisable: false,
			default_floor: [],
			// 所有的楼层的区域数据
			area_obj: null,
			// 地图级联数据
			floor_options: Object.freeze([])
		};
	},
	watch: {
		FLOOR_OBJ: {
			handler(new_val) {
				if (Object.keys(new_val).length) {
					if (this.$route.query.area_id && this.$route.query.floor_id) {
						this.handleJumpPage();
					} else {
						this.setDefaultFloor(this.floor_options, "floor-obj");
					}
				}
			},
			immediate: true,
		},
		startPlayBack(newVal) {
			this.already_search_area = newVal;
		},

		already_search_area(newVal) {
			if (!newVal) {
				// 点击退出后
				this.areaType === 1 ? this.changeAreaType() : this.drawRectArea();
				this.drawArea = [];
				this.start = 0;
				this.startPlayBack = false;
				closeDetailDialog();
			}
		}
	},

	mounted() {
		// 页面间跳转重置
		this.already_search_area = false;
		this.onDeletedArea(({name}) => {
			this.area = name;
		});
	},
	beforeDestroy() {
		closeDetailDialog();
	},

	methods: {
		async handleJumpPage() {
			// 加是否为3d 参数
			const {
				start,
				end,
				floor_id = "",
				area_id
			} = this.$route.query;
			this.time = [new Date(parseInt(start) * 1000), new Date(parseInt(end) * 1000)];
			if (floor_id) {
				this.resetMapSetting(); // 从其他页面跳转过来均清空缓存，#20499
				this.default_floor = [this.FLOOR_OBJ[floor_id].scene_id, this.FLOOR_OBJ[floor_id].building_id, parseInt(floor_id)];
				await this.changeFloor({
					id: parseInt(floor_id),
					cascade_data: [...this.default_floor],
					type: "floor"
				});
				this.area = area_id;
				this.sendDataToPlayBack();
			}
		},

		blur(show) {
			if (!show) {
				this.$nextTick(() => this.$refs.select.blur());
			}
		},

		async changeFloor(floor_data) {
			this.floor = parseInt(floor_data.id);
			await this.selectFloor(this.floor);
		},

		// get-map-info 事件是异步的，它是等待 FloorCascader 组件 getAllFloorInfo 接口完成才触发
		setFloorOptions(data) {
			// 从其他页面跳转过来，不用设置默认地图
			if (this.$route.query.area_id && this.$route.query.floor_id) return;
			this.floor_options = Object.freeze(data);
			this.setDefaultFloor(data, "floor-cascader");
		},

		// 直到找到第一个具有地图的楼层
		// setDefaultFloor() => checkMapExist()，checkMapExist 依赖 FLOOR_OBJ
		setDefaultFloor(floor_options, trigger) {
			// 如果是 FLOOR_OBJ 触发并且 floor_options 数据为空，则是 get-map-info 事件还没有被触发
			if (trigger === "floor-obj" && floor_options.length === 0) return;
			// 如果是 get-map-info 事件触发并且 FLOOR_OBJ 数据为空，则是 FLOOR_OBJ 数据还没有拿到
			if (trigger === "floor-cascader" && Object.keys(this.FLOOR_OBJ).length === 0) return;

			// 遍历每个场景下的所有建筑和楼层
			const traverseTree = (node, scene_id) => {
				if (node.node && node.node.length) {
					for (const child of node.node) {
						const stop_traversal = traverseTree(child, scene_id);
						// 找到了第一个具有地图的楼层，终止遍历
						if (stop_traversal) return true;
					}
				} else {
					if (node.floor_2d_file || node.floor_3d_file) {
						this.default_floor = [scene_id, node.building_id, node.id];
						this.floor = node.id;
						this.selectFloor(this.floor);
						return true;
					}
				}
			};

			for (const scene_item of floor_options) {
				const stop_traversal = traverseTree(scene_item, scene_item.id);
				// 找到了第一个具有地图的楼层，终止遍历剩下的场景
				if (stop_traversal) return true;
			}

			// 所有楼层都没有地图
			this.is_no_map = true;
		},

		async selectFloor(val) {
			this.areaType = 1;
			this.startPlayBack = false;
			this.checkMapExist(val);
			this.changeAreaType();
			await this.getAreaList(val);
		},

		async getAreaList(floor) {
			const area_data = [];
			if (!this.area_obj) {
				const {data: res} = await getArea({type: 1}).catch(() => ({}));
				if (res?.type === 1) {
					const result = res.result.data.reduce((obj, item) => {
						obj[item.id] = item;
						return obj;
					}, {});
					this.area_obj = Object.freeze(result);
				}
			}
			for (const area_item of Object.values(this.area_obj)) {
				if (area_item.floor_id === floor) {
					area_data.push({name: area_item.name, id: area_item.id.toString()});
				}
			}

			this.areaColumns = area_data;
			this.area = this.areaColumns.length > 0 ? this.areaColumns[0].id : "";
		},

		sendDataToPlayBack() {
			const start = getSearchTimeStamp(this.time[0]);
			const end = getSearchTimeStamp(this.time[1]);
			if (!this.floor) {
				this.$notify({
					type: "error",
					title: "错误",
					message: this.$i18n.t("notice.select_floor_first")
				});
				return;
			}
			if (!this.area && this.areaType === 1) {
				this.$notify({
					type: "error",
					title: "错误",
					message: this.$i18n.t("notice.select_area_first")
				});
				return;
			}
			this.playBackAreaHistory(start, end);
		},

		playBackAreaHistory(start, end) {
			this.start = parseInt(start);
			this.end = parseInt(end);
			this.startPlayBack = true;
		},

		changeAreaType() {
			// 只处理选择为“区域”，选择为“绘制”由 drawRectArea 处理
			if (this.areaType === 1) {
				this.isShowAreaSelect = true;
				this.area = this.areaColumns.length > 0 ? this.areaColumns[0].id : "";
				this.is_draw_end = false;
				this.$nextTick(() => {
					this.show2dMap && this.$refs.map2D.setDrawStatus(false);
				});
			}
		},

		// 处理选择为“绘制”的逻辑
		drawRectArea() {
			// 无地图，绘制按钮为禁用状态
			if (this.is_no_map) return;
			this.isShowAreaSelect = false;
			this.area = "";
			this.is_draw_end = false;
			this.$nextTick(() => {
				this.$refs.map2D.setDrawStatus(true);
			});
		},

		updateCardPosition(item) {
			if (this.show2dMap) {
				this.$refs.map2D.updateCardPosition(item);
			} else {
				this.$refs.map3D.updateCardPosition(item);
			}
		},

		handleDrag({nowTime}) {
			this.$refs[this.show2dMap ? "map2D" : "map3D"].handleDrag({nowTime});
		},

		checkMapExist(floor) {
			if (floor === undefined || floor === "") {
				this.is_no_map = true;
				return;
			}
			if (floor === 2) { // 百度楼层 始终存在 但无3d
				this.show2dMap = true;
				this.is_no_map = false;
				this.turnBtnDisable = true;
				return;
			}

			const currentMapObj = this.FLOOR_OBJ[floor]; // 有地图 可能 2d√ 3d× | 2d√ 3d√ | 2d× 3d√ | 2d× 3d×
			const has2d = currentMapObj?.floor_2d_file && !!currentMapObj?.file_2d_path;
			const has3d = currentMapObj?.floor_3d_file && !!currentMapObj?.file_3d_path;
			if (has2d) { // 有2d
				this.is_no_map = false;
				this.turnBtnDisable = false;
				// 保证每次切换楼层优先加载2d地图
				this.show2dMap = true;

				// 但无3d 当前在3d 跳到2d
				if (!has3d) {
					this.turnBtnDisable = true;
					this.show2dMap = true;
				}
			} else if (has3d) { // 有唯一3d 或者 自己的3d  currentMapObj?.building_3d_file ||
				this.is_no_map = false;
				this.turnBtnDisable = true;
				this.show2dMap = false;
			} else {
				this.is_no_map = true;
			}
		},

		drawRegionEnd(points) {
			const x_array = [];
			const y_array = [];
			for (const i in points) {
				x_array.push(points[i][0]);
				y_array.push(points[i][1]);
			}

			this.drawArea = [
				Math.min(...x_array),
				Math.max(...x_array),
				Math.min(...y_array),
				Math.max(...y_array)
			];
			this.is_draw_end = true;
		},

		changeMapType(dimension) {
			if (this.turnBtnDisable) return;

			this.show2dMap = dimension === "two";
			this.startPlayBack = false;
			this.areaType = 1;
			closeDetailDialog();
			if (!this.show2dMap) {
				// 转到3d
				this.$nextTick(() => {
					this.isShowAreaSelect = true;
					this.$refs.map3D.changeMap(this.floor || 0);
				});
			}
		}
	}
};
</script>

<style scoped lang="scss">
.history-header {
	position: absolute;
	top: 20px;
	left: 20px;
	z-index: 1003;
}

:deep(.date-picker.el-date-editor) {
	.el-range-separator {
		width: 9%;
		color: var(--theme-text-color-normal);
	}

	.el-range-input {
		color: var(--theme-text-color-normal);
	}
}

.select-label {
	display: inline-block;
}
.fk-map-filter-form button.el-button.el-button--primary,
.fk-map-filter-form button.el-button.el-button--default.el-button--primary {
	top: 0;
}

.fk-map-filter-form.el-form .el-form-item {
	margin-right: 10px !important;
}

:deep(.date-selected .el-form-item__label) {
	padding-right: 0;
	line-height: 32px;
}

.page-area-map-container {
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
	bottom: 196px;
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

.select_area_type {
	width: 82px;

	:deep(.el-input) {
		width: 82px;
	}
}
:deep(.fk-map-filter-form .select_area_type .el-input--suffix .el-input__inner) {
	color: #748ba4;
	border-radius: 0 !important;
	border-top-left-radius: 5px !important;
	border-bottom-left-radius: 5px !important;
	border-right: none ;
}
:deep(.fk-map-filter-form .select_area_type  .is-focus.el-input--suffix .el-input__inner) {
	border-color: #d1d8e1;
}
:deep(.fk-map-filter-form .select_area_type  .el-input--suffix .el-input__inner:focus) {
	border-color: #d1d8e1;
}

.draw_area {
	width: 200px;
	margin-right: 10px;
}

:deep(.el-button.btn_search) {
	margin: 0 !important;
}

section {
	display: inline-block;
}

.btn_search.btn_search:disabled {
	border: 0 none;
	background-color: #c5cbd3;
}

.btn_search.btn_search:disabled:hover {
	border: 0 none;
	background-color: #c5cbd3;
}
</style>
