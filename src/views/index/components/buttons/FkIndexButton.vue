<template>
<el-button
	v-bind="$attrs"
	class="fk-index-button"
	@click="handleClick"
>
	<slot />
</el-button>
</template>

<script setup lang="ts">
const handleClick = () => {
	emits("click");
};

const emits = defineEmits(["click"]);
</script>

<style scoped>

</style>
