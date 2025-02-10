<template>
<archive-base-box
	:img-param="device_img_info"
	:columns="device_columns"
	:data="device_info"
>
	<template #name>
		<span
			class="device-status"
			:class="{'device-status-offline':!device_info.status}"
		>{{ device_info.status ? "在线" : "离线" }}</span>
		<span
			v-if="deviceType === 6"
			class="device-status"
			:class="{'issuable-status-offline':!device_info.issuable_status,'issuable-status-fault':device_info.issuable_status === 0}"
		>{{ device_info.issuable_status ? "有卡" : (device_info.issuable_status === 0?"无卡":"--") }}</span>
	</template>
	<template #map_name>
		<span
			v-if="device_info.device_uuid && ![2,3,8,5].includes(deviceType) && btn_handle_auth && !device_info.is_delete"
			@click.stop="setMapCoord"
		>
			<el-tooltip
				placement="top"
				content="编辑地图位置"
			>
				<map-edit-icon
					class="map-edit-icon"
				/>
			</el-tooltip>
		</span>
	</template>
</archive-base-box>
</template>

<script setup>
import {computed, inject} from "vue";
import {Notification} from "element-ui";
import {DEVICE_TYPE_MAP} from "./deviceUtils";
import {base_url} from "@/Config";
import MapEditIcon from "~icons/operation/map-edit.svg";
import locationJump from "@/utils/js/locationHref";

import ArchiveBaseBox from "@/components/ArchiveDialog/components/ArchiveBaseBox.vue";

const props = defineProps({
	deviceInfo: {
		type: Object,
		default() {
			return {};
		},
	},
	deviceType: {
		type: Number,
		default() {
			return 2;
		},
	},
});

const device_img_info = computed(() => {
	return {
		src: device_info.value.img_src,
		name: device_info.value.type_name,
		imgBoxClass: "device-img-box",
		imgClass: "device-img"
	};
});

const btn_handle_auth = inject("BTN_HANDLE_AUTH");
const info_auth = inject("INFO_AUTH");
const add_device_img = inject("ADD_DEVICE_IMG");

const device_source_type_map = {
	2: "浇封电源",
	3: "隔爆电源",
	8: "UPS电源"
};

const device_info = computed(() => {
	const info = props.deviceInfo || {};
	let device_type, ip;
	if (props.deviceType === 5) {
		device_type = info && info.base_type_name ? info.base_type_name : "--";
	} else if ([2, 3, 8].includes(props.deviceType)) {
		device_type = info.type ? device_source_type_map[info.type] : "--";
	} else {
		ip = info.info && info.info.ip ? info.info.ip : "--";
	}
	let img_src = props.deviceType === 5 && info.icon_model_attr ? base_url + info.icon_model_attr.model_2d_url : base_url + info.default_picture;
	if (!info.icon_model_attr && !info.default_picture && add_device_img.value) {
		img_src = base_url + add_device_img.value;
	}
	return {
		device_uuid: info ? info.device_uuid : "",
		img_src,
		type_name: DEVICE_TYPE_MAP[props.deviceType].name,
		name: info.name || "--",
		device_no: info.device_no || "--",
		device_type,
		ip,
		map_id: info.floor_id,
		map_name: info.floor ? info.map : "--",
		areas: info.areas || [],
		status: info.status,
		issuable_status: info.issuable_status,
		is_delete: info.is_delete

	};
});

const jumpIndex = (data, area_item) => {
	if (!data.map_id) return;
	if (!info_auth.value.index_show_auth) {
		Notification({
			title: "错误",
			type: "error",
			message: "没有查看权限"
		});
		return;
	}
	if (device_info.value.is_delete) {
		Notification({
			title: "错误",
			type: "error",
			message: "跳转失败，基站已被删除，无法定位"
		});
		return;
	}
	const type = area_item?.area_id ? "area" : (props.deviceType === 5 ? "station" : "device");
	const locations = {
		type,
		result: [
			{
				floor_id: data.map_id,
				area_id: area_item?.area_id,
				area_name: area_item?.area_name,
				device_uuid: props.deviceInfo.device_uuid,
				device_no: props.deviceInfo.device_no,
			},
		],
	};
	localStorage.setItem("locations", JSON.stringify(locations));
	locationJump("/", true);
};

const jumpDeviceStatusPage = (data) => {
	if (!data.name || device_info.value.is_delete) return;
	if (!info_auth.value.device_setting_show_auth) {
		Notification({
			title: "错误",
			type: "error",
			message: "没有查看权限"
		});
		return;
	}
	let device_page = "/station";
	if ([2, 3, 8].includes(props.deviceType)) {
		device_page = "/deviceInfo/2";
	} else if ([4, 6].includes(props.deviceType)) {
		device_page = "/deviceInfo/" + props.deviceType;
	}
	const url = `/deviceManage#/setting${device_page}?name=${data.name}&device_uuid=${device_info.value.device_uuid}`;
	window.open(url);
};

const device_columns = computed(() => {
	let column_label = props.deviceType === 5 ? "基站类型" : "设备类型";
	let column_prop = "device_type";
	if ([4, 6].includes(props.deviceType)) {
		column_label = "IP";
		column_prop = "ip";
	}
	return [
		{label: "设备名称", prop: "name", is_click: true, clickFunction: jumpDeviceStatusPage},
		{label: "设备ID", prop: "device_no"},
		{label: column_label, prop: column_prop},
		{label: "所在地图", prop: "map_name", is_click: true, clickFunction: jumpIndex},
		{label: "所在区域", prop: "areas", is_click: true, clickFunction: jumpIndex},
	];
});

const setMapCoord = () => {
	emits("edit-map-coord", props.deviceInfo);
};
const emits = defineEmits(["edit-map-coord"]);
</script>
<style scoped lang="scss">
:deep(.device-img-box) {
	width: 110px;
	height: 110px;
}

:deep(.device-img) {
	width: 60px !important;
	height: 60px !important;
}

.device-status {
	float: right;
	padding-top: 2px;
	color: #62bf33;
	margin-left: 8px;
}

.device-status-offline {
	color: #F56C6C;
}

.issuable-status-offline {
	color: #a2b2c2;
}

.issuable-status-fault {
	color: #E6A23C;
}

.map-edit-icon {
	vertical-align: text-bottom;
	margin-left: 6px;
}

.custom-theme-blue .map-edit-icon {
	color: #07F;
}

.custom-theme-green .map-edit-icon {
	color: #3eb2a9;
}

.custom-theme-blue .map-edit-icon:hover {
	background-color: rgba(0, 119, 255, 0.1);
}

.custom-theme-green .map-edit-icon:hover {
	background-color: rgba(62, 178, 169, 0.1);
}

</style>
