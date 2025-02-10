<template>
<OnClickOutside @trigger="closePanel">
	<div class="map-settings">
		<el-popover
			v-model="show_map_settings"
			placement="bottom-start"
			trigger="click"
			popper-class="map-settings-popper"
			@hide="onPopperHide"
		>
			<el-cascader-panel
				ref="cascader_ref"
				:options="options"
				:style="{maxHeight: max_height + 'px'}"
				:props="{expandTrigger: 'hover'}"
				@expand-change="onExpandChange"
			>
				<template #default="{ node, data }">
					<el-checkbox
						v-if="data.type === 1"
						v-model="data.checked"
						class="fk-index-checkbox"
						:indeterminate="data.indeterminate"
						:disabled="data.disabled"
						@change="handleCheckBox($event, node, true)"
						@mouseenter.native="handleNodeMouseEnter(node)"
					>
						<text-ellipsis>{{ data.label }}</text-ellipsis>
					</el-checkbox>
					<el-radio
						v-else-if="data.type === 2"
						v-model="node.parent.data.child_ratio_value"
						:label="data.value"
						:disabled="data.disabled"
						@input="handleRatioChange(node)"
					>
						<text-ellipsis>{{ data.label }}</text-ellipsis>
					</el-radio>
					<span
						v-else-if="data.type === 3"
						class="select-button"
						@click="data.clickFn"
					><text-ellipsis>{{ data.label }}</text-ellipsis></span>
					<span v-else-if="data.type === 4"><text-ellipsis>{{ data.label }}</text-ellipsis></span>
				</template>
			</el-cascader-panel>
		</el-popover>
	</div>
</OnClickOutside>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, ref, toRef, watch} from "vue";
import {OnClickOutside} from "@vueuse/components";
import {getBranchList} from "@/api/company/branchSetting";
import {useMapSettings} from "@/components/mapSettings/useMapSettings";
import {getAreaDict} from "@/api/area/areaDict";
import {getArea} from "@/api/area/area";
import {useMapSettingStore} from "@index/store";
import type {
	Area, AreaDict,
	AreaGroup,
	Branch,
	CascaderOption,
	ChangeData,
	OptionValue,
	ReloadSettingFn,
	SettingCascaderNode
} from "@/components/mapSettings/types";
import {storeToRefs} from "pinia";
import {useEventBus, until} from "@vueuse/core";
import {DEVICE_REFRESH, SETTING_CHANGE_KEY, UPDATE_AREA, UPDATE_BRANCH, UPDATE_CONTRACTOR} from "@/events";
import {
	ACTIVE_AREA,
	AREA,
	ATTENDANCE_AREA,
	BASE_STATION,
	BLIND_AREA,
	BUILDING,
	CAMERA,
	CAR,
	DANGER_AREA,
	DEVICE,
	DEVICE_BASIC_FIELD,
	DISPLAY_WAY,
	ELECTRONIC_FENCE,
	GATHER_ALARM_AREA,
	HIDE_CAMERA_AREA,
	LITTLE_MAP,
	LOCATING_OPTIMUM_AREA,
	MATERIAL,
	OBSTACLE_AREA,
	PATROL,
	PERSON,
	PIT_AREA,
	PO_BASIC_FIELD,
	POSITION_OBJECT,
	POWER,
	ROLL_CALL_AREA,
	SCOPE,
	SHOW_CAMERA_AREA,
	STRANGER,
	VISITOR,
	TYPE,
	GROUP,
	GATHER_DYNAMIC_MERGE,
	GATHER_DYNAMIC_NO_MERGE,
	MODEL_ICON,
	NO_CLUSTER,
	CLUSTER,
	LAYER,
	BUILDING_NAME,
	STATISTICS, CONTRACTOR
} from "@/components/mapSettings/optionValueKeys";
import {
	type AreaDivide,
	BS_TYPE,
	type BuildingConfig,
	DEVICE_TYPES,
	type DeviceBaseField, type DisplayMode,
	type LocationLabelField
} from "@index/utils/types";
import {cloneDeep} from "lodash-es";
import {getDeviceInfo} from "@/api/deviceManage/info";
import {getEquip} from "@/api/device/camera";
import TextEllipsis from "@/components/TextEllipsis.vue";
import {useAreaMapStorage} from "@/composable/map/useAreaMapStorage";
import type {SETTING_KEY} from "@/components/mapSettings/pageConfig";
import {AreaType} from "@/types/global";
import {type BSTypeInfo, getBaseType} from "@/api/deviceManage/type";
import {type ContractorUnitRow, getContractorUnit} from "@/api/contractor/Company";

const LI_HEIGHT = 30; // 每一个Node高度 包括margin-bottom
const MAX_NODE_NUM = 10; // 后续增加第一级的选项 修改此常量来修改最大高度
const MAX_MENU_HEIGHT = MAX_NODE_NUM * LI_HEIGHT - 4 + 16 + 6; // 最大高度 数字解释：- 4(减去最后一个没有下边距) + 16(上下padding) + 6(滚动条高度)
const GROUP_PREFIX = "group_"; // 区域分组和区域分类value增加前缀防止和区域ID重复
const TYPE_PREFIX = "type_";

const area_bus = useEventBus(UPDATE_AREA);
const branch_bus = useEventBus(UPDATE_BRANCH);
const device_bus = useEventBus(DEVICE_REFRESH);
const contractor_bus = useEventBus(UPDATE_CONTRACTOR);
const POWER_TYPES = [DEVICE_TYPES.POWER_SOURCE, DEVICE_TYPES.POWER_UPS, DEVICE_TYPES.POWER_BOX];

const props = withDefaults(defineProps<{
	value: boolean,
	settingKey: SETTING_KEY,
	isEmergency?: boolean
}>(), {isEmergency: false});

const {map_setting: index_map_setting} = storeToRefs(useMapSettingStore());
const {area_map_setting} = useAreaMapStorage(props.settingKey);
const is_index = computed(() => props.settingKey.startsWith("index"));
const map_setting = computed({
	get() { // 因为首页有主题历史分布情况比较复杂 和后台的显示设置是分开的store
		return is_index.value ? index_map_setting.value : area_map_setting.value;
	},
	set(val) {
		if (is_index.value) {
			index_map_setting.value = val;
		} else {
			area_map_setting.value = val;
		}
	}
});
const show_unused_area = computed(() => !is_index.value); // 首页不显示未启用区域 后台会显示

const show_map_settings = ref(false);
const cascader_ref = ref();
const is_loaded_data = ref(false);

let current_settings = cloneDeep(map_setting.value); // 当前设置的值  用于切换主题时做前后对比

const initCacheData = () => {
	// 定位对象
	checkPositionObjectOption();

	// 定位对象基础字段
	map_setting.value.show_field.map(filed => {
		checkNodeByValue(getNode([PO_BASIC_FIELD]), filed);
	});

	// 定位对象显示方式
	map_setting.value.show_type.map(it => {
		checkNodeByValue(getNode([DISPLAY_WAY]), it);
	});
	checkNodeByValue(getNode([DISPLAY_WAY, MODEL_ICON]), map_setting.value.is_show_cluster ? CLUSTER : NO_CLUSTER);

	// 设备
	checkDeviceOptions();

	// 设备基础字段
	map_setting.value.device_base_field.map(field => {
		checkNodeByValue(getNode([DEVICE_BASIC_FIELD]), field);
	});

	// 建筑
	map_setting.value.building_config.map(conf => {
		checkNodeByValue(getNode([BUILDING]), conf);
	});

	// 区域
	checkAreaOptions();

	// 范围
	map_setting.value.is_show_danger && handleCheckBox(true, getNode([SCOPE, DANGER_AREA]));
	map_setting.value.is_show_gather_alarm && handleCheckBox(true, getNode([SCOPE, GATHER_ALARM_AREA]));
	checkNodeByValue(getNode([SCOPE, GATHER_ALARM_AREA]), map_setting.value.is_dynamic_merge_gather ? GATHER_DYNAMIC_MERGE : GATHER_DYNAMIC_NO_MERGE);

	// 鹰眼地图
	map_setting.value.is_show_overview && handleCheckBox(true, getNode([LITTLE_MAP]));
};

