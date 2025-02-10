<template>
<div class="map-tool">
	<div class="has-click button-container">
		<!-- 2d/3d切换 -->
		<operation-button
			v-if="props.isLoaded && !exclude.includes('switch_map')"
			:operation="disableSwitchDimension ? 'xxx' : 'switch_map'"
			:icon="switch_icon"
			:event-handler="switchDimension"
			:tips="switch_tips"
		/>

		<!-- 放大 -->
		<operation-button
			v-if="props.isLoaded && !exclude.includes('zoom_in')"
			operation="zoom"
			:icon="IconScaleUp"
			:event-handler="zoomIn"
			tips="放大"
		/>

		<!-- 缩小 -->
		<operation-button
			v-if="props.isLoaded && !exclude.includes('zoom_out')"
			operation="zoom"
			:icon="IconScaleDown"
			:event-handler="zoomOut"
			tips="缩小"
		/>

		<!-- 默认视角-->
		<operation-button
			v-if="props.isLoaded && !exclude.includes('default_view')"
			operation="default_view"
			:icon="IconPerspective"
			:event-handler="backToDefaultView"
			tips="默认视角"
		/>
		<!-- 旋转 -->
		<rotation-button
			v-if="props.isLoaded && !exclude.includes('rotation')"
		/>
		<OnClickOutside
			v-if="props.isLoaded && !exclude.includes('application')"
			@trigger="closePanel"
		>
			<el-popover
				ref="modal"
				v-model="show_map_application"
				class="w-fit"
				trigger="manual"
				placement="right-end"
				popper-class="fk-menu-cascader-popper map-settings-popper"
			>
				<template #reference>
					<operation-button
						:icon="IconApp"
						:event-handler="toggleAppPopup"
						tips="应用"
					/>
				</template>
				<div>
					<dropdown-menu
						:menu-items="apps"
						@on-click-menu="clickStartMeasure"
					/>
				</div>
			</el-popover>
		</OnClickOutside>

		<div v-if="props.isLoaded && !exclude.includes('map_setting')">
			<!-- 显示设置 -->
			<operation-button
				:icon="IconSetting"
				:event-handler="openMapSettings"
				tips="显示设置"
			/>

			<map-settings
				ref="map_setting_ref"
				v-model="show_map_settings"
				:setting-key="props.pageKey"
			/>
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";

import MapSettings from "@/components/mapSettings/MapSettings.vue";

import IconPerspective from "~icons/operation/perspective-gradient";
import IconScaleDown from "~icons/operation/scale-down-gradient";
import IconScaleUp from "~icons/operation/scale-up-gradient";
import IconSetting from "~icons/operation/setting-gradient";
import IconApp from "~icons/operation/app-gradient";
import IconTransform2D from "~icons/operation/transform-2d-gradient";
import IconTransform from "~icons/operation/transform-gradient";
import OperationButton from "@index/container/LeftFloatButtons/OperationButton.vue";
import RotationButton from "./RotationButton.vue";
import DropdownMenu from "./DropdownMenu.vue";
import {OnClickOutside} from "@vueuse/components";
import {SETTING_KEY} from "@/components/mapSettings/pageConfig";

const show_map_application = ref(false);
const show_map_settings = ref(false);
const map_setting_ref = ref<InstanceType<typeof MapSettings> | null>(null);

type ExcludeButtons = "switch_map" | "zoom_in" | "zoom_out" | "rotation" | "default_view" | "application" | "map_setting";
interface Props {
	pageKey?: SETTING_KEY,
	isLoaded: number,
	disabledMeasure?: boolean,
	exclude?: ExcludeButtons[],
	dimension?: "two" | "three",
	disableSwitchDimension?: boolean
}
const props = withDefaults(defineProps<Props>(), {
	pageKey: SETTING_KEY.INDEX_2D,
	isLoaded: 0,
	disabledMeasure: false,
	exclude: () => ["switch_map"],
	dimension: "two",
	disableSwitchDimension: false
});

const switch_icon = computed(() => props.dimension === "two" ? IconTransform : IconTransform2D);
const switch_tips = computed(() => props.dimension === "two" ? "切换3D" : "切换2D");

const apps = [{
	id: 1,
	value: "measure_distance",
	label: "测距",
	visible: true,
	event_handler: () => {}
}];

const switchDimension = () => {
	const switch_dimension = props.dimension === "two" ? "three" : "two";
	emits("switch-map", switch_dimension);
};

const zoomIn = () => {
	emits("zoom-in");
};

const zoomOut = () => {
	emits("zoom-out");
};

const toggleAppPopup = () => {
	if (props.disabledMeasure) return;
	show_map_application.value = !show_map_application.value;
};

const closePanel = () => {
	if (show_map_application.value) show_map_application.value = false;
};

const clickStartMeasure = () => {
	show_map_application.value = false;
	emits("start-measure");
};

const openMapSettings = () => {
	show_map_settings.value = true;
};

function backToDefaultView() {
	emits("back-default-view");
}
const emits = defineEmits<{
	(event: "switch-map", value: "two" | "three"): void,
	(event: "zoom-in"): void,
	(event: "zoom-out"): void,
	(event: "back-default-view"): void,
	(event: "start-measure"): void,
}>();

const checkAreas = async (id_list: number[]) => {
	return map_setting_ref.value?.checkAreas(id_list) ?? Promise.reject("map_setting_ref为null");
};

defineExpose({
	checkAreas
});
</script>

<style scoped lang="scss">
.map-tool {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	position: absolute;
	left: 20px;
	bottom: 20px;
	z-index: 20;
	width: 0;
	.button-container {
		display: flex;
		flex-direction: column;
		row-gap: 6px;
	}
	.scale-container {
		position: absolute;
		left: 2.25rem;
		bottom: 0px;
		color: #fff;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		min-width: 100px;
		align-items: center;
		font-size: 12px;
	}
	.stroke-text {
		color: #fff;
	}
}

.has-click > * {
  pointer-events: all;
}

</style>
