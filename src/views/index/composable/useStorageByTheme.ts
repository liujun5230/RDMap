import {ref, computed, watch, watchEffect} from "vue";

import {useStore} from "@/store";
import {useThemeStore} from "@index/store/useThemeStore";
import {cloneDeep, debounce, isEmpty} from "lodash-es";
import {z} from "zod";
import {getAccount, setAccount} from "@/api/configuration/homeTheme";
import {useEventBus, useLocalStorage} from "@vueuse/core";
import {THEME_DATA_LOAD_FINISH_KEY} from "@/events/theme";
export const MAP_SETTING_KEY = "map_setting";
export const MODULES_KEY = "modules";
export const SINGLE_POSITION_DETAIL_KEY = "single-position-setting";
export const GLOBAL_THEME_KEY = 99999;

const content_item = z.object({
	theme_id: z.number(),
	map_setting_json: z.string(),
	modules: z.string()
});

const content = z.array(content_item);

type ContentItem = z.infer<typeof content_item>;

type ParsedResult = {
	theme_id: number;
	map_setting: Record<string, any>;
	modules: Record<string, any>;
}
/**
 * 获取用户标识 用户名-用户id
 * @returns {string} 用户标识
 */
function getUserId() {
	const user = useStore().getters.user_info ?? {};
	const {username: user_name, user_id} = user;
	return user_name + "-" + user_id;
}

const THEME_KEY_PREFIX = "theme_storage";

export function useLocalThemeStorage<T>(key: string, initial_value: T) {
	const theme_store = useThemeStore();
	const user_id = getUserId();
	const storage = computed(() => {
		const theme_key = `${user_id}_${THEME_KEY_PREFIX}_${theme_store.current_theme_id}`;
		const _storage = useLocalStorage<{
			[key:string]: any
		}>(theme_key, {});
		return _storage;
	});

	watchEffect(() => {
		if (storage.value.value[key] == null) {
			storage.value.value[key] = initial_value;
		}
	});

	return computed({
		get: () => storage.value.value[key] as T,
		set: (value: T) => {
			storage.value.value[key] = value;
		}
	});
}

export const server_store = ref<ParsedResult[]>();

const deserialize = (v: any) => {
	if (typeof v === "string") {
		try {
			return JSON.parse(v);
		} catch (e) {
			return {};
		}
	}
};

const serialize = (v: unknown) => typeof v === "string" ? v : JSON.stringify(v);

async function fetchAccountStore() {
	const resp = await getAccount();
	if (resp.data.type === 1) {
		const validate_result = content.safeParse(resp.data.result);
		if (validate_result.success) {
			server_store.value = validate_result.data.map(item => {
				return {
					theme_id: item.theme_id,
					map_setting: deserialize(item.map_setting_json),
					modules: deserialize(item.modules)
				};
			});
		} else {
			console.error("fetch account store error: ", validate_result.error.errors);
		}
	}
}

const setAccountStore = debounce(async (data: ContentItem) => {
	await setAccount(data);
}, 500);

type KEY = string;

export function useStorageByTheme<T extends object>(key: KEY, default_value: T) {
	const {emit: emitThemeDataLoadFinish} = useEventBus(THEME_DATA_LOAD_FINISH_KEY);
	const theme_store = useThemeStore();
	const storage = ref(cloneDeep(default_value));
	const current_theme_id = computed(() => {
		return key === SINGLE_POSITION_DETAIL_KEY
			? GLOBAL_THEME_KEY
			: theme_store.current_theme_id;
	});
	const getAccountThemeConfig = () => {
		return server_store.value?.find(item => item.theme_id === current_theme_id.value);
	};

	watch(() => current_theme_id.value, () => {
		fetchAccountStore();
	});

	watch(() => [server_store.value, current_theme_id.value], () => {
		const theme_config = getAccountThemeConfig() ?? {
			theme_id: current_theme_id.value,
			map_setting: null,
			modules: null,
		};

		if (key === MAP_SETTING_KEY) {
			theme_config.map_setting ?? default_value as T;
			if (!theme_config.map_setting || isEmpty(theme_config.map_setting)) {
				theme_config.map_setting = cloneDeep(default_value);
			} else {
				storage.value = theme_config.map_setting;
			}
			emitThemeDataLoadFinish();
		} else {
			storage.value = theme_config?.modules?.[key] ?? default_value as T;
		}
	}, {immediate: true});

	watch(() => storage.value, (value) => {
		const theme_config = getAccountThemeConfig() ?? {
			theme_id: current_theme_id.value,
			map_setting: {},
			modules: {},
		};

		if (key === MAP_SETTING_KEY) {
			theme_config.map_setting = value as T;
		} else {
			theme_config.modules[key] = value as T;
		}

		const new_store = {
			theme_id: current_theme_id.value,
			map_setting_json: serialize(theme_config.map_setting),
			modules: serialize(theme_config.modules)
		};

		setAccountStore(new_store);
	}, {deep: true});

	return storage;
}

fetchAccountStore();
