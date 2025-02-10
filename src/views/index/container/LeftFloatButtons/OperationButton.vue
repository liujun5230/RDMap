<template>
<circle-button
	class="w-fit"
	:tips="props.tips"
	:disabled="props.operation && !config[props.operation]"
	@click.stop="props.eventHandler"
>
	<fk-icon
		:size="icon_size_list['circle_icon']"
	>
		<component :is="props.icon" />
	</fk-icon>
</circle-button>
</template>

<script setup lang="ts">
import {useMutexConfig} from "@index/composable";
import type {MutexOperation} from "@index/composable";
import {useResponsiveIconSize} from "@/composable/useResponsiveIconSize";
import CircleButton from "../../components/buttons/CircleButton.vue";
import IconApp from "~icons/operation/app-gradient";

const {config} = useMutexConfig();
const icon_size_list = useResponsiveIconSize();
export type OperationButtonProps = {
	operation?: MutexOperation;
	icon: InstanceType<typeof IconApp>;
	eventHandler: () => void
	tips: string
};

const props = defineProps<OperationButtonProps>();
</script>
