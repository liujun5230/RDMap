<template>
<div class="history-replay">
	<fk-form
		ref="fk_form_ref"
		:model="search_data"
		cache-key="history-form"
	>
		<el-form-item label="日期选择">
			<fk-date-picker
				v-model="search_data.time"
				:clearable="false"
				type="datetime"
				format="yyyy-MM-dd HH:mm"
				value-format="yyyy-MM-dd HH:mm"
				prefix-icon="el-icon-date"
				:use-cache="true"
				cache-key="date"
			/>
		</el-form-item>
		<el-form-item label="所在地图">
			<floor-cascader
				:has-all="true"
				:default-floor="default_floor"
				@get-checked-floor="changeFloor"
			/>
		</el-form-item>
		<el-form-item
			label="所在区域"
			prop="area"
		>
			<area-select
				v-model="search_data.area"
				:type-id-list="[AreaType.VIRTUAL_FENCE, AreaType.ATTENDANCE, AreaType.CALL, AreaType.UP_DOWN_PIT_FIRST, AreaType.UP_DOWN_PIT_SECOND, AreaType.PATROL_POINT]"
			/>
		</el-form-item>
		<fk-form-object-item ref="fk_form_object_item" />
		<el-form-item>
			<template #label>
				<fk-label
					v-model="selected_input_key"
					cache-key="history-input"
					:options="label_options"
				/>
			</template>
			<el-input
				v-model="search_data.input_value"
				placeholder="请输入搜索内容"
				clearable
			>
				<i
					slot="prefix"
					class="el-input__icon el-icon-search"
				/>
			</el-input>
		</el-form-item>
		<el-form-item>
			<el-button
				type="primary"
				@click="search"
			>
				查询
			</el-button>
			<fk-reset-button
				type="primary"
				plain
				@click="reset"
			>
				重置
			</fk-reset-button>
		</el-form-item>
	</fk-form>
	<div class="table-operate">
		<div>
			<fk-export-button
				:export-menu="['导出所选数据','导出查询数据']"
				@handle-export="exportTable"
			/>
			<fk-print-button
				:print-menu="['打印所选数据','打印查询数据']"
				@handle-print="printTable"
			/>
		</div>
		<el-button
			type="primary"
			:loading="jump_loading"
			@click="openHistorySceneMap"
		>
			查看地图位置
		</el-button>
	</div>
	<fk-table
		ref="history_table"
		v-loading="loading"
		class="fk-selection-index"
		:data="historical_distribution_list"
		@selection-change="selectChange"
		@sort-change="handleTableSort"
	>
		<el-table-column
			type="selection"
			width="22"
		/>
		<el-table-column
			type="index"
			label="序号"
			width="45"
		/>
		<el-table-column
			prop="time"
			label="时间"
			:min-width="TABLE_COLUMN_WIDTH.date_time"
			:show-overflow-tooltip="true"
			:formatter="formatNull"
		/>
		<el-table-column
			prop="card_id"
			width="130"
			label="卡号"
			:show-overflow-tooltip="true"
			:formatter="formatNull"
			sortable="custom"
		/>
		<el-table-column
			prop="utype"
			width="130"
			label="定位对象类型"
			:formatter="formatUtype"
			:show-overflow-tooltip="true"
			sortable="custom"
		/>
		<fk-table-column
			prop="name"
			label="名称"
			sortable="custom"
			:show-overflow-tooltip="true"
			:formatter="formatNull"
			:show-header-tip="true"
			:header-tip="tips"
		/>
		<fk-table-column
			prop="related_info"
			label="相关信息"
			:show-overflow-tooltip="true"
			:formatter="formatNull"
			:show-header-tip="true"
			:header-tip="related_info_tips"
		/>
		<el-table-column
			prop="map"
			label="所在地图"
			class-name="direction-rtl"
			:show-overflow-tooltip="true"
		>
			<template #default="{row, column}">
				<a
					:class="formatNull(row, column, row[column.property]) !== '--' ? 'clickable-text' : ''"
					@click="goToHomeHistory(row)"
				>{{ formatNull(row, column, row[column.property]) }}</a>
			</template>
		</el-table-column>
		<fk-table-area-column
			prop="areas"
			label="所在区域"
			:show-overflow-tooltip="true"
			@click="openAreaDrawer"
		/>
		<el-table-column
			prop="coordinate"
			label="坐标"
			width="200"
			:show-overflow-tooltip="true"
			:formatter="formatNull"
		/>
	</fk-table>

	<div class="fk-pagination-bar">
		<el-pagination
			:current-page.sync="current_page"
			:page-size.sync="page_size"
			:page-sizes="[20, 50, 100]"
			layout="total, sizes, prev, pager, next, jumper"
			popper-class="fk-pagination-select"
			:total="total"
			@size-change="pageSizeChange"
			@current-change="currentPageChange"
		/>
		<div
			v-show="selected_data.length"
			class="fk-selected-num"
		>
			{{
				`已选择${selected_data.length}项`
			}}
		</div>
	</div>

	<area-drawer
		ref="area_drawer"
		@close="getHistoryListLimit"
	/>
