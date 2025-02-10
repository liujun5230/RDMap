<template>
<div class="health-info">
	<div class="filter-form">
		<el-select
			v-model="health_type"
			style="width: 72px;"
			size="small"
			@change="onTimeChange"
		>
			<el-option
				v-for="item in OPTIONS"
				:key="item.value"
				:value="item.value"
				:label="item.label"
			/>
		</el-select>
		<fk-date-picker
			v-model="search_time"
			class="clear-date-icon"
			popper-class="health-date-picker"
			type="datetimerange"
			:default-time="['00:00:00', '23:59:59']"
			size="small"
			format="yyyy-MM-dd HH:mm"
			@change="onTimeChange"
		/>
		<el-select
			v-model="interval"
			style="width: 108px;"
			size="small"
			@change="getChartData"
		>
			<el-option
				v-for="item in INTERVAL_OPTIONS"
				:key="item.value"
				:value="item.value"
				:label="item.label"
			/>
		</el-select>
		<span
			v-show="abnormal_count"
			class="clickable-text"
			@click="jumpViewAbnormal"
		>查看{{ abnormal_count }}次异常详情>></span>
	</div>
	<div class="gather-info">
		<span style="margin-right: 16px;">采集值：{{ gather_val }}</span>
		<span>采集时间：{{ gather_time }}</span>
	</div>
	<el-divider />
	<div
		v-show="show_set_config || show_no_data"
		class="jump-config"
	>
		<img :src="EmptyChart">
		<div style="margin-bottom: 10px;">
			{{ show_set_config ? "数据缺失~" : "暂无数据" }}
		</div>
		<div v-show="show_set_config">
			请前往<span
				class="clickable-text"
				@click="jumpConfig"
			>系统配置</span>页面设置健康数据保留时长
		</div>
	</div>
	<div
		v-show="!show_set_config && !show_no_data"
		:id="random_id"
		class="chart-container"
	/>
</div>
</template>

<script setup>
import * as echarts from "echarts";
import {menu_name_map} from "@/store/useMenuStore";
import {computed, inject, onMounted, ref, watch} from "vue";
import {Notification} from "element-ui";
import FkDatePicker from "@/components/ForThink/Form/FkDatePicker.vue";
import {getDateTimeStr, getDayTimeStamp} from "@/utils/js/tools/time";
import {getHealthHistory, getHeartList} from "@/api/health/heartRate";
import {getConfig} from "@/api/configuration/sysConfig";
import EmptyChart from "@/assets/images/common/empty-chart.svg";
import {useTimeoutPoll} from "@vueuse/core";
import {getHeartErrorList} from "@/api/health/abnormal";
import {usePageAuth} from "@/utils/js/authentication";

const archive_card = inject("ARCHIVE_CARD");
const archive_uuid = inject("ARCHIVE_UUID");
const active_name = inject("ACTIVE_NAME");
const archive_info = inject("ARCHIVE_INFO");
const archive_things_type = inject("ARCHIVE_THINGS_TYPE");

const health_type = ref(1);
const interval = ref(86400);
const abnormal_count = ref(0);
const health_info = ref();
const random_id = ref("health_chart" + Math.random());
const OPTIONS = [
	{value: 1, label: "心率"},
	{value: 3, label: "血氧"},
	{value: 2, label: "体温"},
];
const INTERVAL_OPTIONS = [
	{value: 86400, label: "间隔1天"},
	{value: 3600, label: "间隔1小时"},
	{value: 1800, label: "间隔30分钟"},
	{value: 900, label: "间隔15分钟"},
	{value: 600, label: "间隔10分钟"},
	{value: 300, label: "间隔5分钟"},
];
const KEY_MAP = { // min max的值为接口返回的字段名
	1: {value: "heart_rate", max: "maximum_heart_rate", min: "lower_heart_rate", unit: "bpm"},
	3: {value: "oxygen_pressure", max: "max", min: "oxygen_thresholds", unit: "%"}, // 暂时只有最低
	2: {value: "body_temperature_pressure", max: "body_temperature_thresholds", min: "lower", unit: "℃"}, // 暂时只有最高
};
const formatTime = (time) => {
	const format_time = getDateTimeStr({time: time * 1000, dateStr: "-", timeStr: ":"});
	return format_time.date + " " + format_time.time;
};
const gather_val = computed(() => {
	if (!health_info.value || !health_info.value[KEY_MAP[health_type.value].value]) return "--";
	return health_info.value[KEY_MAP[health_type.value].value] + "(" + KEY_MAP[health_type.value].unit + ")";
});
const gather_time = computed(() => {
	if (!health_info.value || !health_info.value.recv_time) return "--";
	return formatTime(health_info.value.recv_time);
});

const search_time = ref([getDayTimeStamp().start, getDayTimeStamp().end]);
let health_chart = null;
const del_history_day = ref(7);

const show_set_config = computed(() => {
	const now = Date.now();
	if (!search_time.value) return false;
	return now - new Date(search_time.value[1]).getTime() > 604800000; // 7天
});

const show_no_data = ref(false);

