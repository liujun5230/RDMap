export const poll_interval: number = 4000;
// 紧急撤离接口轮询时间
export const EVA_POLL_INTERVAL = 1000;
export const max_table_data_count: number = 300;

// 历史分布的搜索storage字段
export const HISTORY_QUERY_FIELD = "history-query-field";

// 聚集告警的topic
export const enum GATHER_TOPIC {
    GATHER_START = "/gather/a_to_web/start",
    GATHER_END = "/gather/a_to_web/end",
    GATHER_MERGE_START = "/gather/merge_to_web/start",
    GATHER_MERGE_END = "/gather/merge_to_web/end",
}
export const GATHER_TOPICS = [
	GATHER_TOPIC.GATHER_START,
	GATHER_TOPIC.GATHER_END,
	GATHER_TOPIC.GATHER_MERGE_START,
	GATHER_TOPIC.GATHER_MERGE_END,
];

export const GATHER_STYLE_MAP = {
	"a": {
		scope_style: {
			background_color: "#F3453A4D",
			border_color: "#F3453A80",
			hover_border_color: "#00FFFE",
			hover_border_width: 2,
		},

		label_style: {
			background_color: "#492A28",
			border_color: "#FF584E",
			color: "#FF584E",

			hover_background_color: "#FF584E",
			hover_border_color: "#FF584E",
			hover_border_width: 1,
			hover_color: "#FFF",

			click_background_color: "#FF584E",
			click_border_color: "#00fffe",
			click_border_width: 1,
			click_color: "#FFF",
		},
	},
	"b": {
		scope_style: {
			background_color: "#FE7A014D",
			border_color: "#FE7A0180",
			hover_border_color: "#00FFFE",
			hover_border_width: 2,
		},

		label_style: {
			background_color: "#493828",
			border_color: "#FE7A01",
			color: "#FE7A01",

			hover_background_color: "#FE7A01",
			hover_border_color: "#FE7A01",
			hover_color: "#FFF",
			hover_border_width: 1,

			click_background_color: "#FE7A01",
			click_border_color: "#00fffe",
			click_border_width: 1,
			click_color: "#FFF",
		}
	},

	"c": {
		scope_style: {
			background_color: "#E7A7004D",
			border_color: "#E7A70080",
			hover_border_color: "#00FFFE",
			hover_border_width: 2,
		},

		label_style: {
			background_color: "#494028",
			border_color: "#E7A700",
			color: "#E7A700",

			hover_background_color: "#B08000",
			hover_border_color: "#B08000",
			hover_border_width: 1,
			hover_color: "#FFF",

			click_background_color: "#B08000",
			click_border_color: "#00fffe",
			click_border_width: 1,
			click_color: "#FFF",
		}
	},
};

export enum AREA_TYPE {
	// 障碍物区域
	OBSTACLE = 13,
	// 活动区域
	ACTIVITY = 14,
	// 盲区
	BLIND = 15
}

// 标签卡样式
export type CardLabelStyle = {
  text_color: string;
  text_background_color: string;
  text_background_border_color: string
}

export const SAFE_CARD_CLASS = "emergency_safe_card";
export const ACCIDENT_CARD_CLASS = "emergency_accident_card";
export const EVACUATE_CARD_CLASS = "emergency_evacuate_card";

export const enum CARD_STATUS {
	HIGHLIGHT= 1 << 1,

	OFFLINE= 1 << 2,
	ONLINE= 1 << 3,

	ACCDENT = 1 << 4,
	EVACUATE = 1 << 5,
	SAFE = 1 << 6
}

export const ONLINE_LABEL_COLOR = "#15F9F8";
export const OFFLINE_LABEL_COLOR = "#D1D8E1";

