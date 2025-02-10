<template>
<el-form
	:inline="true"
	size="small"
	class="map-form"
>
	<el-form-item
		label="时间选择"
		class="date-form-item"
	>
		<fk-date-picker
			:value="form_data.time"
			class="date-picker"
			type="datetimerange"
			size="small"
			format="yyyy-MM-dd HH:mm"
			:clearable="false"
			:editable="false"
			:default-time="['00:00:00', '23:59:59']"
			prefix-icon="none"
			:use-cache="true"
			cache-key="date"
			style="width: 279px;"
			@input="updateTime"
		/>
	</el-form-item>
	<el-form-item label="地图">
		<floor-cascader
			:has-all="true"
			:default-floor="form_data.default_floor"
			@get-checked-floor="changeFloor"
		/>
	</el-form-item>
	<el-form-item
		v-show="show_replay_way"
		label="回放"
	>
		<template #label>
			<div class="inline-flex items-center">
				<span class="mr-1">回放方式</span>
				<fk-icon
					:tip="replay_tips"
					placement="bottom"
				>
					<icon-header-question />
				</fk-icon>
			</div>
		</template>
		<el-select
			v-model="form_data.replay_way"
		>
			<el-option
				label="分楼层回放"
				:value="REPLAY_WAY.floor"
			/>
			<el-option
				label="一张图回放"
				:value="REPLAY_WAY.all"
			/>
		</el-select>
	</el-form-item>
	<el-form-item class="label-form-item">
		<template #label>
			<fk-label
				ref="fk_label_ref"
				v-model="form_data.selected_input_key"
				cache-key="input"
				arrow-icon="el-icon-arrow-down"
				:options="label_options"
			/>
		</template>
		<el-select
			v-model="form_data.uuid_list"
			class="uuid-select"
			clearable
			filterable
			remote
			multiple
			collapse-tags
			reserve-keyword
			popper-class="uuid-select-dropdown"
			placeholder="请输入搜索内容"
			:loading="loading"
			:remote-method="querySearchAsync"
			:style="{width: '190px', '--ml': form_data.uuid_list.length ? '15px' : '30px'}"
			@change="handleChangeUUID"
		>
			<template #prefix>
				<i
					class="el-input__icon el-icon-search"
				/>
			</template>
			<template #default>
				<el-option
					v-for="item in search_person_list"
					:key="item.value"
					:label="item.label"
					:value="item.value"
				>
					<text-ellipsis style="max-width: 200px;">
						{{ item.select_label }}
					</text-ellipsis>
				</el-option>
			</template>
		</el-select>
	</el-form-item>

	<el-tag
		v-for="tag in form_data.select_list"
		v-show="!fold"
		:key="tag.uuid"
		class="replay-tag"
		:style="{'--tag-color': trajectory_colors[tag.uuid]}"
		closable
		disable-transitions
		@close="handleTagClose(tag)"
		@click="handleTagClick(tag)"
	>
		{{ `${tag.name}${!tag.card_id ? '' : `-${tag.card_id }` }` }}
	</el-tag>

	<el-form-item class="btn-search-item">
		<el-button
			class="btn-search"
			type="primary"
			size="small"
			style="vertical-align: top;"
			@click="handleSearch"
		>
			查询
		</el-button>
	</el-form-item>

	<slot />

	<span
		v-show="show_fold"
		class="fold-button"
		@click="toggleForm"
	>
		<i
			class="fold-icon"
			:class="fold ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"
		/>
		<span>{{ fold ? "展开" : "收起" }}</span>
	</span>
</el-form>
</template>

<script setup lang="ts">
import {h, ref, computed, shallowRef, inject, watch, nextTick, onBeforeUnmount, type ShallowRef} from "vue";
import {storeToRefs} from "pinia";
import {Notification} from "element-ui";
import {useEventBus} from "@vueuse/core";
import {debounce} from "lodash-es";

