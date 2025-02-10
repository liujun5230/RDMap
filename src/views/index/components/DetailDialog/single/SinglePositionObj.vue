<template>
<div class="h-full">
	<module-header :title="position_obj_title">
		<template #operate>
			<div class="flex justify-between items-center gap-[8px]">
				<fk-icon
					class="cursor-pointer hover-icon hover:text-minor-1"
					:tip="tag_status?'定位':''"
					:size="small ? 20 : 28"
					style="--text-color: var(--text-minor-2, #94a6be)"
					@click="clickTagLocation"
				>
					<location-icon :class="{'text-[#384E70]':!tag_status,'cursor-not-allowed':!tag_status}" />
				</fk-icon>

				<fk-icon
					class="cursor-pointer hover-icon hover:text-minor-1"
					tip="显示设置"
					:size="small ? 20 : 28"
					style="--text-color: var(--text-minor-2, #94a6be)"
					@click="openShowSetting"
				>
					<menu-icon />
				</fk-icon>

				<fk-icon
					class="px-[8px] cursor-pointer hover-icon hover:text-minor-1"
					tip="关闭"
					:size="small ? 24 : 28"
					style="--text-color: var(--text-minor-2, #94a6be)"
					@click="closeDialog"
				>
					<close-icon />
				</fk-icon>
			</div>
		</template>
	</module-header>
	<div
		v-show="!history_distribution_mode && !is_delete"
		class="flex flex-row justify-start gap-[0.5rem] mt-[12px] flex-wrap"
	>
		<header-button
			v-if="handle_auth"
			type="primary"
			size="12"
			@click="clickTagCallOrMessage"
		>
			{{ is_message?'消息下发':'呼叫' }}
		</header-button>
		<header-button
			v-if="handle_auth"
			type="primary"
			size="12"
			@click="clickTagEvacuate"
		>
			撤离
		</header-button>
		<header-button
			v-show="base_info_show && handle_auth"
			type="primary"
			size="12"
			@click="clickTagTrackHistory"
		>
			轨迹回放
		</header-button>
		<header-button
			type="primary"
			size="12"
			@click="clickTagTrack"
		>
			{{ card_is_track?'退出跟随':'轨迹跟随' }}
		</header-button>
		<header-button
			v-show="is_video"
			type="primary"
			size="12"
			@click="clickTagVideo"
		>
			视频
		</header-button>
		<header-button
			v-show="is_3d"
			type="primary"
			size="12"
			@click="clickTagViewFollow"
		>
			{{ card_is_follow?'退出跟随': '视角跟随' }}
		</header-button>
	</div>
	<detail-box-loading v-if="loading" />
	<div
		v-else
		class="position-obj-content"
	>
		<descriptions-title
			v-if="base_info_show"
			class="mt-[16px]"
			title="基本信息"
		/>

		<div
			v-if="base_info_show"
			class="mt-[12px] px-[12px] py-[8px] rounded-[4px] bg-[#3749637f] flex"
		>
			<div
				v-show="base_info.photo_is_display"
				class="avatar-wrap"
			>
				<img
					class="avatar"
					:src="avatar_url"
				>
			</div>
			<descriptions-list
				class="w-full base-info-list pt-[4px]"
				:class="{'ml-[12px]':base_info.photo_is_display,'base-single-info-list':base_info.main_columns?.length === 1}"
				:columns="base_info.main_columns"
				:data="base_info.info"
			>
				<template #name>
					<div class="flex justify-between pb-[2px]">
						<text-ellipsis>
							<span
								class="after:content-[':'] text-minor-2 mr-[8px]"
								:class="[small ? 'text-[12px]' : 'text-[14px]']"
							>姓名</span>
							<span
								class=" text-main-1"
								:class="[small ? 'text-[14px]' : 'text-[16px]']"
							>{{ base_info.info.name }}</span>
							<template #tooltip>
								<span>{{ base_info.info.name }}</span>
							</template>
						</text-ellipsis>
						<span class="flex-auto ml-[2px]">
							<sex-boy-icon
								v-show="base_info.info.sex === '男'"
								class="text-[#29a2ff] mt-[5px]"
							/>
							<sex-girl-icon
								v-show="base_info.info.sex === '女'"
								class="text-[#E773B8] mt-[5px]"
							/>
						</span>
						<div
							v-show="base_info.info.danger_radius"
							class="min-w-max"
						>
							<span
								class="inline-block px-[5px] py-[2px] rounded-[4px] text-[0.875rem] bg-[#ff4b571a] text-[#FF4B57]"
							>
								危险源({{ base_info.info.danger_radius }}米)
							</span>
						</div>
					</div>
				</template>
			</descriptions-list>
		</div>

		<descriptions-list
			v-if="base_info_show && base_info.other_columns?.length"
			class="mt-[12px]"
			:columns="base_info.other_columns"
			:span="2"
			:data="base_info.info"
		/>

		<descriptions-title
			v-if="location_info_show"
			class="mt-[24px]"
			title="位置数据"
		/>

		<div
			v-if="location_info_show"
			class="mt-[12px] border-box leading-none px-[12px] py-[8px] rounded-[4px] bg-[#3749637f] flex justify-between items-center"
		>
			<descriptions-list
				:columns="location_info.main_columns"
				:data="location_info.info"
			/>
			<div class="flex gap-[8px] items-center">
				<electric-quantity
					v-if="(location_info.info.power || location_info.info.power === 0) && !history_distribution_mode"
					:quantity="location_info.info.power"
					:is-lower-power="location_info.info.is_lower_power"
				/>
				<div
					v-show="location_info.info.status !== '' && !history_distribution_mode"
					class="border-box px-[5px] py-[4px] rounded-[4px] text-[0.875rem]"
					:class="[location_info.info.status === 1 ? 'online' : 'offline']"
				>
					{{ location_info.info.status === 1 ? "在线" : "离线" }}
				</div>
			</div>
		</div>

		<descriptions-list
			v-if="location_info_show"
			class="mt-[12px]"
			:columns="location_info.other_columns"
			:data="location_info.info"
		>
			<template #areas>
				<span
					class="text-minor-2 mr-[8px] flex items-center gap-[6px]"
					:class="[small ? 'text-[12px]' : 'text-[14px]']"
				><in-area-icon /><span>区域</span></span>
				<descriptions-list
					v-for="area_info in (location_info.info.areas || [{}])"
					:key="area_info.area_id"
					class="pl-[20px]"
					:class="{'area-descriptions-list':location_info.area_columns.find(item=> item.prop === 'areas')}"
					:columns="location_info.area_columns"
					:data="area_info"
				>
					<template #areas>
						<text-ellipsis>
							<span
								class="after:content-[':'] text-minor-2 mr-[8px]"
								:class="[small ? 'text-[12px]' : 'text-[14px]']"
							>所在区域</span>
							<span
								:class="[small ? 'text-[14px]' : 'text-[16px]', area_info.area_name?'link':'']"
								@click="openAreaMultipleDetailDialog(area_info.area_id,area_info.area_name,area_info.area_group_id)"
							>
								{{ area_info.area_name || "--" }}
							</span>
							<template #tooltip>
								<span
									class="link"
									:class="[small ? 'text-[14px]' : 'text-[16px]']"
									@click="openAreaMultipleDetailDialog(area_info.area_id,area_info.area_name,area_info.area_group_id)"
								>
									{{ area_info.area_name }}
								</span>
							</template>
						</text-ellipsis>
					</template>
				</descriptions-list>
			</template>
			<template #pit_data>
				<span
					class="text-minor-2 mr-[8px] flex items-center gap-[6px]"
					:class="[small ? 'text-[12px]' : 'text-[14px]']"
				><in-out-icon v-if="resolveCustomText('pit') === '出入口'" /> <pit-icon v-else /><span>{{ resolveCustomText("pit") }}</span></span>
				<descriptions-list
					class="pl-[20px]"
					:columns="location_info.pit_columns"
					:data="location_info.info.pit"
				/>
			</template>
		</descriptions-list>
		<div v-if="!history_distribution_mode">
			<div
				v-for="item in business_data"
				v-show="item.is_display"
				:key="item.title"
			>
				<descriptions-title
					class="mt-[20px]"
					:title="item.title"
				/>

				<descriptions-list
					class="mt-[12px]"
					:columns="item.columns"
					:span="item.columns_num"
					:data="item.info"
				/>
			</div>
		</div>
	</div>
	<base-dialog
		v-model="setting_dialog_visible"
		title="显示设置"
		:show-footer="false"
		:is-home="true"
		width="660px"
		height="609px"
		custom-class="location-obj-setting-dialog"
		@close="closeSetting"
	>
		<el-tabs
			v-model="setting_active_tab"
			tab-position="left"
			class="fk-index-tabs outer-tabs"
			:before-leave="changeSettingTabs"
		>
			<el-tab-pane
				label="员工"
				name="1"
			>
				<single-position-tab
					v-if="setting_active_tab === '1'"
					ref="person_tab_ref"
					:base-info-data="position_settings_data.person_base"
					:business-info-data="position_settings_data.person_business"
					@base-info-change="saveInfoSetting($event,'person_base')"
					@reset-base-info="resetInfoSetting('person_base')"
					@reset-business-info="resetInfoSetting('person_business')"
					@business-info-change="saveInfoSetting($event,'person_business')"
					@cancel-setting-info="cancelInfoSetting"
				/>
			</el-tab-pane>
			<el-tab-pane
				v-if="is_show_visitor"
				label="访客"
				name="3"
			>
				<single-position-tab
					v-if="setting_active_tab === '3'"
					ref="visitor_tab_ref"
					:base-info-data="position_settings_data.visitor_base"
					:business-info-data="position_settings_data.visitor_business"
					@reset-base-info="resetInfoSetting('visitor_base')"
					@reset-business-info="resetInfoSetting('visitor_business')"
					@base-info-change="saveInfoSetting($event,'visitor_base')"
					@business-info-change="saveInfoSetting($event,'visitor_business')"
					@cancel-setting-info="cancelInfoSetting"
				/>
			</el-tab-pane>
			<el-tab-pane
				v-if="is_show_contractor"
				label="承包商"
				name="6"
			>
				<single-position-tab
					v-if="setting_active_tab === '6'"
					ref="contractor_tab_ref"
					:base-info-data="position_settings_data.contractor_base"
					:business-info-data="position_settings_data.contractor_business"
					@reset-base-info="resetInfoSetting('contractor_base')"
					@reset-business-info="resetInfoSetting('contractor_business')"
					@base-info-change="saveInfoSetting($event,'contractor_base')"
					@business-info-change="saveInfoSetting($event,'contractor_business')"
					@cancel-setting-info="cancelInfoSetting"
				/>
			</el-tab-pane>
			<el-tab-pane
				v-if="is_show_truck"
				label="车辆"
				name="2"
			>
				<single-position-tab
					v-if="setting_active_tab === '2'"
					ref="truck_tab_ref"
					:base-info-data="position_settings_data.truck_base"
					@reset-base-info="resetInfoSetting('truck_base')"
					@base-info-change="saveInfoSetting($event,'truck_base')"
					@cancel-setting-info="cancelInfoSetting"
				/>
			</el-tab-pane>
			<el-tab-pane
				v-if="is_show_material"
				label="物资"
				name="5"
			>
				<single-position-tab
					v-if="setting_active_tab === '5'"
					ref="material_tab_ref"
					:base-info-data="position_settings_data.material_base"
					@reset-base-info="resetInfoSetting('material_base')"
					@base-info-change="saveInfoSetting($event,'material_base')"
					@cancel-setting-info="cancelInfoSetting"
				/>
			</el-tab-pane>
			<el-tab-pane
				label="位置数据"
				name="0"
			>
				<single-position-tab
					v-if="setting_active_tab === '0'"
					ref="card_tab_ref"
					:location-info-data="position_settings_data.location_info"
					@reset-location-info="resetInfoSetting('location_info')"
					@location-info-change="saveInfoSetting($event,'location_info')"
					@cancel-setting-info="cancelInfoSetting"
				/>
			</el-tab-pane>
		</el-tabs>
	</base-dialog>
