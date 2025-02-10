import {resolveCustomText} from "@/store/modules/featureFlags";
import {formatHMS, formatDateTime, formatCardId} from "@/utils/js/formatter";
import {useNameTips, useRelatedInfoTips} from "@/composable/hide";

const formatAreas = (val: any[]) => (val || []).map(({area_name}) => area_name).join("、");
const formatInCellDateTime = (val: any) => formatDateTime(undefined, undefined, val);
const formatStayTime = (val: number) => formatHMS(undefined, undefined, val);
const formatCellCardId = (card_id: number) => formatCardId(undefined, undefined, card_id);

// 定位对象多详情基本列
const base_tag_column_map = {
	all: [
		{label: "名称", prop: "name", min_width: "80", header_tip: () => useNameTips().value},
		{label: "相关信息", prop: "related_info", min_width: "120", header_tip: () => useRelatedInfoTips().value},
		{label: "卡号", prop: "card_id", min_width: "72", formatter: formatCellCardId},
		{label: "所在区域", prop: "areas", min_width: "100", formatter: formatAreas},
		{label: "进区时间", prop: "in_area_time", min_width: "167", formatter: formatInCellDateTime},
		{label: "停留时长", prop: "stay_time", min_width: "136", formatter: formatStayTime},
	],
	person: [
		{label: "姓名", prop: "name", min_width: "60"},
		{label: "部门", prop: "branch_name", min_width: "60"},
		{label: "卡号", prop: "card_id", min_width: "72", formatter: formatCellCardId},
		{label: "工号", prop: "job_num", min_width: "60"},
		{label: "所在区域", prop: "areas", min_width: "100", formatter: formatAreas},
		{label: "进区时间", prop: "in_area_time", min_width: "167", formatter: formatInCellDateTime},
		{label: "停留时长", prop: "stay_time", min_width: "136", formatter: formatStayTime},
	],
	visitor: [
		{label: "姓名", prop: "name", min_width: "60"},
		{label: "单位", prop: "company", min_width: "60"},
		{label: "卡号", prop: "card_id", min_width: "72", formatter: formatCellCardId},
		{label: "所在区域", prop: "areas", min_width: "100", formatter: formatAreas},
		{label: "进区时间", prop: "in_area_time", min_width: "167", formatter: formatInCellDateTime},
		{label: "停留时长", prop: "stay_time", min_width: "136", formatter: formatStayTime},
	],
	contractor: [
		{label: "姓名", prop: "name", min_width: "60"},
		{label: "单位", prop: "unit_name", min_width: "60"},
		{label: "卡号", prop: "card_id", min_width: "72", formatter: formatCellCardId},
		{label: "所在区域", prop: "areas", min_width: "100", formatter: formatAreas},
		{label: "进区时间", prop: "in_area_time", min_width: "167", formatter: formatInCellDateTime},
		{label: "停留时长", prop: "stay_time", min_width: "136", formatter: formatStayTime},
	],
	truck: [
		{label: "车牌号", prop: "licence", min_width: "60"},
		{label: "车辆类型", prop: "type_name", min_width: "80"},
		{label: "卡号", prop: "card_id", min_width: "72", formatter: formatCellCardId},
		{label: "司机", prop: "driver", min_width: "60"},
		{label: "所在区域", prop: "areas", min_width: "100", formatter: formatAreas},
		{label: "进区时间", prop: "in_area_time", min_width: "167", formatter: formatInCellDateTime},
		{label: "停留时长", prop: "stay_time", min_width: "136", formatter: formatStayTime},
	],
	material: [
		{label: "物资编号", prop: "serial_num", min_width: "80"},
		{label: "物资名称", prop: "name", min_width: "80"},
		{label: "物资类型", prop: "type_name", min_width: "80"},
		{label: "卡号", prop: "card_id", min_width: "72", formatter: formatCellCardId},
		{label: "所在区域", prop: "areas", min_width: "100", formatter: formatAreas},
		{label: "进区时间", prop: "in_area_time", min_width: "167", formatter: formatInCellDateTime},
		{label: "停留时长", prop: "stay_time", min_width: "136", formatter: formatStayTime},
	]
} as const;

