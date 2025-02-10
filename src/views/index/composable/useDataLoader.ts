import {ref} from "vue";

type DataLoadStatus = "loading" | "success" | "error";

const status = ref<DataLoadStatus>("loading");

export function useDataLoader(tasks: Promise<unknown>[]) {
	status.value = "loading";
	Promise.all(tasks)
		.then(() => {
			status.value = "success";
		})
		.catch(() => {
			status.value = "error";
		});
	return {
		status,
	};
}
