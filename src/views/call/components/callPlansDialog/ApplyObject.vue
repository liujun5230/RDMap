<template>
<div
	class="apply-object-wrap"
	:class="{'call-task': type === 'task'}"
>
	<tag-select
		v-model="form_data.apply_person"
		label="员工"
		:options="[
			{label: '全部员工', value: APPLY_PERSON.all},
			{label: '无', value: APPLY_PERSON.none},
			{label: '自定义', value: APPLY_PERSON.custom}
		]"
		:show-custom-button="form_data.apply_person === APPLY_PERSON.custom"
		:checked-list.sync="form_data.apply_person_checked_list"
		:disabled="disabled"
		style="--label-w: 42px;--select-w:282px;margin-bottom: 16px;"
		@open-dialog="person_dialog_visible = true"
	/>
	<tag-select
		v-if="flags.displayVisitor"
		v-model="form_data.apply_visitor"
		label="访客"
		:options="[
			{label: '全部访客', value: APPLY_VISITOR.all},
			{label: '无', value: APPLY_VISITOR.none},
			{label: '自定义', value: APPLY_VISITOR.custom}
		]"
		:show-custom-button="form_data.apply_visitor === APPLY_VISITOR.custom"
		:checked-list.sync="form_data.apply_visitor_checked_list"
		:disabled="disabled"
		style="--label-w:42px;--select-w:282px;margin-bottom: 16px;"
		@open-dialog="visitor_dialog_visible = true"
	/>
	<tag-select
		v-if="flags.displayContractor"
		v-model="form_data.apply_contractor"
		label="承包商"
		:options="[
			{label: '全部承包商', value: APPLY_CONTRACTOR.all},
			{label: '无', value: APPLY_CONTRACTOR.none},
			{label: '自定义', value: APPLY_CONTRACTOR.custom}
		]"
		:show-custom-button="form_data.apply_contractor === APPLY_CONTRACTOR.custom"
		:checked-list.sync="form_data.apply_contractor_checked_list"
		:disabled="disabled"
		style="--label-w:42px;--select-w:282px;margin-bottom: 16px;"
		@open-dialog="contractor_dialog_visible = true"
	/>
	<tag-select
		v-if="flags.car"
		v-model="form_data.apply_truck"
		label="车辆"
		:options="[
			{label: '全部车辆', value: APPLY_TRUCK.all},
			{label: '无', value: APPLY_TRUCK.none},
			{label: '自定义', value: APPLY_TRUCK.custom}
		]"
		:show-custom-button="form_data.apply_truck === APPLY_TRUCK.custom"
		:checked-list.sync="form_data.apply_truck_checked_list"
		:disabled="disabled"
		style="--label-w:42px;--select-w:282px;margin-bottom: 16px;"
		@open-dialog="truck_dialog_visible = true"
	/>
	<tag-select
		v-if="flags.displayMaterial"
		v-model="form_data.apply_material"
		label="物资"
		:options="[
			{label: '全部物资', value: APPLY_MATERIAL.all},
			{label: '无', value: APPLY_MATERIAL.none},
			{label: '自定义', value: APPLY_MATERIAL.custom}
		]"
		:show-custom-button="form_data.apply_material === APPLY_MATERIAL.custom"
		:checked-list.sync="form_data.apply_material_checked_list"
		:disabled="disabled"
		style="--label-w:42px;--select-w:282px;"
		@open-dialog="material_dialog_visible = true"
	/>

	<shuttle-dialog
		v-model="person_dialog_visible"
		title="选择员工"
		:select-options="person_shuttle_options"
		:checked-list.sync="form_data.apply_person_checked_list"
	/>
	<shuttle-dialog
		v-model="visitor_dialog_visible"
		title="选择访客"
		:select-options="visitor_shuttle_options"
		:checked-list.sync="form_data.apply_visitor_checked_list"
	/>
	<shuttle-dialog
		v-model="truck_dialog_visible"
		title="选择车辆"
		:select-options="truck_shuttle_options"
		:checked-list.sync="form_data.apply_truck_checked_list"
	/>
	<shuttle-dialog
		v-model="material_dialog_visible"
		title="选择物资"
		:select-options="material_shuttle_options"
		:checked-list.sync="form_data.apply_material_checked_list"
	/>
	<shuttle-dialog
		v-model="contractor_dialog_visible"
		title="选择承包商"
		:select-options="contractor_shuttle_options"
		:checked-list.sync="form_data.apply_contractor_checked_list"
	/>
</div>
</template>

<script setup lang="ts">
import {ref, watch, reactive} from "vue";

import {useFeatureFlags} from "@/store";
import TagSelect from "@/components/Select/TagSelect.vue";
import {SHUTTLE_TYPE, SHUTTLE_API_PARAMS_KEY} from "@/components/Dialog/constant";
import ShuttleDialog from "@/components/Dialog/shuttle/ShuttleDialog.vue";

import type {FormData} from "./types";
import {APPLY_PERSON, APPLY_VISITOR, APPLY_TRUCK, APPLY_MATERIAL, APPLY_CONTRACTOR} from "./types";

