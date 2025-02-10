import store from "@/store";

export function prerequest(router, initial_prerequests = []) {
	const prerequests = new Set(initial_prerequests);
	router.beforeEach((to, from, next) => {
		for (const prerequest of prerequests) {
			prerequest();
		}
		return next();
	});

	/**
   * 添加前置请求
   * @param {Function} request_api
   */
	const addPreRequest = (request_api) => {
		if (typeof request_api !== "function") {
			console.error("[addPreRequest]: request_api必须是函数");
			return;
		}
		prerequests.add(request_api);
	};
	/**
	 * !!! 这里是全局的页面初次加载时需要请求的一些接口!!!
	 */
	addPreRequest(() => {
		store.dispatch("dict/setPersonDict");
		store.dispatch("dict/setMaterialDict");
		store.dispatch("dict/setVisitorDict");
		store.dispatch("dict/setCarDict");
		store.dispatch("dict/setContractorUnitDict");
		store.dispatch("dict/setContractorDict");
	});

	return {
		addPreRequest
	};
}
