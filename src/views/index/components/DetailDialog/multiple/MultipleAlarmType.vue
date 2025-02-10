<template>
<div class="multiple-alarm-type h-full flex flex-col gap-y-[12px] font-main">
	<module-header
		:title="dialog_props.title"
		class="flex-none"
	>
		<template #operate>
			<div class="flex justify-between items-center gap-[8px]">
				<fk-icon
					class="text-minor-2 cursor-pointer hover-icon hover:text-minor-1"
					tip="进入后台查看详情"
					:size="small ? 20 : 28"
					@click="jumpAlarmPage()"
				>
					<backend-icon />
				</fk-icon>

				<fk-icon
					class="text-minor-2 px-[8px] cursor-pointer hover-icon hover:text-minor-1"
					tip="关闭"
					:size="small ? 24 : 28"
					@click="closeDialog"
				>
					<close-icon />
				</fk-icon>
			</div>
		</template>
	</module-header>

	<div class="text-minor-2 flex-none">
		<span>全部:{{ paginator.total }}</span>
	</div>
	<alarm-type-table
		class="flex-1 relative"
		:category="getAlarmCategory(dialog_props.rule_type) ?? 'all'"
		:loading="loading"
		:table-data="table_data"
		show-rule-type-or-name="name"
		area-detail-type="tag"
		@handle="immediatelyFetch()"
	/>
	<pagination-simple
		class="flex-none"
		:page.sync="paginator.page"
		:total="paginator.total"
		:limit="paginator.limit"
		@current-change="immediatelyFetch()"
	/>
</div>
</template>

<script setup lang="ts">
import {computed, shallowRef, ref, onMounted} from "vue";
import {useTimeoutPoll} from "@vueuse/core";
import {Notification} from "element-ui";

import {useLoading} from "@/composable";
import {menu_name_map} from "@/store/useMenuStore";
import FkIcon from "@/components/ForThink/FkIcon.vue";
import BackendIcon from "~icons/operation/backend-stroke";
import CloseIcon from "~icons/operation/stroke-close";
import {small} from "@/utils/ts/breakpoints";
import {cleanupExpiredEffect} from "@/utils/js/common";
import {usePageAuth} from "@/utils/js/authentication";
import locationJump from "@/utils/js/locationHref";
import {DEVICE_TYPE} from "@/utils/js/constant";
import {getAlarmCategory, ALARM_CATEGORY, ALARM_TYPE} from "@/types/alarm";
import type {AlarmTypeDetailResult} from "@/api/homepage/alarm";
import {getDayDynamics, GET_DAY_DYNAMICS_CATEGORY} from "@/api/homepage/alarm";

import ModuleHeader from "@index/components/ModuleHeader.vue";
import AlarmTypeTable from "@index/components/table/AlarmTypeTable.vue";
import type {MultipleDetailAlarmTypeCategory, MultipleDetailAlarmTypeProps} from "@index/store";
import {useDetailDialogStore} from "@index/store";
import {poll_interval} from "@index/utils/config";

import PaginationSimple from "../components/PaginationSimple.vue";
import {PAGINATOR_LIMIT} from "../constant";

interface Props {
	category: MultipleDetailAlarmTypeCategory
}
const props = defineProps<Props>();

const table_data = shallowRef<AlarmTypeDetailResult[]>([]);
const paginator = ref({page: 1, total: 0, limit: PAGINATOR_LIMIT});

const dialog_props = computed(() => detail_dialog_store.getDialog(props.category).props as MultipleDetailAlarmTypeProps);
const alarm_category = computed(() => getAlarmCategory(dialog_props.value.rule_type)!);

const detail_dialog_store = useDetailDialogStore();
const {loading, startLoading, endLoading} = useLoading();

const fetchTableData = cleanupExpiredEffect(async (onCleanup: (cb: () => void) => void) => {
	const {begin, end, rule_type_list} = dialog_props.value;
	let is_validate = true;
	onCleanup(() => {
		is_validate = false;
	});
	const params = {
		begin,
		end,
		rule_type_list: rule_type_list,
		category: GET_DAY_DYNAMICS_CATEGORY[alarm_category.value],
		page: paginator.value.page,
		limit: paginator.value.limit
	};
	const {data: res} = await getDayDynamics(params).catch(() => ({data: undefined}));
	if (is_validate && res?.type === 1) {
		const {count, data} = res.result;
		paginator.value.total = count;
		if (count !== 0 && Math.ceil(count / paginator.value.limit) < paginator.value.page) {
			paginator.value.page = paginator.value.page - 1;
			return fetchTableData();
		}
		table_data.value = data;
	}
	endLoading();
});
const {resume} = useTimeoutPoll(fetchTableData, poll_interval, {immediate: false});

onMounted(() => {
	startLoading();
	resume();
});

