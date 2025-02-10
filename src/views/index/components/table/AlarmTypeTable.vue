<template>
<div>
	<scroll-table
		v-if="!loading"
		class="fk-index-table"
		:class="{small}"
		:height="tableHeight"
		:max-height="tableMaxHeight"
		:data="tableData"
		:auto-scroll="autoScroll"
		stripe
		border
	>
		<el-table-column
			v-if="showRuleTypeOrName === 'type'"
			label="规则类型"
			prop="rule_type_name"
			width="122"
			:formatter="formatNull"
			show-overflow-tooltip
		>
			<template #default="{row, column}">
				<i
					v-if="row.level"
					class="inline-block rounded-[50%] mr-[4px]"
					:class="[small ? 'w-[6px] h-[6px]' : 'w-[8px] h-[8px]']"
					:style="getAlarmLevelDotStyle(row.level)"
				/>
				<span>{{ formatNull(row, column, row[column.property]) }}</span>
			</template>
		</el-table-column>
		<el-table-column
			v-if="showRuleTypeOrName === 'name'"
			label="规则名称"
			prop="rule_name"
			width="122"
			:formatter="formatNull"
			show-overflow-tooltip
		>
			<template #default="{row, column}">
				<i
					v-if="row.level"
					class="inline-block rounded-[50%] mr-[4px]"
					:class="[small ? 'w-[6px] h-[6px]' : 'w-[8px] h-[8px]']"
					:style="getAlarmLevelDotStyle(row.level)"
				/>
				<!-- 除了定位对象、区域告警类别，其他告警类别无法配置规则 -->
				<span>{{ formatNull(row, column, row[column.property] || row.rule_type_name) }}</span>
			</template>
		</el-table-column>
		<fk-table-column
			v-if="category !== ALARM_CATEGORY.area"
			prop="name"
			label="名称"
			width="80"
			:show-overflow-tooltip="true"
			:formatter="formatNull"
			:show-header-tip="true"
			:header-tip="tips"
		>
			<template #default="{row, column}">
				<text-ellipsis style="width: 100%;">
					<span
						v-if="isNameClickable(row)"
						class="link"
						@click="openSingleDetailDialog(row)"
					>
						{{ row.utype === UTYPES.UNKNOWN ? row.card_id : row[column.property] }}
					</span>
					<span v-else>{{ formatNull(row, column, row[column.property]) }}</span>
				</text-ellipsis>
			</template>
		</fk-table-column>
		<fk-table-column
			v-if="category !== ALARM_CATEGORY.area"
			prop="related_info"
			label="相关信息"
			width="136"
			:show-overflow-tooltip="false"
			:formatter="formatNull"
			:show-header-tip="true"
			:header-tip="related_info_tips"
		>
			<template #default="{row, column}">
				<text-ellipsis
					v-if="Object.prototype.toString.call(row[column.property]) === '[object Object]'"
					style="width: 100%;"
				>
					<span>{{ formatRelatedStatus(row[column.property]) }}</span>
					<span>（</span>
					<p
						v-for="item in formateRelatedNames(row[column.property])"
						:key="item.uuid"
						class="name-split inline"
						:class="{link: item.clickable}"
						@click="() => item.clickable && openSingleDetailDialog(item)"
					>
						{{ item.name }}
					</p>
					<span v-show="formateRelatedNames(row[column.property]).length === 0">--</span>
					<span>）</span>
				</text-ellipsis>
				<text-ellipsis
					v-else
					style="width: 100%;"
				>
					{{ row.utype === UTYPES.UNKNOWN ? '陌生卡' : formatNull(row, column, row[column.property]) }}
				</text-ellipsis>
			</template>
		</fk-table-column>
		<fk-table-column
			label="区域"
			prop="areas"
			width="126"
			:show-overflow-tooltip="true"
			:show-header-tip="Boolean(area_tips)"
			:header-tip="area_tips"
		>
			<template #default="{row, column}">
				<span v-if="!(row[column.property] || []).length">--</span>
				<text-ellipsis
					v-else
					style="width: 100%;"
				>
					<span
						v-for="item in (row[column.property] || [])"
						:key="item.area_id || item.scene_id"
						class="name-split"
						:class="{link: getAlarmCategory(row.rule_type) !== ALARM_CATEGORY.patrol && item.type !== AreaType.UP_DOWN_PIT_FIRST && item.type !== AreaType.UP_DOWN_PIT_SECOND}"
						@click="openAlarmMultipleDetailDialog(row, item)"
					>
						{{ formateAreas(item) }}
					</span>
				</text-ellipsis>
			</template>
		</fk-table-column>
		<fk-table-column
			label="告警时间"
			prop="time"
			width="167"
			:formatter="formateAlarmTime"
			:show-overflow-tooltip="true"
			:show-header-tip="Boolean(time_tips)"
			:header-tip="time_tips"
		/>
		<el-table-column
			v-if="auth.handle"
			width="70"
		>
			<template #header>
				<span class="align-middle">操作</span>
				<el-popover
					placement="bottom-end"
					trigger="click"
					popper-class="fk-menu-cascader-popper"
				>
					<div class="handle-box">
						<div
							class="handle-btn"
							@click="handleAllTable"
						>
							一键处理
						</div>
					</div>
					<template #reference>
						<module-menu-icon
							v-show="tableData.length"
							tip="一键处理"
						/>
					</template>
				</el-popover>
			</template>
			<template #default="{row}">
				<fk-index-button
					type="info"
					size="mini"
					@click="handleTable([row], 0)"
				>
					处理
				</fk-index-button>
			</template>
		</el-table-column>

		<template #empty>
			<empty-placeholder />
		</template>
	</scroll-table>

	<div
		v-if="loading"
		class="relative flex justify-center items-center h-full"
	>
		<detail-box-loading />
	</div>

	<handle-dialog
		v-model="handle_dialog_visible"
		:handle-auth="auth.handle"
		:required="true"
		@save="handleDialogSave"
	/>
