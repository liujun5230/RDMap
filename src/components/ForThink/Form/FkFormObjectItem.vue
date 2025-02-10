<template>
<div class="object-item-content">
	<!-- 定位对象 -->
	<el-form-item label="定位对象类型">
		<el-select
			v-model="object_search_data.utype"
			@change="resetObjectDefault(true)"
		>
			<el-option
				v-for="item in utype_options"
				:key="item.value"
				:value="item.value"
				:label="item.label"
			/>
		</el-select>
	</el-form-item>
	<el-form-item
		v-if="is_show_person"
		label="部门"
	>
		<branch-select
			ref="branch_select"
			@change-branch="changePersonBranch"
		/>
	</el-form-item>
	<el-form-item
		v-if="is_show_classify"
		label="员工分类"
	>
		<el-select
			v-model="object_search_data.person_class_id"
			placeholder="请选择员工分类"
		>
			<el-option
				label="全部"
				value="all"
			/>
			<el-option
				v-for="item in person_classify_options"
				:key="item.value"
				:label="item.label"
				:value="item.value"
			/>
		</el-select>
	</el-form-item>
	<el-form-item
		v-if="is_show_contractor"
		label="承包商单位"
	>
		<el-select
			v-model="object_search_data.unit_id"
		>
			<el-option
				label="全部"
				value="all"
			/>
			<el-option
				v-for="item in contractor_unit_options"
				:key="item.value"
				:label="item.label"
				:value="item.value"
			/>
		</el-select>
	</el-form-item>
	<el-form-item
		v-if="is_show_car"
		label="车辆类型"
	>
		<el-select
			v-model="object_search_data.truck_type_id"
		>
			<el-option
				label="全部"
				value="all"
			/>
			<el-option
				v-for="item in car_type_options"
				:key="item.value"
				:label="item.label"
				:value="item.value"
			/>
		</el-select>
	</el-form-item>
	<el-form-item
		v-if="is_show_material"
		label="物资类型"
	>
		<el-select v-model="object_search_data.material_type_id">
			<el-option
				label="全部"
				value="all"
			/>
			<el-option
				v-for="item in material_type_options"
				:key="item.value"
				:value="item.value"
				:label="item.label"
			/>
		</el-select>
	</el-form-item>
</div>
</template>

<script setup lang="ts">
import {ref, computed, watch} from "vue";
import BranchSelect from "@/components/BranchSelect.vue";
import {UTYPES} from "@/utils/js/constant";
import {getTruckType} from "@/api/truck/truck";
import {getMaterialType} from "@/api/material/material";
import {getPersonClassify} from "@/api/company/personClassify";
import {getContractorUnit} from "@/api/contractor/Company";
import {usePersonClassify, useObjectOptions} from "@/composable/hide";

type option_type = {
	label:string;
	value:number | string;
}

type search_type = {
	utype: UTYPES | string ;
	branch_id: number | string ;
	person_class_id: number | string ;
	truck_type_id: number | string ;
	material_type_id: number | string ;
	unit_id: number | string ;
}

type Props = {
	objectExclude?: UTYPES[];
	includeUnknownCard?:boolean;
}

const props = withDefaults(defineProps<Props>(), {
	objectExclude: () => [],
	includeUnknownCard: false,
});

const getDefaultSearch = () => {
	return {
		utype: "all",
		branch_id: "",
		person_class_id: "all",
		truck_type_id: "all",
		material_type_id: "all",
		unit_id: "all"
	};
};
const object_search_data = ref<search_type>(getDefaultSearch());
const branch_select = ref();

const is_show_person = computed(() => object_search_data.value.utype === UTYPES.PERSON || object_search_data.value.utype === "all");
const is_show_contractor = computed(() => object_search_data.value.utype === UTYPES.CONTRACTOR);
const is_show_car = computed(() => object_search_data.value.utype === UTYPES.CAR);
const is_show_material = computed(() => object_search_data.value.utype === UTYPES.MATERIAL);
const is_show_classify = computed(() => usePersonClassify().value && is_show_person.value);

const utype_options = computed(() => useObjectOptions().value.filter((item:{[key:string]:any}) => (props.includeUnknownCard || (!props.includeUnknownCard && item.value !== UTYPES.UNKNOWN)) && !props.objectExclude.includes(item.value)));
const car_type_options = ref<option_type[]>([]);
const person_classify_options = ref<option_type[]>([]);
const material_type_options = ref<option_type[]>([]);
const contractor_unit_options = ref<option_type[]>([]);

const emit = defineEmits<{(e: "handle-change"): void}>();

watch(
	() => object_search_data.value.utype,
	() => {
		emit("handle-change");
	}
);

const getCarTypeOptions = async () => {
	const car_res = await getTruckType();
	if (car_res.data.type === 1) {
		const data = car_res.data.result.data;
		car_type_options.value = data.map((i:{[key:string]:string}) => {
			return {value: i.id, label: i.name};
		});
	}
};
const getPersonClassifyOptions = async () => {
	const person_res = await getPersonClassify();
	if (person_res.data.type === 1) {
		const data = person_res.data.result.data;
		person_classify_options.value = data.map((i:{[key:string]:string}) => {
			return {value: i.id, label: i.classname};
		});
	}
};
const getMaterialTypeOptions = async () => {
	const res = await getMaterialType();
	if (res.data.type === 1) {
		const data = res.data.result.data;
		material_type_options.value = data.map((i:{[key:string]:string}) => {
			return {value: i.id, label: i.name};
		});
	}
};

const getContractorOptions = async () => {
	const res = await getContractorUnit({});
	if (res.data.type === 1) {
		const data = res.data.result.data;
		contractor_unit_options.value = data.map(({id, name}) => {
			return {value: id, label: name};
		});
	}
};

const changePersonBranch = (id:number[] | string) => {
	object_search_data.value.branch_id = id === "all" ? "" : id[id.length - 1];
};

const getObjectSearchData = () => {
	const obj:Partial<search_type> = {};
	let key:keyof search_type;
	for (key in object_search_data.value) {
		if (object_search_data.value[key] !== "" && object_search_data.value[key] !== "all") obj[key] = object_search_data.value[key];
	}
	return obj;
};

const resetObjectDefault = (is_change_type?:boolean) => {
	const temp_type = object_search_data.value.utype;
	branch_select.value?.resetBranch();
	object_search_data.value = getDefaultSearch();
	if (is_change_type) object_search_data.value.utype = temp_type;
};

const setObjectType = (utype:UTYPES | string) => {
	object_search_data.value.utype = utype;
};

getCarTypeOptions();
getPersonClassifyOptions();
getMaterialTypeOptions();
getContractorOptions();

defineExpose({
	getObjectSearchData,
	resetObjectDefault,
	setObjectType
});
</script>

<style scoped>
.object-item-content{
	display: inline;
}
</style>
