<template>
<button
	v-bind="$attrs"
	class="label-button"
	:class="{'label-button--small': props.size === 'small', 'label-button--medium': props.size === 'medium'}"
	type="button"
	:disabled="button_disabled"
	v-on="$listeners"
>
	<slot name="icon">
		<i :class="{[props.icon]: true}" />
	</slot>
	<span class="button-content"><slot /></span>
</button>
</template>

<script setup lang="ts">
import {type ElForm} from "element-ui/types/form";
import {inject, computed} from "vue";

import "@/utils/css/customThemes/variables.css";

type Props = {
	size?: "small" | "medium" | "large";
	icon?: string;
	disabled?: boolean;
}

const el_form = inject<ElForm | null>("elForm", null);

const button_disabled = computed(() => props.disabled ? props.disabled : el_form?.disabled);

const props = withDefaults(defineProps<Props>(), {
	size: "small",
	icon: "el-icon-plus"
});
</script>

<style scoped>
.label-button {
  height: 100%;
  display: flex;
  align-items: center;

  border: none;
  font-family: "Microsoft YaHei", Arial, Helvetica, sans-serif;

  cursor: pointer;
  outline: none;
  transition: all 0.1s;

  color: var(--theme-button-color);
  background-color: var(--theme-button-background-color);

	padding-inline: var(--label-button_padding-inline);
	padding-block: var(--label-button_padding-block);
  column-gap: var(--label-button_column-gap);
  font-size: var(--label-button_font-size);
  line-height: var(--label-button_line-height);
  border-radius: var(--label-button_border-radius);
}

.label-button:hover {
  color: var(--theme-button-color-hover);
  background-color: var(--theme-button-background-color-hover);
}

.label-button:active {
  color: var(--theme-button-color-active);
	background-color: var(--theme-button-background-color-active);
}

.label-button:disabled {
  cursor: not-allowed;
  background-color: var(--theme-button-background-color-disabled);
  color: var(--theme-button-color-disabled);
}

.label-button--medium {
	--label-button_padding-inline: 10px;
	--label-button_padding-block: 8px;
	--label-button_column-gap: 4px;
	--label-button_font-size: 14px;
	--label-button_line-height: 16px;
	--label-button_border-radius: 4px;
}

.label-button--small {
	--label-button_padding-inline: 8px;
	--label-button_padding-block: 5px;
	--label-button_column-gap: 2px;
	--label-button_font-size: 12px;
	--label-button_line-height: 14px;
	--label-button_border-radius: 4px;
}
</style>
