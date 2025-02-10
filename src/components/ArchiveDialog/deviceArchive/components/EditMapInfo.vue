<template>
<base-dialog
	v-model="dialog_visible"
	title="编辑位置信息"
	:show-footer="true"
	:min-height="345"
	:close-on-click-modal="false"
	width="1330px"
	append-to-body
	style="--body-padding: 16px;"
	:before-close="handleClose"
>
	<div>
		选择设备地点
	</div>

	<div class="device-position">
		<area-map
			v-if="dialog_visible"
			ref="area_map"
			:map-type="1"
			:is-edit="false"
			:page-key="pageKey"
			@map-click="clickMap"
			@map-loaded="mapLoaded"
		/>
		<div class="device-coordinate">
			<span>最后标记坐标</span>
			<el-form
				:inline="true"
				size="small"
			>
				<el-form-item
					label="X坐标"
				>
					<el-input
						v-model="coordinate.x"
					/>
				</el-form-item>
				<el-form-item
					label="Y坐标"
				>
					<el-input
						v-model="coordinate.y"
					/>
				</el-form-item>
				<el-form-item>
					<template #label>
						<span style="margin-right: 4px;">H高度</span>
						<fk-icon
							tip="距离楼层地图地面的相对高度"
						>
							<i
								class="hg-icons hg-icon-tooltip-question"
								style="font-size: 14px;"
							/>
						</fk-icon>
					</template>
					<el-input
						v-model="coordinate.z"
					/>
				</el-form-item>
				<el-form-item class="btn-form-item">
					<el-button
						type="primary"
						size="small"
						@click="clickSearchCoordinate"
					>
						查询
					</el-button>
				</el-form-item>
			</el-form>
		</div>
	</div>

	<div
		slot="footer"
		class="dialog-footer"
	>
		<el-button
			plain
			size="small"
			@click="handleClose"
		>
			取消
		</el-button>
		<el-button
			v-prevent-repeat-click
			type="primary"
			size="small"
			@click="handleSure"
		>
			保存
		</el-button>
	</div>
</base-dialog>
</template>

<script>
import {getDeviceInfo, updateDevice} from "@/api/deviceManage/info";
import "@/libs/HG2DMap.min.css";
import {base_url} from "@/Config";
import FkIcon from "@/components/ForThink/FkIcon.vue";
import map_icons from "@/utils/js/tools/mapIcons";
import AreaMap from "@/components/AreaMap/AreaMap.vue";
import {useAreaMapStorage} from "@/composable/map/useAreaMapStorage";
import {SETTING_CHANGE_KEY} from "@/events";
import {useEventBus} from "@vueuse/core";
import BaseDialog from "@/components/Dialog/BaseDialog.vue";
import {isEqual} from "lodash-es";

const area_map_setting_change = useEventBus(SETTING_CHANGE_KEY);

const generateCoordinate = ({x, y, z}) => {
	if (x !== null && y !== null && z !== null) {
		return "x:" + parseFloat(x).toFixed(2) + "," + "y:" + parseFloat(y).toFixed(2) + "," + "z:" + parseFloat(z).toFixed(2);
	} else {
		return "--";
	}
};

const device_type_icon = {
	1: map_icons.door.model_2d_url,
	2: map_icons.power_source.model_2d_url,
	3: map_icons.power_box.model_2d_url,
	4: map_icons.switch.model_2d_url,
	6: map_icons.smart_car_machine.model_2d_url
};

