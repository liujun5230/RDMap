<template>
<el-cascader
	ref="floor-cascader"
	v-model="floorValue"
	:options="floor_options"
	:props="{checkStrictly: true,expandTrigger:'hover',value:'id',label:'name',children:'node'}"
	separator="-"
	size="small"
	popper-class="floor-cascader"
	:placeholder="hasMap ? '请选择' : '暂无地图'"
	class="floor-text-left-overflow"
	:disabled="disabled"
>
	<template #default="{ node,data }">
		<span
			:class="{'no-map-file': noMap(data, node)}"
			class="floor-cascader-span"
			@click="selectFloor(node,data)"
		>{{ data.name }}</span>
	</template>
</el-cascader>
</template>

<script>
import {getAllFloorInfo} from "@/api/map/floor";
import {useSystemConfigStore} from "@/store/useSystemConfigStore";

import {cloneDeep} from "lodash-es";
import {mapStores} from "pinia";

export default {
	name: "FloorCascader",
	props: {
		defaultFloor: {
			type: Array,
			default() {
				return [];
			}
		},
		hasAll: {
			type: Boolean,
			default: false
		},
		noMapOption: {
			type: Boolean,
			default: false
		},
		width: {
			type: String,
			default: "190px"
		},
		enableTypes: {
			type: Array,
			default() {
				return ["scene", "building", "floor"];
			},
			validator: function (value) {
				return value.every(item => ["scene", "building", "floor"].includes(item));
			}
		},
		needBaiduMap: {
			type: Boolean,
			default: true
		},
		disabled: {
			type: Boolean,
			default: false
		},
		onlyMap2d: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			floorValue: [],
			floor_all_options: []
		};
	},
	computed: {
		baidu_map_display() {
			return this.systemConfigStore.getBooleanValue("BAIDU_MAP_DISPLAY", false);
		},
		hasMap() {
			return this.floor_all_options.length !== 0;
		},

		...mapStores(useSystemConfigStore),

		/**
		 * 隐藏了之前的室外楼层，将之前室外楼层所属的建筑当作室外 v6.3.0
		 */
		floor_options() {
			const options = cloneDeep(this.floor_all_options);
			options.map(scene => {
				const no_building = scene.node?.length === 1 && scene.node[0]?.is_outdoor;

				if (no_building) {
					scene.outdoor = scene.node[0]?.node;
					scene.node = undefined;
				}

				scene.node?.map(building => {
					if (building.is_outdoor) {
						building.outdoor = building.node;
						building.node = undefined;
						building.name = "室外";
					}
				});
			});
			return options;
		},
		floor_data() {
			return [this.defaultFloor, this.floor_options];
		}
	},
	watch: {
		floor_data: {
			handler() {
				// 特殊处理室外
				if (this.defaultFloor.length === 3) {
					const [scene_id, building_id] = this.defaultFloor;
					const scene = this.floor_options.find(scene => scene.id === scene_id);
					const building = scene?.node?.find(building => building.id === building_id);
					if (scene?.outdoor) {
						this.floorValue = [scene_id];
						return;
					}

					if (building?.outdoor) {
						this.floorValue = [scene_id, building_id];
						return;
					}
				}

				this.floorValue = [...this.defaultFloor];
			},
			deep: true,
			immediate: true
		}
	},
	async mounted() {
		this.getAllFloorData();
	},
	methods: {
		noMap(data) {
			if (data.map_type === "no") return false;
			let has_map_file = true;
			const has_all = data.has_all && ["scene", "building", "all"].includes(data.map_type) || data.map_type === "floor";
			// 判断室外楼层的地图文件是否存在
			has_map_file = data.map_type === "building" && data.outdoor
				? +data.outdoor[0]?.is_file
				: data.is_file;
			return !has_all
				|| this.onlyMap2d && data.map_type === "floor" && !data.file_2d_path && data.id !== 2
				|| !has_map_file
				|| !data.outdoor && data.map_type !== "all" && !this.enableTypes.includes(data.map_type);
		},
		getFloorValue(node) {
			if (node.parent) {
				this.getFloorValue(node.parent);
			}
			this.floorValue.push(node.value);
		},
		selectFloor(node, data) {
			if (this.noMap(data, node))
				return;

			this.floorValue = [];
			this.getFloorValue(node);
			this.$refs["floor-cascader"].toggleDropDownVisible(false);

			// 特殊处理 场景2D一张图业务逻辑上属于场景
			if (data.map_type === "building" && data.is_outdoor) {
				this.$emit("get-checked-floor", {
					type: "floor",
					scene_id: node.parent.value,
					is_outdoor: true,
					id: node.parent.data.outdoor_floor_id,
					cascade_data: [...this.floorValue],
					path_node: [...node.pathNodes],
				});
				return;
			}
			// 特殊处理 2D地图如果室外被隐藏，点击场景等于点击室外
			// 如果没有使用场景，则返回对应楼层id
			if (data.map_type === "scene" && data.outdoor && !this.enableTypes?.includes("scene")) {
				this.$emit("get-checked-floor", {
					type: "floor",
					scene_id: node.value,
					is_outdoor: true,
					id: data.outdoor[0].id,
					cascade_data: [...this.floorValue],
					path_node: [...node.pathNodes],
				});
				return;
			}

			const checked_data = {
				type: data.map_type,
				id: data.id,
				cascade_data: [...this.floorValue],
				path_node: [...node.pathNodes]
			};
			this.$emit("get-checked-floor", checked_data);
		},
		closeDropDown() {
			this.$refs["floor-cascader"].toggleDropDownVisible(false);
			this.$refs["floor-cascader"].$children[0].blur();
		},

		getAllFloorData() {
			getAllFloorInfo().then(res => {
				const {type, result} = res.data;
				if (type === 1) {
					this.floor_all_options = result;
					this.baidu_map_display && this.floor_all_options.push({
						id: 2,
						is_file: 1,
						map_type: "floor",
						name: "百度地图"
					});
				}
				this.hasAll && this.floor_all_options.unshift({
					id: -1,
					is_file: 1,
					map_type: "all",
					has_all: 1,
					name: "全部"
				});
				this.noMapOption && this.floor_all_options.unshift({
					id: 0,
					is_file: 1,
					map_type: "no",
					name: "无"
				});
				this.$emit("get-map-info", this.floor_all_options);
			});
		},
	}
};
</script>

