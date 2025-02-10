import * as echarts from "echarts/core";
import store from "@/store";
export function getDefaultChartOptions() {
	return {
		tooltip: {
			trigger: "axis",
			axisPointer: {
				type: "line"
			},
			showContent: true,
			formatter: "{c}%"
		},
		grid: {
			x: 70,
			y: 20,
			x2: 0,
			y2: 50
		},
		dataZoom: [
			{
				show: false,
				realtime: true
			},
			{
				type: "inside",
				realtime: true
			}
		],
		xAxis: {
			type: "category",
			axisLine: {
				lineStyle: {
					color: "#748BA4",
					width: 1
				}
			},
			axisTick: {
				alignWithLabel: true,
				color: "#748BA4"
			},
			data: ["1/25", "1/26", "1/27", "1/28", "1/29", "1/30", "1/31"]
		},
		yAxis: {
			type: "value",
			axisLabel: {
				show: true,
				interval: "auto",
				formatter: "{value} %"
			},
			min: 0,
			max: 100,
			show: true,
			splitNumber: 5
		},
		series: [
			{
				data: [0, 20, 40, 60, 80, 46, 76],
				type: "line",
				showSymbol: false,
				itemStyle: {
					color: new echarts.graphic.LinearGradient(
						0, 0, 1, 0,
						[
							{offset: 0, color: "#65B7F2"},
							{offset: 1, color: "#3183FE"}
						]
					)
				},
			}
		]
	};
}

export const ATTENDANCE_TYPE = {
	1: "固定排班",
	2: "排班制",
	3: "自由班制"
};

export const ATTENDANCE_STATUS = {
	1: "正常",
	2: "迟到",
	3: "早退",
	4: "旷工",
	5: "迟到早退",
	6: "已删除",
	7: "无效",
	8: "缺卡"
};

export const ATTENDANCE_SOURCE = {
	1: "UWB定位",
	2: "唯一性检测装置",
	4: () => store.getters.customText("pit"),
};

