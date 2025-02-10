<template>
<div>
	<el-drawer
		v-for="item in dialog_list"
		:id="item.category"
		:key="item.category"
		v-drag="{trigger: '.module-header'}"
		:direction="item.direction"
		:visible="item.visible"
		:class="drawer_class"
		:with-header="false"
		:modal="false"
		:wrapper-closable="false"
		:modal-append-to-body="false"
		:close-on-press-escape="false"
		:show-close="false"
		:custom-class="item.custom_class"
		append-to-body
		destroy-on-close
	>
		<component
			:is="category_component_map[item.category]"
			:category="item.category"
		/>
	</el-drawer>
</div>
</template>

<script lang="ts">
export default {
	name: "DetailDialogContainer"
};
</script>
<script setup lang="ts">
import {computed} from "vue";

import {useStore} from "@/store";
import {getDragDirectiveOptions} from "@/utils/js/directive/drag";
import {isHomePage} from "@/utils/ts/common";

import {useDetailDialogStore} from "@index/store";

import {category_component_map} from "./constant";

const vDrag = getDragDirectiveOptions();

const props = withDefaults(defineProps<{
	customDrawerClass?: string
}>(), {
	customDrawerClass: ""
});

const detail_dialog_store = useDetailDialogStore();

const dialog_list = computed(() => Object.values(detail_dialog_store.dialog_list));
const drawer_class = computed(() => `detail-dialog-wrapper home-var ${isHomePage() ? "" : "backstage"} ${props.customDrawerClass}`);
const backstage_draw_left = computed(() => {
	return store.getters.sidebar.open && !isHomePage() ? "240px" : "92px";
});

const store = useStore();
</script>

<style lang="scss">
.detail-dialog-wrapper.el-drawer__wrapper {
	pointer-events: none;

	.el-drawer.ltr,
	.el-drawer.rtl {
		top: unset;
		bottom: 12px;
	}

	&.backstage .el-drawer.ltr,
	&.backstage .el-drawer.rtl {
		bottom: 24px;
	}

	.el-drawer {
		pointer-events: all;
		background: rgba(20, 34, 56, 0.95);
		border-radius: 8px;
		box-shadow: none;

		&.rtl {
			right: var(--module-padding);
		}

		&.ltr {
			left: var(--module-padding);
		}
	}

	&.backstage .el-drawer {
		&.rtl {
			right: 24px;
		}

		&.ltr {
			left: v-bind("backstage_draw_left");
		}
	}

	.el-drawer__body {
		padding: p(14) p(20) p(10) p(20);
		border-radius: 8px;
		font-family: "DingTalk JinBuTi";
		font-size: clamp(12px, p(14), 16px);
		color: var(--text-main-1);
		overflow: hidden;
	}

	.module-header {
		cursor: move;
		user-select: none;
	}
}
</style>