</div>
</template>
<script>
import FkResetButton from "@/components/ForThink/Button/FkResetButton.vue";
import {base_url, MAX_PRINT_COUNT} from "@/Config";
import FkTable from "@/components/ForThink/Table/FkTable.vue";
import FkPrintButton from "@/components/ForThink/Button/FkPrintButton.vue";
import FkExportButton from "@/components/ForThink/Button/FkExportButton.vue";
import FloorCascader from "@/components/FloorCascader.vue";
import FkForm from "@/components/ForThink/Form/FkForm.vue";
import FkLabel from "@/components/ForThink/FkLabel.vue";
import FkDatePicker from "@/components/ForThink/Form/FkDatePicker.vue";
import FkTableAreaColumn from "@/components/ForThink/Table/FkTableAreaColumn.vue";
import FkFormObjectItem from "@/components/ForThink/Form/FkFormObjectItem.vue";
import FkTableColumn from "@/components/ForThink/Table/FkTableColumn.vue";
import AreaSelect from "@/components/AreaSelect.vue";
import AreaDrawer from "@/components/AreaDrawer/AreaDrawer.vue";
import {numberToAreaTypes, typeToTitle} from "@/components/AreaDrawer/constant";
import {getHistoricalDistributionList, getHistoricalDistributionMapInfo} from "@/api/history/history";
import {getFloorInfo} from "@/api/map/floor";
import {getScene} from "@/api/map/scene";
import {getArea} from "@/api/area/area";
import {getDateTimeStr} from "@/utils/js/tools/time";
import {formatNull} from "@/utils/js/tools/table";
import locationJump from "@/utils/js/locationHref";
import {downloadStaticFile, cleanupExpiredEffect} from "@/utils/js/common";
import {useLoading} from "@/composable/useLoading";
import {useRelatedInfoTips, useNameTips, useLabelOptions} from "@/composable/hide";
import {AreaType} from "@/types/global";
import {Dimension} from "@/types/map";
import {TABLE_COLUMN_WIDTH} from "@/utils/js/constant";
import {formatUtype} from "@/utils/js/formatter";

