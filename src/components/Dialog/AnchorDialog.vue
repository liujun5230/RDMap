<template>
<!-- vue2.7的$attrs类型定义不够完善，暂时忽略类型检查 -->
<!-- @vue-ignore -->
<base-dialog
	v-bind="$attrs"
	custom-class="anchor-dialog"
	:width="width"
	:height="height"
	:show-footer="showFooter"
	v-on="$listeners"
	@opened="onOpened"
>
	<div
		class="anchor-dialog-body"
	>
		<div class="anchor-menu-wrap">
			<ul>
				<li
					v-for="item in menus"
					:key="item.id"
					class="menu-item"
					:class="{active: active_menu.id === item.id}"
					@click="handleMenuClick(item)"
				>
					{{ item.name }}
				</li>
			</ul>
		</div>
		<div
			ref="anchor_content"
			v-loading="loading"
			class="anchor-content"
			:style="{overflow: loading ? 'hidden' : 'auto'}"
		>
			<template v-if="!anchorElements">
				<div
					v-for="(item, index) in menus"
					:id="item.id"
					:key="item.id"
					class="menu-item-content"
					:style="index === menus.length - 1 ? last_menu_style : undefined"
				>
					<div class="menu-item-content-title">
						<anchor-title
							:title="item.name"
							:required="item.required"
						/>
						<slot :name="`title_${item.id}`">
							<fk-icon
								v-if="item.icon"
								:tip="item.icon_tip"
								:size="item.icon_size || 16"
								style="margin-left: 4px;--text-color:var(--menu-icon-text)"
							>
								<component :is="item.icon" />
							</fk-icon>
						</slot>
					</div>
					<slot :name="item.id" />
				</div>
			</template>

			<slot v-if="anchorElements" />
		</div>
	</div>
</base-dialog>
</template>

<script lang="ts">
export default {
	inheritAttrs: false
};
</script>
<script setup lang="ts">
import type {Component, Ref} from "vue";
import {nextTick, ref, shallowRef, watch, computed} from "vue";
import type {MaybeElementRef} from "@vueuse/core";
import {unrefElement, useScroll, useWindowSize} from "@vueuse/core";

import AnchorTitle from "@/components/AnchorTitle.vue";
import FkIcon from "@/components/ForThink/FkIcon.vue";

import BaseDialog from "./BaseDialog.vue";

export interface MenuItem {
	name: string,
	id: string,
	required?: boolean,
	icon?: Component,
	icon_size?: number | string,
	icon_tip?: string
}

export interface Props {
	menus: MenuItem[],
	showFooter?: boolean,
	loading?: boolean,
	width?: string,
	height?: number | string,
	anchorElements?: Record<MenuItem["id"], Ref<HTMLElement | null>>,
	calculateOffsetOccasion?: "opened" | "watch" | "both"
}
const props = withDefaults(defineProps<Props>(), {
	showFooter: true,
	loading: false,
	width: "888px",
	height: "810",
	anchorElements: undefined,
	calculateOffsetOccasion: "opened"
});

type MenuContentOffset = Record<MenuItem["id"], {offset_height: number, offset_top: number}>;
const anchor_content = ref<HTMLElement | null>(null);
const active_menu = shallowRef<MenuItem>({name: props.menus[0]?.name, id: props.menus[0]?.id});
const menu_content_offset = shallowRef<MenuContentOffset>({});

const last_menu_style = computed(() => {
	window_height.value;
	const anchor_content_height = anchor_content.value?.offsetHeight ?? 0;
	const last_menu_id = props.menus.slice(-1)[0]?.id;
	const last_menu_height = menu_content_offset.value[last_menu_id]?.offset_height ?? 0;
	const fill_height = anchor_content_height - last_menu_height;
	if (fill_height <= 0) return undefined;
	return {marginBottom: `${fill_height}px`};
});

const {y: scroll_top} = useScroll(anchor_content);
const {height: window_height} = useWindowSize();

watch(() => props.menus, (new_menus) => {
	const {calculateOffsetOccasion} = props;
	active_menu.value = {name: new_menus[0]?.name, id: new_menus[0]?.id};
	if (calculateOffsetOccasion === "watch" || calculateOffsetOccasion === "both") {
		if (new_menus.length) {
			nextTick(() => {
				menu_content_offset.value = getOffsetTops();
			});
		}
	}
}, {immediate: false});

