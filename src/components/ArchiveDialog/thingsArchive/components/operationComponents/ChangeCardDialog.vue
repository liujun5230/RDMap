<template>
<el-dialog
	:visible.sync="is_show_dialog"
	:title="change_card_title"
	width="436px"
	append-to-body
	:close-on-click-modal="false"
	@opened="onDialogOpened"
	@closed="change_card.clearValidate()"
>
	<el-form
		ref="change_card"
		class="change-card-form"
		label-position="top"
		size="small"
		:rules="form_data.rules"
		:model="form_data"
		@submit.native.prevent
	>
		<card-reader
			ref="card_reader_ref"
			reader-type="Tag"
			@onmessage="onReadCard"
		/>
		<el-form-item
			label="卡号"
			prop="card"
		>
			<el-input
				v-model="form_data.card"
				size="middle"
				:class="is_change_card_input_red ? 'el-input-red' : ''"
				placeholder="请输入卡号"
			/>
			<p
				v-if="is_card_used"
				class="card-using"
			>
				此卡已被绑定<span class="tips">（<text-ellipsis
					class="custom-ellipsis"
				><span
						class="clickable-text"
						:class="{'disabled-click-text':is_same_things}"
						@click="openArchiveDialog"
					>{{ tips }}</span>
					<template #tooltip>
						<span
							:class="!is_same_things?'tooltip-clickable-text':'tooltip-general-label'"
							@click="openArchiveDialog"
						>{{ tips }}</span>
					</template>
				</text-ellipsis>）</span>，请重新输入卡号
			</p>
		</el-form-item>
	</el-form>

	<span
		slot="footer"
	>
		<el-button
			plain
			size="small"
			@click="closeDialog"
		>
			取消
		</el-button>
		<el-button
			type="primary"
			size="small"
			@click="saveChangeCard"
		>
			保存
		</el-button>
	</span>
	<archive-dialog
		ref="archive_dialog_ref"
		@close-archive-dialog="clickCloseArchiveDialog"
	/>
</el-dialog>
</template>
<script setup>
import {cardUsable} from "@/api/visitor/visitor";
import {MAX_CARD_ID} from "@/utils/js/common";
import CardReader from "./CardReader.vue";
import {ref, watch, computed, inject} from "vue";
import ArchiveDialog from "@/components/ArchiveDialog/ArchiveDialog.vue";
import TextEllipsis from "@/components/TextEllipsis.vue";

const checkCard = (rule, value, callback) => {
	if (parseInt(value) === 0) {
		return callback(new Error("卡号不能为0"));
	}
	if (!value) {
		return callback(new Error("请输入卡号"));
	}
	setTimeout(() => {
		if (/^[0-9]*$/.test(value)) {
			if (value > MAX_CARD_ID) {
				callback(new Error(`卡号不能超过${MAX_CARD_ID}`));
			} else {
				callback();
			}
		} else {
			callback(new Error("卡号只能由数字组成"));
		}
	}, 200);
};

const archive_uuid = inject("ARCHIVE_UUID");

const is_show_dialog = ref(false);
const can_change_card = ref(false);
const is_card_used = ref(false);
const is_change_card_input_red = ref(false);
const tips = ref("");
let timer = null;
const archive_dialog_ref = ref();

const form_data = ref({
	card: "",
	rules: {
		card: [{required: true, validator: checkCard, trigger: "blur"}]
	},
});
const change_card_title = ref("绑卡");
const change_card = ref();
const card_reader_ref = ref();
const bind_uuid = ref(0);
const is_same_things = computed(() => bind_uuid.value === archive_uuid.value);
const is_truck_change = ref(false);
watch(
	() => form_data.value.card,
	(val) => {
		checkBindCard(val);
	}
);

watch(
	() => is_card_used.value,
	(val) => {
		is_change_card_input_red.value = !!val;
	}
);

