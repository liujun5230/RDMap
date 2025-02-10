import {useLocalStorage, type MaybeRefOrGetter} from "@vueuse/core";
import {useStore} from "@/store";

/**
 * 获取用户标识 用户名-用户id
 * @returns {string} 用户标识
 */
function getUserId() {
	const user = useStore().getters.user_info ?? {};
	const {username: user_name, user_id} = user;
	return user_name + "-" + user_id;
}

/**
 * 用户本地存储
 * @param {string} key 键
 * @param {unknown} initial_value 初始值
 */
export function useUserStorage<T>(key: string, initial_value: MaybeRefOrGetter<T>) {
	const prefix = `account-${getUserId()}-${key}`;
	return useLocalStorage(prefix, initial_value);
}
