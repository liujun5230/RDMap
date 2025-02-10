import {PieChart} from "echarts/charts";
import {DataZoomComponent, TitleComponent, LegendComponent} from "echarts/components";
import * as echarts from "echarts/core";
import {cloneDeep} from "lodash-es";

echarts.use([DataZoomComponent, TitleComponent, LegendComponent, PieChart]);

export function getDefaultChartOptions() {
	return {
		animation: false,
		tooltip: {
			trigger: "axis",
			axisPointer: {
				type: "shadow"
			},
			formatter: (params) => {
				let content = "";
				for (const param of params) {
					if (param.data != null)
						content += `${param.marker}${param.seriesName}: ${param.value?.toFixed(0)}<br/>`;
				}
				if (content === "") {
					return null;
				}
				return `${params[0].name}<br/>${content}`;
			},
			confine: true,
			textStyle: {
				fontSize: 12,
			},
			padding: [5, 10],
			position: function (point, params, dom, rect, size) {
				const pos_x = point[0] > size.viewSize[0] / 2 ? point[0] - size.contentSize[0] - 20 : point[0] + 20;
				const pos_y = point[1] > size.viewSize[1] / 2 ? point[1] - size.contentSize[1] : point[1];

				return [pos_x, pos_y];
			}
		},
		grid: {
			left: 31,
			right: 37,
			top: 19,
			bottom: 13,
			containLabel: true
		},
		xAxis: {
			type: "value",
			min: 0,
			max: 30,
			minInterval: 1,
			axisLabel: {
				color: "#99abca",
			},
			axisLine: {
				lineStyle: {
					color: "#99abca",
					width: 1
				}
			},
			splitLine: {
				lineStyle: {
					color: "rgba(153,171,202,0.1)",
					width: 1
				}
			},
		},
		yAxis: {
			type: "category",
			data: [],
			axisLabel: {
				color: "#99abca",
				formatter: function (value) {
					const maxlength = 4;
					if (value.length > maxlength) {
						return value.substring(0, maxlength - 1) + "...";
					} else {
						return value;
					}
				}
			},
			axisTick: {
				show: false
			},
			axisLine: {
				show: false,
				lineStyle: {
					color: "rgba(153,171,203,0.4)",
					// width: 1
				},
				splitLine: {
					lineStyle: {
						color: "#0e204f",
						// width: 1
					}
				},
			},
		},
		dataZoom:
			[{
				type: "slider",
				show: false,
				yAxisIndex: [0],
				startValue: 0,
				minValueSpan: 5,
				maxValueSpan: 5
			}],
		series: [
			{
				name: "人数",
				type: "bar",
				showBackground: true,
				backgroundStyle: {
					color: "rgba(18,45,88,0.4)"
				},
				itemStyle: {
					color: new echarts.graphic.LinearGradient(
						0, 0, 1, 0,
						[
							{offset: 0, color: "#0078d9"},
							{offset: 1, color: "#3dedc3"}
						]
					)
				},
				label: {
					show: false,
					position: "right",
					color: "#3895ff"
				},
				data: [],
			},
		]
	};
}

export function getDefaultLowResolveChartOptions() {
	return {
		animation: false,
		tooltip: {
			trigger: "axis",
			axisPointer: {
				type: "shadow"
			},
			textStyle: {
				fontSize: 12,
			},
			padding: [5, 10],
			formatter: (params) => {
				let content = "";
				for (const param of params) {
					if (param.data != null)
						content += `${param.marker}${param.seriesName}: ${param.value?.toFixed(0)}<br/>`;
				}
				if (content === "") {
					return null;
				}
				return `${params[0].name}<br/>${content}`;
			},
			confine: true,
			position: function (point, params, dom, rect, size) {
				const pos_x = point[0] > size.viewSize[0] / 2 ? point[0] - size.contentSize[0] - 20 : point[0] + 20;
				const pos_y = point[1] > size.viewSize[1] / 2 ? point[1] - size.contentSize[1] : point[1];

				return [pos_x, pos_y];
			}
		},
		grid: {
			left: 31,
			right: 37,
			top: 10,
			bottom: 13,
			containLabel: true
		},
		xAxis: {
			type: "value",
			min: 0,
			max: 30,
			minInterval: 1,
			axisLabel: {
				color: "#99abca",
			},
			axisLine: {
				lineStyle: {
					color: "#99abca",
					width: 1
				}
			},
			splitLine: {
				lineStyle: {
					color: "rgba(153,171,202,0.1)",
					width: 1
				}
			},
		},
		yAxis: {
			type: "category",
			data: [],
			axisLabel: {
				color: "#99abca",
				formatter: function (value) {
					const maxlength = 4;
					if (value.length > maxlength) {
						return value.substring(0, maxlength - 1) + "...";
					} else {
						return value;
					}
				}
			},
			axisTick: {
				show: false
			},
			axisLine: {
				show: false,
				lineStyle: {
					color: "rgba(153,171,203,0.4)",
					// width: 1
				},
				splitLine: {
					lineStyle: {
						color: "#0e204f",
						// width: 1
					}
				},
			},
		},
		dataZoom:
			[{
				type: "slider",
				show: false,
				yAxisIndex: [0],
				startValue: 0,
				minValueSpan: 5,
				maxValueSpan: 5
			}],
		series: [
			{
				name: "人数",
				type: "bar",
				showBackground: true,
				backgroundStyle: {
					color: "rgba(18,45,88,0.4)"
				},
				itemStyle: {
					color: new echarts.graphic.LinearGradient(
						0, 0, 1, 0,
						[
							{offset: 0, color: "#0078d9"},
							{offset: 1, color: "#3dedc3"}
						]
					)
				},
				label: {
					show: false,
					position: "right",
					color: "#3895ff"
				},
				data: [],
				barWidth: 10 // 低分辨率特有
			},
		]
	};
}

