<template>
<div class="select-custom-container">
	<el-select
		:value="props.value"
		popper-class="select-custom-popper"
		:append-to-body="false"
		:disabled="disabled"
		@input="updateModelValue"
	>
		<el-option
			v-for="item in props.options"
			:key="item.label"
			:label="item.label"
			:value="item.value"
		/>

		<el-option
			:label="minutes"
			:value="minutes"
		>
			<div
				class="custom-option-item"
			>
				<div
					class="custom-input-wrap"
					@click="stopPropagation"
				>
					<el-input
						class="custom-input-number"
						:value="minutes"
						:disabled="disabled"
						type="number"
						size="mini"
						@input="updateInputMinutes"
						@blur="correctCustomInput"
					/>
				</div>
			</div>
		</el-option>
	</el-select>
	<span
		class="append-text"
		:class="{'append-text-disabled':disabled}"
	>{{ props.unit }}</span>
</div>
</template>

<script setup>
import {ref, watch} from "vue";

const emits = defineEmits(["input", "change"]);

// props
const props = defineProps({
	value: {
		type: [Number],
		default: 0
	},
	options: {
		type: Array,
		default: () => []
	},
	defaultMinutes: {
		type: Number,
		default: 0
	},
	unit: {
		type: String,
		default: "秒"
	},
	disabled: {
		type: Boolean,
		default: false
	}
});

// 自定义分钟
const minutes = ref(props.defaultMinutes);

watch(() => props.value, (new_value) => {
	const is_exist = props.options.findIndex((item) => item.value === new_value) > -1;
	is_exist || (minutes.value = new_value);
}, {
	immediate: true
});

function stopPropagation(e) {
	e.stopPropagation();
}

function updateModelValue(value) {
	emits("input", value);
	emits("change", value);
}

function updateInputMinutes(value) {
	// 只能输入正整数
	minutes.value = value === "" ? 0 : parseInt(value.replace(/[^0-9]/g, ""));
	updateModelValue(minutes.value);
}

// 矫正自定义输入值，当输入为空或者0时，矫正为 1
function correctCustomInput() {
	if (!minutes.value) {
		minutes.value = 1;
		updateModelValue(1);
	}
}

// 方便消费组件使用，重置自定义输入框的值
function resetMinutes() {
	minutes.value = props.defaultMinutes;
}

defineExpose({
	resetMinutes
});

</script>

<style lang="scss" scoped>
.select-custom-container {
	display: flex;
	.el-select {
		width: 100%;
	}
	.el-select :deep(.el-input__inner) {
		border-radius: 4px 0 0 4px;
	}

	.append-text {
		line-height: 30px;
		color: rgba(23, 62, 103, 0.6);
		padding: 0 12px;
		border: 1px solid #DCDFE6;
		border-left: none;
		border-radius: 0 4px 4px 0;
	}
	.append-text-disabled {
		background-color: #f5f7fa;
	}
}

.select-custom-popper {
	.el-select-dropdown__item:last-child {
		padding: 0;
	}

	.el-select-dropdown__item.selected {
		.custom-input-number {
			:deep(.el-input__inner) {
				color: #07f;
			}
		}
	}

	.custom-option-item {
		padding: 0 20px;

		.custom-input-wrap {
			width: 90px;
		}
	}
}
</style>
