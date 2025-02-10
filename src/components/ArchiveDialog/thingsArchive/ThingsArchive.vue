<template>
<div>
	<archive-base-dialog
		:id="dialog_id"
		v-model="dialog_visible"
		:dialog-title="dialog_title"
		:is-data-loading="is_data_loading"
		@close="closeArchiveDialog"
	>
		<info-box
			ref="things_info_box_ref"
			:things-info="things_info"
			:things-type="things_type"
			:info-box-type="info_box_type"
			:things-default-img="things_default_img"
			@change-info-box-type="changeInfoBoxType"
			@change-card="openChangeCardDialog"
			@unbind-card="openUnbindCardDialog"
			@bind-things="openBindThingsDialog"
			@push-message="openPushMessageDialog"
			@play-video="playVideoFn"
			@open-bs-archive="openBsArchive"
		/>
		<info-tabs :tab-type="info_box_type" />
	</archive-base-dialog>
	<change-card-dialog
		ref="change_card_ref"
		@save-change-card="saveChangeCard"
	/>
	<unbind-card-dialog
		ref="unbind_card_ref"
		@save-unbind-card="saveUnbindCard"
	/>
	<bind-things-dialog
		ref="bind_things_ref"
		@save-bind-things="saveBindThings"
	/>
	<push-msg ref="push_msg_ref" />
	<live-video-player
		ref="video_player_ref"
		:camera-data="camera_video_data"
		:live-video-show="live_video_show"
		:camera-info="play_live_video_camera_info"
		:video-container-position="video_container_position"
		@close-live-video="closeLiveVideo"
	/>
	<device-archive
		:dialog-visible.sync="device_param.visible"
		:archive-param="device_param.archive_param"
	/>
</div>
</template>
<script setup lang="ts">
import {Notification} from "element-ui";
import {ref, provide, watch, computed, set, inject} from "vue";
import ArchiveBaseDialog from "@/components/ArchiveDialog/components/ArchiveBaseDialog.vue";
import InfoBox from "./components/InfoBox.vue";
import InfoTabs from "./components/InfoTabs.vue";
import ChangeCardDialog from "./components/operationComponents/ChangeCardDialog.vue";
import UnbindCardDialog from "./components/operationComponents/UnbindCardDialog.vue";
import BindThingsDialog from "./components/operationComponents/BindThingsDialog.vue";
import PushMsg from "./components/operationComponents/PushMsg.vue";
import LiveVideoPlayer from "./components/operationComponents/LiveVideoPlayer.vue";
import DeviceArchive from "@/components/ArchiveDialog/deviceArchive/DeviceArchive.vue";

import {getArchivesThings, getArchivesCard} from "@/api/archives/archives";
import {personChangeCard} from "@/api/company/personSetting";
import {changeCard} from "@/api/visitor/visitor";
import {changeMaterialCard} from "@/api/material/material";
import {truckChangeCard, updateTruck} from "@/api/truck/truck";
import {changeContractorCard} from "@/api/contractor/Person";
import {getEquip, getTheWatcher} from "@/api/device/camera";

import {
	useInfoTitle,
	THINGS_TYPE_OPTIONS,
	useThingUtype,
	useThingAuthUrl,
} from "./composable/useInfo";
import {useHealthyAuth, useThingsInfoAuth, useThingsHandleAuth} from "@/components/ArchiveDialog/components/useAuth";

import {useEventBus} from "@vueuse/core";

type ParamType = {
	uuid?:number,
	card_id?:number,
	things_add_type?:string
}

type Props = {
	dialogVisible:boolean,
	archiveParam:ParamType
}
type thingsInfoType = {
	uuid:number,
	base_info:{[key:string]:any} | null,
	card_id:number,
	card_info:{} | null,
	truck_slave_card:boolean
}

const props = withDefaults(defineProps<Props>(), {
	dialogVisible: false,
	archiveParam: () => {
		return {
			uuid: 0,
			card_id: 0,
			things_add_type: ""
		};
	}
});

const getDefaultThingsInfo = () => {
	return {
		base_info: null,
		card_info: null,
		card_id: 0,
		truck_slave_card: false,
		uuid: 0
	};
};

const is_entry_area = ref(0);
const is_health = ref(0);
const is_attendance = ref(0);
const is_up_down_pit = ref(0);
const utype = ref(1);
const dialog_key = new Date().getTime();

const is_data_loading = ref(true);
const things_info = ref<thingsInfoType>(getDefaultThingsInfo());
const things_type = ref("");
const info_box_type = ref("things");

