import {MessageBox, Notification} from "element-ui";

import store from "@/store";

import {base_url} from "@/Config";

import {getDateTimeStr} from "./tools/time";

// 判断是否为全部
export function getIsAll(val) {
	if (val === "all") {
		return null;
	} else {
		return val;
	}
}

// 判断是否为空字符串
export function getIsEmpty(val) {
	if (val) {
		const v = val.replace(/(^\s*)|(\s*$)/g, "");
		if (v === "") {
			return null;
		} else {
			return v;
		}
	} else {
		return null;
	}
}

// 根据中英文获得字符串长度
export function getStringLength(string) {
	if (!string) {
		return 0;
	}
	let length = 0;
	for (let i = 0; i < string.length; i++) {
		const char = string.charCodeAt(i);
		if ((char >= 0x0001 && char <= 0x007e) || (0xff60 <= char && char <= 0xff9f)) {
			length++;
		} else {
			length += 1.8;
		}
	}
	return length;
}

// 根据中英文不同的长度，截取字符串
export function sliceStringByLength(string, length) {
	if (!string) {
		return "--";
	}

	let slice_string = "";
	let slice_string_length = 0;

	for (let i = 0; i < string.length; i++) {
		const char = string.charCodeAt(i);
		if ((char >= 0x0001 && char <= 0x007e) || (0xff60 <= char && char <= 0xff9f)) {
			slice_string_length++;
		} else {
			slice_string_length += 1.8;
		}
		slice_string += string[i];
		if (slice_string_length >= length) {
			return slice_string + "...";
		}
	}
	return slice_string;
}

// 判断对象是否是一个空对象
export function checkObjectIsEmpty(object) {
	for (const i in object) {
		if (object[i]) return false;
	}
	return true;
}

// 将整数，转换为十六进制的字符串
export function getHexStringFromIntLower(int) {
	return "0x" + parseInt(int).toString(16).toLowerCase();
}

