import type {Option, AreaType} from "@/types/global";
import type {Props as ShuttleSearchProps} from "@/components/Dialog/shuttle/ShuttleSearch.vue";
import type {Props as AnchorDialogProps} from "@/components/Dialog/AnchorDialog.vue";
import type {CheckedItem} from "@/components/Dialog/constant";
import {SHUTTLE_TYPE} from "@/components/Dialog/constant";
import {ALARM_RULE_TYPE} from "@/utils/js/constant";
import {filterNonNegativeFloat} from "@/utils/ts/common";

import {filterNonNegativeInteger} from "./tool";
import {TIME_UNIT} from "./constant";

export type SelectOption<T> = Omit<Option<T>, "id">
export type ApplyObjectUnbindOptions = SelectOption<number> & {tip: string}

export enum ALARM_LEVEL_NUMBER {
	a = 1,
	b = 2,
	c = 3,
}

export const enum APPLY_MAP_SCOPE {
    all = 1,
    custom = 0
}

const enum SHUTTLE_MAP_TYPE {
    virtual_fence = "virtual_fence",
    scene = "scene",
    attendance = "attendance"
}

export const enum ENTER_REQUIRE {
	enable = 1,
	disable = 0
}

export const enum MERGE_AREA {
	overall = 1,
	individual = 0
}

export interface ApplyMapRow {
    map_name: string | null,
    area_name: string | null,
    area_id: number | null,
	area_type: AreaType | null,
    rule_group_name: string | null,
    is_use: 0 | 1 | null,
	scene_id?: number
}

export interface AlarmSettingItem {
	level: keyof typeof ALARM_LEVEL_NUMBER,
	init_form: {
		alarm_setting: string,
		push_message: number,
		has_level: 0 | 1,
		message_content: string,
		unit: string,
	}
}

export type AlarmSettingUnitItem = SelectOption<string> & {cb?: (value: number) => number}

export interface FormData {
    base: {
        type: ALARM_RULE_TYPE,
        is_use: 0 | 1,
        name: string,
        rule_group_id: number | undefined,
        remark: string,
    },
    rule_setting: {
		/** 聚集半径 */
		gather_radius?: string,
		/** 聚集持续时间 */
		gather_dur_time?: string,
		/** 禁止离开是否开启先进入绑定区域再离开才告警 */
		enter_require?: ENTER_REQUIRE,
		/** 禁止离开是否将规则绑定的对象视作同一个整体 */
		merge_area?: MERGE_AREA,
		/** A/B/C告警级别 */
		alarm_list: AlarmSettingItem[]
	},
    apply_map: {
		/** 适用地图全部/自定 */
        map_scope: APPLY_MAP_SCOPE,
		/** 0-不反选，1-反选 */
        is_inverse: 0 | 1,
		/** 自定义地图列表 */
        map_table_data: ApplyMapRow[]
    },
    apply_object: {
		/** 1-定位对象， 2-标签类型  */
        apply_object_type: APPLY_OBJECT_TYPE,
		/** 0-正选，1-反选 */
		apply_object_alarm: APPLY_OBJECT_ALARM,
		/** 解绑是否触发告警 0-不告警，1-告警 */
		apply_object_unbind: APPLY_OBJECT_UNBIND,
		/** 适用的员工对象 all-全部员工，none-无，custom-自定义 */
        apply_person: APPLY_PERSON,
		/** 自定义选择的员工对象 */
		apply_person_checked_list: CheckedItem[],
		/** 适用的车辆对象 all-全部车辆，none-无，custom-自定义 */
        apply_truck: APPLY_TRUCK,
		/** 自定义选择的车辆对象 */
		apply_truck_checked_list: CheckedItem[],
		/** 适用的访客对象 all-全部访客，none-无，custom-自定义 */
        apply_visitor: APPLY_VISITOR,
		/** 自定义选择的访客对象 */
		apply_visitor_checked_list: CheckedItem[],
		/** 适用的物资对象 all-全部物资，none-无，custom-自定义 */
        apply_material: APPLY_MATERIAL,
		/** 自定义选择的物资对象 */
		apply_material_checked_list: CheckedItem[],
		/** 适用的承包商对象 all-全部物资，none-无，custom-自定义 */
        apply_contractor: APPLY_CONTRACTOR,
		/** 自定义选择的承包商对象 */
		apply_contractor_checked_list: CheckedItem[],
		/** 适用的物资对象 all-全部标签，custom-自定义 */
        apply_card_type: APPLY_CARD_TYPE,
		/** 自定义选择的标签对象 */
		apply_card_type_checked_list: CheckedItem[],
    },
	hazard_source_apply_object?: {
		apply_object_type: APPLY_OBJECT_TYPE,
		apply_object_alarm: APPLY_OBJECT_ALARM,
		apply_object_unbind: APPLY_OBJECT_UNBIND,
		apply_person: APPLY_PERSON,
		apply_person_checked_list: CheckedItem[],
        apply_truck: APPLY_TRUCK,
		apply_truck_checked_list: CheckedItem[],
        apply_visitor: APPLY_VISITOR,
		apply_visitor_checked_list: CheckedItem[],
        apply_material: APPLY_MATERIAL,
		apply_material_checked_list: CheckedItem[],
		apply_contractor: APPLY_CONTRACTOR,
		apply_contractor_checked_list: CheckedItem[],
        apply_card_type: APPLY_CARD_TYPE,
		apply_card_type_checked_list: CheckedItem[],
	},
	accompany_apply_object?: {
		apply_object_type: APPLY_OBJECT_TYPE,
		apply_object_alarm: APPLY_OBJECT_ALARM,
		apply_object_unbind: APPLY_OBJECT_UNBIND,
		apply_person: APPLY_PERSON,
		apply_person_checked_list: CheckedItem[],
        apply_truck: APPLY_TRUCK,
		apply_truck_checked_list: CheckedItem[],
        apply_visitor: APPLY_VISITOR,
		apply_visitor_checked_list: CheckedItem[],
        apply_material: APPLY_MATERIAL,
		apply_material_checked_list: CheckedItem[],
		apply_contractor: APPLY_CONTRACTOR,
		apply_contractor_checked_list: CheckedItem[],
        apply_card_type: APPLY_CARD_TYPE,
		apply_card_type_checked_list: CheckedItem[],
	},
    effect_schedule: {
		/** 生效日期 all-全部日期，custom-自定义日期 */
        effect_date_select: EFFECT_DATE,
		/** 自定义生效日期 */
		effect_date_custom: Date[],
		/** 重复星期 all-全部星期，custom-自定义星期 */
        effect_week_select: EFFECT_WEEK,
		/** 自定义重复日期 */
		effect_week_custom: number[],
		/** 重复时段 all-全天时间，custom-自定义时段 */
        effect_time_select: EFFECT_TIME,
		/** 自定义重复时段 */
		effect_time_custom: Date[],
		/** 自定义重复时段列表 */
		effect_time_list: number[][]
    },
    handling_alarm: {
		/** 处理内容是否必填 0-非必填，1-必填  */
        is_required: HANDLING_ALARM,
    }
}

export interface FormConfig {
	/** 启用状态图标tip */
	enable_icon_tip: string,
	/** 触发规则的tip */
    rule_setting_title_tip: string,
	/** 具有几级告警级别 */
    alarm_level_num: number,
	/** 规则设置表单校验 */
	alarm_rules?: Record<string, any[]>,
	/** 告警设置label */
	alarm_setting_label: string,
	/** 告警设置label宽度 */
	alarm_setting_label_width: string,
	/** special_json存放的key */
	alarm_setting_label_key?: string,
	/** 告警设置单位 */
	alarm_setting_units: AlarmSettingUnitItem[],
	/** 告警设置placeholder */
	alarm_setting_placeholder: string,
	/** 告警设置表单是否禁用 */
	alarm_setting_disabled: {a: boolean, b: boolean, c: boolean},
	/** 是否显示推动文字消息表单项 */
	show_push_message: boolean,
	/** A/B/C告警设置值规则 */
	alarm_setting_rule?: "asc" | "desc",
	/** 告警设置更新方法 */
	alarm_setting_update?: (value: string) => string,

	/** 适用地图下拉选项 */
    apply_map_options: SelectOption<APPLY_MAP_SCOPE>[],
	/** 自定义适用地图是否显示地图范围反选 */
    show_inverse_map_scope: boolean,
	/** 适用地图穿梭框的下拉选项 */
    shuttle_map_options: ShuttleSearchProps["selectOptions"],
	/** 地图穿梭框是否是多选 */
	shuttle_map_multiple: boolean,

	/** 选择适用对象下拉选项 */
	apply_object_type_options: SelectOption<number>[],
	/** 适用对象触发告警下拉选项 */
	apply_object_alarm_options: SelectOption<number>[],
	/** 解绑适用对象下拉选项 */
	apply_object_unbind_options: ApplyObjectUnbindOptions[],
	/** 可以选择那些定位对象类型 */
    tag_type: {person: boolean, truck: boolean, visitor: boolean, material: boolean, contractor: boolean},
	/** 适用员工下拉选项 */
	apply_person_options: SelectOption<string>[],
	/** 适用访客下拉选项 */
	apply_visitor_options: SelectOption<string>[],
	/** 适用车辆下拉选项 */
	apply_truck_options: SelectOption<string>[],
	/** 适用物资下拉选项 */
	apply_material_options: SelectOption<string>[],
	/** 适用承包商下拉选项 */
	apply_contractor_options: SelectOption<string>[],
	/** 适用标签卡类型下拉选项 */
	apply_card_type_options: SelectOption<string>[]

	/** 生效时间类别 */
	effect_schedule_class: {date: boolean, week: boolean, time: boolean},
	/** 生效时间下拉选项 */
	effect_date_options: SelectOption<string>[],
	/** 重复星期下拉选项 */
	effect_week_options: SelectOption<string>[],
	/** 重复时段下拉选项 */
	effect_time_options: SelectOption<string>[],

	/** 处理报警内容是否必填下拉选项  */
	handling_alarm_options: SelectOption<number>[],
}

interface AlarmRuleConfigItem {
    getDefaultForm: () => FormData,
    form_config: FormConfig,
    menus: AnchorDialogProps["menus"]
}

const apply_map_options_map = {
	[APPLY_MAP_SCOPE.all]: {label: "全部定位信号覆盖区域", value: APPLY_MAP_SCOPE.all},
	[APPLY_MAP_SCOPE.custom]: {label: "自定义", value: APPLY_MAP_SCOPE.custom},
};
const getApplyMapOptions = (option_config: APPLY_MAP_SCOPE[]): SelectOption<APPLY_MAP_SCOPE>[] => {
	return option_config.map((config) => apply_map_options_map[config]);
};

const shuttle_map_options_map = {
	[SHUTTLE_MAP_TYPE.attendance]: {label: "考勤区域", value: SHUTTLE_TYPE.attendance, tab_name: "考勤区域"},
	[SHUTTLE_MAP_TYPE.scene]: {label: "场景", value: SHUTTLE_TYPE.scene, tab_name: "场景"},
	[SHUTTLE_MAP_TYPE.virtual_fence]: {label: "电子围栏区域", value: SHUTTLE_TYPE.virtual_fence, tab_name: "电子围栏区域"},
};
const getShuttleMapOptions = (option_config: SHUTTLE_MAP_TYPE[]): ShuttleSearchProps["selectOptions"] => {
	return option_config.map((config) => shuttle_map_options_map[config]);
};

export const enum APPLY_OBJECT_TYPE {
	tag = 1,
	card_type = 2
}
const apply_object_type_options_map = {
	[APPLY_OBJECT_TYPE.tag]: {label: "定位对象", value: APPLY_OBJECT_TYPE.tag},
	[APPLY_OBJECT_TYPE.card_type]: {label: "标签类型", value: APPLY_OBJECT_TYPE.card_type},
};
const getApplyObjectTypeOptions = (option_config: APPLY_OBJECT_TYPE[]): SelectOption<number>[] => {
	return option_config.map((config) => apply_object_type_options_map[config]);
};

export const enum APPLY_OBJECT_ALARM {
	include = 0,
	exclude = 1
}
const apply_object_alarm_options_map = {
	[APPLY_OBJECT_ALARM.include]: {label: "以下对象将触发告警", value: APPLY_OBJECT_ALARM.include},
	[APPLY_OBJECT_ALARM.exclude]: {label: "以下对象外将触发告警", value: APPLY_OBJECT_ALARM.exclude},
};
const getApplyObjectAlarmOptions = (option_config: APPLY_OBJECT_ALARM[]): SelectOption<number>[] => {
	return option_config.map((config) => apply_object_alarm_options_map[config]);
};

export const enum APPLY_OBJECT_UNBIND {
	no_alarm = 0,
	alarm = 1
}
const apply_object_unbind_options_map = {
	[APPLY_OBJECT_UNBIND.alarm]: {label: "适用对象与定位标签卡解绑后-会触发报警", value: APPLY_OBJECT_UNBIND.alarm, tip: "适用对象与定位标签卡解绑后，视为离开，会触发告警"},
	[APPLY_OBJECT_UNBIND.no_alarm]: {label: "适用对象与定位标签卡解绑后-不会触发报警", value: APPLY_OBJECT_UNBIND.no_alarm, tip: "适用对象与定位标签卡解绑后，视为未离开，不会触发告警"},
};
const getApplyObjectUnbindOptions = (option_config: APPLY_OBJECT_UNBIND[]): ApplyObjectUnbindOptions[] => {
	return option_config.map((config) => apply_object_unbind_options_map[config]);
};

export const enum APPLY_PERSON {
	all = "all",
	none = "none",
	custom = "custom"
}
const apply_person_options_map = {
	[APPLY_PERSON.all]: {label: "全部员工", value: APPLY_PERSON.all},
	[APPLY_PERSON.none]: {label: "无", value: APPLY_PERSON.none},
	[APPLY_PERSON.custom]: {label: "自定义", value: APPLY_PERSON.custom}
};
const getApplyPersonOptions = (option_config: APPLY_PERSON[]): SelectOption<string>[] => {
	return option_config.map((config) => apply_person_options_map[config]);
};

export const enum APPLY_VISITOR {
	all = "all",
	none = "none",
	custom = "custom"
}
const apply_visitor_options_map = {
	[APPLY_VISITOR.all]: {label: "全部访客", value: APPLY_VISITOR.all},
	[APPLY_VISITOR.none]: {label: "无", value: APPLY_VISITOR.none},
	[APPLY_VISITOR.custom]: {label: "自定义", value: APPLY_VISITOR.custom}
};
const getApplyVisitorOptions = (option_config: APPLY_VISITOR[]): SelectOption<string>[] => {
	return option_config.map((config) => apply_visitor_options_map[config]);
};

