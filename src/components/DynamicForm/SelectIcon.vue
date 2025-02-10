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
		v-if="![-1, -2, -3, -4].includes(props.value)"
		#prefix
	>
		<div class="icon-select-prefix">
			<template v-if="select_icon">
				<img
					:src="base_url + select_icon.icon_picture.model_2d_url"
					class="icon-option-prefix"
					alt=""
				>
				{{ select_icon.icon_name }}
			</template>
			<template v-if="select_icon && select_icon.icon_sex">
				/<img
					:src="base_url + select_icon.icon_picture_man?.model_2d_url"
					class="icon-option-prefix"
					alt=""
				>男/<img
					:src="base_url + select_icon.icon_picture_woman?.model_2d_url"
					class="icon-option-prefix"
					alt=""
				>女
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
		v-if="[PERSON, VISITOR, CONTRACTOR, CONTRACTOR_UNIT].includes(props.thingsType)"
		:value="-1"
		label="跟随三维模型"
	/>
	<el-option
		v-if="[CAR, MATERIAL].includes(props.thingsType)"
		:value="-3"
		label="跟随类型"
	/>
	<el-option
		v-for="model in icon_list"
		:key="model.id"
		:value="model.id"
		label=" "
	>
		<img
			:src="base_url + model.icon_picture.model_2d_url"
			class="icon-option-prefix"
			alt=""
		>
		<span class="icon-option-label">{{ model.icon_name }}</span>
		<template v-if="model.icon_sex">
			/<img
				:src="base_url + model.icon_picture_man?.model_2d_url"
				class="icon-option-prefix"
				alt=""
			>男/<img
				:src="base_url + model.icon_picture_woman?.model_2d_url"
				class="icon-option-prefix"
				alt=""
			>女
		</template>
	</el-option>
</el-select>
</template>

<script setup>
import {ref, shallowRef, watch} from "vue";
import {base_url} from "@/Config";
import {getIconList} from "@/api/characterModel/icon";

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
const icon_list = shallowRef([]);

const select_icon = ref(null);

watch([() => icon_list.value, () => props.value], ([icon_list, icon_id]) => {
	if ([-1, -2, -3, -4].includes(icon_id) || icon_id === "") {
		select_icon.value = null;
	} else {
		select_icon.value = icon_list.find(item => item.id === icon_id);
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
	let icon_things_type;
	if (props.thingsType === CONTRACTOR) {
		icon_things_type = CONTRACTOR_UNIT;
	} else if (props.thingsType) {
		icon_things_type = props.thingsType;
	}
	getIconList({icon_things_type}).then(res => {
		const {type, result} = res.data;
		if (type === 1) {
			icon_list.value = result.data;
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

.icon-option-prefix {
	width: 20px;
	height: 20px;
	vertical-align: middle;
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

:deep(.el-input__prefix .icon-option-prefix) {
	display: inline-block;
	width: 20px;
	height: 20px;
	vertical-align: middle;
}
</style>
