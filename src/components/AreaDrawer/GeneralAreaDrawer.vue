
<template>
<!-- 电子围栏区域 -->
<virtual-fence
	v-if="props.type === AreaTypes.VIRTUAL_FENCE"
	ref="drawer"
	:area-template-options="area_template_options"
	:area-group-options="area_group_options"
	:area-dict="area_dict"
	v-bind="$attrs"
	:floor-info="floor_info"
	:area="area"
	:raw-area="props.rawArea"
	:loading="loading"
	@update-template-options="fetchTemplateOptions"
	@save="saveVirtualFence"
	@go-to-draw="goToDraw"
	v-on="$listeners"
/>

<!-- 上下井区域 -->
<up-down-pit-drawer
	v-else-if="props.type === AreaTypes.UP_DOWN_PIT"
	ref="drawer"
	:area-template-options="area_template_options"
	:area-type-options="area_type_options"
	v-bind="$attrs"
	:floor-info="floor_info"
	:area="area"
	:raw-area="props.rawArea"
	:loading="loading"
	@update-template-options="fetchTemplateOptions"
	v-on="$listeners"
	@save="savePitArea"
	@go-to-draw="goToDraw"
/>

<!-- 考勤区域 -->
<attendance-drawer
	v-else-if="props.type === AreaTypes.ATTENDANCE_AREA"
	ref="drawer"
	:area-template-options="area_template_options"
	v-bind="$attrs"
	:floor-info="floor_info"
	:area="area"
	:raw-area="props.rawArea"
	:loading="loading"
	@update-template-options="fetchTemplateOptions"
	@save="saveAttendanceArea"
	v-on="$listeners"
	@go-to-draw="goToDraw"
/>
</template>

<script setup lang="ts">
import {Notification} from "element-ui";
import {computed, watch} from "vue";
import {ref} from "vue";

import {addArea, updateArea} from "@/api/area/area";
import {getAreaArchives, type AreaArchiveResult} from "@/api/archives/archives";
import {UPDATE_AREA} from "@/events";
import {updateAttendanceArea, addAttendanceArea} from "@/api/attendance/attendanceArea";
import {updatePitArea, addPitArea} from "@/api/pit/pitArea";
import {useEventBus} from "@vueuse/core";
import type {AreaTemplate} from "@/components/types";

import AttendanceDrawer, {type SaveData as AttendanceFormData} from "./AttendanceDrawer.vue";
import {AreaTypes} from "./constant";
import {getAreaDictData, getTemplateOptions} from "./fetchData";
import type {AreaGroup, Option, AreaDict, AreaSubmitData, FloorInfo, RawArea} from "./types";
import UpDownPitDrawer, {type SaveData as PitFormData} from "./UpDownPitDrawer.vue";
import {openDrawer} from "./utils";
import VirtualFence from "./VirtualFence.vue";

type Props = {
	type: AreaTypes;
	floorInfo?: FloorInfo
	selectedAreaId?: number,
	id: number,
	isShow: boolean,
	rawArea?: RawArea,
	cacheForm: unknown
}

const loading = ref(false);

const props = defineProps<Props>();

const area_id = ref(props.id);

const area_template_options = ref<Option<AreaTemplate>[]>([]);

const area_group_options = ref<Option<AreaGroup>[]>([]);

const area_dict = ref<AreaDict[]>([]);

const drawer = ref<InstanceType<typeof AttendanceDrawer | typeof UpDownPitDrawer | typeof VirtualFence>>();

// 更新显示设置区域数据
const {emit: emitUpdateArea} = useEventBus(UPDATE_AREA);
const emit = defineEmits(["refresh"]);
// 区域模板
function fetchTemplateOptions() {
	return getTemplateOptions()
		.then((options) => {
			area_template_options.value = options;
		});
}

function fetchAreaDictData() {
	getAreaDictData()
		.then((data) => {
			area_dict.value = data;
		});
}

fetchTemplateOptions();

fetchAreaDictData();

const area_type_options = ref<Option<number>[]>([
	{label: "第一区域", value: 9},
	{label: "第二区域", value: 10},
]);

watch(() => props.type, (type) => {
	if (type === AreaTypes.VIRTUAL_FENCE) {
		fetchAreaDictData();
	}
});

const area = ref<AreaArchiveResult>();
let cache_form = props.cacheForm;

watch(() => props.id, (id) => {
	area_id.value = id;
});

watch(() => ([area_id.value, props.isShow]), async() => {
	if (area_id.value && props.isShow) {
		await fetchAreaArchive(area_id.value);
		if (cache_form) {
			drawer.value?.restoreFormData(JSON.parse(cache_form as string));
			cache_form = null;
		}
		return;
	}
	area.value = undefined;
}, {immediate: true});

