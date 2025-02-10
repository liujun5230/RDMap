import {getFeatureFlags as getFeatureFlagsFromApi} from "@/api/featureFlags/featureFlags";
import {getFeatureFlags as getFeatureFlagsFromStorage, setFeatureFlags} from "@/utils/js/sessions";
import {INDUSTRY_TEXT} from "@/textconfig/industry";

let cache;

async function getFeatureFlags(flush = false) {
	let feature_flags;
	try {
		cache = getFeatureFlagsFromStorage();
		if (!flush && cache)
			return cache;

		const response = await getFeatureFlagsFromApi();
		feature_flags = response.data.result;
		setFeatureFlags(cache = feature_flags);
	} catch (e) {
		console.warn("获取配置文件内容错误", e);
		setFeatureFlags(cache = "");
	}
	return feature_flags;
}

const state = {
	feature_flags: {},
	customText: () => {},
	loading: true
};

/**
 * 自动根据行业版本切换对应的文案
 * @param {string} module 模块名
 * @returns 指定行业和模块的文案
 */
export function resolveCustomText(text_key) {
	const flags = state.feature_flags;
	const {is_access} = flags ?? {};
	return INDUSTRY_TEXT[is_access ? "general" : "mine"][text_key];
}

const mutations = {
	setFeatureFlags(state, feature_flags) {
		state.feature_flags = feature_flags;
		state.customText = resolveCustomText;
		state.loading = true;
	}
};

const actions = {
	async getFeatureFlags({commit}, flush = false) {
		const feature_flags = await getFeatureFlags(flush);
		commit("setFeatureFlags", feature_flags);
		return feature_flags;
	}
};

export default {
	namespaced: true,
	state,
	mutations,
	actions,
};
