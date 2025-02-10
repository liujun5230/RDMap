<template>
<div class="alarm-popup">
	<div class="alarm-popup__container">
		<div class="alarm-panel__container-label">
			{{ props.levelText }}
		</div>
		<div class="alarm-panel__container-content">
			<div class="title">
				<el-tooltip
					:content="`【${props.title}】`"
					placement="bottom"
					:disabled="props.title.length <= 20"
				>
					<span class="title-primary">
						【{{ title }}】
					</span>
				</el-tooltip>
				<span class="title-sub">
					<text-ellipsis
						style="width:100%;"
						placement="top"
						popper-class="content-msg-tooltip"
					>
						{{ trigger_area }}
					</text-ellipsis>
				</span>
			</div>
			<div class="btn-group">
				<fk-icon
					v-show="props.btn.includes('view')"
					tip="查看"
					color="#606266"
					hover-color="#303133"
					active-color="#000000"
					placement="bottom"
					popper-class="alarm-popper"
					@click="emit('view')"
				>
					<view-details />
				</fk-icon>

				<fk-icon
					v-show="props.btn.includes('locate')"
					tip="定位"
					color="#606266"
					hover-color="#303133"
					active-color="#000000"
					placement="bottom"
					popper-class="alarm-popper"
					@click="emit('locate')"
				>
					<icon-locate />
				</fk-icon>

				<fk-icon
					v-show="props.btn.includes('close')"
					tip="关闭"
					color="#606266"
					hover-color="#303133"
					active-color="#000000"
					placement="bottom"
					popper-class="alarm-popper"
					@click="emit('close')"
				>
					<icon-close />
				</fk-icon>
			</div>
			<div class="alarm-content">
				<text-ellipsis
					style="width: 100%;"
					:line-clamp="2"
					placement="bottom"
					popper-class="alarm-msg-tooltip"
				>
					<span v-if="props.triggerObject">触发对象：{{ props.triggerObject }}</span>
					<br v-if="props.content && props.triggerObject">
					<span v-if="props.content">内容：{{ props.content }}</span>
				</text-ellipsis>
			</div>
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
import {computed} from "vue";

import FkIcon from "../ForThink/FkIcon.vue";
import IconClose from "~icons/operation/close";
import IconLocate from "~icons/operation/locate";
import ViewDetails from "~icons/operation/view-details";
import TextEllipsis from "../TextEllipsis.vue";
import type {AlarmStyle} from "./AlarmStyle";

import "@/utils/css/iconFonts/operationIcon.css";

export type FnButton = "view" | "locate" | "close";
export type Props = {
	// 闪屏
	flash: boolean,

	// 级别文案
	levelText: string,

	// 触发内容
	content?: string,

	// 触发对象
	triggerObject?: string,

	title: string,

	// 所在区域
	areaName?: string,

	popupStyle: AlarmStyle

	btn: FnButton[]
}

const props = defineProps<Props>();

const emit = defineEmits(["close", "view", "locate"]);

const title = computed(() => props.title.length > 20 ? props.title.slice(0, 20) + "..." : props.title);
const trigger_area = computed(() => props.areaName ? `（${props.areaName}）` : props.areaName);
const bg_color = computed(() => props.popupStyle?.background_color ?? "#F56C6C");
</script>

<style scoped>
.alarm-popup {
	width: 100%;
	min-height: 64px;
	border-radius: 8px;
	font-family: "Microsoft YaHei", sans-serif;
	display: flex;
	place-content: center;
}

.alarm-popup * {
	box-sizing: border-box;
}

.alarm-popup__container {
	display: grid;
	grid-template-columns: auto auto;
	justify-content: center;
	box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.12);
}

.alarm-panel__container-label {
		min-width: 76px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
		line-height: 22px;
    font-weight: bold;
    height: 100%;
    background-color: v-bind("bg_color");
    pointer-events: auto;
		padding-inline: 12px;
		color: #fff;
		border-radius: 8px 0 0 8px;
  }

.alarm-panel__container-content {
	display: grid;
	grid-template-columns: 1fr auto;
	grid-template-rows: 16px 1fr;
	row-gap: 6px;
	grid-template-areas: "title btn-group" "content content";
	width: 532px;
	padding: 10px 12px;
	border-radius: 0 8px 8px 0;

	color: v-bind("props.popupStyle?.color");
	background: #FFFEFD;

	pointer-events: auto;
}

.title {
	grid-area: title;
	white-space: nowrap;

	color:#303133;
	font-size: 14px;
	font-weight: bold;

	display: grid;
	align-items: center;
	grid-template-columns: max-content auto;
	line-height: 16px;

}

.title-primary {
	display: inline-block;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
}

.title-sub {
	display: inline-block;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
}

.btn-group {
	display: flex;
	justify-content: space-around;
	column-gap: 14px;
	align-items: center;
	user-select: none;
	grid-area: btn-group;

	i {
		cursor: pointer;
		pointer-events: auto;
	}
}

.alarm-content {
	grid-area: content;
	color: #606266;
	font-size: 14px;
	line-height: 22px;
	/* 最多两行 */
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>

<style>
.content-msg-tooltip, .alarm-popper{
	max-width: 650px;
}

.alarm-msg-tooltip {
	max-width: 650px;
  transform: translate(190px, 12px);
	font-family: 'Noto Sans SC', sans-serif;
}

.custom-theme-blue .alarm-msg-tooltip.el-tooltip__popper,
.custom-theme-green .alarm-msg-tooltip.el-tooltip__popper {
	line-height: 20px;
}

.content-msg-tooltip,
.alarm-msg-tooltip,
.alarm-popper {
	z-index: 9999 !important;
}
</style>