export const enum APPLY_TRUCK {
	all = "all",
	none = "none",
	custom = "custom"
}
const apply_truck_options_map = {
	[APPLY_TRUCK.all]: {label: "全部车辆", value: APPLY_TRUCK.all},
	[APPLY_TRUCK.none]: {label: "无", value: APPLY_TRUCK.none},
	[APPLY_TRUCK.custom]: {label: "自定义", value: APPLY_TRUCK.custom}
};
const getApplyTruckOptions = (option_config: APPLY_TRUCK[]): SelectOption<string>[] => {
	return option_config.map((config) => apply_truck_options_map[config]);
};

export const enum APPLY_MATERIAL {
	all = "all",
	none = "none",
	custom = "custom"
}
const apply_material_options_map = {
	[APPLY_MATERIAL.all]: {label: "全部物资", value: APPLY_MATERIAL.all},
	[APPLY_MATERIAL.none]: {label: "无", value: APPLY_MATERIAL.none},
	[APPLY_MATERIAL.custom]: {label: "自定义", value: APPLY_MATERIAL.custom}
};
const getApplyMaterialOptions = (option_config: APPLY_MATERIAL[]): SelectOption<string>[] => {
	return option_config.map((config) => apply_material_options_map[config]);
};

export const enum APPLY_CONTRACTOR {
	all = "all",
	none = "none",
	custom = "custom"
}
const apply_contractor_options_map = {
	[APPLY_CONTRACTOR.all]: {label: "全部承包商", value: APPLY_CONTRACTOR.all},
	[APPLY_CONTRACTOR.none]: {label: "无", value: APPLY_CONTRACTOR.none},
	[APPLY_CONTRACTOR.custom]: {label: "自定义", value: APPLY_CONTRACTOR.custom}
};
const getApplyContractorOptions = (option_config: APPLY_CONTRACTOR[]): SelectOption<string>[] => {
	return option_config.map((config) => apply_contractor_options_map[config]);
};

export const enum APPLY_CARD_TYPE {
	all = "all",
	custom = "custom"
}
const apply_card_type_options_map = {
	[APPLY_CARD_TYPE.all]: {label: "全部标签类型", value: APPLY_CARD_TYPE.all},
	[APPLY_CARD_TYPE.custom]: {label: "自定义", value: APPLY_CARD_TYPE.custom}
};
const getApplyCardTypeOptions = (option_config: APPLY_CARD_TYPE[]): SelectOption<string>[] => {
	return option_config.map((config) => apply_card_type_options_map[config]);
};

export const enum HANDLING_ALARM {
	required = 1,
	optional = 0
}
const handling_alarm_options_map = {
	[HANDLING_ALARM.optional]: {label: "处理内容非必填", value: HANDLING_ALARM.optional},
	[HANDLING_ALARM.required]: {label: "处理内容必填", value: HANDLING_ALARM.required}
};
const getHandlingAlarmOptions = (option_config: HANDLING_ALARM[]): SelectOption<number>[] => {
	return option_config.map((config) => handling_alarm_options_map[config]);
};

export const enum EFFECT_DATE {
	all = "all",
	custom = "custom"
}
const effect_date_options_map = {
	[EFFECT_DATE.all]: {label: "全部日期", value: EFFECT_DATE.all},
	[EFFECT_DATE.custom]: {label: "自定义", value: EFFECT_DATE.custom},
};
const getEffectDateOptions = (option_config: EFFECT_DATE[]): SelectOption<string>[] => {
	return option_config.map((config) => effect_date_options_map[config]);
};

export const enum EFFECT_WEEK {
	all = "all",
	custom = "custom"
}
const effect_week_options_map = {
	[EFFECT_DATE.all]: {label: "全部星期", value: EFFECT_WEEK.all},
	[EFFECT_DATE.custom]: {label: "自定义", value: EFFECT_WEEK.custom},
};
const getEffectWeekOptions = (option_config: EFFECT_WEEK[]): SelectOption<string>[] => {
	return option_config.map((config) => effect_week_options_map[config]);
};

export const enum EFFECT_TIME {
	all = "all",
	custom = "custom"
}
const effect_time_options_map = {
	[EFFECT_DATE.all]: {label: "全天时间", value: EFFECT_TIME.all},
	[EFFECT_DATE.custom]: {label: "自定义", value: EFFECT_TIME.custom},
};
const getEffectTimeOptions = (option_config: EFFECT_TIME[]): SelectOption<string>[] => {
	return option_config.map((config) => effect_time_options_map[config]);
};

const getMenus = (excludes = ["危险源", "靠近不告警对象", "被陪同对象", "陪同对象"]) => {
	const all_menus = [
		{name: "基础信息", id: "base"},
		{name: "触发规则设置", id: "rule_setting"},
		{name: "适用地图范围", id: "apply_map"},
		{name: "适用对象", id: "apply_object"},
		{name: "危险源", id: "hazard_source_apply_object"},
		{name: "靠近不告警对象", id: "apply_object"},
		{name: "被陪同对象", id: "accompany_apply_object"},
		{name: "陪同对象", id: "apply_object"},
		{name: "生效时间", id: "effect_schedule"},
		{name: "告警手动处理设置", id: "handling_alarm"},
	];

	return all_menus.filter(({name}) => !excludes.includes(name));
};

const region_intrusion_config: AlarmRuleConfigItem = {
	getDefaultForm: () => ({
		base: {
			type: ALARM_RULE_TYPE.region_intrusion,
			is_use: 1,
			name: "",
			rule_group_id: undefined,
			remark: "",
		},
		rule_setting: {
			alarm_list: [
				{
					level: "a",
					init_form: {
						alarm_setting: "0",
						push_message: 0,
						has_level: 0,
						message_content: "",
						unit: "米",
					}
				}
			]
		},
		apply_map: {
			map_scope: APPLY_MAP_SCOPE.custom,
			is_inverse: 0,
			map_table_data: []
		},
		apply_object: {
			apply_object_type: APPLY_OBJECT_TYPE.tag,
			apply_object_alarm: APPLY_OBJECT_ALARM.include,
			apply_object_unbind: APPLY_OBJECT_UNBIND.alarm,
			apply_person: APPLY_PERSON.all,
			apply_person_checked_list: [],
			apply_truck: APPLY_TRUCK.all,
			apply_truck_checked_list: [],
			apply_visitor: APPLY_VISITOR.all,
			apply_visitor_checked_list: [],
			apply_material: APPLY_MATERIAL.all,
			apply_material_checked_list: [],
			apply_contractor: APPLY_CONTRACTOR.all,
			apply_contractor_checked_list: [],
			apply_card_type: APPLY_CARD_TYPE.all,
			apply_card_type_checked_list: []
		},
		effect_schedule: {
			effect_date_select: EFFECT_DATE.all,
			effect_date_custom: [],
			effect_week_select: EFFECT_WEEK.all,
			effect_week_custom: [],
			effect_time_select: EFFECT_TIME.all,
			effect_time_custom: [],
			effect_time_list: []
		},
		handling_alarm: {
			is_required: HANDLING_ALARM.optional,
		}
	}),
	form_config: {
		enable_icon_tip: "禁用会导致“未结束的告警”全部结束告警",
		rule_setting_title_tip: "“告警适用对象”与“告警适用地图范围”的距离大于设置值，则触发告警。",
		alarm_level_num: 3,
		alarm_setting_label: "区域范围外",
		alarm_setting_label_width: "130px",
		alarm_setting_label_key: "dis",
		alarm_setting_units: [{label: "米", value: "米"}],
		alarm_setting_placeholder: "请输入",
		alarm_setting_disabled: {a: true, b: false, c: false},
		alarm_setting_rule: "asc",
		show_push_message: true,
		alarm_setting_update: (value) => filterNonNegativeFloat(value),

		apply_map_options: getApplyMapOptions([APPLY_MAP_SCOPE.custom]),
		show_inverse_map_scope: false,
		shuttle_map_options: getShuttleMapOptions([SHUTTLE_MAP_TYPE.virtual_fence]),
		shuttle_map_multiple: true,

		apply_object_type_options: getApplyObjectTypeOptions([APPLY_OBJECT_TYPE.tag]),
		apply_object_alarm_options: getApplyObjectAlarmOptions([APPLY_OBJECT_ALARM.include, APPLY_OBJECT_ALARM.exclude]),
		apply_object_unbind_options: getApplyObjectUnbindOptions([APPLY_OBJECT_UNBIND.alarm]),
		tag_type: {person: true, truck: true, visitor: true, material: true, contractor: true},
		apply_person_options: getApplyPersonOptions([APPLY_PERSON.all, APPLY_PERSON.none, APPLY_PERSON.custom]),
		apply_visitor_options: getApplyVisitorOptions([APPLY_VISITOR.all, APPLY_VISITOR.none, APPLY_VISITOR.custom]),
		apply_truck_options: getApplyTruckOptions([APPLY_TRUCK.all, APPLY_TRUCK.none, APPLY_TRUCK.custom]),
		apply_material_options: getApplyMaterialOptions([APPLY_MATERIAL.all, APPLY_MATERIAL.none, APPLY_MATERIAL.custom]),
		apply_contractor_options: getApplyContractorOptions([APPLY_CONTRACTOR.all, APPLY_CONTRACTOR.none, APPLY_CONTRACTOR.custom]),
		apply_card_type_options: getApplyCardTypeOptions([APPLY_CARD_TYPE.all, APPLY_CARD_TYPE.custom]),

		effect_schedule_class: {date: true, week: true, time: true},
		effect_date_options: getEffectDateOptions([EFFECT_DATE.all, EFFECT_DATE.custom]),
		effect_week_options: getEffectWeekOptions([EFFECT_WEEK.all, EFFECT_WEEK.custom]),
		effect_time_options: getEffectTimeOptions([EFFECT_TIME.all, EFFECT_TIME.custom]),

		handling_alarm_options: getHandlingAlarmOptions([HANDLING_ALARM.optional, HANDLING_ALARM.required])
	},
	menus: getMenus()
};

const region_overcrowded_config: AlarmRuleConfigItem = {
	getDefaultForm: () => ({
		base: {
			type: ALARM_RULE_TYPE.region_overcrowded,
			is_use: 1,
			name: "",
			rule_group_id: undefined,
			remark: "",
		},
		rule_setting: {
			alarm_list: [
				{
					level: "a",
					init_form: {
						alarm_setting: "",
						push_message: 0,
						has_level: 0,
						message_content: "",
						unit: "个",
					}
				}
			]
		},
		apply_map: {
			map_scope: APPLY_MAP_SCOPE.custom,
			is_inverse: 0,
			map_table_data: []
		},
		apply_object: {
			apply_object_type: APPLY_OBJECT_TYPE.tag,
			apply_object_alarm: APPLY_OBJECT_ALARM.include,
			apply_object_unbind: APPLY_OBJECT_UNBIND.alarm,
			apply_person: APPLY_PERSON.all,
			apply_person_checked_list: [],
			apply_truck: APPLY_TRUCK.none,
			apply_truck_checked_list: [],
			apply_visitor: APPLY_VISITOR.none,
			apply_visitor_checked_list: [],
			apply_material: APPLY_MATERIAL.none,
			apply_material_checked_list: [],
			apply_contractor: APPLY_CONTRACTOR.none,
			apply_contractor_checked_list: [],
			apply_card_type: APPLY_CARD_TYPE.all,
			apply_card_type_checked_list: []
		},
		effect_schedule: {
			effect_date_select: EFFECT_DATE.all,
			effect_date_custom: [],
			effect_week_select: EFFECT_WEEK.all,
			effect_week_custom: [],
			effect_time_select: EFFECT_TIME.all,
			effect_time_custom: [],
			effect_time_list: []
		},
		handling_alarm: {
			is_required: HANDLING_ALARM.optional,
		}
	}),
	form_config: {
		enable_icon_tip: "禁用会导致“未结束的告警”全部结束告警",
		rule_setting_title_tip: "在“告警适用地图范围”内，“告警适用对象”数量大于设置值，则触发告警。",
		alarm_level_num: 3,
		alarm_setting_label: "数量上限",
		alarm_setting_label_width: "130px",
		alarm_setting_label_key: "num",
		alarm_setting_units: [{label: "个", value: "个"}],
		alarm_setting_placeholder: "请输入正整数",
		alarm_setting_disabled: {a: false, b: false, c: false},
		alarm_setting_rule: "desc",
		show_push_message: true,
		alarm_setting_update: (value: string) => filterNonNegativeInteger(value, false),

		apply_map_options: getApplyMapOptions([APPLY_MAP_SCOPE.custom]),
		show_inverse_map_scope: false,
		shuttle_map_options: getShuttleMapOptions([SHUTTLE_MAP_TYPE.virtual_fence]),
		shuttle_map_multiple: true,

		apply_object_type_options: getApplyObjectTypeOptions([APPLY_OBJECT_TYPE.tag]),
		apply_object_alarm_options: getApplyObjectAlarmOptions([APPLY_OBJECT_ALARM.include, APPLY_OBJECT_ALARM.exclude]),
		apply_object_unbind_options: getApplyObjectUnbindOptions([APPLY_OBJECT_UNBIND.alarm]),
		tag_type: {person: true, truck: true, visitor: true, material: true, contractor: true},
		apply_person_options: getApplyPersonOptions([APPLY_PERSON.all, APPLY_PERSON.none, APPLY_PERSON.custom]),
		apply_visitor_options: getApplyVisitorOptions([APPLY_VISITOR.all, APPLY_VISITOR.none, APPLY_VISITOR.custom]),
		apply_truck_options: getApplyTruckOptions([APPLY_TRUCK.all, APPLY_TRUCK.none, APPLY_TRUCK.custom]),
		apply_material_options: getApplyMaterialOptions([APPLY_MATERIAL.all, APPLY_MATERIAL.none, APPLY_MATERIAL.custom]),
		apply_contractor_options: getApplyContractorOptions([APPLY_CONTRACTOR.all, APPLY_CONTRACTOR.none, APPLY_CONTRACTOR.custom]),
		apply_card_type_options: getApplyCardTypeOptions([APPLY_CARD_TYPE.all, APPLY_CARD_TYPE.custom]),

		effect_schedule_class: {date: true, week: true, time: true},
		effect_date_options: getEffectDateOptions([EFFECT_DATE.all, EFFECT_DATE.custom]),
		effect_week_options: getEffectWeekOptions([EFFECT_WEEK.all, EFFECT_WEEK.custom]),
		effect_time_options: getEffectTimeOptions([EFFECT_TIME.all, EFFECT_TIME.custom]),

		handling_alarm_options: getHandlingAlarmOptions([HANDLING_ALARM.optional, HANDLING_ALARM.required])
	},
	menus: getMenus()
};