const checkPositionObjectOption = () => {
	if (map_setting.value.selected_all_person) {
		handleCheckBox(true, getNode([POSITION_OBJECT, PERSON]));
	} else {
		map_setting.value.branch_id_list.map(branch_id => {
			checkNodeByValue(getNode([POSITION_OBJECT, PERSON]), branch_id, [], map_setting.value.branch_checked_all_list);
		});
	}
	if (map_setting.value.selected_all_contractor) {
		handleCheckBox(true, getNode([POSITION_OBJECT, CONTRACTOR]));
	} else {
		map_setting.value.contractor_unit_id_list?.map(id => {
			checkNodeByValue(getNode([POSITION_OBJECT, CONTRACTOR]), id);
		});
	}
	map_setting.value.is_show_visitor && handleCheckBox(true, getNode([POSITION_OBJECT, VISITOR]));
	map_setting.value.is_show_car && handleCheckBox(true, getNode([POSITION_OBJECT, CAR]));
	map_setting.value.is_show_material && handleCheckBox(true, getNode([POSITION_OBJECT, MATERIAL]));
	map_setting.value.is_show_stranger && handleCheckBox(true, getNode([POSITION_OBJECT, STRANGER]));
};

const checkAreaOptions = () => {
	checkNodeByValue(getNode([AREA, ELECTRONIC_FENCE]), map_setting.value.area_select_by);
	map_setting.value.area_id_list.map(id => { // 勾选点名 考勤 出入口 电子围栏
		checkNodeByValue(getNode([AREA]), id);
	});
	map_setting.value.is_show_obstacle_area && handleCheckBox(true, getNode([AREA, LOCATING_OPTIMUM_AREA, OBSTACLE_AREA]));
	map_setting.value.is_show_active_area && handleCheckBox(true, getNode([AREA, LOCATING_OPTIMUM_AREA, ACTIVE_AREA]));
	map_setting.value.is_show_blind && handleCheckBox(true, getNode([AREA, LOCATING_OPTIMUM_AREA, BLIND_AREA]));
	map_setting.value.is_show_patrol && handleCheckBox(true, getNode([AREA, PATROL]));
	map_setting.value.selected_all_pit_area && handleCheckBox(true, getNode([AREA, PIT_AREA]));
	map_setting.value.selected_all_roll_call_area && handleCheckBox(true, getNode([AREA, ROLL_CALL_AREA]));
	map_setting.value.selected_all_attendance_area && handleCheckBox(true, getNode([AREA, ATTENDANCE_AREA]));
	if (map_setting.value.selected_all_electronic_fence) { // 电子围栏全选 子集直接全选
		handleCheckBox(true, getNode([AREA, ELECTRONIC_FENCE]));
	} else { // 电子围栏没有全选 但是勾选的区域类型或区域分组下的区域需要全选
		const node = getNode([AREA, ELECTRONIC_FENCE]);
		if (node) {
			if (node.data.child_ratio_value === TYPE) {
				map_setting.value.selected_area_types?.map(id => {
					handleCheckBox(true, getNode([AREA, ELECTRONIC_FENCE, TYPE, id]));
				});
			} else if (node.data.child_ratio_value === GROUP) {
				map_setting.value.selected_area_groups?.map(id => {
					handleCheckBox(true, getNode([AREA, ELECTRONIC_FENCE, GROUP, id]));
				});
			}
		}
	}
};

const checkDeviceOptions = () => {
	if (map_setting.value.selected_all_bs) {
		handleCheckBox(true, getNode([DEVICE, BASE_STATION]));
	} else {
		map_setting.value.bs_type_list.map(bs_type => {
			checkNodeByValue(getNode([DEVICE, BASE_STATION]), bs_type);
		});
	}
	map_setting.value.is_show_camera && checkNodeByValue(getNode([DEVICE]), CAMERA);
	map_setting.value.is_show_camera_area && checkNodeByValue(getNode([DEVICE, CAMERA]), SHOW_CAMERA_AREA);
	map_setting.value.device_type_list.map(device_type => {
		checkNodeByValue(getNode([DEVICE]), device_type, [BASE_STATION]);
	});
};

const reloadSetting: ReloadSettingFn = () => {
	options.value = cloneDeep(default_options.value);
	nextTick(() => {
		initCacheData();
		checkEmergencyNeed();
		handleDifference();
	});
};

const checkEmergencyNeed = () => {
	const relative_node = [getNode([POSITION_OBJECT]), getNode([AREA])];
	if (props.isEmergency) {
		relative_node.forEach(node => {
			setNodeDisabled(node, true);
			handleCheckBox(true, node);
		});
	} else {
		relative_node.forEach(node => {
			setNodeDisabled(node, false);
		});
	}
};

const handleAreaResponse = () => {
	const electronic_fence = all_area.filter((i: Area) => i.type === AreaType.VIRTUAL_FENCE);
	area_by_type.value = generateAreaByType(area_types.value, electronic_fence);
	area_by_group.value = generateAreaByGroup(area_groups.value, electronic_fence);
	attendance_area.value = generateAttendanceArea(all_area.filter((i: Area) => i.type === AreaType.ATTENDANCE));
	pit_area.value = generatePitArea(all_area.filter((i: Area) => i.type === AreaType.UP_DOWN_PIT_FIRST || i.type === AreaType.UP_DOWN_PIT_SECOND));
	is_show_obstacle.value = all_area.some((area: Area) => area.type === AreaType.OBSTACLE);
	is_show_active_area.value = all_area.some((area: Area) => area.type === AreaType.ACTIVITY);
	is_show_blind.value = all_area.some((area: Area) => area.type === AreaType.BLIND);
	roll_call_area.value = generateRollCallArea(all_area.filter((i: Area) => i.type === AreaType.CALL));
	is_show_patrol.value = all_area.some((area: Area) => area.type === AreaType.PATROL_POINT);
};

const clearSelection = (node_val: OptionValue) => {
	const option = default_options.value.find(item => item.value === node_val);
	const option_index = options.value.findIndex(item => item.value === node_val);
	if (option_index >= 0 && option) {
		options.value.splice(option_index, 1, option);
	}
};

area_bus.on(() => {
	Promise.all([
		getArea({is_use: show_unused_area.value ? undefined : 1}),
	]).then((res_list) => {
		for (let i = 0; i < res_list.length; i++) {
			const {type, result} = res_list[i].data;
			if (type === 1) {
				switch (i) {
				case 0:
					all_area = result.data;
					handleAreaResponse();
					break;
				}
			}
		}
	}).finally(() => {
		const is_area_checked_all = getNode([AREA])?.data?.checked; // 记录变化之前的全选状态
		const area_option = default_options.value.find(item => item.value === AREA);
		const area_option_index = options.value.findIndex(item => item.value === AREA);
		if (area_option_index >= 0 && area_option) {
			options.value.splice(area_option_index, 1, area_option);
		}
		nextTick(() => {
			// 如果区域是全选状态 新增的区域需要勾选
			const area_node = getNode([AREA]); // 要在修改options之后获取到的才能勾选
			if (is_area_checked_all) {
				checkNodeByValue(getNode([AREA, ELECTRONIC_FENCE]), map_setting.value.area_select_by);
				handleCheckBox(true, area_node); // todo 全选选不了单选
			} else {
				checkAreaOptions();
			}
			const data: ChangeData = {
				checked: {},
				unchecked: {},
			};
			handleAreaChange(data, []);
			current_settings = cloneDeep(map_setting.value);
			useEventBus(SETTING_CHANGE_KEY).emit(data, current_settings);
			console.log("%c change data: ", "color: white;background: #07f;", data);
		});
	});
});

