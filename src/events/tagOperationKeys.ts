import type {EventBusKey} from "@vueuse/core";

type tag_type = {
    card_id:number | number[]
}

// 定位
export const TAG_LOCATION_KEY: EventBusKey<any> = Symbol("tag location");

// 呼叫
export const TAG_CALL_KEY: EventBusKey<tag_type> = Symbol("tag call");

// 消息下发
export const TAG_PUSH_MESSAGE_KEY: EventBusKey<tag_type> = Symbol("tag push message");

// 撤离
export const TAG_EVACUATE_KEY: EventBusKey<tag_type> = Symbol("tag evacuate");

// 轨迹回放
export const TRACK_HISTORY_KEY: EventBusKey<tag_type> = Symbol("track history");

// 添加轨迹跟随
export const ADD_TRACK_FOLLOW_KEY: EventBusKey<tag_type> = Symbol("add track follow");

// 取消轨迹跟随
export const CANCEL_TRACK_FOLLOW_KEY: EventBusKey<tag_type> = Symbol("cancel track follow");

// 视频
export const VIDEO_TRACK_KEY: EventBusKey<tag_type> = Symbol("video track");

// 添加视角跟随
export const ADD_VIEW_FOLLOW_KEY: EventBusKey<any> = Symbol("add view follow");

// 取消视角跟随
export const CANCEL_VIEW_FOLLOW_KEY: EventBusKey<tag_type> = Symbol("cancel view follow");
