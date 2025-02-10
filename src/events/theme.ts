import type {EventBusKey} from "@vueuse/core";

// 切换主题
export const SWITCH_THEME_KEY: EventBusKey<{theme_id: number}> = Symbol("switch theme key");

// 主题数据加载完成
export const THEME_DATA_LOAD_FINISH_KEY: EventBusKey<void> = Symbol("theme data load finish key");
