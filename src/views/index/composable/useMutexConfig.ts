import {cloneDeep} from "lodash-es";
import {ref} from "vue";

export type MutexMode = "area_statistics" | "measure_distance" | "pick_coordinate" | "history_distribution" | "map_cruise" | "emergency_evacuation" | "clustering" | "heatmap" | "initial";
export type MutexOperation = "switch_theme" | "enter_edit_mode" | "switch_map" | "search" | "collapse" | "switch_2d_3d" | "zoom" | "default_view" | "rotate" | "map_cruise" | "area_statistics" | "measure_distance" | "pick_coordinate" | "history_distribution" | "emergency_evacuation" | "clustering" | "heatmap";
type OperationConfig = Record<MutexOperation, boolean>;

type MutexConfig = Record<MutexMode, OperationConfig>;

const mutex_config: MutexConfig = {
	area_statistics: {
		// 切换主题
		switch_theme: false,
		// 进入编辑模式
		enter_edit_mode: false,
		// 切换地图
		switch_map: true,
		// 搜索
		search: false,
		// 一键收起/展开
		collapse: true,
		// 2d/3d切换
		switch_2d_3d: false,
		// 放大缩小
		zoom: true,
		// 默认视角
		default_view: true,
		// 旋转
		rotate: true,
		// 地图巡航
		map_cruise: false,
		// 区域统计
		area_statistics: false,
		// 测距
		measure_distance: false,
		// 坐标拾取
		pick_coordinate: false,
		// 历史分布
		history_distribution: false,
		// 紧急撤离
		emergency_evacuation: false,
		// 聚类
		clustering: true,
		// 热力图
		heatmap: true,
	},
	"clustering": {
		// 切换主题
		switch_theme: true,
		// 进入编辑模式
		enter_edit_mode: true,
		// 切换地图
		switch_map: true,
		// 搜索
		search: true,
		// 一键收起/展开
		collapse: true,
		// 2d/3d切换
		switch_2d_3d: true,
		// 放大缩小
		zoom: true,
		// 默认视角
		default_view: true,
		// 旋转
		rotate: true,
		// 地图巡航
		map_cruise: true,
		// 区域统计
		area_statistics: true,
		// 测距
		measure_distance: true,
		// 坐标拾取
		pick_coordinate: true,
		// 历史分布
		history_distribution: true,
		// 紧急撤离
		emergency_evacuation: true,
		// 聚类
		clustering: true,
		// 热力图
		heatmap: true,
	},
	"emergency_evacuation": {
		// 切换主题
		switch_theme: false,
		// 进入编辑模式
		enter_edit_mode: false,
		// 切换地图
		switch_map: true,
		// 搜索
		search: true,
		// 一键收起/展开
		collapse: false,
		// 2d/3d切换
		switch_2d_3d: true,
		// 放大缩小
		zoom: true,
		// 默认视角
		default_view: true,
		// 旋转
		rotate: true,
		// 地图巡航
		map_cruise: false,
		// 区域统计
		area_statistics: false,
		// 测距
		measure_distance: false,
		// 坐标拾取
		pick_coordinate: false,
		// 历史分布
		history_distribution: false,
		// 紧急撤离
		emergency_evacuation: false,
		// 聚类
		clustering: true,
		// 热力图
		heatmap: true,
	},
	"heatmap": {
		// 切换主题
		switch_theme: true,
		// 进入编辑模式
		enter_edit_mode: true,
		// 切换地图
		switch_map: true,
		// 搜索
		search: true,
		// 一键收起/展开
		collapse: true,
		// 2d/3d切换
		switch_2d_3d: true,
		// 放大缩小
		zoom: true,
		// 默认视角
		default_view: true,
		// 旋转
		rotate: true,
		// 地图巡航
		map_cruise: true,
		// 区域统计
		area_statistics: true,
		// 测距
		measure_distance: true,
		// 坐标拾取
		pick_coordinate: true,
		// 历史分布
		history_distribution: true,
		// 紧急撤离
		emergency_evacuation: true,
		// 聚类
		clustering: true,
		// 热力图
		heatmap: true,
	},
	"history_distribution": {
		// 切换主题
		switch_theme: false,
		// 进入编辑模式
		enter_edit_mode: false,
		// 切换地图
		switch_map: true,
		// 搜索
		search: true,
		// 一键收起/展开
		collapse: false,
		// 2d/3d切换
		switch_2d_3d: true,
		// 放大缩小
		zoom: true,
		// 默认视角
		default_view: true,
		// 旋转
		rotate: true,
		// 地图巡航
		map_cruise: false,
		// 区域统计
		area_statistics: false,
		// 测距
		measure_distance: false,
		// 坐标拾取
		pick_coordinate: false,
		// 历史分布
		history_distribution: false,
		// 紧急撤离
		emergency_evacuation: false,
		// 聚类
		clustering: true,
		// 热力图
		heatmap: true,
	},
	"pick_coordinate": {
		// 切换主题
		switch_theme: false,
		// 进入编辑模式
		enter_edit_mode: false,
		// 切换地图 清空数据
		switch_map: true,
		// 搜索
		search: false,
		// 一键收起/展开
		collapse: true,
		// 2d/3d切换
		switch_2d_3d: true,
		// 放大缩小
		zoom: true,
		// 默认视角
		default_view: true,
		// 旋转
		rotate: true,
		// 地图巡航
		map_cruise: false,
		// 区域统计
		area_statistics: false,
		// 测距
		measure_distance: false,
		// 坐标拾取
		pick_coordinate: false,
		// 历史分布
		history_distribution: false,
		// 紧急撤离
		emergency_evacuation: false,
		// 聚类
		clustering: true,
		// 热力图
		heatmap: true,
	},
	"map_cruise": {
		// 切换主题
		switch_theme: false,
		// 进入编辑模式
		enter_edit_mode: false,

		// 切换地图 无3D地图退出
		switch_map: true,
		// 搜索
		search: false,
		// 一键收起/展开
		collapse: true,
		// 2d/3d切换
		switch_2d_3d: false,
		// 放大缩小
		zoom: false,
		// 默认视角 退出地图巡航
		default_view: true,
		// 旋转
		rotate: true,
		// 地图巡航
		map_cruise: false,
		// 区域统计
		area_statistics: false,
		// 测距
		measure_distance: false,
		// 坐标拾取
		pick_coordinate: false,
		// 历史分布
		history_distribution: false,
		// 紧急撤离
		emergency_evacuation: false,
		// 聚类
		clustering: true,
		// 热力图
		heatmap: true,
	},
	"measure_distance": {
		// 切换主题
		switch_theme: false,
		// 进入编辑模式
		enter_edit_mode: false,
		// 切换地图
		switch_map: true,
		// 搜索
		search: false,
		// 一键收起/展开
		collapse: true,
		// 2d/3d切换
		switch_2d_3d: false,
		// 放大缩小
		zoom: true,
		// 默认视角
		default_view: true,
		// 旋转
		rotate: true,
		// 地图巡航
		map_cruise: false,
		// 区域统计
		area_statistics: false,
		// 测距
		measure_distance: false,
		// 坐标拾取
		pick_coordinate: false,
		// 历史分布
		history_distribution: false,
		// 紧急撤离
		emergency_evacuation: false,
		// 聚类
		clustering: true,
		// 热力图
		heatmap: true,
	},

	initial: {
		// 切换主题
		switch_theme: true,
		// 进入编辑模式
		enter_edit_mode: true,
		// 切换地图
		switch_map: true,
		// 搜索
		search: true,
		// 一键收起/展开
		collapse: true,
		// 2d/3d切换
		switch_2d_3d: true,
		// 放大缩小
		zoom: true,
		// 默认视角
		default_view: true,
		// 旋转
		rotate: true,
		// 地图巡航
		map_cruise: true,
		// 区域统计
		area_statistics: true,
		// 测距
		measure_distance: true,
		// 坐标拾取
		pick_coordinate: true,
		// 历史分布
		history_distribution: true,
		// 紧急撤离
		emergency_evacuation: true,
		// 聚类
		clustering: true,
		// 热力图
		heatmap: true,
	},
};

