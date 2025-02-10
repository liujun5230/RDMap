import type {EventBusKey} from "@vueuse/core";

export const OPEN_POINT_DRAWER_KEY: EventBusKey<{ id: number }> = Symbol("open-point-drawer");
export const OPEN_ROUTE_DRAWER_KEY: EventBusKey<{ id: number }> = Symbol("open-route-drawer");
export const CLOSE_DRAWER_KEY: EventBusKey = Symbol("close-drawer");
