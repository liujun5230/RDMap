import Vue from "vue";

Vue.directive("preventRepeatClick", {
	inserted: (el) => {
		el.onclick = () => {
			if (!el.disabled) {
				el.disabled = true;
				setTimeout(() => {
					el.disabled = false;
				}, 1000);
			}
		};
	}
});