export const CARD_LABEL_STYLE = {
	[CARD_STATUS.ONLINE]: {
		text_color: "#15F9F8",
		text_background_color: "rgba(15, 33, 51, 0.85)",
		text_background_border_color: "rgba(15, 33, 51, 0.85)",
		text_background_border_width: 1
	},

	[CARD_STATUS.ONLINE | CARD_STATUS.HIGHLIGHT]: {
		text_color: "rgba(21, 249, 248, 1)",
		text_background_color: "rgba(6, 76, 111, 0.85)",
		text_background_border_color: "rgba(0, 255, 254, 1)",
		text_background_border_width: 2
	},

	[CARD_STATUS.ONLINE | CARD_STATUS.SAFE]: {
		text_color: "rgba(255, 255, 255, 1)",
		text_background_color: "rgba(27, 65, 35, 0.85)",
		text_background_border_color: "rgba(57, 209, 90, 1)",
		text_background_border_width: 1
	},

	[CARD_STATUS.ONLINE | CARD_STATUS.SAFE | CARD_STATUS.HIGHLIGHT]: {
		text_color: "rgba(255, 255, 255, 1)",
		text_background_color: "rgba(16, 116, 38, 0.85)",
		text_background_border_color: "rgba(0, 255, 56, 1)",
		text_background_border_width: 2
	},

	[CARD_STATUS.ONLINE | CARD_STATUS.ACCDENT]: {
		text_color: "rgba(255, 255, 255, 1)",
		text_background_color: "rgba(86, 26, 30, 0.85)",
		text_background_border_color: "rgba(231, 86, 94, 1)",
		text_background_border_width: 1
	},

	[CARD_STATUS.ONLINE | CARD_STATUS.ACCDENT | CARD_STATUS.HIGHLIGHT]: {
		text_color: "rgba(255, 255, 255, 1)",
		text_background_color: "rgba(140, 20, 28, 0.85)",
		text_background_border_color: "rgba(255, 62, 73, 1)",
		text_background_border_width: 2
	},

	[CARD_STATUS.OFFLINE]: {
		text_color: "rgba(209, 216, 225, 1)",
		text_background_color: "rgba(15, 33, 51, 0.85)",
		text_background_border_color: undefined,
		text_background_border_width: 1
	},
	[CARD_STATUS.OFFLINE | CARD_STATUS.HIGHLIGHT]: {
		text_color: "rgba(209, 216, 225, 1)",
		text_background_color: "rgba(6, 76, 111, 0.85)",
		text_background_border_color: "rgba(0, 255, 254, 1)",
		text_background_border_width: 2
	},

	[CARD_STATUS.OFFLINE | CARD_STATUS.SAFE]: {
		text_color: "rgba(209, 216, 225, 1)",
		text_background_color: "rgba(27, 65, 35, 0.85)",
		text_background_border_color: "rgba(57, 209, 90, 1)",
		text_background_border_width: 1
	},

	[CARD_STATUS.OFFLINE | CARD_STATUS.SAFE | CARD_STATUS.HIGHLIGHT]: {
		text_color: "rgba(209, 216, 225, 1)",
		text_background_color: "rgba(16, 116, 38, 0.85)",
		text_background_border_color: "rgba(0, 255, 56, 1)",
		text_background_border_width: 2
	},

	[CARD_STATUS.OFFLINE | CARD_STATUS.ACCDENT]: {
		text_color: "rgba(209, 216, 225, 1)",
		text_background_color: "rgba(86, 26, 30, 0.85)",
		text_background_border_color: "rgba(231, 86, 94, 1)",
		text_background_border_width: 1
	},

	[CARD_STATUS.OFFLINE | CARD_STATUS.ACCDENT | CARD_STATUS.HIGHLIGHT]: {
		text_color: "rgba(209, 216, 225, 1)",
		text_background_color: "rgba(140, 20, 28, 0.85)",
		text_background_border_color: "rgba(255, 62, 73, 1)",
		text_background_border_width: 2
	}
} as const;

export const CARD_LABEL_CLASS = {
	[CARD_STATUS.ONLINE]: "online",
	[CARD_STATUS.OFFLINE]: "offline",
	[CARD_STATUS.ONLINE | CARD_STATUS.HIGHLIGHT]: "online-highlight",
	[CARD_STATUS.OFFLINE | CARD_STATUS.HIGHLIGHT]: "offline-highlight",
	[CARD_STATUS.ONLINE | CARD_STATUS.SAFE]: "online-safe",
	[CARD_STATUS.OFFLINE | CARD_STATUS.SAFE]: "offline-safe",
	[CARD_STATUS.ONLINE | CARD_STATUS.ACCDENT]: "online-accident",
	[CARD_STATUS.OFFLINE | CARD_STATUS.ACCDENT]: "offline-accident",
	[CARD_STATUS.ONLINE | CARD_STATUS.SAFE | CARD_STATUS.HIGHLIGHT]: "online-safe-highlight",
	[CARD_STATUS.OFFLINE | CARD_STATUS.SAFE | CARD_STATUS.HIGHLIGHT]: "offline-safe-highlight",
	[CARD_STATUS.ONLINE | CARD_STATUS.ACCDENT | CARD_STATUS.HIGHLIGHT]: "online-accident-highlight",
	[CARD_STATUS.OFFLINE | CARD_STATUS.ACCDENT | CARD_STATUS.HIGHLIGHT]: "offline-accident-highlight",
	[CARD_STATUS.ONLINE | CARD_STATUS.SAFE | CARD_STATUS.HIGHLIGHT]: "online-safe-highlight",
	[CARD_STATUS.OFFLINE | CARD_STATUS.SAFE | CARD_STATUS.HIGHLIGHT]: "offline-safe-highlight",
	[CARD_STATUS.ONLINE | CARD_STATUS.ACCDENT]: "online-accident",
	[CARD_STATUS.OFFLINE | CARD_STATUS.ACCDENT]: "offline-accident",
	[CARD_STATUS.ONLINE | CARD_STATUS.SAFE]: "online-safe",
	[CARD_STATUS.OFFLINE | CARD_STATUS.SAFE]: "offline-safe",
} as const;