const region_shortage: AlarmRuleConfigItem = {
	getDefaultForm: () => ({
		base: {
			type: ALARM_RULE_TYPE.region_shortage,
			is_use: 1,
			name: "",
			rule_group_id: undefined,
			remark: "",
		},
		rule_setting: {
			alarm_list: [
				{
					level: "a",
					init_form: {
						alarm_setting: "",
						push_message: 0,
						has_level: 0,
						message_content: "",
						unit: "个",
					}
				}
			]
		},
		apply_map: {
			map_scope: APPLY_MAP_SCOPE.custom,
			is_inverse: 0,
			map_table_data: []
		},
		apply_object: {
			apply_object_type: APPLY_OBJECT_TYPE.tag,
			apply_object_alarm: APPLY_OBJECT_ALARM.include,
			apply_object_unbind: APPLY_OBJECT_UNBIND.alarm,
			apply_person: APPLY_PERSON.all,
			apply_person_checked_list: [],
			apply_truck: APPLY_TRUCK.none,
			apply_truck_checked_list: [],
			apply_visitor: APPLY_VISITOR.none,
			apply_visitor_checked_list: [],
			apply_material: APPLY_MATERIAL.none,
			apply_material_checked_list: [],
			apply_contractor: APPLY_CONTRACTOR.none,
			apply_contractor_checked_list: [],
			apply_card_type: APPLY_CARD_TYPE.all,
			apply_card_type_checked_list: []
		},
		effect_schedule: {
			effect_date_select: EFFECT_DATE.all,
			effect_date_custom: [],
			effect_week_select: EFFECT_WEEK.all,
			effect_week_custom: [],
			effect_time_select: EFFECT_TIME.all,
			effect_time_custom: [],
			effect_time_list: []
		},
		handling_alarm: {
			is_required: HANDLING_ALARM.optional,
		}
	}),
	form_config: {
		enable_icon_tip: "禁用会导致“未结束的告警”全部结束告警",
		rule_setting_title_tip: "在“告警适用地图范围”内，“告警适用对象”数量小于设置值，则触发告警。",
		alarm_level_num: 3,
		alarm_setting_label: "数量下限",
		alarm_setting_label_width: "130px",
		alarm_setting_label_key: "num",
		alarm_setting_units: [{label: "个", value: "个"}],
		alarm_setting_placeholder: "请输入",
		alarm_setting_disabled: {a: false, b: false, c: false},
		alarm_setting_rule: "asc",
		show_push_message: true,
		alarm_setting_update: (value: string) => filterNonNegativeInteger(value, false),

		apply_map_options: getApplyMapOptions([APPLY_MAP_SCOPE.custom]),
		show_inverse_map_scope: false,
		shuttle_map_options: getShuttleMapOptions([SHUTTLE_MAP_TYPE.virtual_fence]),
		shuttle_map_multiple: true,

		apply_object_type_options: getApplyObjectTypeOptions([APPLY_OBJECT_TYPE.tag]),
		apply_object_alarm_options: getApplyObjectAlarmOptions([APPLY_OBJECT_ALARM.include, APPLY_OBJECT_ALARM.exclude]),
		apply_object_unbind_options: getApplyObjectUnbindOptions([APPLY_OBJECT_UNBIND.alarm]),
		tag_type: {person: true, truck: true, visitor: true, material: true, contractor: true},
		apply_person_options: getApplyPersonOptions([APPLY_PERSON.all, APPLY_PERSON.none, APPLY_PERSON.custom]),
		apply_visitor_options: getApplyVisitorOptions([APPLY_VISITOR.all, APPLY_VISITOR.none, APPLY_VISITOR.custom]),
		apply_truck_options: getApplyTruckOptions([APPLY_TRUCK.all, APPLY_TRUCK.none, APPLY_TRUCK.custom]),
		apply_material_options: getApplyMaterialOptions([APPLY_MATERIAL.all, APPLY_MATERIAL.none, APPLY_MATERIAL.custom]),
		apply_contractor_options: getApplyContractorOptions([APPLY_CONTRACTOR.all, APPLY_CONTRACTOR.none, APPLY_CONTRACTOR.custom]),
		apply_card_type_options: getApplyCardTypeOptions([APPLY_CARD_TYPE.all, APPLY_CARD_TYPE.custom]),

		effect_schedule_class: {date: true, week: true, time: true},
		effect_date_options: getEffectDateOptions([EFFECT_DATE.all, EFFECT_DATE.custom]),
		effect_week_options: getEffectWeekOptions([EFFECT_WEEK.all, EFFECT_WEEK.custom]),
		effect_time_options: getEffectTimeOptions([EFFECT_TIME.all, EFFECT_TIME.custom]),

		handling_alarm_options: getHandlingAlarmOptions([HANDLING_ALARM.optional, HANDLING_ALARM.required])
	},
	menus: getMenus()
};

const pit_overcrowded_config: AlarmRuleConfigItem = {
	getDefaultForm: () => ({
		base: {
			type: ALARM_RULE_TYPE.pit_overcrowded,
			is_use: 1,
			name: "",
			rule_group_id: undefined,
			remark: "",
		},
		rule_setting: {
			alarm_list: [
				{
					level: "a",
					init_form: {
						alarm_setting: "",
						push_message: 0,
						has_level: 0,
						message_content: "",
						unit: "个",
					}
				}
			]
		},
		apply_map: {
			map_scope: APPLY_MAP_SCOPE.custom,
			is_inverse: 0,
			map_table_data: []
		},
		apply_object: {
			apply_object_type: APPLY_OBJECT_TYPE.tag,
			apply_object_alarm: APPLY_OBJECT_ALARM.include,
			apply_object_unbind: APPLY_OBJECT_UNBIND.alarm,
			apply_person: APPLY_PERSON.all,
			apply_person_checked_list: [],
			apply_truck: APPLY_TRUCK.none,
			apply_truck_checked_list: [],
			apply_visitor: APPLY_VISITOR.all,
			apply_visitor_checked_list: [],
			apply_material: APPLY_MATERIAL.none,
			apply_material_checked_list: [],
			apply_contractor: APPLY_CONTRACTOR.all,
			apply_contractor_checked_list: [],
			apply_card_type: APPLY_CARD_TYPE.all,
			apply_card_type_checked_list: []
		},
		effect_schedule: {
			effect_date_select: EFFECT_DATE.all,
			effect_date_custom: [],
			effect_week_select: EFFECT_WEEK.all,
			effect_week_custom: [],
			effect_time_select: EFFECT_TIME.all,
			effect_time_custom: [],
			effect_time_list: []
		},
		handling_alarm: {
			is_required: HANDLING_ALARM.optional,
		}
	}),
	form_config: {
		enable_icon_tip: "禁用会导致“未结束的告警”全部结束告警",
		rule_setting_title_tip: "在“告警适用地图范围”内，“告警适用对象”数量大于设置值，则触发告警。",
		alarm_level_num: 3,
		alarm_setting_label: "数量上限",
		alarm_setting_label_width: "130px",
		alarm_setting_label_key: "num",
		alarm_setting_units: [{label: "个", value: "个"}],
		alarm_setting_placeholder: "请输入正整数",
		alarm_setting_disabled: {a: false, b: false, c: false},
		alarm_setting_rule: "desc",
		show_push_message: true,
		alarm_setting_update: (value: string) => filterNonNegativeInteger(value, false),

		apply_map_options: getApplyMapOptions([APPLY_MAP_SCOPE.custom]),
		show_inverse_map_scope: false,
		shuttle_map_options: getShuttleMapOptions([SHUTTLE_MAP_TYPE.scene]),
		shuttle_map_multiple: false,

		apply_object_type_options: getApplyObjectTypeOptions([APPLY_OBJECT_TYPE.tag, APPLY_OBJECT_TYPE.card_type]),
		apply_object_alarm_options: getApplyObjectAlarmOptions([APPLY_OBJECT_ALARM.include, APPLY_OBJECT_ALARM.exclude]),
		apply_object_unbind_options: getApplyObjectUnbindOptions([APPLY_OBJECT_UNBIND.alarm]),
		tag_type: {person: true, truck: true, visitor: true, material: true, contractor: true},
		apply_person_options: getApplyPersonOptions([APPLY_PERSON.all, APPLY_PERSON.none, APPLY_PERSON.custom]),
		apply_visitor_options: getApplyVisitorOptions([APPLY_VISITOR.all, APPLY_VISITOR.none, APPLY_VISITOR.custom]),
		apply_truck_options: getApplyTruckOptions([APPLY_TRUCK.all, APPLY_TRUCK.none, APPLY_TRUCK.custom]),
		apply_material_options: getApplyMaterialOptions([APPLY_MATERIAL.all, APPLY_MATERIAL.none, APPLY_MATERIAL.custom]),
		apply_contractor_options: getApplyContractorOptions([APPLY_CONTRACTOR.all, APPLY_CONTRACTOR.none, APPLY_CONTRACTOR.custom]),
		apply_card_type_options: getApplyCardTypeOptions([APPLY_CARD_TYPE.all, APPLY_CARD_TYPE.custom]),

		effect_schedule_class: {date: true, week: true, time: true},
		effect_date_options: getEffectDateOptions([EFFECT_DATE.all, EFFECT_DATE.custom]),
		effect_week_options: getEffectWeekOptions([EFFECT_WEEK.all, EFFECT_WEEK.custom]),
		effect_time_options: getEffectTimeOptions([EFFECT_TIME.all, EFFECT_TIME.custom]),

		handling_alarm_options: getHandlingAlarmOptions([HANDLING_ALARM.optional, HANDLING_ALARM.required])
	},
	menus: getMenus()
};

const pit_shortage_config: AlarmRuleConfigItem = {
	getDefaultForm: () => ({
		base: {
			type: ALARM_RULE_TYPE.pit_shortage,
			is_use: 1,
			name: "",
			rule_group_id: undefined,
			remark: "",
		},
		rule_setting: {
			alarm_list: [
				{
					level: "a",
					init_form: {
						alarm_setting: "",
						push_message: 0,
						has_level: 0,
						message_content: "",
						unit: "个",
					}
				}
			]
		},
		apply_map: {
			map_scope: APPLY_MAP_SCOPE.custom,
			is_inverse: 0,
			map_table_data: []
		},
		apply_object: {
			apply_object_type: APPLY_OBJECT_TYPE.tag,
			apply_object_alarm: APPLY_OBJECT_ALARM.include,
			apply_object_unbind: APPLY_OBJECT_UNBIND.alarm,
			apply_person: APPLY_PERSON.all,
			apply_person_checked_list: [],
			apply_truck: APPLY_TRUCK.none,
			apply_truck_checked_list: [],
			apply_visitor: APPLY_VISITOR.all,
			apply_visitor_checked_list: [],
			apply_material: APPLY_MATERIAL.none,
			apply_material_checked_list: [],
			apply_contractor: APPLY_CONTRACTOR.all,
			apply_contractor_checked_list: [],
			apply_card_type: APPLY_CARD_TYPE.custom,
			apply_card_type_checked_list: []
		},
		effect_schedule: {
			effect_date_select: EFFECT_DATE.all,
			effect_date_custom: [],
			effect_week_select: EFFECT_WEEK.all,
			effect_week_custom: [],
			effect_time_select: EFFECT_TIME.all,
			effect_time_custom: [],
			effect_time_list: []
		},
		handling_alarm: {
			is_required: HANDLING_ALARM.optional,
		}
	}),
	form_config: {
		enable_icon_tip: "禁用会导致“未结束的告警”全部结束告警",
		rule_setting_title_tip: "在“告警使用地图范围”内“告警适用对象”数量少于设置值，则触发告警。",
		alarm_level_num: 3,
		alarm_setting_label: "数量下限",
		alarm_setting_label_width: "130px",
		alarm_setting_label_key: "num",
		alarm_setting_units: [{label: "个", value: "个"}],
		alarm_setting_placeholder: "请输入",
		alarm_setting_disabled: {a: false, b: false, c: false},
		alarm_setting_rule: "asc",
		show_push_message: true,
		alarm_setting_update: (value: string) => filterNonNegativeInteger(value, false),

		apply_map_options: getApplyMapOptions([APPLY_MAP_SCOPE.custom]),
		show_inverse_map_scope: false,
		shuttle_map_options: getShuttleMapOptions([SHUTTLE_MAP_TYPE.scene]),
		shuttle_map_multiple: false,

		apply_object_type_options: getApplyObjectTypeOptions([APPLY_OBJECT_TYPE.tag, APPLY_OBJECT_TYPE.card_type]),
		apply_object_alarm_options: getApplyObjectAlarmOptions([APPLY_OBJECT_ALARM.include, APPLY_OBJECT_ALARM.exclude]),
		apply_object_unbind_options: getApplyObjectUnbindOptions([APPLY_OBJECT_UNBIND.alarm]),
		tag_type: {person: true, truck: true, visitor: true, material: true, contractor: true},
		apply_person_options: getApplyPersonOptions([APPLY_PERSON.all, APPLY_PERSON.none, APPLY_PERSON.custom]),
		apply_visitor_options: getApplyVisitorOptions([APPLY_VISITOR.all, APPLY_VISITOR.none, APPLY_VISITOR.custom]),
		apply_truck_options: getApplyTruckOptions([APPLY_TRUCK.all, APPLY_TRUCK.none, APPLY_TRUCK.custom]),
		apply_material_options: getApplyMaterialOptions([APPLY_MATERIAL.all, APPLY_MATERIAL.none, APPLY_MATERIAL.custom]),
		apply_contractor_options: getApplyContractorOptions([APPLY_CONTRACTOR.all, APPLY_CONTRACTOR.none, APPLY_CONTRACTOR.custom]),
		apply_card_type_options: getApplyCardTypeOptions([APPLY_CARD_TYPE.all, APPLY_CARD_TYPE.custom]),

		effect_schedule_class: {date: true, week: true, time: true},
		effect_date_options: getEffectDateOptions([EFFECT_DATE.all, EFFECT_DATE.custom]),
		effect_week_options: getEffectWeekOptions([EFFECT_WEEK.all, EFFECT_WEEK.custom]),
		effect_time_options: getEffectTimeOptions([EFFECT_TIME.all, EFFECT_TIME.custom]),

		handling_alarm_options: getHandlingAlarmOptions([HANDLING_ALARM.optional, HANDLING_ALARM.required])
	},
	menus: getMenus()
};

