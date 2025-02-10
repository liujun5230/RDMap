<template>
<button
	ref="button"
	class="basic-button disabled:opacity-50 disabled:cursor-not-allowed"
	tabindex="-1"
	v-bind="$attrs"
	:disabled="props.disabled"
	@click="handleClick"
>
	<div class="flex items-center justify-center gap-1">
		<icon-loading
			v-if="loading"
			class="animate-spin w-[1rem]"
		/>
		<i
			v-else-if="props.icon"
			class="text-[0.8em]"
		>
			<component :is="props.icon" />
		</i>
		<slot />
	</div>
</button>
</template>

<script lang="ts" setup>
import {computed, ref, watchEffect} from "vue";

import IconLoading from "~icons/operation/loading";

type Props = {
	type?: "primary"| "alert" | "confirm",
	loading?: boolean,
	size?: number | string,
	disabled?: boolean,
	icon?: InstanceType<typeof IconLoading>
}
const emit = defineEmits(["click"]);
const props = withDefaults(defineProps<Props>(), {
	type: "primary",
	loading: false,
	size: 12,
	disabled: false,
	icon: undefined
});

function handleClick() {
	if (props.loading) return;
	emit("click");
}

const theme_config = ref({
	primary: {
		normal: {
			border: "#779AC7",
			color: "var(----text-minor-1, #B2C4DB)",
			background: "linear-gradient(136deg, #5D7FB2 1.12%, #2B3D5A 41.8%, #162133 57.77%, #5A7CAF 100%)"
		},

		hover: {
			border: "#8ABDFF",
			color: "var(--button-highlight-color, #F5F9FF)",
			background: "linear-gradient(141deg, #5596E0 -1.98%, #0F3866 54.41%, #5796DE 106.29%)"
		},

		active: {
			border: "#8ABDFF",
			color: "var(--button-highlight-color, #F5F9FF)",
			background: "linear-gradient(136deg, #4C7AAD 1.12%, #1E3957 52.11%, #223D5C 60.86%, #4977AB 100%), linear-gradient(136deg, #7BA6D8 1.12%, #0F345E 52.11%, #103763 60.86%, #649FE2 100%)"
		}
	},
	alert: {
		normal: {
			border: "#FAD2D7",
			color: "var(--button-highlight-color, #F5F9FF)",
			background: "linear-gradient(139deg, #DB7D83 2.48%, #811A21 52.97%, #B54A51 81.94%)"
		},

		hover: {
			border: "#FAD2D7",
			color: "var(--button-highlight-color, #F5F9FF)",
			background: "linear-gradient(139deg, #F1A8AD 2.48%, #A32830 52.97%, #E87C83 81.94%)"
		},
		active: {
			border: "#FAD2D7",
			color: "var(--button-highlight-color, #F5F9FF)",
			background: "linear-gradient(139deg, #C97E83 2.48%, #892B31 52.97%, #C6525A 81.94%), linear-gradient(139deg, #F1A8AD 2.48%, #A32830 52.97%, #E87C83 81.94%)"
		}
	},
	confirm: {
		normal: {
			border: "#779AC7",
			color: "var(--text-minor-1, #B2C4DB)",
			background: "linear-gradient(141deg, #477CBA -1.98%, #102B49 54.41%, #4684CC 106.29%)"
		},

		hover: {
			border: "#8ABDFF",
			color: "var(--text-main-1, #F5F9FF)",
			background: "linear-gradient(141deg, #5596E0 -1.98%, #0F3866 54.41%, #5796DE 106.29%)"
		},

		active: {
			border: "#8ABDFF",
			color: "var(--text-main-1, #F5F9FF)",
			background: "linear-gradient(136deg, #4C7AAD 1.12%, #1E3957 52.11%, #223D5C 60.86%, #4977AB 100%), linear-gradient(136deg, #7BA6D8 1.12%, #0F345E 52.11%, #103763 60.86%, #649FE2 100%)"
		}
	},
});

const config = computed(() => theme_config.value[props.type]);
const button_size = computed(() => `${props.size}px`);
const button = ref<HTMLButtonElement>();
watchEffect(() => {
	if (button.value) {
		const custom_class = "custom-" + props.type;
		Array.from(button.value.classList).forEach((item) => {
			if (item.startsWith("custom-")) {
				button.value?.classList.remove(item);
			}
		});

		button.value.classList.add(custom_class);
	}
});
</script>

<style scoped>

.basic-button {
	--button-height: calc(2em + var(--button-border-width) * 2);
	--button-icon-size: 1em;
	--button-padding-lr: clamp(8px, calc((1em - 12px) / 2 * 8 + 8px ), 16px);
  --button-border-width: 1px;
	white-space: nowrap;
	color: v-bind("config.normal.color");
	display: flex;
	flex-wrap: nowrap;
	font-family: "DingTalk JinBuTi" , sans-serif;
  font-size: var(--button-font-size, v-bind("button_size"));
	height: calc(var(--button-height) + var(--button-border-width) * 2);
	padding: 8px calc(var(--button-padding-lr) - var(--button-border-width));
	justify-content: center;
	align-items: center;
	gap: 0.25rem;
	border: var(--button-border-width) solid v-bind("config.normal.border");
	border-radius: 0.25rem;
  background: v-bind("config.normal.background");
  position: relative;
}

.basic-button:hover {
	border-color: v-bind("config.hover.border");
  color: v-bind("config.hover.color");
  background: v-bind("config.hover.background");
}

.basic-button:active {
	border-color: v-bind("config.active.border");
	background: v-bind("config.active.background");
}

.basic-button:not(.custom-alert):hover::after {
  width: 100%;
  height: 0.25rem;
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  background:  no-repeat url(@/assets/images/index/button-light.svg);
  background-size: 100% 100%;
  pointer-events: none;
}
</style>
