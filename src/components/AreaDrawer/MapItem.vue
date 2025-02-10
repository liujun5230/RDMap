<template>
<div class="map-item">
	<span class="label">所在地图：</span>
	<el-tooltip
		placement="top"
		:content="props.map"
		:disabled="!is_over_flow"
		popper-class="fk-text-ellipsis-popper"
	>
		<span
			ref="map_ref"
			class="map-item__content"
			:class="{clickable: !props.disabled, disabled: props.disabled}"
			@click="jumpHomePage(props.floorId)"
		>
			{{ props.map }}
		</span>
	</el-tooltip>
</div>
</template>

<script setup lang="ts">
import {ref} from "vue";

import {index_route_name} from "@/Config";
import {LOCATION_KEY} from "@/composable/map/useLocationJump";
import {useTextOverflow} from "@/composable/useTextOverFlow";
import locationJump from "@/utils/js/locationHref";

import "@/utils/css/customThemes/variables.css";

const map_ref = ref<HTMLElement>();

const {is_over_flow} = useTextOverflow(map_ref);

const props = defineProps<{
	map: string,
	floorId: number
	areaId?: number
	disabled?: boolean
}>();

/**
 * 跳转到首页
 * @param floor_id 地图id
 */
function jumpHomePage(floor_id: number) {
	let location;
	if (props.areaId) {
		location = {
			type: "area",
			result: [{floor_id, area_id: props.areaId}]
		};
	} else {
		location = {
			type: "location",
			result: [{floor_id}]
		};
	}
	console.log("location", location, props.areaId);
	localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
	locationJump(index_route_name, true);
}
</script>

<style scoped>
.map-item {
  width: 100%;
  display: flex;
	line-height: 1;
}

.label{
  flex: 0 0 auto;
  color: var( --theme-text-color-gray);
}

.map-item__content{
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--theme-text-color-normal);
}

.map-item .clickable {
  color: var(--theme-color);
  cursor: pointer;

	transition: text-decoration 0.3s;
}

.map-item .clickable:hover {
	text-decoration: underline;
  text-underline-offset: 2px;
}

.disabled {
	color: var(--text-color-gray-light);
	cursor: not-allowed;
	pointer-events: none;
}
</style>