watch(scroll_top, (new_value) => {
	scrollToMenu(new_value);
});

function onOpened() {
	const {menus, calculateOffsetOccasion} = props;
	active_menu.value = {name: menus[0]?.name, id: menus[0]?.id};
	if (calculateOffsetOccasion === "opened" || calculateOffsetOccasion === "both") {
		menu_content_offset.value = getOffsetTops();
	}
}

function handleMenuClick(item: MenuItem) {
	const {anchorElements} = props;
	active_menu.value = item;
	if (!anchorElements) {
		const anchor_element = anchor_content.value!.querySelector(`#${item.id}`) as HTMLElement | null;
		scrollToAnchor(anchor_element);
	} else {
		scrollToAnchor(anchorElements[item.id]);
	}
}

function getOffsetTops() {
	const {menus, anchorElements} = props;
	const menu_content_offset: MenuContentOffset = {};
	if (anchorElements) {
		Object.entries(anchorElements).forEach(([id, element]) => {
			if (element.value) {
				menu_content_offset[id] = {
					offset_height: element.value.offsetHeight,
					offset_top: element.value.offsetTop,
				};
			}
		});
	} else {
		menus.forEach(({id}) => {
			const element = anchor_content.value?.querySelector(`#${id}`) as HTMLElement | null;
			if (element) {
				menu_content_offset[id] = {
					offset_height: element.offsetHeight,
					offset_top: element.offsetTop,
				};
			}
		});
	}

	return menu_content_offset;
}

function scrollToAnchor(maybe_element: MaybeElementRef) {
	const element = unrefElement(maybe_element);
	if (element instanceof HTMLElement) {
		element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
	}
}
function scrollToMenu(scroll_top: number) {
	const {menus} = props;
	let offset = Math.abs(menu_content_offset.value[menus[0].id].offset_top - scroll_top);
	let menu_index = 0;
	let first_menu = menus[0];

	Object.values(menu_content_offset.value).forEach(({offset_top}) => {
		const cur_offset = Math.abs(offset_top - scroll_top);
		if (cur_offset < offset) {
			first_menu = menus[menu_index];
			offset = cur_offset;
		}
		menu_index += 1;
	});
	active_menu.value = first_menu;
}
</script>

<style scoped>
.el-dialog__wrapper {
	--menu-text: var(--theme-text-color-normal);
	--menu-text-hover: var(--theme-text-color-gray);
	--menu-text-active: var(--theme-color);
	--menu-border-color: #ebeef5;
	--menu-w: 160px;
	--gap-x: 16px;
	--menu-content-gap-y: 30px;
	--menu-content-title-gap-y: 16px;
	--menu-icon-text: var(--theme-text-color-normal);
}

:deep(.anchor-dialog.base-dialog) {

	.content-body {
		display: flex;
	}
}

.anchor-dialog-body {

	width: 100%;
	display: flex;
	column-gap: var(--gap-x);
	overflow: hidden;
	padding: 16px 0 0 16px;

	.anchor-menu-wrap {
		flex: 0 0 auto;
		width: var(--menu-w);
		border-right: 1px solid var(--menu-border-color);

		.menu-item {
			padding: 7px 16px;
			font-size: 14px;
			font-weight: 400;
			line-height: 22px;
			color: var(--menu-text);

			&:hover:not(.active) {
				cursor: pointer;
				background-color: var(--theme-list-item-hover-bg);
				color: var(--menu-text-hover);
			}

			&.active {
				cursor: pointer;
				background-color: var(--theme-list-item-hover-bg);
				color: var(--menu-text-active);
			}
		}
	}

	.anchor-content {
		width: 100%;
		padding-right: 10px;
		position: relative;
		top: 0;

		.menu-item-content-title {
			display: flex;
			align-items: center;
			margin-bottom: var(--menu-content-title-gap-y);
		}

		.menu-item-content {
			margin-bottom: var(--menu-content-gap-y);
		}

		:deep(.el-input-group__append) {
			color: var(--theme-text-color-normal, #a2b2c2);
		}
	}
}
</style>
