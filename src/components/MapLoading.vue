<template>
<div
	v-show="!(active === 0 || active === 5 && props.homePage)"
	class="map-loading"
	:class="{'index-theme': props.homePage}"
>
	<div class="map-loading-content">
		<div
			v-if="active === 1"
			class="rotation-loading"
		>
			<div class="loading-content">
				<div class="loading-icon" />
				<div class="loading-text theme-color">
					加载请求中...
				</div>
			</div>
		</div>
		<div
			v-else-if="active === 2 || active === 4"
			class="loading-progress"
		>
			<div
				v-show="active === 4"
				class="theme-color tips"
			>
				请检查网络连接是否正常~
			</div>
			<el-progress
				:class="{'fall-down': active === 4}"
				:percentage="percentage"
				text-inside
			/>
			<div class="loading-info">
				<span class="size">地图 {{ formatMapSize(props.loaded) }}/{{ formatMapSize(props.total) }} </span>
				<span
					v-show="active === 2"
					class="theme-color"
				>{{ formatMapSize(props.speed) }}/s</span>
				<span
					v-show="active === 4"
					class="warning"
				> <img
					style="display: inline;"
					src="@/assets/images/common/warning.png"
					alt=""
				> 加载失败</span>
			</div>
		</div>
		<div
			v-else-if="active === 3"
			class="analysis-loading"
		>
			<div class="analysis-bg">
				<div class="analysis-bar bar">
					<div class="fringe" />
				</div>
			</div>
			<div class="analysis-text theme-color">
				解析中...
			</div>
		</div>
		<no-map v-else-if="active === 5" /> <!--首页无地图显示空白-->
	</div>
</div>
</template>

<script setup>
import {computed, ref, watch} from "vue";

import {LOADING_STATE} from "@/utils/js/loadingStateTypes";
import NoMap from "@/components/NoMap.vue";

const props = defineProps({
	total: {
		type: Number,
		required: true
	},
	speed: {
		type: Number,
		required: true
	},
	loaded: {
		type: Number,
		required: true
	},
	progress: {
		type: Number,
		default: 0
	},
	state: {
		type: Number,
		required: true
	},
	homePage: {
		type: Boolean,
		default: false
	}
});

const active = ref(0);
const percentage = computed(() => Math.ceil(props.progress * 100));

watch(
	() => props.state,
	(val) => {
		switch (val) {
		case LOADING_STATE.GET_DATA:
			active.value = 1;
			break;
		case LOADING_STATE.DOWNLOAD_MAP:
			active.value = 2;
			break;
		case LOADING_STATE.PARSING_MAP:
			active.value = 3;
			break;
		case LOADING_STATE.PARSE_FINISH:
			active.value = 0;
			break;
		case LOADING_STATE.DOWNLOAD_FAILED:
			active.value = 4;
			break;
		case LOADING_STATE.NO_MAP:
			active.value = 5;
		}
	},
	{immediate: true}
);

const formatMapSize = (size, index = 0) => {
	const unit_list = ["B", "KB", "M", "G", "T"];
	if (size > 1024 && index < unit_list.length) {
		size /= 1024;
		return formatMapSize(size, ++index);
	} else {
		return size.toFixed(2) + unit_list[index];
	}
};
</script>

<style scoped lang="scss">
$bar-w: 240px;

.map-loading {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #fff;
	z-index: 999;
}

.map-loading-content {
	width: $bar-w;
}

.rotation-loading {
	text-align: center;

	.loading-icon {
		display: inline-block;
		width: 36px;
		height: 36px;
		text-align: center;
		animation: round_animate 5s linear infinite;
	}

	.loading-text {
		margin-top: 10px;
	}
}

@keyframes round_animate {
	to {
		transform: rotate(1turn);
	}
}

.loading-info {
	display: flex;
	justify-content: space-between;
	color: #748BA4;
	font-size: 12px;
	margin-top: 16px;
}

.analysis-text {
	text-align: center;
	font-size: 12px;
	margin-top: 16px;
}

.bar {
	width: $bar-w;
	height: 6px;
	box-sizing: border-box;
	border-radius: 4px;
	background-color: #E3EBF0;
}

.warning {
	color: #F56C6C;
}

@keyframes fall_down {
	0% {
		transform: translate(0, -20px);
	}
	100% {
		transform: translate(0, -600px);
	}
}

