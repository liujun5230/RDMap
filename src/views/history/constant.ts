import {UTYPES} from "@/utils/js/constant";

export const SEARCH_KEY_LABEL_MAP = {
	person_name: {
		label: "员工姓名",
		key: "person_name"
	},
	visitor_name: {
		label: "访客姓名",
		key: "visitor_name"
	},
	contractor_name: {
		label: "承包商姓名",
		key: "contractor_name"
	},
	licence: {
		label: "车牌号",
		key: "licence"
	},
	serial_num: {
		label: "物资编号",
		key: "serial_num"
	},
	card_id: {
		label: "卡号",
		key: "card_id"
	}
} as const;

export enum Dimensions {
	TWO = 0,
	THREE = 1
}

// 地图显示设置中定位对象基础字段中名称对应的key
export const UTYPE_NAME_KEY_MAP = {
	[UTYPES.PERSON]: "name",
	[UTYPES.VISITOR]: "name",
	[UTYPES.MATERIAL]: "name",
	[UTYPES.CAR]: "licence",
	[UTYPES.CONTRACTOR]: "name"
} as const;

export const enum FeatureType {
	TAG = "label_card",
	PERSON = "person",
	VISITOR = "visitor",
	CAR = "car",
	MATERIAL = "material",
	CONTRACTOR = "contractor",
	BASE_STATION = "station",
	PATROL_POINT = "patrol_point"
}

export const enum REPLAY_WAY {
	/** 分楼层回放 */
	floor = 0,
	/** 一张图回放 */
	all = 1
}

export const SPEED_MENU = {
	trajectory: () => [
		{label: "32", value: 31.25},
		{label: "16", value: 62.5},
		{label: "8", value: 125},
		{label: "4", value: 250},
		{label: "2", value: 500},
		{label: "1", value: 1000},
		{label: "0.5", value: 2000}
	],
	video: () => [
		{label: "4", value: 250},
		{label: "2", value: 500},
		{label: "1", value: 1000},
		{label: "0.5", value: 2000}
	]
};