const safe_region_config: AlarmRuleConfigItem = {
	getDefaultForm: () => ({
		base: {
			type: ALARM_RULE_TYPE.safe_region,
			is_use: 1,
			name: "",
			rule_group_id: undefined,
			remark: "",
		},
		rule_setting: {
			alarm_list: [
				{
					level: "a",
					init_form: {
						alarm_setting: "",
						push_message: 0,
						has_level: 0,
						message_content: "",
						unit: "",
					}
				}
			]
		},
		apply_map: {
			map_scope: APPLY_MAP_SCOPE.custom,
			is_inverse: 0,
			map_table_data: []
		},
		apply_object: {
			apply_object_type: APPLY_OBJECT_TYPE.tag,
			apply_object_alarm: APPLY_OBJECT_ALARM.include,
			apply_object_unbind: APPLY_OBJECT_UNBIND.alarm,
			apply_person: APPLY_PERSON.all,
			apply_person_checked_list: [],
			apply_truck: APPLY_TRUCK.none,
			apply_truck_checked_list: [],
			apply_visitor: APPLY_VISITOR.all,
			apply_visitor_checked_list: [],
			apply_material: APPLY_MATERIAL.none,
			apply_material_checked_list: [],
			apply_contractor: APPLY_CONTRACTOR.all,
			apply_contractor_checked_list: [],
			apply_card_type: APPLY_CARD_TYPE.all,
			apply_card_type_checked_list: []
		},
		effect_schedule: {
			effect_date_select: EFFECT_DATE.all,
			effect_date_custom: [],
			effect_week_select: EFFECT_WEEK.all,
			effect_week_custom: [],
			effect_time_select: EFFECT_TIME.all,
			effect_time_custom: [],
			effect_time_list: []
		},
		handling_alarm: {
			is_required: HANDLING_ALARM.optional,
		}
	}),
	form_config: {
		enable_icon_tip: "禁用会导致“未结束的告警”全部结束告警",
		rule_setting_title_tip: "首页启动“紧急撤离”功能后，可查看“告警适用对象”是否撤离至安全区域",
		alarm_level_num: 1,
		alarm_setting_label: "",
		alarm_setting_label_width: "130px",
		alarm_setting_label_key: "",
		alarm_setting_units: [],
		alarm_setting_placeholder: "",
		show_push_message: true,
		alarm_setting_disabled: {a: false, b: false, c: false},

		apply_map_options: getApplyMapOptions([APPLY_MAP_SCOPE.custom]),
		show_inverse_map_scope: false,
		shuttle_map_options: getShuttleMapOptions([SHUTTLE_MAP_TYPE.virtual_fence]),
		shuttle_map_multiple: true,

		apply_object_type_options: getApplyObjectTypeOptions([APPLY_OBJECT_TYPE.tag]),
		apply_object_alarm_options: getApplyObjectAlarmOptions([APPLY_OBJECT_ALARM.include, APPLY_OBJECT_ALARM.exclude]),
		apply_object_unbind_options: getApplyObjectUnbindOptions([APPLY_OBJECT_UNBIND.alarm]),
		tag_type: {person: true, truck: true, visitor: true, material: true, contractor: true},
		apply_person_options: getApplyPersonOptions([APPLY_PERSON.all, APPLY_PERSON.none, APPLY_PERSON.custom]),
		apply_visitor_options: getApplyVisitorOptions([APPLY_VISITOR.all, APPLY_VISITOR.none, APPLY_VISITOR.custom]),
		apply_truck_options: getApplyTruckOptions([APPLY_TRUCK.all, APPLY_TRUCK.none, APPLY_TRUCK.custom]),
		apply_material_options: getApplyMaterialOptions([APPLY_MATERIAL.all, APPLY_MATERIAL.none, APPLY_MATERIAL.custom]),
		apply_contractor_options: getApplyContractorOptions([APPLY_CONTRACTOR.all, APPLY_CONTRACTOR.none, APPLY_CONTRACTOR.custom]),
		apply_card_type_options: getApplyCardTypeOptions([APPLY_CARD_TYPE.all, APPLY_CARD_TYPE.custom]),

		effect_schedule_class: {date: false, week: false, time: false},
		effect_date_options: getEffectDateOptions([EFFECT_DATE.all, EFFECT_DATE.custom]),
		effect_week_options: getEffectWeekOptions([EFFECT_WEEK.all, EFFECT_WEEK.custom]),
		effect_time_options: getEffectTimeOptions([EFFECT_TIME.all, EFFECT_TIME.custom]),

		handling_alarm_options: getHandlingAlarmOptions([HANDLING_ALARM.optional, HANDLING_ALARM.required])
	},
	menus: getMenus(["生效时间", "告警手动处理设置", "危险源", "靠近不告警对象", "被陪同对象", "陪同对象"])
};

const region_timeout_config: AlarmRuleConfigItem = {
	getDefaultForm: () => ({
		base: {
			type: ALARM_RULE_TYPE.region_timeout,
			is_use: 1,
			name: "",
			rule_group_id: undefined,
			remark: "",
		},
		rule_setting: {
			alarm_list: [
				{
					level: "a",
					init_form: {
						alarm_setting: "",
						push_message: 0,
						has_level: 0,
						message_content: "",
						unit: "秒",
					}
				}
			]
		},
		apply_map: {
			map_scope: APPLY_MAP_SCOPE.custom,
			is_inverse: 0,
			map_table_data: []
		},
		apply_object: {
			apply_object_type: APPLY_OBJECT_TYPE.tag,
			apply_object_alarm: APPLY_OBJECT_ALARM.include,
			apply_object_unbind: APPLY_OBJECT_UNBIND.alarm,
			apply_person: APPLY_PERSON.all,
			apply_person_checked_list: [],
			apply_truck: APPLY_TRUCK.none,
			apply_truck_checked_list: [],
			apply_visitor: APPLY_VISITOR.none,
			apply_visitor_checked_list: [],
			apply_material: APPLY_MATERIAL.none,
			apply_material_checked_list: [],
			apply_contractor: APPLY_CONTRACTOR.none,
			apply_contractor_checked_list: [],
			apply_card_type: APPLY_CARD_TYPE.all,
			apply_card_type_checked_list: []
		},
		effect_schedule: {
			effect_date_select: EFFECT_DATE.all,
			effect_date_custom: [],
			effect_week_select: EFFECT_WEEK.all,
			effect_week_custom: [],
			effect_time_select: EFFECT_TIME.all,
			effect_time_custom: [],
			effect_time_list: []
		},
		handling_alarm: {
			is_required: HANDLING_ALARM.optional,
		}
	}),
	form_config: {
		enable_icon_tip: "禁用会导致“未结束的告警”全部结束告警",
		rule_setting_title_tip: "在“告警适用地图范围”内，“告警适用对象”停留时间大于设置值，则触发告警。",
		alarm_level_num: 3,
		alarm_setting_label: "停留时长上限",
		alarm_setting_label_width: "130px",
		alarm_setting_label_key: "timeout",
		alarm_setting_units: [
			{label: "秒", value: TIME_UNIT.second},
			{label: "分钟", value: TIME_UNIT.minute},
			{label: "小时", value: TIME_UNIT.hour},
		],
		alarm_setting_placeholder: "请输入0或正整数",
		alarm_setting_disabled: {a: false, b: false, c: false},
		alarm_setting_rule: "desc",
		show_push_message: true,
		alarm_setting_update: (value: string) => filterNonNegativeInteger(value, true),

		apply_map_options: getApplyMapOptions([APPLY_MAP_SCOPE.custom]),
		show_inverse_map_scope: false,
		shuttle_map_options: getShuttleMapOptions([SHUTTLE_MAP_TYPE.virtual_fence]),
		shuttle_map_multiple: true,

		apply_object_type_options: getApplyObjectTypeOptions([APPLY_OBJECT_TYPE.tag]),
		apply_object_alarm_options: getApplyObjectAlarmOptions([APPLY_OBJECT_ALARM.include, APPLY_OBJECT_ALARM.exclude]),
		apply_object_unbind_options: getApplyObjectUnbindOptions([APPLY_OBJECT_UNBIND.alarm]),
		tag_type: {person: true, truck: true, visitor: true, material: true, contractor: true},
		apply_person_options: getApplyPersonOptions([APPLY_PERSON.all, APPLY_PERSON.none, APPLY_PERSON.custom]),
		apply_visitor_options: getApplyVisitorOptions([APPLY_VISITOR.all, APPLY_VISITOR.none, APPLY_VISITOR.custom]),
		apply_truck_options: getApplyTruckOptions([APPLY_TRUCK.all, APPLY_TRUCK.none, APPLY_TRUCK.custom]),
		apply_material_options: getApplyMaterialOptions([APPLY_MATERIAL.all, APPLY_MATERIAL.none, APPLY_MATERIAL.custom]),
		apply_contractor_options: getApplyContractorOptions([APPLY_CONTRACTOR.all, APPLY_CONTRACTOR.none, APPLY_CONTRACTOR.custom]),
		apply_card_type_options: getApplyCardTypeOptions([APPLY_CARD_TYPE.all, APPLY_CARD_TYPE.custom]),

		effect_schedule_class: {date: true, week: true, time: true},
		effect_date_options: getEffectDateOptions([EFFECT_DATE.all, EFFECT_DATE.custom]),
		effect_week_options: getEffectWeekOptions([EFFECT_WEEK.all, EFFECT_WEEK.custom]),
		effect_time_options: getEffectTimeOptions([EFFECT_TIME.all, EFFECT_TIME.custom]),

		handling_alarm_options: getHandlingAlarmOptions([HANDLING_ALARM.optional, HANDLING_ALARM.required])
	},
	menus: getMenus()
};

const forbidden_departure_config: AlarmRuleConfigItem = {
	getDefaultForm: () => ({
		base: {
			type: ALARM_RULE_TYPE.forbidden_departure,
			is_use: 1,
			name: "",
			rule_group_id: undefined,
			remark: "",
		},
		rule_setting: {
			enter_require: ENTER_REQUIRE.disable,
			merge_area: MERGE_AREA.individual,
			alarm_list: [
				{
					level: "a",
					init_form: {
						alarm_setting: "",
						push_message: 0,
						has_level: 0,
						message_content: "",
						unit: "秒",
					}
				}
			]
		},
		apply_map: {
			map_scope: APPLY_MAP_SCOPE.custom,
			is_inverse: 0,
			map_table_data: []
		},
		apply_object: {
			apply_object_type: APPLY_OBJECT_TYPE.tag,
			apply_object_alarm: APPLY_OBJECT_ALARM.include,
			apply_object_unbind: APPLY_OBJECT_UNBIND.alarm,
			apply_person: APPLY_PERSON.none,
			apply_person_checked_list: [],
			apply_truck: APPLY_TRUCK.none,
			apply_truck_checked_list: [],
			apply_visitor: APPLY_VISITOR.none,
			apply_visitor_checked_list: [],
			apply_material: APPLY_MATERIAL.none,
			apply_material_checked_list: [],
			apply_contractor: APPLY_CONTRACTOR.none,
			apply_contractor_checked_list: [],
			apply_card_type: APPLY_CARD_TYPE.all,
			apply_card_type_checked_list: []
		},
		effect_schedule: {
			effect_date_select: EFFECT_DATE.all,
			effect_date_custom: [],
			effect_week_select: EFFECT_WEEK.all,
			effect_week_custom: [],
			effect_time_select: EFFECT_TIME.all,
			effect_time_custom: [],
			effect_time_list: []
		},
		handling_alarm: {
			is_required: HANDLING_ALARM.optional,
		}
	}),
	form_config: {
		enable_icon_tip: "禁用会导致“未结束的告警”全部结束告警",
		rule_setting_title_tip: "在“告警适用地图范围”内，“规则适用对象”大于设置值仍未返回，则触发告警。",
		alarm_level_num: 3,
		alarm_setting_label: "离开未归时长上限",
		alarm_setting_label_width: "140px",
		alarm_setting_label_key: "leave_max_time",
		alarm_setting_units: [
			{label: "秒", value: TIME_UNIT.second},
			{label: "分钟", value: TIME_UNIT.minute},
			{label: "小时", value: TIME_UNIT.hour},
		],
		alarm_setting_placeholder: "请输入0或正整数",
		alarm_setting_disabled: {a: false, b: false, c: false},
		alarm_setting_rule: "desc",
		show_push_message: true,
		alarm_setting_update: (value: string) => filterNonNegativeInteger(value, true),

		apply_map_options: getApplyMapOptions([APPLY_MAP_SCOPE.custom]),
		show_inverse_map_scope: false,
		shuttle_map_options: getShuttleMapOptions([SHUTTLE_MAP_TYPE.virtual_fence]),
		shuttle_map_multiple: true,

		apply_object_type_options: getApplyObjectTypeOptions([APPLY_OBJECT_TYPE.tag]),
		apply_object_alarm_options: getApplyObjectAlarmOptions([APPLY_OBJECT_ALARM.include, APPLY_OBJECT_ALARM.exclude]),
		apply_object_unbind_options: getApplyObjectUnbindOptions([APPLY_OBJECT_UNBIND.alarm, APPLY_OBJECT_UNBIND.no_alarm]),
		tag_type: {person: true, truck: true, visitor: true, material: true, contractor: true},
		apply_person_options: getApplyPersonOptions([APPLY_PERSON.all, APPLY_PERSON.none, APPLY_PERSON.custom]),
		apply_visitor_options: getApplyVisitorOptions([APPLY_VISITOR.all, APPLY_VISITOR.none, APPLY_VISITOR.custom]),
		apply_truck_options: getApplyTruckOptions([APPLY_TRUCK.all, APPLY_TRUCK.none, APPLY_TRUCK.custom]),
		apply_material_options: getApplyMaterialOptions([APPLY_MATERIAL.all, APPLY_MATERIAL.none, APPLY_MATERIAL.custom]),
		apply_contractor_options: getApplyContractorOptions([APPLY_CONTRACTOR.all, APPLY_CONTRACTOR.none, APPLY_CONTRACTOR.custom]),
		apply_card_type_options: getApplyCardTypeOptions([APPLY_CARD_TYPE.all, APPLY_CARD_TYPE.custom]),

		effect_schedule_class: {date: true, week: true, time: true},
		effect_date_options: getEffectDateOptions([EFFECT_DATE.all, EFFECT_DATE.custom]),
		effect_week_options: getEffectWeekOptions([EFFECT_WEEK.all, EFFECT_WEEK.custom]),
		effect_time_options: getEffectTimeOptions([EFFECT_TIME.all, EFFECT_TIME.custom]),

		handling_alarm_options: getHandlingAlarmOptions([HANDLING_ALARM.optional, HANDLING_ALARM.required])
	},
	menus: getMenus()
};