interface Props {
	defaultFormData: FormData["apply_object"],
	disabled: boolean,
	handleAuth: boolean,
	deleteAuth: boolean,
	type: "plans" | "task"
}
const props = defineProps<Props>();

const form_data = ref<FormData["apply_object"]>(props.defaultFormData);
const person_dialog_visible = ref(false);
const visitor_dialog_visible = ref(false);
const truck_dialog_visible = ref(false);
const material_dialog_visible = ref(false);
const contractor_dialog_visible = ref(false);
const flags = reactive(useFeatureFlags());

const person_shuttle_options = [
	{label: "员工姓名", value: SHUTTLE_TYPE.person},
	{label: "部门", value: SHUTTLE_TYPE.branch, tab_name: "组织架构"},
	{label: "职务", value: SHUTTLE_TYPE.duty, tab_name: "职务"},
	{label: "工种", value: SHUTTLE_TYPE.work_type, tab_name: "工种"},
	{label: "员工分类", value: SHUTTLE_TYPE.person_class, tab_name: "员工分类"}
];
const visitor_shuttle_options = [
	{label: "访客姓名", value: SHUTTLE_TYPE.visitor, tab_name: "访客姓名"},
];
const truck_shuttle_options = [
	{label: "车牌号", value: SHUTTLE_TYPE.truck},
	{label: "车辆类型", value: SHUTTLE_TYPE.truck_type, tab_name: "车辆类型"},
];
const material_shuttle_options = [
	{label: "物资编号", value: SHUTTLE_TYPE.material},
	{label: "物资类型", value: SHUTTLE_TYPE.material_type, tab_name: "物资类型"},
];
const contractor_shuttle_options = [
	{label: "承包商姓名", value: SHUTTLE_TYPE.contractor},
	{label: "承包商单位", value: SHUTTLE_TYPE.contractor_unit},
	{label: "工种", value: SHUTTLE_TYPE.contractor_work_type},
];

watch(() => props.defaultFormData, (new_form_data) => {
	form_data.value = {
		...new_form_data,
		apply_person_checked_list: [...new_form_data.apply_person_checked_list],
		apply_truck_checked_list: [...new_form_data.apply_truck_checked_list],
		apply_visitor_checked_list: [...new_form_data.apply_visitor_checked_list],
		apply_material_checked_list: [...new_form_data.apply_material_checked_list],
		apply_contractor_checked_list: [...new_form_data.apply_contractor_checked_list],
	};
});

type ApplyObjectKey =
	"uuid_list" |
	"branch_id_list" |
	"person_class_id_list" |
	"duty_id_list" |
	"work_type_id_list" |
	"truck_type_id_list" |
	"material_type_id_list" |
	"contractor_unit_id_list" |
	"contractor_work_type_id_list"

type ApplyObjectParams = {
	type_things_json: string,
	uuid_list: number[],
	branch_id_list: number[],
	person_class_id_list: number[],
	duty_id_list: number[],
	work_type_id_list: number[],
	truck_type_id_list: number[],
	material_type_id_list: number[],
	contractor_unit_id_list: number[],
	contractor_work_type_id_list: number[]
}
function getApiParams() {
	const {
		apply_person,
		apply_person_checked_list,
		apply_truck,
		apply_truck_checked_list,
		apply_visitor,
		apply_visitor_checked_list,
		apply_material,
		apply_material_checked_list,
		apply_contractor,
		apply_contractor_checked_list,
	} = form_data.value;

	const params: ApplyObjectParams = {
		type_things_json: JSON.stringify({
			is_person: apply_person === APPLY_PERSON.all ? 1 : 0,
			is_truck: apply_truck === APPLY_TRUCK.all ? 1 : 0,
			is_visitor: apply_visitor === APPLY_VISITOR.all ? 1 : 0,
			is_material: apply_material === APPLY_MATERIAL.all ? 1 : 0,
			is_contractor: apply_contractor === APPLY_CONTRACTOR.all ? 1 : 0
		}),
		uuid_list: [],
		branch_id_list: [],
		person_class_id_list: [],
		duty_id_list: [],
		work_type_id_list: [],
		truck_type_id_list: [],
		material_type_id_list: [],
		contractor_unit_id_list: [],
		contractor_work_type_id_list: []
	};

	[
		...(apply_person === APPLY_PERSON.custom ? apply_person_checked_list : []),
		...(apply_truck === APPLY_TRUCK.custom ? apply_truck_checked_list : []),
		...(apply_visitor === APPLY_VISITOR.custom ? apply_visitor_checked_list : []),
		...(apply_material === APPLY_MATERIAL.custom ? apply_material_checked_list : []),
		...(apply_contractor === APPLY_CONTRACTOR.custom ? apply_contractor_checked_list : []),
	].forEach(({id, type}) => {
		const key = SHUTTLE_API_PARAMS_KEY[type] as ApplyObjectKey;
		params[key].push(id);
	});

	return params;
}

defineExpose({
	getApiParams,
});
</script>

<style scoped lang="scss">
.apply-object-wrap {
	.alarm-unbind {
		margin: 16px 0;
		display: flex;
		column-gap: 16px;

		.el-select {
			flex: 0 1 50%;
		}
	}

	&.call-task :deep(.tag-select-container .label-button) {
		display: none;
	}
}
</style>