</div>
</template>

<script setup lang="ts">
import {reactive, computed, ref} from "vue";
import {Notification, MessageBox} from "element-ui";
import {throttle} from "lodash-es";
import {storeToRefs} from "pinia";
import {useDateFormat} from "@vueuse/core";

import {useFeatureFlags, useStore} from "@/store";
import {AreaType} from "@/types/global";
import type {ALARM_LEVEL, ApplicableObjects} from "@/types/alarm";
import {ALARM_TYPE, ALARM_CATEGORY, getAlarmCategory} from "@/types/alarm";
import {formatNull} from "@/utils/js/tools/table";
import {usePageAuth} from "@/utils/js/authentication";
import {getChainPropValue} from "@/utils/ts/common";
import {updateEquipAlarm} from "@/api/device/equipAlarm";
import {handleAlarm, handleHelp, batchProcessing as batchAreaProcessing} from "@/api/alarm/alarm";
import {process as batchHandleAccident} from "@/api/alarm/accident";
import {updateHeartError} from "@/api/health/abnormal";
import {batchDisposeRollCallRecord} from "@/api/rollCall/rollCallRecord";
import {batchDisposePatrolRecord} from "@/api/patrol/record";
import {getAreaArchives} from "@/api/archives/archives";
import {small} from "@/utils/ts/breakpoints";
import {UTYPES, ALARM_LEVEL_COLOR, DEVICE_TYPE} from "@/utils/js/constant";
import FkTableColumn from "@/components/ForThink/Table/FkTableColumn.vue";
import TextEllipsis from "@/components/TextEllipsis.vue";

import HandleDialog from "@index/components/Dialog/HandleDialog.vue";
import EmptyPlaceholder from "@index/components/EmptyPlaceholder.vue";
import FkIndexButton from "@index/components/buttons/FkIndexButton.vue";
import ScrollTable from "@index/components/table/ScrollTable.vue";
import DetailBoxLoading from "@index/components/DetailDialog/components/DetailBoxLoading.vue";
import ModuleMenuIcon from "@index/container/modules/components/ModuleMenuIcon.vue";
import {useDetailDialogStore, DetailDialogCategoryEnum} from "@index/store";
import {ModuleNameEnum} from "@index/container/modules/constant";
import type {SingleDetailDeviceProps, SingleDetailPositionObjProps, PositionObjTypeEnum, MultipleDetailAlarmProps} from "@index/store";
import {useAreaStore} from "@index/store";

