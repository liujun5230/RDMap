<template>
<el-table-column
	v-bind="$attrs"
	:formatter="formatArea"
>
	<template #default="{row}">
		<text-ellipsis
			style="width: 100%;"
			:disabled="!props.showOverflowTooltip"
		>
			<span
				v-for="(area, index) in transformArray(row[props.prop])"
				:key="area.area_id"
				class="clickable-text"
				@click="() => onAreaClick(area)"
			>
				{{ `${getAreaName(area)}${(index === transformArray(row[props.prop]).length - 1) ? "" : ","}` }}
			</span>

			<span v-if="transformArray(row[props.prop]).length === 0">
				{{ props.emptyText }}
			</span>
		</text-ellipsis>
	</template>
</el-table-column>
</template>

<script lang="ts" setup>
import type {TableAreaItem} from "@/types/global";
import TextEllipsis from "@/components/TextEllipsis.vue";
import {checkArchiveAuth} from "@/utils/js/authentication";

type AreaData = {
	id: number
	type: number
	area_id: number
	area_name: string
	group_id: number
	group_name: string
}

type Props = {
	prop: string
	showOverflowTooltip: boolean
	emptyText?: string
	showGroupName?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	prop: "areas",
	showOverflowTooltip: false,
	emptyText: "--",
	showGroupName: false
});

function getAreaName(data: AreaData) {
	if (props.showGroupName) {
		return data.group_name ? data.group_name + "-" + data.area_name : data.area_name;
	}
	return data.area_name;
}

function transformArray<T>(val: T | T[]): T[] {
	return Array.isArray(val) ? val : [val as T];
}

function onAreaClick(area: any) {
	if (checkArchiveAuth(area.type)) {
		emit("click", area);
	}
}

// 打印使用 修改template需要同步更新
const formatArea = (row: any) => {
	let str = "";
	const areas = transformArray(row[props.prop]);

	if (areas.length === 0)
		return "--";

	for (let i = 0; i < areas.length; i++) {
		str += `${areas[i].area_name}${(i === transformArray(row[props.prop]).length - 1) ? "" : ","}`;
	}

	return str;
};

const emit = defineEmits<{
	(e: "click", area: TableAreaItem): void
}>();

</script>
