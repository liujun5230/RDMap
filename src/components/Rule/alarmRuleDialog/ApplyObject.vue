<template>
<div class="apply-object-wrap">
	<el-select
		v-if="formConfig.apply_object_type_options.length > 1"
		v-model="form_data.apply_object_type"
		:popper-append-to-body="false"
		:disabled="disabled"
		size="small"
		class="apply-object-type-select"
	>
		<el-option
			v-for="item in formConfig.apply_object_type_options"
			:key="item.value"
			:label="item.label"
			:value="item.value"
		/>
	</el-select>
	<div
		v-if="formConfig.apply_object_alarm_options.length || formConfig.apply_object_unbind_options.length > 1"
		class="alarm-unbind"
	>
		<el-select
			v-if="formConfig.apply_object_alarm_options.length"
			v-model="form_data.apply_object_alarm"
			:popper-append-to-body="false"
			size="small"
			:disabled="formConfig.apply_object_alarm_options.length === 1 || disabled"
		>
			<el-option
				v-for="item in formConfig.apply_object_alarm_options"
				:key="item.value"
				:label="item.label"
				:value="item.value"
			/>
		</el-select>
		<el-select
			v-if="formConfig.apply_object_unbind_options.length > 1"
			v-model="form_data.apply_object_unbind"
			:popper-append-to-body="false"
			:disabled="disabled"
			size="small"
		>
			<el-option
				v-for="item in formConfig.apply_object_unbind_options"
				:key="item.value"
				:label="item.label"
				:value="item.value"
			>
				<div style="display: flex;justify-content: space-between;align-items: center;">
					<span>{{ item.label }}</span>
					<fk-icon
						:tip="item.tip"
						size="16"
					>
						<question-icon />
					</fk-icon>
				</div>
			</el-option>
		</el-select>
	</div>
	<tag-select
		v-if="formConfig.tag_type.person && form_data.apply_object_type === APPLY_OBJECT_TYPE.tag"
		key="员工"
		v-model="form_data.apply_person"
		label="员工"
		:options="formConfig.apply_person_options"
		:show-custom-button="form_data.apply_person === APPLY_PERSON.custom"
		:checked-list.sync="form_data.apply_person_checked_list"
		:disabled="disabled"
		style="--label-w: 42px;--select-w:282px;margin-bottom: 16px;"
		@open-dialog="person_dialog_visible = true"
	/>
	<tag-select
		v-if="formConfig.tag_type.visitor && form_data.apply_object_type === APPLY_OBJECT_TYPE.tag && flags.displayVisitor"
		key="访客"
		v-model="form_data.apply_visitor"
		label="访客"
		:options="formConfig.apply_visitor_options"
		:show-custom-button="form_data.apply_visitor === APPLY_VISITOR.custom"
		:checked-list.sync="form_data.apply_visitor_checked_list"
		:disabled="disabled"
		style="--label-w:42px;--select-w:282px;margin-bottom: 16px;"
		@open-dialog="visitor_dialog_visible = true"
	/>
	<tag-select
		v-if="formConfig.tag_type.contractor && form_data.apply_object_type === APPLY_OBJECT_TYPE.tag && flags.displayContractor"
		key="承包商"
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
		v-if="formConfig.tag_type.truck && form_data.apply_object_type === APPLY_OBJECT_TYPE.tag && flags.car"
		key="车辆"
		v-model="form_data.apply_truck"
		label="车辆"
		:options="formConfig.apply_truck_options"
		:show-custom-button="form_data.apply_truck === APPLY_TRUCK.custom"
		:checked-list.sync="form_data.apply_truck_checked_list"
		:disabled="disabled"
		style="--label-w:42px;--select-w:282px;margin-bottom: 16px;"
		@open-dialog="truck_dialog_visible = true"
	/>
	<tag-select
		v-if="formConfig.tag_type.material && form_data.apply_object_type === APPLY_OBJECT_TYPE.tag && flags.displayMaterial"
		key="物资"
		v-model="form_data.apply_material"
		label="物资"
		:options="formConfig.apply_material_options"
		:show-custom-button="form_data.apply_material === APPLY_MATERIAL.custom"
		:checked-list.sync="form_data.apply_material_checked_list"
		:disabled="disabled"
		style="--label-w:42px;--select-w:282px;margin-bottom: 16px;"
		@open-dialog="material_dialog_visible = true"
	/>
	<tag-select
		v-if="form_data.apply_object_type === APPLY_OBJECT_TYPE.card_type"
		key="标签类型"
		v-model="form_data.apply_card_type"
		label="标签类型"
		:options="formConfig.apply_card_type_options"
		:show-custom-button="form_data.apply_card_type === APPLY_CARD_TYPE.custom"
		:checked-list.sync="form_data.apply_card_type_checked_list"
		:disabled="disabled"
		style="--select-w:268px;"
		@open-dialog="card_type_dialog_visible = true"
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
		v-model="card_type_dialog_visible"
		title="选择标签类型"
		:select-options="card_type_shuttle_options"
		:checked-list.sync="form_data.apply_card_type_checked_list"
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
import FkIcon from "@/components/ForThink/FkIcon.vue";
import QuestionIcon from "~icons/operation/question";
import TagSelect from "@/components/Select/TagSelect.vue";
import {SHUTTLE_TYPE, SHUTTLE_API_PARAMS_KEY, DIALOG_MODE, type CheckedItem} from "@/components/Dialog/constant";
import ShuttleDialog from "@/components/Dialog/shuttle/ShuttleDialog.vue";

