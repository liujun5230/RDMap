import {getMaterialDict as getMaterialDictFromAPI} from "@/api/material/materialDict";
import {getPersonDict as get} from "@/api/company/personDict";
import {getTruckDict} from "@/api/truck/truck";
import {getVisitorDict} from "@/api/visitor/visitorDict";
import {getContractorUnitDict} from "@/api/contractor/Company";
import {getContractorDict} from "@/api/contractor/Person";

const state = {
	person_dict: {},
	person_dict_items: [],

	car_dict: {},
	car_dict_items: [],

	visitor_dict: {},
	visitor_dict_items: [],

	material_dict: {},
	material_dict_items: [],

	contractor_unit_dict: {},
	contractor_unit_items: [],

	contractor_dict: {},
	contractor_items: [],
};

const mutations = {
	SET_PERSON_DICT: (state, dict) => {
		state.person_dict = dict;
	},
	SET_PERSON_DICT_ITEMS: (state, dict_items) => {
		state.person_dict_items = dict_items;
	},
	SET_MATERIAL_DICT: (state, dict) => {
		state.material_dict = dict;
	},
	SET_MATERIAL_DICT_ITEMS: (state, dict_items) => {
		state.material_dict_items = dict_items;
	},
	SET_VISITOR_DICT: (state, dict) => {
		state.visitor_dict = dict;
	},
	SET_VISITOR_DICT_ITEMS: (state, dict_items) => {
		state.visitor_dict_items = dict_items;
	},
	SET_CAR_DICT: (state, dict) => {
		state.car_dict = dict;
	},
	SET_CAR_DICT_ITEMS: (state, dict) => {
		state.car_dict_items = dict;
	},
	SET_CONTRACTOR_UNIT_DICT: (state, dict) => {
		state.contractor_unit_dict = dict;
	},
	SET_CONTRACTOR_UNIT_ITEMS: (state, dict) => {
		state.contractor_unit_items = dict;
	},
	SET_CONTRACTOR_DICT: (state, dict) => {
		state.contractor_dict = dict;
	},
	SET_CONTRACTOR_ITEMS: (state, dict) => {
		state.contractor_items = dict;
	},
};

const actions = {
	async setPersonDict({commit}) {
		const {person_dict, person_dict_items} = await getPersonDict();
		commit("SET_PERSON_DICT", person_dict);
		commit("SET_PERSON_DICT_ITEMS", person_dict_items);
	},
	async setMaterialDict({commit}) {
		const dict_items = await getMaterialDict();
		const {dict} = getDict(dict_items);
		commit("SET_MATERIAL_DICT_ITEMS", dict_items);
		commit("SET_MATERIAL_DICT", dict);
	},

	async setCarDict({commit}) {
		const dict_items = await fetchCarDict();
		const {dict} = getDict(dict_items);
		commit ("SET_CAR_DICT_ITEMS", dict_items);
		commit("SET_CAR_DICT", dict);
	},

	async setVisitorDict({commit}) {
		const dict_items = await fetchVisitorDict();
		const {dict} = getDict(dict_items);
		commit ("SET_VISITOR_DICT_ITEMS", dict_items);
		commit("SET_VISITOR_DICT", dict);
	},

	async setContractorUnitDict({commit}) {
		const dict_items = await fetchContractorUnitDict();
		const {dict} = getDict(dict_items);
		commit ("SET_CONTRACTOR_UNIT_ITEMS", dict_items);
		commit("SET_CONTRACTOR_UNIT_DICT", dict);
	},

	async setContractorDict({commit}) {
		const dict_items = await fetchContractorDict();
		const {dict} = getDict(dict_items);
		commit ("SET_CONTRACTOR_ITEMS", dict_items);
		commit("SET_CONTRACTOR_DICT", dict);
	}
};

function getDict(arr) {
	const dict = {};
	for (const {id, field, is_display} of arr) {
		const key = field ?? id;
		dict[key] = is_display;
	}
	return {dict};
}

async function getPersonDict() {
	const response = await get().catch(() => undefined);
	if (response?.data?.type === 1) {
		const person_dict_items = response.data.result.map(item => {
			const field = item.role_deny.field ?? null;
			item.field = field;
			// 预设字段和自定义字段的键名
			item.prop_name = field ?? item.name;
			return item;
		});
		const {dict} = getDict(response.data.result ?? []);
		return {
			person_dict: dict,
			person_dict_items,
		};
	}

	console.error("接口错误[getPersonDict]");
}

async function getMaterialDict() {
	const response = await getMaterialDictFromAPI().catch(() => undefined);
	if (response?.data?.type === 1) {
		return response.data.result.map((row) => {
			// "备注"的键名使用字典id
			const prop_name = row.field === "comment" ? String(row.id) : (row.field ?? String(row.id));
			return {...row, prop_name, field: row.field === "comment" ? null : row.field};
		});
	}
	return [];
}

async function fetchCarDict() {
	const resp = await getTruckDict().catch(() => undefined);
	if (resp?.data?.type === 1) {
		return resp.data.result.map((row) => {
			const prop_name = row.field ?? String(row.id);
			return {...row, prop_name};
		});
	}
	return [];
}

async function fetchVisitorDict() {
	const resp = await getVisitorDict().catch(() => undefined);
	if (resp?.data?.type === 1) {
		return resp.data.result.map((row) => {
			const prop_name = row.field ?? String(row.id);
			return {...row, prop_name};
		});
	}
	return [];
}

async function fetchContractorUnitDict() {
	const resp = await getContractorUnitDict().catch(() => undefined);
	if (resp?.data?.type === 1) {
		return resp.data.result.map((row) => {
			const prop_name = row.field ?? String(row.id);
			return {...row, prop_name};
		});
	}
	return [];
}

async function fetchContractorDict() {
	const resp = await getContractorDict().catch(() => undefined);
	if (resp?.data?.type === 1) {
		return resp.data.result.map((row) => {
			const prop_name = row.field ?? String(row.id);
			return {...row, prop_name};
		});
	}
	return [];
}

export default {
	namespaced: true,
	state,
	mutations,
	actions
};