const pool = ref(new Set<MutexMode>(["initial"]));
const config = ref(mutex_config["initial"]);
const modes = ref([...pool.value]);
export function useMutexConfig () {
	// vue 2 检测不到 Set 的变化
	function getModeConfigQueue() {
		return Array.from(pool.value).map((mode) => {
			return mutex_config[mode];
		});
	}

	function exit(mode: MutexMode) {
		pool.value.delete(mode);
		merge();
	}

	function enter(mode:MutexMode) {
		pool.value.add(mode);
		merge();
	}

	function has(mode: MutexMode) {
		return pool.value.has(mode);
	}

	function clear() {
		pool.value.clear();
		pool.value.add("initial");
		merge();
	}

	function mergeModeConfig(config_a: OperationConfig, config_b: OperationConfig) {
		const results: OperationConfig = cloneDeep(mutex_config["initial"]);
		const mergeStrategy = (key: MutexOperation) => {
			results[key] = config_a[key] && config_b[key];
		};
		for (const key in config_a) {
			mergeStrategy(key as MutexOperation);
		}
		return results;
	}

	function merge() {
		const mode_config_queue = getModeConfigQueue();
		config.value = mode_config_queue.reduce((merge_config, current) => {
			return mergeModeConfig(merge_config, current);
		}, cloneDeep(mutex_config["initial"]));
		modes.value = [...pool.value];
	}

	return {
		modes,
		config,
		enter,
		exit,
		has,
		clear,
	};
}
