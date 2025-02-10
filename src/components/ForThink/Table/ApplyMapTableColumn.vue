<template>
<el-table-column
	v-bind="$attrs"
	:prop="prop"
	:show-overflow-tooltip="false"
	:formatter="formateTableColumn"
	v-on="$listeners"
>
	<template #default="{row}">
		<span>
			<span
				v-if="row[allMapField] === 0 && !row[prop].length"
				:style="{color: emptyTextColor}"
			>{{ emptyText }}</span>
			<text-ellipsis
				v-else
				:line-clamp="2"
				style="width: 100%;"
				:disabled="!showOverflowTooltip"
			>
				<span v-if="row[allMapField]">{{ allMapText }}</span>
				<span v-if="!row[allMapField] && row[areaInverseField]">（以下范围外将触发告警）</span>
				<span
					v-for="(item) in (row[prop] ?? [])"
					:key="item.uuid"
					class="name-split"
					:class="{'clickable-text': item.area_id}"
					@click="openAreaDrawer(item)"
				>
					{{ formatApplyMap(item) }}
				</span>
			</text-ellipsis>
		</span>
	</template>
</el-table-column>
</template>

<script setup lang="ts">
import type {TableAreaItem} from "@/types/global";
import TextEllipsis from "@/components/TextEllipsis.vue";
import {checkArchiveAuth} from "@/utils/js/authentication";

export type AreaItem = Omit<TableAreaItem, "is_all_map"> & {map?: string, scene_id?: number};

const emits = defineEmits<{
	(event: "click", value: AreaItem): void
}>();

interface Props {
	prop: string,
	showOverflowTooltip?: boolean,
	emptyText?: string,
	emptyTextColor?: string,
	/** 是否全部定位信号覆盖区域字段 */
	allMapField?: string,
	allMapText?: string,
	areaInverseField?: string
}
const props = withDefaults(defineProps<Props>(), {
	showOverflowTooltip: true,
	emptyText: "--",
	emptyTextColor: undefined,
	allMapField: "is_all_map",
	allMapText: "全部定位信号覆盖区域",
	areaInverseField: "area_ids_inverse"
});

function formateTableColumn(row: any) {
	const {allMapField, areaInverseField, prop, allMapText, emptyText} = props;
	if (row[allMapField]) {
		return allMapText;
	} else {
		if (row[prop].length) {
			const name = row[prop].map((item: any) => formatApplyMap(item)).join("、");
			return `${row[areaInverseField] ? "（以下范围外将触发告警）" : ""}${name}`;
		} else {
			return emptyText;
		}
	}
}

function formatApplyMap(item: AreaItem) {
	if (item.area_id) {
		return item.group_name ? `${item.group_name}-${item.area_name}` : `${item.area_name}`;
	} else {
		return item.map;
	}
}

function openAreaDrawer(item: AreaItem) {
	if (!checkArchiveAuth(item.type)) return;
	if (item.area_id) {
		emits("click", {...item});
	}
}
</script>
