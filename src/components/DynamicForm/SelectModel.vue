<template>
<el-select
	ref="select_ref"
	class="w-full"
	:value="props.value"
	:disabled="props.disabled"
	@input="updatePropValue"
	@visible-change="onScrollForm"
>
	<!-- TODO 由于el-option的label属性内容不能嵌入html，由prefix插槽取而代之 -->
	<template
		v-if="![-2, -3, -4].includes(props.value)"
		#prefix
	>
		<div class="icon-select-prefix">
			<template v-if="select_icon">
				<div class="model-option-prefix">
					<img
						:src="base_url + select_icon.fullbody_url"
						alt=""
					>
				</div>
				{{ select_icon.model_name }}
			</template>
		</div>
	</template>
	<el-option
		v-if="props.thingsType === PERSON"
		:value="-2"
		label="跟随部门"
	/>
	<el-option
		v-if="props.thingsType === CONTRACTOR"
		:value="-4"
		label="跟随单位"
	/>
	<el-option
		v-if="[CAR, MATERIAL].includes(props.thingsType)"
		:value="-3"
		label="跟随类型"
	/>
	<el-option
		v-for="model in model_list"
		:key="model.model_id"
		:value="model.model_id"
		label=" "
	>
		<div class="model-option-prefix">
			<img
				:src="base_url + model.fullbody_url"
				alt=""
			>
		</div>
		<span class="icon-option-label">{{ model.model_name }}</span>
	</el-option>
</el-select>
</template>

<script setup>
import {ref, shallowRef, watch} from "vue";
import {base_url} from "@/Config";
import {getCharacterList} from "@/api/characterModel/character";

const PERSON = 1, CAR = 2, VISITOR = 3, MATERIAL = 5, CONTRACTOR = 6, CONTRACTOR_UNIT = 7;

const props = defineProps({
	value: {
		type: [Number, String],
		required: true
	},
	thingsType: {
		type: Number,
		required: true
	},
	disabled: {
		type: Boolean,
		default: false
	}
});

const emits = defineEmits(["input", "visible-change"]);

const select_ref = ref();

// 人物模型列表数据
const model_list = shallowRef([]);

const select_icon = ref(null);

watch([() => model_list.value, () => props.value], ([model_list, model_id]) => {
	if ([-2, -3, -4].includes(model_id) || model_id === "") {
		select_icon.value = null;
	} else {
		select_icon.value = model_list.find(it => it.model_id === model_id);
	}
});

const updatePropValue = (value) => {
	emits("input", value);
};

const onScrollForm = (flag) => {
	emits("visible-change", flag);
};

const blur = () => {
	select_ref.value?.blur();
};

const getModelList = () => {
	// 人员、访客时不区分model_things_type
	getCharacterList({
		model_things_type: [PERSON, VISITOR, CONTRACTOR, CONTRACTOR_UNIT].includes(props.thingsType) ? undefined : props.thingsType
	}).then(res => {
		const {type, result} = res.data;
		if (type === 1) {
			model_list.value = result.data;
		}
	});
};
getModelList();

defineExpose({
	blur
});
</script>

<style scoped>
.w-full {
	width: 100%;
}

.icon-select-prefix {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	vertical-align: text-bottom;
	line-height: 32px;
	color: #a2b2c2;
}

.icon-option-label {
	margin-left: 4px;
	vertical-align: middle;
}

:deep(.el-input__prefix) {
	width: 80%;
	text-align: left !important;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

:deep(.el-input__prefix .model-option-prefix img) {
	display: inline-block;
	height: 22px;
	vertical-align: middle;
}

.model-option-prefix {
	display: inline-flex;
	justify-content: center;
	width: 26px;
	height: 26px;
	vertical-align: middle;
}

.model-option-prefix img {
	height: 100%;
}
</style>