export function validatePassword(password) {
	let modes = 0;
	for (let i = 0; i < password.length; i++) {
		modes |= CharMode(password.charCodeAt(i));
	}

	return bitTotal(modes);

	// CharMode函数
	function CharMode(val) {
		if (val >= 48 && val <= 57) // 数字
			return 1;
		if ((val >= 97 && val <= 122) || (val >= 65 && val <= 90)) // 大小写
			return 2;
		else
			return 8; // 特殊字符
	}

	// bitTotal函数
	function bitTotal(num) {
		let modes = 0;
		for (let i = 0; i < 4; i++) {
			if (num & 1) modes++;
			num >>>= 1;
		}
		return modes;
	}
}

export function getPatrolInspectionOption(params) {
	const outerColorArr = ["#2f90e9", "#13AABE", "#0FAF71", "#9B8808", "#BE741A"];
	const innerColorArr = ["#1c568c", "#0b6672", "#096944", "#5d5205", "#724610"];

	const option = {
		tooltip: {
			show: true,
		},
		legend: {
			left: "65%",
			itemWidth: 16,
			itemHeight: 8,
			y: "center",
			itemGap: 12,
			formatter: function (name) {
				return "{b|" + name + "}  {hr|" + (params.data.find(t => t.name === name).value) + "}";
			},
			textStyle: {
				rich: {
					b: {
						fontSize: 14,
						color: "#99ABCA"
					},
					hr: {
						fontSize: 16,
						color: "#fff",
						fontFamily: "Agency FB"
					}
				}
			}
		},
		series: [
			{
				type: "pie",
				radius: ["43%", "58%"],
				center: ["35%", "50%"],
				hoverAnimation: false,
				label: {
					position: "center",
					formatter: () => {
						return "{total|" + params.all + "}\r\n任务总数";
					},
					rich: {
						total: {
							fontSize: 20,
							color: "#fff",
							align: "right"
						},
					},
					color: "#99ABCA",
					fontSize: 14,
					lineHeight: 22,
				},
				data: params.data.map((t, i) => {
					return {
						...t,
						itemStyle: {
							color: outerColorArr[i]
						},
					};
				}),
				left: -20
			},
			{
				type: "pie",
				radius: ["28%", "43%"],
				center: ["35%", "50%"],
				hoverAnimation: false,
				label: {
					normal: {
						show: false
					}
				},
				data: params.data.map((t, i) => {
					return {
						...t,
						itemStyle: {
							color: innerColorArr[i]
						},
					};
				}),
				left: -20
			},
			{
				tooltip: {
					show: false,
				},
				type: "pie",
				radius: ["58%", "73%"],
				center: ["35%", "50%"],
				hoverAnimation: false,
				color: ["#162d51"],
				label: {
					normal: {
						show: false
					}
				},
				data: [{name: "", value: 100}],
				left: -20
			}
		]
	};
	return option;
}

export function getClientWidth() {
	let pageWidth = window.innerWidth,
		pageHeight = window.innerHeight;
	if (typeof pageWidth !== "number") {
		if (document.compatMode === "CSS1Compat") {
			pageWidth = document.documentElement.clientWidth;
			pageHeight = document.documentElement.clientHeight;
		} else {
			pageWidth = document.body.clientWidth;
			pageHeight = document.body.clientHeight;
		}
	}

	return {
		pageWidth,
		pageHeight
	};
}

// 给sort-table增加is_display字段
export function setDisplay(table_data, display, key = "id", child_key = "children") {
	const data = cloneDeep(table_data);
	for (const row of data) {
		row.is_display = display === undefined || display[row[key]] === undefined || display[row[key]];
		if (row[child_key]?.length) {
			row[child_key] = setDisplay(row[child_key], display, key, child_key);
		}
	}
	return data;
}

// 显示表格通过display过滤数据
export function filterDisplayData(table_data, display, key = "id", child_key = "children") {
	return table_data.filter(item => {
		if (item[child_key]?.length) {
			item[child_key] = filterDisplayData(item[child_key], display, key, child_key);
		}
		return display === undefined || display[item[key]] === undefined || display[item[key]];
	});
}

/**
 * 计算两个字符串的 Jaccard similarity 系数，用于计算两个字符串的相似度
 *
 * @param {string} s1 第一个字符串
 * @param {string} s2 第二个字符串
 * @returns {number}  Jaccard similarity 系数
 */
export function jaccardSimilarity(s1, s2) {
	const set1 = new Set(s1.split(""));
	const set2 = new Set(s2.split(""));
	const intersection = new Set([...set1].filter(x => set2.has(x)));
	const union_size = set1.size + set2.size - intersection.size;
	return intersection.size / union_size;
}

export function serialize(obj) {
	return JSON.stringify(obj);
}
