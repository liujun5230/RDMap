<template>
<div class="h-full flex flex-col gap-y-[20px]">
	<module-header
		class="flex-none"
		title="巡检点"
	>
		<template #operate>
			<div class="flex justify-between items-center">
				<fk-icon
					class="text-minor-2 px-[8px] cursor-pointer hover-icon hover:text-minor-1"
					style="--text-color: var(--text-minor-2, #94a6be)"
					tip="关闭"
					:size="small ? 24 : 28"
					@click="closeDialog"
				>
					<close-icon />
				</fk-icon>
			</div>
		</template>
	</module-header>

	<detail-box-loading v-if="loading" />
	<div
		v-else
		class="flex-1 relative overflow-auto"
	>
		<div class="absolute w-full">
			<descriptions-list
				:columns="base_info_columns"
				:data="detail_data"
			/>

			<div class="my-[16px] border-t border-solid border-[#5a6b85]" />

			<label class="after:content-[':'] text-minor-2 mb-[8px]">关联巡检路线</label>

			<p
				class="text-main-1 text-justify"
				:class="small ? 'text-[14px]' : 'text-[16px]'"
			>
				{{ detail_data.route }}
			</p>
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
import {computed, shallowRef, ref} from "vue";
import {useTimeoutPoll} from "@vueuse/core";

import FkIcon from "@/components/ForThink/FkIcon.vue";
import CloseIcon from "~icons/operation/stroke-close";
import {getPatrolDetail} from "@/api/homepage/device";
import type {PatrolDetailResult} from "@/api/homepage/device";
import {small} from "@/utils/ts/breakpoints";

import ModuleHeader from "@index/components/ModuleHeader.vue";
import {useDetailDialogStore, DetailDialogCategoryEnum} from "@index/store";
import type {SingleDetailPatrolProps} from "@index/store";
import {poll_interval} from "@index/utils/config";

import DescriptionsList from "../components/DescriptionsList.vue";
import DetailBoxLoading from "../components/DetailBoxLoading.vue";

interface Props {
	category: DetailDialogCategoryEnum.PATROL_POINT;
}
const props = defineProps<Props>();

const base_info_columns = [
	{label: "名称", prop: "name"},
	{label: "范围", prop: "distance", formatter: (val: any) => [null, undefined, "--"].includes(val) ? "--" : `${val}米`},
];

const loading = ref(true);

const detail_dialog_store = useDetailDialogStore();
const dialog = computed(() => detail_dialog_store.getDialog(props.category));
const dialog_props = computed(() => dialog.value.props as SingleDetailPatrolProps);
const device_id = computed(() => dialog_props.value.id);

const detail_data = shallowRef<PatrolDetailResult>({} as PatrolDetailResult);

useTimeoutPoll(fetchDetailData, poll_interval, {immediate: true});

function closeDialog() {
	detail_dialog_store.toggleVisible(props.category, false);
}

async function fetchDetailData() {
	const {data: res} = await getPatrolDetail({id: device_id.value}).catch(() => ({data: undefined}));
	if (res?.type === 1) {
		detail_data.value = res.result;
	}
	loading.value = false;
}
</script>