let active_feature = null;
let same_map_features = [];
export default {
	name: "EditMapInfo",
	components: {
		BaseDialog,
		AreaMap,
		FkIcon
	},
	props: {
		pageKey: {
			type: String,
			default: "device_power"
		},
	},
	data() {
		return {
			device_info: null,
			type_id: -1, // 设备类型
			dialog_visible: false,
			coordinate: {
				x: null,
				y: null,
				z: null
			},
			all_same_map_device: Object.freeze([]),
			map_show_device_type_list: [],
			map_show_device_base_field: [],
		};
	},
	computed: {
		area_map_setting() {
			return useAreaMapStorage(this.pageKey).area_map_setting.value;
		}
	},
	mounted() {
		this.map_show_device_base_field = this.area_map_setting.device_base_field;
		this.map_show_device_type_list = this.area_map_setting.device_type_list;

		area_map_setting_change.on(this.changeMapDisplaySetting);
	},
	beforeDestroy() {
		area_map_setting_change.off(this.changeMapDisplaySetting);
	},
	methods: {
		changeMapDisplaySetting(change, all) {
			if (this.$refs["area_map"]) {
				this.hideSameMapDevice();
				this.map_show_device_base_field = all.device_base_field;
				this.map_show_device_type_list = all.device_type_list;

				if (isEqual(all.device_type_list, this.map_show_device_type_list)) {
					this.getAllSameMapDevice();
				} else {
					if (this.map_show_device_type_list.length > 0) {
						this.showSameMapDevice();
					}
				}
			}
		},

		handleClose() {
			this.dialog_visible = false;
			this.coordinate = {
				x: null,
				y: null,
				z: null
			};
			if (active_feature) {
				this.$refs["area_map"].removeFeature(active_feature);
			}
			this.hideSameMapDevice();
			active_feature = null;
			this.is_show_map_clear = false;
			this.is_show_loading = true;
		},

		openDialog(device_info) {
			const {storageCurrentFloor} = useAreaMapStorage(this.pageKey);
			storageCurrentFloor({floor_id: device_info.floor_id});
			this.dialog_visible = true;
			const x = device_info.x && parseFloat(device_info.x).toFixed(2);
			const y = device_info.y && parseFloat(device_info.y).toFixed(2);
			const z = device_info.z && parseFloat(device_info.z).toFixed(2);
			const relative_h = device_info.relative_h && parseFloat(device_info.relative_h).toFixed(2);
			this.device_info = {
				...device_info,
				id: device_info.id,
				floor_id: device_info.floor_id,
				device_uuid: device_info.device_uuid,
				device_num: device_info.device_no,
				name: device_info.name,
				floor: device_info.scene_name + "-" + device_info.building_name + "-" + device_info.floor,
				coordinate: generateCoordinate({x: device_info.x, y: device_info.y, z: device_info.z}),
				x,
				y,
				z,
				relative_h,
				station_id: device_info.info.bs_addr,
				port: device_info.info.bs_port,
				ip: device_info.info.ip,
			};
			this.type_id = device_info.type;
			this.coordinate.x = this.device_info.x;
			this.coordinate.y = this.device_info.y;
			this.coordinate.z = this.device_info.relative_h;
			if (!device_info.floor_id) {
				this.coordinate.z = this.getDefaultRelativeHeight(this.type_id);
			}
		},

		getDefaultRelativeHeight(type) {
			switch (type) {
			case 2:
			case 3:
			case 8:
				// 电源
				return "2";
			case 4:
				// 交换机
				return "1";
			case 6:
				// 一体机
				return "0";
			default:
				return null;
			}
		},

		// 初始化地图和切换地图加载完成都会触发该事件
		mapLoaded() {
			const now_floor = this.$refs["area_map"].getCurrentFloorInfo();
			const map_id = now_floor.id;
			active_feature = null;
			if (this.device_info.floor_id && this.device_info.floor_id === map_id) {
				this.focusFeature();
			}
			same_map_features = [];
			this.getAllSameMapDevice();
		},

		clickMap(coordinate) {
			if (!active_feature) {
				active_feature = this.createDevice(coordinate);
				this.$refs["area_map"].addFeature(active_feature);
			} else {
				active_feature.setCoordinates(coordinate);
			}
			this.coordinate.x = coordinate[0].toFixed(2);
			this.coordinate.y = coordinate[1].toFixed(2);
		},

		// 查询坐标
		clickSearchCoordinate() {
			if (!this.isNumber(this.coordinate.x) || !this.isNumber(this.coordinate.y)) {
				this.$notify.error({
					title: "错误",
					message: "请输入x坐标和y坐标。"
				});
			} else {
				const coordinate = [this.coordinate.x, this.coordinate.y];
				if (active_feature) {
					active_feature.setCoordinates(coordinate);
				} else {
					active_feature = this.createDevice(coordinate);
					this.$refs["area_map"].addFeature(active_feature);
				}
				this.$refs["area_map"].setCenter(coordinate[0], coordinate[1]);
			}
		},

		focusFeature() {
			if (this.isNumber(this.coordinate.x) || this.isNumber(this.coordinate.y)) {
				const coordinate = [this.coordinate.x, this.coordinate.y];
				if (active_feature) {
					active_feature.setCoordinates(coordinate);
				} else {
					active_feature = this.createDevice(coordinate);
					this.$refs["area_map"].addFeature(active_feature);
				}
				this.$refs["area_map"].setCenter(coordinate[0], coordinate[1]);
			}
		},

		isNumber(val) {
			// isNaN()函数 把空串 空格 以及NUll 按照0来处理 所以先去除，
			if (val === "" || val == null) {
				return false;
			}
			return !isNaN(val);
		},

		createDeviceText(item) {
			const labels = [];
			const now_floor = this.$refs["area_map"].getCurrentFloorInfo();
			if (this.map_show_device_base_field.includes("name")) {
				labels.push(item.name);
			}

			if (this.map_show_device_base_field.includes("device_id")) {
				labels.push(item.device_no);
			}

			if (this.map_show_device_base_field.includes("floor")) {
				labels.push(now_floor?.name);
			}
			return labels.join("-");
		},

		createDevice(position) { // 新建设备
			const icon_type = {
				1: map_icons.door.model_2d_url_s,
				2: map_icons.power_source.model_2d_url_s,
				3: map_icons.power_box.model_2d_url_s,
				4: map_icons.switch.model_2d_url_s,
				6: map_icons.smart_car_machine.model_2d_url_s
			};
			const icon = base_url + icon_type[this.type_id];
			return this.$refs["area_map"].createDeviceFeature({
				coordinate: position,
				icon: icon
			});
		},

		createSameMapDevice(item) {
			const coordinate = [item.x, item.y];
			return this.$refs["area_map"].createDeviceFeature({
				coordinate,
				text: this.createDeviceText(item),
				icon: base_url + device_type_icon[item.type]
			});
		},

		showSameMapDevice() {
			this.all_same_map_device.forEach((item) => {
				const feature = this.createSameMapDevice(item);
				this.$refs["area_map"].addFeature(feature);
				same_map_features.push(feature);
			});
		},

		hideSameMapDevice() {
			same_map_features.forEach((feature) => {
				this.$refs["area_map"].removeFeature(feature);
			});
			same_map_features = [];
		},

		getAllSameMapDevice() {
			const now_floor = this.$refs["area_map"].getCurrentFloorInfo();
			getDeviceInfo({
				floor_id_list: [now_floor.id],
				type_id_list: [...this.map_show_device_type_list]
			}).then((res) => {
				if (res.data.type === 1) {
					this.all_same_map_device = Object.freeze(res.data.result.data.filter((item) => item.device_uuid !== this.device_info.device_uuid));
				}

				if (this.map_show_device_type_list.length > 0) {
					this.showSameMapDevice();
				}
			});
		},

		// 保存
		handleSure() {
			const data = this.getRequestData();
			if (!this.isNumber(data.x) || !this.isNumber(data.y)) {
				this.$notify.error({
					title: "错误",
					message: "请输入x坐标和y坐标"
				});
				return;
			}
			updateDevice({...data, device_uuid: this.device_info.device_uuid}).then((res) => {
				if (res.data.type === 1) {
					this.$emit("get-list");
					this.handleClose();
					this.$notify.success({
						title: "成功",
						message: "更新成功"
					});
					this.$emit("success");
				} else {
					this.$notify.error({
						title: "错误",
						message: res.data.result
					});
				}
			});
		},

		getRequestData() {
			const res = {};
			const now_floor = this.$refs["area_map"].getCurrentFloorInfo();
			const data = {
				device_no: this.device_info.device_num || this.device_info.device_no,
				name: this.device_info.name,
				floor_id: now_floor.id,
				x: this.coordinate.x == null ? null : parseFloat(this.coordinate.x),
				y: this.coordinate.x == null ? null : parseFloat(this.coordinate.y),
				// 设备新增和编辑时，z是表示相对高度，但是从 getDeviceInfo 返回的z是绝对高度
				z: this.coordinate.z == null ? null : parseFloat(this.coordinate.z),
			};
			if ([2, 3].indexOf(parseInt(this.type_id)) !== -1) {
				data.info = {
					bs_addr: this.device_info.station_id,
					bs_port: this.device_info.port,
				};
			} else if (parseInt(this.type_id) === 1) {
				data.info = {
					...this.device_info.info
				};
			} else if ([4, 6].indexOf(parseInt(this.type_id)) !== -1) {
				data.info = {
					ip: this.device_info.ip
				};
			}
			for (const i in data) {
				if (data[i] !== "") {
					res[i] = data[i];
				}
			}
			return res;
		},

		getCheckedFloor({id}) {
			const floor = this.floor_options[id];
			if (floor) {
				this.floor_id = [floor.scene_id, floor.building_id, floor.id];
				this.changeMap();
			}
		}
	}
};
</script>

