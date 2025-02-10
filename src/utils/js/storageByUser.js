import {set} from "lodash-es";
import {onBeforeUnmount, toRef, watch} from "vue";

import {useStore} from "@/store/index";

import {assertExists} from "./common";

const store = useStore();
/**
 * 获取用户标识 用户名-用户id
 * @returns {string} 用户标识
 */
function getUserId() {
	const user = store.getters.user_info ?? {};
	const {username: user_name, user_id} = user;
	return user_name + "-" + user_id;
}

// 获取当前页面
function getPage() {
	const url = new URL(window.location.href);
	return [url.pathname, url.hash?.split?.("?")?.[0]].join("");
}

/**
 * 根据用户存储数据
 */
export class UserStorage {
	constructor(user, storage) {
		assertExists(storage, "storage does not exist");
		assertExists(user, "current user does not exist");
		this.storage = storage;
		this.user = user;
	}

	#getTree() {
		const tree = this.storage.getItem(this.user);
		if (tree) {
			return JSON.parse(tree);
		}
		return null;
	}

	/**
   * 获取默认值
   * @param {string} key 键
	 * @returns {null | unknown} 值
   */
	getItem(key) {
		const page = getPage();
		const tree = this.#getTree();
		return tree?.[page]?.[key] ?? null;
	}

	/**
   * 设置默认值
   * @param {string} key 键
   * @param {unknown} value 值
   */
	setItem(key, value) {
		const page = getPage();
		const tree = this.#getTree() ?? {};
		set(tree, [page, key], value);
		this.storage.setItem(this.user, JSON.stringify(tree));
	}

	/**
   * 响应式设置默认值
   * @param {string} key 键
   * @param {unknown} value 值
   */
	setItemReactive(key, value) {
		const _value = toRef(value);
		const cleanup = watch(_value, (new_val) => {
			this.setItem(key, new_val);
		});

		onBeforeUnmount(() => {
			cleanup();
		});
		return cleanup;
	}
}

export function useUserStorage(storage = window.localStorage) {
	const user_identify = getUserId();
	return new UserStorage(user_identify, storage);
}