const work_timeout_config: AlarmRuleConfigItem = {
	getDefaultForm: () => ({
		base: {
			type: ALARM_RULE_TYPE.work_timeout,
			is_use: 1,
			name: "",
			rule_group_id: undefined,
			remark: "",
		},
		rule_setting: {
			alarm_list: [
				{
					level: "a",
					init_form: {
						alarm_setting: "",
						push_message: 0,
						has_level: 0,
						message_content: "",
						unit: "秒",
					}
				}
			]
		},
		apply_map: {
			map_scope: APPLY_MAP_SCOPE.all,
			is_inverse: 0,
			map_table_data: []
		},
		apply_object: {
			apply_object_type: APPLY_OBJECT_TYPE.tag,
			apply_object_alarm: APPLY_OBJECT_ALARM.include,
			apply_object_unbind: APPLY_OBJECT_UNBIND.alarm,
			apply_person: APPLY_PERSON.all,
			apply_person_checked_list: [],
			apply_truck: APPLY_TRUCK.none,
			apply_truck_checked_list: [],
			apply_visitor: APPLY_VISITOR.none,
			apply_visitor_checked_list: [],
			apply_material: APPLY_MATERIAL.none,
			apply_material_checked_list: [],
			apply_contractor: APPLY_CONTRACTOR.none,
			apply_contractor_checked_list: [],
			apply_card_type: APPLY_CARD_TYPE.all,
			apply_card_type_checked_list: []
		},
		effect_schedule: {
			effect_date_select: EFFECT_DATE.all,
			effect_date_custom: [],
			effect_week_select: EFFECT_WEEK.all,
			effect_week_custom: [],
			effect_time_select: EFFECT_TIME.all,
			effect_time_custom: [],
			effect_time_list: []
		},
		handling_alarm: {
			is_required: HANDLING_ALARM.optional,
		}
	}),
	form_config: {
		enable_icon_tip: "禁用后“未结束的告警”不会结束",
		rule_setting_title_tip: "员工实际工作时长大于“员工考勤设置的要求工作时长+设置时长”，则触发告警。",
		alarm_level_num: 3,
		alarm_setting_label: "超时时长上限",
		alarm_setting_label_width: "130px",
		alarm_setting_label_key: "timeout",
		alarm_setting_units: [
			{label: "秒", value: TIME_UNIT.second},
			{label: "分钟", value: TIME_UNIT.minute},
			{label: "小时", value: TIME_UNIT.hour},
		],
		alarm_setting_placeholder: "请输入0或正整数",
		alarm_setting_disabled: {a: false, b: false, c: false},
		alarm_setting_rule: "desc",
		show_push_message: true,
		alarm_setting_update: (value: string) => filterNonNegativeInteger(value, true),

		apply_map_options: getApplyMapOptions([APPLY_MAP_SCOPE.all]),
		show_inverse_map_scope: false,
		shuttle_map_options: getShuttleMapOptions([SHUTTLE_MAP_TYPE.virtual_fence]),
		shuttle_map_multiple: true,

		apply_object_type_options: getApplyObjectTypeOptions([APPLY_OBJECT_TYPE.tag]),
		apply_object_alarm_options: getApplyObjectAlarmOptions([APPLY_OBJECT_ALARM.include]),
		apply_object_unbind_options: getApplyObjectUnbindOptions([APPLY_OBJECT_UNBIND.alarm]),
		tag_type: {person: true, truck: false, visitor: false, material: false, contractor: false},
		apply_person_options: getApplyPersonOptions([APPLY_PERSON.all, APPLY_PERSON.none, APPLY_PERSON.custom]),
		apply_visitor_options: getApplyVisitorOptions([APPLY_VISITOR.all, APPLY_VISITOR.none, APPLY_VISITOR.custom]),
		apply_truck_options: getApplyTruckOptions([APPLY_TRUCK.all, APPLY_TRUCK.none, APPLY_TRUCK.custom]),
		apply_material_options: getApplyMaterialOptions([APPLY_MATERIAL.all, APPLY_MATERIAL.none, APPLY_MATERIAL.custom]),
		apply_contractor_options: getApplyContractorOptions([APPLY_CONTRACTOR.all, APPLY_CONTRACTOR.none, APPLY_CONTRACTOR.custom]),
		apply_card_type_options: getApplyCardTypeOptions([APPLY_CARD_TYPE.all, APPLY_CARD_TYPE.custom]),

		effect_schedule_class: {date: true, week: true, time: true},
		effect_date_options: getEffectDateOptions([EFFECT_DATE.all, EFFECT_DATE.custom]),
		effect_week_options: getEffectWeekOptions([EFFECT_WEEK.all, EFFECT_WEEK.custom]),
		effect_time_options: getEffectTimeOptions([EFFECT_TIME.all, EFFECT_TIME.custom]),

		handling_alarm_options: getHandlingAlarmOptions([HANDLING_ALARM.optional, HANDLING_ALARM.required])
	},
	menus: getMenus()
};

const vehicle_speeding_config: AlarmRuleConfigItem = {
	getDefaultForm: () => ({
		base: {
			type: ALARM_RULE_TYPE.vehicle_speeding,
			is_use: 1,
			name: "",
			rule_group_id: undefined,
			remark: "",
		},
		rule_setting: {
			alarm_list: [
				{
					level: "a",
					init_form: {
						alarm_setting: "",
						push_message: 0,
						has_level: 0,
						message_content: "",
						unit: "km/h",
					}
				}
			]
		},
		apply_map: {
			map_scope: APPLY_MAP_SCOPE.all,
			is_inverse: 0,
			map_table_data: []
		},
		apply_object: {
			apply_object_type: APPLY_OBJECT_TYPE.tag,
			apply_object_alarm: APPLY_OBJECT_ALARM.include,
			apply_object_unbind: APPLY_OBJECT_UNBIND.alarm,
			apply_person: APPLY_PERSON.none,
			apply_person_checked_list: [],
			apply_truck: APPLY_TRUCK.all,
			apply_truck_checked_list: [],
			apply_visitor: APPLY_VISITOR.none,
			apply_visitor_checked_list: [],
			apply_material: APPLY_MATERIAL.none,
			apply_material_checked_list: [],
			apply_contractor: APPLY_CONTRACTOR.none,
			apply_contractor_checked_list: [],
			apply_card_type: APPLY_CARD_TYPE.all,
			apply_card_type_checked_list: []
		},
		effect_schedule: {
			effect_date_select: EFFECT_DATE.all,
			effect_date_custom: [],
			effect_week_select: EFFECT_WEEK.all,
			effect_week_custom: [],
			effect_time_select: EFFECT_TIME.all,
			effect_time_custom: [],
			effect_time_list: []
		},
		handling_alarm: {
			is_required: HANDLING_ALARM.optional,
		}
	}),
	form_config: {
		enable_icon_tip: "禁用会导致“未结束的告警”全部结束告警",
		rule_setting_title_tip: "在“告警适用地图范围”内，“告警适用对象”速度大于设置值，则触发告警。",
		alarm_level_num: 3,
		alarm_setting_label: "速度上限",
		alarm_setting_label_width: "130px",
		alarm_setting_label_key: "speed",
		alarm_setting_units: [
			{label: "km/h", value: "km/h"},
		],
		alarm_setting_placeholder: "请输入正整数",
		alarm_setting_disabled: {a: false, b: false, c: false},
		alarm_setting_rule: "desc",
		show_push_message: true,
		alarm_setting_update: (value: string) => filterNonNegativeInteger(value, false),

		apply_map_options: getApplyMapOptions([APPLY_MAP_SCOPE.all]),
		show_inverse_map_scope: false,
		shuttle_map_options: getShuttleMapOptions([SHUTTLE_MAP_TYPE.virtual_fence]),
		shuttle_map_multiple: true,

		apply_object_type_options: getApplyObjectTypeOptions([APPLY_OBJECT_TYPE.tag]),
		apply_object_alarm_options: getApplyObjectAlarmOptions([APPLY_OBJECT_ALARM.include, APPLY_OBJECT_ALARM.exclude]),
		apply_object_unbind_options: getApplyObjectUnbindOptions([APPLY_OBJECT_UNBIND.alarm]),
		tag_type: {person: false, truck: true, visitor: false, material: false, contractor: false},
		apply_person_options: getApplyPersonOptions([APPLY_PERSON.all, APPLY_PERSON.none, APPLY_PERSON.custom]),
		apply_visitor_options: getApplyVisitorOptions([APPLY_VISITOR.all, APPLY_VISITOR.none, APPLY_VISITOR.custom]),
		apply_truck_options: getApplyTruckOptions([APPLY_TRUCK.all, APPLY_TRUCK.none, APPLY_TRUCK.custom]),
		apply_material_options: getApplyMaterialOptions([APPLY_MATERIAL.all, APPLY_MATERIAL.none, APPLY_MATERIAL.custom]),
		apply_contractor_options: getApplyContractorOptions([APPLY_CONTRACTOR.all, APPLY_CONTRACTOR.none, APPLY_CONTRACTOR.custom]),
		apply_card_type_options: getApplyCardTypeOptions([APPLY_CARD_TYPE.all, APPLY_CARD_TYPE.custom]),

		effect_schedule_class: {date: true, week: true, time: true},
		effect_date_options: getEffectDateOptions([EFFECT_DATE.all, EFFECT_DATE.custom]),
		effect_week_options: getEffectWeekOptions([EFFECT_WEEK.all, EFFECT_WEEK.custom]),
		effect_time_options: getEffectTimeOptions([EFFECT_TIME.all, EFFECT_TIME.custom]),

		handling_alarm_options: getHandlingAlarmOptions([HANDLING_ALARM.optional, HANDLING_ALARM.required])
	},
	menus: getMenus()
};

const vehicle_overload_config: AlarmRuleConfigItem = {
	getDefaultForm: () => ({
		base: {
			type: ALARM_RULE_TYPE.vehicle_overload,
			is_use: 1,
			name: "",
			rule_group_id: undefined,
			remark: "",
		},
		rule_setting: {
			alarm_list: [
				{
					level: "a",
					init_form: {
						alarm_setting: "",
						push_message: 0,
						has_level: 0,
						message_content: "",
						unit: "个",
					}
				}
			]
		},
		apply_map: {
			map_scope: APPLY_MAP_SCOPE.all,
			is_inverse: 0,
			map_table_data: []
		},
		apply_object: {
			apply_object_type: APPLY_OBJECT_TYPE.tag,
			apply_object_alarm: APPLY_OBJECT_ALARM.include,
			apply_object_unbind: APPLY_OBJECT_UNBIND.alarm,
			apply_person: APPLY_PERSON.none,
			apply_person_checked_list: [],
			apply_truck: APPLY_TRUCK.all,
			apply_truck_checked_list: [],
			apply_visitor: APPLY_VISITOR.none,
			apply_visitor_checked_list: [],
			apply_material: APPLY_MATERIAL.none,
			apply_material_checked_list: [],
			apply_contractor: APPLY_CONTRACTOR.none,
			apply_contractor_checked_list: [],
			apply_card_type: APPLY_CARD_TYPE.all,
			apply_card_type_checked_list: []
		},
		effect_schedule: {
			effect_date_select: EFFECT_DATE.all,
			effect_date_custom: [],
			effect_week_select: EFFECT_WEEK.all,
			effect_week_custom: [],
			effect_time_select: EFFECT_TIME.all,
			effect_time_custom: [],
			effect_time_list: []
		},
		handling_alarm: {
			is_required: HANDLING_ALARM.optional,
		}
	}),
	form_config: {
		enable_icon_tip: "禁用会导致“未结束的告警”全部结束告警",
		rule_setting_title_tip: "在“告警适用地图范围”内，“告警适用对象”所载数量大于设置值，则触发告警。",
		alarm_level_num: 3,
		alarm_setting_label: "人数上限",
		alarm_setting_label_width: "130px",
		alarm_setting_label_key: "num",
		alarm_setting_units: [
			{label: "个", value: "个"},
		],
		alarm_setting_placeholder: "请输入0或正整数",
		alarm_setting_disabled: {a: false, b: false, c: false},
		alarm_setting_rule: "desc",
		show_push_message: true,
		alarm_setting_update: (value: string) => filterNonNegativeInteger(value, true),

		apply_map_options: getApplyMapOptions([APPLY_MAP_SCOPE.all]),
		show_inverse_map_scope: false,
		shuttle_map_options: getShuttleMapOptions([SHUTTLE_MAP_TYPE.virtual_fence]),
		shuttle_map_multiple: true,

		apply_object_type_options: getApplyObjectTypeOptions([APPLY_OBJECT_TYPE.tag]),
		apply_object_alarm_options: getApplyObjectAlarmOptions([APPLY_OBJECT_ALARM.include]),
		apply_object_unbind_options: getApplyObjectUnbindOptions([APPLY_OBJECT_UNBIND.alarm]),
		tag_type: {person: false, truck: true, visitor: false, material: false, contractor: false},
		apply_person_options: getApplyPersonOptions([APPLY_PERSON.all, APPLY_PERSON.none, APPLY_PERSON.custom]),
		apply_visitor_options: getApplyVisitorOptions([APPLY_VISITOR.all, APPLY_VISITOR.none, APPLY_VISITOR.custom]),
		apply_truck_options: getApplyTruckOptions([APPLY_TRUCK.all, APPLY_TRUCK.none, APPLY_TRUCK.custom]),
		apply_material_options: getApplyMaterialOptions([APPLY_MATERIAL.all, APPLY_MATERIAL.none, APPLY_MATERIAL.custom]),
		apply_contractor_options: getApplyContractorOptions([APPLY_CONTRACTOR.all, APPLY_CONTRACTOR.none, APPLY_CONTRACTOR.custom]),
		apply_card_type_options: getApplyCardTypeOptions([APPLY_CARD_TYPE.all, APPLY_CARD_TYPE.custom]),

		effect_schedule_class: {date: true, week: true, time: true},
		effect_date_options: getEffectDateOptions([EFFECT_DATE.all, EFFECT_DATE.custom]),
		effect_week_options: getEffectWeekOptions([EFFECT_WEEK.all, EFFECT_WEEK.custom]),
		effect_time_options: getEffectTimeOptions([EFFECT_TIME.all, EFFECT_TIME.custom]),

		handling_alarm_options: getHandlingAlarmOptions([HANDLING_ALARM.optional, HANDLING_ALARM.required])
	},
	menus: getMenus()
};

