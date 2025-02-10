<!-- eslint-disable vue/multi-word-component-names -->
<template>
<div id="app">
	<header-bar
		v-if="show_head"
		@change-password="show_change_password = true"
	/>
	<fk-alarm />
	<disk-alarm />
	<form-change-password
		:is-show.sync="show_change_password"
		@quit-change-password="show_change_password = false"
	/>
	<div
		class="app-main"
		:class="{'clear-head':!show_head}"
	>
		<side-bar v-if="show_head" />
		<div class="content home-var">
			<transition
				name="fade-transform"
				mode="out-in"
				appear
			>
				<router-view />
			</transition>
		</div>
	</div>
	<detail-dialog-container />
</div>
</template>

<script setup>
import {ref, shallowRef, provide, computed} from "vue";
import HeaderBar from "@/components/HeaderBar.vue";
import FkAlarm from "@/components/Alarm/FkAlarm.vue";
import DiskAlarm from "@/components/DiskAlarm/DiskAlarm.vue";
import FormChangePassword from "@/components/FormChangePassword.vue";
import SideBar from "@/components/SideBar/index.vue";
import {getConfig} from "@/api/configuration/sysConfig";
import {getPersonInfo, getVisitorInfo, getTruckInfo, getMaterialInfo, getContractorInfo} from "@/api/history/history";
import {useLocationMixin} from "@/utils/js/useLocationMixin";
import store from "@/store";
import {useSceneStore} from "@/store/useSceneStore";

import DetailDialogContainer from "@index/components/DetailDialog/Index.vue";

const scene_floors = shallowRef({});
const building_floors = shallowRef({});
const floor_obj = shallowRef({});
const person_obj = shallowRef({});
const car_obj = shallowRef({});
const visitor_obj = shallowRef({});
const material_obj = shallowRef({});
const contractor_obj = shallowRef({});
const config = shallowRef({});
const show_change_password = ref(false);

provide("SCENE_FLOORS", scene_floors);
provide("BUILDING_FLOORS", building_floors);
provide("FLOOR_OBJ", floor_obj);
provide("PERSON_OBJ", person_obj);
provide("CAR_OBJ", car_obj);
provide("VISITOR_OBJ", visitor_obj);
provide("MATERIAL_OBJ", material_obj);
provide("CONTRACTOR_OBJ", contractor_obj);
provide("CONFIG", config);
const theme = computed(() => store.getters.user_info.theme);
provide("THEME", theme);

const show_head = useLocationMixin();
getAllData();

function getAllData() {
	return Promise.allSettled([
		getPersonInfo(),
		getTruckInfo(),
		getVisitorInfo(),
		getMaterialInfo(),
		getContractorInfo(),
		getConfig(),
		useSceneStore().fetch()
	]).then(res_list => {
		handlePersonInfo(res_list[0].value || {});
		handleCarInfo(res_list[1].value || {});
		handleVisitorInfo(res_list[2].value || {});
		handleMaterialInfo(res_list[3].value || {});
		handleContractorInfo(res_list[4].value || {});
		handleConfigInfo(res_list[5].value || {});
		handleFloorInfo(res_list[6].value);
	});
}

function reduceToObj(array, key) {
	return array.reduce((obj, item) => {
		obj[item[key]] = item;
		return obj;
	}, {});
}

function handleFloorInfo(data) {
	if (data) {
		floor_obj.value = data.floor_obj;
		building_floors.value = data.building_floors;
		scene_floors.value = data.scene_floors;
	}
}

function handlePersonInfo({data: {type, result} = {}}) {
	type === 1 && (person_obj.value = reduceToObj(result, "uuid"));
}

function handleCarInfo({data: {type, result} = {}}) {
	type === 1 && (car_obj.value = reduceToObj(result, "uuid"));
}

function handleVisitorInfo({data: {type, result} = {}}) {
	type === 1 && (visitor_obj.value = reduceToObj(result, "uuid"));
}

function handleMaterialInfo({data: {type, result} = {}}) {
	type === 1 && (material_obj.value = reduceToObj(result, "uuid"));
}

function handleContractorInfo({data: {type, result} = {}}) {
	type === 1 && (contractor_obj.value = reduceToObj(result, "uuid"));
}

function handleConfigInfo(data) {
	const result = data.data.result;
	for (const item of result) {
		if (item.name === "MOVING_CACHE_TIME") {
			config.value.MOVING_CACHE_TIME = parseFloat(item.value);
		}
		if (item.name === "ANIMATION_SWITCH") {
			config.value.ANIMATION_SWITCH = item.value === "1";
		}
		if (item.name === "TRACK_RECORD_POINTS") {
			config.value.TRACK_RECORD_POINTS = parseInt(item.value);
		}
		if (item.name === "BAIDU_AK") {
			config.value.BAIDU_AK = item.value;
		}
		if (item.name === "BAIDU_MAP_DISPLAY") {
			config.value.BAIDU_MAP_DISPLAY = item.value === "1";
		}
		if (item.name === "MAP_ICON_OUTLINE") {
			config.value.RENDER_MODEL_OUTLINE = item.value === "1";
		}
		if (item.name === "SCENE_SHOW_DEVICE") {
			config.value.SCENE_SHOW_DEVICE = item.value === "1";
		}
		if (item.name === "PLAYBACK_LINE_BROKEN_TIME_PERSON") {
			config.value.PLAYBACK_LINE_BROKEN_TIME_PERSON = parseFloat(item.value);
		}
		if (item.name === "PLAYBACK_LINE_BROKEN_TIME_TRUECK") {
			config.value.PLAYBACK_LINE_BROKEN_TIME_TRUCK = parseFloat(item.value);
		}
		if (item.name === "PLAYBACK_LINE_BROKEN_TIME_MATERIAL") {
			config.value.PLAYBACK_LINE_BROKEN_TIME_MATERIAL = parseFloat(item.value);
		}
		if (item.name === "ANIMATION_MOVEMENT_SPEED_OPTIMIZATION") {
			config.value.ANIMATION_MOVEMENT_SPEED_OPTIMIZATION = parseFloat(item.value);
		}
		if (item.name === "ANIMATION_DELAY_TIME_POINT") {
			config.value.ANIMATION_DELAY_TIME_POINT = parseFloat(item.value);
		}
		if (item.name === "ANIMATION_DELAY_TIME") {
			config.value.ANIMATION_DELAY_TIME = parseFloat(item.value);
		}
	}
}
</script>

<style>
:root .custom-theme-blue {
	--icon-active: #409eff;
}
:root .custom-theme-green {
	--icon-active: #80d1cb;
}

.app-main .content {
	padding: 0;
}

#container {
	position: relative;
	display: flex;
	height: 100%;
	flex-direction: column;
}

.time_picker_container {
	display: inline-block;
	margin: 0 6px;
}

ul,
li {
	list-style: none;
	margin: 0;
	padding: 0;
}

.el-picker-panel__footer button:first-child {
	display: none;
}

.el-form-item__content {
	line-height: 32px !important;
}

.show-track {
	display: inline-block;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
	padding: 0 12px;
	height: 32px;
	vertical-align: inherit;
	line-height: 32px;
	background-color: #fff;
}

.show-track .el-checkbox .el-checkbox__label {
	padding-left: 8px;
	color: #748ba4;
}

.date-picker .el-range__close-icon {
	display: none !important;
}

.date-picker .el-range-input {
	flex-grow: 1 !important;
}

/* 解决和后台el-dialog冲突的样式 */
.home-base-dialog.el-dialog {
	.el-dialog__header {
		i {
			line-height: 32px;
			color: #94a6be !important;
		}
	}
}
</style>
