import {computed, type ComputedRef, type Ref} from "vue";
import {cloneDeep} from "lodash-es";
import {resolveCustomText} from "@/store/modules/featureFlags";
import {DEVICE_TYPES} from "@index/utils/types";
import type {CascaderOption, DynamicData, ExcludeSettings, ReloadSettingFn} from "@/components/mapSettings/types";
import {
	AREA,
	ATTENDANCE_AREA,
	BASE_STATION,
	BUILDING,
	BUILDING_NAME,
	CAMERA,
	CAR,
	CARD_ID,
	SCOPE,
	GATHER_ALARM_AREA,
	CLUSTER,
	DANGER_AREA,
	DEVICE,
	DEVICE_BASIC_FIELD,
	DEVICE_ID,
	DEVICE_NAME,
	DISPLAY_WAY,
	ELECTRONIC_FENCE,
	FLOOR_NAME,
	GROUP,
	HEAT,
	HIDE_CAMERA_AREA,
	LAYER,
	LITTLE_MAP,
	MATERIAL,
	NAME,
	OBSTACLE_AREA,
	PATROL,
	PERSON,
	PIT_AREA,
	PO_BASIC_FIELD,
	POSITION_OBJECT,
	POWER,
	RESET,
	SHOW_CAMERA_AREA,
	STATISTICS,
	STRANGER,
	TYPE,
	VISITOR,
	ACTIVE_AREA,
	BLIND_AREA,
	LOCATING_OPTIMUM_AREA,
	ROLL_CALL_AREA,
	DEVICE_FLOOR,
	GATHER_DYNAMIC_MERGE,
	GATHER_DYNAMIC_NO_MERGE, MODEL_ICON, NO_CLUSTER, CONTRACTOR
} from "@/components/mapSettings/optionValueKeys";
import {useMapSettingStore} from "@index/store";
import {MessageBox, Notification} from "element-ui";

import store from "@/store";
import {getMapSettingConfig, SETTING_KEY} from "@/components/mapSettings/pageConfig";
import {useAreaMapStorage} from "@/composable/map/useAreaMapStorage";

const flags = computed(() => store.getters.flags);

const delConfig = (options: CascaderOption[], val: string | number) => {
	for (let i = 0; i < options.length; i++) {
		if (options[i].key!.includes(val.toString())) {
			options.splice(i--, 1);
			break;
		}
		const {children: op_children} = options[i];
		if (op_children) {
			delConfig(op_children, val);
		}
	}
};

const filterHiddenOption = (options: CascaderOption[]) => {
	return options.filter((it: CascaderOption) => {
		if (it.is_show || it.is_show === undefined) {
			if (it.children?.length) {
				it.children = filterHiddenOption(it.children);
			}
			return true;
		}
		return false;
	});
};

const filterSettings = (all_options: CascaderOption[], exclude_settings: ExcludeSettings[]) => {
	const options = cloneDeep(all_options);
	exclude_settings.map(exclude_setting => delConfig(options, exclude_setting instanceof Array ? exclude_setting.join("-") : exclude_setting));
	return filterHiddenOption(options);
};

const appendKey = (options: CascaderOption[], key_suffix = "") => {
	for (let i = 0; i < options.length; i++) {
		options[i].key = (key_suffix ? key_suffix + "-" : "") + options[i].value;
		const children = options[i]?.children;
		if (children?.length) {
			appendKey(children, options[i].key);
		}
	}
	return options;
};

const appendIndex = (options: CascaderOption[]) => {
	for (let i = 0; i < options.length; i++) {
		options[i].index = i;
		const children = options[i]?.children;
		if (children?.length) {
			appendIndex(children);
		}
	}
	return options;
};