interface Row {
	id: number,
	rule_type: ALARM_TYPE,
	rule_type_name: string,
	rule_name: string,
	level: ALARM_LEVEL | null,
	name: string,
	uuid: number | string,
	utype: UTYPES | null,
	device_type: DEVICE_TYPE | null,
	card_id: number,
	related_info: null | string | {status: 1 | 2, executor_uuid: number, executor_name: string, applicable_objects: ApplicableObjects},
	time: number,
	alarm_manual_handling_setting: 0 | 1,
	areas: {
		scene_id: number | null,
		scene_name: string | null,
		area_id: number | null,
		area_name: string | null,
		type: AreaType | null,
		group_id: number | null,
		group_name: string | null
	}[],
}

export interface Props {
	loading: boolean,
	tableData: Row[],
	/** type: 列头显示规则类型，name: 列头显示规则名称 */
	showRuleTypeOrName: "type" | "name",
	/** tag: 统计定位对象的区域详情框, alarm_category: 统计告警类别的区域详情框 */
	areaDetailType: "tag" | "alarm_category",
	/** 当前选中的告警类别 */
	category: "all" | ALARM_CATEGORY,
	from?: ModuleNameEnum,
	autoScroll?: boolean,
	tableHeight?: string,
	tableMaxHeight?: string,
	/** 仅areaDetailType === "alarm_category"有效 */
	isIncludeCall?: 0 | 1,
	/** 仅areaDetailType === "alarm_category"有效 */
	tabs?: MultipleDetailAlarmProps["tabs"],
	/** 仅areaDetailType === "alarm_category"有效 */
	begin?: number,
	/** 仅areaDetailType === "alarm_category"有效 */
	end?: number,
	/** 仅areaDetailType === "alarm_category"有效 */
	ruleTypeList?: number[]
}
const props = withDefaults(defineProps<Props>(), {
	from: undefined,
	autoScroll: false,
	tableHeight: "100%",
	tableMaxHeight: undefined,
	isIncludeCall: 0,
	tabs: () => [],
	begin: undefined,
	end: undefined,
	ruleTypeList: undefined,
});

const emits = defineEmits<{
	(event: "handle"): void
}>();

const flags = reactive(useFeatureFlags());
const store = useStore();

const handle_dialog_visible = ref(false);
const is_batch_handle = ref<0 | 1>(0);
let handle_table_list: Row[] = [];