const gather_config: AlarmRuleConfigItem = {
	getDefaultForm: () => ({
		base: {
			type: ALARM_RULE_TYPE.gather,
			is_use: 1,
			name: "",
			rule_group_id: undefined,
			remark: "",
		},
		rule_setting: {
			gather_radius: "",
			gather_dur_time: "",
			alarm_list: [
				{
					level: "a",
					init_form: {
						alarm_setting: "",
						push_message: 0,
						has_level: 0,
						message_content: "",
						unit: "个",
					}
				}
			]
		},
		apply_map: {
			map_scope: APPLY_MAP_SCOPE.all,
			is_inverse: 0,
			map_table_data: []
		},
		apply_object: {
			apply_object_type: APPLY_OBJECT_TYPE.tag,
			apply_object_alarm: APPLY_OBJECT_ALARM.include,
			apply_object_unbind: APPLY_OBJECT_UNBIND.alarm,
			apply_person: APPLY_PERSON.all,
			apply_person_checked_list: [],
			apply_truck: APPLY_TRUCK.none,
			apply_truck_checked_list: [],
			apply_visitor: APPLY_VISITOR.none,
			apply_visitor_checked_list: [],
			apply_material: APPLY_MATERIAL.none,
			apply_material_checked_list: [],
			apply_contractor: APPLY_CONTRACTOR.none,
			apply_contractor_checked_list: [],
			apply_card_type: APPLY_CARD_TYPE.all,
			apply_card_type_checked_list: []
		},
		effect_schedule: {
			effect_date_select: EFFECT_DATE.all,
			effect_date_custom: [],
			effect_week_select: EFFECT_WEEK.all,
			effect_week_custom: [],
			effect_time_select: EFFECT_TIME.all,
			effect_time_custom: [],
			effect_time_list: []
		},
		handling_alarm: {
			is_required: HANDLING_ALARM.optional,
		}
	}),
	form_config: {
		enable_icon_tip: "禁用会导致“未结束的告警”全部结束告警",
		rule_setting_title_tip: "在“告警适用地图范围”内，以“告警适用对象”为圆心，半径范围设置值为半径（含设置值）的圆内：“告警适用对象”数量大于数量设定值，且“持续时长”大于设置值后，则触发告警。",
		alarm_level_num: 3,
		alarm_setting_label: "数量上限",
		alarm_setting_label_width: "130px",
		alarm_setting_label_key: "num",
		alarm_setting_units: [
			{label: "个", value: "个"},
		],
		alarm_setting_placeholder: "请输入正整数",
		alarm_setting_disabled: {a: false, b: false, c: false},
		alarm_setting_rule: "desc",
		show_push_message: true,
		alarm_setting_update: (value: string) => filterNonNegativeInteger(value, false),

		apply_map_options: getApplyMapOptions([APPLY_MAP_SCOPE.all, APPLY_MAP_SCOPE.custom]),
		show_inverse_map_scope: true,
		shuttle_map_options: getShuttleMapOptions([SHUTTLE_MAP_TYPE.virtual_fence]),
		shuttle_map_multiple: true,

		apply_object_type_options: getApplyObjectTypeOptions([APPLY_OBJECT_TYPE.tag]),
		apply_object_alarm_options: getApplyObjectAlarmOptions([APPLY_OBJECT_ALARM.include, APPLY_OBJECT_ALARM.exclude]),
		apply_object_unbind_options: getApplyObjectUnbindOptions([APPLY_OBJECT_UNBIND.alarm]),
		tag_type: {person: true, truck: true, visitor: true, material: true, contractor: true},
		apply_person_options: getApplyPersonOptions([APPLY_PERSON.all, APPLY_PERSON.none, APPLY_PERSON.custom]),
		apply_visitor_options: getApplyVisitorOptions([APPLY_VISITOR.all, APPLY_VISITOR.none, APPLY_VISITOR.custom]),
		apply_truck_options: getApplyTruckOptions([APPLY_TRUCK.all, APPLY_TRUCK.none, APPLY_TRUCK.custom]),
		apply_material_options: getApplyMaterialOptions([APPLY_MATERIAL.all, APPLY_MATERIAL.none, APPLY_MATERIAL.custom]),
		apply_contractor_options: getApplyContractorOptions([APPLY_CONTRACTOR.all, APPLY_CONTRACTOR.none, APPLY_CONTRACTOR.custom]),
		apply_card_type_options: getApplyCardTypeOptions([APPLY_CARD_TYPE.all, APPLY_CARD_TYPE.custom]),

		effect_schedule_class: {date: true, week: true, time: true},
		effect_date_options: getEffectDateOptions([EFFECT_DATE.all, EFFECT_DATE.custom]),
		effect_week_options: getEffectWeekOptions([EFFECT_WEEK.all, EFFECT_WEEK.custom]),
		effect_time_options: getEffectTimeOptions([EFFECT_TIME.all, EFFECT_TIME.custom]),

		handling_alarm_options: getHandlingAlarmOptions([HANDLING_ALARM.optional, HANDLING_ALARM.required])
	},
	menus: getMenus()
};

const stationary_config: AlarmRuleConfigItem = {
	getDefaultForm: () => ({
		base: {
			type: ALARM_RULE_TYPE.stationary,
			is_use: 1,
			name: "",
			rule_group_id: undefined,
			remark: "",
		},
		rule_setting: {
			alarm_list: [
				{
					level: "a",
					init_form: {
						alarm_setting: "",
						push_message: 0,
						has_level: 0,
						message_content: "",
						unit: "秒",
					}
				}
			]
		},
		apply_map: {
			map_scope: APPLY_MAP_SCOPE.custom,
			is_inverse: 0,
			map_table_data: []
		},
		apply_object: {
			apply_object_type: APPLY_OBJECT_TYPE.tag,
			apply_object_alarm: APPLY_OBJECT_ALARM.include,
			apply_object_unbind: APPLY_OBJECT_UNBIND.alarm,
			apply_person: APPLY_PERSON.all,
			apply_person_checked_list: [],
			apply_truck: APPLY_TRUCK.none,
			apply_truck_checked_list: [],
			apply_visitor: APPLY_VISITOR.none,
			apply_visitor_checked_list: [],
			apply_material: APPLY_MATERIAL.none,
			apply_material_checked_list: [],
			apply_contractor: APPLY_CONTRACTOR.none,
			apply_contractor_checked_list: [],
			apply_card_type: APPLY_CARD_TYPE.all,
			apply_card_type_checked_list: []
		},
		effect_schedule: {
			effect_date_select: EFFECT_DATE.all,
			effect_date_custom: [],
			effect_week_select: EFFECT_WEEK.all,
			effect_week_custom: [],
			effect_time_select: EFFECT_TIME.all,
			effect_time_custom: [],
			effect_time_list: []
		},
		handling_alarm: {
			is_required: HANDLING_ALARM.optional,
		}
	}),
	form_config: {
		enable_icon_tip: "禁用会导致“未结束的告警”全部结束告警",
		rule_setting_title_tip: "在“告警适用地图范围”内，“告警适用对象”不动的状态持续时长大于设置值后，则触发告警。",
		alarm_level_num: 3,
		alarm_setting_label: "状态持续时长上限",
		alarm_setting_label_width: "150px",
		alarm_setting_label_key: "timeout",
		alarm_setting_units: [
			{label: "秒", value: TIME_UNIT.second},
			{label: "分钟", value: TIME_UNIT.minute},
			{label: "小时", value: TIME_UNIT.hour},
		],
		alarm_setting_placeholder: "请输入0或正整数",
		alarm_setting_disabled: {a: false, b: false, c: false},
		alarm_setting_rule: "desc",
		show_push_message: true,
		alarm_setting_update: (value: string) => filterNonNegativeInteger(value, true),

		apply_map_options: getApplyMapOptions([APPLY_MAP_SCOPE.custom]),
		show_inverse_map_scope: true,
		shuttle_map_options: getShuttleMapOptions([SHUTTLE_MAP_TYPE.virtual_fence]),
		shuttle_map_multiple: true,

		apply_object_type_options: getApplyObjectTypeOptions([APPLY_OBJECT_TYPE.tag]),
		apply_object_alarm_options: getApplyObjectAlarmOptions([APPLY_OBJECT_ALARM.include, APPLY_OBJECT_ALARM.exclude]),
		apply_object_unbind_options: getApplyObjectUnbindOptions([APPLY_OBJECT_UNBIND.alarm]),
		tag_type: {person: true, truck: true, visitor: true, material: true, contractor: true},
		apply_person_options: getApplyPersonOptions([APPLY_PERSON.all, APPLY_PERSON.none, APPLY_PERSON.custom]),
		apply_visitor_options: getApplyVisitorOptions([APPLY_VISITOR.all, APPLY_VISITOR.none, APPLY_VISITOR.custom]),
		apply_truck_options: getApplyTruckOptions([APPLY_TRUCK.all, APPLY_TRUCK.none, APPLY_TRUCK.custom]),
		apply_material_options: getApplyMaterialOptions([APPLY_MATERIAL.all, APPLY_MATERIAL.none, APPLY_MATERIAL.custom]),
		apply_contractor_options: getApplyContractorOptions([APPLY_CONTRACTOR.all, APPLY_CONTRACTOR.none, APPLY_CONTRACTOR.custom]),
		apply_card_type_options: getApplyCardTypeOptions([APPLY_CARD_TYPE.all, APPLY_CARD_TYPE.custom]),

		effect_schedule_class: {date: true, week: true, time: true},
		effect_date_options: getEffectDateOptions([EFFECT_DATE.all, EFFECT_DATE.custom]),
		effect_week_options: getEffectWeekOptions([EFFECT_WEEK.all, EFFECT_WEEK.custom]),
		effect_time_options: getEffectTimeOptions([EFFECT_TIME.all, EFFECT_TIME.custom]),

		handling_alarm_options: getHandlingAlarmOptions([HANDLING_ALARM.optional, HANDLING_ALARM.required])
	},
	menus: getMenus()
};

const region_disappearance_config: AlarmRuleConfigItem = {
	getDefaultForm: () => ({
		base: {
			type: ALARM_RULE_TYPE.region_disappearance,
			is_use: 1,
			name: "",
			rule_group_id: undefined,
			remark: "",
		},
		rule_setting: {
			alarm_list: [
				{
					level: "a",
					init_form: {
						alarm_setting: "",
						push_message: 0,
						has_level: 0,
						message_content: "",
						unit: "秒",
					}
				}
			]
		},
		apply_map: {
			map_scope: APPLY_MAP_SCOPE.custom,
			is_inverse: 0,
			map_table_data: []
		},
		apply_object: {
			apply_object_type: APPLY_OBJECT_TYPE.tag,
			apply_object_alarm: APPLY_OBJECT_ALARM.include,
			apply_object_unbind: APPLY_OBJECT_UNBIND.alarm,
			apply_person: APPLY_PERSON.all,
			apply_person_checked_list: [],
			apply_truck: APPLY_TRUCK.none,
			apply_truck_checked_list: [],
			apply_visitor: APPLY_VISITOR.none,
			apply_visitor_checked_list: [],
			apply_material: APPLY_MATERIAL.none,
			apply_material_checked_list: [],
			apply_contractor: APPLY_CONTRACTOR.none,
			apply_contractor_checked_list: [],
			apply_card_type: APPLY_CARD_TYPE.all,
			apply_card_type_checked_list: []
		},
		effect_schedule: {
			effect_date_select: EFFECT_DATE.all,
			effect_date_custom: [],
			effect_week_select: EFFECT_WEEK.all,
			effect_week_custom: [],
			effect_time_select: EFFECT_TIME.all,
			effect_time_custom: [],
			effect_time_list: []
		},
		handling_alarm: {
			is_required: HANDLING_ALARM.optional,
		}
	}),
	form_config: {
		enable_icon_tip: "禁用会导致“未结束的告警”全部结束告警",
		rule_setting_title_tip: "在“告警适用地图范围”内，“告警适用对象”消失的状态持续时间大于设置值后，则触发告警。",
		alarm_level_num: 3,
		alarm_setting_label: "状态持续时长上限",
		alarm_setting_label_width: "150px",
		alarm_setting_label_key: "timeout",
		alarm_setting_units: [
			{label: "秒", value: TIME_UNIT.second},
			{label: "分钟", value: TIME_UNIT.minute},
			{label: "小时", value: TIME_UNIT.hour},
		],
		alarm_setting_placeholder: "请输入0或正整数",
		alarm_setting_disabled: {a: false, b: false, c: false},
		alarm_setting_rule: "desc",
		show_push_message: false,
		alarm_setting_update: (value: string) => filterNonNegativeInteger(value, true),

		apply_map_options: getApplyMapOptions([APPLY_MAP_SCOPE.custom]),
		show_inverse_map_scope: false,
		shuttle_map_options: getShuttleMapOptions([SHUTTLE_MAP_TYPE.virtual_fence]),
		shuttle_map_multiple: true,

		apply_object_type_options: getApplyObjectTypeOptions([APPLY_OBJECT_TYPE.tag]),
		apply_object_alarm_options: getApplyObjectAlarmOptions([APPLY_OBJECT_ALARM.include, APPLY_OBJECT_ALARM.exclude]),
		apply_object_unbind_options: getApplyObjectUnbindOptions([APPLY_OBJECT_UNBIND.alarm]),
		tag_type: {person: true, truck: true, visitor: true, material: true, contractor: true},
		apply_person_options: getApplyPersonOptions([APPLY_PERSON.all, APPLY_PERSON.none, APPLY_PERSON.custom]),
		apply_visitor_options: getApplyVisitorOptions([APPLY_VISITOR.all, APPLY_VISITOR.none, APPLY_VISITOR.custom]),
		apply_truck_options: getApplyTruckOptions([APPLY_TRUCK.all, APPLY_TRUCK.none, APPLY_TRUCK.custom]),
		apply_material_options: getApplyMaterialOptions([APPLY_MATERIAL.all, APPLY_MATERIAL.none, APPLY_MATERIAL.custom]),
		apply_contractor_options: getApplyContractorOptions([APPLY_CONTRACTOR.all, APPLY_CONTRACTOR.none, APPLY_CONTRACTOR.custom]),
		apply_card_type_options: getApplyCardTypeOptions([APPLY_CARD_TYPE.all, APPLY_CARD_TYPE.custom]),

		effect_schedule_class: {date: true, week: true, time: true},
		effect_date_options: getEffectDateOptions([EFFECT_DATE.all, EFFECT_DATE.custom]),
		effect_week_options: getEffectWeekOptions([EFFECT_WEEK.all, EFFECT_WEEK.custom]),
		effect_time_options: getEffectTimeOptions([EFFECT_TIME.all, EFFECT_TIME.custom]),

		handling_alarm_options: getHandlingAlarmOptions([HANDLING_ALARM.optional, HANDLING_ALARM.required])
	},
	menus: getMenus()
};

