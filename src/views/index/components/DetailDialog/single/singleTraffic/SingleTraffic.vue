<template>
<div class="traffic-drawer-content">
	<module-header title="设备">
		<template #operate>
			<div class="flex justify-between items-center gap-[8px]">
				<fk-icon
					class="text-minor-2 cursor-pointer hover-icon hover:text-minor-1"
					tip="定位"
					:size="small ? 20 : 28"
					@click="onDeviceLocation({device_uuid})"
				>
					<location-icon />
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

	<detail-box-loading v-if="loading" />
	<div
		v-else
		class="traffic-content"
	>
		<descriptions-title
			class="mt-[20px] flex-none"
			title="基本信息"
		/>

		<div class="mt-[12px] px-[12px] py-[8px] rounded-[4px] bg-[#3749637f] flex">
			<div class="avatar mr-[12px]">
				<img
					class="w-[48px] h-[48px]"
					:src="avatar_url"
				>
			</div>
			<descriptions-list
				class="py-[5px] flex-1"
				:columns="[
					{label: '设备名称', prop: 'name'},
					{label: '设备类型', prop: 'type'},
				]"
				:data="detail_data"
			/>
		</div>

		<descriptions-list
			class="mt-[12px]"
			:columns="[
				{label: '显示状态', prop: 'show_status', type: 'picture', className: 'show-status', formatter: formateShowStatus, empty_text: '无'},
				{label: '通信基站ID', prop: 'bs_addr', formatter: (val) => getHexStringFromIntLower(val)},
			]"
			:data="detail_data"
		/>

		<descriptions-title
			class="mt-[20px] flex-none"
			title="位置数据"
		/>

		<div class="mt-[12px] border-box px-[12px] py-[8px] rounded-[4px] bg-[#3749637f] flex justify-between items-center">
			<descriptions-list
				:columns="[{label: '设备ID', prop: 'device_id'}]"
				:data="detail_data"
			/>
			<div
				class="border-box leading-none px-[5px] py-[4px] rounded-[4px] text-[0.875rem]"
				:style="formatDeviceStatus(detail_data.status).style"
			>
				{{ formatDeviceStatus(detail_data.status).status }}
			</div>
		</div>

		<descriptions-list
			class="mt-[12px]"
			:columns="device_location_descriptions_columns"
			:data="detail_data"
		>
			<template #areas="{value}">
				<span
					class="after:content-[':'] text-minor-2 mr-[8px] flex-none"
					:class="[small ? 'text-[12px]' : 'text-[14px]']"
				>所在区域</span>
				<text-ellipsis
					v-if="formatAreas(value).length"
					class="align-bottom"
				>
					<span
						v-for="(item) in formatAreas(value)"
						:key="item.area_id"
						class="link name-split"
						:class="[small ? 'text-[14px]' : 'text-[16px]']"
						@click="onAreaDetailDialog(item)"
					>
						{{ item.area_name }}
					</span>
				</text-ellipsis>
				<span
					v-else
					:class="[small ? 'text-[14px]' : 'text-[16px]']"
				>
					未在电子围栏区域
				</span>
			</template>
		</descriptions-list>

		<div class="control-setting-title">
			<descriptions-title
				title="控制设置"
				class="flex-none"
			/>
			<fk-index-button
				v-if="auth.handle"
				type="primary"
				size="mini"
				@click="openRuleDialog()"
			>
				<i class="el-icon-plus" />
				新增单灯控制规则
			</fk-index-button>
		</div>

		<div class="table-wrap">
			<el-table
				class="fk-index-table"
				:class="{small}"
				height="100%"
				max-height="100%"
				:data="table_data"
				stripe
				border
			>
				<el-table-column
					type="index"
					label="序号"
					width="45"
				/>
				<el-table-column
					prop="rule_name"
					label="规则名称"
					:show-overflow-tooltip="false"
				>
					<template #default="{row, column}">
						<text-ellipsis
							style="width: 100%"
							class="link"
							@click="openRuleDialog(row)"
						>
							{{ row[column.property] }}
						</text-ellipsis>
					</template>
				</el-table-column>
				<fk-light-table-column
					prop="left_light"
					label="左转灯"
					show-overflow-tooltip
				/>
				<fk-light-table-column
					prop="straight_light"
					label="直行灯"
					show-overflow-tooltip
				/>
				<fk-light-table-column
					prop="right_light"
					label="右转灯"
					show-overflow-tooltip
				/>
				<el-table-column
					prop="effective_time"
					label="生效时间"
					show-overflow-tooltip
					:min-width="effective_time_min_width"
					:formatter="formatEffectiveTime"
				/>
				<el-table-column
					v-if="auth.delete"
					label="操作"
					width="66px"
				>
					<template #default="{row}">
						<fk-index-button
							size="mini"
							type="danger"
							@click="deleteRule(row)"
						>
							删除
						</fk-index-button>
					</template>
				</el-table-column>
				<template #empty>
					<empty-placeholder />
				</template>
			</el-table>
		</div>
	</div>

	<traffic-rule-dialog
		v-model="traffic_rule_dialog_data.visible"
		:rule-id="traffic_rule_dialog_data.id"
		:mode.sync="traffic_rule_dialog_data.mode"
		:device-name="detail_data.name"
		:device-id="detail_data.device_id"
		:addr-id="detail_data.bs_addr"
		:left-enable-status="detail_data.left_light_status"
		:straight-enable-status="detail_data.straight_light_status"
		:right-enable-status="detail_data.right_light_status"
		@save-success="handleSaveSuccess"
	/>