const tips = computed(() => {
	const tips: string[] = [];
	const category = props.category;
	const show_device = Object.keys(flags.device || {}).some((key) => key === "tag" ? false : Boolean(flags.device?.[key]));
	const person_dict = store.getters.person_dict;
	const visitor_dict = store.getters.visitor_dict;
	const contractor_dict = store.getters.contractor_dict;
	const truck_dict = store.getters.car_dict;
	const material_dict = store.getters.material_dict;

	["all", ALARM_CATEGORY.tag, ALARM_CATEGORY.sos, ALARM_CATEGORY.accident, ALARM_CATEGORY.healthy].includes(category) && tips.push(getTip(person_dict, "员工展示", {name: "员工姓名", prop: "name"}));
	["all", ALARM_CATEGORY.tag, ALARM_CATEGORY.sos, ALARM_CATEGORY.accident, ALARM_CATEGORY.healthy].includes(category) && flags.displayVisitor && tips.push(getTip(visitor_dict, "访客展示", {name: "访客姓名", prop: "name"}));
	["all", ALARM_CATEGORY.tag, ALARM_CATEGORY.sos, ALARM_CATEGORY.accident, ALARM_CATEGORY.healthy].includes(category) && flags.displayContractor && tips.push(getTip(contractor_dict, "承包商展示", {name: "承包商姓名", prop: "name"}));
	["all", ALARM_CATEGORY.tag, ALARM_CATEGORY.sos, ALARM_CATEGORY.accident, ALARM_CATEGORY.healthy].includes(category) && flags.car && tips.push(getTip(truck_dict, "车辆展示", {name: "车牌号", prop: "licence"}));
	["all", ALARM_CATEGORY.tag, ALARM_CATEGORY.sos, ALARM_CATEGORY.accident, ALARM_CATEGORY.healthy].includes(category) && flags.displayMaterial && tips.push(getTip(material_dict, "物资展示", {name: "物资编号", prop: "serial_num"}));
	["all", ALARM_CATEGORY.device].includes(category) && flags.device?.tag && tips.push(getTip({}, "标签展示", {name: "绑定的定位对象名称"}));
	["all", ALARM_CATEGORY.device].includes(category) && show_device && tips.push(getTip({}, "设备展示", {name: "设备名称"}));
	["all", ALARM_CATEGORY.patrol].includes(category) && flags.patrol?.record && tips.push(getTip({}, "巡检展示", {name: "巡检任务名称"}));
	["all", ALARM_CATEGORY.call].includes(category) && flags.call?.record && tips.push(getTip({}, "点名展示", {name: "点名任务名称"}));
	["all", ALARM_CATEGORY.sos, ALARM_CATEGORY.device, ALARM_CATEGORY.accident].includes(category) && tips.push(getTip({}, "陌生卡", {name: "陌生卡号"}));

	return tips.join("\\n");
});
const related_info_tips = computed(() => {
	const person_dict = store.getters.person_dict;
	const visitor_dict = store.getters.visitor_dict;
	const contractor_unit_dict = store.getters.contractor_unit_dict;
	const contractor_dict = store.getters.contractor_dict;
	const truck_dict = store.getters.car_dict;
	const material_dict = store.getters.material_dict;
	const category = props.category;
	const tips: string[] = [];

	const show_device = Object.keys(flags.device || {}).some((key) => key === "tag" ? false : Boolean(flags.device?.[key]));

	["all", ALARM_CATEGORY.tag, ALARM_CATEGORY.sos, ALARM_CATEGORY.accident, ALARM_CATEGORY.healthy].includes(category) && tips.push(getTip(person_dict, "员工展示", {name: "部门", prop: "branch_id"}, {name: "员工分类", prop: "person_class"}));
	["all", ALARM_CATEGORY.tag, ALARM_CATEGORY.sos, ALARM_CATEGORY.accident, ALARM_CATEGORY.healthy].includes(category) && flags.displayVisitor && tips.push(getTip(visitor_dict, "访客展示", {name: "单位", prop: "company"}));
	["all", ALARM_CATEGORY.tag, ALARM_CATEGORY.sos, ALARM_CATEGORY.accident, ALARM_CATEGORY.healthy].includes(category) && flags.displayContractor && tips.push(getTip({unit: contractor_unit_dict, contractor: contractor_dict}, "承包商展示", {name: "承包商单位", prop: "unit.name"}, {name: "工种", prop: "contractor.work_type_id"}));
	["all", ALARM_CATEGORY.tag, ALARM_CATEGORY.sos, ALARM_CATEGORY.accident, ALARM_CATEGORY.healthy].includes(category) && flags.car && tips.push(getTip(truck_dict, "车辆展示", {name: "车辆类型", prop: "type"}, {name: "司机姓名", prop: "driver"}));
	["all", ALARM_CATEGORY.tag, ALARM_CATEGORY.sos, ALARM_CATEGORY.accident, ALARM_CATEGORY.healthy].includes(category) && flags.displayMaterial && tips.push(getTip(material_dict, "物资展示", {name: "物资类型", prop: "type"}, {name: "物资名称", prop: "type"}));
	["all", ALARM_CATEGORY.device].includes(category) && flags.device?.tag && tips.push(getTip({}, "标签展示", {name: "绑定的定位对象名称"}));
	["all", ALARM_CATEGORY.device].includes(category) && show_device && tips.push(getTip({}, "非标签卡展示", {name: "设备ID"}));
	["all", ALARM_CATEGORY.patrol].includes(category) && flags.patrol?.record && tips.push(getTip({}, "巡检展示", {name: "未完成/顺序异常（执行人/负责人）"}));
	["all", ALARM_CATEGORY.call].includes(category) && flags.call?.record && tips.push(getTip({}, "点名展示", {name: "未到数"}));

	return tips.join("\\n");
});
const area_tips = computed(() => {
	const category = props.category;
	return ["all", ALARM_CATEGORY.patrol].includes(category) ? "若为“巡检”，则会展示巡检路线" : "";
});
const time_tips = computed(() => {
	const tips: string[] = [];
	const category = props.category;
	["all", ALARM_CATEGORY.patrol].includes(category) && tips.push("若为“巡检”，则会展示巡检记录结束时间");
	["all", ALARM_CATEGORY.call].includes(category) && tips.push("若为“点名”，则会展示点名记录时间");
	return tips.join("\\n");
});

