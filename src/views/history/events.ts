import type {EventBusKey} from "@vueuse/core";

export const FOCUS_TAG: EventBusKey<number> = Symbol("focus-tag");

// 从其他页面跳转过来，区域已经删除
export const DELETED_AREA: EventBusKey<{name: string, id: number}> = Symbol("deleted-area");
