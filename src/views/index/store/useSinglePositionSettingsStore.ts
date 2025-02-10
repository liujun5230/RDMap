import {cloneDeep} from "lodash-es";
import {useStore} from "@/store/index";
import {resolveCustomText} from "@/store/modules/featureFlags";
import {getDisplaySetting} from "@/api/homepage/detail";
import {useStorageByTheme} from "@index/composable";

const dict_store = useStore();

const getDictItems = (dict_data:any, default_columns_data:any) => {
	const default_columns = default_columns_data.filter((columns:any) => (columns.disable_display || columns.label === "部门" || dict_data.find((item:any) => (item.is_display && columns.label === item.name))));
	dict_data.forEach((item:any) => {
		if (item.is_display && !default_columns.find((columns:any) => columns.label === item.name) && !["三维模型", "二维图标"].includes(item.name)) {
			const type = item.type === 2 ? "picture" : "text";
			default_columns.push({label: item.name, prop: item.name, is_display: 0, type, is_attachment: item.type === 7});
		}
	});
	return default_columns;
};

const getPersonDefaultBase = () => {
	const dict_data = dict_store.getters.person_dict_items;
	const default_columns:any = [
		{label: "头像", prop: "photo", is_display: 1, disable_drag: true},
		{label: "姓名", prop: "name", is_display: 1, disable_drag: true, disable_display: true},
		{label: "性别", prop: "sex", is_display: 0, disable_drag: true},
		{label: "部门", prop: "branch", is_display: 1, disable_drag: true},
		{label: "工号", prop: "job_num", is_display: 1},
		{label: "工种", prop: "work_type", is_display: 1},
		{label: "职务", prop: "duty", is_display: 1},
		{label: "员工分类", prop: "person_class", is_display: 1},
		{label: "联系电话", prop: "phone", is_display: 0},
		{label: "身份证号", prop: "id_code", is_display: 0},
		{label: "出生日期", prop: "birthday", is_display: 0},
		{label: "学历", prop: "degree", is_display: 0},
		{label: "年龄", prop: "age", is_display: 0},
		{label: "民族", prop: "nation", is_display: 0},
		{label: "主要工作地点", prop: "workplace", is_display: 0},
		{label: "住址", prop: "address", is_display: 0}
	];
	return getDictItems(dict_data, default_columns);
};

const getPersonDefaultBusiness = (pit_display:boolean, attendance_display:boolean, store_columns:any) => {
	let default_columns:any = store_columns ? cloneDeep(store_columns) : [
		{
			label: resolveCustomText("pit") + "数据",
			prop: "in_out_data",
			is_display: 0,
			children: [
				{label: "进出状态", prop: "status", is_display: 0, disable_drag: true},
				{label: "进入时间", prop: "in_time", is_display: 0, disable_drag: true},
				{label: "离开时间", prop: "out_time", is_display: 0, disable_drag: true},
				{label: "停留时长", prop: "stay_time", is_display: 0, disable_drag: true},
			]
		},
		{
			label: "考勤数据",
			prop: "attendance",
			is_display: 0,
			children: [
				{label: "考勤组", prop: "group", is_display: 0, disable_drag: true},
				{label: "考勤班次", prop: "frequent", is_display: 0, disable_drag: true},
				{label: "上班时间", prop: "start_time", is_display: 0, disable_drag: true},
				{label: "下班时间", prop: "end_time", is_display: 0, disable_drag: true},
				{label: "工作时长", prop: "work_time", is_display: 0, disable_drag: true},
			]
		},
		{
			label: "健康数据",
			prop: "health",
			is_display: 0,
			children: [
				{label: "心率", prop: "heart_rate", is_display: 0},
				{label: "血氧", prop: "oxygen", is_display: 0},
				{label: "体温", prop: "body_temperature", is_display: 0},
				{label: "运动距离", prop: "distance", is_display: 0},
				{label: "运动步数", prop: "step", is_display: 0},
			]
		}
	];
	if (!pit_display) {
		default_columns = default_columns.filter((item:any) => item.prop !== "in_out_data");
	}
	if (!attendance_display) {
		default_columns = default_columns.filter((item:any) => item.prop !== "attendance");
	}
	return default_columns;
};

const getVisitorDefaultBase = () => {
	const dict_data = dict_store.getters.visitor_dict_items;
	const default_columns:any = [
		{label: "头像", prop: "photo", is_display: 1, disable_drag: true},
		{label: "姓名", prop: "name", is_display: 1, disable_drag: true, disable_display: true},
		{label: "性别", prop: "sex", is_display: 0, disable_drag: true},
		{label: "单位", prop: "unit", is_display: 1, disable_drag: true},
		{label: "联系电话", prop: "phone", is_display: 1},
		{label: "身份证号", prop: "id_code", is_display: 0},
		{label: "数据来源", prop: "source", is_display: 0},
		{label: "预约记录", prop: "record_count", is_display: 0},
	];
	return getDictItems(dict_data, default_columns);
};

