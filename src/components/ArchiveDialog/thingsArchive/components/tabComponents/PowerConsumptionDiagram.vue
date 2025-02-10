<template>
<div
	ref="chart_container"
	class="power-content"
>
	<p
		v-show="show_tips && !loading"
		style="text-align:center;line-height:400px;margin:0"
	>
		暂无电量耗电信息
	</p>
	<div
		v-show="!show_tips"
		:id="random_id"
		v-loading="loading"
		style="width: 100%;height: 100%;"
	/>
</div>
</template>

<script setup>
import {inject, nextTick, onMounted, ref, watch} from "vue";
import {getHistory} from "@/api/device/deviceCard";
import * as echarts from "echarts";
import {useElementSize, watchThrottled} from "@vueuse/core/index";

const loading = ref(true);
const archive_card = inject("ARCHIVE_CARD");
const show_tips = ref(false);
let chart_obj = null;
const chart_container = ref();
const {width: chart_w, height: chart_h} = useElementSize(chart_container);
const random_id = ref("power_chart" + Math.random());

watchThrottled(
	[chart_w, chart_h],
	() => {
		chart_obj?.resize();
	},
);

const initChart = async () => {
	if (!archive_card.value) return;
	show_tips.value = false;
	if (chart_obj) {
		chart_obj.dispose();
		chart_obj = null;
	}
};

const changeChart = async () => {
	if (!archive_card.value) return;
	loading.value = true;
	show_tips.value = false;
	const end = Date.parse(new Date()) / 1000;
	const start = end - 2592000;
	const res = await getHistory({start, end, card_id: archive_card.value});
	if (res.data.type === 1 && res.data.result.length > 0) {
		const data = res.data.result;
		nextTick(() => {
			const dom = document.getElementById(random_id.value);
			if (dom) {
				chart_obj = echarts.init(dom);
				const option = {
					grid: {
						left: 26, // grid 组件距离 容器左侧的距离
						bottom: 50,
						right: 16,
						top: 20
					},
					xAxis: {
						data: data.map(function (item) {
							return item["time"];
						}),
					},
					yAxis: {
						type: "value",
					},
					tooltip: {
						trigger: "axis",
						axisPointer: {
							type: "cross",
						},
					},
					dataZoom: [{
						show: true,
						handleSize: 4,
						height: 14,
						moveHandleSize: 0,
						bottom: 10
					}, {
						type: "inside"
					}],
					series: {
						type: "line",
						showSymbol: false,
						data: data.map(function (item) {
							return item["power"];
						}),
					},
				};
				chart_obj.setOption(option);
			}
		});
	} else {
		show_tips.value = true;
	}
	loading.value = false;
};

onMounted(initChart);

watch(
	() => archive_card.value,
	changeChart,
	{immediate: true}
);
</script>

<style scoped>
.power-content {
	padding:16px 16px 0 16px;
}

.loading {
	text-align: center;
	line-height: 400px;
	margin: 0;
	background-color: white;
	z-index: 1002;
}
</style>
