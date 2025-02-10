<template>
<el-dialog
	v-bind="$attrs"
	append-to-body
	:visible="props.value"
	:close-on-click-modal="false"
	:show-close="false"
	:custom-class="custom_class"
	top="0"
	v-on="$listeners"
>
	<template #title>
		<module-header
			v-if="isHome"
			:title="$attrs.title"
			class="home-base-dialog-header"
			style="--min-height: 32; --max-height:32; --title-min-size: 16; --title-max-size: 16;"
		>
			<template #icon>
				<slot name="icon" />
			</template>
			<template #operate>
				<div
					class="cursor-pointer opacity-80 hover:opacity-100 hover:font-bold hover:bg-[#384E70B2] hover:rounded-tr-[4px] leading-[32px]"
					@click="closeDialog"
				>
					<fk-icon
						tip="关闭"
						class="text-minor-2 hover:text-minor-1 mx-4"
						size="14"
						@click="closeDialog"
					>
						<close-icon />
					</fk-icon>
				</div>
			</template>
		</module-header>
		<div
			v-else
			class="header"
		>
			<div class="title">
				<slot name="title">
					<span>{{ $attrs.title }}</span>
					<slot name="icon" />
				</slot>
			</div>
			<div class="operate-wrap">
				<slot name="operate" />
				<fk-icon
					v-if="showClose"
					tip="关闭"
					class="close-icon"
					size="14"
					@click="closeDialog"
				>
					<close-icon />
				</fk-icon>
			</div>
		</div>
	</template>

	<template #default>
		<div class="content-body">
			<slot />
		</div>
	</template>

	<template
		v-if="props.showFooter"
		#footer
	>
		<div class="footer">
			<slot
				v-if="isHome"
				name="footer"
			>
				<header-button
					v-if="mode !== 'view' && showNegativeButton"
					type="primary"
					size="14"
					:disabled="disabledNegativeButton"
					@click="onNegativeClick"
				>
					{{ negativeButtonText }}
				</header-button>
				<header-button
					v-if="mode !== 'view' && showPositiveButton"
					type="confirm"
					size="14"
					:disabled="disablePositiveButton"
					:loading="props.positiveButtonLoading"
					@click="emits('positive-click')"
				>
					{{ positiveButtonText }}
				</header-button>
				<header-button
					v-if="mode === 'view' && props.canChangeMode"
					type="primary"
					size="14"
					:disabled="disableViewButton"
					@click="emits('update:mode', DIALOG_MODE.edit)"
				>
					{{ viewModeButtonText }}
				</header-button>
			</slot>
			<slot
				v-else
				name="footer"
			>
				<el-button
					v-if="mode !== 'view' && showNegativeButton"
					:disabled="disabledNegativeButton"
					plain
					@click="onNegativeClick"
				>
					{{ props.negativeButtonText }}
				</el-button>
				<el-button
					v-if="mode !== 'view' && showPositiveButton"
					:disabled="disablePositiveButton"
					:loading="props.positiveButtonLoading"
					type="primary"
					@click="emits('positive-click')"
				>
					{{ props.positiveButtonText }}
				</el-button>
				<el-button
					v-if="mode === 'view'"
					type="primary"
					:disabled="disableViewButton"
					@click="emits('update:mode', DIALOG_MODE.edit)"
				>
					{{ props.viewModeButtonText }}
				</el-button>
			</slot>
		</div>
	</template>
</el-dialog>
</template>

<script lang="ts">
export default {
	inheritAttrs: false
};
</script>
<script setup lang="ts">
import {ref, onMounted, computed} from "vue";
import {useEventListener} from "@vueuse/core";

import FkIcon from "@/components/ForThink/FkIcon.vue";
import CloseIcon from "~icons/operation/stroke-close";

import {HeaderButton} from "@index/components/buttons";
import ModuleHeader from "@index/components/ModuleHeader.vue";

import {DIALOG_MODE} from "./constant";

const emits = defineEmits<{
	(event: "negative-click"): void,
	(event: "positive-click"): void,
	(event: "input", value: boolean): void,
	(event: "update:mode", value: DIALOG_MODE): void
}>();

interface Props {
	value: boolean,
	/** 弹窗的高度，包括header和footer */
	height?: number | string,
	/** 弹窗的最小高度，包括header和footer */
	minHeight?: number | string,
	customClass?: string,
	showNegativeButton?: boolean,
	negativeButtonText?: string,
	showPositiveButton?: boolean,
	positiveButtonText?: string,
	viewModeButtonText?: string,
	positiveButtonLoading?: boolean,
	disabledNegativeButton?: boolean,
	disablePositiveButton?: boolean,
	disableViewButton?: boolean,
	showFooter?: boolean,
	mode?: DIALOG_MODE,
	isHome?: boolean,
	canChangeMode?: boolean,
	showClose?: boolean
}
const props = withDefaults(defineProps<Props>(), {
	height: undefined,
	minHeight: undefined,
	customClass: "",
	showNegativeButton: true,
	negativeButtonText: "取消",
	showPositiveButton: true,
	positiveButtonText: "保存",
	viewModeButtonText: "编辑",
	positiveButtonLoading: false,
	disabledNegativeButton: false,
	disablePositiveButton: false,
	disableViewButton: false,
	showFooter: false,
	mode: DIALOG_MODE.add,
	isHome: false,
	canChangeMode: true,
	showClose: true
});

