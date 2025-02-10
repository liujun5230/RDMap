<template>
<div class="flex flex-col items-center font-main">
	<fk-icon
		:color="props.color"
		:size="icon_size"
	>
		<empty-icon v-if="props.type === 'default'" />
		<chart-empty-icon v-else />
	</fk-icon>
	<span
		class="text-[0.75rem] leading-none mt-[6px]"
		:class="[small ? 'mt-[2px]' : 'mt-[6px]']"
		:style="{color: props.color}"
	>暂无数据</span>
</div>
</template>

<script setup lang="ts">
import {computed} from "vue";

import FkIcon from "@/components/ForThink/FkIcon.vue";
import EmptyIcon from "~icons/decoration/empty";
import ChartEmptyIcon from "~icons/decoration/chart-empty";
import {small} from "@/utils/ts/breakpoints";

interface Props {
	size?: number | string,
	color?: string,
	type?: string
}

const props = withDefaults(defineProps<Props>(), {
	size: undefined,
	color: "#95a5be",
	type: "default"
});

const icon_size = computed(() => {
	if (props.size) return props.size;
	return small.value ? 42 : 60;
});
</script>
