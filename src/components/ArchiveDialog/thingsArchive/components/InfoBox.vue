<template>
<div class="info-content">
	<div
		v-if="!props.thingsType"
		class="info-box bind-info"
		:class="{'disabled-click':!btn_handle_auth}"
		@click="bindThings"
	>
		<span><i class="el-icon-plus" />绑定对象</span>
	</div>
	<archive-base-box
		v-else
		class="things-info"
		:class="{'info-box-checked':infoBoxType !== 'card'}"
		:img-param="things_img_info"
		:columns="things_columns"
		:data="props.thingsInfo.base_info || {}"
		@click="changeInfoBoxChecked('things')"
	>
		<template #name>
			<sex-boy
				v-show="show_sex_boy"
				class="sex-boy-icon"
			/>
			<sex-girl
				v-show="show_sex_girl"
				class="sex-girl-icon"
			/>
		</template>
		<template #handleBtn>
			<el-button
				v-if="props.thingsInfo.uuid && history_show_auth"
				plain
				type="primary"
				@click.stop="jumpHistory"
			>
				轨迹回放
			</el-button>
		</template>
	</archive-base-box>

	<archive-base-box
		v-if="props.thingsInfo.card_id"
		class="card-info"
		:class="{'info-box-checked':infoBoxType === 'card'}"
		:columns="card_columns"
		:data="card_info"
		@click="changeInfoBoxChecked('card')"
	>
		<template #card_id>
			<span
				v-show="props.thingsInfo.uuid && btn_handle_auth"
				@click.stop="unbindCard(props.thingsInfo.uuid)"
			>
				<el-tooltip
					placement="top"
					content="解绑"
				>
					<unbind-card-icon
						class="unbind-card-icon"
					/>
				</el-tooltip>
			</span>

			<span
				v-show="props.thingsInfo.uuid && btn_handle_auth"
				@click.stop="changeCard(card_info.card_id)"
			>
				<el-tooltip
					placement="top"
					content="换卡"
				>
					<change-card-icon
						class="change-card-icon"
					/>
				</el-tooltip>
			</span>

			<span class="power-status">
				<electric-quantity
					v-show="card_info.power !== null"
					:quantity="card_info.power"
					:is-lower-power="card_info.low_power_status"
				/>
				<span
					class="card-status"
					:class="{'card-status-offline':card_info.status !== '在线'}"
				>{{ card_info.status }}</span>
			</span>
		</template>
		<template #handleBtn>
			<div v-show="card_handle_auth">
				<el-button
					plain
					type="primary"
					@click.stop="callCardFn(card_info.card_id)"
				>
					呼叫
				</el-button>
				<el-button
					plain
					type="primary"
					@click.stop="leaveCardFn(card_info.card_id)"
				>
					撤离
				</el-button>
				<el-button
					v-if="card_info.is_message"
					plain
					type="primary"
					@click.stop="pushMessageFn(card_info.card_id)"
				>
					消息下发
				</el-button>
				<el-button
					v-if="card_info.is_video"
					plain
					type="primary"
					@click.stop="playVideoFn(card_info.card_id,card_info.map_id)"
				>
					视频
				</el-button>
			</div>
		</template>
	</archive-base-box>
	<div
		v-else
		class="info-box bind-info"
		:class="{'disabled-click':things_is_delete || !btn_handle_auth}"
		@click="changeCard(0)"
	>
		<span><i class="el-icon-plus" />绑定标签卡</span>
	</div>
</div>
</template>
<script setup>
import {computed, inject} from "vue";
import {Notification} from "element-ui";
import {getThingsColumns, useInfoImg, useInfoImgIsShow, useThingAuthUrl, useThingKey, useThingUtype, useThingTypeName} from "../composable/useInfo.js";
import {base_url} from "@/Config";
import {getDayTimeStamp} from "@/utils/js/tools/time";
import {callCard, evacuateAreaByCard} from "@/api/realtime/realTime";
import SexBoy from "~icons/operation/sex-boy.svg";
import SexGirl from "~icons/operation/sex-girl.svg";
import UnbindCardIcon from "~icons/operation/unbind-card.svg";
import ChangeCardIcon from "~icons/operation/change-card.svg";
import ElectricQuantity from "@/components/ElectricQuantity.vue";
import locationJump from "@/utils/js/locationHref";
import FkMessageBox from "@/components/ForThink/FkMessageBox";