<style>
.floor-cascader .el-cascader-menu__wrap .el-radio {
	display: none !important;
}

.floor-cascader-span {
	display: block;
}

.no-map-file {
	color: #d1d8e1;
	cursor: not-allowed;
}

.el-cascader__dropdown.floor-cascader .el-cascader-menu__wrap,
.el-cascader__dropdown.floor-cascader .el-cascader-menu__wrap {
	height: auto;
	min-height: 34px;
	max-height: 204px;
}

.el-cascader__dropdown.floor-cascader .el-cascader-menu__wrap .el-cascader-menu__list.is-empty,
.el-cascader__dropdown.floor-cascader .el-cascader-menu__wrap .el-cascader-menu__list.is-empty {
	height: 34px;
}

.custom-theme-green .floor-cascader .el-cascader-menu .el-cascader-node.in-active-path .floor-cascader-span,
.custom-theme-blue .floor-cascader .el-cascader-menu .el-cascader-node.in-active-path .floor-cascader-span {
	color: #748BA4 !important;
}

.custom-theme-blue .floor-cascader .el-cascader-menu .el-cascader-node.in-active-path {
	background: #E2EEFB;
}

.custom-theme-green .floor-cascader .el-cascader-menu .el-cascader-node.in-active-path {
	background: #EBF9F8;
}

.custom-theme-blue .floor-cascader .el-cascader-menu .el-cascader-node.in-checked-path .floor-cascader-span {
	color: #07f !important;
}

.custom-theme-green .floor-cascader .el-cascader-menu .el-cascader-node.in-checked-path .floor-cascader-span {
	color: #3eb2a9 !important;
}

.custom-theme-blue .floor-cascader .el-cascader-menu .el-cascader-node.in-checked-path,
.custom-theme-green .floor-cascader .el-cascader-menu .el-cascader-node.in-checked-path {
	background: #fff;
}
</style>

<style scoped>
.floor-text-left-overflow.el-cascader {
	--floor-select-input-width: v-bind(width);
}
</style>
