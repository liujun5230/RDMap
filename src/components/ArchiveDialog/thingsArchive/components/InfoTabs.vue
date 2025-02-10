<template>
<KeepAlive>
	<component
		:is="components"
	/>
</KeepAlive>
</template>
<script setup lang="ts">
import {computed} from "vue";
import ThingsInfoTabs from "./ThingsInfoTabs.vue";
import CardInfoTabs from "./CardInfoTabs.vue";

const props = defineProps({
	tabType: {
		type: String,
		default: ""
	}
});

const components = computed(() => {
	if (props.tabType === "card") {
		return CardInfoTabs;
	} else {
		return ThingsInfoTabs;
	}
});

</script>

