<template>
<div>
	<archive-base-dialog
		v-model="dialog_visible"
		:dialog-title="dialog_title"
		:is-data-loading="is_data_loading"
		@close="closeArchiveDialog"
	>
		<device-info-box
			:device-info="device_info"
			:device-type="device_type"
			@edit-map-coord="editMapCoord"
		/>
		<archive-base-tabs :tab-components="tab_components" />
	</archive-base-dialog>
	<edit-map-info
		ref="edit_map_ref"
		:page-key="page_key"
		@success="editMapInfoSuccess"
	/>
</div>
</template>
<script setup lang="ts">
import {ref, provide, watch, computed} from "vue";
import ArchiveBaseDialog from "@/components/ArchiveDialog/components/ArchiveBaseDialog.vue";
import ArchiveBaseTabs from "@/components/ArchiveDialog/components/ArchiveBaseTabs.vue";
import DeviceInfoBox from "./components/DeviceInfoBox.vue";
import EditMapInfo from "./components/EditMapInfo.vue";
import {getDeviceTabs, DEVICE_TYPE_MAP} from "./components/deviceUtils";
import type {DEVICE_TYPE} from "./components/deviceUtils";
import {getDeviceInfo} from "@/api/deviceManage/info";
import {getDefaultIcon} from "@/api/deviceManage/icon";
import {useEventBus} from "@vueuse/core";
import {useDeviceInfoAuth, useDeviceHandleAuth} from "@/components/ArchiveDialog/components/useAuth";

type ParamType = {
	device_uuid?:string,
	device_add_type?:DEVICE_TYPE
}

type Props = {
	dialogVisible:boolean,
	archiveParam:ParamType
}

const props = withDefaults(defineProps<Props>(), {
	dialogVisible: false,
	archiveParam: () => {
		return {
			device_uuid: "",
			device_add_type: undefined
		};
	}
});

const dialog_key = new Date().getTime();

const dialog_visible = computed({
	get() {
		return props.dialogVisible;
	},
	set() {
		emits("update:dialogVisible", false);
	}
});

const page_key = computed(() => {
	return device_type.value && DEVICE_TYPE_MAP[device_type.value].page_key;
});

const add_device_img = ref("");

useEventBus("update_device_info_" + dialog_key).on((device_uuid:any) => {
	getAllDeviceInfo(device_uuid);
});

const device_uuid = computed(() => props.archiveParam.device_uuid || device_info.value?.device_uuid);
const device_type = computed(() => props.archiveParam.device_add_type || device_info.value?.type);
const dialog_title = computed(() => {
	let title = "";
	if (!device_uuid.value && device_type.value) {
		title = "新增" + DEVICE_TYPE_MAP[device_type.value].name;
	} else if (device_info.value) {
		title = `${device_info.value.name}（${device_info.value.device_no}）`;
	}
	return title;
});

const device_info = ref<{[key:string]:any}>({});
const is_data_loading = ref<boolean>(true);
const edit_map_ref = ref();

const tab_components = computed(() => getDeviceTabs());

const closeArchiveDialog = () => {
	emits("close-archive-dialog");
};

const getAllDeviceInfo = (device_uuid:string) => {
	getDeviceInfo({device_uuid}).then(res => {
		if (res.data.type === 1) {
			device_info.value = res.data.result.data[0] || null;
			is_data_loading.value = false;
		}
	});
};

const editMapCoord = (deviceInfo:{}) => {
	edit_map_ref.value.openDialog(deviceInfo);
};
const editMapInfoSuccess = () => {
	getAllDeviceInfo(device_uuid.value);
};

const emits = defineEmits(["update:dialogVisible", "close-archive-dialog"]);
watch(() => dialog_visible.value, async (val:boolean) => {
	if (val) {
		is_data_loading.value = true;
		device_info.value = null;
		if (props.archiveParam.device_add_type) {
			const {data: {type, result}} = await getDefaultIcon();
			if (type === 1) {
				add_device_img.value = result[props.archiveParam.device_add_type];
			}
			is_data_loading.value = false;
		}
		if (props.archiveParam.device_uuid) getAllDeviceInfo(props.archiveParam.device_uuid);
	}
}, {immediate: true});

provide("ARCHIVE_DEVICE_UUID", device_uuid);
provide("DEVICE_INFO", device_info);
provide("DEVICE_TYPE", device_type);
provide("INFO_AUTH", useDeviceInfoAuth());
provide("BTN_HANDLE_AUTH", useDeviceHandleAuth());
provide("DIALOG_KEY", dialog_key);
provide("ADD_DEVICE_IMG", add_device_img);

</script>

