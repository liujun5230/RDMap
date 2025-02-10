import type {DisplayDataType} from "../../components/useDisplaySetting";
import type {Component} from "vue";

import MaterialBaseInfo from "../components/tabComponents/MaterialBaseInfo.vue";
import PersonBaseInfo from "../components/tabComponents/PersonBaseInfo.vue";
import VisitorBaseInfo from "../components/tabComponents/VisitorBaseInfo.vue";
import TruckBaseInfo from "../components/tabComponents/TruckBaseInfo.vue";
import ContractorBaseInfo from "../components/tabComponents/ContractorBaseInfo.vue";
import AreaStatistics from "../components/tabComponents/AreaStatistics.vue";
import AttendanceStatistics from "../components/tabComponents/AttendanceStatistics.vue";
import PitStatistics from "../components/tabComponents/UpDownPitStatistics.vue";
import BindingCards from "../components/tabComponents/BindingCards.vue";
import HealthInfo from "../components/tabComponents/HealthInfo.vue";
import HealthSetting from "../components/tabComponents/HealthSetting.vue";

import CardBaseInfo from "../components/tabComponents/CardBaseInfo.vue";
import BindRecord from "../components/tabComponents/BindRecord.vue";
import PowerConsumptionDiagram from "../components/tabComponents/PowerConsumptionDiagram.vue";

const things_components:Record<string, Component> = {
	"person_base_info": PersonBaseInfo,
	"visitor_base_info": VisitorBaseInfo,
	"truck_base_info": TruckBaseInfo,
	"contractor_base_info": ContractorBaseInfo,
	"material_base_info": MaterialBaseInfo,
	"area_data": AreaStatistics,
	"pit_data": PitStatistics,
	"attendance_data": AttendanceStatistics,
	"health_data": HealthInfo,
	"health_setting": HealthSetting,
	"bind_card": BindingCards
};

const bind_card_tips = "为了准确的判断人员所乘车辆，可以给车辆添加副卡，当主卡获取不到定位数据时，副卡按顺序自动切换为主卡，请注意，副卡不在地图上显示。";

export function getTabs(things_data:DisplayDataType[], uuid?:number, is_entry_area?:number, is_health?:number, is_attendance?:number, is_up_down_pit?:number) {
	const arr = !uuid ? [things_data[0]] : things_data?.filter(item => {
		const entry_area = is_entry_area || (!is_entry_area && item.field !== "area_data");
		const health = is_health || (!is_health && !["health_data", "health_setting"].includes(item.field));
		const attendance = is_attendance || (!is_attendance && item.field !== "attendance_data");
		const up_down_pit = is_up_down_pit || (!is_up_down_pit && item.field !== "pit_data");
		return item.is_display && entry_area && health && attendance && up_down_pit;
	});
	const tabs = arr.map(item => {
		return {
			title: item.name,
			name: item.field,
			component: things_components[item.field],
			tips: item.field === "bind_card" ? bind_card_tips : ""
		};
	});
	return tabs;
}

const card_components = [
	{
		name: "card_base_info",
		title: "基本信息",
		component: CardBaseInfo
	},
	{
		name: "bind_record",
		title: "绑定记录",
		component: BindRecord
	},
	{
		name: "power_consumption_diagram",
		title: "耗电图",
		component: PowerConsumptionDiagram
	}
] as const;

export function getCardTabs() {
	return card_components;
}