</div>
</template>

<script setup lang="ts">
import {shallowRef, computed, watchEffect, ref, inject, watch} from "vue";
import {Notification} from "element-ui";
import {base_url} from "@/Config";
import {
	TAG_LOCATION_KEY,
	TAG_CALL_KEY,
	TAG_PUSH_MESSAGE_KEY,
	TAG_EVACUATE_KEY,
	TRACK_HISTORY_KEY,
	ADD_TRACK_FOLLOW_KEY,
	CANCEL_TRACK_FOLLOW_KEY,
	VIDEO_TRACK_KEY,
	ADD_VIEW_FOLLOW_KEY,
	CANCEL_VIEW_FOLLOW_KEY
} from "@/events";
import {useEventBus, useTimeoutPoll} from "@vueuse/core";
import {useStore} from "@/store";
import {useMapParams} from "@/composable/map";
import FkIcon from "@/components/ForThink/FkIcon.vue";
import LocationIcon from "~icons/operation/location";
import CloseIcon from "~icons/operation/stroke-close";
import MenuIcon from "~icons/operation/detail-menu";
import SexBoyIcon from "~icons/operation/sex-boy";
import SexGirlIcon from "~icons/operation/sex-girl";
import InAreaIcon from "~icons/operation/in-area-icon";
import InOutIcon from "~icons/operation/in-out-icon";
import PitIcon from "~icons/operation/pit-icon";
import TextEllipsis from "@/components/TextEllipsis.vue";
import {small} from "@/utils/ts/breakpoints";

