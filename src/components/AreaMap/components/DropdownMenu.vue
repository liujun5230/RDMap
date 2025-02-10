<template>
<div class="dropdown-menu-container">
	<button
		v-for="item in menu_items"
		:key="item.id"
		:disabled="item.disabled"
		class=" menu-button"
		:class="{'text-primary': selected_key === item.value}"
		@click.stop="onClickMenu(item)"
	>
		{{ item.label }}
	</button>
</div>
</template>

<script setup lang="ts">
import {computed} from "vue";

import {useVModel} from "@vueuse/core";

export type DropdownMenuItem = {
	id: string | number
	label: string
	value: string
	event_handler?: () => void
	disabled?: boolean
	visible?: boolean
}

export type DropdownMenuProps = {
	menuItems: DropdownMenuItem[]
	value?: string
};

const emit = defineEmits<{
	(e: "on-click-menu", value: DropdownMenuItem): void
	(e: "input", value: DropdownMenuItem): void
}>();

const props = defineProps<DropdownMenuProps>();

const selected_key = useVModel(props, undefined, emit);

function onClickMenu(item: DropdownMenuItem) {
	emit("on-click-menu", item);
	if (item.event_handler) {
		item.event_handler();
	}
}

const menu_items = computed(() => {
	return props.menuItems.filter(item => item.visible !== false);
});
</script>

<style scoped>

.dropdown-menu-container {
	color:#E3EEFC;
	font-family: DingTalk JinBuTi;
	padding: 7px;
	background-color: #071831CC;
	border:1px solid rgb(50 73 106);
    backdrop-filter: blur(4px);
	border-radius: 0.25rem;
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	pointer-events: auto;
	align-items: stretch;
}

.menu-button {
  min-width: var(--menu-button-min-width, 94px);
  background-color: #56627A36;
  white-space: nowrap;
  padding:0.25rem 0.5rem;
  cursor: pointer;
  color:#E3EEFC;
  box-sizing: border-box;
  border: 0 solid #e5e7eb;
  &:hover{
	color: rgb(113 174 255);
	background-color: #4283CA33;
  }
  &:focus {
	color: rgb(113 174 255);
  }
  &:active {
	color: rgb(113 174 255);
  }
}
.text-primary {
	color: rgb(113 174 255);
}
</style>