<style scoped lang="scss">
.device-position {
	position: relative;
	height: 54vh;
	max-height: 524px;
	margin: 12px auto 20px auto;
	background-color: #F4F8F9;

	.device-coordinate {
		position: absolute;
		height: 96px;
		bottom: 20px;
		right: 20px;
		padding: 16px;
		background-color: #fff;
		box-shadow: 0 0 10px rgba(20, 50, 80, 0.12);
		border-radius: 4px;

		span {
			display: inline-block;
			margin-bottom: 16px;
			line-height: 16px;
			font-size: 14px;
			color: #748BA4;
		}

		:deep(.el-input__inner) {
			color: #A2B2C2;
		}

		:deep(.el-form-item) {
			margin-right: 16px;
			margin-bottom: 0;
		}

		:deep(.el-form-item.btn-form-item) {
			margin-right: 0;
		}

		:deep(.el-form-item__content) {
			width: 80px;
		}

		:deep(.el-form-item__label) {
			color: #748BA4;
		}

		:deep(.el-form-item.btn-form-item) {
			.el-button {
				margin-right: 0 !important;
			}
		}
	}
}

:deep(.el-form-item__label) {
	padding-right: 6px;
	color: #748BA4;
}

:deep(.el-form-item.btn-form-item) {
	.el-form-item__content {
		width: auto;
	}
}
</style>
