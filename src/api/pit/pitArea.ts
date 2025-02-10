import request from "@/utils/js/request";
import type {EHCommonResponse, TableResult} from "@/types/request";

export type PitArea = {
	id: number;
	area_id: number;
	area_name: string;
	type: number;
	is_use: number;
	floor_id: number;
	area: string;
	template_name: string;
	template_id: number;
	area_style: string;
	relative_start: number;
	relative_end: number;
	disappear_time: number;
};

export function getPitArea(data: {area_name?: string; floor_id: number;}) {
	return request<EHCommonResponse<TableResult<PitArea[]>>>({
		url: "/EHCommon/pit/pitArea/getPitArea",
		method: "post",
		data
	});
}

export function addPitArea(data:unknown) {
	return request<EHCommonResponse<{area_id: number, msg: string}>>({
		url: "/EHCommon/pit/pitArea/addPitArea",
		method: "post",
		data
	});
}

export function updatePitArea(data:unknown) {
	return request({
		url: "/EHCommon/pit/pitArea/updatePitArea",
		method: "post",
		data
	});
}

export function deletePitArea(data:{area_id: number}) {
	return request({
		url: "/EHCommon/pit/pitArea/deletePitArea",
		method: "post",
		data
	});
}