const default_mark_line = {
	symbol: ["none", "none"],
	data: [
		{
			name: "告警上限",
			yAxis: 0,
			lineStyle: {color: "#ED891F", type: "dashed"}
		},
		{
			name: "告警下限",
			yAxis: 0,
			lineStyle: {color: "#F56C6C", type: "dashed"}
		}
	]
};
const option = {
	tooltip: {
		trigger: "axis",
		axisPointer: {
			type: "cross"
		},
		formatter: (params) => {
			const {info} = params[0].data;
			return `<div class="chart-tip">
<div>${formatTime(info.start_time)} 至 ${formatTime(info.end_time)}</div>
<div class="flex-between"><span class="chart-label">最大值</span><span>${info.max_num}(${KEY_MAP[health_type.value].unit})</span></div>
<div class="flex-between"><span class="chart-label">最大值时刻</span><span>${formatTime(info.max_time)}</span></div>
<div class="flex-between"><span class="chart-label">最小值</span><span>${info.min_num}(${KEY_MAP[health_type.value].unit})</span></div>
<div class="flex-between"><span class="chart-label">最小值时刻</span><span>${formatTime(info.min_time)}</span></div>
<div class="flex-between"><span class="chart-label">平均值</span><span>${info.mean.toFixed(2)}(${KEY_MAP[health_type.value].unit})</span></div>
</div>`;
		}
	},
	dataZoom: [
		{
			type: "inside",
			start: 0,
			end: 100
		},
		{
			show: true,
			type: "slider",
			top: "90%",
			start: 0,
			end: 100
		}
	],
	legend: {
		data: ["告警上限", "告警下限", "平均值"],
		textStyle: {color: "#748ba4"},
		selectedMode: false
	},
	xAxis: {
		type: "category",
		data: [],
		axisLine: {onZero: false},
		splitLine: {show: false},
		axisLabel: {
			color: "#748ba4",
			formatter: (val) => {
				return val.split(" ").join("\n");
			}
		}
	},
	yAxis: {
		scale: true,
		name: "单位",
		nameTextStyle: {color: "#a2b2c2"},
		axisLabel: {color: "#748ba4"},
		min: 0,
		max: function (value) {
			return Math.max((value.max + 20).toFixed(2), health_info.value?.[KEY_MAP?.[health_type.value]?.max] || 0, health_info.value?.[KEY_MAP?.[health_type.value]?.min] || 0);
		}
	},
	grid: {
		left: "5%",
		right: "5%",
		bottom: "20%"
	},
	series: [
		{
			name: "健康监测",
			type: "candlestick",
			data: [],
			itemStyle: {
				color: "#66ADFF",
				color0: "blue",
				borderColor: "#66ADFF",
				borderColor0: "red"
			},
			markLine: default_mark_line,
		},
		{
			name: "平均值",
			type: "line",
			data: [],
			smooth: true,
			lineStyle: {
				opacity: 0.5,
				color: "rgba(67, 74, 243)",
				width: 2
			}
		},
		{name: "告警上限", type: "line", color: "transparent", symbol: "none", lineStyle: {color: "#ED891F", type: "dashed"}},
		{name: "告警下限", type: "line", color: "transparent", symbol: "none", lineStyle: {color: "#F56C6C", type: "dashed"}},
	],
};

const {resume, pause} = useTimeoutPoll(getHeartList, 4000);

onMounted(() => {
	getHealthConfig();
	health_chart = echarts.init(document.getElementById(random_id.value));
	health_chart.setOption(option);
	resume();
	if (!archive_uuid.value) return;
	getHealthList();
	getAbnormalCount();
	getChartData();
});

const setMarkLine = () => {
	option.series[0].markLine = {...default_mark_line};
	if (health_info.value && health_info.value[KEY_MAP[health_type.value]?.min]) {
		option.series[0].markLine.data[1].yAxis = health_info.value[KEY_MAP[health_type.value].min];
	} else {
		option.series[0].markLine.data[1].yAxis = -1;
	}
	if (health_info.value && health_info.value[KEY_MAP[health_type.value]?.max]) {
		option.series[0].markLine.data[0].yAxis = health_info.value[KEY_MAP[health_type.value].max];
	} else {
		option.series[0].markLine.data[0].yAxis = -1;
	}
};

const handleChartData = (health_list) => {
	const x_axis = [];
	const y_data = [];
	const avg = [];
	for (const item of health_list) {
		x_axis.push(formatTime((item.start_time + item.end_time) / 2));
		y_data.push({value: [item.min_num, item.max_num, item.min_num, item.max_num], info: item});
		avg.push(item.mean);
	}
	option.xAxis.data = x_axis;
	option.series[0].data = y_data;
	option.series[1].data = avg;
	option.yAxis.name = `单位(${KEY_MAP[health_type.value].unit})`;
	setMarkLine();
	health_chart.setOption(option);
	show_no_data.value = !health_list.length;
};

const onTimeChange = () => {
	getChartData();
	getAbnormalCount();
};