const updatePositionObject = () => {
	const po_option = default_options.value.find(item => item.value === POSITION_OBJECT);
	const po_option_index = options.value.findIndex(item => item.value === POSITION_OBJECT);
	if (po_option_index >= 0 && po_option) {
		options.value.splice(po_option_index, 1, po_option);
	}

	nextTick(() => {
		checkPositionObjectOption();
		const data: ChangeData = {
			checked: {},
			unchecked: {},
		};
		onPersonChange(data);
		onContractorChange(data);
		current_settings = cloneDeep(map_setting.value);
		useEventBus(SETTING_CHANGE_KEY).emit(data, current_settings);
		console.log("%c change data: ", "color: white;background: #07f;", data);
	});
};

branch_bus.on(() => {
	getBranchList().then(res => {
		const {result, type} = res.data;
		if (type === 1) {
			branch_tree.value = generateBranchTree(result.data);
			updatePositionObject();
		}
	});
});

contractor_bus.on(() => {
	getContractorUnit().then(res => {
		const {result, type} = res.data;
		if (type === 1) {
			contractor_unit.value = generateContractor(result.data);
			updatePositionObject();
		}
	});
});

device_bus.on(() => {
	Promise.all([
		getDeviceInfo(),
		getEquip(),
		getBaseType(),
	]).then(res_list => {
		for (let i = 0; i < res_list.length; i++) {
			const {type, result} = res_list[i].data;
			if (type === 1) {
				switch (i) {
				case 0:
					is_show_bs.value = result.data.some((device: any) => device.type === DEVICE_TYPES.BASE_STATION);
					is_show_door.value = result.data.some((device: any) => device.type === DEVICE_TYPES.DOOR);
					is_show_power.value = result.data.some((device: any) => POWER_TYPES.includes(device.type));
					is_show_switch.value = result.data.some((device: any) => device.type === DEVICE_TYPES.SWITCH);
					is_show_smart_machine.value = result.data.some((device: any) => device.type === DEVICE_TYPES.SMART_CARD_MACHINE);
					is_show_traffic_light.value = result.data.some((device: any) => device.type === DEVICE_TYPES.TRAFFIC_LIGHT);
					is_show_light_alarm.value = result.data.some((device: any) => device.type === DEVICE_TYPES.LIGHT_ALARM);
					break;
				case 1:
					is_show_camera.value = !!result.data.length;
					break;
				case 2:
					bs_type_list.value = result.data.filter((i: BSTypeInfo) => i.number);
					break;
				}
			}
		}

		clearSelection(DEVICE);
		nextTick(() => {
			checkDeviceOptions();
			const data: ChangeData = {
				checked: {},
				unchecked: {},
			};
			handleDeviceChange(data, []);
			current_settings = cloneDeep(map_setting.value);
			useEventBus(SETTING_CHANGE_KEY).emit(data, current_settings);
			console.log("%c change data: ", "color: white;background: #07f;", data);
		});
	});
});

watch(
	() => props.value,
	(val) => {
		show_map_settings.value = val;
	}
);

watch(
	() => [props.settingKey, props.isEmergency],
	reloadSetting
);

let all_area: Area[] = [];
const branch_tree = ref<CascaderOption[]>([]);
const contractor_unit = ref<CascaderOption[]>([]);
const area_types = ref([]);
const area_groups = ref([]);
const area_by_type = ref<CascaderOption[]>([]);
const area_by_group = ref<CascaderOption[]>([]);
const attendance_area = ref<CascaderOption[]>([]);
const roll_call_area = ref<CascaderOption[]>([]);
const pit_area = ref<CascaderOption[]>([]);
const bs_type_list = ref<BSTypeInfo[]>([]);
const is_show_bs = ref<boolean>(true); // 区域和设备没有的就不显示父级
const is_show_camera = ref<boolean>(true);
const is_show_door = ref<boolean>(true);
const is_show_power = ref<boolean>(true);
const is_show_switch = ref<boolean>(true);
const is_show_smart_machine = ref<boolean>(true);
const is_show_traffic_light = ref<boolean>(true);
const is_show_light_alarm = ref<boolean>(true);
const is_show_obstacle = ref<boolean>(true);
const is_show_active_area = ref<boolean>(true);
const is_show_blind = ref<boolean>(true);
const is_show_patrol = ref<boolean>(true);

const default_options = useMapSettings(toRef(props, "settingKey"), {branch_tree, contractor_unit, area_by_type, area_by_group, attendance_area, roll_call_area, pit_area, is_show_bs, is_show_camera, is_show_door, is_show_power, is_show_switch, is_show_smart_machine, is_show_traffic_light, is_show_light_alarm, is_show_patrol, is_show_obstacle, is_show_active_area, is_show_blind, bs_type_list}, reloadSetting);
const options = ref<CascaderOption[]>([]);
const max_height = computed(() => (options.value.length || 1) * LI_HEIGHT - 4 + 16); // 当没有数据时 暂无数据栈一个item的高度

function generateBranchTree(res: Branch[]) {
	const arr: Record<string, CascaderOption> = {};
	const r: CascaderOption[] = [];
	const data = res.map((i) => {
		return arr[i.id] = {
			label: i.branch_name,
			value: +i.id,
			type: 1,
			indeterminate: false,
			checked: false,
			checked_others: false,
			has_others: false,
			count: i.person_count,
			pid: i.pid
		};
	});
	data.map((i) => {
		const parent = arr[i.pid];
		if (parent && i.pid !== -1) {
			if (!parent["children"]) {
				parent["children"] = [];
			}
			parent["children"].push(i);
		} else {
			r.push(i);
		}
	});
	r.forEach(it => setHasOthers(it));
	return r;
}

const generateContractor = (res: ContractorUnitRow[]) => {
	return res.map(it => {
		return {
			value: it.id,
			label: it.name,
			checked: false,
			indeterminate: false,
			type: 1
		} as CascaderOption;
	});
};

const generateAreaByType = (area_type: AreaDict[], area_list: Area[]) => {
	const options_obj: Record<string, CascaderOption> = {};
	area_type.map(it => {
		options_obj[it.id] = {
			value: TYPE_PREFIX + it.id,
			label: it.name,
			checked: false,
			indeterminate: false,
			type: 1
		};
	});
	area_list.map(area => {
		const type_id = area.area_type_option_id ? area.area_type_option_id : 0;
		const type_option = options_obj[type_id];
		if (type_option) {
			if (!type_option.children) {
				type_option.children = [];
			}
			type_option.children.push({
				value: area.id,
				label: area.name,
				checked: false,
				indeterminate: false,
				type: 1
			});
		}
	});

	return Object.values(options_obj);
};

const generateAreaByGroup = (area_group: AreaGroup[], area_list: Area[]) => {
	const options_obj: Record<string, CascaderOption> = {};
	const ungrouped: CascaderOption = {
		value: GROUP_PREFIX + -1,
		label: "未分组",
		checked: false,
		indeterminate: false,
		type: 1,
		children: []
	};
	area_group.map(it => {
		options_obj[it.id] = {
			value: GROUP_PREFIX + it.id,
			label: it.name,
			checked: false,
			indeterminate: false,
			type: 1
		};
	});
	area_list.map(area => {
		const group_id = area.area_group?.length ? area.area_group[0].id : 0;

		const data: CascaderOption = {
			value: area.id,
			label: area.name,
			checked: false,
			indeterminate: false,
			type: 1
		};
		const group_option = options_obj[group_id];
		if (group_option) {
			if (!group_option.children) {
				group_option.children = [];
			}
			group_option.children.push(data);
		} else {
			ungrouped.children?.push(data);
		}
	});

	return ungrouped.children?.length ? Object.values(options_obj).concat([ungrouped]) : Object.values(options_obj);
};