.loading-progress {
	position: relative;
	height: 300px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	overflow-y: clip;

	:deep(.el-progress-bar) {
		.el-progress-bar__outer {
			background-color: #E3EBF0;
			overflow: visible;
		}

		.el-progress-bar__inner {
			transition: none;

			.el-progress-bar__innerText {
				position: relative;
				bottom: 28px;
				left: 24px;
				display: inline-block;
				padding: 5px 8px;
				color: #fff !important;
				border-radius: 2px;
				margin-bottom: 6px;
				margin-left: -60px;

				&:before {
					position: absolute;
					bottom: -11px;
					left: calc(50% - 6px);
					content: "";
					display: inline-block;
					width: 0;
					height: 0;
					border: 6px solid transparent;
				}
			}
		}
	}

	.fall-down :deep(.el-progress-bar) .el-progress-bar__innerText {
		transform-origin: bottom;
		scale: -1;
		transform: translate(0, -600px);
		animation: fall_down 1s cubic-bezier(0.45, 0.04, 1, 1);
	}

	.tips { // 多了这一行字但是不能把进度条挤下去了
		position: absolute;
		top: 100px;
		width: 100%;
		text-align: center;
	}
}

.analysis-loading {
	.analysis-bar {
		position: relative;
		overflow: hidden;

		.fringe {
			position: absolute;
			left: 0;
			top: 0;
			height: 100%;
			width: 100%;
			background-size: 15px 15px;
			animation: progressMove 4s linear infinite;
		}
	}
}

@keyframes progressMove {
	0% {
		background-position: 0;
	}
	100% {
		background-position: 240px;
	}
}

.index-theme .loading-icon,
.custom-theme-blue .loading-icon {
	background: url("@/assets/images/common/loading_blue.png") no-repeat;
}

.custom-theme-green .loading-icon {
	background: url("@/assets/images/common/loading_green.png") no-repeat;
}

.custom-theme-green {
	.theme-color {
		color: #3EB2A9;
	}

	.progress-tooltip:after {
		border-top-color: #3EB2A9;
	}

	.progress-tooltip {
		background-color: #3EB2A9;
	}

	.analysis-bar {
		background: linear-gradient(#E3EBF0 50%, #3EB2A963 50%);
	}

	.fringe {
		background: linear-gradient(-45deg, #3EB2A9 25%, transparent 0, transparent 50%, #3EB2A9 0, #3EB2A9 75%, transparent 0);
	}
}

.custom-theme-blue {
	.theme-color {
		color: #3995FF;
	}

	.progress-tooltip:after {
		border-top-color: #3995FF;
	}

	.progress-tooltip {
		background-color: #3995FF;
	}

	.analysis-bar {
		background: linear-gradient(#C5E0FF 50%, #1A5FB063 50%);
	}

	.fringe {
		background: linear-gradient(-45deg, #50A2FF 25%, transparent 0, transparent 50%, #50A2FF 0, #50A2FF 75%, transparent 0);
	}
}

// 首页样式
.index-theme.map-loading {
	background-color: transparent;
	pointer-events: none;
	font-family: "DingTalk JinBuTi", sans-serif;

	.theme-color {
		color: #71AEFF;
	}

	:deep(.el-progress-bar) {
		.el-progress-bar__outer {
			background-color: #263B62;
		}
	}

	.analysis-bar {
		background: linear-gradient(rgba(38, 59, 98, 0) 50%, #1A5FB063 50%);
	}

	.fringe {
		background: linear-gradient(-45deg, #263B62 25%, transparent 0, transparent 50%, #263B62 0, #263B62 75%, transparent 0) 0 0/15px 15px;
	}

	.analysis-bg {
		background-color: #4786DA;
		border-radius: 4px;
	}

	.loading-info {
		color: #94A6BE;
	}
}
</style>
<style>
.index-theme .el-progress-bar .el-progress-bar__outer .el-progress-bar__inner,
.custom-theme-blue .el-progress-bar .el-progress-bar__outer .el-progress-bar__inner {
	background-color: #3995FF;
}

.custom-theme-green .el-progress-bar .el-progress-bar__inner {
	background-color: #3EB2A9;
}

.index-theme .el-progress-bar .el-progress-bar__outer .el-progress-bar__inner .el-progress-bar__innerText:before,
.custom-theme-blue .el-progress-bar .el-progress-bar__outer .el-progress-bar__inner .el-progress-bar__innerText:before {
	border-top-color: #3995FF;
}

.index-theme .el-progress-bar .el-progress-bar__innerText,
.custom-theme-blue .el-progress-bar .el-progress-bar__innerText {
	background-color: #3995FF;
}

.custom-theme-green .el-progress-bar .el-progress-bar__outer .el-progress-bar__inner .el-progress-bar__innerText:before {
	border-top-color: #3EB2A9;
}

.custom-theme-green .el-progress-bar .el-progress-bar__innerText {
	background-color: #3EB2A9;
}
</style>
