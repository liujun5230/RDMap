import store from "@/store/index";

export default function (target, is_open = false, clear_open_window = true) {
	const currentUrl = window.location.href;
	let addSymbol = "&";
	if (!target.includes("?")) addSymbol = "?";
	const href = `${target}${currentUrl.includes("withoutHead") ? (addSymbol + "withoutHead") : ""}`;
	if (is_open) {
		const open_window = window.open(href);
		clear_open_window && (open_window.opener = null);
	} else {
		window.location.href = `${target}${currentUrl.includes("withoutHead") ? (addSymbol + "withoutHead") : ""}`;
	}
}

/**
 * 判断要跳转的URL是否有效
 */
function isValid(url, valid_urls) {
	return valid_urls.find(item => {
		if (item !== "/") {
			if (url === "/deviceManage#/chargeDischargeRecord" || url === "/deviceManage#/serverStatusDetection") {
				return valid_urls.includes("/deviceManage#/status");
			}
			return url.startsWith(item);
		}
	});
}

/**
 * 如果传入的url无效，返回能够跳转的地址
 * @param {string} url
 * @returns valid_url
 */
export function getValidUrl(url) {
	const menu = store.state.user.user_info.menu;
	const valid_urls = menu.reduce((result, item) => {
		result.push(...getUrl(item));
		return result;
	}, []);
	if (url === "/") return url;
	if (isValid(url, valid_urls)) {
		return url;
	}
	return valid_urls[0];
}

function getUrl(node, urls = []) {
	const {access_url, children} = node;
	if (children) {
		for (const child of children) {
			getUrl(child, urls);
		}
	} else {
		urls.push(access_url);
	}
	return urls;
}

export function getBaseHashPath() {
	if (location.pathname === "/") {
		return "/";
	}
	return `${location.pathname}${location.hash.split("?")[0]}`;
}
