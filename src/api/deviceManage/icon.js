import request from "@/utils/js/request";

export function getDefaultIcon() {
	return request({
		url: "EHCommon/device_manager/icon/getDefaultIcon",
		method: "get",
	});
}
