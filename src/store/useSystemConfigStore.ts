import {defineStore} from "pinia";

import {getSysConfig} from "@/api/history/history";
import type {SystemConfig} from "@/api/configuration/sysConfig";
import {useAsyncState} from "@vueuse/core";

export const useSystemConfigStore = defineStore("systemConfig", () => {
	const {execute: fetch, isLoading, error, state: data, then} = useAsyncState(async () => {
		const resp = await getSysConfig();
		const {type, result} = resp.data;

		if (type === 1) {
			return result as SystemConfig[];
		}

		throw new Error("获取系统配置失败");
	}, []);

	const getSystemConfig = (name: string) => {
		const config = data.value
			.find((item) => item.name === name);

		if (config != null) {
			return config?.value;
		}

		return null;
	};

	const getBooleanValue = (name: string, v?: boolean) => {
		const value = getSystemConfig(name);

		if (v !== undefined && value == null) {
			return v;
		}

		return Boolean(Number(value));
	};

	const getNumberValue = (name: string, v?: number) => {
		const value = getSystemConfig(name);
		if (v !== undefined && value == null) {
			return v;
		}

		return Number(value);
	};

	return {
		data,
		getSystemConfig,
		fetch,
		getBooleanValue,
		getNumberValue,
		isLoading,
		error,
		then
	};
});
