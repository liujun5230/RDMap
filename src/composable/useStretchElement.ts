import {ref, watch, unref} from "vue";
import {useEventListener} from "@vueuse/core";
import type {MaybeRef} from "@vueuse/core";

interface useStretchElementOptions {
    trigger_el: HTMLElement | null | undefined,
    bubble?: boolean,
    capture?: boolean,
	stretchable?: MaybeRef<boolean>,
    stretchCallback?: (move_x: number, move_y: number) => void
}

const THRESHOLD_SIZE = {
	min_width: 184,
	min_height: 128,
	max_width: Infinity,
	max_height: Infinity,
} as const;
export function minMaxWidth(val: number) {
	return Math.min(Math.max(val, THRESHOLD_SIZE.min_width), THRESHOLD_SIZE.max_width);
}
export function minMaxHeight(val: number) {
	return Math.min(Math.max(val, THRESHOLD_SIZE.min_height), THRESHOLD_SIZE.max_height);
}

export function useStretchElement(target_el: HTMLElement, options?: useStretchElementOptions) {
	const {
		trigger_el,
		bubble = true,
		capture = false,
		stretchable = true,
		stretchCallback
	} = options ?? {};
	const width = ref(0);
	const height = ref(0);
	let real_stretchable = stretchable;
	let offMove = () => {};
	let offUp = () => {};

	watch(() => unref(stretchable), (new_value) => {
		real_stretchable = new_value;
	});

	useEventListener(trigger_el, "pointerdown", (event) => {
		if (!target_el || !trigger_el || !real_stretchable) return;
		offMove();
		offUp();
		const {clientX, clientY} = event;
		const {clientWidth, clientHeight} = target_el;
		width.value = minMaxWidth(clientWidth);
		height.value = minMaxHeight(clientHeight);
		let pressed_delta = {x: clientX, y: clientY};
		if (!bubble) event.stopPropagation();

		offMove = useEventListener(document, "pointermove", (event) => {
			const {clientX, clientY} = event;
			const change_x = clientX - pressed_delta.x;
			const change_y = clientY - pressed_delta.y;
			pressed_delta = {x: clientX, y: clientY};
			const real_width = minMaxWidth(width.value + change_x);
			const real_height = minMaxHeight(height.value + change_y);
			if (width.value !== real_width || height.value !== real_height) {
				width.value = real_width;
				height.value = real_height;
				stretchCallback?.(width.value, height.value);
			}
		});

		offUp = useEventListener(document, "pointerup", () => {
			offMove();
			offUp();
		});
	}, {
		capture
	});

	return {
		width,
		height
	};
}