export default {
	name: "HistoryReplay",
	components: {
		AreaSelect,
		FkTable,
		FkPrintButton,
		FkExportButton,
		FloorCascader,
		FkForm,
		FkLabel,
		FkDatePicker,
		FkFormObjectItem,
		FkTableAreaColumn,
		FkTableColumn,
		AreaDrawer,
		FkResetButton
	},
	inject: ["FLOOR_OBJ"],
	setup() {
		const {loading, startLoading, endLoading} = useLoading();
		const {loading: jump_loading, startLoading: startJumpLoading, endLoading: endJumpLoading} = useLoading();
		const tips = useNameTips();
		const related_info_tips = useRelatedInfoTips();
		const label_options = useLabelOptions();

		return {
			loading,
			jump_loading,
			tips,
			related_info_tips,
			label_options,
			TABLE_COLUMN_WIDTH,
			startLoading,
			endLoading,
			startJumpLoading,
			endJumpLoading,
			formatUtype
		};
	},
	data() {
		return {
			AreaType,
			total: 0,
			current_page: 1, // 当前页码
			page_size: 20, // 每页数据量
			search_data: this.getDefaultFormData(),
			selected_input_key: "",
			default_floor: [-1],
			selected_data: [],
			historical_distribution_list: [],
			area_id_info: Object.freeze({}),
			scene_map: new Map(),
			floor_map: new Map(),
			sort_field: {prop: "", order: ""}
		};
	},
	mounted() {
		this.getAreaData();
	},
	methods: {
		formatNull,
		getDefaultFormData() {
			return {
				time: "",
				scene_id: -1,
				building_id: -1,
				floor_id: -1,
				area: undefined,
				input_value: ""
			};
		},

		getHistoryListLimit: cleanupExpiredEffect(async function (onCleanup) {
			let is_validate = true;
			onCleanup(() => is_validate = false);
			this.startLoading();
			const data = this.getRequestData();
			const {data: res} = await getHistoricalDistributionList(data).catch(() => ({data: undefined}));
			this.endLoading();
			if (is_validate && res?.type === 1) {
				this.total = res.result.count;
				this.historical_distribution_list = res.result.data;
			}
		}),

		getRequestData() {
			const {prop, order} = this.sort_field;
			const {time, scene_id, building_id, floor_id, area, input_value} = this.search_data;
			const data = {};
			if (time !== "") {
				data["time"] = time;
			}
			if (scene_id !== -1) {
				data["scene_id"] = scene_id;
			}
			if (building_id !== -1) {
				data["building_id"] = building_id;
			}
			if (floor_id !== -1) {
				data["floor_id"] = floor_id;
			}
			data["areas"] = area;
			if (input_value !== "") {
				data[this.selected_input_key] = input_value;
			}
			if (prop !== "") {
				data.field = prop;
			}
			if (order !== "") {
				data.order = order;
			}
			data.page = this.current_page;
			data.limit = this.page_size;
			return {
				...data,
				...this.$refs.fk_form_object_item.getObjectSearchData()
			};
		},

		async printTable(index) {
			if (index === 0) {
				if (this.selected_data.length === 0) {
					this.$notify({
						type: "warning",
						title: "提示",
						message: "请选择要打印的内容"
					});
					return;
				}
				this.$refs.history_table.print("历史分布", index === 0);
				return;
			}
			if (this.search_data.time === "") return;
			const data = this.getRequestData();
			delete data.page;
			delete data.limit;
			const res = await getHistoricalDistributionList(data);
			const print_data = res.data.result.data;
			if (!print_data) return;
			if (print_data?.length > MAX_PRINT_COUNT) {
				this.$notify.warning({
					title: "提示",
					message: `单次最多支持打${MAX_PRINT_COUNT}条数据`
				});
				return;
			}
			this.$refs.history_table.print("历史分布", !index, {}, ["操作"], {data: print_data});
		},

		exportTable(index) {
			let data = {};
			if (this.search_data.time === "") {
				this.$notify({
					type: "warning",
					title: "警告",
					message: "请选择日期时间"
				});
				return;
			} else {
				data["time"] = this.search_data.time;
			}
			if (index === 0) {
				data["id_list"] = this.selected_data.map(value => value.id);
			} else {
				data = this.getRequestData();
				data.page = undefined;
				data.limit = undefined;
			}
			const name = "历史分布表" + getDateTimeStr({}).date;
			downloadStaticFile(base_url + "/EHCommon/history/history/exportHistoricalDistribution", `${name}.xlsx`, () => {
			}, data, "file");
		},

		changeFloor(floor_data) {
			const type_key_map = {
				scene: "scene_id",
				building: "building_id",
				floor: "floor_id",
			};
			this.search_data.scene_id = -1;
			this.search_data.building_id = -1;
			this.search_data.floor_id = -1;
			const {id, type} = floor_data;
			type_key_map[type] && (this.search_data[type_key_map[type]] = id);
		},

		// 页码发生变化
		currentPageChange() {
			this.getHistoryListLimit();
		},

		// 每页数据量变化
		pageSizeChange() {
			this.current_page = 1;
			this.getHistoryListLimit();
		},

		// 选择数据
		selectChange(value) {
			this.selected_data = value;
		},

		handleTableSort({prop, order}) {
			if (order) {
				this.sort_field.prop = prop;
				this.sort_field.order = order === "ascending" ? "ASC" : "DESC";
			} else {
				this.sort_field.prop = "";
				this.sort_field.order = "";
			}
			this.getHistoryListLimit();
		},

		notifyNoTime(message) {
			if (this.search_data.time === "") {
				this.$notify({
					type: "warning",
					title: "警告",
					message
				});
				return false;
			}
			return true;
		},

		search() {
			if (!this.notifyNoTime("请选择日期时间")) return;
			this.clearHistoryListData();
			this.getHistoryListLimit();
		},

		clearHistoryListData() {
			this.total = 0;
			this.current_page = 1;
			this.historical_distribution_list = [];
		},

		reset() {
			this.clearHistoryListData();
			this.search_data = this.getDefaultFormData();
			this.default_floor = [-1];
			this.$refs.fk_form_ref.resetFields();
			this.$refs.fk_form_object_item.resetObjectDefault();
		},

		// 查看地图是否删除，true-删除，false-未删除
		async checkMapDel(type, id) {
			if (type === "scene") {
				const {data: res} = await getScene().catch(() => ({data: undefined}));
				if (res?.type === 1) {
					const find_scene = res.result.data.find((item) => item.id === id);
					if (!find_scene?.file_path) {
						this.$notify({
							type: "error",
							title: "跳转失败",
							message: "所在场景已被删除"
						});
						return true;
					}
					return false;
				}
				return true;
			} else if (type === "floor") {
				const {data: res} = await getFloorInfo({type: 0, scene_query: 1, floor_id_list: [id]}).catch(() => ({data: undefined}));
				if (res?.type === 1) {
					const find_one = res.result.data[0];
					if (!find_one?.floor_2d_file && !find_one?.floor_3d_file) {
						this.$notify({
							type: "error",
							title: "跳转失败",
							message: "所在地图已被删除"
						});
						return true;
					}
					return false;
				}
				return true;
			}
			return false;
		},

		async getAreaData() {
			const {data: res} = await getArea().catch(() => ({data: undefined}));
			if (res?.type === 1) {
				const result = res.result.data.reduce((result, item) => {
					result[item.id] = item;
					return result;
				}, {});
				this.area_id_info = Object.freeze(result);
			}
		},

		setJumpParams(options) {
			const {scene_id, floor_id, time, card_id, uuid, display_type = Dimension.Two} = options;
			const jump_params = {mode: "history_distribution", time: time, scene_id: scene_id ?? "", floor_id: floor_id ?? "", card_id: card_id ?? "", uuid: uuid ?? "", display_type: display_type ?? ""};
			const url = `/#/?${new URLSearchParams(jump_params).toString()}`;
			locationJump(url, true);
		},

		async refreshSceneData() {
			const {data: res} = await getScene().catch(() => ({data: undefined}));
			if (res?.type === 1) {
				res.result.data.forEach((item) => {
					const {id, file_path} = item;
					this.scene_map.set(id, Boolean(file_path));
				});
				return this.scene_map;
			}
			return Promise.reject();
		},
		async refreshFloorData() {
			const {data: res} = await getFloorInfo({scene_query: 1}).catch(() => ({data: undefined}));
			if (res?.type === 1) {
				res.result.data.forEach((item) => {
					const {id, floor_2d_file, floor_3d_file} = item;
					this.floor_map.set(id, Boolean(floor_2d_file) || Boolean(floor_3d_file));
				});
				return this.floor_map;
			}
			return Promise.reject();
		},

		async openHistorySceneMap() {
			const {time, scene_id, floor_id, building_id, area} = this.search_data;
			if (!this.notifyNoTime("请选择时间后，再点击按钮“查看地图位置”")) return;
			if (building_id !== -1) return this.$notify.error({title: "跳转失败", message: "暂不支持单个建筑地图上显示定位数据，请切换地图"});
			this.startJumpLoading();
			const is_pass = await Promise.all([
				this.refreshSceneData(),
				this.refreshFloorData()
			]).catch(() => false);
			if (!is_pass) return this.$notify.error({title: "错误", message: "获取场景或地图接口失败"});

			this.endJumpLoading();
			const area_id = area ? Object.values(area)[0][0] : undefined;
			if (scene_id !== -1) {
				// 选择了场景，跳转对应的场景
				this.scene_map.get(scene_id) ? this.setJumpParams({scene_id, time, display_type: Dimension.Three}) : this.$notify.error({title: "错误", message: "所在场景地图已被删除"});
			} else if (floor_id !== -1) {
				// 选择了楼层，跳转对应的楼层
				this.floor_map.get(floor_id) ? this.setJumpParams({floor_id, time}) : this.$notify.error({title: "错误", message: "所在楼层地图已被删除"});
			} else if (area_id !== undefined) {
				// 选择了区域，跳转对应的楼层
				const area_floor_id = this.area_id_info[area_id]?.floor_id;
				this.floor_map.get(area_floor_id) ? this.setJumpParams({floor_id: area_floor_id, time}) : this.$notify.error({title: "错误", message: "所在楼层地图已被删除"});
			} else {
				const {data: res} = await getHistoricalDistributionMapInfo({time}).catch(() => ({data: undefined}));
				if (res?.type === 1) {
					const {scene_id_list, floor_id_list} = res.result;
					const scene_id = scene_id_list.find((id) => this.scene_map.get(id));
					const floor_id = floor_id_list.find((id) => this.floor_map.get(id));
					if (scene_id === undefined && floor_id === undefined) {
						return this.$notify.error({title: "错误", message: "所在地图已被删除"});
					}

					this.setJumpParams({
						scene_id,
						floor_id: scene_id !== undefined ? undefined : floor_id,
						display_type: scene_id !== undefined ? Dimension.Three : undefined,
						time,
					});
				} else {
					this.$notify.error({title: "错误", message: res?.result || "服务器异常"});
				}
			}
		},

		async goToHomeHistory(row) {
			const {floor_id, card_id, time, uuid, map} = row;
			if (this.formatNull(undefined, undefined, map) === "--") return;
			const is_del = await this.checkMapDel("floor", floor_id);
			is_del || this.setJumpParams({
				time,
				floor_id,
				card_id,
				uuid
			});
		},

		openAreaDrawer({type, area_id}) {
			const area_type = numberToAreaTypes[type];
			this.$refs.area_drawer.openDrawer({
				id: area_id,
				type: area_type,
				from: "table",
				title: typeToTitle[area_type]
			});
		}
	},
};
</script>
<style scoped>
.history-replay {
	padding: 30px 30px 24px;
	height: 100%;
	display: flex;
	flex-direction: column;
	flex: 1;
}

.table-operate {
	display: flex;
	justify-content: space-between;
	margin-bottom: 18px;
}

.question-icon {
	font-size: 14px;
	margin-right: 4px;
	color: #D1D8E1;
}
</style>
