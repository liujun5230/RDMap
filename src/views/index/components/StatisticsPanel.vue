<template>
<building-panel
	v-if="props.data"
	:show-building-name="showName"
	:show-statistics="show_statistics"
	:data="building_data"
	:position="{left: props.position.left, top: props.position.top}"
	:display-type="props.displayType"
	:building-clickable="props.buildingClickable"
	@select-building="emit('select-building')"
/>
</template>

<script lang="ts">
export default {
	name: "StatisticsPanel"
};
</script>

<script setup lang="ts">

import {computed} from "vue";

import {objectEntries} from "@vueuse/core";
import BuildingPanel from "./BuildingPanel.vue";
import type {Dimension} from "@/types/map";

const props = withDefaults(defineProps<{
	data?: {
		id: number
		name: string
		stat: {
			[key in number]: {
				label: string
				value: string
			}
		},
	},
	position: {
		left: string,
		top: string
	},
	// 显示建筑名称
	showName: boolean
	// 显示统计数据
	showStatistics: boolean,
	loading: boolean
	displayType: Dimension,
	buildingClickable?: boolean
}>(), {
	data: undefined,
	buildingClickable: true
});

const emit = defineEmits<{
	(event: "select-building"): void
}>();

const name = computed(() => { return props.data?.name ?? ""; });

const statistics = computed(() => {
	const data = props.data?.stat ?? {};
	return objectEntries(data).filter(([, {value}]) => {
		return +value > 0;
	}).reduce((acc, [key, value]) => {
		acc[key] = value;
		return acc;
	}, {} as {[key: string]: {label: string, value: string}});
});
const show_statistics = computed(() => {
	const is_all_zero = objectEntries(statistics.value).some(([, {value}]) => {
		return +value > 0;
	});
	const is_empty = Object.values(statistics.value).length > 0;
	return is_all_zero && is_empty && props.showStatistics;
});

const building_data = computed(() => {
	return {
		id: props.data?.id ?? 0,
		name: name.value,
		statistics: statistics.value
	};
});
</script>
