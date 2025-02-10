import DeviceBaseTab from "@/components/ArchiveDialog/deviceArchive/components/DeviceBaseTab.vue";

export enum DEVICE_TYPE{
	POWER_2 = 2,
	POWER_3 = 3,
	SWITCH = 4,
	BASE_STATION = 5,
	SMART_MACHINE = 6,
	POWER_8 = 8,
}

export const DEVICE_TYPE_MAP = {
	[DEVICE_TYPE.POWER_2]: {
		name: "电源",
		page_key: "device_power"
	},
	[DEVICE_TYPE.POWER_3]: {
		name: "电源",
		page_key: "device_power"
	},
	[DEVICE_TYPE.SWITCH]: {
		name: "交换机",
		page_key: "device_switch"
	},
	[DEVICE_TYPE.BASE_STATION]: {
		name: "基站",
		page_key: "device_station"
	},
	[DEVICE_TYPE.SMART_MACHINE]: {
		name: "一体机",
		page_key: "device_smart_machine"
	},
	[DEVICE_TYPE.POWER_8]: {
		name: "电源",
		page_key: "device_power"
	},
};

export function getDeviceTabs() {
	return [{
		name: "base",
		title: "基本信息",
		component: DeviceBaseTab
	}];
}
