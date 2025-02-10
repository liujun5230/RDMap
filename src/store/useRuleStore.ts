import {shallowRef, computed} from "vue";
import {defineStore} from "pinia";

import {ALARM_RULE_TYPE} from "@/utils/js/constant";
import {getRuleType} from "@/api/alarm/configuration";
import {getAlarmRuleGroup} from "@/api/area/alarmRuleGroup";

export const useRuleTypeStore = defineStore("rule-type-store", () => {
	const rule_type_options = shallowRef<{value: number, label: string, name: string}[]>([]);

	const alarm_rule_type_options = computed(() => {
		return rule_type_options.value.filter(({value}) => ALARM_RULE_TYPE[value]);
	});

	const rule_type_name_map = computed(() => {
		const map = new Map<number, {name: string, alias: string}>();
		rule_type_options.value.forEach(({value, label, name}) => {
			map.set(value, {name, alias: label});
		});
		return map;
	});

	const fetch = async () => {
		const {data: res} = await getRuleType().catch(() => ({data: undefined}));

		if (res?.type === 1) {
			rule_type_options.value = res.result.map(({id, name, alias}) => ({
				label: alias || name,
				value: id,
				name
			}));
		}
	};

	/**
	 * 过滤规则类型
	 * @param exclude_type 过滤的规则类型id
	 * @param filter_mode 过滤模式，only-alarm：在告警规则类型下过滤，exclude-alarm：在排除告警规则类型后过滤，all：在所有规则类型下过滤，默认"only-alarm"
	 */
	const filterRuleType = (exclude_type: number[], filter_mode: "only-alarm" | "exclude-alarm" | "all" = "only-alarm") => {
		if (filter_mode === "all") {
			return rule_type_options.value.filter(({value}) => !exclude_type.includes(value));
		} else if (filter_mode === "only-alarm") {
			return alarm_rule_type_options.value.filter(({value}) => !exclude_type.includes(value));
		} else if (filter_mode === "exclude-alarm") {
			return rule_type_options.value.filter(({value}) => !ALARM_RULE_TYPE[value] && !exclude_type.includes(value));
		} else {
			return rule_type_options.value;
		}
	};

	return {
		rule_type_options,
		rule_type_name_map,
		alarm_rule_type_options,
		fetch,
		filterRuleType
	};
});

export const useRuleGroupStore = defineStore("rule-group-store", () => {
	const rule_group_list = shallowRef<any>([]);

	const rule_group_options = computed(() => rule_group_list.value.map((item: any) => ({
		label: item.name,
		value: item.id
	})));

	const rule_group_id_name = computed(() => {
		const map = new Map<number, string>();
		rule_group_list.value.forEach(({id, name}: {id: number, name: string}) => {
			map.set(id, name);
		});
		return map;
	});

	const fetch = async () => {
		const {data: res} = await getAlarmRuleGroup().catch(() => ({data: undefined}));

		if (res?.type === 1) {
			rule_group_list.value = res.result.data;
		}
	};

	return {
		rule_group_list,
		rule_group_options,
		rule_group_id_name,
		fetch
	};
});