const detail_dialog_store = useDetailDialogStore();
const {area_id_info} = storeToRefs(useAreaStore());
const auth = usePageAuth();

const handleTable = throttle(async (list: Row[], is_batch: 0 | 1) => {
	handle_table_list = list;
	is_batch_handle.value = is_batch;
	handle_dialog_visible.value = list.some((row) => row.alarm_manual_handling_setting === 1);
	if (!handle_dialog_visible.value) {
		confirmHandleTable(is_batch);
	}
}, 1000);
async function confirmHandleTable(is_batch: 0 | 1, comment: string = "") {
	const tag_list: Row[] = [];
	const area_list: Row[] = [];
	const sos_list: Row[] = [];
	const device_list: Row[] = [];
	const accident_list: Row[] = [];
	const patrol_list: Row[] = [];
	const call_list: Row[] = [];
	const healthy_list: Row[] = [];
	const handle_fn_list = [];

	handle_table_list.forEach((row) => {
		const alarm_category = getAlarmCategory(row.rule_type);
		alarm_category === ALARM_CATEGORY.tag && tag_list.push(row);
		alarm_category === ALARM_CATEGORY.area && area_list.push(row);
		alarm_category === ALARM_CATEGORY.sos && sos_list.push(row);
		alarm_category === ALARM_CATEGORY.device && device_list.push(row);
		alarm_category === ALARM_CATEGORY.accident && accident_list.push(row);
		alarm_category === ALARM_CATEGORY.patrol && patrol_list.push(row);
		alarm_category === ALARM_CATEGORY.call && call_list.push(row);
		alarm_category === ALARM_CATEGORY.healthy && healthy_list.push(row);
	});

	tag_list.length && handle_fn_list.push(() => handleAlarm({
		id_list: tag_list.map((row) => row.id),
		comment,
		is_batch,
	}));
	area_list.length && handle_fn_list.push(() => batchAreaProcessing({
		id_list: area_list.map((row) => row.id),
		comment,
		is_batch
	}));
	sos_list.length && handle_fn_list.push(() => handleHelp({
		status: 1,
		id_list: sos_list.map((row) => row.id),
		comment,
		is_batch
	}));
	device_list.length && handle_fn_list.push(() => updateEquipAlarm({
		status: 1,
		id_list: device_list.map((row) => row.id),
		type: device_list.map((row) => row.device_type!),
		comment,
		is_batch
	}));
	accident_list.length && handle_fn_list.push(() => batchHandleAccident({
		status: 1,
		id_list: accident_list.map((row) => row.id),
		comment,
		is_batch,
	}));
	patrol_list.length && handle_fn_list.push(() => batchDisposePatrolRecord({
		id_list: patrol_list.map((row) => row.id),
		comment,
		is_batch,
	}));
	call_list.length && handle_fn_list.push(() => batchDisposeRollCallRecord({
		id_list: call_list.map((row) => row.id),
		comment,
		status: 1,
		is_batch,
	}));
	healthy_list.length && handle_fn_list.push(() => updateHeartError({
		status: 1,
		id_list: healthy_list.map((row) => row.id),
		comment,
		is_batch
	}));

	try {
		await Promise.all(handle_fn_list.map(fn => fn()));
		Notification.success({title: "成功", message: "处理成功"});
		handle_dialog_visible.value = false;
		emits("handle");
	} catch {
		Notification.error({title: "错误", message: "处理失败"});
	}
}
function handleDialogSave(form_data: {comment: string}) {
	confirmHandleTable(is_batch_handle.value, form_data.comment);
}