const getVisitorDefaultBusiness = (store_columns:any) => {
	const default_columns = store_columns ? cloneDeep(store_columns) : [
		{
			label: "预约数据",
			prop: "appointment",
			is_display: 0,
			children: [
				{label: "访问状态", prop: "status", is_display: 0, disable_drag: true},
				{label: "预约来访开始时间", prop: "reserve_start_time", is_display: 0, disable_drag: true},
				{label: "预约来访结束时间", prop: "reserve_end_time", is_display: 0, disable_drag: true},
			]
		},
		{
			label: "健康数据",
			prop: "health",
			is_display: 0,
			children: [
				{label: "心率", prop: "heart_rate", is_display: 0},
				{label: "血氧", prop: "oxygen", is_display: 0},
				{label: "体温", prop: "body_temperature", is_display: 0},
				{label: "运动距离", prop: "distance", is_display: 0},
				{label: "运动步数", prop: "step", is_display: 0},
			]
		}

	];
	return default_columns;
};

const getContractorDefaultBase = () => {
	const dict_data = dict_store.getters.contractor_items;
	const default_columns:any = [
		{label: "头像", prop: "photo", is_display: 1, disable_drag: true},
		{label: "姓名", prop: "name", is_display: 1, disable_drag: true, disable_display: true},
		{label: "性别", prop: "sex", is_display: 0, disable_drag: true},
		{label: "承包商单位", prop: "unit_id", is_display: 1, disable_drag: true},
		{label: "工种", prop: "work_type_id", is_display: 1},
		{label: "联系电话", prop: "phone", is_display: 1},
		{label: "身份证号", prop: "id_code", is_display: 0},
		{label: "出生日期", prop: "birthday", is_display: 0},
		{label: "年龄", prop: "age", is_display: 0},
		{label: "民族", prop: "nation", is_display: 0},
	];
	return getDictItems(dict_data, default_columns);
};

const getContractorDefaultBusiness = (store_columns:any) => {
	const default_columns = store_columns ? cloneDeep(store_columns) : [
		{
			label: "健康数据",
			prop: "health",
			is_display: 0,
			children: [
				{label: "心率", prop: "heart_rate", is_display: 0},
				{label: "血氧", prop: "oxygen", is_display: 0},
				{label: "体温", prop: "body_temperature", is_display: 0},
				{label: "运动距离", prop: "distance", is_display: 0},
				{label: "运动步数", prop: "step", is_display: 0},
			]
		}

	];
	return default_columns;
};

const getTruckDefaultBase = () => {
	const dict_data = dict_store.getters.car_dict_items;
	const default_columns:any = [
		{label: "头像", prop: "photo", is_display: 1, disable_drag: true},
		{label: "车牌号", prop: "licence", is_display: 1, disable_drag: true, disable_display: true},
		{label: "司机", prop: "driver", is_display: 1, disable_drag: true},
		{label: "车辆类型", prop: "type_name", is_display: 1},
		{label: "联系电话", prop: "phone", is_display: 1},
		{label: "身份证号", prop: "id_code", is_display: 0},
		{label: "单位", prop: "unit", is_display: 0},
	];
	return getDictItems(dict_data, default_columns);
};

const getMaterialDefaultBase = () => {
	const dict_data = dict_store.getters.material_dict_items;
	const comment_item = dict_data.find((item:any) => item.name === "备注");
	const type = (comment_item && comment_item.type === 2) ? "picture" : "text";
	const default_columns:any = [
		{label: "头像", prop: "photo", is_display: 1, disable_drag: true},
		{label: "物资编号", prop: "serial_num", is_display: 1, disable_drag: true, disable_display: true},
		{label: "物资名称", prop: "material_name", is_display: 1, disable_drag: true},
		{label: "物资类型", prop: "type", is_display: 1},
		{label: "备注", prop: "comment", is_display: 1, type},
	];
	return getDictItems(dict_data, default_columns);
};