const archive_uuid = computed(() => things_info.value.uuid ? things_info.value.uuid : (props.archiveParam.uuid || 0));
const archive_card = computed(() => things_info.value.card_id ? things_info.value.card_id : (props.archiveParam.card_id || 0));
const archive_info = ref(null);
const archive_card_info = ref(null);
const is_slave_card = ref(0);

const change_card_ref = ref();
const unbind_card_ref = ref();
const bind_things_ref = ref();
const push_msg_ref = ref();

const video_player_ref = ref();
const camera_video_data = ref<{[key:string | number]:any}>({});
const live_video_show = ref<{[key:string]:any}>({});
const play_live_video_camera_info = ref({});
const video_container_position = ref<{[key:string]:any}>({});
const container_top = ref(100);
const container_z_index = ref(1000);
const dialog_id = `archive_dialog_${dialog_key}`;
let change_card_obj:any = {};
const all_default_imgs:any = inject("ALL_DEFAULT_IMGS");
const things_default_img = computed(() => {
	const icon_type = utype.value === 6 ? 7 : utype.value;
	return all_default_imgs.value?.find((item:any) => item.icon_things_type === icon_type)?.icon_picture?.model_2d_url;
});

const device_param = ref({
	visible: false,
	archive_param: {device_uuid: ""}
});

useEventBus("update_info_" + dialog_key).on((uuid:any) => {
	getAllThings(uuid);
});

useEventBus("update_card_info_" + dialog_key).on((card_id:any) => {
	getAllCardInfo(card_id);
});

useEventBus("click_change_card_" + dialog_key).on((data:any) => {
	change_card_obj = data;
	change_card_ref.value.showDialog(data.change_card, true);
});

const dialog_visible = computed({
	get() {
		return props.dialogVisible;
	},
	set() {
		emits("update:dialogVisible", false);
	}
});

const closeArchiveDialog = () => {
	emits("close-archive-dialog");
};

const emits = defineEmits(["update:dialogVisible", "close-archive-dialog"]);

const dialog_title = computed(() => {
	let title = "";
	const {base_info, card_id} = things_info.value;
	if (archive_uuid.value === 0 && things_type.value) {
		title = "新增" + useInfoTitle(things_type.value).name;
	} else if (base_info && things_type.value) {
		title = `${base_info[useInfoTitle(things_type.value).key]}（${card_id || "未绑卡"}）`;
	} else if (card_id && !base_info) {
		title = `陌生卡（${card_id}）`;
	}
	return title;
});

const getAllThings = (uuid:number) => {
	getArchivesThings({uuid}).then((res:any) => {
		if (res.data.type === 1) {
			const result = res.data.result;
			const {utype, base_info, card_id, card_info} = result;
			const slave_card_ids = base_info.slave_card_ids;
			const is_slave_card_flag = !slave_card_ids || (slave_card_ids && slave_card_ids.length && !slave_card_ids.includes(props.archiveParam.card_id));
			if ((props.archiveParam.card_id && props.archiveParam.card_id !== Number(card_id) && is_slave_card_flag)) return;
			things_type.value = utype ? THINGS_TYPE_OPTIONS[utype] : "";
			things_info.value["uuid"] = Number(uuid);
			things_info.value["base_info"] = base_info;
			things_info.value["truck_slave_card"] = false;
			is_entry_area.value = result.is_entry_area;
			is_health.value = result.is_health;
			is_attendance.value = result.is_attendance;
			is_up_down_pit.value = result.is_up_down_pit;
			is_slave_card.value = result.is_slave_card;
			archive_info.value = base_info;
			if (slave_card_ids && slave_card_ids.includes(archive_card.value)) {
				things_info.value["truck_slave_card"] = true;
				return;
			}
			things_info.value["card_id"] = Number(card_id) || 0;

			if (!things_info.value["card_info"]) things_info.value["card_info"] = card_info;
			is_data_loading.value = false;
		}
	});
};

const getAllCardInfo = (card_id:number) => {
	getArchivesCard({card_id}).then((res:any) => {
		if (res.data.type === 1) {
			const {utype, base_info, card_id, card_info} = res.data.result;
			if ((props.archiveParam.uuid && props.archiveParam.uuid !== Number(base_info.uuid))) return;
			if (utype) things_type.value = THINGS_TYPE_OPTIONS[utype];
			things_info.value["card_id"] = Number(card_id);
			things_info.value["card_info"] = card_info;
			things_info.value["uuid"] = Number(base_info.uuid) || 0;
			archive_card_info.value = card_info;
			if (!things_info.value["base_info"]) things_info.value["base_info"] = utype ? base_info : null;
			is_data_loading.value = false;
		}
	});
};

const changeInfoBoxType = (change_type:string) => {
	info_box_type.value = change_type;
};

