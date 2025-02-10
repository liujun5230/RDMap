import axios from "axios";
import {MessageBox} from "element-ui";

import {base_url} from "@/Config";
import locationJump from "@/utils/js/locationHref";
import store from "@/store";

const request = axios.create({
	baseURL: base_url,
	withCredentials: true,
});

request.interceptors.request.use(
	config => {
		const token = store.getters.token;
		config.headers["Accept-Language"] = store.getters.language;
		if (token) {
			config.headers["Authorization"] = token;
		}
		const {pathname, hash} = window.location;
		config.headers["From"] = ["/", "/index"].includes(pathname) ? "/#/" : `${pathname}${hash}`.replace(/\?.*/, "");
		return config;
	},
	error => {
		return Promise.reject(error);
	}
);

request.interceptors.response.use(
	response => {
		const {type} = response.data;
		const api = response.config.url.split("/").at(-1);

		if (type === 0) {
			handleInvalidToken();
			// 避免各个接口调用时会在type不为1时触发notify弹窗
			response = {
				message: "Calling interfaces requires authorization",
				result: {},
				type: 1
			};
		} else if (type === 103 && api !== "login") {
			return Promise.reject();
		} else if (type !== 1) {
			console.error("接口返回错误", response.config.url, response.data);
		}
		return response;
	},
	error => {
		return Promise.reject(error);
	}
);

export const handleInvalidToken = () => {
	const is_home_page = window.location.pathname === "/";
	const style = is_home_page ? {
		customClass: "fk-index-message-box",
		cancelButtonClass: "fk-index-button",
		confirmButtonClass: "fk-index-button",
	} : {};
	MessageBox.confirm("长时间未操作，需要重新登录", "登录失效", {
		confirmButtonText: "重新登录",
		showCancelButton: false,
		closeOnClickModal: false,
		...style,
		type: "warning"
	}).then(() => {
		store.dispatch("user/logout").then(() => {
			locationJump("/login");
		});
	});
};

export default request;
