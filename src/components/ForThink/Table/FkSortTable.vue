<template>
<fk-table
	ref="table_ref"
	:data="table_data"
	:row-key="props.btnHandleAuth ? 'field' : undefined"
	handle-drag-class=".person-dict-drag"
	sortable
	class="sort-table"
>
	<el-table-column>
		<template #header>
			<div style="margin-left: 22px;">
				{{ props.label }}
			</div>
		</template>
		<template #default="{row}">
			<div class="sort-cell">
				<img
					v-if="props.btnHandleAuth && !row[props.disabledDropKey]"
					class="person-dict-drag"
					src="../../../assets/svgIcons/operation/drag.svg"
					alt=""
				>
				<div
					v-else
					style="width: 14px;"
				/><!--占位-->
				<el-checkbox
					v-model="row[props.displayKey]"
					:disabled="!row[props.selectableKey]"
				/>
				<span>{{ row[props.labelKey] }}</span>
			</div>
		</template>
	</el-table-column>
	<slot />
	<el-table-column
		v-if="props.showPinned && props.btnHandleAuth"
		label="置顶"
		width="60"
	>
		<template #default="{$index}">
			<fk-table-button
				v-if="$index > first_sortable_index"
				type="success"
				class="handle-icon-btn"
				circle
				plain
				size="mini"
				@click="goTop($index)"
			>
				<top-icon />
			</fk-table-button>
		</template>
	</el-table-column>
</fk-table>
</template>

<script setup lang="ts">
import FkTable from "@/components/ForThink/Table/FkTable.vue";
import {computed, ref, watch} from "vue";
import {cloneDeep} from "lodash-es";
import FkTableButton from "@/components/ForThink/Table/FkTableButton.vue";
import TopIcon from "~icons/operation/top";

const props = withDefaults(defineProps<{
	data: any[];
	displayKey?: string;
	labelKey?: string;
	label?: string;
	showPinned?: boolean;
	disabledDropKey?: string;
	selectableKey?: string;
	btnHandleAuth: boolean;
}>(), {
	displayKey: "is_display",
	labelKey: "name",
	disabledDropKey: "disabled_drop",
	selectableKey: "selectable",
	label: "字段名称",
	showPinned: true,
});

const table_ref = ref();
const table_data = ref<any[]>([]);

const first_sortable_index = computed(() => Math.max(0, table_data.value.findIndex(row => !row[props.disabledDropKey]))); // findIndex为-1时取0

watch(() => props.data,
	() => {
		table_data.value = cloneDeep(props.data);
	},
	{immediate: true}
);

const goTop = (index: number) => {
	const data = [...table_data.value];
	const changed_data = data.splice(index, 1);
	data.splice(first_sortable_index.value, 0, changed_data[0]);
	table_data.value = data;
};

defineExpose({
	getTableData: () => table_data.value
});
</script>

<style scoped>
.sort-table {
	:deep(.el-table__body-wrapper) { /*不知道为什么这个高度el-table自动计算会出错*/
		height: calc(100% - 32px) !important;
	}
}

.sort-cell {
	display: flex;
	column-gap: 8px;
	align-items: center;
}

.person-dict-drag {
	cursor: move;
}
</style>