const openChangeCardDialog = (card_id:number) => {
	change_card_ref.value.showDialog(card_id);
};

const handleChangeCard = async (card_id:number, uuid:number, things_type:string, is_change_card:boolean) => {
	let res;
	if (things_type === "person") {
		res = await personChangeCard({card_id, uuid});
	}
	if (things_type === "visitor") {
		res = await changeCard({card_id, uuid});
	}
	if (things_type === "material") {
		res = await changeMaterialCard({card_id, uuid});
	}
	if (things_type === "truck") {
		res = await truckChangeCard({card_id, uuid});
	}
	if (things_type === "contractor") {
		res = await changeContractorCard({card_id, uuid});
	}
	if (res?.data.type === 1) {
		let success_message;
		if (is_change_card) {
			success_message = archive_card.value ? "换卡成功" : "绑卡成功";
			getAllCardInfo(card_id);
			if (things_type === "truck") getAllThings(uuid);
		} else {
			success_message = "绑定对象成功";
			getAllThings(uuid);
		}
		Notification({
			type: "success",
			title: "成功",
			message: success_message
		});
	} else {
		Notification({
			type: "error",
			title: "错误",
			message: res?.data?.result
		});
	}
};

const saveChangeCard = async (card_id:number, is_truck_change?:boolean) => {
	if (is_truck_change) {
		handleTruckChangeCard(card_id);
	} else {
		if (!archive_uuid.value) {
			getAllCardInfo(card_id);
			return;
		}
		handleChangeCard(card_id, archive_uuid.value, things_type.value, true);
	}
};

const handleTruckChangeCard = async (card:number) => {
	const uuid = change_card_obj.uuid;
	const licence = change_card_obj.licence;
	let card_id, slave_card_ids;
	if (change_card_obj.is_change_card) { // 换卡
		if (change_card_obj.card_id === change_card_obj.replaced_card_id) { // 换主卡
			card_id = card;
			slave_card_ids = change_card_obj.slave_card_ids;
		} else { // 换副卡
			card_id = change_card_obj.card_id;
			slave_card_ids = [...change_card_obj.slave_card_ids];
			slave_card_ids.splice(slave_card_ids.indexOf(change_card_obj.replaced_card_id), 1, card);
		}
	} else { // 添加卡
		card_id = change_card_obj.card_id ? change_card_obj.card_id : card; // 有主卡成为副卡  没有主卡成为主卡
		slave_card_ids = change_card_obj.card_id ? [...change_card_obj.slave_card_ids, card] : [];
	}

	const res = await updateTruck({
		card_id,
		slave_card_ids,
		uuid,
		licence
	});
	getAllThings(uuid);
	if (res.data.type === 1) {
		Notification({
			type: "success",
			title: "提示",
			message: change_card_obj.is_change_card ? "换卡成功" : "添加卡号成功"
		});
		getAllCardInfo(card_id);
	} else {
		Notification({
			type: "error",
			title: "提示",
			message: res.data?.result
		});
	}
};

const saveBindThings = (uuid:number, utype:string) => {
	handleChangeCard(archive_card.value, uuid, THINGS_TYPE_OPTIONS[utype], false);
};

const openUnbindCardDialog = (uuid:number, utype:string) => {
	unbind_card_ref.value.showDialog(uuid, utype, is_slave_card.value, archive_card.value);
};
const saveUnbindCard = (is_not_truck:boolean) => {
	if (!is_not_truck) return;
	if (info_box_type.value === "things") {
		things_info.value["card_id"] = 0;
	} else {
		things_info.value["uuid"] = 0;
		things_type.value = "";
		things_info.value.base_info = null;
	}
};

const openBindThingsDialog = () => {
	bind_things_ref.value.showDialog();
};

const openPushMessageDialog = (card_id:number) => {
	push_msg_ref.value.openPushPanel(card_id);
};

const openBsArchive = (device_uuid:string) => {
	device_param.value.visible = true;
	device_param.value.archive_param.device_uuid = device_uuid;
};

const getCameraInfo = async (floor_id?:number) => {
	const camera_res = await getEquip({floor_id_list: [floor_id]});
	if (camera_res.data.type === 1) {
		const camera_data = camera_res.data.result.data;
		camera_data.forEach((item:any) => {
			set(camera_video_data.value, item.id, item);
		});
	}
};

const checkTagInCameraArea = async (params:any) => {
	const {data: {type, result}} = await getTheWatcher(params);
	if (type !== 1 || result === -1) { // camera_id
		return -1;
	}
	return result;
};

