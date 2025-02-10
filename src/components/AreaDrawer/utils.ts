import locationJump from "@/utils/js/locationHref";

import {AreaTypes} from "./constant";
import type {DrawerFrom} from "./types";
import * as localforage from "localforage";

export class FormStorage {
	private store: ReturnType<typeof localforage.createInstance>;

	constructor() {
		this.store = localforage.createInstance({
			name: "formStorage",
			storeName: "formStorage",
			driver: localforage.INDEXEDDB
		});
	}

	async setItem(key: string, value: any): Promise<void> {
		await this.store.setItem(key, value);
	}

	async getItem<T>(key: string): Promise<T | null> {
		return await this.store.getItem<T>(key);
	}

	async removeItem(key: string): Promise<void> {
		await this.store.removeItem(key);
	}

	async clear(): Promise<void> {
		await this.store.clear();
	}

	async length(): Promise<number> {
		return await this.store.length();
	}
}

export function isCurrentPage(route: string) {
	let hash = window.location.hash;
	const index = hash.indexOf("?");
	if (index !== -1) {
		hash = hash.substring(0, index);
	}
	const route_name = window.location.pathname + hash;
	return route_name === route;
}

export type AreaPayload =
| {
	action: "add",
}
| {
	action: "view",
	from: DrawerFrom;
	id: number;
	// 如果没有传递floor_id, 则默认为第一张有效地图
	floor_id: number;

	// 如果抽屉已经被编辑了需要保存下来
	cache_form?: unknown
}

const page: Partial<Record<AreaTypes, string>> = {
	// 电子围栏设置
	[AreaTypes.ATTENDANCE_AREA]: "/attendance#/group?active_name=area_setting",
	[AreaTypes.VIRTUAL_FENCE]: "/gpsManage#/regionalManagement",
	// 上下井区域
	[AreaTypes.UP_DOWN_PIT]: "/upDownPit#/area",
	[AreaTypes.CALL]: "/call#/setting"
};

export function jumpToMapPage(url: string) {
	const url_with_params = new URL(window.location.origin + url);
	url_with_params.searchParams.set("time", Date.now().toString());
	locationJump(url_with_params.toString(), true);
}

export class AreaDrawerOpener {
	private storage = new FormStorage();
	constructor(private page_key: AreaTypes) {}

	private getKey() {
		return this.page_key + "openDrawer";
	}

	async saveParams(params: AreaPayload) {
		await this.storage.setItem(this.getKey(), params);
		return this;
	}

	async resolveParams() {
		const data = await this.storage.getItem(this.getKey());
		if (!data)
			return null;
		return data as AreaPayload;
	}

	async removeParams() {
		this.storage.removeItem(this.getKey());
		return this;
	}

	async openDrawer() {
		const page_url = page[this.page_key];
		if (!page_url)
			return;

		const params = await this.resolveParams();
		if (!params)
			return;

		jumpToMapPage(page_url);
	}
}

/**
 * 存储抽屉参数并跳转到地图页面
 * @param page_key
 * @param params
 * @returns
 */
export async function openDrawer(page_key: AreaTypes, params: AreaPayload) {
	const opener = new AreaDrawerOpener(page_key);
	const payload: AreaPayload = {
		...params,
	};

	return (await opener
		.saveParams(payload))
		.openDrawer();
}

/**
 * 地图页面获取缓存的抽屉参数
 * @param page_key
 * @returns
 */
export async function retriveDrawer(page_key: AreaTypes) {
	const opener = new AreaDrawerOpener(page_key);
	const params = await opener.resolveParams();
	opener.removeParams();
	return params;
}

export function formatRuleType(id: number, rule_types: {id: number, name: string, alias: string}[] = []) {
	const rule_type = rule_types.find(item => item.id === id);
	return rule_type?.alias ?? rule_type?.name ?? "";
}
