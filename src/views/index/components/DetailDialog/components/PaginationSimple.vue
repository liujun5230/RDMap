<template>
<div class="flex items-center gap-x-[4px]">
	<fk-icon
		size="24"
		:color="left_paginator_disabled ? '#5a6b85' : '#71aeff'"
		class="hover-icon hover:text-minor-1"
		:class="[left_paginator_disabled ? 'cursor-not-allowed' : 'cursor-pointer']"
		@click="handlePaginationChange('prev')"
	>
		<paginator-icon />
	</fk-icon>
	<div class="text-minor-2 select-none">
		<span>{{ page }}</span>
		<span>/</span>
		<span>{{ max_page }}</span>
	</div>
	<fk-icon
		size="24"
		:color="right_paginator_disabled ? '#5a6b85' : '#71aeff'"
		class="hover-icon hover:text-minor-1 -rotate-180"
		:class="[right_paginator_disabled ? 'cursor-not-allowed' : 'cursor-pointer']"
		@click="handlePaginationChange('next')"
	>
		<paginator-icon />
	</fk-icon>
</div>
</template>

<script setup lang="ts">
import {computed} from "vue";

import FkIcon from "@/components/ForThink/FkIcon.vue";
import PaginatorIcon from "~icons/operation/paginator";

const emits = defineEmits<{
	(event: "update:page", value: number): void,
	(event: "current-change", value: number): void,
}>();

interface Props {
	page: number,
	total: number,
	limit?: number
}
const props = withDefaults(defineProps<Props>(), {
	limit: 300
});

const left_paginator_disabled = computed(() => props.page <= 1);
const max_page = computed(() => Math.ceil(props.total / props.limit) || 1);
const right_paginator_disabled = computed(() => props.page >= max_page.value);

function handlePaginationChange(type: "prev" | "next") {
	if (type === "prev" && left_paginator_disabled.value) return;
	if (type === "next" && right_paginator_disabled.value) return;
	const {page} = props;
	const current_page = type === "prev" ? page - 1 : page + 1;
	emits("update:page", current_page);
	emits("current-change", current_page);
}
</script>