</div>
</template>

<script setup lang="ts">
import {shallowRef, computed, watch, ref} from "vue";
import {useTimeoutPoll, useDateFormat} from "@vueuse/core";
import {Notification, MessageBox} from "element-ui";

import {base_url} from "@/Config";
import {DIALOG_MODE} from "@/components/Dialog/constant";
import TextEllipsis from "@/components/TextEllipsis.vue";
import FkLightTableColumn from "@/components/ForThink/Table/FkLightTableColumn.vue";
import FkIcon from "@/components/ForThink/FkIcon.vue";
import LocationIcon from "~icons/operation/location";
import CloseIcon from "~icons/operation/stroke-close";
import type {TrafficLightDetailResult} from "@/api/homepage/device";
import {getTrafficLightDetail} from "@/api/homepage/device";
import {deleteVoiceLightRule} from "@/api/device/record";
import {small} from "@/utils/ts/breakpoints";
import {getHexStringFromIntLower} from "@/utils/js/common";

import {poll_interval} from "@index/utils/config";
import ModuleHeader from "@index/components/ModuleHeader.vue";
import {FkIndexButton} from "@index/components/buttons";
import EmptyPlaceholder from "@index/components/EmptyPlaceholder.vue";
import {useDetailDialogStore} from "@index/store/useDetailDialogStore";
import type {SingleDetailDeviceProps, SingleDetailDeviceCategory} from "@index/store/useDetailDialogStore";

import DetailBoxLoading from "../../components/DetailBoxLoading.vue";
import DescriptionsTitle from "../../components/DescriptionsTitle.vue";
import DescriptionsList from "../../components/DescriptionsList.vue";
import {onDeviceLocation} from "../../composable/onClickLocation";
import {onAreaDetailDialog} from "../../composable/onDetailDialog";
import {device_location_descriptions_columns, formatAreas} from "../../constant";
import TrafficRuleDialog from "./TrafficRuleDialog.vue";
import {LIGHT} from "@/utils/js/constant";
import {usePageAuth} from "@/utils/js/authentication";

interface Props {
	category: SingleDetailDeviceCategory
}
const props = defineProps<Props>();

const loading = ref(true);
type TableRow = TrafficLightDetailResult["rules"]["0"];
const table_data = shallowRef<TableRow[]>([]);

const traffic_rule_dialog_data = ref({
	visible: false,
	id: 0,
	mode: DIALOG_MODE.add
});

const detail_dialog_store = useDetailDialogStore();
const dialog = computed(() => detail_dialog_store.getDialog(props.category));
const dialog_props = computed(() => dialog.value.props as SingleDetailDeviceProps);
const device_uuid = computed(() => dialog_props.value.device_uuid);
// const table_height = computed(() => (table_data.value.length * 40 || 94) + 34 + 16);
const effective_time_min_width = computed(() => (table_data.value.length ? "340px" : "88px"));