const getChartData = () => {
	const data = {
		uuid: archive_uuid.value,
		start_time: new Date(search_time.value[0]).getTime() / 1000,
		end_time: new Date(search_time.value[1]).getTime() / 1000,
		health_type: health_type.value,
		interval: interval.value,
		time_type: 1
	};
	getHealthHistory(data).then(({data: {type, result}}) => {
		if (type === 1) {
			handleChartData(result.data);
		}
	});
};

const setNoneHealth = () => {
	health_info.value = undefined;
	abnormal_count.value = 0;
	option.series[0].markLine = undefined;
	health_chart.setOption(option);
};

const getHealthList = async () => {
	const res = await getHeartList({uuid: archive_uuid.value});
	const {result, type} = res.data;
	if (type === 1) {
		const {data} = result;
		if (data.length) {
			health_info.value = data[0];
			setMarkLine();
			health_chart.setOption(option);
		} else {
			setNoneHealth();
		}
	} else {
		Notification({
			type: "error",
			title: "错误",
			message: result
		});
		setNoneHealth();
	}
};

const getAbnormalCount = () => {
	if (!archive_card.value) return;
	getHeartErrorList({
		health_type_code: health_type.value,
		uuid: archive_uuid.value,
		begin: Math.ceil(new Date(search_time.value[0]).getTime() / 1000),
		end: Math.ceil(new Date(search_time.value[1]).getTime() / 1000),
		time_type: 1
	}).then((res) => {
		const {result, type} = res.data;
		if (type === 1) {
			abnormal_count.value = result.count;
		}
	});
};

const getHealthConfig = () => {
	getConfig().then(({data: {type, result}}) => {
		if (type === 1) {
			del_history_day.value = Number(result.find(it => it.name === "DEL_HISTORY_DAY")?.value || 0);
		}
	});
};

const jumpConfig = () => {
	let params_str = "?id=48&is_group=1&menu_id=19&title=历史健康数据自动删除&active_name=sixth";
	if (window.location.href.includes("withoutHead")) params_str += "&withoutHead";

	const auth = usePageAuth("/systemManage#/systemConfig");
	if (!auth.value.check) {
		Notification.error({
			title: "错误",
			message: `跳转失败，无${menu_name_map.value.get("/systemManage#/systemConfig")}页面权限`
		});
		return;
	}

	window.open(`/systemManage#/systemConfig${params_str}`);
};

const jumpViewAbnormal = () => {
	let params_str = `?check_type=${health_type.value}&time_type=1&uuid=${archive_uuid.value}&name=${archive_info.value.name}&utype=${archive_things_type.value}&start=${new Date(search_time.value[0]).getTime()}&end=${new Date(search_time.value[1]).getTime()}`;
	if (window.location.href.includes("withoutHead")) params_str += "&withoutHead";

	const auth = usePageAuth("/healthy#/error");
	if (!auth.value.check) {
		Notification.error({
			title: "错误",
			message: `跳转失败，无${menu_name_map.value.get("/healthy#/error")}页面权限`
		});
		return;
	}

	window.open(`/healthy#/error${params_str}`);
};

watch(
	() => [archive_uuid.value, archive_card.value],
	() => {
		if (!archive_uuid.value) return;
		getHealthList();
		getChartData();
		getAbnormalCount();
	},
	{deep: true}
);

watch(
	() => active_name.value,
	(val) => {
		if (val === "health_data") {
			resume();
		} else {
			pause();
		}
	}
);
</script>

<style scoped lang="scss">
.health-info {
	padding: 16px 16px 0 16px;

	.el-divider--horizontal {
		margin: 16px 0;
	}

	.filter-form {
		.el-date-editor {
			margin: 0 10px;
		}

		:deep(.el-range-editor.el-input__inner) {
			width: 278px;
			height: 32px;

			.el-range-input {
				width: 46%;
				line-height: 14px;
				color: #a2b2c2;
			}

			.el-range-separator {
				line-height: 24px;
				padding: 0 4px;
				color: #a2b2c2;
			}
		}

		.clickable-text {
			margin-left: 10px;
		}

		.el-select :deep(.el-input--small .el-input__inner) {
			padding: 0 10px 0 12px;
		}
	}

	.gather-info {
		margin: 16px 0;
	}

	.chart-container {
		width: 834px; // 100%会受tab页影响
		height: 320px;
	}

	.jump-config {
		display: flex;
		flex-direction: column;
		height: 320px;
		color: #a2b2c2;
		align-items: center;
		justify-content: center;

		img {
			width: 48px;
			height: 48px;
			margin-bottom: 14px;
		}
	}
}

:deep(.chart-tip) {
	color: #a2b2c2;
	font-size: 12px;
	line-height: 12px;

	.flex-between {
		display: flex;
		justify-content: space-between;
		margin-top: 8px;

		.chart-label {
			position: relative;
			&:before {
				content : "";
				position: relative;
				display: inline-block;
				//left: -8px;
				margin-right: 8px;
				bottom: 4px;
				width: 3px;
				height: 3px;
				border-radius: 20px;
				background-color: #a2b2c2;
			}
		}
	}
}
</style>
<style lang="scss">
.health-date-picker {
	.el-picker-panel__footer .el-button--text {
		display: none;
	}
}
</style>