const hazard_source_config: AlarmRuleConfigItem = {
	getDefaultForm: () => ({
		base: {
			type: ALARM_RULE_TYPE.hazard_source,
			is_use: 1,
			name: "",
			rule_group_id: undefined,
			remark: "",
		},
		rule_setting: {
			alarm_list: [
				{
					level: "a",
					init_form: {
						alarm_setting: "",
						push_message: 0,
						has_level: 0,
						message_content: "",
						unit: "米",
					}
				}
			]
		},
		apply_map: {
			map_scope: APPLY_MAP_SCOPE.all,
			is_inverse: 0,
			map_table_data: []
		},
		apply_object: {
			apply_object_type: APPLY_OBJECT_TYPE.tag,
			apply_object_alarm: APPLY_OBJECT_ALARM.include,
			apply_object_unbind: APPLY_OBJECT_UNBIND.alarm,
			apply_person: APPLY_PERSON.none,
			apply_person_checked_list: [],
			apply_truck: APPLY_TRUCK.none,
			apply_truck_checked_list: [],
			apply_visitor: APPLY_VISITOR.none,
			apply_visitor_checked_list: [],
			apply_material: APPLY_MATERIAL.none,
			apply_material_checked_list: [],
			apply_contractor: APPLY_CONTRACTOR.none,
			apply_contractor_checked_list: [],
			apply_card_type: APPLY_CARD_TYPE.all,
			apply_card_type_checked_list: []
		},
		hazard_source_apply_object: {
			apply_object_type: APPLY_OBJECT_TYPE.tag,
			apply_object_alarm: APPLY_OBJECT_ALARM.include,
			apply_object_unbind: APPLY_OBJECT_UNBIND.alarm,
			apply_person: APPLY_PERSON.none,
			apply_person_checked_list: [],
			apply_truck: APPLY_TRUCK.none,
			apply_truck_checked_list: [],
			apply_visitor: APPLY_VISITOR.none,
			apply_visitor_checked_list: [],
			apply_material: APPLY_MATERIAL.none,
			apply_material_checked_list: [],
			apply_contractor: APPLY_CONTRACTOR.none,
			apply_contractor_checked_list: [],
			apply_card_type: APPLY_CARD_TYPE.all,
			apply_card_type_checked_list: []
		},
		effect_schedule: {
			effect_date_select: EFFECT_DATE.all,
			effect_date_custom: [],
			effect_week_select: EFFECT_WEEK.all,
			effect_week_custom: [],
			effect_time_select: EFFECT_TIME.all,
			effect_time_custom: [],
			effect_time_list: []
		},
		handling_alarm: {
			is_required: HANDLING_ALARM.optional,
		}
	}),
	form_config: {
		enable_icon_tip: "禁用会导致“未结束的告警”全部结束告警",
		rule_setting_title_tip: "在“告警适用地图范围”内，“告警适用对象”靠近危险源的距离小于设置值后，则触发告警。",
		alarm_level_num: 3,
		alarm_setting_label: "安全半径范围上限",
		alarm_setting_label_width: "150px",
		alarm_setting_label_key: "dis",
		alarm_setting_units: [
			{label: "米", value: "米"},
		],
		alarm_setting_placeholder: "请输入",
		alarm_setting_disabled: {a: false, b: false, c: false},
		alarm_setting_rule: "asc",
		show_push_message: true,
		alarm_setting_update: (value: string) => filterNonNegativeFloat(value),

		apply_map_options: getApplyMapOptions([APPLY_MAP_SCOPE.all]),
		show_inverse_map_scope: false,
		shuttle_map_options: getShuttleMapOptions([SHUTTLE_MAP_TYPE.virtual_fence]),
		shuttle_map_multiple: true,

		apply_object_type_options: getApplyObjectTypeOptions([APPLY_OBJECT_TYPE.tag]),
		apply_object_alarm_options: getApplyObjectAlarmOptions([]),
		apply_object_unbind_options: getApplyObjectUnbindOptions([APPLY_OBJECT_UNBIND.alarm]),
		tag_type: {person: true, truck: true, visitor: true, material: true, contractor: true},
		apply_person_options: getApplyPersonOptions([APPLY_PERSON.all, APPLY_PERSON.none, APPLY_PERSON.custom]),
		apply_visitor_options: getApplyVisitorOptions([APPLY_VISITOR.all, APPLY_VISITOR.none, APPLY_VISITOR.custom]),
		apply_truck_options: getApplyTruckOptions([APPLY_TRUCK.all, APPLY_TRUCK.none, APPLY_TRUCK.custom]),
		apply_material_options: getApplyMaterialOptions([APPLY_MATERIAL.all, APPLY_MATERIAL.none, APPLY_MATERIAL.custom]),
		apply_contractor_options: getApplyContractorOptions([APPLY_CONTRACTOR.all, APPLY_CONTRACTOR.none, APPLY_CONTRACTOR.custom]),
		apply_card_type_options: getApplyCardTypeOptions([APPLY_CARD_TYPE.all, APPLY_CARD_TYPE.custom]),

		effect_schedule_class: {date: true, week: true, time: true},
		effect_date_options: getEffectDateOptions([EFFECT_DATE.all, EFFECT_DATE.custom]),
		effect_week_options: getEffectWeekOptions([EFFECT_WEEK.all, EFFECT_WEEK.custom]),
		effect_time_options: getEffectTimeOptions([EFFECT_TIME.all, EFFECT_TIME.custom]),

		handling_alarm_options: getHandlingAlarmOptions([HANDLING_ALARM.optional, HANDLING_ALARM.required])
	},
	menus: getMenus(["被陪同对象", "陪同对象", "适用对象"])
};

const accompany_config: AlarmRuleConfigItem = {
	getDefaultForm: () => ({
		base: {
			type: ALARM_RULE_TYPE.accompany,
			is_use: 1,
			name: "",
			rule_group_id: undefined,
			remark: "",
		},
		rule_setting: {
			alarm_list: [
				{
					level: "a",
					init_form: {
						alarm_setting: "",
						push_message: 0,
						has_level: 0,
						message_content: "",
						unit: "米",
					}
				}
			]
		},
		apply_map: {
			map_scope: APPLY_MAP_SCOPE.all,
			is_inverse: 0,
			map_table_data: []
		},
		apply_object: {
			apply_object_type: APPLY_OBJECT_TYPE.tag,
			apply_object_alarm: APPLY_OBJECT_ALARM.include,
			apply_object_unbind: APPLY_OBJECT_UNBIND.alarm,
			apply_person: APPLY_PERSON.none,
			apply_person_checked_list: [],
			apply_truck: APPLY_TRUCK.none,
			apply_truck_checked_list: [],
			apply_visitor: APPLY_VISITOR.none,
			apply_visitor_checked_list: [],
			apply_material: APPLY_MATERIAL.none,
			apply_material_checked_list: [],
			apply_contractor: APPLY_CONTRACTOR.none,
			apply_contractor_checked_list: [],
			apply_card_type: APPLY_CARD_TYPE.all,
			apply_card_type_checked_list: []
		},
		accompany_apply_object: {
			apply_object_type: APPLY_OBJECT_TYPE.tag,
			apply_object_alarm: APPLY_OBJECT_ALARM.include,
			apply_object_unbind: APPLY_OBJECT_UNBIND.alarm,
			apply_person: APPLY_PERSON.none,
			apply_person_checked_list: [],
			apply_truck: APPLY_TRUCK.none,
			apply_truck_checked_list: [],
			apply_visitor: APPLY_VISITOR.none,
			apply_visitor_checked_list: [],
			apply_material: APPLY_MATERIAL.none,
			apply_material_checked_list: [],
			apply_contractor: APPLY_CONTRACTOR.none,
			apply_contractor_checked_list: [],
			apply_card_type: APPLY_CARD_TYPE.all,
			apply_card_type_checked_list: []
		},
		effect_schedule: {
			effect_date_select: EFFECT_DATE.all,
			effect_date_custom: [],
			effect_week_select: EFFECT_WEEK.all,
			effect_week_custom: [],
			effect_time_select: EFFECT_TIME.all,
			effect_time_custom: [],
			effect_time_list: []
		},
		handling_alarm: {
			is_required: HANDLING_ALARM.optional,
		}
	}),
	form_config: {
		enable_icon_tip: "禁用会导致“未结束的告警”全部结束告警",
		rule_setting_title_tip: "在“告警适用地图范围”内，“陪同对象”与“被陪同对象”之间的距离大于设置值后，则触发告警。",
		alarm_level_num: 3,
		alarm_setting_label: "陪同距离半径范围上限",
		alarm_setting_label_width: "170px",
		alarm_setting_label_key: "dis",
		alarm_setting_units: [
			{label: "米", value: "米"},
		],
		alarm_setting_placeholder: "请输入",
		alarm_setting_disabled: {a: false, b: false, c: false},
		alarm_setting_rule: "desc",
		show_push_message: true,
		alarm_setting_update: (value: string) => filterNonNegativeFloat(value),

		apply_map_options: getApplyMapOptions([APPLY_MAP_SCOPE.all]),
		show_inverse_map_scope: false,
		shuttle_map_options: getShuttleMapOptions([SHUTTLE_MAP_TYPE.virtual_fence]),
		shuttle_map_multiple: true,

		apply_object_type_options: getApplyObjectTypeOptions([APPLY_OBJECT_TYPE.tag]),
		apply_object_alarm_options: getApplyObjectAlarmOptions([]),
		apply_object_unbind_options: getApplyObjectUnbindOptions([APPLY_OBJECT_UNBIND.alarm]),
		tag_type: {person: true, truck: true, visitor: true, material: true, contractor: true},
		apply_person_options: getApplyPersonOptions([APPLY_PERSON.all, APPLY_PERSON.none, APPLY_PERSON.custom]),
		apply_visitor_options: getApplyVisitorOptions([APPLY_VISITOR.all, APPLY_VISITOR.none, APPLY_VISITOR.custom]),
		apply_truck_options: getApplyTruckOptions([APPLY_TRUCK.all, APPLY_TRUCK.none, APPLY_TRUCK.custom]),
		apply_material_options: getApplyMaterialOptions([APPLY_MATERIAL.all, APPLY_MATERIAL.none, APPLY_MATERIAL.custom]),
		apply_contractor_options: getApplyContractorOptions([APPLY_CONTRACTOR.all, APPLY_CONTRACTOR.none, APPLY_CONTRACTOR.custom]),
		apply_card_type_options: getApplyCardTypeOptions([APPLY_CARD_TYPE.all, APPLY_CARD_TYPE.custom]),

		effect_schedule_class: {date: true, week: true, time: true},
		effect_date_options: getEffectDateOptions([EFFECT_DATE.all, EFFECT_DATE.custom]),
		effect_week_options: getEffectWeekOptions([EFFECT_WEEK.all, EFFECT_WEEK.custom]),
		effect_time_options: getEffectTimeOptions([EFFECT_TIME.all, EFFECT_TIME.custom]),

		handling_alarm_options: getHandlingAlarmOptions([HANDLING_ALARM.optional, HANDLING_ALARM.required])
	},
	menus: getMenus(["危险源", "靠近不告警对象", "适用对象"])
};

const outlier_config: AlarmRuleConfigItem = {
	getDefaultForm: () => ({
		base: {
			type: ALARM_RULE_TYPE.outlier,
			is_use: 1,
			name: "",
			rule_group_id: undefined,
			remark: "",
		},
		rule_setting: {
			alarm_list: [
				{
					level: "a",
					init_form: {
						alarm_setting: "",
						push_message: 0,
						has_level: 0,
						message_content: "",
						unit: "米",
					}
				}
			]
		},
		apply_map: {
			map_scope: APPLY_MAP_SCOPE.all,
			is_inverse: 0,
			map_table_data: []
		},
		apply_object: {
			apply_object_type: APPLY_OBJECT_TYPE.tag,
			apply_object_alarm: APPLY_OBJECT_ALARM.include,
			apply_object_unbind: APPLY_OBJECT_UNBIND.alarm,
			apply_person: APPLY_PERSON.all,
			apply_person_checked_list: [],
			apply_truck: APPLY_TRUCK.none,
			apply_truck_checked_list: [],
			apply_visitor: APPLY_VISITOR.none,
			apply_visitor_checked_list: [],
			apply_material: APPLY_MATERIAL.none,
			apply_material_checked_list: [],
			apply_contractor: APPLY_CONTRACTOR.none,
			apply_contractor_checked_list: [],
			apply_card_type: APPLY_CARD_TYPE.all,
			apply_card_type_checked_list: []
		},
		effect_schedule: {
			effect_date_select: EFFECT_DATE.all,
			effect_date_custom: [],
			effect_week_select: EFFECT_WEEK.all,
			effect_week_custom: [],
			effect_time_select: EFFECT_TIME.all,
			effect_time_custom: [],
			effect_time_list: []
		},
		handling_alarm: {
			is_required: HANDLING_ALARM.optional,
		}
	}),
	form_config: {
		enable_icon_tip: "禁用会导致“未结束的告警”全部结束告警",
		rule_setting_title_tip: "在“告警适用地图范围”内，“告警适用对象”任意两者之间的距离大于设置值后，则触发告警。",
		alarm_level_num: 1,
		alarm_setting_label: "离群距离上限",
		alarm_setting_label_width: "130px",
		alarm_setting_label_key: "dis",
		alarm_setting_units: [
			{label: "米", value: "米"},
		],
		alarm_setting_placeholder: "请输入",
		alarm_setting_disabled: {a: false, b: false, c: false},
		alarm_setting_rule: "desc",
		show_push_message: true,
		alarm_setting_update: (value: string) => filterNonNegativeFloat(value),

		apply_map_options: getApplyMapOptions([APPLY_MAP_SCOPE.all]),
		show_inverse_map_scope: false,
		shuttle_map_options: getShuttleMapOptions([SHUTTLE_MAP_TYPE.virtual_fence]),
		shuttle_map_multiple: true,

		apply_object_type_options: getApplyObjectTypeOptions([APPLY_OBJECT_TYPE.tag]),
		apply_object_alarm_options: getApplyObjectAlarmOptions([APPLY_OBJECT_ALARM.include, APPLY_OBJECT_ALARM.exclude]),
		apply_object_unbind_options: getApplyObjectUnbindOptions([APPLY_OBJECT_UNBIND.alarm]),
		tag_type: {person: true, truck: true, visitor: true, material: true, contractor: true},
		apply_person_options: getApplyPersonOptions([APPLY_PERSON.all, APPLY_PERSON.none, APPLY_PERSON.custom]),
		apply_visitor_options: getApplyVisitorOptions([APPLY_VISITOR.all, APPLY_VISITOR.none, APPLY_VISITOR.custom]),
		apply_truck_options: getApplyTruckOptions([APPLY_TRUCK.all, APPLY_TRUCK.none, APPLY_TRUCK.custom]),
		apply_material_options: getApplyMaterialOptions([APPLY_MATERIAL.all, APPLY_MATERIAL.none, APPLY_MATERIAL.custom]),
		apply_contractor_options: getApplyContractorOptions([APPLY_CONTRACTOR.all, APPLY_CONTRACTOR.none, APPLY_CONTRACTOR.custom]),
		apply_card_type_options: getApplyCardTypeOptions([APPLY_CARD_TYPE.all, APPLY_CARD_TYPE.custom]),

		effect_schedule_class: {date: true, week: true, time: true},
		effect_date_options: getEffectDateOptions([EFFECT_DATE.all, EFFECT_DATE.custom]),
		effect_week_options: getEffectWeekOptions([EFFECT_WEEK.all, EFFECT_WEEK.custom]),
		effect_time_options: getEffectTimeOptions([EFFECT_TIME.all, EFFECT_TIME.custom]),

		handling_alarm_options: getHandlingAlarmOptions([HANDLING_ALARM.optional, HANDLING_ALARM.required])
	},
	menus: getMenus()
};

