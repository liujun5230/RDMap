<template>
<div
	ref="main_content_ref"
	class="main-content"
>
	<el-form
		ref="card_form_ref"
		size="small"
		label-position="top"
		:rules="rules"
		:model="edit_card_panel"
	>
		<div class="base-info">
			<el-form-item
				label="卡号"
				prop="card_id"
			>
				<el-input
					v-model="edit_card_panel.card_id"
					disabled
				/>
			</el-form-item>
			<el-form-item
				label="标签类型"
				prop="card_type_id"
			>
				<el-select
					v-model="edit_card_panel.card_type_id"
					:disabled="edit_card_panel.can_not_edit"
					placeholder="请选择"
				>
					<el-option
						v-for="item in type_list"
						:key="item.id"
						:label="item.type_name"
						:value="item.id"
					/>
				</el-select>
			</el-form-item>
		</div>
	</el-form>
	<div
		v-if="btn_handle_auth"
		class="handle-btn"
		:class="{'handle-btn-panel':isScrolling || !arrivedState.top}"
	>
		<el-button
			v-show="edit_card_panel.can_not_edit"
			plain
			type="primary"
			@click="startEditCard"
		>
			编辑
		</el-button>
		<el-button
			v-show="!edit_card_panel.can_not_edit"
			plain
			@click="cancelEdit"
		>
			取消
		</el-button>
		<el-button
			v-show="!edit_card_panel.can_not_edit"
			v-preventRepeatClick
			type="primary"
			@click="saveCard"
		>
			保存
		</el-button>
	</div>
</div>
</template>
<script setup>
import {Notification} from "element-ui";
import {ref, computed, inject, watch} from "vue";
import {getCardType, updateTagType} from "@/api/device/deviceCard";
import {useScroll, useEventBus} from "@vueuse/core";

const archive_card_info = inject("ARCHIVE_CARD_INFO");
const info_auth = inject("INFO_AUTH");
const archive_card = inject("ARCHIVE_CARD");
const dialog_key = inject("DIALOG_KEY");

const btn_handle_auth = computed(() => info_auth.value.card_handle_auth);

const main_content_ref = ref();
const {isScrolling, arrivedState} = useScroll(main_content_ref);

const card_form_ref = ref();
const type_list = ref([]);

const rules = {
	card_id: [
		{required: true, message: "请输入卡号", trigger: "blur"}
	],
	card_type_id: [
		{required: true, message: "请选择标签类型", trigger: "change"}
	],

};

const getDefaultFormData = () => {
	return {
		can_not_edit: false,
		card_id: 0,
		card_type_id: "",
	};
};

const edit_card_panel = ref(getDefaultFormData());

const editCard = (data) => {
	edit_card_panel.value.can_not_edit = true;
	edit_card_panel.value.card_id = archive_card.value;
	edit_card_panel.value.card_type_id = data.card_type_id;
};

const startEditCard = () => {
	edit_card_panel.value.can_not_edit = false;
};

const cancelEdit = () => {
	editCard(archive_card_info.value);
};

const saveCard = () => {
	card_form_ref.value?.validate(async (valid) => {
		if (valid) {
			const data = {
				card_id: edit_card_panel.value.card_id,
				card_type_id: edit_card_panel.value.card_type_id
			};
			const res = await updateTagType(data);
			if (res.data.type === 1) {
				Notification({
					type: "success",
					title: "成功",
					message: "修改标签类型成功"
				});
			} else {
				Notification({
					type: "error",
					title: "错误",
					message: res.data.result
				});
			}
			useEventBus("update_card_info_" + dialog_key).emit(data.card_id);
		} else {
			console.log("验证失败");
		}
	});
};

const fetchCardType = async() => {
	const {data: res} = await getCardType().catch(() => ({}));
	if (res?.type === 1) {
		const {data} = res.result;
		type_list.value = [...data];
	}
};

fetchCardType();

watch(() => archive_card_info.value, (value) => {
	if (value) {
		editCard(archive_card_info.value);
	}
}, {
	immediate: true
});

</script>
<style scoped>
.main-content {
    padding: 16px 16px 0 16px;
    overflow-y: auto;
}

.base-info {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
	grid-column-gap: 16px;
}

.handle-btn {
    position: absolute;
    padding-top: 16px;
    top: 0;
    right: 15px;
    text-align: right;
}

.handle-btn-panel {
	width: 100%;
	background-color: #fbfdff;
}

:deep( .el-form-item__label) {
	line-height: 14px !important;
	padding: 0 0 8px !important;
}
:deep(.el-form-item--mini.el-form-item),
.el-form-item--small.el-form-item {
	margin-bottom: 20px;
}

:deep(.el-select) {
	width: 100%;
}
</style>
