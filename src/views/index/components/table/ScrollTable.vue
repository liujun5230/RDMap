<template>
<el-table
	ref="table_ref"
	:data="props.data"
	v-bind="$attrs"
	:row-class-name="setRowClassName"
	:indent="0"
	v-on="$listeners"
	@mouseenter.native="mouseenter"
	@mouseleave.native="mouseleave"
>
	<slot />
	<template #empty>
		<slot name="empty" />
	</template>
</el-table>
</template>

<script lang="ts">
export default {
	inheritAttrs: false
};
</script>
<script setup lang="ts">
import {onMounted, ref, watch, useAttrs} from "vue";
import {useTimeoutPoll} from "@vueuse/core";
import type {ElTable} from "element-ui/types/table";

const props = withDefaults(defineProps<{autoScroll?: boolean, data: any[]}>(), {autoScroll: false});

const table_ref = ref();
const INTERVAL = 50;

const {resume, pause} = useTimeoutPoll(rollStart, INTERVAL);
const attrs = useAttrs();

watch(
	() => props.autoScroll,
	(val) => {
		if (val) {
			resume();
		} else {
			pause();
		}
	}
);

function mouseenter() {
	if (!props.autoScroll) return;
	pause();
}

function mouseleave() {
	if (!props.autoScroll) return;
	resume();
}

let box:HTMLElement, content: HTMLElement;

function rollStart() {
	if (!props.data.length) return;
	if (box.scrollTop + 1 >= (content.scrollHeight - box.offsetHeight) && box.scrollTop !== 0) { // box.scrollTop !== 0 防止初次加载后栈溢出
		pause();
		setTimeout(() => {
			box.scrollTop = 0;
			waitBackToTop(startScrollFromTop);
		}, 2000); // 等待2秒再回到顶部 防止滚动条过短出现抽搐
	} else { // 高度不足以出现滚动条也会走这里 但是++没用 就没管
		// 1 / window.devicePixelRatio + 0.05 谷歌的缩放比没问题，火狐的小于缩放比100还是滚不动
		// Math.ceil(1 / window.devicePixelRatio) 都可以  但是就是缩放比越小，滚动的越快
		const step = Math.ceil(1 / window.devicePixelRatio);
		box.scrollTop += step;
	}
}

function startScrollFromTop() {
	box.scrollTop = 0;
	resume();
}

let timer: number; // 谷歌暂不支持onscrollend事件 平替一下
function waitBackToTop(cb: Function) {
	timer = window.setInterval(() => checkBackToTop(cb), 100);
}

function checkBackToTop(cb: Function) {
	if (box.scrollTop === 0) {
		clearInterval(timer);
		cb();
	}
}

function setRowClassName({row, rowIndex}: {row: any, rowIndex: number}): string {
	const assert_attrs = attrs as any;
	const {children: children_key, parent: parent_key = "pid"} = assert_attrs["tree-props"] ?? {};
	const maybeRowClassNameFn = assert_attrs["row-class-name"] as typeof setRowClassName | string | undefined;
	let row_class_name = typeof maybeRowClassNameFn === "function" ? maybeRowClassNameFn({row, rowIndex}) : (maybeRowClassNameFn || "");
	if (children_key && !row[parent_key] && !row[children_key]?.length) {
		row_class_name = `row-level-none ${row_class_name}`;
	}
	return row_class_name;
}

onMounted(() => {
	box = table_ref.value.$el.querySelector(".el-table__body-wrapper");
	content = table_ref.value.$el.querySelector(".el-table__body");
	if (props.autoScroll) {
		startScrollFromTop();
	}
});

defineExpose({
	getTableIns: () => table_ref.value!
});
</script>

<style scoped>

</style>