import ArchiveBaseBox from "@/components/ArchiveDialog/components/ArchiveBaseBox.vue";

const btn_handle_auth = inject("BTN_HANDLE_AUTH");
const info_auth = inject("INFO_AUTH");

const history_show_auth = computed(() => info_auth.value.history_show_auth);
const card_handle_auth = computed(() => info_auth.value.card_handle_auth);

const props = defineProps({
	thingsInfo: {
		type: Object,
		default() {
			return {};
		},
	},
	thingsType: {
		type: String,
		default() {
			return "";
		},
	},
	thingsDefaultImg: {
		type: String,
		default() {
			return "";
		},
	},
	infoBoxType: {
		type: String,
		default() {
			return "things";
		},
	}
});

const things_img_info = computed(() => {
	const img_info = useInfoImg(props.thingsType);
	let img_src = base_url + props.thingsDefaultImg;
	const base_info = props.thingsInfo.base_info;
	if (base_info && base_info.icon_model_attr) img_src = base_url + base_info.icon_model_attr.model_2d_url;
	if (base_info && base_info[img_info.key]) {
		img_src = base_info[img_info.key].startsWith("data:image/") ? base_info[img_info.key] : (base_url + base_info[img_info.key]);
	}
	const img_show = useInfoImgIsShow(props.thingsType);
	return img_show ? {
		src: img_src,
		name: img_info.name,
		imgBoxClass: "things-img-box",
		imgClass: "things-img"
	} : undefined;
});

const things_columns = computed(() => {
	const columns = getThingsColumns(props.thingsType);
	columns[0].is_click = !things_is_delete.value;
	columns[0].clickFunction = jumpNameSetPage;
	return columns;
});
const show_sex_boy = computed(() => things_columns.value[0]?.sex && props.thingsInfo.base_info?.sex === 2);
const show_sex_girl = computed(() => things_columns.value[0]?.sex && props.thingsInfo.base_info?.sex === 1);
const things_info = computed(() => props.thingsInfo.base_info || {});

const card_columns = computed(() => {
	const card_name = `卡号${props.thingsInfo.truck_slave_card ? "(副卡)" : ""}`;
	const columns = [
		{label: card_name, prop: "card_id", is_click: true, clickFunction: jumpDeviceStatusPage},
		{label: "标签类型", prop: "card_type_name"},
		{label: "所在地图", prop: "map_name", is_click: true, clickFunction: jumpIndex},
		{label: "所在区域", prop: "areas", is_click: true, clickFunction: jumpIndex},
		{label: "基站", prop: "bs_info", is_click: true, clickFunction: openBsArchive},
		{label: "最后定位时间", prop: "last_location_time"},
	];
	return columns;
});

const card_info = computed(() => {
	const info = props.thingsInfo.card_info || {};
	return {
		card_id: props.thingsInfo.card_id,
		map_id: info.floor_id,
		map_name: info.floor_id ? info.map : "--",
		areas: info.areas || [],
		bs_id: info.bs_id,
		bs_name: info.bs_name,
		bs_info: info.bs_id ? `${info.bs_name || "--"}（0x${parseInt(info.bs_id).toString(16)}）` : "--",
		last_location_time: (info.last_location_time) ? info.last_location_time : "--",
		power: info.power,
		low_power_status: info.low_power_status === 1 ? true : false,
		status: info.status,
		is_video: info.is_video,
		is_message: info.is_message_distribution,
		card_type_name: info.type_name || "--",
		device_uuid: info.device_uuid
	};
});