import {getSingleDetail} from "@/api/homepage/detail";
import type {SinglePersonDetailResponse, SingleTruckDetailResponse, SingleVisitorDetailResponse, SingleMaterialDetailResponse, SingleCardDetailResponse} from "@/api/homepage/detail";

import ModuleHeader from "@index/components/ModuleHeader.vue";
import BaseDialog from "@/components/Dialog/BaseDialog.vue";
import {HeaderButton} from "@index/components/buttons";
import {useDetailDialogStore, DetailDialogCategoryEnum, PositionObjTypeEnum} from "@index/store/useDetailDialogStore";
import {useSinglePositionSettingStore} from "@index/store";
import {resolveCustomText} from "@/store/modules/featureFlags";
import type {SingleDetailPositionObjProps} from "@index/store/useDetailDialogStore";

import DetailBoxLoading from "../components/DetailBoxLoading.vue";
import DescriptionsTitle from "../components/DescriptionsTitle.vue";
import DescriptionsList from "../components/DescriptionsList.vue";
import ElectricQuantity from "@/components/ElectricQuantity.vue";
import SinglePositionTab from "../components/SinglePositionTab.vue";
import {getLocatorData} from "@/api/homepage/pageInformation";
import {getBaseInfo, getLocationInfo, getBusinessInfo} from "../constant";
import {BTN_HANDLE_AUTH_KEY} from "@index/inject/keys";
import {useMutexConfig} from "@index/composable";

