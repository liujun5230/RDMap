import FkMessageBox from "@/components/ForThink/FkMessageBox";
import {Notification} from "element-ui";
interface BrowserInfo {
    vendor: string;
    version: string;
    chrome_kernel_version: string;
	system: string;
	system_version: string;
}

type BrowserCompatibleInfo = {
	is_compatible: false;
	expected_browser: "360" | "chrome";
	reason: string;
	info: string;
} | {
	is_compatible: true
	expected_browser: null
}

/**
 * 检测是否为360浏览器
 */
async function is360Browser(ua: string) {
	if (ua.indexOf("qihu") > -1 || ua.indexOf("360ee") > -1 || ua.indexOf("360se") > -1) {
		return true;
	}

	const navigator_top = window.navigator as any;
	if (navigator_top.mimeTypes?.length > 20) {
		return true;
	}

	try {
		return new Promise(function(resolve) {
			fetch("chrome-extension://fjbbmgamncjadhlpmffehlmmkdnkiadk/css/content.css")
				.then(function() {
					resolve(true);
				})
				.catch(function() {
					resolve(false);
				});
		});
	} catch (error) {
		return Promise.resolve(false);
	}
}

const ua = navigator.userAgent;

function getSystemVersion() {
	const win_version = ua.match(/Windows NT (\d+\.\d+)/i);
	return {
		is_windows: win_version?.[0].startsWith("Windows"),
		system: win_version?.[0] || "",
		version: win_version?.[1] || ""
	};
}

export function less(version1: string, version2: string) {
	const v1 = version1.split(".")?.map(Number)?.[0] || 0;
	const v2 = version2.split(".")?.map(Number)?.[0] || 0;
	return v1 < v2;
}

export async function getBrowserMeta(): Promise<BrowserInfo> {
	let vendor = "";
	let version = "";
	const chrome_kernel_version = ua.match(/chrome\/([\d.]+)/i)?.[1] || "";

	// 检测是否为360浏览器
	if (await is360Browser(ua)) {
		vendor = "360";
		const matchChrome = ua.match(/chrome\/([\d.]+)/i);
		const matchWebkit = ua.match(/webkit\/([\d.]+)/i);
		version = matchChrome?.[1] || matchWebkit?.[1] || "";
	} else {
		const browser_info = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
		vendor = browser_info[1]?.toLowerCase() || "";
		version = browser_info[2] || "";

		if (/trident/i.test(vendor)) {
			vendor = "msie";
		}
	}

	const system_info = getSystemVersion();

	return {
		vendor,
		// 内核版本
		chrome_kernel_version,
		version,
		system: system_info.system,
		system_version: system_info.version
	};
}

export const BROWSER_CHROME_PATH = "/browser/chrome.exe";
export const BROWSER_360_PATH = "/browser/360.exe";

async function debugInfo() {
	const compatible_info = await getBrowserCompatibleInfo();
	console.debug(compatible_info);

	const browser_meta = await getBrowserMeta();
	console.debug(browser_meta);
}

export async function getBrowserCompatibleInfo(): Promise<BrowserCompatibleInfo> {
	const {vendor, chrome_kernel_version, system_version} = await getBrowserMeta();
	const is_win7_or_below = less(system_version, "6.1") || (!less(system_version, "6.1") && !less("6.1", system_version));
	const is_third_browser = vendor !== "chrome" && vendor !== "360";
	const is_not_chrome_kernel = !chrome_kernel_version;

	if (chrome_kernel_version && !less(chrome_kernel_version, "117")) {
		return {
			is_compatible: true,
			expected_browser: null
		};
	}

	if (is_not_chrome_kernel) {
		return {
			is_compatible: false,
			reason: "浏览器内核版本不兼容",
			info: "建议使用 360 浏览器",
			expected_browser: "360"
		};
	}

	if (is_win7_or_below) {
		return {
			is_compatible: false,
			reason: "系统版本低于等于 win7",
			info: "建议使用360浏览器 chrome 内核",
			expected_browser: "360"
		};
	}

	if (is_third_browser) {
		return {
			is_compatible: false,
			reason: "第三方浏览器",
			info: "建议使用 360 (内核117版本及以上) 浏览器",
			expected_browser: "360"
		};
	}

	return {
		is_compatible: false,
		reason: "浏览器版本不兼容",
		info: "建议使用 chrome (内核117版本及以上) 浏览器",
		expected_browser: "chrome"
	};
}