function getTip(dict: Record<string, 0 | 1>, label: string, ...fields: {name: string, prop?: string}[]) {
	const content = fields.flatMap(({name, prop}) => {
		return (prop === undefined || getChainPropValue(dict, prop)) ? name : [];
	});
	return `${label}：${content.join("-") || "--"}；`;
}

function getAlarmLevelDotStyle(level: ALARM_LEVEL) {
	return {backgroundColor: ALARM_LEVEL_COLOR[level]};
}

const related_info_map = {
	1: "顺序异常",
	2: "未完成",
} as const;
function formatRelatedStatus(related_info: Row["related_info"]) {
	if (!related_info) return "--";
	if (typeof related_info === "string") return related_info;
	return related_info_map[related_info.status];
}
function formateRelatedNames(related_info: Row["related_info"]) {
	if (!related_info) return [];
	if (typeof related_info === "string") return [];
	const {executor_name, executor_uuid, applicable_objects} = related_info;
	if (executor_uuid && executor_name) {
		return [{name: executor_name, uuid: executor_uuid, utype: UTYPES.PERSON, clickable: true}];
	}
	const {person} = applicable_objects;
	if (person?.all_person === 1) {
		return [{name: "全部员工", uuid: NaN, utype: UTYPES.PERSON, clickable: false}];
	}
	return (person?.single_person || []).map(({uuid, name}) => ({
		uuid,
		utype: UTYPES.PERSON,
		name,
		clickable: true
	}));
}

function formateAreas(item: Row["areas"]["0"]) {
	const {area_name, group_name, scene_name} = item;
	if (scene_name) return scene_name;
	return group_name ? group_name + "-" + area_name : area_name;
}

function formateAlarmTime(row: Row, column: any, val: number) {
	return useDateFormat(val * 1000, "YYYY-MM-DD HH:mm:ss").value;
}

// 假值、区域告警、车辆副卡、服务器设备、巡检名称、点名名称不可点击
function isNameClickable(row: Row) {
	const {utype, device_type, rule_type} = row;
	if (utype === UTYPES.UNKNOWN) return true;
	const alarm_category = getAlarmCategory(rule_type);
	return ![null, undefined, "", "--"].includes(row.name)
		&& utype !== 4
		&& device_type !== 7
		&& alarm_category !== ALARM_CATEGORY.patrol
		&& alarm_category !== ALARM_CATEGORY.call
		&& alarm_category !== ALARM_CATEGORY.area;
}

async function openAlarmMultipleDetailDialog(row: Row, area_item: Row["areas"]["0"]) {
	const alarm_category = getAlarmCategory(row.rule_type);
	if (alarm_category === null || alarm_category === ALARM_CATEGORY.patrol || area_item.type === AreaType.UP_DOWN_PIT_FIRST || area_item.type === AreaType.UP_DOWN_PIT_SECOND) return;
	const {from, areaDetailType, category: category_prop, begin, end, ruleTypeList, tabs, isIncludeCall} = props;
	const {scene_id, scene_name, area_id, area_name, type: area_type, group_id, group_name} = area_item;
	let area_type_name = "";

	if (scene_id) {
		// 场景打开区域详情框(员工、访客、车辆、物资)
		const category = DetailDialogCategoryEnum.SCENE;
		const dialog_props = {
			title: scene_name!,
			scene_id,
		};
		detail_dialog_store.setProps(category, dialog_props);
		detail_dialog_store.toggleVisible(category, true);
	} else if (area_id !== null) {
		// 获取area_type_name，因为告警是历史数据，区域可能已经被删除
		if (area_type === AreaType.VIRTUAL_FENCE) {
			// 已经删除的电子围栏区域调用getAreaArchive接口获取区域类型名
			const area_info = area_id_info.value[area_id];
			if (!area_info) {
				const {data: res} = await getAreaArchives({id: area_id}).catch(() => ({data: undefined}));
				area_type_name = res?.type === 1 ? res.result.area_type_name : "";
			} else {
				area_type_name = area_info.area_type_name!;
			}
		}
		if (areaDetailType === "alarm_category") {
			const category = DetailDialogCategoryEnum.AREA_NAME;
			const dialog_props = {
				flag: isIncludeCall,
				title: area_name!,
				from: ModuleNameEnum.DAY_ALARM_DYNAMIC,
				type: 1,
				id: area_id,
				begin,
				end,
				rule_type_list: ruleTypeList,
				default_tab: category_prop === ALARM_CATEGORY.patrol ? "all" : category_prop,
				area_group_name: group_name ?? "",
				area_type_name,
				tabs,
			};
			detail_dialog_store.setProps(category, dialog_props, ModuleNameEnum.DAY_ALARM_DYNAMIC);
			detail_dialog_store.toggleVisible(category, true);
		} else if (areaDetailType === "tag") {
			const category = DetailDialogCategoryEnum.AREA_NAME;
			const dialog_props = {
				title: area_name!,
				from,
				areas: {[group_id || -1]: [area_id]},
				area_type: area_type!,
			};
			detail_dialog_store.setProps(category, dialog_props);
			detail_dialog_store.toggleVisible(category, true);
		}
	}
}

