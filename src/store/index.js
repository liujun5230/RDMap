import Vue from "vue";
import Vuex from "vuex";

import app from "./modules/app";
import archive from "./modules/archive";
import dict from "./modules/dict";
import feature from "./modules/featureFlags";
import monitor from "./modules/monitor";
import user from "./modules/user";
import getters from "./getters";

Vue.use(Vuex);

const store = new Vuex.Store({
	modules: {
		app,
		user,
		feature,
		dict,
		monitor,
		archive
	},
	getters
});

// 一个浏览器同时开两个标签页，修改了一个标签页，同步另一个标签页主题样式
const watchTheme = () => {
	// 如果是首页，则不加主题样式类
	if (window.location.pathname === "/" || window.location.pathname === "/index") return;
	store.watch((state) => state.user.user_info?.theme, (new_theme) => {
		try {
			window.document.body.className = new_theme || "custom-theme-blue";
		} catch (error) {
			console.error("watchTheme error: ", error);
		}
	});
};

watchTheme();

export default store;

// 保持命名一致性以及方便之后迁移
export function useStore() {
	return store;
}

export function useAuthStore() {
	return store.getters.auth;
}

export function useFeatureFlags() {
	return store.getters.flags;
}
