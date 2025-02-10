<template>
<el-color-picker
	ref="color_picker"
	:value="current_color"
	:predefine="color_options"
	v-bind="$attrs"
	popper-class="color-picker"
	@change="handleChangeColor"
/>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";
import {CHEMICAL_COLORS, EVACUATE_COLOR, OTHER_COLORS} from "@/utils/js/constant";

type Props = {
	colorOptions?: string[]
	value?: string
	isTransparent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	value: undefined,
	isTransparent: true,
	colorOptions: () => [],
});

const current_color = computed(() => props.value);
const color_options = computed(() => {
	if (props.isTransparent) {
		return [...CHEMICAL_COLORS.transparent, EVACUATE_COLOR.transparent, ...OTHER_COLORS.transparent];
	} else {
		return [...CHEMICAL_COLORS.normal, EVACUATE_COLOR.normal, ...OTHER_COLORS.normal];
	}
});

const color_picker = ref();

const emit = defineEmits(["input"]);

function handleChangeColor(color: string) {
	emit("input", color);
}
</script>

<style>
.color-picker.el-color-dropdown.el-color-picker__panel {
    width: 320px;
    height: 290px;
    padding: 10px;
    margin-top: 4px;
    box-sizing: border-box;
    transform: translateX(144px);
}

.color-picker.el-color-dropdown .el-button--default {
    width: 52px;
    padding: 8px 0 !important;
    margin-right: 0 !important;
}

.color-picker.el-color-dropdown .el-button--text {
    padding: 8px 0 !important;
    margin-right: 12px !important;
    color: var(--theme-color);
    border: 0;
    box-shadow: none;
}

.color-picker.el-color-dropdown .el-button--text:hover {
    color: var(--theme-button-color-hover) !important;
}

.color-picker.el-color-dropdown .el-button--text:hover {
    border: 0;
    background-color: #fff;
}

.color-picker.el-color-dropdown .el-color-dropdown__btns .el-input__inner {
    width: 180px;
    height: 32px;
    font-size: 14px;
}
</style>