const {modes} = useMutexConfig();

interface Props {
	category: DetailDialogCategoryEnum.POSITION_OBJECT;
}

type position_detail_result = SinglePersonDetailResponse | SingleTruckDetailResponse | SingleVisitorDetailResponse | SingleMaterialDetailResponse;

const person_tab_ref = ref();
const visitor_tab_ref = ref();
const truck_tab_ref = ref();
const material_tab_ref = ref();
const card_tab_ref = ref();
const contractor_tab_ref = ref();

const loading = ref(true);

const fetch_map = {
	[PositionObjTypeEnum.CARD]: {
		title: "陌生卡",
		tab_ref: card_tab_ref,
		name_field: "",
	},
	[PositionObjTypeEnum.PERSON]: {
		title: "员工",
		tab_ref: person_tab_ref,
		name_field: "name",

	},
	[PositionObjTypeEnum.TRUCK]: {
		title: "车辆",
		tab_ref: truck_tab_ref,
		name_field: "licence",
	},
	[PositionObjTypeEnum.VISITOR]: {
		title: "访客",
		tab_ref: visitor_tab_ref,
		name_field: "name",
	},
	[PositionObjTypeEnum.MATERIAL]: {
		title: "物资",
		tab_ref: material_tab_ref,
		name_field: "serial_num",
	},
	[PositionObjTypeEnum.CONTRACTOR]: {
		title: "承包商",
		tab_ref: contractor_tab_ref,
		name_field: "name",
	}
} as const;

const props = defineProps<Props>();
const store = useStore();

const detail_dialog_store = useDetailDialogStore();
const dialog = computed(() => detail_dialog_store.getDialog(props.category));
const dialog_props = computed(() => dialog.value.props);
const position_obj_type = ref<PositionObjTypeEnum>(PositionObjTypeEnum.CARD);
const is_show_truck = computed(() => store.getters.flags.car);
const is_show_material = computed(() => store.getters.flags.displayMaterial);
const is_show_visitor = computed(() => store.getters.flags.displayVisitor);
const is_show_contractor = computed(() => store.getters.flags.displayContractor);
const is_history = computed(() => (dialog.value.props as SingleDetailPositionObjProps).is_history);
const history_distribution_mode = computed(() => modes.value.includes("history_distribution") || is_history.value);

const handle_auth = is_history.value || inject(BTN_HANDLE_AUTH_KEY);

