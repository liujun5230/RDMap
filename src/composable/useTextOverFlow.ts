import {onMounted, unref, watch, ref} from "vue";
import {tryOnBeforeUnmount, type MaybeRef} from "@vueuse/core";

function checkTextOverflow(target: HTMLElement) {
	if (target) {
		return target.scrollWidth > target.clientWidth;
	}
	return false;
}

export function useTextOverflow(target: MaybeRef<HTMLElement | undefined>) {
	const is_over_flow = ref(false);
	const target_ref = ref(target);

	const checkOverflow = () => {
		const element = unref(target_ref);
		if (element) {
			is_over_flow.value = checkTextOverflow(element);
		}
	};

	onMounted(() => {
		checkOverflow();
	});

	watch(target_ref, () => {
		if (target_ref.value) {
			target_ref.value.addEventListener("mouseover", checkOverflow);
			checkOverflow();
		}
	});

	tryOnBeforeUnmount(() => {
		if (target_ref.value) {
			target_ref.value.removeEventListener("mouseover", checkOverflow);
		}
	});

	return {
		is_over_flow,
	};
}