// 设备type和详情框 category 映射
const device_type_category = {
	[DEVICE_TYPE.base_station]: DetailDialogCategoryEnum.BASE_STATION,
	[DEVICE_TYPE.door]: DetailDialogCategoryEnum.DOOR,
	[DEVICE_TYPE.jf_power]: DetailDialogCategoryEnum.POWER,
	[DEVICE_TYPE.gb_power]: DetailDialogCategoryEnum.POWER,
	[DEVICE_TYPE.ups_power]: DetailDialogCategoryEnum.POWER,
	[DEVICE_TYPE.switch]: DetailDialogCategoryEnum.SWITCH,
	[DEVICE_TYPE.machine]: DetailDialogCategoryEnum.MACHINE,
	[DEVICE_TYPE.traffic_light]: DetailDialogCategoryEnum.TRAFFIC_LIGHT,
	[DEVICE_TYPE.voice_light]: DetailDialogCategoryEnum.VOICE_LIGHT,
} as const;
function openSingleDetailDialog(item: {uuid: Row["uuid"], utype: Row["utype"], device_type?: Row["device_type"], card_id?: Row["card_id"]}) {
	const {from} = props;
	const {uuid, utype, device_type, card_id} = item;
	if (utype != null) {
		const category = DetailDialogCategoryEnum.POSITION_OBJECT;
		const dialog_props: SingleDetailPositionObjProps = {
			from,
			utype: utype as unknown as PositionObjTypeEnum,
			uuid: utype === UTYPES.UNKNOWN ? undefined : uuid as number,
			card_id: utype === UTYPES.UNKNOWN ? card_id : undefined
		};
		detail_dialog_store.setProps(category, dialog_props);
		detail_dialog_store.toggleVisible(category, true);
	} else if (device_type) {
		const category = device_type_category[device_type as keyof typeof device_type_category];
		const dialog_props: SingleDetailDeviceProps = {
			from,
			device_uuid: uuid as string
		};
		detail_dialog_store.setProps(category, dialog_props);
		detail_dialog_store.toggleVisible(category, true);
	}
}

async function handleAllTable() {
	if (!props.tableData.length) return;
	const is_confirm = await MessageBox.confirm("确定一键处理？<br>确定后，将对未处理的告警进行处理", "一键处理", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		dangerouslyUseHTMLString: true,
		closeOnClickModal: false,
		type: "warning",
		customClass: "fk-index-message-box",
		cancelButtonClass: "fk-index-button",
		confirmButtonClass: "fk-index-button"
	}).catch(() => false);
	if (!is_confirm) return;
	handleTable(props.tableData, 1);
}
</script>

<style scoped>
.handle-box {
	box-sizing: border-box;
	padding: 8px;
	border: 1px solid #32496a;
	border-radius: 4px;
	background-color: #071831cc;
	font-size: 14px;
	pointer-events: auto;
}

.handle-btn {
	box-sizing: border-box;
	padding: 4px 8px;
	border-radius: 2px;
	background-color: #56627a35;
	cursor: pointer;
	font-family: "DingTalk JinBuTi", sans-serif;
	color: var(--primary);

	&:hover {
		background-color: #4283ca33;
	}
}
</style>
