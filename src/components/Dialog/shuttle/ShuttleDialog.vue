<template>
<!-- @vue-ignore -->
<base-dialog
	v-bind="$attrs"
	:custom-class="custom_class"
	:show-footer="true"
	:width="props.width"
	height="614"
	v-on="$listeners"
	@negative-click="emits('input', false)"
	@positive-click="handleSave"
	@open="handleDialogOpen"
	@closed="handleClosed"
>
	<template #operate>
		<fk-icon
			v-if="add_button_info.visible"
			tip="刷新"
			size="24"
			style="cursor: pointer;"
			@click="handleRefresh"
		>
			<refresh-icon />
		</fk-icon>
	</template>
	<div class="shuttle-dialog-body">
		<div class="left-side">
			<shuttle-search
				ref="shuttle_search_ref"
				:multiple="multiple"
				:select-options="selectOptions"
				:checked-list.sync="temp_checked_list"
			/>
		</div>
		<div class="divide-line" />
		<div class="right-side">
			<div class="right-side-header">
				<span class="right-side-header-title">已选择的</span>
				<span
					v-if="temp_checked_list.length"
					class="all-delete"
					@click="removeSelected()"
				>一键清空</span>
			</div>
			<ul class="select-content">
				<li
					v-for="item in temp_checked_list"
					:key="`${item.type}-${item.id}`"
					class="selected-item"
				>
					<text-ellipsis style="max-width: calc(100% - 16px);">
						{{ formatSelectName(item) }}
					</text-ellipsis>
					<fk-icon
						class="delete-icon"
						size="12"
						@click="removeSelected(item)"
					>
						<delete-icon />
					</fk-icon>
				</li>
			</ul>
		</div>
	</div>
	<template #footer>
		<label-button
			v-if="add_button_info.visible"
			class="add-button"
			size="medium"
			@click="handleAdd(add_button_info.type)"
		>
			{{ add_button_info.button_name }}
		</label-button>
		<div>
			<el-button
				@click="emits('input', false)"
			>
				取消
			</el-button>
			<el-button
				type="primary"
				@click="handleSave"
			>
				保存
			</el-button>
		</div>
	</template>
</base-dialog>
</template>

<script setup lang="ts">
import {computed, shallowRef, ref, nextTick} from "vue";
import {useThrottleFn} from "@vueuse/core";

import FkIcon from "@/components/ForThink/FkIcon.vue";
import DeleteIcon from "~icons/operation/stroke-close";
import RefreshIcon from "~icons/operation/refresh";
import TextEllipsis from "@/components/TextEllipsis.vue";
import LabelButton from "@/components/Button/LabelButton.vue";

import BaseDialog from "../BaseDialog.vue";
import type {CheckedItem} from "../constant";
import type {Props as ShuttleSearchProps} from "./ShuttleSearch.vue";
import ShuttleSearch from "./ShuttleSearch.vue";
import {SHUTTLE_TYPE, ADD_INFO} from "../constant";

const emits = defineEmits<{
	(event: "input", value: boolean): void,
	(event: "update:checkedList", value: CheckedItem[]): void,
	(event: "save", value: CheckedItem[]): void,
	(event: "refresh"): void
}>();

interface Props {
	selectOptions: ShuttleSearchProps["selectOptions"],
	checkedList: CheckedItem[],
	multiple?: boolean,
	width?: string,
	customClass?: string,
}
const props = withDefaults(defineProps<Props>(), {
	multiple: true,
	width: "756px",
	customClass: ""
});

const temp_checked_list = shallowRef<ShuttleSearchProps["checkedList"]>([]);
const shuttle_search_ref = ref<InstanceType<typeof ShuttleSearch> | null>(null);

const custom_class = computed(() => {
	const {customClass} = props;
	return "shuttle-dialog" + (customClass ? ` ${customClass}` : "");
});

const add_button_info = computed(() => {
	const shuttle_info_key = props.selectOptions.find((item) => item.value === SHUTTLE_TYPE.virtual_fence || item.value === SHUTTLE_TYPE.roll_call)?.value;
	return {
		button_name: shuttle_info_key ? ADD_INFO[shuttle_info_key as keyof typeof ADD_INFO].text : "",
		type: shuttle_info_key as keyof typeof ADD_INFO,
		visible: shuttle_info_key
	};
});

const handleRefresh = useThrottleFn(async () => {
	await shuttle_search_ref.value?.fetchRequest(true);
	emits("refresh");
}, 1000, false, true);

function handleDialogOpen() {
	temp_checked_list.value = props.checkedList.map((item) => ({
		...item,
		unique_id: `${item.type}-${item.id}`
	}));
	nextTick(async () => {
		await shuttle_search_ref.value?.fetchRequest();
	});
}

function removeSelected(data?: CheckedItem) {
	temp_checked_list.value = data === undefined ? [] : temp_checked_list.value.filter(({unique_id}) => `${data.type}-${data.id}` !== unique_id);
	shuttle_search_ref.value?.updateTreeChecked(temp_checked_list.value);
}

function handleSave() {
	const checked_list = temp_checked_list.value.map(({id, type, name, branch_name, unit_name}) => ({id, type, name, branch_name, unit_name}));
	emits("update:checkedList", checked_list);
	emits("input", false);
	emits("save", checked_list);
}

function handleAdd(type: keyof typeof ADD_INFO) {
	window.open(ADD_INFO[type].url);
}

function formatSelectName(item: ShuttleSearchProps["checkedList"][0]) {
	const addition_info = item.branch_name || item.unit_name;
	return addition_info ? `${item.name}（${addition_info}）` : item.name;
}

function handleClosed() {
	shuttle_search_ref.value?.clearSearchStr();
}
</script>

<style lang="scss" scoped>
:deep(.shuttle-dialog.base-dialog) {

    .content-body {
        display: flex;
    }
}

.add-button {
	position: absolute;
	top: 12px;
	left: 16px;
	height: 32px;
}

.shuttle-dialog-body {
    width: 100%;
	display: flex;
    overflow: hidden;
	margin: 14px 16px 16px;
    border: 1px solid #ebeef5;
	border-radius: 4px;
	color: var(--theme-text-color-gray);

    .left-side {
        flex: 1 1 100%;
		max-width: 50%;
		padding: 16px 16px 18px;
    }

    .divide-line {
        flex: 0 0 auto;
        width: 1px;
        background-color: #ebeef5;
    }

    .right-side {
        flex: 1 1 100%;
		max-width: 50%;
		padding: 16px 8px 18px;
		display: flex;
		flex-direction: column;

		.right-side-header {
			padding: 0 8px;
			margin-bottom: 10px;
			display: flex;
			justify-content: space-between;
			align-items: center;

			.right-side-header-title {
				color: var(--theme-text-color-normal);
			}

			.all-delete {
				color: var(--theme-color);
				cursor: pointer;
			}
		}

		.select-content {
			flex: 1 1 100%;
			overflow-y: auto;
		}

		.selected-item {
			padding: 5px 8px;
			line-height: 22px;
			display: flex;
			justify-content: space-between;
			align-items: center;

			&:hover {
				background-color: var(--list-item-background-color-hover);
			}

			.delete-icon {
				color: var(--theme-text-color-normal);
				&:hover {
					cursor: pointer;
					color: var(--theme-text-color-gray);
				}
			}
		}
    }
}
</style>