const generateAttendanceArea = (res: Area[]) => {
	return res.map(it => {
		return {
			value: it.id,
			label: it.name,
			checked: false,
			indeterminate: false,
			type: 1
		} as CascaderOption;
	});
};

const generateRollCallArea = (res: Area[]) => {
	return res.map(it => {
		return {
			value: it.id,
			label: it.name,
			checked: false,
			indeterminate: false,
			type: 1
		} as CascaderOption;
	});
};

const generatePitArea = (res: Area[]) => {
	return res.map(it => {
		return {
			value: it.id,
			label: it.name,
			checked: false,
			indeterminate: false,
			type: 1
		} as CascaderOption;
	});
};

const setHasOthers = (data: CascaderOption) => {
	let children_count = data.count || 0;
	if (data.children) {
		children_count = 0;
		data.children.map(child => {
			const child_count = child.count;
			if (child_count) {
				children_count += child_count;
			}
			setHasOthers(child);
		});
	}
	data.has_others = (data.count || 0) > children_count;
	if (!data.has_others) {
		data.checked_others = undefined;
	}
};

const getInitData = () => {
	Promise.all([
		getBranchList(),
		getAreaDict({}),
		getArea({is_use: show_unused_area.value ? undefined : 1}),
		getDeviceInfo(),
		getEquip(),
		getBaseType(),
		getContractorUnit(),
	]).then(res_list => {
		for (let i = 0; i < res_list.length; i++) {
			const {type, result} = res_list[i].data;
			if (type === 1) {
				switch (i) {
				case 0:
					branch_tree.value = generateBranchTree(result.data);
					break;
				case 1:
					area_types.value = result.find((i: any) => i.id === 2)?.option || [];
					area_groups.value = result.find((i: any) => i.id === 3)?.option || [];
					break;
				case 2:
				{
					all_area = result.data;
					handleAreaResponse();
					break;
				}
				case 3:
					is_show_bs.value = result.data.some((device: any) => device.type === DEVICE_TYPES.BASE_STATION);
					is_show_door.value = result.data.some((device: any) => device.type === DEVICE_TYPES.DOOR);
					is_show_power.value = result.data.some((device: any) => POWER_TYPES.includes(device.type));
					is_show_switch.value = result.data.some((device: any) => device.type === DEVICE_TYPES.SWITCH);
					is_show_smart_machine.value = result.data.some((device: any) => device.type === DEVICE_TYPES.SMART_CARD_MACHINE);
					is_show_traffic_light.value = result.data.some((device: any) => device.type === DEVICE_TYPES.TRAFFIC_LIGHT);
					is_show_light_alarm.value = result.data.some((device: any) => device.type === DEVICE_TYPES.LIGHT_ALARM);
					break;
				case 4:
					is_show_camera.value = !!result.data.length;
					break;
				case 5:
					bs_type_list.value = result.data.filter((i: BSTypeInfo) => i.number);
					break;
				case 6:
					contractor_unit.value = generateContractor(result.data);
					break;
				}
			}
		}
		options.value = cloneDeep(default_options.value);
	}).catch((e) => {
		console.error(e);
	}).finally(() => {
		initCacheData();
		checkEmergencyNeed();
		handleDifference();
		is_loaded_data.value = true;
	});
};

onMounted(getInitData);

const getNode = (selected_path: OptionValue[]) => {
	if (cascader_ref.value) {
		return cascader_ref.value.getNodeByValue(selected_path);
	}
	return null;
};

// 获取该node及所有父级的index 顺序右往左
const getActivePathIndex = (node: SettingCascaderNode) => {
	let idx_list: number[] = [];
	if (node) {
		if (node.data.index !== undefined) {
			idx_list.push(node.data.index);
		}
		if (node.parent) {
			idx_list = idx_list.concat(getActivePathIndex(node.parent));
		}
	}
	return idx_list;
};

/**
 * 通过值选中该node下的child（这个id在该node下必须是唯一的）
 * @param node 指定选中哪个node下的
 * @param id 要选中的node的value
 * @param except 跳过某些node
 * @param checked_all_list 全选状态的结点value
 */
const checkNodeByValue = (node: SettingCascaderNode, id: OptionValue, except: OptionValue[] = [], checked_all_list: OptionValue[] = []) => {
	if (node?.children?.length) {
		for (const child of node.children) {
			if (except.includes(child.value)) continue;
			if (child.value === id) {
				if (child.data.type === 1) { // 多选
					if (child.data.checked_others !== undefined) {
						child.data.checked_others = true;
					}
					child.data.checked = checked_all_list.includes(id);
					child.data.indeterminate = !child.data.checked;
					if (checked_all_list.includes(id)) handleChildrenChecked(child, true);
					if (!child.data.checked && (!child.children?.length || child.data.child_ratio_value)) { // 其余情况由勾选child时触发
						child.data.checked = true;
						child.data.indeterminate = false;
					}
					handleParentChecked(child);
				} else if (child.data.type === 2) { // 单选
					node.data.child_ratio_value = id;
				}
				return;
			}
			checkNodeByValue(child, id);
		}
	}
};

type GetSelectedListFunction = (node: SettingCascaderNode) => OptionValue[]
const getSelectedList: GetSelectedListFunction = (node) => {
	try {
		return treeToArray(node.children)
			.filter(i => (i.data.checked || i.data.checked_others) && i.data.type === 1)
			.map(i => i.value)
			.reverse(); // 从前往后
	} catch (e) {
		console.log(e);
		return [];
	}
};

const getSelectedAllList = (node: SettingCascaderNode) => {
	try {
		return treeToArray(node.children)
			.filter(i => i.data.checked && (i.data.checked_others === undefined || i.data.checked_others))
			.map(i => i.value);
	} catch (e) {
		console.log(e);
		return [];
	}
};

type GetNodeSelectPathFunction = (node: SettingCascaderNode, arr?: OptionValue[]) => OptionValue[]
const getNodeSelectedPath: GetNodeSelectPathFunction = (node, arr = []) => {
	arr.unshift(node.value);
	if (node.parent) {
		return getNodeSelectedPath(node.parent, arr);
	}
	return arr;
};

const handleDifference = () => {
	const data: ChangeData = {
		checked: {},
		unchecked: {},
	};
	handlePositionObjectChange(data, []);
	handlePOBasicFieldChange(data);
	handleDisplayWayChange(data);
	handleDeviceChange(data, []);
	handleDeviceBasicFieldChange(data);
	handleBuildingChange(data);
	handleAreaChange(data, []);
	handleLittleMapChange(data);
	handleScopeChange(data, []);
	current_settings = cloneDeep(map_setting.value);
	useEventBus(SETTING_CHANGE_KEY).emit(data, current_settings);
	console.log("%c change data: ", "color: white;background: #07f;", data);
};

