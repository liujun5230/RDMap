<template>
<el-drawer
	:visible.sync="drawer_props.is_show"
	class="area-drawer"
	:class="{'with-head': show_head}"
	:with-header="false"
	:wrapper-closable="false"
	:modal="drawer_props.from !== 'map'"
	:close-on-press-escape="false"
	:size="432"
	destroy-on-close
	append-to-body
	@opened="onDrawerOpened"
>
	<div class="drawer-title">
		<span>{{ drawer_props.title }}</span>
		<span class="operate">
			<fk-icon
				v-if="drawer_props.area_type === 'patrol_route'"
				tip="刷新"
				size="24"
				style="cursor: pointer;"
				@click="handleRefresh"
			>
				<refresh-icon />
			</fk-icon>
			<fk-icon
				class="close-icon"
				size="14"
				tip="关闭"
				@click="closeDrawerOnHeader"
			>
				<close-icon />
			</fk-icon>
		</span>
	</div>
	<component
		:is="area_components_map[drawer_props.area_type]"
		:id="drawer_props.area_id"
		:type="drawer_props.area_type"
		:from="drawer_props.from"
		:options="drawer_props.options"
		:is-show="drawer_props.is_show"
		:cache-form="drawer_props.cache_form"
		:refresh="refresh_flag"
		class="custom-component"
		v-bind="$attrs"
		v-on="$listeners"
		@close="closeDrawer"
	/>
</el-drawer>
</template>

<script lang="ts">
export default {
	inheritAttrs: false
};
</script>
<script setup lang="ts">
import {type Component, ref} from "vue";
import GeneralAreaDrawer from "./GeneralAreaDrawer.vue";
import CameraSetting from "./CameraSetting.vue";
import {AreaDrawerProvideKey, AreaTypes, typeToTitle, numberToAreaTypes} from "./constant";
import type {DrawerProps} from "./types";
import LocatingOptimum from "./LocatingOptimum.vue";
import CallSetting from "./CallSetting.vue";
import PatrolRoute from "./PatrolRoute.vue";
import PatrolPoint from "./PatrolPoint.vue";
import {useEventBus} from "@vueuse/core";
import {provide} from "vue";
import {useLocationMixin} from "@/utils/js/useLocationMixin";
import FkIcon from "@/components/ForThink/FkIcon.vue";
import RefreshIcon from "~icons/operation/refresh";
import CloseIcon from "~icons/operation/stroke-close";

const show_head = useLocationMixin();
const drawer_props = ref<{
	area_id?: number
	area_type: AreaTypes
	from: "map" | "table",
	title?: string,
	options?: any
	cache_form?: unknown
} & {is_show: boolean}>({
	is_show: false,
	area_type: AreaTypes.VIRTUAL_FENCE,
	area_id: 0,
	from: "map",
	title: "",
	options: undefined,
	cache_form: undefined
});

provide(AreaDrawerProvideKey, drawer_props);

const refresh_flag = ref(false);

const area_components_map: Record<string, Component> = {
	[AreaTypes.UP_DOWN_PIT]: GeneralAreaDrawer,
	[AreaTypes.VIRTUAL_FENCE]: GeneralAreaDrawer,
	[AreaTypes.ATTENDANCE_AREA]: GeneralAreaDrawer,
	[AreaTypes.CAMERA]: CameraSetting,
	[AreaTypes.LOCATING_OPTIMUM]: LocatingOptimum,
	[AreaTypes.CALL]: CallSetting,
	[AreaTypes.PATROL_ROUTE]: PatrolRoute,
	[AreaTypes.PATROL_POINT]: PatrolPoint,
};

const openDrawer = (data: DrawerProps) => {
	// 如果传递的区域类型是数字，则转换为字符串
	if (typeof data.type === "number") {
		data.type = numberToAreaTypes[data.type];
		data.title = typeToTitle[data.type];
	}

	const {id, type, from: f, title: t, options: opt} = data;
	drawer_props.value.area_type = type;
	drawer_props.value.area_id = id || 0;
	drawer_props.value.from = f;
	drawer_props.value.title = t || "";
	drawer_props.value.options = opt;
	drawer_props.value.is_show = true;
	drawer_props.value.cache_form = data.cache_form;
};