// 点击下载功能
export function downloadStaticFile(url, file_name, cb, data, type, onProgressCb) {
	const xhr = new XMLHttpRequest();
	if (type === "file") {
		MessageBox.alert("数据导出中，请稍等~", "提示", {
			iconClass: "hg-icons hg-icon-export-file"
		});
	}
	xhr.onprogress = function (event) {
		onProgressCb && onProgressCb(event);
	};
	if (data) {
		xhr.withCredentials = true;
		xhr.open("post", url, true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.setRequestHeader("Authorization", store.getters.token);
		xhr.setRequestHeader("Accept-Language", store.getters.language);
	} else {
		xhr.open("get", url, true);
	}
	xhr.responseType = "blob";
	xhr.onload = function () {
		if (xhr.status === 200) {
			const url = window.URL.createObjectURL(xhr.response);
			const a = document.createElement("a");
			a.href = url;
			a.download = file_name;
			a.click();
			if (cb) cb();
			if (type === "file") MessageBox.close();
		} else if (xhr.status === 500) { // 导出文件操作失败
			const blob = xhr.response;
			const reader = new FileReader();
			reader.readAsText(blob, "utf-8");
			reader.onload = function () {
				try {
					const res = JSON.parse(reader.result);
					const {result} = res;
					Notification.warning({
						title: "提示",
						message: result
					});
					MessageBox.close();
				} catch (e) {
					Notification.warning({
						title: "提示",
						message: "导出操作失败"
					});
					MessageBox.close();
				}
			};
			reader.onerror = function() {
				Notification.warning({
					title: "提示",
					message: "导出操作失败"
				});
				MessageBox.close();
			};
		} else {
			if (type === "video") {
				Notification.warning({
					title: "提示",
					message: "下载失败，视频不存在"
				});
			}
		}
	};
	xhr.send(JSON.stringify(data));
}

// 获取部门树状结构
export function getTreeFromBranchData(res, has_icon_model_attr = false) {
	const arr = {};
	const r = [];
	const data = res.map((i) => {
		const obj = {
			label: i.is_delete ? `${i.branch_name}(已删除)` : i.branch_name,
			value: +i.id,
			show: false,
			pid: +i.pid,
			icon: i.branch_type,
			model_2d_url: i.model_2d_url,
			model_id: i.model_id,
			icon_id: i.icon_id,
			count: i.person_count
		};

		if (has_icon_model_attr) {
			obj["icon_model_attr"] = i.icon_model_attr;
		}

		if (i.pid !== -1) {
			obj.hasBtn = true;
			if (i.level < 5) {
				obj.hasAddBtn = true;
			} else {
				obj.hasAddBtn = false;
			}
		}
		return obj;
	});
	data.map((i) => {
		arr[i.value] = i;
	});
	data.map((i) => {
		if (arr[i.pid] && i.pid !== -1) {
			if (!arr[i.pid]["children"]) {
				arr[i.pid]["children"] = [];
			}
			arr[i.pid]["children"].push(i);
		} else {
			r.push(i);
		}
	});
	return r;
}

// 设置tab页外边距 用于有地图的tab页
export function setContentSize(is_map) {
	if (typeof is_map === "number") {
		if (document.querySelector(".el-tabs .el-tabs__header")) {
			document.querySelector(".el-tabs .el-tabs__header").setAttribute("style", `margin-bottom: ${is_map}px !important`);
		}
		return;
	}

	if (document.querySelector(".el-tabs .el-tabs__header")) {
		if (is_map) {
			document.querySelector(".el-tabs .el-tabs__header").setAttribute("style", "margin-bottom: 16px !important");
		} else {
			document.querySelector(".el-tabs .el-tabs__header").setAttribute("style", "margin-bottom: 24px !important");
		}
	}
	if (document.querySelector(".el-tabs__content")) {
		if (is_map) {
			document.querySelector(".el-tabs__content").style.height = "calc(100% - 47px)";
		} else {
			document.querySelector(".el-tabs__content").style.height = "calc(100% - 55px)";
		}
	}
}

/**
 * 清除过期的副作用函数，例如清除上次异步请求，避免产生数据的竞态问题
 * @param {Function} effect 副作用函数
 * @returns 包装 effect 后的函数，接受 effect 的参数，多了一个 onCleanup 参数，用于注册过期的回调；返回 effect 的返回值
 */
export function cleanupExpiredEffect(effect) {
	let cacheCleanupCallback;

	const onCleanup = (callback) => {
		cacheCleanupCallback?.();
		cacheCleanupCallback = typeof callback === "function" ? callback : undefined;
	};

	return function (...args) {
		return effect.apply(this, [onCleanup, ...args]);
	};
}

// rgb转16进制色
export function rgbToHex(rgb) {
	if (rgb.charAt(0) === "#") {
		return rgb;
	}
	const ds = rgb.split(/\D+/);
	const decimal = Number(ds[1]) * 65536 + Number(ds[2]) * 256 + Number(ds[3]);
	return "#" + zeroFillHex(decimal, 6);
}

function zeroFillHex(num, digits) {
	let s = num.toString(16);
	while (s.length < digits)
		s = "0" + s;
	return s;
}

// 提取rgba中的透明度
export function getAlphaFromRGBA(rgba) {
	const result = rgba.match(/rgba\((.+)\)/);
	if (result) {
		const colors = result[1].split(",");
		const alpha = parseFloat(colors[colors.length - 1]);
		return parseFloat(alpha);
	} else {
		return 1;
	}
}

/**
 *
 * @param {boolean | object} parent 二级页面
 * @param {string} tab_page tab页
 * @returns {boolean} 为真显示tab页，否则隐藏tab页
 */
export function hideTabPage(parent, tab_page) {
	if (typeof parent === "boolean") {
		return parent;
	}
	return parent[tab_page];
}

/**
 * 检查 websocket 加密狗
 * @param {Object} response_list ws 响应
 */
export function checkWSEncryption(response_list) {
	for (const response of Object.values(response_list)) {
		if (response.type === 103) {
			return true;
		}
	}
	return false;
}

export function filterNullishString(val) {
	return nullWrapper(val, undefined, () => null);
}

export function getApiFiled(val, nullish_list = [null, ""]) {
	if (nullish_list.includes(val)) {
		return undefined;
	}
	return val;
}

/**
 * @param {string|null|undefined} val 字符串
 * @param {Function} format_callback 格式化字符串回调函数
 * @param {Function} null_callback 指定为空时返回值
 */
export function nullWrapper(val, format_callback, null_callback) {
	if (val != null && val !== "") {
		if (typeof format_callback === "function") {
			return format_callback(val);
		}
		return val;
	}
	if (typeof null_callback === "function") {
		return null_callback(val);
	}
	return val;
}

/**
 * 如果是空字符串，返回'--'
 * @param {string} val 字符串
 */
export function wrapNullString(val) {
	return (val != null && val !== "") ? val : "--";
}
// 地图类型
export const FLOOR_TYPES = {
	FLOOR: "floor", // 楼层
	BUILD: "building", // 建筑
	SCENE: "scene", // 场景
};

// 格式化表格中所在地图列
export function formatMap(row, col, map) {
	return Array.isArray(map) ? map.filter(Boolean).join("-") : "--";
}

export function formatAreas(val = ["all"]) {
	const [area_group_id, area_id] = val;
	if (area_group_id === "all")
		return null;
	return {[area_group_id]: [area_id]};
}

export function errorLog(api, ...msg) {
	console.error(`request error[${api}]: `, ...msg);
}

export function getMapParam(id, type, floor_id_list = false) {
	switch (type) {
	case "all":
		return {};
	case "floor":
		return floor_id_list ? {floor_id_list: [id]} : {floor_id: id};
	case "building":
		return {building_id: id};
	case "scene":
		return {scene_id: id};
	}
}

const ALARM_TYPES_NAME = {
	2: "越界报警",
	4: "强拆报警",
	6: "求救报警",
	9: "消失",
	10: "聚集",
	11: "不动报警",
	12: "区域超时",
	13: "进入越界",
	14: "离开越界",
	15: "危险源",
	19: "陪同报警",
	20: "离群报警",
	21: "跌落报警",
	22: "基站报警",
	24: "心率报警",
	25: "区域超限",
	26: "区域超限",
	27: "工作超时",
	28: "井下超员",
	30: "超层越界",
	31: "车辆超载",
	32: "车辆超时",
	33: "车辆超速",
	34: "血压过高",
	35: "脱岗报警",
	36: "姿态异常",
	37: "事故报警"
};

export function getAlarmName(type) {
	return ALARM_TYPES_NAME[type] || "--";
}

export const MAX_CARD_ID = 2999999999;

export function assertExists(
	val,
	message = "val does not exist"
) {
	if (val === null || val === undefined) {
		if (message instanceof Error) {
			throw message;
		}
		throw new Error(message);
	}
}

function downloadImportErrorExcel(download_url) {
	const {date, time} = getDateTimeStr({});
	const file_name = "导入失败错误报告" + date + time + ".xlsx";
	downloadStaticFile(download_url, file_name);
}

export function showImportNotifyText(type, result) {
	if (type === 100 || type === 101 || type === 102) {
		Notification.error({
			title: "错误",
			message: result
		});
	}
	if (type === 1) {
		const {failed, new: new_count, overwrite} = result;
		if (failed === 0) {
			const msg = `批量导入成功，新增${new_count}条数据，覆盖${overwrite}条数据`;
			Notification.success({
				title: "成功",
				message: msg
			});
		} else {
			const msg = `批量导入完成，新增${new_count}条数据，覆盖${overwrite}条数据，失败${failed}条数据,失败原因详情见EXCEL下载“错误原因”列`;
			Notification.info({
				title: "提示",
				message: msg
			});
			const download_url = base_url + result.error_excel;
			downloadImportErrorExcel(download_url);
		}
		return true;
	}
}
