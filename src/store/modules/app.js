import {default_app_state} from "@/Config";
import {getAPPStateSessions, setAPPStateSessions} from "@/utils/js/sessions";
import {getConfig} from "@/api/configuration/sysConfig";
import {getSystemInfo} from "@/api/configuration/configuration";

const state = getAPPStateSessions() || default_app_state;

const mutations = {
	TOGGLE_SIDEBAR: state => {
		state.sidebar.open = !state.sidebar.open;
		setAPPStateSessions(state);
	},

	CHANGE_PAGE: (state, {url, sub_menu_index}) => {
		state.sidebar.active = url;
		if (sub_menu_index) {
			state.sidebar.opened_submenu = [sub_menu_index];
		} else {
			state.sidebar.opened_submenu = [];
		}
		setAPPStateSessions(state);
	},

	CHANGE_LANGUAGE: (state, {language}) => {
		state.language = language;
		setAPPStateSessions(state);
	},

	CHANGE_SYSTEM_INFO: (state, {name, version, custom_version, http_api_version, logo_display_mode}) => {
		state.name = name;
		state.version = version;
		state.custom_version = custom_version;
		state.http_api_version = http_api_version;
		state.logo_display_mode = logo_display_mode;
		setAPPStateSessions(state);
	},
	CHANGE_MAP_COLOR: (state, {kml_color, engine_bg_color}) => {
		state.kml_color = kml_color;
		state.engine_bg_color = engine_bg_color;
		setAPPStateSessions(state);
	},
};

const actions = {
	getSystemInfo({commit}) {
		return new Promise((resolve, reject) => {
			getSystemInfo().then(response => {
				const {result, type} = response.data;
				if (type === 1) {
					commit("CHANGE_SYSTEM_INFO", {
						name: result.name,
						version: result.version,
						custom_version: result.custom_version,
						http_api_version: result.http_api_version,
						logo_display_mode: result.logo_display_mode
					});
					resolve(result);
				}
			}).catch(error => {
				reject(error);
			});
		});
	},
	getKmlMapInfo({commit}) {
		return new Promise((resolve, reject) => {
			getConfig().then(response => {
				const {result, type} = response.data;
				if (type === 1) {
					const kml_color_switch = result.find(i => i.name === "KML_LINE_COLOR_CONFIGURATION_SWITCH")?.value;
					let kml_color = result.find(i => i.name === "KML_LINE_COLOR").value;
					const engine_bg_color = result.find(i => i.name === "ENGINE_BACKGROUND_COLOR").value;
					kml_color = kml_color_switch === "0" ? "#333" : kml_color;
					commit("CHANGE_MAP_COLOR", {kml_color, engine_bg_color});
					resolve(result);
				}
			}).catch(error => {
				reject(error);
			});
		});
	},
	toggleSideBar({commit}) {
		commit("TOGGLE_SIDEBAR");
	},
	changePage({commit}, {url, sub_menu_index}) {
		commit("CHANGE_PAGE", {url, sub_menu_index});
	},
	changeLanguage({commit}, {language}) {
		commit("CHANGE_LANGUAGE", {language});
	}
};

export default {
	namespaced: true,
	state,
	mutations,
	actions
};