const playVideoInfo = (data:any, track_card:number) => {
	if (Object.values(live_video_show.value).filter(i => i).length > 8) {
		Notification({
			title: "错误",
			type: "error",
			message: "最多显示8个视频画面"
		});
		return;
	}
	let id = data.id + dialog_key;

	if (track_card) {
		id = "track_" + track_card + dialog_key;
	}

	if (live_video_show.value[id]) {
		return;
	}

	play_live_video_camera_info.value = {
		id: data.id,
		playerId: id,
		ip: data.ip,
		port: data.port,
		name: data.name,
		url: data.rtsp_url,
		user: data.user,
		password: data.password,
		with_ptz: data.ptz_support,
		track_card: track_card,
	};
	set(live_video_show.value, id, true);
	if (!video_container_position.value[id]) {
		video_container_position.value[id] = {
			zIndex: container_z_index.value,
			top: container_top.value + "px"
		};
		container_top.value += 50;
		container_z_index.value += 1;
	}
};

const playVideoFn = async (card_id:number, floor_id:number, things_info_value:any) => {
	const params = {
		card_id,
		floor_id
	};
	const camera_id = await checkTagInCameraArea(params);
	if (camera_id === -1) {
		Notification({
			title: "失败",
			type: "error",
			message: "当前选择的标签卡不处于任何摄像头的拍摄区域!"
		});
		return;
	}

	if (!camera_video_data.value[camera_id].status) {
		Notification({
			title: "失败",
			type: "error",
			message: "当前摄像头已离线"
		});
		return;
	}
	const archive_dialog = document.querySelector(`#${dialog_id}`);
	archive_dialog?.appendChild(video_player_ref.value.$el);
	const tag_info = things_info_value || card_id;

	set(camera_video_data.value, "track_" + card_id + dialog_key, {
		...camera_video_data.value[camera_id],
		tagInfo: "跟踪标签:" + tag_info, tag_info,
	});
	playVideoInfo(camera_video_data.value[camera_id], card_id);
};

const closeLiveVideo = (id:number) => {
	set(live_video_show.value, id, false);
	container_top.value = container_top.value - 49;
	container_z_index.value = container_z_index.value - 1;
	if (camera_video_data.value[id].tagInfo) {
		delete camera_video_data.value[id];
	}
	const archive_dialog = document.querySelector(`#${dialog_id}`);
	archive_dialog?.removeChild(video_player_ref.value.$el);
};

watch(() => archive_uuid.value, (value) => {
	if (value) {
		getAllThings(value);
	}
});

watch(() => archive_card.value, (value) => {
	if (value) {
		getAllCardInfo(value);
	}
});
watch(() => things_type.value, (val) => {
	if (val) {
		utype.value = useThingUtype(val);
	}
});

watch(() => things_info.value.card_info, (info:any) => {
	if (info && dialog_visible.value) {
		getCameraInfo(info?.floor_id);
	}
}, {
	immediate: true
});

watch(() => dialog_visible.value, async (val) => {
	if (val) {
		is_data_loading.value = true;
		archive_info.value = null;
		archive_card_info.value = null;
		things_type.value = "";
		things_info.value = getDefaultThingsInfo();
		info_box_type.value = props.archiveParam.card_id ? "card" : "things";
		if (props.archiveParam.things_add_type) {
			things_type.value = props.archiveParam.things_add_type;
			is_data_loading.value = false;
		}
		if (props.archiveParam.card_id) getAllCardInfo(props.archiveParam.card_id);
		if (props.archiveParam.uuid) getAllThings(props.archiveParam.uuid);
	}
}, {immediate: true});

const info_auth = computed(() => useThingsInfoAuth(useThingAuthUrl(things_type.value)));
const btn_auth = computed(() => useThingsHandleAuth(things_type.value ? useThingAuthUrl(things_type.value) : ""));
const is_health_page = ref(false);
provide("ARCHIVE_INFO", archive_info);
provide("ARCHIVE_CARD_INFO", archive_card_info);
provide("ARCHIVE_CARD", archive_card);
provide("ARCHIVE_UUID", archive_uuid);
provide("ARCHIVE_THINGS_TYPE", things_type);

provide("BTN_HANDLE_AUTH", btn_auth);
provide("INFO_AUTH", info_auth);
provide("HEALTH_SETTING_AUTH", useHealthyAuth());
provide("IS_HEALTH_PAGE", is_health_page);

provide("IS_ENTRY_AREA", is_entry_area);
provide("IS_HEALTH", is_health);
provide("IS_ATTENDANCE", is_attendance);
provide("IS_UP_DOWN_PIT", is_up_down_pit);
provide("UTYPE", utype);

provide("DIALOG_KEY", dialog_key);

</script>

