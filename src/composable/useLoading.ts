import {ref, computed} from "vue";

export function useLoading() {
	const _loading = ref(false);
	const loading = computed(() => _loading.value);

	const startLoading = () => {
		_loading.value = true;
	};

	const endLoading = () => {
		setTimeout(() => {
			_loading.value = false;
		}, 300);
	};

	return {
		loading,
		startLoading,
		endLoading
	};
}

export function useTimeoutLoading(time_threshold: number = 300) {
	let loading_id: ReturnType<typeof setTimeout> | undefined = undefined;

	const loading = ref(false);

	const endLoading = () => {
		if (loading_id) {
			clearTimeout(loading_id);
			loading_id = undefined;
			loading.value = false;
		}
	};
	const startLoading = () => {
		if (loading_id) {
			endLoading();
		}

		loading_id = setTimeout(() => {
			loading.value = true;
		}, time_threshold);
	};
	return {
		startLoading,
		endLoading,
		loading
	};
}
