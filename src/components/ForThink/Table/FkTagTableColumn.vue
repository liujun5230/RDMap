<template>
<fk-table-column
	v-bind="$attrs"
	:prop="props.prop"
	:label="props.label"
	:show-overflow-tooltip="false"
	:formatter="formatColumn"
	v-on="$listeners"
>
	<template #header>
		<slot name="header" />
	</template>
	<template #default="{row}">
		<span>
			<span
				v-if="isNoTags(row)"
				:style="{color: emptyTextColor}"
			>{{ emptyText }}</span>
			<text-ellipsis
				v-else
				style="width: 100%;"
				:disabled="!showOverflowTooltip"
			>
				<span
					v-for="(item) in getTagList(row)"
					:key="item.unique_id"
					class="name-split"
					:class="{'clickable-text': item.uuid !== undefined}"
					@click="openArchiveDialog(item)"
				>
					{{ item.name }}
				</span>
			</text-ellipsis>
		</span>
	</template>
</fk-table-column>
</template>

<script setup lang="ts">
import type {ApplicableObjects} from "@/types/alarm";
import TextEllipsis from "@/components/TextEllipsis.vue";
import {useFeatureFlags} from "@/store";

import FkTableColumn from "./FkTableColumn.vue";

const emits = defineEmits<{
	(event: "click", value: number): void
}>();

interface Props {
	prop: string,
	label: string,
	showOverflowTooltip?: boolean,
	emptyText?: string,
	emptyTextColor?: string,
}
const props = withDefaults(defineProps<Props>(), {
	showOverflowTooltip: true,
	emptyText: "--",
	emptyTextColor: undefined,
});

const flags = useFeatureFlags();

type TagListItem = {id?: number, uuid?: number, unique_id: string, name: string};

function isNoTags(row: any) {
	const {prop} = props;
	const data = row[prop];
	if (!data) return true;
	const {person, visitor, truck, material, contractor} = data;
	let is_empty = false;
	if (person) {
		is_empty = person.all_person === 0
			&& person.single_person.length === 0
			&& person.branch.length === 0
			&& person.person_class.length === 0
			&& person.duty.length === 0
			&& person.work_type.length === 0;
	}
	if (flags.displayVisitor && visitor) {
		is_empty = is_empty && visitor.all_visitor === 0
			&& visitor.single_visitor.length === 0;
	}

	if (flags.displayContractor && contractor) {
		is_empty = is_empty && contractor.all_contractor === 0
			&& contractor.single_contractor.length === 0
			&& contractor.unit.length === 0
			&& contractor.work_type.length === 0;
	}

	if (flags.car && truck) {
		is_empty = is_empty && truck.all_truck === 0
			&& truck.single_truck.length === 0
			&& truck.truck_type.length === 0;
	}

	if (flags.displayMaterial && material) {
		is_empty = is_empty && material.all_material === 0
			&& material.single_material.length === 0
			&& material.material_type.length === 0;
	}

	return is_empty;
}

function getTagList(row: any) {
	const data = row[props.prop];
	if (!data) return [];
	const {person, visitor, truck, material, contractor} = data as ApplicableObjects;
	const person_list = person?.all_person === 1 ? [{id: -1, name: "全部员工"}] : [
		...(person?.single_person || []).map((item) => ({...item, unique_id: `person_${item.uuid}`})),
		...(person?.branch || []).map((item) => ({...item, unique_id: `$branch_${item.id}`})),
		...(person?.person_class || []).map((item) => ({...item, unique_id: `person_class_${item.id}`})),
		...(person?.duty || []).map((item) => ({...item, unique_id: `duty_${item.id}`})),
		...(person?.work_type || []).map((item) => ({...item, unique_id: `work_type_${item.id}`})),
	];
	const visitor_list = visitor?.all_visitor === 1 ? [{id: -3, name: "全部访客"}] : [
		...(visitor?.single_visitor || []).map((item) => ({...item, unique_id: `visitor_${item.uuid}`})),
	];
	const truck_list = truck?.all_truck === 1 ? [{id: -2, name: "全部车辆"}] : [
		...(truck?.single_truck || []).map((item) => ({...item, unique_id: `truck_${item.uuid}`})),
		...(truck?.truck_type || []).map((item) => ({...item, unique_id: `truck_type_${item.id}`})),
	];
	const material_list = material?.all_material === 1 ? [{id: -5, name: "全部物资"}] : [
		...(material?.single_material || []).map((item) => ({...item, unique_id: `material_${item.uuid}`})),
		...(material?.material_type || []).map((item) => ({...item, unique_id: `material_type_${item.id}`})),
	];
	const contractor_list = contractor?.all_contractor === 1 ? [{id: -6, name: "全部承包商"}] : [
		...(contractor?.single_contractor || []).map((item) => ({...item, unique_id: `contractor_${item.uuid}`})),
		...(contractor?.unit || []).map((item) => ({...item, unique_id: `contractor_unit_${item.id}`})),
		...(contractor?.work_type || []).map((item) => ({...item, unique_id: `contractor_work_type_${item.id}`})),
	];

	return [
		...person_list,
		...(flags.displayVisitor ? visitor_list : []),
		...(flags.displayContractor ? contractor_list : []),
		...(flags.car ? truck_list : []),
		...(flags.displayMaterial ? material_list : []),
	] as TagListItem[];
}

function openArchiveDialog(item: TagListItem) {
	if (item.uuid !== undefined) {
		emits("click", item.uuid);
	}
}

function formatColumn(item: TagListItem) {
	return getTagList(item).map(it => it.name).join("、") || props.emptyText;
}
</script>