export const tab_column_map = {
	all: [...base_tag_column_map.all],
	person: [...base_tag_column_map.person],
	visitor: [...base_tag_column_map.visitor],
	contractor: [...base_tag_column_map.contractor],
	truck: [...base_tag_column_map.truck],
	material: [...base_tag_column_map.material]
} as const;

export const pit_tab_column_map = {
	person: [
		...base_tag_column_map.person,
		{label: () => resolveCustomText("enter_pit_time"), prop: "in_pit_time", min_width: "167", formatter: formatInCellDateTime},
		{label: () => resolveCustomText("pit_stay_time"), prop: "pit_stay_time", min_width: "167", formatter: formatStayTime},
	],
	visitor: [
		...base_tag_column_map.visitor,
		{label: () => resolveCustomText("enter_pit_time"), prop: "in_pit_time", min_width: "167", formatter: formatInCellDateTime},
		{label: () => resolveCustomText("pit_stay_time"), prop: "pit_stay_time", min_width: "167", formatter: formatStayTime},
	],
	contractor: [
		...base_tag_column_map.contractor,
		{label: () => resolveCustomText("enter_pit_time"), prop: "in_pit_time", min_width: "167", formatter: formatInCellDateTime},
		{label: () => resolveCustomText("pit_stay_time"), prop: "pit_stay_time", min_width: "167", formatter: formatStayTime},
	],
	truck: [
		...base_tag_column_map.truck,
		{label: () => resolveCustomText("enter_pit_time"), prop: "in_pit_time", min_width: "167", formatter: formatInCellDateTime},
		{label: () => resolveCustomText("pit_stay_time"), prop: "pit_stay_time", min_width: "167", formatter: formatStayTime},
	],
	material: [
		...base_tag_column_map.material,
		{label: () => resolveCustomText("enter_pit_time"), prop: "in_pit_time", min_width: "167", formatter: formatInCellDateTime},
		{label: () => resolveCustomText("pit_stay_time"), prop: "pit_stay_time", min_width: "167", formatter: formatStayTime},
	],
	default: [
		...base_tag_column_map.all,
		{label: () => resolveCustomText("enter_pit_time"), prop: "in_pit_time", min_width: "167", formatter: formatInCellDateTime},
		{label: () => resolveCustomText("pit_stay_time"), prop: "pit_stay_time", min_width: "167", formatter: formatStayTime},
	]
} as const;

export const emergency_tab_column_map = {
	all: [
		...base_tag_column_map.all,
		{label: "离开事故区时间", prop: "leave_time", min_width: "167", formatter: formatInCellDateTime},
		{label: "进入安全岛时间", prop: "arrive_at_time", min_width: "167", formatter: formatInCellDateTime},
	],
	person: [
		...base_tag_column_map.person,
		{label: "离开事故区时间", prop: "leave_time", min_width: "167", formatter: formatInCellDateTime},
		{label: "进入安全岛时间", prop: "arrive_at_time", min_width: "167", formatter: formatInCellDateTime},
	],
	visitor: [
		...base_tag_column_map.visitor,
		{label: "离开事故区时间", prop: "leave_time", min_width: "167", formatter: formatInCellDateTime},
		{label: "进入安全岛时间", prop: "arrive_at_time", min_width: "167", formatter: formatInCellDateTime},
	],
	contractor: [
		...base_tag_column_map.contractor,
		{label: "离开事故区时间", prop: "leave_time", min_width: "167", formatter: formatInCellDateTime},
		{label: "进入安全岛时间", prop: "arrive_at_time", min_width: "167", formatter: formatInCellDateTime},
	],
	truck: [
		...base_tag_column_map.truck,
		{label: "离开事故区时间", prop: "leave_time", min_width: "167", formatter: formatInCellDateTime},
		{label: "进入安全岛时间", prop: "arrive_at_time", min_width: "167", formatter: formatInCellDateTime},
	],
	material: [
		...base_tag_column_map.material,
		{label: "离开事故区时间", prop: "leave_time", min_width: "167", formatter: formatInCellDateTime},
		{label: "进入安全岛时间", prop: "arrive_at_time", min_width: "167", formatter: formatInCellDateTime},
	],
} as const;

export function formatColLabel(label: string | (() => string)) {
	return typeof label === "function" ? label() : label;
}