/**
 * 获取浏览器下载地址
 */
export async function getBrowserDownloadUrl(): Promise<string | null> {
	const compatible_info = await getBrowserCompatibleInfo();

	if (compatible_info.expected_browser === "360") {
		return BROWSER_360_PATH;
	}

	if (compatible_info.expected_browser === "chrome") {
		return BROWSER_CHROME_PATH;
	}

	return null;
}

export const LAST_CHECK_TIME_KEY = "last_browser_check_timestamp";
export const CHECK_INTERVAL = 1000 * 60 * 60 * 24;
/**
 * 显示浏览器警告
 */
export async function showBrowserWarning(style: DialogStyle) {
	const last_check_time = localStorage.getItem(LAST_CHECK_TIME_KEY);
	const current_time = Date.now();

	const threshold = 10;

	if (last_check_time && (current_time - Number(last_check_time)) - CHECK_INTERVAL < threshold) {
		return;
	}
	return style === "index" ? FkMessageBox.confirm(
		"警告",
		"浏览器版本不兼容",
		"浏览器不兼容会导致部分功能无法使用。<br /> 建议使用谷歌浏览器117版本及以上，或360最新版本浏览器。",
		{
			title: "警告",
			confirmButtonText: "点击下载最新版本浏览器",
			cancelButtonText: "继续访问",
			showCancelButton: true,
			closeOnClickModal: false,
			type: "warning",
			dangerouslyUseHTMLString: true,
			customClass: "fk-index-message-box",
			confirmButtonClass: "fk-index-button",
			cancelButtonClass: "fk-index-button",
		}
	).then((action) => {
		if (action === "confirm") {
			downloadBrowser();
		}
	}).catch(() => {})
		: FkMessageBox.confirm(
			"警告",
			"浏览器版本不兼容",
			"浏览器不兼容会导致部分功能无法使用。<br /> 建议使用谷歌浏览器117版本及以上，或360最新版本浏览器。",
			{
				title: "警告",
				confirmButtonText: "点击下载最新版本浏览器",
				cancelButtonText: "继续访问",
				showCancelButton: true,
				closeOnClickModal: false,
				type: "warning",
				dangerouslyUseHTMLString: true
			}
		);
}

export async function downloadBrowser() {
	try {
		const download_url = await getBrowserDownloadUrl();
		if (!download_url) {
			Notification.error({
				title: "错误",
				message: "浏览器下载地址获取失败"
			});
			return;
		}

		const response = await fetch(download_url, {method: "HEAD"});
		if (!response.ok) {
			Notification.error({
				title: "错误",
				message: "浏览器安装包不存在或无法访问"
			});
			return;
		}

		const link = document.createElement("a");
		link.href = download_url;
		link.click();
	} catch (error) {
		Notification.error({
			title: "错误",
			message: "下载浏览器失败：" + (error as Error).message
		});
	}
}

// 首页/后台
type DialogStyle = "index" | "admin";

/**
 * 开始浏览器检查
 */
export async function startBrowserCheck(style: DialogStyle = "index") {
	debugInfo();
	const compatible_info = await getBrowserCompatibleInfo();
	if (!compatible_info.is_compatible) {
		const last_check_time = localStorage.getItem(LAST_CHECK_TIME_KEY);
		const current_time = Date.now();

		const duration = CHECK_INTERVAL - (current_time - Number(last_check_time));
		const timer = setTimeout(async () => {
			await showBrowserWarning(style);
			localStorage.setItem(LAST_CHECK_TIME_KEY, current_time.toString());
		}, duration);
		return () => {
			clearTimeout(timer);
		};
	}
}

