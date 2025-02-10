<template>
<div
	ref="main_content_ref"
	class="main-content"
>
	<el-form
		ref="health_setting_form_ref"
		size="small"
		label-position="top"
		:rules="rules"
		:model="heart_setting_form"
	>
		<anchor-title title="心率告警" />
		<div class="base-info">
			<el-form-item
				label="上限"
				prop="maximum_heart_rate"
			>
				<el-input
					v-model="heart_setting_form.maximum_heart_rate"
					:disabled="heart_setting_form.can_not_edit"
					size="small"
				>
					<template #append>
						bpm
					</template>
				</el-input>
			</el-form-item>
			<el-form-item
				label="下限"
				prop="lower_heart_rate"
			>
				<el-input
					v-model="heart_setting_form.lower_heart_rate"
					:disabled="heart_setting_form.can_not_edit"
					size="small"
				>
					<template #append>
						bpm
					</template>
				</el-input>
			</el-form-item>
		</div>
		<anchor-title title="血氧饱和度告警" />
		<div class="base-info">
			<el-form-item
				label="下限"
				prop="oxygen_thresholds"
			>
				<el-input
					v-model="heart_setting_form.oxygen_thresholds"
					:disabled="heart_setting_form.can_not_edit"
					size="small"
				>
					<template #append>
						%
					</template>
				</el-input>
			</el-form-item>
		</div>
		<anchor-title title="体温告警" />
		<div class="base-info">
			<el-form-item
				label="上限"
				prop="body_temperature_thresholds"
			>
				<el-input
					v-model="heart_setting_form.body_temperature_thresholds"
					:disabled="heart_setting_form.can_not_edit"
					size="small"
				>
					<template #append>
						°C
					</template>
				</el-input>
			</el-form-item>
		</div>
	</el-form>
	<div
		v-if="btn_handle_auth"
		class="handle-btn"
		:class="{ 'handle-btn-panel': isScrolling || !arrivedState.top }"
	>
		<el-button
			v-show="heart_setting_form.can_not_edit"
			plain
			type="primary"
			@click="startEditHeart"
		>
			编辑
		</el-button>
		<el-button
			v-show="!heart_setting_form.can_not_edit"
			plain
			@click="cancelEdit"
		>
			取消
		</el-button>
		<el-button
			v-show="!heart_setting_form.can_not_edit"
			v-preventRepeatClick
			type="primary"
			@click="saveCard"
		>
			保存
		</el-button>
	</div>
</div>
</template>
<script setup>
import {Notification} from "element-ui";
import {ref, computed, inject, watch} from "vue";
import AnchorTitle from "@/components/AnchorTitle.vue";
import {getHeartList, updateHeartRate} from "@/api/health/heartRate";
import {useScroll} from "@vueuse/core";

const health_auth = inject("HEALTH_SETTING_AUTH");
const btn_handle_auth = computed(() => health_auth.value);
const archive_uuid = inject("ARCHIVE_UUID");

const main_content_ref = ref();
const {isScrolling, arrivedState} = useScroll(main_content_ref);

const health_setting_form_ref = ref();
const heart_info = ref({});

const rules = {
	maximum_heart_rate: [
		{
			required: true,
			message: "心率上下限不能为空",
			trigger: "blur"
		},
		{pattern: /^[\d]*$/, message: "请输入正整数", trigger: "blur"},
		{
			validator: (rule, value, callback) => {
				if (Number(value) <= Number(heart_setting_form.value.lower_heart_rate)) {
					callback("心率上限不能小于心率下限");
				} else {
					callback();
				}
			},
			trigger: "blur"
		}
	],
	lower_heart_rate: [
		{
			required: true,
			message: "心率上下限不能为空",
			trigger: "blur"
		},
		{pattern: /^[\d]*$/, message: "请输入正整数", trigger: "blur"},
		{
			validator: (rule, value, callback) => {
				if (Number(value) >= Number(heart_setting_form.value.maximum_heart_rate)) {
					callback("心率上限不能小于心率下限");
				} else {
					callback();
				}
			},
			trigger: "blur"
		}
	],
	oxygen_thresholds: [
		{
			required: true,
			message: " 血氧饱和度下限不能为空",
			trigger: "blur"
		},
		{pattern: /^[\d]*$/, message: "请输入正整数", trigger: "blur"}
	],
	body_temperature_thresholds: [
		{
			required: true,
			message: " 体温上限不能为空",
			trigger: "blur"
		},
		{pattern: /^[\d.]*$/, message: "请输入正数", trigger: "blur"},
	]

};

const getDefaultFormData = () => {
	return {
		can_not_edit: false,
		maximum_heart_rate: 0,
		lower_heart_rate: 0,
		oxygen_thresholds: 95,
		body_temperature_thresholds: 38.0
	};
};

const heart_setting_form = ref(getDefaultFormData());

const editHeartSetting = () => {
	heart_setting_form.value.can_not_edit = true;
	const {maximum_heart_rate, lower_heart_rate, oxygen_thresholds, body_temperature_thresholds} = heart_info.value;
	heart_setting_form.value.maximum_heart_rate = maximum_heart_rate;
	heart_setting_form.value.lower_heart_rate = lower_heart_rate;
	heart_setting_form.value.oxygen_thresholds = oxygen_thresholds;
	heart_setting_form.value.body_temperature_thresholds = body_temperature_thresholds;
};

const startEditHeart = () => {
	heart_setting_form.value.can_not_edit = false;
};

const cancelEdit = () => {
	health_setting_form_ref.value?.clearValidate();
	editHeartSetting();
};

const saveCard = () => {
	health_setting_form_ref.value?.validate(async (valid) => {
		if (valid) {
			const {maximum_heart_rate, lower_heart_rate, oxygen_thresholds, body_temperature_thresholds} = heart_setting_form.value;
			const data = {
				uuid_list: [archive_uuid.value],
				maximum_heart_rate,
				lower_heart_rate,
				oxygen_thresholds,
				body_temperature_thresholds
			};
			const res = await updateHeartRate(data);
			if (res.data.type === 1) {
				Notification({
					type: "success",
					title: "成功",
					message: res.data.result
				});
				getHeartInfo();
			} else {
				Notification({
					type: "error",
					title: "错误",
					message: res.data.result
				});
			}
		} else {
			console.log("验证失败");
		}
	});
};

const getHeartInfo = async () => {
	const res = await getHeartList({uuid: archive_uuid.value});
	if (res.data.type === 1) {
		heart_info.value = res.data.result?.data[0] || {};
	}
	editHeartSetting();
};

watch(() => archive_uuid.value, (val) => {
	if (val) {
		getHeartInfo();
	}
}, {immediate: true});
</script>
<style scoped>
.main-content {
	padding: 16px 16px 0 16px;
	overflow-y: auto;
}

.base-info {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-column-gap: 16px;
	margin-top: 16px;
}

.handle-btn {
	position: absolute;
	padding-top: 16px;
	top: 0;
	right: 15px;
	text-align: right;
}

.handle-btn-panel {
	width: 100%;
	background-color: #fbfdff;
}

:deep(.el-form-item__label) {
	line-height: 14px !important;
	padding: 0 0 8px !important;
}

:deep(.el-form-item--mini.el-form-item),
.el-form-item--small.el-form-item {
	margin-bottom: 24px;

}
:deep(.el-form-item__content .el-input-group__append) {
	background-color: #fff;
	color:#a2b2c2;
	border-color: #D1D8E1;
}

:deep(.el-form-item__content .el-input.is-disabled .el-input-group__append) {
	background-color: #f5f7fa;
	color: #d1d8e1;
}
</style>