import type {FormData, FormConfig} from "./ruleConfig";
import {APPLY_PERSON, APPLY_VISITOR, APPLY_TRUCK, APPLY_MATERIAL, APPLY_CONTRACTOR, APPLY_CARD_TYPE, APPLY_OBJECT_TYPE} from "./ruleConfig";

interface Props {
	defaultFormData: FormData["apply_object"],
	formConfig: FormConfig,
	handleAuth: boolean,
	deleteAuth: boolean,
	disabled: boolean,
	mode: DIALOG_MODE
}
const props = defineProps<Props>();

const form_data = ref<FormData["apply_object"]>({} as FormData["apply_object"]);
const person_dialog_visible = ref(false);
const visitor_dialog_visible = ref(false);
const truck_dialog_visible = ref(false);
const material_dialog_visible = ref(false);
const contractor_dialog_visible = ref(false);
const card_type_dialog_visible = ref(false);
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
const card_type_shuttle_options = [
	{label: "标签类型", value: SHUTTLE_TYPE.card_type, tab_name: "标签类型"},
];

watch(() => props.defaultFormData, (new_form_data) => {
	form_data.value = {
		...new_form_data,
		apply_person_checked_list: [...new_form_data.apply_person_checked_list],
		apply_truck_checked_list: [...new_form_data.apply_truck_checked_list],
		apply_visitor_checked_list: [...new_form_data.apply_visitor_checked_list],
		apply_material_checked_list: [...new_form_data.apply_material_checked_list],
		apply_card_type_checked_list: [...new_form_data.apply_card_type_checked_list],
		apply_contractor_checked_list: [...new_form_data.apply_contractor_checked_list],
	};
}, {
	immediate: true
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
	"contractor_work_type_id_list" |
	"card_type_id_list"

type ApplyObjectParams = {
	applicable_object: 1 | 2,
	uuids_inverse: 0 | 1,
	unbind_alarm: 0 | 1,
	type_things_json: string,
	uuid_list: number[],
	branch_id_list: number[],
	person_class_id_list: number[],
	duty_id_list: number[],
	work_type_id_list: number[],
	truck_type_id_list: number[],
	contractor_unit_id_list: number[],
	contractor_work_type_id_list: number[]
	material_type_id_list: number[],
	card_type_id_list: number[]
}
function getApiParams() {
	const {
		apply_object_type,
		apply_object_alarm,
		apply_object_unbind,
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
		apply_card_type,
		apply_card_type_checked_list
	} = form_data.value;

	const params: ApplyObjectParams = {
		applicable_object: apply_object_type,
		uuids_inverse: apply_object_alarm,
		unbind_alarm: apply_object_unbind,
		type_things_json: JSON.stringify({
			is_person: apply_object_type === APPLY_OBJECT_TYPE.tag ? (apply_person === APPLY_PERSON.all ? 1 : 0) : 0,
			is_truck: apply_object_type === APPLY_OBJECT_TYPE.tag ? (apply_truck === APPLY_TRUCK.all ? 1 : 0) : 0,
			is_visitor: apply_object_type === APPLY_OBJECT_TYPE.tag ? (apply_visitor === APPLY_VISITOR.all ? 1 : 0) : 0,
			is_material: apply_object_type === APPLY_OBJECT_TYPE.tag ? (apply_material === APPLY_MATERIAL.all ? 1 : 0) : 0,
			is_contractor: apply_object_type === APPLY_OBJECT_TYPE.tag ? (apply_contractor === APPLY_CONTRACTOR.all ? 1 : 0) : 0,
			is_card_type: apply_object_type === APPLY_OBJECT_TYPE.tag ? 0 : (apply_card_type === APPLY_CARD_TYPE.all ? 1 : 0)
		}),
		uuid_list: [],
		branch_id_list: [],
		person_class_id_list: [],
		duty_id_list: [],
		work_type_id_list: [],
		truck_type_id_list: [],
		material_type_id_list: [],
		contractor_unit_id_list: [],
		contractor_work_type_id_list: [],
		card_type_id_list: []
	};

	[
		...(apply_object_type === APPLY_OBJECT_TYPE.tag ? (apply_person === APPLY_PERSON.custom ? apply_person_checked_list : []) : []),
		...(apply_object_type === APPLY_OBJECT_TYPE.tag ? (apply_truck === APPLY_TRUCK.custom ? apply_truck_checked_list : []) : []),
		...(apply_object_type === APPLY_OBJECT_TYPE.tag ? (apply_visitor === APPLY_VISITOR.custom ? apply_visitor_checked_list : []) : []),
		...(apply_object_type === APPLY_OBJECT_TYPE.tag ? (apply_material === APPLY_MATERIAL.custom ? apply_material_checked_list : []) : []),
		...(apply_object_type === APPLY_OBJECT_TYPE.tag ? (apply_contractor === APPLY_CONTRACTOR.custom ? apply_contractor_checked_list : []) : []),
		...(apply_object_type === APPLY_OBJECT_TYPE.tag ? [] : (apply_card_type === APPLY_CARD_TYPE.custom ? apply_card_type_checked_list : []))
	].forEach(({id, type}) => {
		const key = SHUTTLE_API_PARAMS_KEY[type] as ApplyObjectKey;
		params[key].push(id);
	});

	return params;
}

function isTriggerConfirmBox() {
	const {defaultFormData: default_form_data} = props;
	const {
		apply_person: default_apply_person,
		apply_person_checked_list: default_apply_person_checked_list,
		apply_visitor: default_apply_visitor,
		apply_visitor_checked_list: default_apply_visitor_checked_list,
		apply_truck: default_apply_truck,
		apply_truck_checked_list: default_apply_truck_checked_list,
		apply_material: default_apply_material,
		apply_material_checked_list: default_apply_material_checked_list,
		apply_contractor: default_apply_contractor,
		apply_contractor_checked_list: default_apply_contractor_checked_list,
		apply_card_type: default_apply_card_type,
		apply_card_type_checked_list: default_apply_card_type_checked_list
	} = default_form_data;
	const {
		apply_person,
		apply_person_checked_list,
		apply_visitor,
		apply_visitor_checked_list,
		apply_truck,
		apply_truck_checked_list,
		apply_material,
		apply_material_checked_list,
		apply_contractor,
		apply_contractor_checked_list,
		apply_card_type,
		apply_card_type_checked_list
	} = form_data.value;
	const mapCallback = ({id, type}: CheckedItem) => `${type}-${id}`;
	const checkFn = <T extends APPLY_PERSON | APPLY_VISITOR | APPLY_TRUCK | APPLY_MATERIAL | APPLY_CONTRACTOR | APPLY_CARD_TYPE>(default_select: T, default_data: CheckedItem[], new_select: T, new_data: CheckedItem[]) => {
		// 这里使用的魔术字符串"all"和"custom"，如果APPLY_PERSON等修改了需要同步修改
		if (default_select === "all") {
			return new_select !== "all";
		} else if (default_select === "custom") {
			const default_ids = default_data.map(mapCallback);
			const new_ids = new_data.map(mapCallback);
			return !default_ids.every((id) => new_ids.includes(id));
		} else {
			return false;
		}
	};
	const is_delete_person = checkFn<APPLY_PERSON>(default_apply_person, default_apply_person_checked_list, apply_person, apply_person_checked_list);
	const is_delete_visitor = checkFn<APPLY_VISITOR>(default_apply_visitor, default_apply_visitor_checked_list, apply_visitor, apply_visitor_checked_list);
	const is_delete_truck = checkFn<APPLY_TRUCK>(default_apply_truck, default_apply_truck_checked_list, apply_truck, apply_truck_checked_list);
	const is_delete_material = checkFn<APPLY_MATERIAL>(default_apply_material, default_apply_material_checked_list, apply_material, apply_material_checked_list);
	const is_delete_contractor = checkFn<APPLY_CONTRACTOR>(default_apply_contractor, default_apply_contractor_checked_list, apply_contractor, apply_contractor_checked_list);
	const is_delete_card_type = checkFn<APPLY_CARD_TYPE>(default_apply_card_type, default_apply_card_type_checked_list, apply_card_type, apply_card_type_checked_list);
	return is_delete_person || is_delete_visitor || is_delete_truck || is_delete_material || is_delete_contractor || is_delete_card_type;
}

defineExpose({
	getApiParams,
	isTriggerConfirmBox
});
</script>

<style scoped lang="scss">
.apply-object-wrap {
	.apply-object-type-select {
		width: 50%;
		padding-right: 8px;
		margin-bottom: 16px;
	}

	.alarm-unbind {
		margin: 0 0 16px;
		display: flex;

		.el-select {
			flex: 0 1 50%;

			&:nth-child(1) {
				padding-right: 8px;
			}

			&:nth-child(2) {
				padding-left: 8px;
			}
		}
	}
}
</style>