const handleSelectedChange = (selected_path: OptionValue[]) => {
	const data: ChangeData = {
		checked: {},
		unchecked: {},
	};
	const category = selected_path.shift();
	switch (category) {
	case POSITION_OBJECT:
		handlePositionObjectChange(data, selected_path);
		break;
	case PO_BASIC_FIELD:
		handlePOBasicFieldChange(data);
		break;
	case DISPLAY_WAY:
		handleDisplayWayChange(data);
		break;
	case DEVICE:
		handleDeviceChange(data, selected_path);
		break;
	case DEVICE_BASIC_FIELD:
		handleDeviceBasicFieldChange(data);
		break;
	case BUILDING:
		handleBuildingChange(data);
		break;
	case AREA:
		handleAreaChange(data, selected_path);
		break;
	case SCOPE:
		handleScopeChange(data, selected_path);
		break;
	case LITTLE_MAP:
		handleLittleMapChange(data);
		break;
	}
	current_settings = cloneDeep(map_setting.value);
	useEventBus(SETTING_CHANGE_KEY).emit(data, current_settings);
	console.log("%c change data: ", "color: yellow;background: black;", data);
};

const handlePositionObjectChange = (data: ChangeData, selected_path: OptionValue[]) => {
	if (!selected_path.length) { // 全选 or 全不选position_object
		onPersonChange(data);
		onVisitorChange(data);
		onContractorChange(data);
		onCarChange(data);
		onMaterialChange(data);
		onStrangerChange(data);
	} else {
		if (selected_path.includes(PERSON)) { // 点击了人员下的复选框
			onPersonChange(data);
		}
		if (selected_path.includes(VISITOR)) {
			onVisitorChange(data);
		}
		if (selected_path.includes(CONTRACTOR)) {
			onContractorChange(data);
		}
		if (selected_path.includes(CAR)) {
			onCarChange(data);
		}
		if (selected_path.includes(MATERIAL)) {
			onMaterialChange(data);
		}
		if (selected_path.includes(STRANGER)) {
			onStrangerChange(data);
		}
	}
};

const onPersonChange = (data: ChangeData) => {
	const person_node = getNode([POSITION_OBJECT, PERSON]);
	if (!person_node) return;
	const branch_ids = getSelectedList(person_node) as number[];
	const {added, deleted} = compareArrays(current_settings.branch_id_list, branch_ids);
	added.length && (data.checked["branch_id_list"] = added);
	deleted.length && (data.unchecked["branch_id_list"] = deleted);
	map_setting.value.branch_id_list = branch_ids;
	map_setting.value.selected_all_person = person_node.data.checked;
	map_setting.value.branch_checked_all_list = getSelectedAllList(person_node) as number[];
};

const onContractorChange = (data: ChangeData) => {
	const node = getNode([POSITION_OBJECT, CONTRACTOR]);
	if (!node) return;
	const ids = getSelectedList(node) as number[];
	const {added, deleted} = compareArrays(current_settings.contractor_unit_id_list, ids);
	added.length && (data.checked["contractor_unit_id_list"] = added);
	deleted.length && (data.unchecked["contractor_unit_id_list"] = deleted);
	map_setting.value.contractor_unit_id_list = ids;
	map_setting.value.selected_all_contractor = node.data.checked;
};

const onVisitorChange = (data: ChangeData) => {
	const node = getNode([POSITION_OBJECT, VISITOR]);
	if (!node) return;
	const checked = node.data.checked;
	if (current_settings.is_show_visitor !== checked) {
		map_setting.value.is_show_visitor = checked;
		if (checked) {
			data.checked["is_show_visitor"] = true;
		} else {
			data.unchecked["is_show_visitor"] = false;
		}
	}
};

const onCarChange = (data: ChangeData) => {
	const node = getNode([POSITION_OBJECT, CAR]);
	if (!node) return;
	const checked = node.data.checked;
	if (current_settings.is_show_car !== checked) {
		map_setting.value.is_show_car = checked;
		if (checked) {
			data.checked["is_show_car"] = true;
		} else {
			data.unchecked["is_show_car"] = false;
		}
	}
};

const onMaterialChange = (data: ChangeData) => {
	const node = getNode([POSITION_OBJECT, MATERIAL]);
	if (!node) return;
	const checked = node.data.checked;
	if (current_settings.is_show_material !== checked) {
		map_setting.value.is_show_material = checked;
		if (checked) {
			data.checked["is_show_material"] = true;
		} else {
			data.unchecked["is_show_material"] = false;
		}
	}
};

const onStrangerChange = (data: ChangeData) => {
	const node = getNode([POSITION_OBJECT, STRANGER]);
	if (!node) return;
	const checked = node.data.checked;
	if (current_settings.is_show_stranger !== checked) {
		map_setting.value.is_show_stranger = checked;
		if (checked) {
			data.checked["is_show_stranger"] = true;
		} else {
			data.unchecked["is_show_stranger"] = false;
		}
	}
};

const handlePOBasicFieldChange = (data: ChangeData) => {
	const node = getNode([PO_BASIC_FIELD]);
	if (!node) return;
	const fields = getSelectedList(node);
	const {added, deleted} = compareArrays(current_settings.show_field, fields);
	added.length && (data.checked["show_field"] = added);
	deleted.length && (data.unchecked["show_field"] = deleted);
	map_setting.value.show_field = fields as LocationLabelField[];
};

const handleDisplayWayChange = (data: ChangeData) => {
	const node = getNode([DISPLAY_WAY]);
	if (!node) return;
	const val = getSelectedList(node);
	const {added, deleted} = compareArrays(current_settings.show_type, val);
	added.length && (data.checked["show_type"] = added);
	deleted.length && (data.unchecked["show_type"] = deleted);
	map_setting.value.show_type = val as DisplayMode[];

	onClusterChange(data);
};

const onClusterChange = (data: ChangeData) => {
	const node = getNode([DISPLAY_WAY, MODEL_ICON]);
	if (!node) return;
	const checked = node.data.child_ratio_value === CLUSTER;
	if (current_settings.is_show_cluster !== checked) {
		map_setting.value.is_show_cluster = checked;
		if (checked) {
			data.checked["is_show_cluster"] = true;
		} else {
			data.unchecked["is_show_cluster"] = false;
		}
	}
};

const handleDeviceChange = (data: ChangeData, selected_path: OptionValue[]) => {
	if (selected_path.includes(BASE_STATION)) {
		onBaseStationChange(data);
	}
	if (selected_path.includes(CAMERA)) {
		onCameraChange((data));
	}
	if (selected_path.includes(SHOW_CAMERA_AREA) || selected_path.includes(HIDE_CAMERA_AREA)) {
		onCameraShowAreaChange(data);
	}
	if (!selected_path.length) {
		onBaseStationChange(data);
		onCameraChange((data));
		onCameraShowAreaChange(data);
	}
	onDeviceChange(data);
};

const onBaseStationChange = (data: ChangeData) => {
	const node = getNode([DEVICE, BASE_STATION]);
	if (!node) return;
	const bs_types = getSelectedList(node);
	const {added, deleted} = compareArrays(current_settings.bs_type_list, bs_types as OptionValue[]);
	added.length && (data.checked["bs_type_list"] = added);
	deleted.length && (data.unchecked["bs_type_list"] = deleted);
	map_setting.value.bs_type_list = bs_types as BS_TYPE[];
	map_setting.value.selected_all_bs = node.data.checked;
};

const onCameraChange = (data: ChangeData) => {
	const node = getNode([DEVICE, CAMERA]);
	if (!node) return;
	const checked = node.data.checked;
	if (current_settings.is_show_camera !== checked) {
		map_setting.value.is_show_camera = checked;
		if (checked) {
			data.checked["is_show_camera"] = true;
		} else {
			data.unchecked["is_show_camera"] = false;
		}
	}
};