async function fetchAreaArchive(id:number) {
	console.debug("area_id: ", id);
	try {
		const resp = await getAreaArchives({id});
		if (resp.data.type === 1) {
			area.value = resp.data.result;
		} else {
			Notification.error({
				title: "错误",
				message: resp.data.result as any as string,
			});
		}
	} catch (e) {
		Notification.error({
			title: "错误",
			message: "获取区域档案失败",
		});
	}
}

async function emitRefresh() {
	if (area_id.value)
		await fetchAreaArchive(area_id.value);

	emit("refresh", {area_id: area_id.value});
	emitUpdateArea();
	drawer?.value?.exitEditMode();
}

async function saveAttendanceArea(data: AttendanceFormData) {
	loading.value = true;
	if (data.id) {
		const params = {
			...data,
			id: data.id
		};
		const resp = await updateAttendanceArea(params);
		if (resp.data.type === 1) {
			Notification({
				title: "成功",
				message: "修改成功",
				type: "success"
			});
			await emitRefresh();
		} else {
			Notification({
				title: "失败",
				message: resp.data.result,
				type: "error"
			});
		}
	} else {
		const resp = await addAttendanceArea(data);
		area_id.value = resp.data.result as number;
		if (resp.data.type === 1) {
			Notification({
				title: "成功",
				message: "添加成功",
				type: "success"
			});
			await emitRefresh();
		} else {
			Notification({
				title: "失败",
				message: resp.data.result as string,
				type: "error"
			});
		}
	}
	loading.value = false;
}

async function savePitArea(data: PitFormData) {
	const id = data.area_id;
	loading.value = true;
	if (id) {
		const res = await updatePitArea(data);

		if (res.data.type === 1) {
			Notification({
				title: "成功",
				type: "success",
				message: "修改成功",
			});
			await emitRefresh();
		} else {
			Notification({
				title: "错误",
				type: "error",
				message: res.data.result,
			});
		}
	} else {
		const res = await addPitArea(data);

		if (res.data.type === 1) {
			area_id.value = res.data.result.area_id;
			Notification({
				title: "成功",
				type: "success",
				message: "新增成功",
			});
			await emitRefresh();
		} else {
			Notification({
				title: "错误",
				type: "error",
				message: res.data.result as any as string,
			});
		}
	}
	loading.value = false;
}

async function saveVirtualFence(data: AreaSubmitData) {
	const id = data.id;
	loading.value = true;
	if (id) {
		const resp = await updateArea(data);
		if (resp.data.type === 1) {
			Notification({
				title: "成功",
				message: "修改成功",
				type: "success"
			});
			await emitRefresh();
		} else {
			Notification({
				title: "错误",
				message: resp.data.result,
				type: "error"
			});
		}
	} else {
		const resp = await addArea(data);
		if (resp.data.type === 1) {
			area_id.value = resp.data.result as number;
			Notification({
				title: "成功",
				message: "添加成功",
				type: "success"
			});
			await emitRefresh();
		} else {
			Notification({
				title: "错误",
				message: resp.data.result,
				type: "error"
			});
		}
	}
	loading.value = false;
}

const floor_info = computed(() => {
	// 如果当前是新增，那么就使用传入的楼层信息
	if (!area_id.value) {
		// 百度地图
		if (props.floorInfo?.type === 1 && props.floorInfo?.id === 2) {
			return {
				...props.floorInfo,
				id: (props.floorInfo?.id || area.value?.floor_id)!,
				name: "百度地图",
				building_name: "",
				scene_name: "",
			} satisfies FloorInfo;
		}
		return {
			id: props.floorInfo?.id || 0,
			name: props.floorInfo?.map || "",
			type: props.floorInfo?.type || 0,
		} satisfies FloorInfo;
	}

	// 如果是编辑，那么就使用当前正在编辑的区域的楼层信息
	if (area.value) {
		return {
			id: area.value.floor_id,
			name: area.value.floor_id !== 2 ? area.value.map : "百度地图",
			type: props.floorInfo?.type,
		} satisfies FloorInfo;
	} else {
		return {
			id: props.floorInfo?.id || 0,
			name: props.floorInfo?.map || "",
			type: props.floorInfo?.type || 0,
		} satisfies FloorInfo;
	}
});

// 跳转到地图页，然后进行绘制
function goToDraw(area_type: AreaTypes, id: number, floor_id: number) {
	console.log("goToDraw", area_type, id, floor_id);
	openDrawer(area_type, {
		action: "view",
		floor_id,
		id,
		from: "map",
		cache_form: JSON.stringify(drawer?.value?.getFormData())
	});
}
</script>

<style scoped>
</style>