function checkBindCard(val) {
	if (val && /^[0-9]*$/.test(val) && parseInt(val) !== 0) {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		timer = setTimeout(async () => {
			const res = await cardUsable({card_id: val});
			bind_uuid.value = 0;
			if (res.data.type === 1) {
				const flag = res.data.result.flag;
				if (flag || !res.data.result.msg) {
					is_card_used.value = false;
					can_change_card.value = true;
					tips.value = "";
					change_card.value.clearValidate();
				} else {
					bind_uuid.value = res.data.result.uuid;
					is_card_used.value = true;
					can_change_card.value = false;
					tips.value = res.data.result.msg;
					change_card.value.clearValidate();
				}
			} else {
				tips.value = res.data.result;
				can_change_card.value = false;
			}
		}, 200);
	} else {
		tips.value = "";
		is_card_used.value = false;
	}
}

function openArchiveDialog() {
	if (is_same_things.value) return;
	if (bind_uuid.value) {
		archive_dialog_ref.value?.openArchiveDialog({uuid: bind_uuid.value});
	}
}

function onReadCard(data) {
	form_data.value.card = data;
}

function saveChangeCard() {
	change_card.value.validate(async (valid) => {
		if (valid) {
			if (!can_change_card.value) {
				return;
			}
			emits("save-change-card", form_data.value.card, is_truck_change.value);
			is_show_dialog.value = false;
		}
	});
}

function showDialog(card_id, is_truck) {
	form_data.value.card = "";
	is_truck_change.value = is_truck;
	if (is_truck) {
		change_card_title.value = card_id ? "换卡" : "添加卡号";
	} else {
		change_card_title.value = card_id ? "换卡" : "绑卡";
	}
	tips.value = "";
	is_show_dialog.value = true;
}

function onDialogOpened() { // 在showDialog拿不到ref
	card_reader_ref.value.connectID();
}

function closeDialog() {
	is_show_dialog.value = false;
	card_reader_ref.value.resetReader();
}

function clickCloseArchiveDialog() {
	checkBindCard(form_data.value.card);
}

const emits = defineEmits(["save-change-card"]);
defineExpose({showDialog});
</script>

<style scoped>
.el-dialog__wrapper {
	display: flex;
	justify-content: center;
	align-items: center;
}

.custom-theme-blue .download-link,
.custom-theme-blue .tips {
	color: #07f;
}

.custom-theme-green .download-link,
.custom-theme-green .tips {
	color: #3eb2a9;
}

.download-link {
	text-decoration: underline;
	cursor: pointer;
}

.change-card-form .el-form-item {
	margin-bottom: 18px !important;
}

.change-card-form .sub-title {
	background-color: rgba(230, 162, 60, 0.10);
    border-radius: 5px;
	margin-bottom: 16px !important;
}

.el-icon-warning {
	color: #E6A23C;
	padding-left: 8px;
}

:deep( .el-form-item__label) {
	line-height: 14px !important;
	padding: 0 0 8px !important;
}

:deep(.el-input-red) .el-input__inner {
	border-color: #F56C6C;
	margin-bottom: 20px;
}

.card-using {
	color: #F56C6C;
	font-size: 12px;
	line-height: 2;
	position: absolute;
	bottom: -22px;
}

.tips-scan {
	margin-left: 5px;
	color: #ccc;
}

.btn-aid {
	height: 24px;
	padding: 5px 15px !important;
	margin-left: 8px !important;
	font-size: 12px;
}
.disabled-click-text {
	color:#D1D8E1 !important;
	cursor: not-allowed !important;
	text-decoration: none !important;
}

.custom-theme-blue  .tooltip-clickable-text{
	text-decoration: none;
	color: #66ADFF;
	cursor: pointer;
}

.custom-ellipsis {
	max-width: 150px;
	vertical-align: bottom;
}

.custom-theme-green  .tooltip-clickable-text{
	text-decoration: none;
	color: #3EB2A9;
	cursor: pointer;
}

.tooltip-clickable-text:hover{
	text-decoration: underline;
	text-underline-offset: 2px;
}

.tooltip-general-label {
	color:#fff;
	cursor: context-menu;
}

</style>