export const useMapSettings = (key: Ref<SETTING_KEY>, {
	branch_tree,
	contractor_unit,
	area_by_type,
	area_by_group,
	attendance_area,
	roll_call_area,
	pit_area,
	is_show_bs,
	is_show_camera,
	is_show_door,
	is_show_power,
	is_show_switch,
	is_show_smart_machine,
	is_show_light_alarm,
	is_show_traffic_light,
	is_show_patrol,
	is_show_obstacle,
	is_show_active_area,
	is_show_blind,
	bs_type_list
}: DynamicData, reloadFn: ReloadSettingFn) => {
	const all_options: ComputedRef<CascaderOption[]> = computed(() => appendKey([
		{
			value: POSITION_OBJECT, label: "定位对象", type: 1, indeterminate: false, checked: false, children: [
				{value: PERSON, label: "员工", type: 1, indeterminate: false, checked: false, children: cloneDeep(branch_tree.value)}, // 部门
				{value: VISITOR, label: "访客", type: 1, indeterminate: false, checked: false, is_show: flags.value.displayVisitor},
				{value: CONTRACTOR, label: "承包商", type: 1, indeterminate: false, checked: false, is_show: flags.value.displayContractor, children: contractor_unit.value},
				{value: CAR, label: "车辆", type: 1, indeterminate: false, checked: false, is_show: flags.value.car},
				{value: MATERIAL, label: "物资", type: 1, indeterminate: false, checked: false, is_show: flags.value.displayMaterial},
				{value: STRANGER, label: "陌生卡", type: 1, indeterminate: false, checked: false},
			]
		},
		{
			value: PO_BASIC_FIELD, label: "定位对象基础字段", type: 1, indeterminate: false, checked: false, children: [
				{value: NAME, label: "名称", type: 1, indeterminate: false, checked: false},
				{value: CARD_ID, label: "标签卡号", type: 1, indeterminate: false, checked: false},
				{value: FLOOR_NAME, label: "标签所在楼层", type: 1, indeterminate: false, checked: false},
			]
		},
		{
			value: DISPLAY_WAY, label: "定位对象显示", type: 1, indeterminate: false, checked: false, children: [
				{value: MODEL_ICON, label: "模型/图标", type: 1, indeterminate: false, checked: false, child_ratio_value: NO_CLUSTER, children: [
					{value: NO_CLUSTER, label: "不聚类", type: 2},
					{value: CLUSTER, label: "聚类", type: 2},
				]},
				{value: HEAT, label: "热力图", type: 1, indeterminate: false, checked: false},
			]
		},
		{
			value: DEVICE, label: "设备", type: 1, indeterminate: false, checked: false, children: [
				{
					value: BASE_STATION, label: "基站", type: 1, indeterminate: false, checked: false, is_show: is_show_bs.value,
					children: bs_type_list.value.map(item => ({value: item.id, label: item.name, type: 1, indeterminate: false, checked: false}))
				},
				{
					value: CAMERA, label: "摄像头", type: 1, indeterminate: false, checked: false, child_ratio_value: HIDE_CAMERA_AREA, is_show: is_show_camera.value, children: [
						{value: HIDE_CAMERA_AREA, label: "不显示摄像头区域", type: 2},
						{value: SHOW_CAMERA_AREA, label: "显示摄像头区域", type: 2},
					]
				},
				{value: DEVICE_TYPES.DOOR, label: "唯一性检测装置", type: 1, indeterminate: false, checked: false, is_show: is_show_door.value && flags.value.device.door},
				{
					value: POWER, label: "电源", type: 1, indeterminate: false, checked: false, is_show: is_show_power.value, children: [
						{value: DEVICE_TYPES.POWER_SOURCE, label: "浇封电源", type: 1, indeterminate: false, checked: false},
						{value: DEVICE_TYPES.POWER_BOX, label: "隔爆电源", type: 1, indeterminate: false, checked: false},
						{value: DEVICE_TYPES.POWER_UPS, label: "UPS电源", type: 1, indeterminate: false, checked: false},
					]
				},
				{value: DEVICE_TYPES.SWITCH, label: "交换机", type: 1, indeterminate: false, checked: false, is_show: is_show_switch.value},
				{value: DEVICE_TYPES.SMART_CARD_MACHINE, label: "智能发卡一体机", type: 1, indeterminate: false, checked: false, is_show: is_show_smart_machine.value},
				{value: DEVICE_TYPES.TRAFFIC_LIGHT, label: "红绿灯", type: 1, indeterminate: false, checked: false, is_show: is_show_traffic_light.value},
				{value: DEVICE_TYPES.LIGHT_ALARM, label: "声光报警器", type: 1, indeterminate: false, checked: false, is_show: is_show_light_alarm.value},
			]
		},
		{
			value: DEVICE_BASIC_FIELD, label: "设备基础字段", type: 1, indeterminate: false, checked: false, children: [
				{value: DEVICE_NAME, label: "设备名称", type: 1, indeterminate: false, checked: false},
				{value: DEVICE_ID, label: "设备ID", type: 1, indeterminate: false, checked: false},
				{value: DEVICE_FLOOR, label: "设备所在楼层", type: 1, indeterminate: false, checked: false},
			]
		},
		{
			value: BUILDING, label: "建筑", type: 1, indeterminate: false, checked: false, children: [
				{value: LAYER, label: "建筑分层展开", type: 1, indeterminate: false, checked: false},
				{value: BUILDING_NAME, label: "建筑名称", type: 1, indeterminate: false, checked: false},
				{value: STATISTICS, label: "统计定位对象", type: 1, indeterminate: false, checked: false},
			]
		},
		{
			value: AREA, label: "区域", type: 1, indeterminate: false, checked: false, children: [
				{
					value: ELECTRONIC_FENCE, label: "电子围栏区域", type: 1, indeterminate: false, checked: false, child_ratio_value: TYPE, is_show: !!area_by_group.value.length, children: [
						{value: TYPE, label: "按区域类型选择", type: 2, children: cloneDeep(area_by_type.value)}, // 区域类型
						{value: GROUP, label: "按区域分组选择", type: 2, children: cloneDeep(area_by_group.value)}, // 区域分组
					]
				},
				{value: ATTENDANCE_AREA, label: "考勤区域", type: 1, indeterminate: false, checked: false, is_show: !!attendance_area.value.length, children: cloneDeep(attendance_area.value)}, // 考勤区域
				{value: ROLL_CALL_AREA, label: "点名区域", type: 1, indeterminate: false, checked: false, is_show: !!roll_call_area.value.length, children: cloneDeep(roll_call_area.value)}, // 点名区域
				{value: PIT_AREA, label: resolveCustomText("pit") + "区域", type: 1, indeterminate: false, checked: false, is_show: !!pit_area.value.length, children: cloneDeep(pit_area.value)}, // 上下井区域
				{
					value: LOCATING_OPTIMUM_AREA, label: "定位优化区域", type: 1, indeterminate: false, checked: false, children: [
						{value: OBSTACLE_AREA, label: "障碍物区域", type: 1, indeterminate: false, checked: false, is_show: is_show_obstacle.value},
						{value: ACTIVE_AREA, label: "活动区域", type: 1, indeterminate: false, checked: false, is_show: is_show_active_area.value},
						{value: BLIND_AREA, label: "盲区", type: 1, indeterminate: false, checked: false, is_show: is_show_blind.value},
					]
				},
				{value: PATROL, label: "巡检点", type: 1, indeterminate: false, checked: false, is_show: is_show_patrol.value},
			]
		},
		{
			value: SCOPE, label: "范围", type: 1, indeterminate: false, checked: false, children: [
				{value: DANGER_AREA, label: "危险源范围", type: 1, indeterminate: false, checked: false},
				{value: GATHER_ALARM_AREA, label: "聚集告警范围", type: 1, indeterminate: false, checked: false, child_ratio_value: GATHER_DYNAMIC_MERGE, children: [
					{value: GATHER_DYNAMIC_MERGE, label: "聚集数量动态合并", type: 2},
					{value: GATHER_DYNAMIC_NO_MERGE, label: "聚集数量不合并", type: 2},
				]},
			]
		},
		{value: LITTLE_MAP, label: "鹰眼地图", type: 1, indeterminate: false, checked: false},
		{value: RESET, label: "重置选项", type: 3, clickFn: resetOptions},
	]));
	const resetOptions = () => {
		const {resetMapSetting: resetIndexMapSetting} = useMapSettingStore();
		const {resetMapSetting: resetAreaMapSetting} = useAreaMapStorage(key.value);
		MessageBox.confirm("确定重置？<br />确定后，将恢复为系统默认设置", "重置", {
			cancelButtonText: "取消",
			confirmButtonText: "确定",
			customClass: "fk-index-message-box",
			confirmButtonClass: "fk-index-button",
			cancelButtonClass: "fk-index-button",
			closeOnClickModal: false,
			dangerouslyUseHTMLString: true,
			type: "warning"
		})
			.then(() => {
				if (key.value.startsWith("index")) {
					resetIndexMapSetting();
				} else {
					resetAreaMapSetting();
				}
				reloadFn();
				Notification({
					type: "success",
					title: "成功",
					message: "重置选项成功"
				});
			})
			.catch(() => {});
	};

	// type 1 多选 2 单选 3 按钮 4 无选择框
	// child_ratio_value 子级单选值
	return computed(() => appendIndex(filterSettings(all_options.value, getMapSettingConfig(key.value))));
};