import store from "@/store";
import {useLoading, useAreaMapStorage} from "@/composable";
import {getSearchPerson} from "@/api/history/history";
import type {ObjectListItem} from "@/api/history/history";
import {normalizeHMS, normalizeSeconds} from "@/utils/js/dateShortcuts";
import {usePageAuth} from "@/utils/js/authentication";
import locationHref from "@/utils/js/locationHref";
import {UTYPES} from "@/utils/js/constant";
import FkLabel from "@/components/ForThink/FkLabel.vue";
import FkDatePicker from "@/components/ForThink/Form/FkDatePicker.vue";
import FloorCascader from "@/components/FloorCascader.vue";
import TextEllipsis from "@/components/TextEllipsis.vue";
import FkIcon from "@/components/ForThink/FkIcon.vue";
import IconHeaderQuestion from "~icons/operation/header-question";
import {SETTING_KEY} from "@/components/mapSettings/pageConfig";

import router from "@/views/history/router";
import {FOCUS_TAG} from "@/views/history/events";
import {SEARCH_KEY_LABEL_MAP, REPLAY_WAY} from "@/views/history/constant";
import {useTrajectoryColorsStore} from "@/views/history/store/useTrajectoryColorsStore";
import type {FloorItem} from "@/views/history/type";

const emits = defineEmits<{
	(event: "change-uuid"): void,
	(event: "search", value: FormData): void
}>();

const SCENE_FLOORS = inject("SCENE_FLOORS") as ShallowRef<Record<number, {floor_list: FloorItem[], outdoor: FloorItem | null, has_all: boolean, file_path: string}>>;
const BUILDING_FLOORS = inject("BUILDING_FLOORS") as ShallowRef<Record<number, {floor_list: FloorItem[], outdoor: FloorItem | null, scene_id: number}>>;
const FLOOR_OBJ = inject("FLOOR_OBJ") as ShallowRef<Record<number, FloorItem>>;
const {trajectory_colors} = storeToRefs(useTrajectoryColorsStore());
const {resetMapSetting} = useAreaMapStorage(SETTING_KEY.HISTORY_CARD_REPLAY);
const {emit: emitFocusTag} = useEventBus(FOCUS_TAG);

const type_key_map = {
	scene: "scene_id",
	building: "building_id",
	floor: "floor_id_list",
};
const replay_tips = "分楼层回放：在每张地图上回放定位对象在该地图的轨迹，切换地图轨迹会断开；\n 一张图回放：在室外地图上回放定位对象的所有轨迹，同场景多楼层的轨迹不会断开，切换场景轨迹会断开。";

interface FormData {
	time: Date[],
	default_floor: number[],
	replay_way: REPLAY_WAY,
	selected_input_key: "person_name" | "visitor_name" | "contractor_name" | "licence" | "serial_num" | "card_id",
	uuid_list: number[],
	floor_cascade_data: number[],
	selected_map_keyvalue: Record<string, number>,
	select_list: ObjectListItem[]
}
const getDefaultFormData = (): FormData => ({
	time: getDefaultTime(),
	default_floor: [-1],
	replay_way: REPLAY_WAY.floor,
	selected_input_key: "person_name",
	uuid_list: [],
	floor_cascade_data: [],
	selected_map_keyvalue: {},
	select_list: []
});
const form_data = ref(getDefaultFormData());

interface SearchPersonItem {
	label: string,
	value: number,
	select_label: string,
}
const search_person_list = shallowRef<SearchPersonItem[]>([]);
const search_uuid_map = new Map<number, ObjectListItem>();

const fk_label_ref = ref<InstanceType<typeof FkLabel>>();

const show_fold = ref(false);
const fold = ref(true);

const label_options = computed(() => {
	const {flags, person_dict, visitor_dict, contractor_dict, material_dict, car_dict} = store.getters;
	const {person_name: PERSON, visitor_name: VISITOR, serial_num: MATERIAL, contractor_name: CONTRACTOR, licence: TRUCK, card_id: CARD} = SEARCH_KEY_LABEL_MAP;
	const options = [{label: CARD.label, value: CARD.key}] as any[];
	if (flags.displayMaterial && material_dict.serial_num) {
		options.unshift({label: MATERIAL.label, value: MATERIAL.key});
	}
	if (flags.car && car_dict.licence) {
		options.unshift({label: TRUCK.label, value: TRUCK.key});
	}
	if (flags.displayContractor && contractor_dict.name) {
		options.unshift({label: CONTRACTOR.label, value: CONTRACTOR.key});
	}
	if (flags.displayVisitor && visitor_dict.name) {
		options.unshift({label: VISITOR.label, value: VISITOR.key});
	}
	if (person_dict.name) {
		options.unshift({label: PERSON.label, value: PERSON.key});
	}
	return options;
});
const show_replay_way = computed(() => {
	const map_keys = Object.keys(form_data.value.selected_map_keyvalue);
	if (map_keys.length === 0) return true;
	if (map_keys.includes("scene_id")) {
		const scene_id = form_data.value.selected_map_keyvalue.scene_id;
		return SCENE_FLOORS.value[scene_id].has_all;
	} else {
		return false;
	}
});