const onDrawerOpened = () => {
	if (drawer_props.value.area_id) {
		useEventBus("is-exist-area").emit(true);
	}
};

const closeDrawer = () => {
	drawer_props.value.is_show = false;
};

const handleRefresh = () => {
	emits("refresh-points");
	refresh_flag.value = !refresh_flag.value;
};

const closeDrawerOnHeader = () => {
	closeDrawer();
	emits("close");
};

defineExpose({openDrawer, closeDrawer});
const emits = defineEmits(["close", "refresh-points"]);
</script>

<style scoped>
.area-drawer {
	:deep(.el-drawer__container) {
		.drawer-title {
			display: flex;
			justify-content: space-between;
			height: 50px;
			line-height: 50px;
			padding: 0 16px;
			background-color: #F6F7FC;
			align-items: center;
			color: #173E67;
			font-size: 16px;

			.operate {
				display: flex;
				align-items: center;
				gap: 12px;

				.close-icon {
					padding: 5px;
					box-sizing: content-box;
					&:hover {
						cursor: pointer;
					}
				}
			}
		}

		.custom-component {
			height: calc(100% - 50px);
		}

		.drawer-body {
			height: calc(100% - 80px);
			padding: 16px;
			overflow-y: auto;
		}

		.drawer-footer {
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			padding: 16px;
			text-align: right;
			border-top: 1px solid #EFF3F6;
			background-color: #fff;
		}

		/* 小标题 */
		.form-sub-title {
			font-size: 14px;
			line-height: 14px;
			color: #456585;
		}

		.form-sub-title::before {
			content: "";
			display: inline-block;
			position: relative;
			top: 1px;
			width: 2px;
			height: 12px;
			margin-right: 8px;
		}
	}

	:deep(.drawer-form) {
		.map-form-item {
			.el-form-item__content {
				line-height: 16px;
			}
		}

		.el-input.is-disabled .el-input__inner {
			color: #a2b2c2;
		}

		.anchor-title {
			display: inline-block;
			margin-bottom: 16px;
		}

		.el-form-item .el-form-item__label {
			line-height: 14px;
			padding: 0 0 8px 0;
		}

		.el-form-item {
			margin-bottom: 16px;

			.el-input:not(.el-date-editor) .el-input__inner {
				padding: 0 12px;
			}
		}

		.input-with-slot {
			.el-input-group__append,
			.el-input-group__prepend {
				padding: 0 12px;
				border-color: #e5e9ec;
				background-color: #fff;
				color: #748BA4;
			}

			&.is-disabled .el-input-group__append,
			&.is-disabled .el-input-group__prepend {
				background-color: #f5f7fa;
				border-color: #eff3f6;
			}
		}
	}
}

:deep(.el-select) {
	width: 100%;
}
</style>
<style>
.with-head.area-drawer.el-drawer__wrapper {
	top: 64px !important;
	left: calc(100% - 432px) !important;
	box-shadow: -1px 0 6px 0 rgba(0, 0, 0, 0.06);
}

.area-drawer.el-drawer__wrapper {
	top: 0 !important;
	bottom: 0 !important;
}

.area-drawer.el-drawer__wrapper .el-drawer__container,
.el-drawer__wrapper .el-drawer {
	outline: none;
}

.area-drawer.el-drawer__wrapper .el-drawer__body {
	overflow: hidden; /*兼容firefox抽屉的高度问题*/
}

.custom-theme-blue .area-drawer {
	.form-sub-title:before {
		background-color: #07f;
	}
}

.custom-theme-green .area-drawer {
	.form-sub-title:before {
		background-color: #3EB2A9;
	}
}
</style>