const detail_data = shallowRef<TrafficLightDetailResult>({} as TrafficLightDetailResult);
const avatar_url = computed(() => detail_data.value.photo ? `${base_url}${detail_data.value.photo}` : "");
const auth = usePageAuth("/deviceManage#/setting");

const {pause, resume} = useTimeoutPoll(fetchDetailData, poll_interval, {immediate: false});

watch(() => dialog.value.visible, () => {
	if (dialog.value.visible) {
		resume();
	} else {
		pause();
	}
}, {immediate: true});

function closeDialog() {
	detail_dialog_store.toggleVisible(props.category, false);
}

function formateShowStatus(val: any, col: any, data: any) {
	const assert_data = data as TrafficLightDetailResult;
	const {left_light = LIGHT.NOT_EXISTS, straight_light = LIGHT.NOT_EXISTS, right_light = LIGHT.NOT_EXISTS} = assert_data ?? {};
	if (left_light === LIGHT.NOT_EXISTS && straight_light === LIGHT.NOT_EXISTS && right_light === LIGHT.NOT_EXISTS) return undefined;
	return `${base_url}/iot/resources/traffic_light_picture/${left_light}${straight_light}${right_light}.png`;
}

function formatEffectiveTime(row: TableRow) {
	const {begin, end} = row;
	if (!begin || !end) return "--";
	const begin_str = useDateFormat(begin * 1000, "YYYY-MM-DD HH:mm:ss").value;
	const end_str = useDateFormat(end * 1000, "YYYY-MM-DD HH:mm:ss").value;
	return `${begin_str}至${end_str}`;
}

const online_style = {background: "rgba(105, 214, 109, 0.10)", color: "#69d66d"};
const offline_style = {background: "rgba(178, 196, 219, 0.10)", color: "var(--text-minor-1)"};
function formatDeviceStatus(val: number) {
	return {
		status: val ? "在线" : "离线",
		style: val ? online_style : offline_style
	};
}

function openRuleDialog(row?: TableRow) {
	traffic_rule_dialog_data.value = {
		visible: true,
		id: row?.rule_index ?? 0,
		mode: row ? DIALOG_MODE.view : DIALOG_MODE.add
	};
}

async function fetchDetailData() {
	const {data: res} = await getTrafficLightDetail({device_uuid: device_uuid.value}).catch(() => ({data: undefined}));
	loading.value = false;
	if (res?.type === 1) {
		detail_data.value = res.result;
		table_data.value = res.result.rules;
	}
}

async function deleteRule(row: TableRow) {
	pause();
	const is_confirm = await MessageBox.confirm("<p>确定删除？<p><p style='color: var(--text-minor-2)'>删除后不可恢复，请谨慎操作<p>", "删除", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		dangerouslyUseHTMLString: true,
		closeOnClickModal: false,
		type: "warning",
		customClass: "fk-index-message-box",
		cancelButtonClass: "fk-index-button",
		confirmButtonClass: "fk-index-button"
	}).catch(() => false);
	if (!is_confirm) return resume();
	const {data: res} = await deleteVoiceLightRule({id_list: [row.rule_index]}).catch(() => ({data: undefined}));
	resume();
	if (res?.type === 1) {
		Notification.success({title: "成功", message: "删除成功"});
	} else {
		Notification.error({title: "错误", message: res?.result || "删除失败"});
	}
}

async function handleSaveSuccess() {
	pause();
	await fetchDetailData();
	resume();
}
</script>

<style scoped>
.avatar {
	width: 58px;
	height: 58px;
	display: flex;
	justify-content: center;
	align-items: center;
}

:deep(.show-status) img {
	height: 24px;
	position: relative;
	bottom: 3px;
}

.traffic-drawer-content {
	height: 100%;
	display: flex;
	flex-direction: column;

	:deep(.module-header) {
		flex: 0 0 auto;
	}
}

.traffic-content {
	flex: 1 1 100%;
	display: flex;
	flex-direction: column;

	.table-wrap {
		flex: 1 1 100%;
		position: relative;

		.fk-index-table {
			position: absolute;
		}
	}
}

.control-setting-title {
	display: flex;
	justify-content: space-between;
	margin: 24px 0 12px;
}
</style>
