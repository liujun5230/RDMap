import {defineStore} from "pinia";
import {ref} from "vue";

export const useGlobalStore = defineStore("global-store", () => {
	const is_edit = ref(false);
	const is_emergency = ref(false);
	function toggleEdit() {
		is_edit.value = !is_edit.value;
	}

	return {
		is_edit,
		is_emergency,
		toggleEdit
	};
});