const onCameraShowAreaChange = (data: ChangeData) => {
	const node = getNode([DEVICE, CAMERA]);
	if (!node) return;
	const checked = node.data.child_ratio_value;
	const is_show = checked === SHOW_CAMERA_AREA;
	if (current_settings.is_show_camera_area !== is_show) {
		if (is_show) {
			data.checked["is_show_camera_area"] = true;
		} else {
			data.unchecked["is_show_camera_area"] = false;
		}
		map_setting.value.is_show_camera_area = is_show;
	}
};

const onDeviceChange = (data: ChangeData) => {
	const types = [];

	const power_node = getNode([DEVICE, POWER]);
	if (power_node) {
		const power_checked = getSelectedList(power_node);
		types.push(...power_checked);
	}

	// 没有子节点的设备
	const other_devices = [DEVICE_TYPES.DOOR, DEVICE_TYPES.SWITCH, DEVICE_TYPES.SMART_CARD_MACHINE, DEVICE_TYPES.TRAFFIC_LIGHT, DEVICE_TYPES.LIGHT_ALARM];
	other_devices.map(it => {
		const node = getNode([DEVICE, it]);
		if (node) {
			node.data.checked && types.push(it);
		} else { // 修复：例如红绿灯只有2D才有，在2D勾选切换到3D后，值会被取消勾选(如果没有该node就保持之前的值) todo 别的地方可能还有此类问题
			current_settings.device_type_list.includes(it) && types.push(it);
		}
	});

	const {added, deleted} = compareArrays(current_settings.device_type_list, types);
	added.length && (data.checked["device_type_list"] = added);
	deleted.length && (data.unchecked["device_type_list"] = deleted);
	map_setting.value.device_type_list = types as DEVICE_TYPES[];
};

const handleDeviceBasicFieldChange = (data: ChangeData) => {
	const node = getNode([DEVICE_BASIC_FIELD]);
	if (!node) return;
	const fields = getSelectedList(node);
	const {added, deleted} = compareArrays(current_settings.device_base_field, fields);
	added.length && (data.checked["device_base_field"] = added);
	deleted.length && (data.unchecked["device_base_field"] = deleted);
	map_setting.value.device_base_field = fields as DeviceBaseField[];
};

const handleBuildingChange = (data: ChangeData) => {
	const conf: BuildingConfig[] = [LAYER, BUILDING_NAME, STATISTICS];

	const checked_list: BuildingConfig[] = [];
	conf.map(it => {
		const node = getNode([BUILDING, it]);
		if (node) {
			node.data.checked && checked_list.push(it);
		} else { // 修复：建筑分层只有3D才有，在3D勾选切换到2D后，值会被取消勾选(如果没有该node就保持之前的值)
			current_settings.building_config.includes(it) && checked_list.push(it);
		}
	});

	const {added, deleted} = compareArrays(current_settings.building_config, checked_list);
	added.length && (data.checked["building_config"] = added);
	deleted.length && (data.unchecked["building_config"] = deleted);
	map_setting.value.building_config = checked_list;
};

const handleSelectedByChange = (value: AreaDivide) => {
	map_setting.value.area_select_by = value;
};

const handleAreaChange = (data: ChangeData, selected_path: OptionValue[]) => {
	if (selected_path.includes(ELECTRONIC_FENCE) // 勾选状态都存储在area_id_list中 id不会重复 数据库中是一张表
		|| selected_path.includes(ATTENDANCE_AREA)
		|| selected_path.includes(ROLL_CALL_AREA)
		|| selected_path.includes(PIT_AREA)) {
		onElectronicFenceChange(data);
	}
	if (selected_path.includes(OBSTACLE_AREA)) {
		onObstacleAreaChange(data);
	}
	if (selected_path.includes(ACTIVE_AREA)) {
		onActiveAreaChange(data);
	}
	if (selected_path.includes(BLIND_AREA)) {
		onBlindAreaChange(data);
	}
	if (selected_path.includes(PATROL)) {
		onPatrolChange(data);
	}
	if (selected_path[selected_path.length - 1] === LOCATING_OPTIMUM_AREA) {
		onObstacleAreaChange(data);
		onActiveAreaChange(data);
		onBlindAreaChange(data);
	}
	if (!selected_path.length) {
		onElectronicFenceChange(data);
		onObstacleAreaChange(data);
		onActiveAreaChange(data);
		onBlindAreaChange(data);
		onPatrolChange(data);
	}
};

const onElectronicFenceChange = (data: ChangeData) => {
	const node = getNode([AREA, ELECTRONIC_FENCE]);
	let checked: number[] = [];
	if (node) {
		const group_or_type_node = getNode([AREA, ELECTRONIC_FENCE, node.data.child_ratio_value]);
		const type_or_group_ids = [];
		for (const child of group_or_type_node.children) {
			checked = checked.concat(getSelectedList(child) as number[]);
			if (child.data.checked) {
				type_or_group_ids.push(child.value);
			}
		}
		// 记录选中的区域类型和区域分组
		if (node.data.child_ratio_value === TYPE) {
			map_setting.value.selected_area_types = type_or_group_ids;
		} else if (node.data.child_ratio_value === GROUP) {
			map_setting.value.selected_area_groups = type_or_group_ids;
		}
		map_setting.value.selected_all_electronic_fence = node.data.checked;
	}
	const attendance_node = getNode([AREA, ATTENDANCE_AREA]);
	if (attendance_node) {
		checked = checked.concat(getSelectedList(attendance_node) as number[]);
		map_setting.value.selected_all_attendance_area = attendance_node.data.checked;
	}

	const pit_node = getNode([AREA, PIT_AREA]);
	if (pit_node) {
		checked = checked.concat(getSelectedList(pit_node) as number[]);
		map_setting.value.selected_all_pit_area = pit_node.data.checked; // 后台默认配置可能是仅全选上下井
	}

	const roll_call_node = getNode([AREA, ROLL_CALL_AREA]);
	if (roll_call_node) {
		checked = checked.concat(getSelectedList(roll_call_node) as number[]);
		map_setting.value.selected_all_roll_call_area = roll_call_node.data.checked;
	}
	const {added, deleted} = compareArrays(current_settings.area_id_list, checked);
	added.length && (data.checked["area_id_list"] = added);
	deleted.length && (data.unchecked["area_id_list"] = deleted);
	map_setting.value.area_id_list = checked;
};

const onObstacleAreaChange = (data: ChangeData) => {
	const node = getNode([AREA, LOCATING_OPTIMUM_AREA, OBSTACLE_AREA]);
	if (!node) return;
	const checked = node.data.checked;
	if (current_settings.is_show_obstacle_area !== checked) {
		map_setting.value.is_show_obstacle_area = checked;
		if (checked) {
			data.checked["is_show_obstacle_area"] = true;
		} else {
			data.unchecked["is_show_obstacle_area"] = false;
		}
	}
};

const onActiveAreaChange = (data: ChangeData) => {
	const node = getNode([AREA, LOCATING_OPTIMUM_AREA, ACTIVE_AREA]);
	if (!node) return;
	const checked = node.data.checked;
	if (current_settings.is_show_active_area !== checked) {
		map_setting.value.is_show_active_area = checked;
		if (checked) {
			data.checked["is_show_active_area"] = true;
		} else {
			data.unchecked["is_show_active_area"] = false;
		}
	}
};

const onBlindAreaChange = (data: ChangeData) => {
	const node = getNode([AREA, LOCATING_OPTIMUM_AREA, BLIND_AREA]);
	if (!node) return;
	const checked = node.data.checked;
	if (current_settings.is_show_blind !== checked) {
		map_setting.value.is_show_blind = checked;
		if (checked) {
			data.checked["is_show_blind"] = true;
		} else {
			data.unchecked["is_show_blind"] = false;
		}
	}
};

