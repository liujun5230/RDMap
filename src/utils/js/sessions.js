import {
	session_storage_user_info_key,
	session_storage_app_state_key,
	disk_usage_alarm_last_time_key,
	disk_ratio_alarm_key,
	index_map_options_last_time_key,
	feature_flags_key
} from "@/Config";

export function setUserInfoSessions(data) {
	return localStorage.setItem(session_storage_user_info_key, JSON.stringify(data));
}

export function getUserInfoSessions() {
	return JSON.parse(localStorage.getItem(session_storage_user_info_key)) || {auth: {}, menu: [], username: "admin"};
}

export function removeUserInfoSessions() {
	return localStorage.removeItem(session_storage_user_info_key);
}

export function setAPPStateSessions(data) {
	return localStorage.setItem(session_storage_app_state_key, JSON.stringify(data));
}

export function getAPPStateSessions() {
	return JSON.parse(localStorage.getItem(session_storage_app_state_key));
}

export function removeAPPStateSessions() {
	return localStorage.removeItem(session_storage_app_state_key);
}

export function getDiskCheckTime() {
	const time_stamp = localStorage.getItem(disk_usage_alarm_last_time_key);
	return time_stamp ? +time_stamp : 0;
}

export function setDiskCheckTime(time_stamp) {
	localStorage.setItem(disk_usage_alarm_last_time_key, +time_stamp);
}

export function setDiskUsageRatioState(state) {
	localStorage.setItem(disk_ratio_alarm_key, state);
}

export function getDiskUsageRatioState() {
	return +localStorage.getItem(disk_ratio_alarm_key);
}

/**
 *
 * @param {Array<string>} options
 */
export function setLastMapSetting(options) {
	localStorage.setItem(index_map_options_last_time_key, JSON.stringify(options));
}

/**
 *
 * @returns {Array<string>}
 */
export function getLastMapSetting() {
	return JSON.parse(localStorage.getItem(index_map_options_last_time_key));
}

/**
 *
 * @returns {object}
 */
export function getFeatureFlags() {
	const feature_flags = localStorage.getItem(feature_flags_key);
	return feature_flags ? JSON.parse(feature_flags) : null;
}

/**
 *
 * @param {object} feature
 */
export function setFeatureFlags(feature) {
	localStorage.setItem(feature_flags_key, JSON.stringify(feature));
}
