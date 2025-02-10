import {getUserInfoSessions, setUserInfoSessions, removeUserInfoSessions} from "@/utils/js/sessions";
import {getUserInfo, logout} from "@/api/admin/user";

const state = {
	user_info: {
		...getUserInfoSessions()
	},
	token: localStorage.getItem("token"),
	sso_token: localStorage.getItem("sso_token"),
	player: false,
	video_download: false,
	config_page_is_edit: false,
	authKey: {
		NoPermission: 0, // 没有任何操作权限
		OnlyCheck: 1, // 仅查看
		CheckAndOperation: 2, // 查看+操作
		CheckAndDel: 3, // 查看+删除
		All: 4, // 查看+操作+删除
	}
};

const mutations = {
	SET_SESSIONS: (state, sessions) => {
		state.user_info = sessions;
	},

	SET_TOKEN: (state, {token}) => {
		state.token = token;
	},
	SET_SSO_TOKEN: (state, {sso_token}) => {
		state.sso_token = sso_token;
	},
	CHANGE_PLAYER: (state, player) => {
		state.player = player;
	},
	CHANGE_VIDEO_DOWNLOAD: (state, video_download) => {
		state.video_download = video_download;
	},
	CHANGE_CONFIG_PAGE_STATUS: (state, config_status) => {
		state.config_page_is_edit = config_status;
	}
};

const actions = {
	changePlayer({commit}, player) {
		commit("CHANGE_PLAYER", player);
	},
	changeVideoDownload({commit}, video_download) {
		commit("CHANGE_VIDEO_DOWNLOAD", video_download);
	},
	changeConfigPageStatus({commit}, config_status) {
		commit("CHANGE_CONFIG_PAGE_STATUS", config_status);
	},
	getUserInfo({commit}, theme) {
		return new Promise((resolve, reject) => {
			getUserInfo().then(response => {
				const {type, result} = response.data;
				if (type === 1) {
					sortMenu(result.menu);
					if (theme) {
						result.theme = theme;
					} else if (result.authentication && state.user_info.theme) {
						result.theme = state.user_info.theme;
					}
					commit("SET_SESSIONS", result);
					setUserInfoSessions(result);
				}
				resolve(result);
			}).catch(error => {
				reject(error);
			});
		});
	},
	logout({commit}) {
		return new Promise((resolve, reject) => {
			logout({
				ssoToken: state.sso_token
			}).then((res) => {
				if (res.data.type === 1 || (res.data.type === 100 && !state.sso_token)) {
					commit("SET_SESSIONS", null);
					removeUserInfoSessions();
					commit("SET_TOKEN", {token: null});
					commit("SET_SSO_TOKEN", {sso_token: null});
					localStorage.removeItem("token");
					localStorage.removeItem("sso_token");
					resolve();
				}
			}).catch(error => {
				reject(error);
			});
		});
	},
	setToken({commit}, token) {
		return new Promise((resolve) => {
			commit("SET_TOKEN", {token: token});
			localStorage.setItem("token", token);
			resolve();
		});
	},
	setSSOToken({commit}, sso_token) {
		return new Promise((resolve) => {
			commit("SET_SSO_TOKEN", {sso_token: sso_token});
			localStorage.setItem("sso_token", sso_token);
			resolve();
		});
	},
};

function sortMenu(menu) {
	for (const i in menu) {
		menu[i].children && menu[i].children.sort((a, b) => {
			return a.sorting - b.sorting;
		});
	}
	return menu.sort((a, b) => {
		return a.sorting - b.sorting;
	});
}

export default {
	namespaced: true,
	state,
	mutations,
	actions
};