const alarm_category_page = {
	[ALARM_CATEGORY.tag]: "/alarm#/alarm",
	[ALARM_CATEGORY.area]: "/alarm#/area",
	[ALARM_CATEGORY.accident]: "/alarm#/accident",
	[ALARM_CATEGORY.device]: "/alarm#/equip",
	[ALARM_CATEGORY.sos]: "/alarm#/help",
	[ALARM_CATEGORY.call]: "/call#/record",
	[ALARM_CATEGORY.patrol]: "/patrol#/info",
	[ALARM_CATEGORY.healthy]: "/healthy#/error"
};
const rule_type_active_device = {
	[ALARM_TYPE.TAG_LOW_BATTERY]: "9",
	[ALARM_TYPE.BASE_STATION_OFFLINE]: "5",
	[ALARM_TYPE.POWER_OFFLINE_36]: "2",
	[ALARM_TYPE.POWER_LOW_BATTERY_37]: "2",
	[ALARM_TYPE.POWER_DEVICE_FAILURE_38]: "2",
	[ALARM_TYPE.POWER_DEVICE_ALARM_39]: "2",
	[ALARM_TYPE.SWITCH_OFFLINE]: "4",
	[ALARM_TYPE.CARD_MACHINE_OFFLINE]: "6",
	[ALARM_TYPE.CARD_MACHINE_NO_CARD]: "6",
	[ALARM_TYPE.TRAFFIC_LIGHT_OFFLINE]: "10",
	[ALARM_TYPE.SOUND_AND_LIGHT_ALARM_OFFLINE]: "11",
	[ALARM_TYPE.SERVER_HOT_STANDBY_OFFLINE]: "7",
	[ALARM_TYPE.DISK_SPACE_INSUFFICIENT]: "7",
	[ALARM_TYPE.DATABASE_SYNCHRONIZATION_ABNORMAL]: "7",
};

const healthy_check_type = {
	[ALARM_TYPE.HEART_RATE_ABNORMAL]: 1,
	[ALARM_TYPE.BLOOD_OXYGEN_ABNORMAL]: 3,
	[ALARM_TYPE.TEMPERATURE_ABNORMAL]: 2
};

const rule_type_power_type = {
	[ALARM_TYPE.POWER_DEVICE_FAILURE_38]: DEVICE_TYPE.ups_power,
	[ALARM_TYPE.POWER_DEVICE_ALARM_39]: DEVICE_TYPE.ups_power,
};
const rule_type_fault_reason = {
	[ALARM_TYPE.POWER_OFFLINE_36]: "离线",
	[ALARM_TYPE.POWER_LOW_BATTERY_37]: "低电量",
	[ALARM_TYPE.POWER_DEVICE_FAILURE_38]: "设备故障",
	[ALARM_TYPE.POWER_DEVICE_ALARM_39]: "设备告警",
	[ALARM_TYPE.SWITCH_OFFLINE]: "离线",
	[ALARM_TYPE.CARD_MACHINE_OFFLINE]: "离线",
	[ALARM_TYPE.CARD_MACHINE_NO_CARD]: "无卡",
	[ALARM_TYPE.SERVER_HOT_STANDBY_OFFLINE]: "双机热备离线",
	[ALARM_TYPE.DISK_SPACE_INSUFFICIENT]: "磁盘空间不足",
	[ALARM_TYPE.DATABASE_SYNCHRONIZATION_ABNORMAL]: "数据库同步异常",
};
function jumpAlarmPage() {
	const page_url = alarm_category_page[alarm_category.value];
	const auth = usePageAuth(page_url);
	if (auth.value.no_permission) {
		return Notification.error({title: "错误", message: `跳转失败，无${menu_name_map.value.get(page_url)}页面权限`});
	}
	const {begin, end, rule_type} = dialog_props.value;
	let params: Record<string, any> = {};
	switch (alarm_category.value) {
	case ALARM_CATEGORY.tag:
		params = {begin: begin * 1000, end: end * 1000, status: "0", type: rule_type, from_page: "home"};
		break;
	case ALARM_CATEGORY.area:
		params = {begin: begin * 1000, end: end * 1000, status: 0, type: rule_type, from_page: "home"};
		break;
	case ALARM_CATEGORY.accident:
		params = {begin: begin * 1000, end: end * 1000, status: 0, from_page: "home"};
		break;
	case ALARM_CATEGORY.device:
		params = {
			begin: begin * 1000,
			end: end * 1000,
			status: 0,
			type: rule_type_active_device[rule_type as keyof typeof rule_type_active_device],
			from_page: "home",
			power_type: rule_type_power_type[rule_type as keyof typeof rule_type_power_type],
			reason: rule_type_fault_reason[rule_type as keyof typeof rule_type_fault_reason]
		};
		break;
	case ALARM_CATEGORY.sos:
		params = {begin: begin * 1000, end: end * 1000, status: 0, from_page: "home"};
		break;
	case ALARM_CATEGORY.call:
		params = {start_time: begin * 1000, end_time: end * 1000, status: 0, from_page: "home"};
		break;
	case ALARM_CATEGORY.patrol:
		params = {start_time: begin * 1000, end_time: end * 1000, dispose_status: 0, active: "record", from_page: "home"};
		break;
	case ALARM_CATEGORY.healthy:
		params = {start: begin * 1000, end: end * 1000, status: 0, check_type: healthy_check_type[rule_type as keyof typeof healthy_check_type], from_page: "home"};
		break;
	default:
		return;
	}

	const filter_falsy_params = Object.entries<any>(params).reduce((result, [key, value]) => {
		if (![undefined, null].includes(value)) {
			result[key] = value;
		}
		return result;
	}, {} as Record<string, any>);
	const jump_page_url = `${page_url}?${new URLSearchParams(filter_falsy_params).toString()}`;
	locationJump(jump_page_url, true);
}

function closeDialog() {
	detail_dialog_store.toggleVisible(props.category, false);
}

async function immediatelyFetch() {
	startLoading();
	await fetchTableData();
}
</script>

<style scoped>
.multiple-alarm-type {
	:deep(.fk-index-table) {
		position: absolute;
	}
}
</style>
