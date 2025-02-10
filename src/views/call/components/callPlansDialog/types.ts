
import type {CheckedItem} from "@/components/Dialog/constant";

export interface ApplyMapRow {
    area_id: number,
    area_name: string,
    area_type: number,
    map_name: string
}

export const enum RULE_STATUS {
    enable = 1,
    disable = 0
}

export const enum APPLY_PERSON {
	all = "all",
	none = "none",
	custom = "custom"
}

export const enum APPLY_TRUCK {
	all = "all",
	none = "none",
	custom = "custom"
}

export const enum APPLY_VISITOR {
	all = "all",
	none = "none",
	custom = "custom"
}

export const enum APPLY_MATERIAL {
	all = "all",
	none = "none",
	custom = "custom"
}

export const enum APPLY_CONTRACTOR {
	all = "all",
	none = "none",
	custom = "custom"
}

export const enum EFFECT_DATE {
	all = "all",
	custom = "custom"
}

export const enum EFFECT_WEEK {
	all = "all",
	custom = "custom",
    no_repeating = "no_repeating"
}

export const enum EFFECT_TIME {
	all = "all",
	custom = "custom"
}

export const enum OFFSET_TIME_UNIT {
    second = 0,
    minute = 1,
    hour = 2
}

export const enum HANDLING_ALARM {
    required = 1,
    optional = 0
}

export interface FormData {
    base: {
        is_use: RULE_STATUS,
        name: string,
    },
    apply_map: {
        map_table_data: ApplyMapRow[]
    },
    apply_object: {
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
    },
    effect_schedule: {
        effect_date_select: EFFECT_DATE,
		effect_date_custom: Date[],
        effect_week_select: EFFECT_WEEK,
		effect_week_custom: number[],
        effect_time_select: EFFECT_TIME,
		effect_time_custom: Date | null,
		effect_time_list: number[],
        offset_time: string,
        offset_time_unit: OFFSET_TIME_UNIT
    },
    handling_alarm: {
        is_required: HANDLING_ALARM,
    }
}