const {loading, startLoading, endLoading} = useLoading();

watch(() => form_data.value.uuid_list, (new_uuid_list) => {
	show_fold.value = !!new_uuid_list.length;
	if (new_uuid_list.length === 0) {
		search_person_list.value = [];
	}
});
watch(show_replay_way, (new_value) => {
	// 隐藏回放方式，默认设置为分楼层回放
	new_value || (form_data.value.replay_way = REPLAY_WAY.floor);
}, {immediate: true});

onBeforeUnmount(() => {
	notification_no_outdoor_instance?.close();
});

const handleSearch = debounce(() => {
	const {uuid_list, selected_input_key, replay_way, selected_map_keyvalue} = form_data.value;
	if (uuid_list.length === 0) {
		Notification.error({title: "错误", message: `请输入正确的${SEARCH_KEY_LABEL_MAP[selected_input_key].label}`});
		return;
	}
	if (replay_way === REPLAY_WAY.all) {
		let is_exist_outdoor = true;
		const [key, value] = Object.entries(selected_map_keyvalue)[0] ?? [];
		if (key === "scene_id") {
			is_exist_outdoor = Boolean(SCENE_FLOORS.value[value].outdoor);
		} else if (key === "building_id") {
			is_exist_outdoor = Boolean(BUILDING_FLOORS.value[value].outdoor);
		} else if (key === "floor_id_list") {
			const scene_id = FLOOR_OBJ.value[value].scene_id;
			is_exist_outdoor = Boolean(SCENE_FLOORS.value[scene_id].outdoor);
		} else {
			is_exist_outdoor = Object.values(SCENE_FLOORS.value).some((scene) => scene.outdoor);
		}
		if (!is_exist_outdoor) {
			return notifyNoOutdoor();
		}
	}
	emits("search", {...form_data.value});
}, 500, {
	leading: true
});

function updateTime(time: Date[]) {
	const [start, end] = time;
	form_data.value.time = [normalizeSeconds(new Date(start), "start"), normalizeSeconds(new Date(end), "end")];
}

let notification_no_outdoor_instance: any = null;
const message_vnode = h("span", [
	"失败，无场景室外地图，请先上传",
	h("span", {
		class: "notification-no-outdoor",
		on: {
			click: handleNotificationNoOutdoorClick
		}
	}, "场景室外地图")
]);
function notifyNoOutdoor() {
	notification_no_outdoor_instance?.close();
	notification_no_outdoor_instance = Notification.error({
		title: "错误",
		message: message_vnode
	});
}

function handleNotificationNoOutdoorClick() {
	const url = "/systemManage#/floorManage";
	const auth = usePageAuth(url).value;
	if (auth.no_permission) {
		Notification.error({title: "错误", message: "无权限查看"});
		return false;
	}
	locationHref(`${url}?target=scene`, true);
}

function toggleForm() {
	fold.value = !fold.value;
}

function getDefaultTime() {
	const start = normalizeHMS(new Date(), "start");
	const end = normalizeHMS(new Date(), "end");
	return [start, end];
}

function changeFloor(floor_data: any) {
	const {id, type, cascade_data} = floor_data;
	const assertion_type = type as keyof typeof type_key_map;
	form_data.value.floor_cascade_data = [...cascade_data];
	form_data.value.selected_map_keyvalue = type === "all" ? {} : {[type_key_map[assertion_type]]: type === "floor" ? [id] : id};
}