const onPatrolChange = (data: ChangeData) => {
	const node = getNode([AREA, PATROL]);
	if (!node) return;
	const checked = node.data.checked;
	if (current_settings.is_show_patrol !== checked) {
		map_setting.value.is_show_patrol = checked;
		if (checked) {
			data.checked["is_show_patrol"] = true;
		} else {
			data.unchecked["is_show_patrol"] = false;
		}
	}
};

const handleScopeChange = (data: ChangeData, selected_path: OptionValue[]) => {
	if (selected_path.includes(DANGER_AREA)) {
		onDangerAreaChange(data);
	}
	if (selected_path.includes(GATHER_ALARM_AREA)) {
		onGatherAlarmChange(data);
	}
	if (selected_path.includes(GATHER_DYNAMIC_MERGE) || selected_path.includes(GATHER_DYNAMIC_NO_MERGE)) {
		onGatherMergeChange(data);
	}
	if (!selected_path.length) {
		onDangerAreaChange(data);
		onGatherAlarmChange(data);
		onGatherMergeChange(data);
	}
};

const onDangerAreaChange = (data: ChangeData) => {
	const node = getNode([SCOPE, DANGER_AREA]);
	if (!node) return;
	const checked = node.data.checked;
	if (current_settings.is_show_danger !== checked) {
		map_setting.value.is_show_danger = checked;
		if (checked) {
			data.checked["is_show_danger"] = true;
		} else {
			data.unchecked["is_show_danger"] = false;
		}
	}
};

const onGatherAlarmChange = (data: ChangeData) => {
	const node = getNode([SCOPE, GATHER_ALARM_AREA]);
	if (!node) return;
	const checked = node.data.checked;
	if (current_settings.is_show_gather_alarm !== checked) {
		map_setting.value.is_show_gather_alarm = checked;
		if (checked) {
			data.checked["is_show_gather_alarm"] = true;
		} else {
			data.unchecked["is_show_gather_alarm"] = false;
		}
	}
};

const onGatherMergeChange = (data: ChangeData) => {
	const node = getNode([SCOPE, GATHER_ALARM_AREA]);
	if (!node) return;
	const checked = node.data.child_ratio_value;
	const is_show = checked === GATHER_DYNAMIC_MERGE;
	if (current_settings.is_dynamic_merge_gather !== is_show) {
		if (is_show) {
			data.checked["is_dynamic_merge_gather"] = true;
		} else {
			data.unchecked["is_dynamic_merge_gather"] = false;
		}
		map_setting.value.is_dynamic_merge_gather = is_show;
	}
};

const handleLittleMapChange = (data: ChangeData) => {
	const node = getNode([LITTLE_MAP]);
	if (!node) return;
	const checked = node.data.checked;
	if (current_settings.is_show_overview !== checked) {
		map_setting.value.is_show_overview = checked;
		if (checked) {
			data.checked["is_show_overview"] = true;
		} else {
			data.unchecked["is_show_overview"] = false;
		}
	}
};

const compareArrays = (arr1: OptionValue[] = [], arr2: OptionValue[]) => {
	const added = arr2.filter(item => !arr1.includes(item));
	const deleted = arr1.filter(item => !arr2.includes(item));

	return {
		added,
		deleted
	};
};

// 树状扁平化
function treeToArray(tree: SettingCascaderNode[]) {
	let res: Omit<SettingCascaderNode, "children">[] = [];
	for (const item of tree) {
		const {children, ...i} = item;
		if (children && children.length) {
			res = res.concat(treeToArray(children));
		}
		res.push(i);
	}
	return res;
}

const handleRatioChange = (node: SettingCascaderNode) => {
	handleSelectedByChange(node.value as AreaDivide);
	handleParentChecked(node); // 刷新父级选中状态
	handleSelectedChange(getNodeSelectedPath(node));
};

// 切换选中状态并刷新子父级状态
const handleCheckBox = (val: boolean, node: SettingCascaderNode, emit_changes = false) => {
	if (!node) return;
	node.data.indeterminate = false;
	node.data.checked = val;
	if (node.data.checked_others !== undefined) {
		node.data.checked_others = val;
	}
	// 切换子级选中 半选状态
	handleChildrenChecked(node, val);
	// 切换父级选中状态 半选 处理父级考虑是否有子部门全选 但父部门半选情况
	handleParentChecked(node);
	if (emit_changes) {
		handleSelectedChange(getNodeSelectedPath(node));
	}
};

// 全选(或取消全选)某个node下的所有child
const handleChildrenChecked = (node: SettingCascaderNode, checked: boolean) => {
	if (node?.children?.length) {
		for (const child of node.children) {
			child.data.checked = checked;
			if (child.data.checked_others !== undefined) {
				child.data.checked_others = checked;
			}
			child.data.indeterminate = false;
			handleChildrenChecked(child, checked);
		}
	}
};

// 刷新某个node的所有父级选中状态
const handleParentChecked = (node: SettingCascaderNode) => {
	if (node.parent) {
		if (node.parent.data.type === 1) { // 过滤掉单选
			const has_some = hasAnyChecked(node.parent);
			const is_checked_all = isCheckedAll(node.parent);
			node.parent.data.checked = is_checked_all;
			node.parent.data.indeterminate = is_checked_all ? false : has_some;
		}
		handleParentChecked(node.parent);
	}
};

// 获取该node下是否有选中（用于控制node的半选状态）
const hasAnyChecked = (node: SettingCascaderNode) => {
	if (node.data.checked_others) return true;
	if (node.children?.length) {
		let children = node.children;
		const ratio_value = node.data.child_ratio_value;
		if (ratio_value) {
			children = children.filter(i => i.value === ratio_value);
		}
		for (const child of children) {
			if (child.data.checked || child.data.indeterminate || child.data.checked_others) {
				return true;
			}
			if (hasAnyChecked(child)) return true;
		}
	}
	return false;
};

// 检查该node的所有child是否都被选中
const isCheckedAll = (node: SettingCascaderNode) => {
	let flag = true, child_flag = true;
	if (node.data.checked_others !== undefined && node.data.has_others) {
		flag = node.data.checked_others;
	}

	if (node.children?.length) {
		const ratio_value = node.data.child_ratio_value;
		if (ratio_value) { // 单选 看child当前选中的child是不是全选 这里当做多选与多选只间隔一级处理  若后续间隔多级 需要递归
			const selected_ratio = node.children.find(c => c.value === ratio_value);
			child_flag = selected_ratio?.children ? selected_ratio.children.every(c => c.data.checked) : true;
		} else {
			child_flag = node.children.every(child => child.data.checked);
		}
	}
	return flag && child_flag;
};

// 只能将第一级至最后一级全部设置disabled 否则父子级联动 依然能被修改 因此该node为第一级的node
const setNodeDisabled = (node: SettingCascaderNode, disabled: boolean) => {
	if (!node) return;
	node.data.disabled = disabled;
	// 切换子级选中 半选状态
	setChildDisabled(node, disabled);
};

// 设置node的所有child的disabled状态
const setChildDisabled = (node: SettingCascaderNode, disabled: boolean) => {
	if (node?.children?.length) {
		for (const child of node.children) {
			child.data.disabled = disabled;
			setChildDisabled(child, disabled);
		}
	}
};

// disabled的node不会触发展开收起，需要主动收起
const handleNodeMouseEnter = (node: SettingCascaderNode) => {
	const menus = getCascaderMenus();
	for (let i = 1; i < menus.length; i++) {
		menus[i].style.display = node.data.disabled ? "none" : "block";
	}
};

const closePanel = () => {
	if (show_map_settings.value) {
		show_map_settings.value = false;
	}
};

