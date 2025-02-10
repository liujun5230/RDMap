// 检查必传参数(array -- 为数组)，如果有为空的，抛出异常
export function checkRequiredParameters(array) {
	for (const i in array) {
		if (!array[i]) {
			throw new Error("请输入必传值");
		}
	}
	return true;
}
