<template>
<el-button
	ref="el"
	:type="props.type"
	v-bind="$attrs"
	v-on="$listeners"
>
	<slot>重置</slot>
</el-button>
</template>

<script setup lang="ts">
import {Button} from "element-ui";
import {ref, onMounted} from "vue";

import {ADD_FK_FORM_ITEM} from "@/events/form";
import {useEventBus} from "@vueuse/core";

const {emit: emitAddFkFormItem} = useEventBus(ADD_FK_FORM_ITEM);
const el = ref<InstanceType<typeof Button>>();

type Props = {
	type: string
}

const props = defineProps<Props>();

onMounted(() => {
	emitAddFkFormItem({el: el.value!, type: "reset"});
});

</script>

	<style scoped>

	</style>