const detail_data = shallowRef<position_detail_result | SingleCardDetailResponse>({} as position_detail_result | SingleCardDetailResponse);
const avatar_url = computed(() => {
	let url = "";
	if ((detail_data.value as position_detail_result).base_info && (detail_data.value as position_detail_result).base_info.photo) {
		const photo = (detail_data.value as position_detail_result).base_info.photo;
		url = photo && photo.startsWith("data:image/") ? photo : `${base_url}${photo}`;
	}
	if ((detail_data.value as SingleCardDetailResponse).photo) {
		const photo = (detail_data.value as SingleCardDetailResponse).photo;
		url = photo && photo.startsWith("data:image/") ? photo : `${base_url}${photo}`;
	}
	return url;
});

const tag_status = computed(() => {
	let status;
	if ((detail_data.value as position_detail_result).location && (detail_data.value as position_detail_result).location.status) {
		status = (detail_data.value as position_detail_result).location.status;
	}
	if ((detail_data.value as SingleCardDetailResponse).status) {
		status = (detail_data.value as SingleCardDetailResponse).status;
	}
	return is_history.value ? false : status === 1;
});

const position_settings_store = useSinglePositionSettingStore();
const position_settings_data = computed(() => position_settings_store.single_position_setting);

const base_info_show = computed(() => position_obj_type.value !== PositionObjTypeEnum.CARD);
const base_info = computed(() => getBaseInfo(position_obj_type.value, detail_data.value, position_settings_data.value));
const location_info = computed(() => getLocationInfo(position_obj_type.value, detail_data.value, position_settings_data.value, history_distribution_mode.value, is_history.value, (dialog.value.props as SingleDetailPositionObjProps).history_location));
const business_data = computed(() => getBusinessInfo(position_obj_type.value, detail_data.value, position_settings_data.value));
const is_delete = computed(() => base_info.value?.info?.is_delete);

const location_info_show = computed(() => location_info.value?.info?.card_id);
const position_obj_title = computed(() => fetch_map[position_obj_type.value].title);
const emit_card_param = computed(() => {
	return {card_id: location_info.value?.info.card_id};
});

const is_video = computed(() => detail_data.value.is_video);
const is_message = computed(() => detail_data.value.is_message_distribution);

const {track_card_id_set, now_floor, is_3d, always_follow_card} = useMapParams();
const first_card_is_track = computed(() => track_card_id_set.value.has(location_info.value?.info.card_id));

const card_is_track = ref(false);

const card_is_follow = computed(() => always_follow_card.value === location_info.value?.info.card_id);

const setting_dialog_visible = ref(false);
const setting_active_tab = ref("1");

const openShowSetting = () => {
	setting_active_tab.value = String(position_obj_type.value);
	setting_dialog_visible.value = true;
};
const closeSetting = () => {
	setting_active_tab.value = "";
};
const saveInfoSetting = (info_data:any, type:string) => {
	position_settings_store.setPositionInfo(type, info_data);
};

const resetInfoSetting = (type:string) => {
	position_settings_store.resetPositionSetting(type);
};
const cancelInfoSetting = () => {
	setting_dialog_visible.value = false;
};

function closeDialog() {
	detail_dialog_store.toggleVisible(props.category, false);
}

const changeSettingTabs = (active_name:string, old_name:PositionObjTypeEnum) => {
	if (!active_name) return;
	fetch_map[old_name]?.tab_ref.value?.saveSettingsData();
};

async function fetchDetailData() {
	const {uuid, card_id, time} = (dialog_props.value as SingleDetailPositionObjProps);
	const use_gps = now_floor.value?.id === 2 ? 1 : 0;
	const {data: res} = await getSingleDetail({uuid: card_id ? undefined : uuid, card_id, use_gps, time}).catch(() => ({data: undefined}));
	if (res?.type === 1) {
		position_obj_type.value = res.result?.utype;
		detail_data.value = res.result;
	}
	loading.value = false;
}

const clickTagLocation = async () => {
	if (tag_status.value) {
		const resp = await getLocatorData({accurate_card_id: location_info.value?.info.card_id});
		if (resp.data.type === 1) {
			const element = resp.data.result[0];
			useEventBus(TAG_LOCATION_KEY).emit({element});
		}
	}
};

const loadingTip = () => {
	Notification({
		type: "error",
		title: "操作失败！",
		message: "获取卡号失败，请加载结束后再试~"
	});
};

const clickTagCallOrMessage = () => {
	if (loading.value) {
		loadingTip();
		return;
	}
	if (is_message.value) {
		useEventBus(TAG_PUSH_MESSAGE_KEY).emit(emit_card_param.value);
	} else {
		useEventBus(TAG_CALL_KEY).emit(emit_card_param.value);
	}
};

