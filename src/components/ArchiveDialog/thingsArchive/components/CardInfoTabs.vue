<template>
<archive-base-tabs
	:tab-components="tab_components"
/>
</template>
<script setup lang="ts">
import {computed} from "vue";
import {getCardTabs} from "../composable/getTabs";
import ArchiveBaseTabs from "@/components/ArchiveDialog/components/ArchiveBaseTabs.vue";

const tab_components = computed(() => getCardTabs());

</script>

