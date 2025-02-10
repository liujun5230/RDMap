import request from "@/utils/js/request";

export const getGpsCardHistory = data => {
	return request({
		url: "/EHCommon/history/gpsHistory/getCardHistory",
		method: "post",
		data
	});
};

export const getGpsCardHistoryRequest = () => {
	const controller = new AbortController();
	const getGpsCardHistory = (data) => request({
		url: "/EHCommon/history/gpsHistory/getCardHistory",
		method: "post",
		data,
		signal: controller.signal
	});

	const abortGetGpsCardHistory = () => controller.abort();

	return {
		getGpsCardHistory,
		abortGetGpsCardHistory
	};
};