const vertical_min_height = "60px";
const header_height = computed(() => props.isHome ? "32px" : "50px");
const footer_height = computed(() => props.showFooter ? "60px" : "0px");
const max_height = computed(() => `calc(100vh - ${2 * parseFloat(vertical_min_height) + parseFloat(header_height.value) + parseFloat(footer_height.value)}px)`);
const content_min_height = ref<string | undefined>(max_height.value);

const content_height = computed(() => {
	if (!props.height) return "";
	const height_num = typeof props.height === "string" ? parseFloat(props.height) : props.height;
	const content_height = height_num - parseFloat(header_height.value) - parseFloat(footer_height.value);
	return content_height + "px";
});
const custom_class = computed(() => `${props.isHome ? "home-base-dialog" : "base-dialog"} ${props.customClass ?? ""}`);
const footer_border_color = computed(() => props.isHome ? "#2f3e54" : "#ebeef5");

onMounted(() => {
	content_min_height.value = calcContentMinHeight();
	useEventListener("resize", () => {
		content_min_height.value = calcContentMinHeight();
	});
});

function calcContentMinHeight() {
	const {minHeight} = props;
	if (minHeight === undefined) return "unset";
	const height = typeof minHeight === "number" ? minHeight : parseFloat(minHeight);
	if (height > document.body.clientHeight - 2 * parseFloat(vertical_min_height)) {
		// 设置的min-height超出浏览器高度
		return max_height.value;
	}
	const min_content_height = height - parseFloat(header_height.value) - parseFloat(footer_height.value);
	return `${min_content_height}px`;
}

function closeDialog() {
	emits("input", false);
}

function onNegativeClick() {
	const {mode} = props;
	if (mode === "add") {
		closeDialog();
		emits("negative-click");
	} else if (mode === "edit") {
		emits("update:mode", DIALOG_MODE.view);
		emits("negative-click");
	}
}
</script>

<style scoped>
.el-dialog__wrapper {
	--margin-lr: 32px;
    --margin-bt: v-bind("vertical_min_height");
	--footer-border: v-bind("footer_border_color");
	--body-padding: 0;
	--operate-gap-x: 12px;

    display: flex;
    justify-content: center;
    align-items: center;
}

:deep(.base-dialog.el-dialog) {

    * {
        box-sizing: border-box;
    }

    margin: var(--margin-bt) var(--margin-lr) !important;
    position: absolute;
    overflow: hidden;
	border-radius: 10px !important;

    .el-dialog__header {
        padding: 0 !important;
        height: unset !important;
        line-height: unset !important;
		background-color: unset;
		border-radius: unset !important;
    }

    .header {
		background-color: #f6f7fc;
		border-radius: 10px 10px 0 0;
        height: v-bind("header_height");
        padding: 13px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .title {
        color: #173e67;
		font-size: 14px;
    }

	.operate-wrap {
		display: inline-flex;
		align-items: center;
		column-gap: var(--operate-gap-x);
	}

    .close-icon {
        &:hover {
            cursor: pointer;
        }
    }

    .el-dialog__body {
        padding: unset !important;
        max-height: unset !important;
    }

    .content-body {
        max-height: v-bind("max_height");
        min-height: v-bind("content_min_height");
		height: v-bind("content_height");
		overflow: auto;
		padding: var(--body-padding);
    }

    .el-dialog__footer {
		border-top: unset !important;
		padding: unset !important;
    }

	.footer {
		position: relative;
		height: v-bind("footer_height");
		border-top: 1px solid var(--footer-border);
		padding: 12px 16px 16px;
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}
}

:deep(.home-base-dialog.el-dialog) {

	--r: 16px;

	/*定义滑块 内阴影+圆角*/
	::-webkit-scrollbar-thumb {
		background-color: #6E84A5;
	}

	* {
		box-sizing: border-box;
	}

	margin: var(--margin-bt) var(--margin-lr) !important;
	position: absolute;
	overflow: hidden;
	background: #071831BF;
	backdrop-filter: blur(4px);
	box-shadow: 0px 0px 20px 0px rgba(106, 143, 200, 0.56) inset;
	border-radius: 4px !important;

	.el-dialog__header {
		padding: 0 !important;
		height: unset !important;
		line-height: unset !important;
		background-color: unset;
		border-radius: unset !important;
	}

	.home-base-dialog-header.module-header {
		.title {
			padding-left: 30px;
			column-gap: 6px;
		}
	}

	.el-dialog__body {
		padding: unset !important;
		max-height: unset !important;
	}

	.content-body {
		max-height: v-bind("max_height");
		min-height: v-bind("content_min_height");
		height: v-bind("content_height");
		overflow: auto;
	}

	.el-dialog__footer {
		border-top: unset !important;
		padding: unset !important;
	}

	.footer {
		height: v-bind("footer_height");
		border-top: 1px solid var(--footer-border);
		padding: 12px 16px 16px;
		display: flex;
		justify-content: flex-end;
		align-items: center;
		column-gap: 8px;
	}
}
</style>