function updateSearchPersonList(data: ObjectListItem[]) {
	search_person_list.value = data.map((item) => {
		const {uuid, is_delete, name, card_id} = item;
		search_uuid_map.set(uuid, item);
		const delete_label = is_delete === null || parseInt(is_delete) === 1 ? "(已删除)" : "";
		const card_label = card_id ? `-${card_id}` : "";
		return {
			label: name,
			value: uuid,
			select_label: `${name}${card_label}${delete_label}`
		};
	});
}
// 模糊搜索
async function querySearchAsync(query: string) {
	if (query.trim() === "") {
		search_person_list.value = [];
		return;
	}
	startLoading();
	const {selected_input_key} = form_data.value;
	const {data: res} = await getSearchPerson({[selected_input_key]: query}).catch(() => ({data: undefined}));
	endLoading();
	if (res?.type === 1) {
		updateSearchPersonList(res.result);
	}
}
// 精确搜索
async function accurateSearch(uuid_list: number[]) {
	const {data: res} = await getSearchPerson({uuid_list}).catch(() => ({data: undefined}));
	if (res?.type === 1) {
		updateSearchPersonList(res.result);
		return res.result;
	} else {
		return [];
	}
}

function handleChangeUUID(uuid_list: number[]) {
	form_data.value.select_list = uuid_list.map((uuid) => search_uuid_map.get(uuid)!);
	emits("change-uuid");
}
function handleTagClose(tag: ObjectListItem) {
	const {uuid} = tag;
	form_data.value.select_list = form_data.value.select_list.filter((item) => item.uuid !== uuid);
	form_data.value.uuid_list = form_data.value.select_list.map(({uuid}) => uuid);
	emits("change-uuid");
}

function handleTagClick(tag: ObjectListItem) {
	emitFocusTag(tag.uuid);
}

// 等待 FLOOR_OBJ 数据加载完成
watch(FLOOR_OBJ, () => {
	const is_floor_data = !!Object.keys(FLOOR_OBJ.value).length;
	const is_uuid = router.currentRoute.query?.uuid || router.currentRoute.query?.uuid_list;
	if (is_floor_data && is_uuid) {
		handleJumpPage();
	}
}, {
	immediate: true
});
async function handleJumpPage() {
	// 加是否为3d 参数
	const {
		uuid,
		uuid_list,
		start,
		end,
		floor_id = "",
		scene_ids,
		from
	} = router.currentRoute.query as Record<string, any>;

	const real_uuid_list = uuid ? [parseInt(uuid)] : uuid_list.split(",").map((uuid: string) => parseInt(uuid));
	const real_scene_ids = !scene_ids ? [] : scene_ids.split(",").map((scene_id: string) => parseInt(scene_id)) as number[];
	const has_one_map = real_scene_ids.some((scene_id) => {
		const {outdoor, file_path} = SCENE_FLOORS.value[scene_id] ?? {};
		return Boolean(outdoor?.file_2d_path) || Boolean(file_path);
	});
	form_data.value = {
		time: [new Date(parseInt(start) * 1000), new Date(parseInt(end) * 1000)],
		default_floor: floor_id ? [FLOOR_OBJ.value[floor_id].scene_id, FLOOR_OBJ.value[floor_id].building_id, parseInt(floor_id)] : [-1],
		replay_way: from === "emergencyReport" && has_one_map ? REPLAY_WAY.all : REPLAY_WAY.floor,
		selected_input_key: "person_name",
		uuid_list: [],
		floor_cascade_data: [],
		selected_map_keyvalue: {},
		select_list: []
	};
	// fix #14773，没有设置 selected_map_keyvalue，查询时未带上 floor_id 参数
	floor_id && changeFloor({
		id: parseInt(floor_id),
		cascade_data: [...form_data.value.default_floor],
		type: "floor"
	});
	resetMapSetting(); // 从其他页面跳转过来均清空缓存，#20499
	const search_result = await accurateSearch(real_uuid_list);
	await selectedFkLabelKey(search_result);
	// 下拉数据加载完成后，选中uuid才会填充label到输入框
	form_data.value.uuid_list = real_uuid_list;
	form_data.value.select_list = real_uuid_list.map((uuid: number) => search_uuid_map.get(uuid)!);
	try {
		handleSearch();
	} catch {
		Notification.error({title: "错误", message: "快捷查询失败"});
	}
}
const utype_key_map = {
	[UTYPES.PERSON]: "person_name",
	[UTYPES.VISITOR]: "visitor_name",
	[UTYPES.CAR]: "licence",
	[UTYPES.MATERIAL]: "serial_num",
	[UTYPES.CONTRACTOR]: "contractor_name"
} as const;
function selectedFkLabelKey(data: ObjectListItem[]) {
	const reduplication_utypes = [...new Set(data.map(({utype}) => utype))] as (keyof typeof utype_key_map)[];

	return new Promise<void>((resolve) => {
		nextTick(() => {
			if (reduplication_utypes.length) {
				// 如果utype存在多个，统一为卡号，否则选择对应查询项
				const key = reduplication_utypes.length > 1 ? "card_id" : utype_key_map[reduplication_utypes[0]];
				fk_label_ref.value!.setValue(key);
			}
			resolve();
		});
	});
}

