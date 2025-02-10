import {Notification} from "element-ui";
import {cloneDeep, isEqual} from "lodash-es";
import {defineStore} from "pinia";
import {computed, ref, unref} from "vue";

import {assertExists} from "@/utils/ts/common";
import {getHomeTheme, getSystemName, operateThemes} from "@/api/configuration/homeTheme";
import {getNumericId} from "@index/utils/idGenerator";
import {notify} from "@index/utils/tool";
import {SWITCH_THEME_KEY} from "@/events";
import {useEventBus, useLocalStorage} from "@vueuse/core";
import type {System} from "@/api/configuration/homeTheme";
import {delAccount} from "@/api/configuration/homeTheme";

const theme_key = "theme_id_key";
export const useThemeStore = defineStore("theme-store", () => {
	const {emit: emitSwitchTheme} = useEventBus(SWITCH_THEME_KEY);

	// 主题
	const system = ref<System>({
		system_name: "",
		themes: []
	});

	const raw_system = ref<System>({
		system_name: "",
		themes: []
	});

	const current_theme_id = useLocalStorage(theme_key, 1);
	const system_name = computed(() => {
		return system.value?.system_name;
	});
	const themes = computed(() => {
		return system.value?.themes;
	});

	// 当前主题
	const current_theme = computed(() => {
		return themes.value?.find((theme) => theme.id === current_theme_id.value);
	});

	// 当前主题的所有模块
	const modules = computed(() => {
		const modules = current_theme.value?.module ?? [];
		modules.forEach((module) => {
			(module.options ?? []).sort((a, b) => a.sorting - b.sorting);
		});
		return modules;
	});

	// 是否可以添加主题
	const can_add_theme = computed(() => {
		if (themes.value) {
			return themes.value.length < 5;
		}
		return false;
	});

	// 标记是否有修改
	const dirty_flag = computed(() => {
		return !isEqual(system.value, raw_system.value);
	});

	/**
   * 获取所有主题
   */
	async function fetchSystemData () {
		const tasks = await Promise.all([getHomeTheme(), getSystemName()]);
		if (tasks.every((task) => task.data.type === 1)) {
			const [resp1, resp2] = tasks;
			const themes = resp1.data.result.sort((a, b) => a.sorting - b.sorting);
			const system_name = resp2.data.result;

			system.value = {
				system_name,
				themes
			};

			if (!themes.find((theme) => theme.id === current_theme_id.value))
				current_theme_id.value = themes[0].id;

			snapshot();
		} else {
			Notification.error({
				title: "获取主题失败",
				message: tasks[0].data.message || tasks[1].data.message
			});
		}
		return tasks;
	}

	function updateSystemName (system_name: string) {
		assertExists(system.value, "未获取到系统数据");
		if (system_name) {
			system.value.system_name = system_name;
			return;
		}
		throw new Error("系统名称不能为空");
	}

	async function deleteTheme (theme_id: number) {
		assertExists(system.value, "未获取到系统数据");
		const _themes = unref(themes);
		assertExists(_themes);
		const theme = _themes.find((theme) => theme.id === theme_id);

		// 删除本账号对应主题数据
		delAccount({id: theme_id});

		if (theme) {
			const index = _themes.indexOf(theme);
			_themes.splice(index, 1);
			system.value.themes = _themes;
			// 更新主题
			const next_theme_id = _themes[0].id;
			switchTheme(next_theme_id);
		}
	}
	/**
   * 切换当前主题id
   * @param theme_id 目标主题id
   */
	async function switchTheme (theme_id: number) {
		current_theme_id.value = theme_id;
		emitSwitchTheme({theme_id});
	}

	// 更新主题标题
	function updateThemeTitle (theme_id: number, title: string) {
		assertExists(themes.value);
		const theme = themes.value.find((theme) => theme.id === theme_id);
		if (theme) {
			theme.name = title;
		}
	}

	function isExistsTitle(theme_id: number | null, title: string) {
		assertExists(themes.value);
		return themes.value.some((theme) => theme.id !== theme_id && theme.name === title);
	}

	function diff (old_system: System, new_system: System) {
		const old_themes = old_system.themes;
		const new_themes = new_system.themes;

		const edit = [];
		const add = [];
		const remove = [];

		// 1. 找出编辑的主题
		for (const new_theme of new_themes) {
			const old_theme = old_themes.find((theme) => theme.id === new_theme.id);
			if (old_theme) {
				if (!isEqual(old_theme, new_theme)) {
					edit.push(new_theme);
				}
			} else {
				add.push(new_theme);
			}
		}

		// 2. 找出删除的主题
		for (const old_theme of old_themes) {
			const new_theme = new_themes.find((theme) => theme.id === old_theme.id);
			if (!new_theme) {
				remove.push(old_theme);
			}
		}

		return {
			edit,
			add,
			remove
		};
	}

	async function save () {
		assertExists(system.value, "未获取到系统数据");
		const {edit, add, remove} = diff(raw_system.value, system.value);

		const params = {
			system_name: system.value.system_name,
			edit,
			add,
			delete: remove
		};

		console.log("commit changes", params);
		try {
			const resp = await operateThemes(params);
			notify(resp, {
				success_desc: "主题保存成功",
				success_title: "保存成功",
				error_title: "保存失败"
			});
		} finally {
			await fetchSystemData();
		}
	}

	window.addEventListener("beforeunload", function (e) {
		if (dirty_flag.value) {
			e.preventDefault();
			e.returnValue = "";
		}
	});

	function updateThemeOrder () {
		assertExists(system.value);
		console.debug("updateThemeOrder");
		system.value.themes.forEach((theme, index) => {
			theme.sorting = index + 1;
		});
	}

	function getThemeById (id: number) {
		assertExists(themes.value, `主题不存在: ${id}`);
		return themes.value.find((theme) => theme.id === id);
	}

	function addTheme (name: string) {
		assertExists(themes.value, "主题不存在");
		if (themes.value.some((theme) => theme.name === name)) {
			Notification.error({
				title: "添加主题失败",
				message: "主题名称已存在"
			});
			return;
		}

		if (can_add_theme.value) {
			assertExists(system.value, "未获取到系统数据");
			const theme = {
				id: +getNumericId(),
				name,
				sorting: themes.value.length,
				is_system: 0,
				module: []
			};
			system.value.themes.push(theme);
			return theme;
		}
		throw new Error("主题数量已达上限");
	}

	function restore () {
		system.value = cloneDeep(raw_system.value);
		if (current_theme.value == null) {
			current_theme_id.value = themes.value[0].id;
		}
	}

	function snapshot () {
		raw_system.value = cloneDeep(system.value);
	}
	return {
		system,
		current_theme,
		can_add_theme,
		dirty_flag,
		system_name,
		themes,
		modules,
		current_theme_id,

		updateThemeTitle,
		switchTheme,
		fetchSystemData,
		deleteTheme,
		updateSystemName,
		save,
		updateThemeOrder,
		getThemeById,
		addTheme,
		restore,
		isExistsTitle
	};
});