const getLocationBaseDefault = (store_columns:any) => {
	const store = useStore();
	const base_arr = ["员工"];
	if (store.getters.flags.displayVisitor) base_arr.push("访客");
	if (store.getters.flags.displayContractor) base_arr.push("承包商");
	const fit_position_person_visitor = base_arr.join("、");
	if (store.getters.flags.car) base_arr.push("车辆");
	if (store.getters.flags.displayMaterial) base_arr.push("物资");
	const fit_position_obj = base_arr.join("、");
	const fit_all = [...base_arr, "陌生卡"].join("、");
	let location_base_columns = store_columns ? cloneDeep(store_columns) : [
		{label: "卡号", prop: "card_id", is_display: 1, fit_obj: fit_all, disable_drag: true, disable_display: true},
		{label: "电量", prop: "power", is_display: 1, fit_obj: fit_all, disable_drag: true},
		{label: "状态（在线/离线）", prop: "status", is_display: 1, fit_obj: fit_all, disable_drag: true},
		{label: "标签类型", prop: "type_name", is_display: 1, fit_obj: fit_all},
		{label: "所在地图", prop: "floor", is_display: 0, fit_obj: fit_all},
		{
			label: "区域数据",
			prop: "area_data",
			is_display: 1,
			fit_obj: fit_all,
			children: [
				{label: "所在区域", prop: "areas", is_display: 1, fit_obj: fit_all, disable_drag: true},
				{label: "进区时间", prop: "entry_time", is_display: 0, fit_obj: fit_position_obj, disable_drag: true},
				{label: "停留时长", prop: "stay_time", is_display: 0, fit_obj: fit_position_obj, disable_drag: true},
			]
		},
		{
			label: resolveCustomText("pit") + "数据",
			prop: "pit_data",
			is_display: 0,
			fit_obj: fit_position_obj,
			children: [
				{label: resolveCustomText("pit") + "状态", prop: "up_down_status", is_display: 0, fit_obj: fit_position_obj, disable_drag: true},
				{label: resolveCustomText("enter_pit") + "时间", prop: "down_time", is_display: 0, fit_obj: fit_position_obj, disable_drag: true},
				{label: resolveCustomText("leave_pit") + "时间", prop: "up_time", is_display: 0, fit_obj: fit_position_obj, disable_drag: true},
				{label: resolveCustomText("enter_pit") + "时长", prop: "pit_stay_time", is_display: 0, fit_obj: fit_position_obj, disable_drag: true},
			]
		},
		{label: "距离基站", prop: "bs_distance", is_display: 0, fit_obj: fit_all},
		{label: "坐标", prop: "coordinate", is_display: 0, fit_obj: fit_all},
		{label: "所乘车辆", prop: "truck", is_display: 0, fit_obj: fit_position_person_visitor}
	];
	if (!store.getters.flags.car) {
		location_base_columns = location_base_columns.filter((item:any) => item.prop !== "truck");
	}
	if (store_columns) {
		location_base_columns.forEach((item:any) => {
			item.fit_obj = fit_all;
			if (item.prop === "truck") item.fit_obj = fit_position_person_visitor;
			if (item.prop === "pit_data") item.fit_obj = fit_position_obj;
			if (item.children && item.children.length) {
				item.children.forEach((child:any) => {
					child.fit_obj = fit_position_obj;
					if (child.prop === "areas") child.fit_obj = fit_all;
				});
			}
		});
	}
	return location_base_columns;
};

export const useSinglePositionSettingStore = () => {
	const default_setting: any = {
		person_base: cloneDeep(getPersonDefaultBase()),
		person_business: cloneDeep(getPersonDefaultBusiness(true, true, null)),
		visitor_base: cloneDeep(getVisitorDefaultBase()),
		visitor_business: cloneDeep(getVisitorDefaultBusiness(null)),
		contractor_base: cloneDeep(getContractorDefaultBase()),
		contractor_business: cloneDeep(getContractorDefaultBusiness(null)),
		truck_base: cloneDeep(getTruckDefaultBase()),
		material_base: cloneDeep(getMaterialDefaultBase()),
		location_info: cloneDeep(getLocationBaseDefault(null))
	};
	const single_position_setting = useStorageByTheme<any>("single-position-setting", default_setting);
	const resetPositionSetting = (type:string) => {
		single_position_setting.value[type] = cloneDeep(default_setting[type]);
	};
	const setPositionInfo = (type:string, info:any) => {
		single_position_setting.value[type] = cloneDeep(info);
	};
	const initPositionInfo = (dict_items:any, type:string) => {
		if (single_position_setting.value[type]) {
			single_position_setting.value[type] = cloneDeep(getDictItems(dict_items, single_position_setting.value[type]));
		}
	};
	const initBusinessInfo = async () => {
		const res_data = await getDisplaySetting();
		if (single_position_setting.value["person_business"]) {
			single_position_setting.value["person_business"] = cloneDeep(getPersonDefaultBusiness(res_data.data.pit_display, res_data.data.attendance_display, single_position_setting.value["person_business"]));
		}
		if (single_position_setting.value["contractor_business"]) {
			single_position_setting.value["contractor_business"] = cloneDeep(getContractorDefaultBusiness(single_position_setting.value["contractor_business"]));
		}
		if (single_position_setting.value["visitor_business"]) {
			single_position_setting.value["visitor_business"] = cloneDeep(getVisitorDefaultBusiness(single_position_setting.value["visitor_business"]));
		}
	};
	const initLocationInfo = () => {
		if (single_position_setting.value["location_info"]) {
			single_position_setting.value["location_info"] = cloneDeep(getLocationBaseDefault(single_position_setting.value["location_info"]));
		}
	};
	initLocationInfo();
	initBusinessInfo();
	initPositionInfo(dict_store.getters.material_dict_items, "material_base");
	initPositionInfo(dict_store.getters.person_dict_items, "person_base");
	initPositionInfo(dict_store.getters.visitor_dict_items, "visitor_base");
	initPositionInfo(dict_store.getters.contractor_items, "contractor_base");
	initPositionInfo(dict_store.getters.car_dict_items, "truck_base");
	return {resetPositionSetting, setPositionInfo, single_position_setting: single_position_setting.value};
};
