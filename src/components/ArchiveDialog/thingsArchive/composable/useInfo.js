import {useStore} from "@/store/index";
const dict_store = useStore();

const getPersonField = () => {
	const info_field = {prop: "name", label: "姓名"};
	dict_store.getters.person_dict_items.forEach(item => {
		if (item.field === "sex" && item.is_display) info_field["sex"] = 1;
	});
	return [info_field, {prop: "branch_name", label: "部门"}, {prop: "id_code", label: "身份证号"}];
};

const getVisitorField = () => {
	const info_field = {prop: "name", label: "姓名"};
	let phone_obj;
	dict_store.getters.visitor_dict_items.forEach(item => {
		if (item.field === "sex" && item.is_display) info_field["sex"] = 1;
		if (item.field === "phone" && item.is_display) phone_obj = {prop: "phone", label: "联系电话"};
	});
	const arr = [info_field, {prop: "id_code", label: "身份证号"}];
	if (phone_obj)arr.push(phone_obj);
	return arr;
};

const getTruckField = () => {
	const arr = [{prop: "licence", label: "车牌号"}, {prop: "type_name", label: "车辆类型"}];
	dict_store.getters.car_dict_items.forEach(item => {
		if (item.field === "driver" && item.is_display) arr.push({prop: "driver", label: "司机"});
	});
	return arr;
};

const getMaterialField = () => {
	const arr = [{prop: "serial_num", label: "物资编号"}, {prop: "name", label: "物资名称"}, {prop: "type_name", label: "物资类型"}];
	return arr;
};

const getContractorField = () => {
	const info_field = {prop: "name", label: "姓名"};
	let unit_obj;
	dict_store.getters.contractor_items.forEach(item => {
		if (item.field === "sex" && item.is_display) info_field["sex"] = 1;
		if (item.field === "unit_id" && item.is_display) unit_obj = {prop: "unit_name", label: "承包商单位"};
	});
	const arr = [info_field];
	if (unit_obj)arr.push(unit_obj);
	arr.push({prop: "id_code", label: "身份证号"});
	return arr;
};

const things_info_type = {
	person: {
		get_info_field_fn: getPersonField,
		dict_items: "person_dict_items",
		img: {
			key: "person_photo",
			name: "员工",
		},
		dialog_title: {
			name: "员工",
			key: "name"
		},
		auth_url: "/company#/person",
		utype: 1,
		type_name: "person_name",
	},
	truck: {
		get_info_field_fn: getTruckField,
		dict_items: "car_dict_items",
		img: {
			key: "truck_photo",
			name: "车辆"
		},
		dialog_title: {
			name: "车辆",
			key: "licence"
		},
		auth_url: "/truck#/info",
		utype: 2,
		type_name: "licence"
	},
	visitor: {
		get_info_field_fn: getVisitorField,
		dict_items: "visitor_dict_items",
		img: {
			key: "photo",
			name: "访客"
		},
		dialog_title: {
			name: "访客",
			key: "name"
		},
		auth_url: "/visitor#/visitor",
		utype: 3,
		type_name: "name"
	},
	material: {
		get_info_field_fn: getMaterialField,
		dict_items: "material_dict_items",
		img: {
			key: "picture",
			name: "物资"
		},
		dialog_title: {
			name: "物资",
			key: "serial_num"
		},
		auth_url: "/material#/material",
		utype: 5,
		type_name: "serial_num"
	},
	contractor: {
		get_info_field_fn: getContractorField,
		dict_items: "contractor_items",
		img: {
			key: "photo",
			name: "承包商"
		},
		dialog_title: {
			name: "承包商",
			key: "name"
		},
		auth_url: "/contractorManage#/contractorPerson",
		utype: 6,
		type_name: "contractor_name"
	}
};

export const THINGS_TYPE_OPTIONS = {
	1: "person",
	2: "truck",
	3: "visitor",
	5: "material",
	6: "contractor"
};

export function getThingsColumns(type) {
	return things_info_type[type].get_info_field_fn();
}

export function useInfoImg(type) {
	return things_info_type[type].img;
}

export function useInfoImgIsShow(type) {
	return dict_store.getters[things_info_type[type].dict_items].find(item => ["person_photo", "photo", "truck_photo", "picture"].includes(item.field)).is_display;
}

export function useInfoTitle(type) {
	return things_info_type[type].dialog_title;
}

export function useThingAuthUrl(type) {
	return things_info_type[type]?.auth_url;
}

export function useThingKey(type) {
	return things_info_type[type]?.dialog_title?.key;
}

export function useThingUtype(type) {
	return things_info_type[type]?.utype;
}
export function useThingTypeName(type) {
	return things_info_type[type]?.type_name;
}