const changeInfoBoxChecked = (type) => {
	const {device_show_auth, things_show_auth} = info_auth.value;
	const has_auth = type === "card" ? device_show_auth : things_show_auth;
	if (!has_auth) {
		Notification({
			title: "错误",
			type: "error",
			message: "没有查看权限"
		});
		return;
	}
	emits("change-info-box-type", type);
};

const things_is_delete = computed(() => props.thingsInfo.base_info?.is_delete);

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

	const type = area_item?.area_id ? "area" : "location";
	const locations = {
		type,
		result: [
			{
				floor_id: data.map_id,
				area_id: area_item?.area_id,
				area_name: area_item?.area_name,
				card_id: data.card_id
			},
		],
	};
	localStorage.setItem("locations", JSON.stringify(locations));
	locationJump("/", true);
};

const jumpNameSetPage = (data) => {
	if (things_is_delete.value) return;
	if (!info_auth.value.things_show_auth) {
		Notification({
			title: "错误",
			type: "error",
			message: "没有查看权限"
		});
		return;
	}
	const key = useThingKey(props.thingsType);
	const url = `${useThingAuthUrl(props.thingsType)}?uuid=${props.thingsInfo["uuid"]}&${key}=${data[key]}`;
	window.open(url);
};

const jumpDeviceStatusPage = (data) => {
	if (!data.card_id) return;
	if (!info_auth.value.device_show_auth) {
		Notification({
			title: "错误",
			type: "error",
			message: "没有查看权限"
		});
		return;
	}
	window.open(`/deviceManage#/status?device_name=label&card_id=${data.card_id}`);
};

const openBsArchive = (data) => {
	if (!data.device_uuid) return;
	if (!info_auth.value.device_show_auth) {
		Notification({
			title: "错误",
			type: "error",
			message: "没有查看权限"
		});
		return;
	}
	emits("open-bs-archive", data.device_uuid);
};

const jumpHistory = () => {
	const uuid = props.thingsInfo["uuid"];
	const card_id = props.thingsInfo["card_id"] || "";
	const type_name = props.thingsType === "visitor" ? "visitor_name" : useThingTypeName(props.thingsType);
	const type_value = things_info.value[type_name];
	const type_id = useThingUtype[props.thingsType];
	const floor_id = "";
	const url = `/history#/person?uuid=${uuid}&card_id=${card_id}&${type_name}=${type_value}&start=${getDayTimeStamp().start / 1000}&end=${parseInt(Date.parse(new Date()) / 1000)}&type=${type_id}&floor_id=${floor_id}`;
	window.open(url);
};

const callCardFn = (card_id) => {
	callCard({card_id_list: [card_id]}).then((res) => {
		if (res.data.type === 1) {
			Notification({
				title: "成功",
				type: "success",
				message: "呼叫成功"
			});
		} else {
			Notification({
				title: "错误",
				type: "error",
				message: res.data.result
			});
		}
	});
};

const leaveCardFn = (card_id) => {
	FkMessageBox.confirm("撤离", "确定撤离？", "确定后，将对定位标签下发撤离指令").then(() => {
		evacuateAreaByCard({card_id_list: [card_id]}).then((res) => {
			if (res.data.type === 1) {
				Notification({
					title: "成功",
					type: "success",
					message: "撤离成功"
				});
			} else {
				Notification({
					title: "错误",
					type: "error",
					message: res.data.result
				});
			}
		});
	}).catch(() => {
	});
};

const unbindCard = (uuid) => {
	emits("unbind-card", uuid, props.thingsType);
};

const changeCard = (card) => {
	if (things_is_delete.value || !btn_handle_auth.value) return;
	emits("change-card", card);
};

const bindThings = () => {
	if (!btn_handle_auth.value) return;
	emits("bind-things");
};

const pushMessageFn = (card_id) => {
	emits("push-message", card_id);
};