// 交互缺陷，进出区域详情在表单选择后就可点击，并不是点击查询后才可点击
function getFormData() {
	return {...form_data.value};
}

defineExpose({
	getFormData
});
</script>

<style>
/* 搜索框下拉宽度与label宽度一致 */
.el-dropdown-menu.label-dropdown.el-popper {
	width: 98px;
	transform: none;
}

.el-dropdown-menu.label-dropdown.el-popper .el-dropdown-menu__item {
	padding: 0 12px;
}

.uuid-select-dropdown.el-select-dropdown {
	max-width: 280px;

	.el-select-dropdown__item {
		padding-left: 12px;
		padding-right: 12px;
	}
}

.notification-no-outdoor {
	color: var(--theme-color);
	cursor: pointer;
}
</style>
<style scoped lang="scss">
.el-form.map-form {
	.el-form-item {
		height: 32px;
		margin-bottom: 10px;
	}

	:deep(.el-form-item__label) {
		height: 32px;
		line-height: 32px;
		border: 1px solid #dcdfe6;
		border-radius: 4px 0 0 4px;
		border-right: none;
		background-color: #fff;
		color: #748ba4;
		padding: 0 12px;
	}

	:deep(.el-input__inner) {
		border-radius: 0 4px 4px 0;
	}

	:deep(.el-date-editor .el-range-separator),
	:deep(.el-date-editor .el-range-input) {
		color: #a2b2c2;
	}
}

.date-form-item {
	:deep(.el-range__icon) {
		display: none;
	}

	:deep(.date-picker .el-range-separator) {
		width: 9%;
	}
}

.el-form.map-form .label-form-item {
	margin-right: 2px;

	:deep(.el-form-item__label) {
		padding: 0;
		vertical-align: bottom;
	}

	:deep(.fk-label .el-dropdown) {
		padding: 0 12px;
	}
}

.uuid-select.el-select {
	--ml: 30px;

	:deep(.el-select__input) {
		margin-left: var(--ml);
		color: #a2b2c2;
	}

	:deep(.el-tag) {
		max-width: 67px;
		border-radius: 12px;
	}

	:deep(.el-tag__close) {
		background-color: transparent;
	}

	:deep(.el-tag__close:hover) {
		color: #fff !important;
		background-color: #07f;
	}
}

.replay-tag.el-tag.el-tag--light {
	--tag-color: #748ba4;
	margin: 3px 8px 10px 0;
	background-color: #fff;
	border-color: var(--tag-color);
	border-radius: 50px;
	font-size: 12px;
	color: var(--tag-color);
	height: 26px;
	line-height: 24px;

	:deep(.el-tag__close) {
		color: var(--tag-color);
	}

	&:hover {
		cursor: pointer;

		:deep(.el-tag__close) {
			color: #fff;
			background-color: var(--tag-color);
		}
	}
}

.btn-search-item.el-form-item {
	margin-left: 8px;
	margin-right: 0;
}

.fold-button {
	display: inline-block;
	cursor: pointer;
	height: 32px;
	line-height: 32px;
	padding: 0 15px;
	background-color: #fff;
	border: 1px solid #d1d8e1;
	border-radius: 4px;
	font-size: 14px;
	margin-bottom: 10px;

	.fold-icon {
		margin-right: 4px;
	}
}

.custom-theme-blue {
	.fold-button {
		color: #07f;
	}

	.fold-button:hover {
		color: #1160BB;
	}

	.fold-button:active {
		color: #23488A;
	}
}

.custom-theme-green {
	.fold-button {
		color: #3EB2A9;
	}

	.fold-button:hover {
		color: #288F87;
	}

	.fold-button:active {
		color: #166B65;
	}
}
</style>
