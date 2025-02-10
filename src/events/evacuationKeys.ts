import type {EventBusKey} from "@vueuse/core";
export type WsResponse<T> = {type: number, result: T}
// 撤离全部
export const EVACUATE_ALL_KEY: EventBusKey<{}> = Symbol("evacuate-all");

// 关闭紧急撤离
export const EVACUATE_CLOSE_KEY: EventBusKey<{}> = Symbol("evacuate-close");

// 更新撤离区域
export const EVACUATE_UPDATE_AREA_KEY: EventBusKey<{resp: WsResponse<unknown>}> = Symbol("evacuate-update");

// 更新撤离进度
export const EVACUATE_UPDATE_PROGRESS_KEY: EventBusKey<{resp: WsResponse<unknown>}> = Symbol("evacuate-progress");