const onExpandChange = (data_path: OptionValue[]) => {
	nextTick(() => {
		const click_node = getNode(data_path); // 父级
		if (!click_node) return;
		const clicked_parent_index = getActivePathIndex(click_node).shift();
		const menus = getCascaderMenus();
		if (!menus.length) return;
		const menu = menus[menus.length - 1]; // 不能用pop
		const parent_menu = menus[menus.length - 2];
		const first_level_node_num = options.value.length;
		const parent_delta_y = click_node.parent?.data?.delta_y || 0;
		const parent_scroll_top = click_node.parent?.data?.scroll_top || 0;
		const scroll_top = parent_menu?.querySelector(".el-cascader-menu__wrap")?.scrollTop || 0; // 父级滚动量
		// 默认顶部对齐 偏移量 = 父级偏移量 + 所点击的父级的index
		let delta_y = parent_delta_y + clicked_parent_index;
		let opened_last_level_node_num = click_node.children.length;
		if (opened_last_level_node_num > MAX_NODE_NUM) {
			opened_last_level_node_num = MAX_NODE_NUM;
		}
		// 如果顶部对齐总高度超过了第一级的高度，则底部对齐 偏移量 = 父级偏移量 + 所点击的父级的index - 被展开盖级的node数 + 1
		if (delta_y + opened_last_level_node_num > first_level_node_num) {
			delta_y = delta_y - opened_last_level_node_num + 1;
		}
		click_node.data.delta_y = delta_y;
		click_node.data.scroll_top = parent_scroll_top + scroll_top;

		// 每次展开只需要设置最后一级的偏移
		menu.style.transform = `translateY(${delta_y * LI_HEIGHT - scroll_top - parent_scroll_top}px)`;
	});
};

const getCascaderMenus = () => {
	return cascader_ref.value?.$el.querySelectorAll(".map-settings .map-settings-popper.el-popper .el-cascader-menu") || [];
};

const onPopperHide = () => {
	emits("input", false);
};

// 外部使用
const checkAreas = (id_list: number[]) => {
	return new Promise((resolve, reject) => {
		until(is_loaded_data).toBe(true).then(() => {
			const area_node = getNode([AREA]);
			id_list.map(id => { // 外部勾选点名 考勤 出入口 电子围栏
				checkNodeByValue(area_node, id);
			});
			const data: ChangeData = {
				checked: {},
				unchecked: {},
			};
			onElectronicFenceChange(data);
			current_settings = cloneDeep(map_setting.value);
			useEventBus(SETTING_CHANGE_KEY).emit(data, current_settings);
			console.log("%c change data: ", "color: white;background: #07f;", data);
			return resolve(map_setting.value.area_id_list);
		}).catch(() => {
			return reject();
		});
	});
};

const emits = defineEmits(["input"]);
defineExpose({reloadSetting, checkAreas});
</script>

<style scoped lang="scss">
.map-settings {
	position: absolute;
	left: 44px;
	bottom: 0;
}

// ------
:deep(.map-settings-popper.el-popper) {
	padding: 0;
	min-width: auto;
	background: transparent;
	border: none;
	box-shadow: none;
	pointer-events: none;

	.el-cascader-menu {
		height: fit-content;
		color: #b2c4db;
		border: 1px solid #32496A;
		font-family: "DingTalk JinBuTi";
		font-size: 14px;
		background-color: rgba(7, 24, 49, 0.80);
		border-radius: 4px;
		min-width: 140px;

		.el-cascader-menu__wrap {
			height: auto;
			max-height: 312px;
		}

		&:first-child {
			min-width: 88px;
			max-width: 240px;
		}
	}

	.el-cascader-panel {
		column-gap: 2px;
		border: none;
	}

	.el-cascader-menu__list {
		padding: 8px;
		pointer-events: auto;
	}

	.el-cascader-menu__list.is-empty {
		height: 26px;
		min-width: 120px;
		padding: 0;
		margin: 8px;
		background-color: #56627A36;
		cursor: not-allowed;
	}

	.el-cascader-node {
		height: 26px;
		line-height: 26px;
		padding: 4px 28px 4px 8px;
		background-color: #56627A36;
		box-sizing: border-box;

		&:not(:last-of-type) {
			margin-bottom: 4px;
		}

		.el-cascader-node__label {
			padding: 0;
		}

		&:focus,
		&:hover {
			background-color: #4283CA33;
			color: #71aeff;
		}
	}

	.is-active,
	.in-active-path {
		font-weight: 400;
		color: #71aeff;
	}

	.popper__arrow {
		display: none;
	}

	.el-cascader-node__prefix {
		display: none;
	}

	.el-icon-arrow-right:before {
		content: "";
		display: inline-block;
		border: 5px solid transparent;
		border-left-color: #71aeff;
	}

	.el-cascader-node.is-disabled {
		.el-icon-arrow-right.el-cascader-node__postfix:before {
			border-left-color: #6F7F94;
		}
	}

	&.el-popper[x-placement^=bottom] {
		margin-top: 5px;
	}
}
// ------
:deep(.map-settings-popper.el-popper) .el-cascader-panel {
	position: absolute;
	bottom: 0;

	.el-cascader-menu {
		overflow: hidden;
	}

	.el-cascader-menu .el-cascader-menu__wrap {
		max-height: v-bind("MAX_MENU_HEIGHT + 'px'");
	}

	.el-cascader-node {
		.el-icon-check.el-cascader-node__prefix {
			display: none;
		}
	}

	.el-radio__inner::after {
		width: 6px;
		height: 6px;
	}

	.fk-index-checkbox.el-checkbox {
		display: block;
		margin-right: 0;
	}

	.el-radio__label,
	.el-checkbox__label {
		padding-left: 8px;
		width: calc(100% - 14px);
	}

	.el-cascader-node.in-active-path {
		.el-radio__label,
		.el-cascader-node__label,
		.el-checkbox__label {
			color: #71aeff;
		}
	}

	.el-radio__label:hover,
	.select-button:hover,
	.el-checkbox__label:hover {
		color: #71aeff;
	}

	.el-radio__label,
	.el-cascader-node__label,
	.el-checkbox__label {
		color: #e3eefc;
	}

	.el-icon-arrow-right.el-cascader-node__postfix {
		&:before {
			border-left-color: #e3eefc;
		}
	}

	.el-radio__inner,
	.el-checkbox__inner {
		background-color: transparent;
		border-color: #94a6be;
	}

	.el-radio__input.is-checked .el-radio__inner {
		border-color: #4786da;

		&:after {
			background-color: #4786da;
		}
	}

	.el-checkbox__input.is-indeterminate,
	.el-checkbox__input.is-checked {
		.el-checkbox__inner {
			background-color: #4786da;
			border-color: #4786da;
		}
	}

	.el-checkbox__input.is-disabled {
		.el-checkbox__inner {
			background-color: #6F7F94;
			border-color: #6F7F94;
		}
	}

	.el-checkbox.is-disabled {
		.el-checkbox__label {
			color: #6F7F94;
		}
	}

	.select-button {
		display: inline-block;
		width: 100%;
	}

	.el-cascader-menu .el-cascader-node {
		position: relative;
		padding: 4px 24px 4px 8px;

		.el-icon-arrow-right {
			position: absolute;
			right: 4px;
		}
	}
}

:deep(.map-settings-popper.el-popper) .el-cascader-menu:not(:first-child) {
	width: 158px;

	.el-radio__label,
	.el-checkbox__label {
		display: inline-block;
		max-width: 96px;
	}

	@media only screen and (width <= 1366px) and (height <= 768px) {
		width: 126px;

		.el-radio__label,
		.el-checkbox__label {
			max-width: 77px;
		}
	}
}

:deep(.fk-text-ellipsis) {
	width: 100%;
	vertical-align: bottom;
}
</style>
