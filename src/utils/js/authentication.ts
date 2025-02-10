import {computed} from "vue";
import type VueRouter from "vue-router";
import {Notification} from "element-ui";

import {AreaType} from "@/types/global";
import store from "@/store";
import locationJump from "@/utils/js/locationHref";
import {getValidUrl, getBaseHashPath} from "@/utils/js/locationHref";
import {isInitializeSys, logout} from "@/api/admin/user";

// 检查系统是否进行过初始化配置，#14319
const checkIsInit = async () => {
	const {data: res} = await isInitializeSys().catch(() => ({data: undefined}));
	if (res?.type === 1) {
		const is_init_system = !!res.result;
		if (is_init_system) return true;
		// 退出恒迹云用户
		logout();
		// 退出sso用户，同时清空 storage 数据
		store.dispatch("user/logout");
		return Promise.reject();
	}
	return Promise.reject();
};

const authentication = (router: VueRouter) => {
	router.beforeEach(async (to, from, next) => {
		if (to.query.token) {
			store.dispatch("user/setToken", to.query.token);
		}
		Promise.all([
			checkIsInit(),
			store.dispatch("user/getUserInfo"),
			store.dispatch("feature/getFeatureFlags", true)
		])
			.then(async ([, res]) => {
				// 判断是否是免登录和存在token
				if (res.authentication || store.getters.token) {
					const current_url = getBaseHashPath();
					const valid_url = getValidUrl(current_url);
					if (valid_url !== current_url) {
						console.log("valid url", valid_url, current_url);
						store.dispatch("app/changePage", {
							url: valid_url,
							sub_menu_index: valid_url.split("#")[0]
						});
						locationJump(valid_url);
					} else {
						next();
					}
				} else {
					locationJump("/login.html");
				}
			}).catch(() => {
				locationJump("/login.html");
			});
	});
};

export default authentication;

const AUTH_MAP = {
	/** 没有任何操作权限  */
	no_permission: 0,
	/** 仅查看 */
	only_check: 1,
	/** 查看+操作  */
	check_and_operation: 2,
	/** 查看+删除 */
	check_and_del: 3,
	/** 查看+操作+删除 */
	all: 4
} as const;

/**
 * 页面权限
 * @param page_url 页面路由
 */
export const usePageAuth = (page_url?: string) => computed(() => {
	const auth = store.getters.auth;
	const {no_permission, only_check, check_and_operation, check_and_del, all} = AUTH_MAP;
	const {pathname, hash} = window.location;
	const cur_url = ["/", "/index"].includes(pathname) ? "/" : `${pathname}${hash}`.replace(/\?.*/, "");
	const real_page_url = page_url || cur_url;
	return {
		// 无权限
		no_permission: Boolean(!auth || auth[real_page_url] === no_permission || auth[real_page_url] === undefined),
		// 查看权限
		check: Boolean(auth && (auth[real_page_url] === only_check || auth[real_page_url] === check_and_operation || auth[real_page_url] === check_and_del || auth[real_page_url] === all)),
		// 操作权限
		handle: Boolean(auth && (auth[real_page_url] === check_and_operation || auth[real_page_url] === all)),
		// 删除权限
		delete: Boolean(auth && (auth[real_page_url] === check_and_del || auth[real_page_url] === all)),
		// 查看、操作、删除所有权限
		all: Boolean(auth && auth[real_page_url] === all)
	};
});

type ArchiveType = "person" | "visitor" | "truck" | "material" | "rule" | "call_plans" | "device" | AreaType
const archive_auth_url = {
	person: "/company#/person",
	visitor: "/visitor#/visitor",
	truck: "/truck#/info",
	material: "/material#/material",
	rule: "/gpsManage#/rule",
	call_plans: "/call#/setting",
	device: "/deviceManage#/setting",
	[AreaType.VIRTUAL_FENCE]: "/gpsManage#/regionalManagement",
	[AreaType.ATTENDANCE]: "/attendance#/group",
	[AreaType.CALL]: "/call#/setting",
	[AreaType.UP_DOWN_PIT_FIRST]: "/upDownPit#/area",
	[AreaType.UP_DOWN_PIT_SECOND]: "/upDownPit#/area",
	[AreaType.CAMERA]: "/video#/camera",
	[AreaType.PATROL_POINT]: "/patrol#/setting",
	[AreaType.OBSTACLE]: "/systemManage#/systemConfig",
	[AreaType.ACTIVITY]: "/systemManage#/systemConfig",
	[AreaType.BLIND]: "/systemManage#/systemConfig"
} as const;

/**
 * 打开系统所有档案弹窗的权限判断，该方法已有notification
 */
export const checkArchiveAuth = (type: ArchiveType) => {
	const page_url = archive_auth_url[type];
	const auth = usePageAuth(page_url);
	if (auth.value.no_permission) {
		Notification.error({title: "错误", message: "无权限查看"});
		return false;
	}
	return true;
};

/**
 * 系统跳转其他页面的权限检查
 */
export const checkJumpPagePermission = (page_url?: string) => {
	const auth = usePageAuth(page_url);
	if (auth.value.no_permission) {
		Notification.error({title: "错误", message: "暂无此页面权限"});
		return false;
	}
	return true;
};
