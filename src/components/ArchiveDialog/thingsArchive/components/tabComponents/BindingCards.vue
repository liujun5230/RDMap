<template>
<div class="binding-cards">
	<fk-table
		v-loading="loading"
		:data="table_data"
		:max-height="table_max_height"
	>
		<el-table-column
			prop="index"
			label="序号"
			type="index"
		/>
		<el-table-column
			prop="card_type"
			label="主/副卡"
		/>
		<el-table-column
			prop="card_id"
			label="卡号"
		/>
		<el-table-column
			v-if="btn_handle_auth"
			prop="operate"
			label="操作"
		>
			<template #default="{row}">
				<el-tooltip
					effect="dark"
					content="设为主卡"
					placement="top"
				>
					<fk-table-button
						v-if="row.card_type !== '主卡'"
						type="primary"
						plain
						class="handle-icon-btn"
						circle
						size="mini"
						@click="setMain(row.card_id)"
					>
						<set-main-card />
					</fk-table-button>
				</el-tooltip>
				<el-tooltip
					effect="dark"
					content="换卡"
					placement="top"
				>
					<fk-table-button
						type="primary"
						plain
						class="handle-icon-btn"
						circle
						size="mini"
						@click="changeCard(row.card_id)"
					>
						<swap-card />
					</fk-table-button>
				</el-tooltip>
				<el-tooltip
					effect="dark"
					content="解绑"
					placement="top"
				>
					<fk-table-button
						type="danger"
						class="handle-icon-btn"
						circle
						size="mini"
						plain
						@click="unbind(row.card_id)"
					>
						<unbind-icon />
					</fk-table-button>
				</el-tooltip>
			</template>
		</el-table-column>
	</fk-table>
	<div v-if="btn_handle_auth && !things_is_del">
		<el-button
			icon="el-icon-plus"
			type="text"
			size="mini"
			class="text-btn"
			plain
			@click="addCard"
		>
			添加卡号
		</el-button>
	</div>
</div>
</template>

<script setup>
import FkTable from "@/components/ForThink/Table/FkTable.vue";
import {computed, inject, ref, onMounted, onUnmounted} from "vue";
import FkTableButton from "@/components/ForThink/Table/FkTableButton.vue";
// import store from "@/store";
import {MessageBox, Notification} from "element-ui";
import {liftedTruck, updateTruck} from "@/api/truck/truck";
import {useEventBus} from "@vueuse/core";
import SetMainCard from "~icons/operation/set-main";
import SwapCard from "~icons/operation/swap-card";
import UnbindIcon from "~icons/operation/unbind";

const archive_info = inject("ARCHIVE_INFO");
const btn_handle_auth = inject("BTN_HANDLE_AUTH");
const archive_uuid = inject("ARCHIVE_UUID");
const dialog_key = inject("DIALOG_KEY");

const things_is_del = computed(() => archive_info.value?.is_delete);
const table_data = computed(() => {
	if (!archive_info.value?.card_id) return [];
	const list = [{card_id: archive_info.value.card_id, card_type: "主卡"}];
	archive_info.value?.slave_card_ids?.map(card_id => {
		list.push({card_id, card_type: "副卡"});
	});
	return list;
});
const loading = ref(false);
let is_change_card = false;
let replaced_card_id; // 被换的卡
const table_max_height = ref("384px");

const unbind = (card_id) => {
	MessageBox.confirm("是否确定解绑该项？", "提示", {
		closeOnClickModal: false,
		type: "warning",
		confirmButtonText: "确定",
		cancelButtonText: "取消"
	}).then(async () => {
		loading.value = true;
		const uuid = archive_uuid.value;
		const card = card_id === archive_info.value.card_id ? undefined : card_id; // 解绑的是主卡就不传card_id
		const {data: {type, result}} = await liftedTruck({uuid, delete_flag: 0, card_id: card});
		if (type === 1) {
			Notification({
				type: "success",
				title: "成功",
				message: "解绑成功"
			});
			useEventBus("update_card_info_" + dialog_key).emit(result);
		}
		useEventBus("update_info_" + dialog_key).emit(uuid);
		loading.value = false;
	}).catch(() => {});
};

const setMain = (card_id) => {
	MessageBox.confirm("是否确定设为主卡？", "提示", {
		closeOnClickModal: false,
		type: "warning",
		confirmButtonText: "确定",
		cancelButtonText: "取消"
	}).then(() => {
		loading.value = true;
		const uuid = archive_uuid.value;
		const slave_card_ids = [...archive_info.value.slave_card_ids.filter(id => id !== card_id), archive_info.value.card_id];
		const licence = archive_info.value.licence;
		updateTruck({
			card_id,
			slave_card_ids,
			uuid,
			type: 1,
			licence
		}).then(({data: {type}}) => {
			if (type === 1) {
				Notification({
					type: "success",
					title: "成功",
					message: "设为主卡成功"
				});
				useEventBus("update_card_info_" + dialog_key).emit(card_id);
			}
		}).finally(() => {
			useEventBus("update_info_" + dialog_key).emit(uuid);
			loading.value = false;
		});
	}).catch(() => {});
};

const changeCard = (card_id) => {
	replaced_card_id = card_id;
	is_change_card = true;
	const data = getChangeCardData();
	// emits("click-change-card", card_id, data);
	useEventBus("click_change_card_" + dialog_key).emit({change_card: card_id, ...data});
};

const addCard = () => {
	replaced_card_id = null;
	is_change_card = false;
	const data = getChangeCardData();
	useEventBus("click_change_card_" + dialog_key).emit({change_card: 0, ...data});
	// emits("click-change-card", 0, data);
};

const getChangeCardData = () => {
	return {
		uuid: archive_uuid.value,
		licence: archive_info.value.licence,
		is_change_card,
		replaced_card_id,
		card_id: archive_info.value.card_id,
		slave_card_ids: archive_info.value.slave_card_ids,
	};
};

const setMaxHeight = () => {
	const body_height = document.body.offsetHeight;
	if (body_height > 930) {
		table_max_height.value = "384px";
	} else {
		table_max_height.value = (body_height - 546) + "px";
	}
};

// const emits = defineEmits(["click-change-card"]);

onMounted(() => {
	setMaxHeight();
});

window.addEventListener("resize", setMaxHeight);

onUnmounted(() => {
	window.removeEventListener("resize", setMaxHeight);
});
</script>

<style scoped lang="scss">
.el-dialog__wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
}

.binding-cards {
	padding: 16px 16px 0 16px;
	display:flex;
	flex-direction:column;

	.fk-table {
		margin-bottom: 12px;
		flex: none;
	}

	.text-btn {
		border-color: transparent !important;
		background-color: transparent !important;
		height: 26px;
		padding: 0 !important;
		box-shadow: none;
	}

	:deep(.op-icon-set-main),
	:deep(.op-icon-change-card) {
		font-size: 18px;
	}
}

.custom-theme-green .binding-cards{
	.text-btn {
		&:focus,
		&:hover {
			color: #288F87;
		}
		&:active {
			color: #166b65;
		}
	}
}

.custom-theme-blue .binding-cards{
	.text-btn {
		color: #07f;
		&:focus,
		&:hover {
			color: #1160BB;
		}
		&:active {
			color: #23488a;
		}
	}
}
</style>
