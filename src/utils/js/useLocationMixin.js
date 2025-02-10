import {ref} from "vue";

/**
 * 判断是否展示导航栏
 * 功能同 locationMixin.js 一样，这是一个使用 composition api 的 hook
 */
export const useLocationMixin = () => {
	const href = window.location.href;
	const show_head = ref(!href.includes("withoutHead"));
	return show_head;
};
