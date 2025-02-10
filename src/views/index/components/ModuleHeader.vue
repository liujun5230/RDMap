<template>
<div class="module-header">
	<div class="title">
		<div class="title-text">
			<text-ellipsis
				placement="top"
				:style="title_text_style"
			>
				{{ props.title }}
			</text-ellipsis>
		</div>
		<slot name="icon" />
		<img
			src="@/assets/images/index/module-header-icon.png"
			:class="[large ? 'w-[54px]' : small ? 'w-[38px]' : 'w-[44px]']"
		>
	</div>
	<div class="operate">
		<slot name="operate" />
	</div>
</div>
</template>

<script setup lang="ts">
import {computed} from "vue";

import {small, large, medium} from "@/utils/ts/breakpoints";
import TextEllipsis from "@/components/TextEllipsis.vue";

export interface Props {
	title: string | undefined,
}

const props = defineProps<Props>();

const title_text_style = computed(() => {
	if (small.value) return {maxWidth: "110px"};
	if (medium.value) return {maxWidth: "150px"};
	return {maxWidth: "180px"};
});

</script>

<style scoped lang="scss">
.module-header {
    position: relative;
    height: calc(2 * var(--r));
    background: url("@/assets/images/index/module-header-bg.png") left top / contain no-repeat;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: none;
}

.module-header .title {
    display: flex;
    align-items: center;
    column-gap: p(6);
    padding-left: p(25);
    font-family: XieHei;
    font-size: max(var(--r), 12px);
    font-weight: 900;
    background: linear-gradient(180deg, #FFF 55.78%, #95C2FF 84.69%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.module-header .title-text {
    position: relative;
    padding: 0 1px;
    background: linear-gradient(180deg, #FFF 55.78%, #95C2FF 84.69%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.module-header .title-text .fk-text-ellipsis {
    vertical-align: text-bottom;
}

.module-header .operate {
    font-size: max(var(--r), 12px);
    line-height: 1;
}
</style>
