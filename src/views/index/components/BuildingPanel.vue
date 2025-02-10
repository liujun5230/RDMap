<template>
<div v-show="visible">
	<div
		v-if="props.displayType === Dimension.Three"
		class="three statistics-panel text-main-1 font-main w-fit bg-bg  border-t-2 border-warning divide-y-2 divide-divider text-xs max-w-[278px]"
	>
		<div
			v-if="props.showBuildingName"
			class="flex gap-2 p-2"
		>
			<span
				class="text-warning"
			>
				<icon-building />
			</span>

			<TextEllipsis
				style="width: 100%;"
				:content="data?.name || ''"
			>
				<span
					:class="[props.buildingClickable ? 'cursor-pointer' : 'cursor-default', {'hover:font-bold': props.buildingClickable}]"
					@click="emitSelectBuilding"
				>
					{{ data?.name || "" }}
				</span>
			</TextEllipsis>
		</div>
		<div
			v-if="showStatistics"
			class="statistics-item px-[30px] py-[10px] gap-y-2 gap-x-5"
		>
			<div
				v-for="(item) in data?.statistics"
				:key="item.label"
			>
				<span class="font-main text-minor-1">{{ item.label }}:</span> <span class="text-main-1 font-main">{{ item.value }}</span>
			</div>
		</div>

		<img
			class="absolute bottom-[-2rem] translate-x-[-50%] left-1/2"
			src="@/assets/images/index/indicator.png"
			width="40px"
			alt="indicator"
		>
	</div>
	<div
		v-else
		class="two statistics-panel font-han  text-main-1 w-fit bg-[#10244299]  border-l-[3px] border-warning px-[12px]  py-[10px] font-bold text-[12px] max-w-[450px]"
		:class="[{'selected': current_select_building_id === data?.id}, props.buildingClickable ? 'cursor-pointer' : 'cursor-default', ]"
		@click="emitSelectBuilding"
	>
		<div
			v-if="props.showBuildingName"
			class="flex gap-[6px] overflow-hidden items-center"
		>
			<span
				class="text-warning"
			>
				<icon-building style="width: 20px; height: 20px;" />
			</span>

			<TextEllipsis
				style="width: 100%;"
				:content="data?.name || ''"
			>
				<span class="stroke-outside text-[20px] leading-[20px]  building-name">
					{{ data?.name || "" }}
				</span>
			</TextEllipsis>
		</div>
		<div
			v-if="showStatistics"
			class="statistics-item"
		>
			<div
				v-for="(item) in data?.statistics"
				:key="item.label"
			>
				<span class="stroke-outside text-main-1 font-han font-bold">{{ item.label }}:{{ item.value }}</span>
			</div>
		</div>

		<img
			class="absolute bottom-0 translate-y-full translate-x-[-50%] left-1/2"
			src="@/assets/images/index/indicator-2d.png"
			width="30px"
			alt="indicator"
		>
	</div>
</div>
</template>

<script setup lang="ts">
import {Dimension} from "@/types/map";
import TextEllipsis from "@/components/TextEllipsis.vue";
import {computed} from "vue";
import IconBuilding from "~icons/decoration/building";
import {useMapParams} from "@/composable";

const {current_select_building_id} = useMapParams();

const props = withDefaults(defineProps<{
	data?: {
		id: number
		name: string
		statistics:Record<string, {label: string, value: string}>
	}
	showBuildingName?: boolean
	// 显示统计数据
	showStatistics?: boolean

	displayType?: Dimension

	// 建筑名称是否可点击
	buildingClickable?: boolean

	position: {
		left: string
		top: string
	}
}>(), {
	data: undefined,
	displayType: undefined,
	buildingClickable: true
});

const visible = computed(() => props.showBuildingName || props.showStatistics);

const emit = defineEmits<{
	(event: "select-building"): void
}>();

function emitSelectBuilding() {
	if (props.buildingClickable) {
		emit("select-building");
	}
}
</script>

<style scoped>
.statistics-panel {
  position: absolute;

  left: v-bind("props.position.left");
  top: v-bind("props.position.top");

	&.three{
		transform: translate(-50%, -200%);
	}

	&.two{
		line-height: 12px;
		gap: 10px;
		display: flex;
		flex-flow: column nowrap;
		transform: translate(-50%, -100%);
	}

	&.two:hover{
		background: rgba(16, 36, 66, 0.85);
	}

	&.two.selected{
		background: rgba(16, 36, 66, 0.95);
	}
}

.statistics-item {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, auto));
	place-items: start;
	line-height: 1;
}

.three .statistics-item {
	gap: 8px 20px;
	justify-content: start;
}

.two .statistics-item {
	gap: 8px 12px;
  justify-content: start;
	font-size: 16px;
}

.stroke-outside {
	text-shadow: 0 1px black, 1px 0 black, -1px 0 black, 0 -1px black;
}

.selected .building-name {
	color: rgba(255,161,0,1);
	font-weight: 700;
}
</style>