const clickTagEvacuate = () => {
	if (loading.value) {
		loadingTip();
		return;
	}
	useEventBus(TAG_EVACUATE_KEY).emit(emit_card_param.value);
};

const clickTagTrack = () => {
	if (loading.value) {
		loadingTip();
		return;
	}
	card_is_track.value = !card_is_track.value;
	if (card_is_track.value) {
		useEventBus(ADD_TRACK_FOLLOW_KEY).emit(emit_card_param.value);
	} else {
		useEventBus(CANCEL_TRACK_FOLLOW_KEY).emit(emit_card_param.value);
	}
};

const clickTagTrackHistory = () => {
	if (loading.value) {
		loadingTip();
		return;
	}
	const name_field = fetch_map[position_obj_type.value].name_field;
	const param = {
		...emit_card_param.value,
		uuid: (detail_data.value as position_detail_result).uuid,
		utype: position_obj_type.value,
		name: ((detail_data.value as position_detail_result).base_info as any)[name_field]
	};
	useEventBus(TRACK_HISTORY_KEY).emit(param);
};

const clickTagVideo = () => {
	if (loading.value) {
		loadingTip();
		return;
	}
	useEventBus(VIDEO_TRACK_KEY).emit(emit_card_param.value);
};

const clickTagViewFollow = async () => {
	if (loading.value) {
		loadingTip();
		return;
	}
	if (card_is_follow.value) {
		useEventBus(CANCEL_VIEW_FOLLOW_KEY).emit();
	} else {
		const resp = await getLocatorData({accurate_card_id: location_info.value?.info.card_id});
		if (resp.data.type === 1) {
			const element = resp.data.result[0];
			useEventBus(ADD_VIEW_FOLLOW_KEY).emit({element});
		}
	}
};

const openAreaMultipleDetailDialog = (area_id:number, area_name:string, area_group_id:number) => {
	const category = DetailDialogCategoryEnum.AREA_NAME;
	detail_dialog_store.setProps(category, {
		dialog_id: String(area_id),
		direction: "rtl",
		title: area_name,
		areas: {[area_group_id ?? -1]: [area_id]},
	});
	detail_dialog_store.toggleVisible(category, true);
};

const {resume} = useTimeoutPoll(fetchDetailData, 4000);

watch(() => first_card_is_track.value, (value) => {
	card_is_track.value = value;
}, {immediate: true});

watchEffect(() => {
	if (dialog.value.visible) {
		resume();
	}
});

</script>

<style>
.location-obj-setting-dialog .fk-index-tabs.outer-tabs {
	height: 100%;

	.el-tabs__content {
		height: 100%;

		.el-tab-pane {
			height: 100%;
		}
	}
}
</style>
<style scoped lang="scss">
	.position-obj-content {
		width: calc(100% + 20px);
		max-height: calc(100% - 70px);
		overflow-y: auto;
		padding-right: 20px;
	}
	.avatar-wrap {
		flex:none;
		position: relative;
		width: 50px;
		border-radius: 50%;
		.avatar {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translateX(-50%) translateY(-50%);
			width: 50px;
			height: 50px;
			border-radius: 50%;
			max-width: none;
		}
	}

	.base-info-list>:first-child {
		align-self: end;
	}

	.base-single-info-list>:first-child {
		align-self: center;
	}

	.area-descriptions-list {
		padding-left: 20px;
		:deep(li:not(:first-child)) {
			padding-left: 6px;
		}

	}

	.online {
		background: rgba(105, 214, 109, 0.10);
		color: #69d66d;
	}

	.offline {
		background: rgba(178, 196, 219, 0.10);
		color: var(--text-minor-1);
	}
	.name-icon-text {
		display: flex;
		height: 16px;
		align-items: center;
		justify-content: space-between;
		flex:1
	}

	:deep(.el-dialog.base-dialog){
		overflow: hidden;
	}
	:deep(.el-tabs--left) .el-tabs__header.is-left {
		height: 577px !important;
		margin-right: 0 !important;
	}

	:deep(.el-tabs--left) .el-tabs__nav-wrap.is-left {
		padding-top: 16px !important;
	}

	:deep(.el-tabs--left) .el-tabs__nav-wrap::after {
		background-color: #2F3E54 !important;
	}

	:deep(.el-tabs--left) .el-tabs__item {
		color: #94a6be !important;
	}
	:deep(.el-tabs--left) .el-tabs__item.is-left.is-active {
		color: #e3eefc !important;
	}
	:deep(.el-tabs__active-bar) {
		background-color: #409eff !important;
	}
</style>
