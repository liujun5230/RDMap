<template>
<div
	ref="container_element"
	class="flex gap-x-[10px] items-center"
>
	<div
		class="overflow-hidden relative"
		:style="{width: show_paginator ? 'calc(100% - 54px)' : '100%'}"
	>
		<ul
			ref="scroll_container_element"
			class="flex gap-x-[10px] items-center text-minor-2 transition"
			:style="{transform: `translateX(${translate_x}px)`}"
		>
			<template
				v-for="(tab, index) in props.tabs"
			>
				<li
					:id="tab.key"
					:key="tab.label"
					class="cursor-pointer flex-none"
					:class="{'tab-active': tab.key === props.value}"
					@click="handleClick(tab)"
				>
					{{ tab.label }}:{{ props.data[tab.key] }}
				</li>
				<li
					v-if="index !== props.tabs.length - 1"
					:key="`${tab.label}-${tab.key}`"
					class="divide-line flex-none"
				/>
			</template>
		</ul>
	</div>
	<div
		v-if="show_paginator"
		class="float-none flex items-center gap-x-[4px]"
	>
		<fk-icon
			size="24"
			:color="left_paginator_disabled ? '#5a6b85' : '#71aeff'"
			class="hover-icon hover:text-minor-1 rotate-90"
			:class="[left_paginator_disabled ? 'cursor-not-allowed' : 'cursor-pointer']"
			@click="handleDirection('left')"
		>
			<paginator-icon />
		</fk-icon>
		<fk-icon
			size="24"
			:color="right_paginator_disabled ? '#5a6b85' : '#71aeff'"
			class="hover-icon hover:text-minor-1 -rotate-90"
			:class="[right_paginator_disabled ? 'cursor-not-allowed' : 'cursor-pointer']"
			@click="handleDirection('right')"
		>
			<paginator-icon />
		</fk-icon>
	</div>
</div>
</template>

<script setup lang="ts">
import {ref, computed, watch, nextTick} from "vue";
import {useEventListener} from "@vueuse/core";

import FkIcon from "@/components/ForThink/FkIcon.vue";
import PaginatorIcon from "~icons/operation/expand-table";

interface Tabs {
	label: string,
	key: string
}

interface Props {
	value: string,
	tabs: Tabs[];
	data: Record<string, number>
}

const props = defineProps<Props>();

const emits = defineEmits<{
	(event: "input", value: string): void,
	(event: "tab-click", value: Tabs): void
}>();

let tab_element_offset: Record<string, number> = {};

const container_element = ref<HTMLElement | null>(null);
const scroll_container_element = ref<HTMLElement | null>(null);
const show_paginator = ref(false);
const translate_x = ref(0);
const translate_step = ref(0);

const tab_keys = computed(() => props.tabs.map(({key}) => key));
const tab_data_arr = computed(() => Object.keys(props.data || {}).map((key) => props.data[key]));
const left_paginator_disabled = computed(() => translate_step.value <= 0);
const right_paginator_disabled = computed(() => translate_step.value >= tab_keys.value.length - 1);

useEventListener("resize", () => handleResize(true));

watch(() => tab_keys.value.join(","), () => {
	handleResize(false);
}, {
	immediate: true
});
// 数据变化会影响scrollWidth
watch(tab_data_arr, (new_value, old_value) => {
	if (new_value.join(",") !== old_value.join(",")) {
		handleResize(false);
	}
});
watch(() => props.value, (active_key) => {
	handleActiveKeyTranslate(active_key);
}, {immediate: true});

function showPaginator() {
	show_paginator.value = scroll_container_element.value!.scrollWidth > container_element.value!.clientWidth;
}

function getPerTabElementOffset() {
	const obj: Record<string, number> = {};
	if (!scroll_container_element.value) return obj;
	const {tabs} = props;
	for (const {key} of tabs) {
		const tab_element = scroll_container_element.value.querySelector<HTMLElement>(`#${key}`);
		if (tab_element) {
			obj[key] = tab_element.offsetLeft;
		}
	}
	return obj;
}

function handleResize(is_anchor_active: boolean) {
	nextTick(() => {
		showPaginator();
		tab_element_offset = getPerTabElementOffset();
		is_anchor_active ? handleActiveKeyTranslate(props.value) : handleTranslate(show_paginator.value ? translate_step.value : 0);
	});
}

function handleTranslate(index: number) {
	if (index < 0) {
		translate_step.value = 0;
		return;
	}
	if (index >= tab_keys.value.length) {
		translate_step.value = tab_keys.value.length - 1;
		return;
	}
	translate_step.value = index;
	const tab_key = tab_keys.value[translate_step.value];
	translate_x.value = -tab_element_offset[tab_key];
}

function handleActiveKeyTranslate(active_key: string) {
	if (show_paginator.value) {
		const find_index = tab_keys.value.findIndex((key) => key === active_key);
		handleTranslate(find_index);
	} else {
		handleTranslate(0);
	}
}

function handleDirection(direction: "left" | "right") {
	if (direction === "left" && left_paginator_disabled.value) return;
	if (direction === "right" && right_paginator_disabled.value) return;
	const step = direction === "left" ? translate_step.value - 1 : translate_step.value + 1;
	handleTranslate(step);
}

function handleClick(tab: Tabs) {
	if (tab.key !== props.value) {
		emits("input", tab.key);
		emits("tab-click", tab);
	}
}
</script>

<style scoped>
.divide-line {
    display: inline-block;
    height: 10px;
    border-right: 2px solid #5A6B85;
}

.tab-active {
    color: var(--primary);
}
</style>
