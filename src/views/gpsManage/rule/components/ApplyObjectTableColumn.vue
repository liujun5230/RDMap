<template>
<el-table-column
	v-bind="$attrs"
	:prop="props.prop"
	:show-overflow-tooltip="false"
	v-on="$listeners"
>
	<template #default="{row}">
		<span v-if="row.type === ALARM_RULE_TYPE.hazard_source || row.type === ALARM_RULE_TYPE.accompany">
			<text-ellipsis
				style="width: 100%;"
				:disabled="!showOverflowTooltip"
			>
				<span>{{ row.type === ALARM_RULE_TYPE.hazard_source ? "危险源：" : "被陪同对象：" }}</span>
				<span v-if="isNoTags(row, row.type === ALARM_RULE_TYPE.hazard_source ? 'hazard_source' : 'accompany')">{{ emptyText }}</span>
				<span
					v-for="(item) in getTagList(row, row.type === ALARM_RULE_TYPE.hazard_source ? 'hazard_source' : 'accompany')"
					:key="item.unique_id"
					class="name-split"
					:class="{'clickable-text': item.uuid !== undefined}"
					@click="openArchiveDialog(item)"
				>
					{{ item.name }}
				</span>
			</text-ellipsis>
			<text-ellipsis
				style="width: 100%;"
				:disabled="!showOverflowTooltip"
			>
				<span>{{ row.type === ALARM_RULE_TYPE.hazard_source ? "靠近不告警对象：" : "陪同对象：" }}</span>
				<span v-if="isNoTags(row)">{{ emptyText }}</span>
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
		<span v-else>
			<span v-if="isNoTags(row)">{{ emptyText }}</span>
			<text-ellipsis
				v-else
				style="width: 100%;"
				:disabled="!showOverflowTooltip"
			>
				<span v-if="row.uuids_inverse">（以下对象外将触发告警）</span>
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
</el-table-column>
</template>

<script setup lang="ts">
import type {ApplicableObjects} from "@/types/alarm";
import TextEllipsis from "@/components/TextEllipsis.vue";
import {ALARM_RULE_TYPE} from "@/utils/js/constant";
import {useFeatureFlags} from "@/store";

const emits = defineEmits<{
	(event: "click", value: {card_id?: number, uuid?: number}): void
}>();

interface Props {
	prop: string,
	showOverflowTooltip?: boolean,
	emptyText?: string,
}
const props = withDefaults(defineProps<Props>(), {
	showOverflowTooltip: true,
	emptyText: "--"
});

const flags = useFeatureFlags();

type TagListItem = {id?: number, uuid?: number, card_id?: number, unique_id: string, name: string};

function isNoTags(row: any, key?: "hazard_source" | "accompany") {
	const data = key ? row[key].applicable_objects : row[props.prop] as ApplicableObjects;
	const {applicable_object} = row;
	if (!data) return true;
	const {person, visitor, truck, material, card_type, contractor} = data;

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

	return applicable_object === 1 ? is_empty : card_type.all_card_type === 0 && card_type.card_type.length === 0;
}

function getTagList(row: any, key?: "hazard_source" | "accompany") {
	const data = key ? row[key].applicable_objects : row[props.prop];
	if (!data) return [];
	const {person, visitor, truck, material, contractor, card_type} = data as ApplicableObjects;
	const person_list = person?.all_person === 1 ? [{id: -1, name: "全部员工"}] : [
		...(person?.single_person || []).map((item) => ({...item, unique_id: `person_${item.uuid}`})),
		...(person?.branch || []).map((item) => ({...item, unique_id: `$branch_${item.id}`})),
		...(person?.person_class || []).map((item) => ({...item, unique_id: `person_class_${item.id}`})),
		...(person?.duty || []).map((item) => ({...item, unique_id: `duty_${item.id}`})),
		...(person?.work_type || []).map((item) => ({...item, unique_id: `work_type_${item.id}`})),
	];
	const visitor_list = visitor?.all_visitor === 1 ? [{id: -3, name: "全部访客"}] : [
		...(visitor?.single_visitor || []).map((item) => ({...item, unique_id: `visitor_${item.uuid}`}))
	];
	const contractor_list = contractor?.all_contractor === 1 ? [{id: -7, name: "全部承包商"}] : [
		...(contractor?.single_contractor || []).map((item) => ({...item, unique_id: `contractor_${item.uuid}`})),
		...(contractor?.unit || []).map((item) => ({...item, unique_id: `contractor_unit_${item.id}`})),
		...(contractor?.work_type || []).map((item) => ({...item, unique_id: `contractor_work_type_${item.id}`})),
	];
	const truck_list = truck?.all_truck === 1 ? [{id: -2, name: "全部车辆"}] : [
		...(truck?.single_truck || []).map((item) => ({...item, unique_id: `truck_${item.uuid}`})),
		...(truck?.truck_type || []).map((item) => ({...item, unique_id: `truck_type_${item.id}`})),
	];
	const material_list = material?.all_material === 1 ? [{id: -5, name: "全部物资"}] : [
		...(material?.single_material || []).map((item) => ({...item, unique_id: `material_${item.uuid}`})),
		...(material?.material_type || []).map((item) => ({...item, unique_id: `material_type_${item.id}`})),
	];
	const card_type_list = card_type?.all_card_type === 1 ? [{id: -6, name: "全部标签类型"}] : [
		...(card_type?.card_type || []).map((item) => ({...item, card_id: item.id, unique_id: `card_type_${item.id}`})),
	];

	return [
		...person_list,
		...(flags.displayVisitor ? visitor_list : []),
		...(flags.displayContractor ? contractor_list : []),
		...(flags.car ? truck_list : []),
		...(flags.displayMaterial ? material_list : []),
		...card_type_list
	] as TagListItem[];
}

function openArchiveDialog(item: TagListItem) {
	if (item.uuid !== undefined) {
		emits("click", {uuid: item.uuid});
	}
}
</script>
