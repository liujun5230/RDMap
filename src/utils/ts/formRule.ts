
export const checkUrlRule = async (checkUrl:Function, param:{}, callback:Function) => {
	try {
		const res = await checkUrl(param);
		if (res?.data?.type === 1) {
			const {check, msg} = res.data.result;
			if (check) {
				return callback();
			}
			return callback(new Error(msg));
		} else {
			return callback(new Error("接口请求错误"));
		}
	} catch (e) {
		return callback(new Error("接口请求错误"));
	}
};
