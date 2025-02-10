import type {ObjectDirective} from "vue";
import {useEventListener} from "@vueuse/core";

interface Position {
    x: number,
    y: number
}

// 需要使用者添加拖拽样式 cursor: move
// 需要使用者添加可拖拽元素 user-select: none 样式
export const getDragDirectiveOptions = (): ObjectDirective => {
	const pressed_delta_map = new WeakMap<HTMLElement, Position>();

	let startStop = () => {};
	let moveStop = () => {};
	let endStop = () => {};
	let disabled_drag = false;

	return {
		inserted(el, binding) {
			const {trigger = undefined, disabled = false} = binding.value || {};
			let target_drag: HTMLElement;
			disabled_drag = disabled;

			if (el.className.includes("el-dialog__wrapper")) {
				target_drag = el.firstElementChild;
			} else if (el.className.includes("el-drawer__wrapper")) {
				target_drag = el.querySelector(".el-drawer");
			} else {
				target_drag = el;
			}
			if (!target_drag) return;

			startStop = useEventListener(target_drag, "pointerdown", (event) => {
				if (disabled_drag) return;
				// 避免指令使用者没有添加 user-select: none 样式，导致无法销毁事件
				moveStop();
				endStop();
				const target_drag = event.currentTarget! as HTMLElement;
				// 指定触发拖拽的元素
				const trigger_drag_el: HTMLElement | null = target_drag.querySelector(trigger);
				// 判断是否在指定的触发元素上开始拖拽
				if (trigger_drag_el && !trigger_drag_el.contains(event.target! as HTMLElement)) return;

				const {clientX: client_x, clientY: client_y} = event;
				const {left, top} = target_drag.getBoundingClientRect();
				pressed_delta_map.set(el, {
					x: client_x - left,
					y: client_y - top
				});

				moveStop = useEventListener(document, "pointermove", (event) => {
					const pressed_delta = pressed_delta_map.get(el);
					if (!pressed_delta) return;

					const {clientX: client_x, clientY: client_y} = event;
					const x = client_x - pressed_delta.x;
					const y = client_y - pressed_delta.y;

					// 边界碰撞检测
					if (x > 0 && x <= window.innerWidth - target_drag.clientWidth) {
						target_drag.style.right = "";
						target_drag.style.left = `${x}px`;
						target_drag.dataset.left = `${x}px`;
					}

					if (y > 0 && y <= window.innerHeight - target_drag.clientHeight) {
						target_drag.style.bottom = "";
						target_drag.style.top = `${y}px`;
						target_drag.dataset.top = `${y}px`;
					}
				});

				endStop = useEventListener(document, "pointerup", () => {
					pressed_delta_map.delete(el);
					moveStop();
					endStop();
				});
			});
		},
		componentUpdated(el, binding) {
			const {disabled = false} = binding.value || {};
			disabled_drag = disabled;
		},
		unbind(el) {
			pressed_delta_map.delete(el);
			startStop();
			moveStop();
			endStop();
		}
	};
};
