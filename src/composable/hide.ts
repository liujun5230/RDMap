/**
 * 此文件用于系统功能隐藏
 */
import {computed, reactive} from "vue";

import {LOCATE_OPTIONS} from "@/utils/js/constant";
import {getChainPropValue} from "@/utils/ts/common";
import store, {useFeatureFlags} from "@/store/index";

export interface UserFlags {
	person?: boolean,
	visitor?: boolean,
	truck?: boolean,
	material?: boolean,
	contractor?: boolean
}

function getUserFlags(user_flags?: UserFlags) {
	const {
		person = true,
		visitor = true,
		truck = true,
		material = true,
		contractor = true,
	} = user_flags ?? {person: true, visitor: true, truck: true, material: true, contractor: true};

	return {person, visitor, truck, material, contractor};
}

/**
 * 名称列tooltip内容
 * @param user_flags 用户控制是否显示员工、访客、承包商、车辆、物资，默认显示
 */
export function useNameTips(user_flags?: UserFlags) {
	const real_user_flags = getUserFlags(user_flags);
	const flags = reactive(useFeatureFlags());

	return computed(() => {
		const tips: string[] = [];
		real_user_flags.person && tips.push("员工姓名");
		real_user_flags.visitor && flags.displayVisitor && tips.push("访客姓名");
		real_user_flags.contractor && flags.displayContractor && tips.push("承包商姓名");
		if (real_user_flags.truck && flags.car) {
			tips.push("车牌号");
		}
		if (real_user_flags.material && flags.displayMaterial) {
			tips.push("物资编号");
		}
		return tips.join("/");
	});
}

// 定位对象下拉框内容
export function useObjectOptions() {
	const flags = reactive(useFeatureFlags());
	return computed(() => LOCATE_OPTIONS.filter(item => {
		switch (item.label) {
		case "车辆": return Boolean(flags.car);
		case "物资": return Boolean(flags.displayMaterial);
		case "访客": return Boolean(flags.displayVisitor);
		case "承包商": return Boolean(flags.displayContractor);
		default: return true;
		}
	}));
}

// 获取人员分类是否显示
export function usePersonClassify() {
	const person_dict = store.getters.person_dict;
	return computed(() => person_dict.person_class);
}

/**
 * 相关信息列tooltip内容
 * @param user_flags 用户控制是否显示员工、访客、承包商、车辆、物资，默认显示
 */
export function useRelatedInfoTips(user_flags?: UserFlags) {
	const real_user_flags = getUserFlags(user_flags);
	const getTip = (dict: Record<string, 0 | 1>, label: string, ...fields: {name: string, prop: string}[]) => {
		const content = fields.flatMap(({name, prop}) => {
			return (prop === undefined || getChainPropValue(dict, prop)) ? name : [];
		});
		return `${label}：${content.join("-") || "--"}；`;
	};

	return computed(() => {
		const flags = reactive(useFeatureFlags());
		const person_dict = store.getters.person_dict;
		const visitor_dict = store.getters.visitor_dict;
		const contractor_unit_dict = store.getters.contractor_unit_dict;
		const contractor_dict = store.getters.contractor_dict;
		const truck_dict = store.getters.car_dict;
		const material_dict = store.getters.material_dict;
		const tips: string[] = [];
		real_user_flags.person && tips.push(getTip(person_dict, "员工展示", {name: "部门", prop: "branch_id"}, {name: "员工分类", prop: "person_class"}));
		real_user_flags.visitor && flags.displayVisitor && tips.push(getTip(visitor_dict, "访客展示", {name: "单位", prop: "company"}));
		real_user_flags.contractor && flags.displayContractor && tips.push(getTip({unit: contractor_unit_dict, contractor: contractor_dict}, "承包商展示", {name: "承包商单位", prop: "unit.name"}, {name: "工种", prop: "contractor.work_type_id"}));
		real_user_flags.truck && flags.car && tips.push(getTip(truck_dict, "车辆展示", {name: "车辆类型", prop: "type"}, {name: "司机姓名", prop: "driver"}));
		real_user_flags.material && flags.displayMaterial && tips.push(getTip(material_dict, "物资展示", {name: "物资类型", prop: "type"}, {name: "物资名称", prop: "name"}));

		return tips.join("\\n");
	});
}

// 列表搜索合并项下拉选项
export function useLabelOptions() {
	return computed(() => {
		const flags = reactive(useFeatureFlags());
		const person_dict = store.getters.person_dict;
		const visitor_dict = store.getters.visitor_dict;
		const truck_dict = store.getters.car_dict;
		const material_dict = store.getters.material_dict;
		const contractor_dict = store.getters.contractor_dict;
		const options = [{label: "卡号", value: "card_id"}];

		if (flags.displayMaterial) {
			material_dict.name && options.unshift({label: "物资名称", value: "material_name"});
			material_dict.serial_num && options.unshift({label: "物资编号", value: "serial_num"});
		}
		if (flags.car) {
			truck_dict.driver && options.unshift({label: "司机", value: "driver"});
			truck_dict.licence && options.unshift({label: "车牌号", value: "licence"});
		}
		if (flags.displayContractor && contractor_dict.name) {
			options.unshift({label: "承包商姓名", value: "contractor_name"});
		}
		if (flags.displayVisitor && visitor_dict.name) {
			options.unshift({label: "访客姓名", value: "visitor_name"});
		}
		if (person_dict.name) {
			options.unshift({label: "员工姓名", value: "person_name"});
		}

		return options;
	});
}

const UTYPES = {
	PERSON: 1,
	CAR: 2,
	VISITOR: 3,
	MATERIAL: 5,
	CONTRACTOR: 5
};

const UTYPE_LIST = {
	[UTYPES.PERSON]: "员工",
	[UTYPES.VISITOR]: "访客",
	[UTYPES.CONTRACTOR]: "承包商",
	[UTYPES.MATERIAL]: "物资",
	[UTYPES.CAR]: "车辆",

};

/**
 * 获取可用的标签卡
 */
export function useTagOption() {
	const flags = reactive(useFeatureFlags());
	return computed(() => {
		const list = Object.entries(UTYPE_LIST).filter(tag => {
			const [utype] = tag;
			switch (+utype) {
			case UTYPES.CONTRACTOR: return flags.displayContractor;
			case UTYPES.CAR: return flags.car;
			case UTYPES.MATERIAL: return flags.displayMaterial;
			default: return true;
			}
		}).reduce((pre, cur) => {
			const [utype, name] = cur;
			pre[utype] = name;
			return pre;
		}, {} as Record<string, string>);
		return list;
	});
}

