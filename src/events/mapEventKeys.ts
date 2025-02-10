import type {EventBusKey} from "@vueuse/core";
import type {CheckedFloor, SelectedElement, Dimension} from "@/types/map";

// 缩放
export const ZOOM_OUT_KEY: EventBusKey<{}> = Symbol("zoom out");
export const ZOOM_IN_KEY: EventBusKey<{}> = Symbol("zoom in");

// 默认视角
export const DEFAULT_VIEW_KEY: EventBusKey<{}> = Symbol("default view");

// 切换地图2D/3D
export const SWITCH_MAP_KEY: EventBusKey<{next_display_type: Dimension}> = Symbol("switch map");

// 旋转
export const ROTATE_KEY: EventBusKey<{is_reset: boolean}> = Symbol("rotate");

// 测距
export const MEASURE_DISTANCE_KEY: EventBusKey<{}> = Symbol("measure distance");

// 结束测距
export const END_MEASURE_DISTANCE_KEY: EventBusKey<{}> = Symbol("end measure distance");

// 坐标拾取
export const PICK_COORDINATE_KEY: EventBusKey<{}> = Symbol("pick coordinate");

// 退出坐标拾取
export const END_PICK_COORDINATE_KEY: EventBusKey<{}> = Symbol("end pick coordinate");

// 地图巡航
export const MAP_CRUISE_KEY: EventBusKey<{}> = Symbol("map cruise");

// 退出地图巡航
export const END_MAP_CRUISE_KEY: EventBusKey<{}> = Symbol("end map cruise");

// 区域统计
export const AREA_STATISTICS_KEY: EventBusKey<{}> = Symbol("area statistics");

// 退出区域统计
export const END_AREA_STATISTICS_KEY: EventBusKey<{}> = Symbol("end area statistics");

// 地图显示设置变化
export const SETTING_CHANGE_KEY: EventBusKey<{}> = Symbol("setting change");

// 开启热力图
export const START_HEATMAP: EventBusKey<{}> = Symbol("start heatmap");

// 关闭热力图
export const STOP_HEATMAP: EventBusKey<{}> = Symbol("stop heatmap");

// 开启聚类
export const START_CLUSTER: EventBusKey<{}> = Symbol("start cluster");

// 关闭聚类
export const STOP_CLUSTER: EventBusKey<{}> = Symbol("stop cluster");

// 选择楼层
export const SELECT_FLOOR_KEY: EventBusKey<CheckedFloor> = Symbol("select floor");

// 调整间距
export const ADJUST_DISTANCE_KEY: EventBusKey<{}> = Symbol("adjust distance");

// 更新楼层索引
export const UPDATE_FLOOR_INDEX_KEY: EventBusKey<{id: number}> = Symbol("update floor index");
/**
 * 切换楼层
 * TODO: 命名优化 switch map 和 change map 容易混肴
 */
export const CHANGE_MAP_KEY: EventBusKey<CheckedFloor> = Symbol("change map");

export const SELECT_ELEMENT_KEY: EventBusKey<{element: SelectedElement, options: {is_open_dialog: boolean}}> = Symbol("selected element");
export const COLLAPSE_SEARCH_PANEL_KEY: EventBusKey<{}> = Symbol("collapse search panel");

// 如果地图加载完成，触发该事件，display_type为当前地图维度
export const MAP_LOAD_FINISH: EventBusKey<{ display_type: Dimension}> = Symbol("map load finish");

// 清除轨迹跟随的轨迹
export const CLEAR_TRACK_KEY: EventBusKey<{card_id_list : number | number[]}> = Symbol("clear track");

export interface MapLocationEventParams {
    change_map: boolean,
    map_params?: {
        id: number,
        type: "floor" | "building",
        display_type: number
    }
}
// 定位楼层和建筑
export const MAP_LOCATION_KEY: EventBusKey<MapLocationEventParams> = Symbol("map-location-key");

// 历史分布时间确定
export const CONFIRM_HISTORY_TIME: EventBusKey<string> = Symbol("confirm-history-time");

// 后台更新区域
export const UPDATE_AREA: EventBusKey<{}> = Symbol("update-area");

// 后台更新部门
export const UPDATE_BRANCH: EventBusKey<{}> = Symbol("update-branch");

// 后台更新承包商单位
export const UPDATE_CONTRACTOR: EventBusKey<{}> = Symbol("update-contractor");

// 全局报警触发首页跳转
export const ALARM_JUMP_INDEX: EventBusKey<{}> = Symbol("alarm-jump-index");

// 设备更新
export const DEVICE_REFRESH: EventBusKey<{}> = Symbol("device-refresh");
