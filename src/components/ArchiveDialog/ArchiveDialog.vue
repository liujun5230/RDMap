<template>
<component
	:is="components"
	:dialog-visible.sync="dialog_visible"
	:archive-param="archive_param"
	@close-archive-dialog="closeArchiveDialog"
/>
</template>
<script setup lang="ts">
import {ref, computed, provide} from "vue";
import {Notification} from "element-ui";
import ThingsArchive from "@/components/ArchiveDialog/thingsArchive/ThingsArchive.vue";
import DeviceArchive from "@/components/ArchiveDialog/deviceArchive/DeviceArchive.vue";
import {useDisplaySetting} from "@/components/ArchiveDialog/components/useDisplaySetting";
import {getArchivesThings} from "@/api/archives/archives";
import {getDefaultIcon} from "@/api/characterModel/icon";
import {
	THINGS_TYPE_OPTIONS,
	useThingAuthUrl,
} from "./thingsArchive/composable/useInfo";
import {useThingsInfoAuth} from "@/components/ArchiveDialog/components/useAuth";

type ParamType = {
	uuid?:number,
	card_id?:number,
	device_uuid?:string,
	device_add_type?:string,
	things_add_type?:string
}
const archive_param = ref<ParamType>({});
const dialog_visible = ref(false);
const all_default_imgs = ref<[]>([]);

const {getAllDisplaySetting} = useDisplaySetting();
getAllDisplaySetting();

const components = computed(() => {
	const {uuid, card_id, things_add_type, device_uuid, device_add_type} = archive_param.value;
	if (device_uuid || device_add_type) {
		return DeviceArchive;
	} else if (uuid || things_add_type || card_id) {
		return ThingsArchive;
	}
	return null;
});

const openArchiveDialog = async (data:ParamType) => {
	const {uuid, card_id, things_add_type, device_uuid, device_add_type} = data;
	archive_param.value = device_uuid || device_add_type ? {device_uuid, device_add_type} : {uuid, card_id, things_add_type};
	if (archive_param.value.uuid) {
		const res = await getArchivesThings({uuid: archive_param.value.uuid});
		if (res.data.type === 1) {
			const things_type = res.data.result.utype ? THINGS_TYPE_OPTIONS[res.data.result.utype] : "";
			if (!useThingsInfoAuth(useThingAuthUrl(things_type)).things_show_auth) {
				Notification({
					title: "错误",
					type: "error",
					message: "没有查看权限"
				});
				return;
			}
		}
	}
	const {data: {type, result}} = await getDefaultIcon({});
	if (type === 1) all_default_imgs.value = result;
	dialog_visible.value = true;
};

provide("ALL_DEFAULT_IMGS", all_default_imgs);

const emits = defineEmits(["close-archive-dialog"]);
const closeArchiveDialog = () => {
	emits("close-archive-dialog");
};
defineExpose({
	openArchiveDialog
});

</script>