const fall_config: AlarmRuleConfigItem = {
	getDefaultForm: () => ({
		base: {
			type: ALARM_RULE_TYPE.fall,
			is_use: 1,
			name: "",
			rule_group_id: undefined,
			remark: "",
		},
		rule_setting: {
			alarm_list: [
				{
					level: "a",
					init_form: {
						alarm_setting: "",
						push_message: 0,
						has_level: 0,
						message_content: "",
						unit: "秒",
					}
				}
			]
		},
		apply_map: {
			map_scope: APPLY_MAP_SCOPE.all,
			is_inverse: 0,
			map_table_data: []
		},
		apply_object: {
			apply_object_type: APPLY_OBJECT_TYPE.tag,
			apply_object_alarm: APPLY_OBJECT_ALARM.include,
			apply_object_unbind: APPLY_OBJECT_UNBIND.alarm,
			apply_person: APPLY_PERSON.all,
			apply_person_checked_list: [],
			apply_truck: APPLY_TRUCK.none,
			apply_truck_checked_list: [],
			apply_visitor: APPLY_VISITOR.none,
			apply_visitor_checked_list: [],
			apply_material: APPLY_MATERIAL.none,
			apply_material_checked_list: [],
			apply_contractor: APPLY_CONTRACTOR.none,
			apply_contractor_checked_list: [],
			apply_card_type: APPLY_CARD_TYPE.all,
			apply_card_type_checked_list: []
		},
		effect_schedule: {
			effect_date_select: EFFECT_DATE.all,
			effect_date_custom: [],
			effect_week_select: EFFECT_WEEK.all,
			effect_week_custom: [],
			effect_time_select: EFFECT_TIME.all,
			effect_time_custom: [],
			effect_time_list: []
		},
		handling_alarm: {
			is_required: HANDLING_ALARM.optional,
		}
	}),
	form_config: {
		enable_icon_tip: "禁用会导致“未结束的告警”全部结束告警",
		rule_setting_title_tip: "在“告警适用地图范围”内，“告警适用对象”绑定的定位标签跌落（需定位标签支持跌落监测）且持续不动时间大于设置值后，则触发告警。",
		alarm_level_num: 3,
		alarm_setting_label: "触发后不动持续时长上限",
		alarm_setting_label_width: "180px",
		alarm_setting_label_key: "static_time",
		alarm_setting_units: [
			{label: "秒", value: TIME_UNIT.second},
			{label: "分钟", value: TIME_UNIT.minute},
			{label: "小时", value: TIME_UNIT.hour},
		],
		alarm_setting_placeholder: "请输入0或正整数",
		alarm_setting_disabled: {a: false, b: false, c: false},
		alarm_setting_rule: "desc",
		show_push_message: true,
		alarm_setting_update: (value: string) => filterNonNegativeInteger(value, true),

		apply_map_options: getApplyMapOptions([APPLY_MAP_SCOPE.all]),
		show_inverse_map_scope: false,
		shuttle_map_options: getShuttleMapOptions([SHUTTLE_MAP_TYPE.virtual_fence]),
		shuttle_map_multiple: true,

		apply_object_type_options: getApplyObjectTypeOptions([APPLY_OBJECT_TYPE.tag]),
		apply_object_alarm_options: getApplyObjectAlarmOptions([APPLY_OBJECT_ALARM.include, APPLY_OBJECT_ALARM.exclude]),
		apply_object_unbind_options: getApplyObjectUnbindOptions([APPLY_OBJECT_UNBIND.alarm]),
		tag_type: {person: true, truck: true, visitor: true, material: true, contractor: true},
		apply_person_options: getApplyPersonOptions([APPLY_PERSON.all, APPLY_PERSON.none, APPLY_PERSON.custom]),
		apply_visitor_options: getApplyVisitorOptions([APPLY_VISITOR.all, APPLY_VISITOR.none, APPLY_VISITOR.custom]),
		apply_truck_options: getApplyTruckOptions([APPLY_TRUCK.all, APPLY_TRUCK.none, APPLY_TRUCK.custom]),
		apply_material_options: getApplyMaterialOptions([APPLY_MATERIAL.all, APPLY_MATERIAL.none, APPLY_MATERIAL.custom]),
		apply_contractor_options: getApplyContractorOptions([APPLY_CONTRACTOR.all, APPLY_CONTRACTOR.none, APPLY_CONTRACTOR.custom]),
		apply_card_type_options: getApplyCardTypeOptions([APPLY_CARD_TYPE.all, APPLY_CARD_TYPE.custom]),

		effect_schedule_class: {date: true, week: true, time: true},
		effect_date_options: getEffectDateOptions([EFFECT_DATE.all, EFFECT_DATE.custom]),
		effect_week_options: getEffectWeekOptions([EFFECT_WEEK.all, EFFECT_WEEK.custom]),
		effect_time_options: getEffectTimeOptions([EFFECT_TIME.all, EFFECT_TIME.custom]),

		handling_alarm_options: getHandlingAlarmOptions([HANDLING_ALARM.optional, HANDLING_ALARM.required])
	},
	menus: getMenus()
};

const abnormal_posture_config: AlarmRuleConfigItem = {
	getDefaultForm: () => ({
		base: {
			type: ALARM_RULE_TYPE.abnormal_posture,
			is_use: 1,
			name: "",
			rule_group_id: undefined,
			remark: "",
		},
		rule_setting: {
			alarm_list: [
				{
					level: "a",
					init_form: {
						alarm_setting: "",
						push_message: 0,
						has_level: 0,
						message_content: "",
						unit: "",
					}
				}
			]
		},
		apply_map: {
			map_scope: APPLY_MAP_SCOPE.custom,
			is_inverse: 0,
			map_table_data: []
		},
		apply_object: {
			apply_object_type: APPLY_OBJECT_TYPE.tag,
			apply_object_alarm: APPLY_OBJECT_ALARM.include,
			apply_object_unbind: APPLY_OBJECT_UNBIND.alarm,
			apply_person: APPLY_PERSON.all,
			apply_person_checked_list: [],
			apply_truck: APPLY_TRUCK.none,
			apply_truck_checked_list: [],
			apply_visitor: APPLY_VISITOR.none,
			apply_visitor_checked_list: [],
			apply_material: APPLY_MATERIAL.none,
			apply_material_checked_list: [],
			apply_contractor: APPLY_CONTRACTOR.none,
			apply_contractor_checked_list: [],
			apply_card_type: APPLY_CARD_TYPE.all,
			apply_card_type_checked_list: []
		},
		effect_schedule: {
			effect_date_select: EFFECT_DATE.all,
			effect_date_custom: [],
			effect_week_select: EFFECT_WEEK.all,
			effect_week_custom: [],
			effect_time_select: EFFECT_TIME.all,
			effect_time_custom: [],
			effect_time_list: []
		},
		handling_alarm: {
			is_required: HANDLING_ALARM.optional,
		}
	}),
	form_config: {
		enable_icon_tip: "禁用会导致“未结束的告警”全部结束告警",
		rule_setting_title_tip: "在“告警适用地图范围”内，“告警适用对象”绑定的定位标签姿态异常（需定位标签支持姿态异常监测），则触发告警。",
		alarm_level_num: 1,
		alarm_setting_label: "",
		alarm_setting_label_width: "130px",
		alarm_setting_label_key: "",
		alarm_setting_units: [],
		alarm_setting_placeholder: "",
		alarm_setting_disabled: {a: false, b: false, c: false},
		show_push_message: true,
		alarm_setting_update: undefined,

		apply_map_options: getApplyMapOptions([APPLY_MAP_SCOPE.custom]),
		show_inverse_map_scope: false,
		shuttle_map_options: getShuttleMapOptions([SHUTTLE_MAP_TYPE.virtual_fence]),
		shuttle_map_multiple: true,

		apply_object_type_options: getApplyObjectTypeOptions([APPLY_OBJECT_TYPE.tag]),
		apply_object_alarm_options: getApplyObjectAlarmOptions([APPLY_OBJECT_ALARM.include, APPLY_OBJECT_ALARM.exclude]),
		apply_object_unbind_options: getApplyObjectUnbindOptions([APPLY_OBJECT_UNBIND.alarm]),
		tag_type: {person: true, truck: false, visitor: true, material: false, contractor: true},
		apply_person_options: getApplyPersonOptions([APPLY_PERSON.all, APPLY_PERSON.none, APPLY_PERSON.custom]),
		apply_visitor_options: getApplyVisitorOptions([APPLY_VISITOR.all, APPLY_VISITOR.none, APPLY_VISITOR.custom]),
		apply_truck_options: getApplyTruckOptions([APPLY_TRUCK.all, APPLY_TRUCK.none, APPLY_TRUCK.custom]),
		apply_material_options: getApplyMaterialOptions([APPLY_MATERIAL.all, APPLY_MATERIAL.none, APPLY_MATERIAL.custom]),
		apply_contractor_options: getApplyContractorOptions([APPLY_CONTRACTOR.all, APPLY_CONTRACTOR.none, APPLY_CONTRACTOR.custom]),
		apply_card_type_options: getApplyCardTypeOptions([APPLY_CARD_TYPE.all, APPLY_CARD_TYPE.custom]),

		effect_schedule_class: {date: true, week: true, time: true},
		effect_date_options: getEffectDateOptions([EFFECT_DATE.all, EFFECT_DATE.custom]),
		effect_week_options: getEffectWeekOptions([EFFECT_WEEK.all, EFFECT_WEEK.custom]),
		effect_time_options: getEffectTimeOptions([EFFECT_TIME.all, EFFECT_TIME.custom]),

		handling_alarm_options: getHandlingAlarmOptions([HANDLING_ALARM.optional, HANDLING_ALARM.required])
	},
	menus: getMenus()
};

const forced_demolition_config: AlarmRuleConfigItem = {
	getDefaultForm: () => ({
		base: {
			type: ALARM_RULE_TYPE.forced_demolition,
			is_use: 1,
			name: "",
			rule_group_id: undefined,
			remark: "",
		},
		rule_setting: {
			alarm_list: [
				{
					level: "a",
					init_form: {
						alarm_setting: "",
						push_message: 0,
						has_level: 0,
						message_content: "",
						unit: "",
					}
				}
			]
		},
		apply_map: {
			map_scope: APPLY_MAP_SCOPE.all,
			is_inverse: 0,
			map_table_data: []
		},
		apply_object: {
			apply_object_type: APPLY_OBJECT_TYPE.tag,
			apply_object_alarm: APPLY_OBJECT_ALARM.include,
			apply_object_unbind: APPLY_OBJECT_UNBIND.alarm,
			apply_person: APPLY_PERSON.all,
			apply_person_checked_list: [],
			apply_truck: APPLY_TRUCK.none,
			apply_truck_checked_list: [],
			apply_visitor: APPLY_VISITOR.none,
			apply_visitor_checked_list: [],
			apply_material: APPLY_MATERIAL.none,
			apply_material_checked_list: [],
			apply_contractor: APPLY_CONTRACTOR.none,
			apply_contractor_checked_list: [],
			apply_card_type: APPLY_CARD_TYPE.all,
			apply_card_type_checked_list: []
		},
		effect_schedule: {
			effect_date_select: EFFECT_DATE.all,
			effect_date_custom: [],
			effect_week_select: EFFECT_WEEK.all,
			effect_week_custom: [],
			effect_time_select: EFFECT_TIME.all,
			effect_time_custom: [],
			effect_time_list: []
		},
		handling_alarm: {
			is_required: HANDLING_ALARM.optional,
		}
	}),
	form_config: {
		enable_icon_tip: "禁用会导致“未结束的告警”全部结束告警",
		rule_setting_title_tip: "在“告警适用地图范围”内，“告警适用对象”绑定的定位标签强拆（需定位标签支持强拆监测），则触发告警。",
		alarm_level_num: 1,
		alarm_setting_label: "",
		alarm_setting_label_width: "130px",
		alarm_setting_label_key: "",
		alarm_setting_units: [],
		alarm_setting_placeholder: "",
		alarm_setting_disabled: {a: false, b: false, c: false},
		alarm_setting_update: undefined,
		show_push_message: true,

		apply_map_options: getApplyMapOptions([APPLY_MAP_SCOPE.all]),
		show_inverse_map_scope: false,
		shuttle_map_options: getShuttleMapOptions([SHUTTLE_MAP_TYPE.virtual_fence]),
		shuttle_map_multiple: true,

		apply_object_type_options: getApplyObjectTypeOptions([APPLY_OBJECT_TYPE.tag]),
		apply_object_alarm_options: getApplyObjectAlarmOptions([APPLY_OBJECT_ALARM.include, APPLY_OBJECT_ALARM.exclude]),
		apply_object_unbind_options: getApplyObjectUnbindOptions([APPLY_OBJECT_UNBIND.alarm]),
		tag_type: {person: true, truck: true, visitor: true, material: true, contractor: true},
		apply_person_options: getApplyPersonOptions([APPLY_PERSON.all, APPLY_PERSON.none, APPLY_PERSON.custom]),
		apply_visitor_options: getApplyVisitorOptions([APPLY_VISITOR.all, APPLY_VISITOR.none, APPLY_VISITOR.custom]),
		apply_truck_options: getApplyTruckOptions([APPLY_TRUCK.all, APPLY_TRUCK.none, APPLY_TRUCK.custom]),
		apply_material_options: getApplyMaterialOptions([APPLY_MATERIAL.all, APPLY_MATERIAL.none, APPLY_MATERIAL.custom]),
		apply_contractor_options: getApplyContractorOptions([APPLY_CONTRACTOR.all, APPLY_CONTRACTOR.none, APPLY_CONTRACTOR.custom]),
		apply_card_type_options: getApplyCardTypeOptions([APPLY_CARD_TYPE.all, APPLY_CARD_TYPE.custom]),

		effect_schedule_class: {date: true, week: true, time: true},
		effect_date_options: getEffectDateOptions([EFFECT_DATE.all, EFFECT_DATE.custom]),
		effect_week_options: getEffectWeekOptions([EFFECT_WEEK.all, EFFECT_WEEK.custom]),
		effect_time_options: getEffectTimeOptions([EFFECT_TIME.all, EFFECT_TIME.custom]),

		handling_alarm_options: getHandlingAlarmOptions([HANDLING_ALARM.optional, HANDLING_ALARM.required])
	},
	menus: getMenus()
};

export const ALARM_RULE_CONFIG = Object.freeze({
	[ALARM_RULE_TYPE.region_intrusion]: region_intrusion_config,
	[ALARM_RULE_TYPE.region_overcrowded]: region_overcrowded_config,
	[ALARM_RULE_TYPE.region_shortage]: region_shortage,
	[ALARM_RULE_TYPE.pit_overcrowded]: pit_overcrowded_config,
	[ALARM_RULE_TYPE.pit_shortage]: pit_shortage_config,
	[ALARM_RULE_TYPE.safe_region]: safe_region_config,
	[ALARM_RULE_TYPE.region_timeout]: region_timeout_config,
	[ALARM_RULE_TYPE.forbidden_departure]: forbidden_departure_config,
	[ALARM_RULE_TYPE.work_timeout]: work_timeout_config,
	[ALARM_RULE_TYPE.vehicle_speeding]: vehicle_speeding_config,
	[ALARM_RULE_TYPE.vehicle_overload]: vehicle_overload_config,
	[ALARM_RULE_TYPE.gather]: gather_config,
	[ALARM_RULE_TYPE.stationary]: stationary_config,
	[ALARM_RULE_TYPE.region_disappearance]: region_disappearance_config,
	[ALARM_RULE_TYPE.hazard_source]: hazard_source_config,
	[ALARM_RULE_TYPE.accompany]: accompany_config,
	[ALARM_RULE_TYPE.outlier]: outlier_config,
	[ALARM_RULE_TYPE.fall]: fall_config,
	[ALARM_RULE_TYPE.abnormal_posture]: abnormal_posture_config,
	[ALARM_RULE_TYPE.forced_demolition]: forced_demolition_config,
});