const playVideoFn = (card_id, floor_id) => {
	const tag_info = props.thingsType ? things_info.value[useThingTypeName(props.thingsType)] : undefined;
	emits("play-video", card_id, floor_id, tag_info);
};

const emits = defineEmits(["change-card", "unbind-card", "bind-things", "push-message", "play-video", "open-bs-archive"]);
defineExpose({changeInfoBoxChecked});

</script>
<style scoped lang="scss">
	:deep(.things-img-box){
		width: 180px;
		height: 180px;
	}
	:deep(.things-img) {
		width: 88px !important;
		height: 88px !important;
	}
    .info-content {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
        .info-box {
			width: 430px;
			height: 212px;
            box-sizing: border-box;
            padding: 16px;
			border-radius: 5px;
			border: 1px solid #E5E9EC;
			background: #FBFDFF;
			color: #a2b2c2;
        }

		.things-info {
			width: 430px;
			height: 212px;
			:deep(.list-box) {
				padding-top: 14px;
				position: relative;
				p {
					margin-top: 4px;
					margin-bottom: 18px;
					&:first-child{
						.custom-ellipsis{
							max-width: 170px;
						}

					}
				}
				button.el-button {
					position: absolute;
					bottom: 0;
				}
			}

			.sex-boy-icon {
				margin-left: 6px;
				vertical-align: top;
				color: #29A2FF;
			}
			.sex-girl-icon {
				margin-left: 6px;
				vertical-align: top;
				color: #E773B8;
			}
		}
        .card-info {
			width: 430px;
			height: 212px;
			:deep(.list-box) {
				p {
					margin-top: 0;
					margin-bottom: 9px;
				}
			}

		}
        .things-info:hover,
		.card-info:hover {
			box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.08);
			cursor: pointer;
			position: relative;
			top: -4px;
		}
		.info-box-checked {
			border-top-width: 4px;
            padding-top: 12px;
            background-color: #F5F9FC;
		}
		.bind-info {
			text-align: center;
			line-height: 180px;
			span i{
				margin-right: 5px;
			}

		}

	}

	.custom-theme-blue .bind-info:hover {
		position: relative;
		top: -4px;
		cursor: pointer;
		border:1px dashed #07f;
		color: #07F;
	}

	.custom-theme-green .bind-info:hover {
		position: relative;
		top: -4px;
		cursor: pointer;
		border:1px dashed #3eb2a9;
		color: #3eb2a9;
	}

	.custom-theme-blue .disabled-click:hover,
	.custom-theme-green .disabled-click:hover {
		position: static;
		cursor:not-allowed;
		border: 1px solid #E5E9EC;
		background: #FBFDFF;
		color: #a2b2c2;
	}

	.custom-theme-blue .info-box-checked {
		border-top-color: #07F;
	}

	.custom-theme-blue .change-card-icon,
	.custom-theme-blue .clickable-color {
		color: #07F;
	}

	.custom-theme-green .info-box-checked {
		border-top-color: #3eb2a9;
	}

	.custom-theme-green .change-card-icon,
	.custom-theme-green .clickable-color {
		color: #3eb2a9;
	}

	.change-card-icon{
		vertical-align: text-bottom;
		margin-left: 10px;
	}
	.custom-theme-blue .change-card-icon:hover {
		background-color: rgba(0, 119, 255, 0.1);
	}

	.custom-theme-green .change-card-icon:hover {
		background-color: rgba(62, 178, 169, 0.1);
	}

	.unbind-card-icon{
		vertical-align: text-bottom;
		color: #F56C6C;
		margin-left: 10px;
	}

	.unbind-card-icon:hover {
		background-color: rgba(245, 108, 108, 0.1);
	}

	.power-status {
		float: right;
		display: flex;
		align-items: center;
	}
	.card-status {
		margin-left: 5px;
		color: #62BF33;
	}
	.card-status-offline {
		color:#F55F5F;
	}

	button.el-button {
		height: 24px !important;
		padding: 5px 12px !important;
	}

</style>
