import {defineStore} from "pinia";
import {computed} from "vue";

import {useThemeStore} from "@index/store/useThemeStore";
import type {Module} from "@/api/configuration/homeTheme";

export const useModulesStore = defineStore("module", () => {
	const theme_store = useThemeStore();
	const modules = computed(() => theme_store.modules);

	function getModuleById(id: number) {
		return modules.value.find((item) => item.id === id);
	}

	function updateModule(module_data: Module) {
		const module_index = modules.value.findIndex((item) => item.id === module_data.id);
		if (module_index > -1) {
			modules.value.splice(module_index, 1, module_data);
		}
	}

	function addModule(module: Module) {
		modules.value.push(module);
	}

	function removeModule(module_id: number) {
		const module_index = modules.value.findIndex((item) => item.id === module_id);
		if (module_index > -1) {
			modules.value.splice(module_index, 1);
		}
	}

	const exist_module = computed(() => {
		return modules.value.length > 0;
	});
	return {
		modules,
		exist_module,

		getModuleById,
		updateModule,
		addModule,
		removeModule,
	};
});
