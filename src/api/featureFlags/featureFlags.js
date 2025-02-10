import request from "@/utils/js/request";

export function getFeatureFlags() {
	return request({
		url: "/EHCommon/configuration/configuration/getPageConfig",
		method: "post",
	});
}
