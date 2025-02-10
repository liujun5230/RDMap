<template>
<base-dialog
	v-model="dialog_visible"
	title="区域模板"
	:show-close="true"
	:close-on-click-modal="false"
	width="570px"
	show-footer
	@input="closeDialog"
>
	<el-form
		ref="form_ref"
		size="small"
		class="template-form"
		label-position="top"
		:model="form"
		:rules="rules"
	>
		<el-form-item
			label="区域模板名称"
			prop="name"
		>
			<el-input
				v-model="form.name"
				type="text"
				maxlength="10"
				show-word-limit
				:disabled="!is_edit"
			/>
		</el-form-item>
		<el-form-item
			label="区域颜色"
			prop="area_style"
		>
			<fk-color-picker
				v-model="form.area_style"
				popper-class="color-picker"
				color-format="rgb"
				:show-alpha="true"
				:disabled="!is_edit"
			/>
		</el-form-item>
		<el-form-item
			label="起始高度"
			prop="relative_start"
		>
			<el-input
				v-model="form.relative_start"
				:disabled="!is_edit"
			/>
		</el-form-item>
		<el-form-item
			label="终止高度"
			prop="relative_end"
		>
			<el-input
				v-model="form.relative_end"
				:disabled="!is_edit"
			/>
		</el-form-item>
		<el-form-item>
			<template #label>
				<div class="card-vanish-time-label">
					<span class="is-required">*</span>
					<label class="card-label">标签卡离线时间</label>
					<el-tooltip
						effect="dark"
						popper-class="card-vanish-time-tooltip"
						content="标签卡无法定位后，超过此时间，变为离线状态，并且页面图标变为灰色"
						placement="top"
					>
						<i class="hg-icons hg-icon-tooltip-question" />
					</el-tooltip>
				</div>
			</template>
			<select-custom
				ref="offline_time_select_ref"
				v-model="form.offline_time"
				class="card-vanish-time-select"
				:options="offline_time_options"
				:default-minutes="20"
				:disabled="!is_edit"
				@change="changeSelectCustom('offline_time_error', $event)"
			/>
			<div
				v-show="custom_error['offline_time_error']"
				class="card-vanish-time-error"
			>
				仅支持输入0-604800的数字
			</div>
		</el-form-item>
		<el-form-item>
			<template #label>
				<div class="card-vanish-time-label">
					<span class="is-required">*</span>
					<label class="card-label">标签卡离线后在地图上消失时间</label>
					<el-tooltip
						effect="dark"
						popper-class="card-vanish-time-tooltip"
						content="标签卡离线后，超过此时间，变为消失状态，并且页面图标不再显示"
						placement="top"
					>
						<i class="hg-icons hg-icon-tooltip-question" />
					</el-tooltip>
				</div>
			</template>
			<select-custom
				ref="disappear_select_ref"
				v-model="form.disappear_time"
				class="card-vanish-time-select"
				:options="card_vanish_time_option"
				:default-minutes="200"
				:disabled="!is_edit"
				@change="changeSelectCustom('card_vanish_time_error', $event)"
			/>
			<div
				v-show="custom_error['card_vanish_time_error']"
				class="card-vanish-time-error"
			>
				仅支持输入0-604800的数字
			</div>
		</el-form-item>
		<el-form-item>
			<template #label>
				<div class="card-vanish-time-label">
					<span class="is-required">*</span>
					<label class="card-label">区域进出判断时间(UWB定位)</label>
					<el-tooltip
						effect="dark"
						popper-class="card-vanish-time-tooltip"
						content="此设置结合“区域进出生效坐标点个数”共同判定是否进出区域"
						placement="top"
					>
						<i class="hg-icons hg-icon-tooltip-question" />
					</el-tooltip>
				</div>
			</template>
			<select-custom
				ref="detection_time_select_ref"
				v-model="form.uwb_area_entry_exit_detection_time"
				class="card-vanish-time-select"
				:options="offline_time_options"
				:default-minutes="20"
				:disabled="!is_edit"
				@change="changeSelectCustom('detection_time_error', $event)"
			/>
			<div
				v-show="custom_error['detection_time_error']"
				class="card-vanish-time-error"
			>
				仅支持输入0-604800的数字
			</div>
		</el-form-item>
		<el-form-item>
			<template #label>
				<div class="card-vanish-time-label">
					<span class="is-required">*</span>
					<label class="card-label">区域进出生效定位点数(UWB定位)</label>
					<el-tooltip
						effect="dark"
						popper-class="card-vanish-time-tooltip"
						content="当在“区域进出判断时间设置值”内：若定位点在“区域内”的个数超过本设置值，则判定为进入此区域；若定位点在“区域外”内个数超过本设置值，则判定为离开此区域。"
						placement="top"
					>
						<i class="hg-icons hg-icon-tooltip-question" />
					</el-tooltip>
				</div>
			</template>
			<select-custom
				ref="effective_points_select_ref"
				v-model="form.uwb_area_entry_exit_effective_points"
				class="card-vanish-time-select"
				:options="location_points_options"
				unit="个"
				:default-minutes="3"
				:disabled="!is_edit"
				@change="changeSelectCustom('effective_points_error', $event)"
			/>
			<div
				v-show="custom_error['effective_points_error']"
				class="card-vanish-time-error"
			>
				仅支持输入0-604800的数字
			</div>
		</el-form-item>
		<el-form-item>
			<template #label>
				<div class="card-vanish-time-label">
					<span class="is-required">*</span>
					<label class="card-label">区域进出判断时间(蓝牙定位)</label>
					<el-tooltip
						effect="dark"
						popper-class="card-vanish-time-tooltip"
						content="此设置结合“区域进出生效坐标点个数”共同判定是否进出区域"
						placement="top"
					>
						<i class="hg-icons hg-icon-tooltip-question" />
					</el-tooltip>
				</div>
			</template>
			<select-custom
				ref="bluetooth_detection_time_select_ref"
				v-model="form.bluetooth_area_entry_exit_detection_time"
				class="card-vanish-time-select"
				:options="offline_time_options"
				:default-minutes="20"
				:disabled="!is_edit"
				@change="changeSelectCustom('bluetooth_detection_time_error', $event)"
			/>
			<div
				v-show="custom_error['bluetooth_detection_time_error']"
				class="card-vanish-time-error"
			>
				仅支持输入0-604800的数字
			</div>
		</el-form-item>
		<el-form-item>
			<template #label>
				<div class="card-vanish-time-label">
					<span class="is-required">*</span>
					<label class="card-label">区域进出生效定位点数(蓝牙定位)</label>
					<el-tooltip
						effect="dark"
						popper-class="card-vanish-time-tooltip"
						content="当在“区域进出判断时间设置值”内：若定位点在“区域内”的个数超过本设置值，则判定为进入此区域；若定位点在“区域外”内个数超过本设置值，则判定为离开此区域。"
						placement="top"
					>
						<i class="hg-icons hg-icon-tooltip-question" />
					</el-tooltip>
				</div>
			</template>
			<select-custom
				ref="bluetooth_effective_points_select_ref"
				v-model="form.bluetooth_area_entry_exit_effective_points"
				class="card-vanish-time-select"
				:options="location_points_options"
				unit="个"
				:default-minutes="3"
				:disabled="!is_edit"
				@change="changeSelectCustom('bluetooth_effective_points_error', $event)"
			/>
			<div
				v-show="custom_error['bluetooth_effective_points_error']"
				class="card-vanish-time-error"
			>
				仅支持输入0-604800的数字
			</div>
		</el-form-item>
	</el-form>
	<div
		slot="footer"
		class="dialog-footer"
	>
		<el-button
			v-show="!is_edit && handle_auth"
			plain
			type="primary"
			size="small"
			@click="changeEditMode"
		>
			编辑
		</el-button>
		<el-button
			v-show="is_edit && form.id"
			plain
			size="small"
			@click="cancelEdit"
		>
			取消
		</el-button>
		<el-button
			v-show="is_edit"
			v-prevent-repeat-click
			size="small"
			type="primary"
			@click="saveEdit"
		>
			保存
		</el-button>
	</div>
</base-dialog>
</template>

<script setup lang="ts">
import {Notification} from "element-ui";
import {ref, computed, watch} from "vue";
import {useAuthStore} from "@/store/index";
import BaseDialog from "@/components/Dialog/BaseDialog.vue";
import SelectCustom from "./SelectCustom.vue";
import {queryDetail, addAreaTemplate, updateAreaTemplate, checkTemplateName} from "@/api/area/areaTemplate";
import {checkUrlRule} from "@/utils/ts/formRule";
import FkColorPicker from "../ForThink/FkColorPicker.vue";

type Props = {
	visible:boolean,
	templateId?:number
}
const props = withDefaults(defineProps<Props>(), {
	visible: false,
	templateId: 0
});
const dialog_visible = computed({
	get() {
		return props.visible;
	},
	set() {
		emits("update:visible", false);
	}
});
const auth_store = useAuthStore();

const handle_auth = computed(() => auth_store["/systemManage#/systemConfig"] === 2 || auth_store["/systemManage#/systemConfig"] === 4);

const form_ref = ref();
const is_edit = ref(false);

const isNumber = (rule:any, value:any, callback:any) => {
	if (!value) {
		callback();
	} else {
		const reg = /^-?\d{1,16}(?:\.\d{1,2})?$/;
		if (reg.test(value) && value <= 10000 && value >= -10000) {
			callback();
		} else {
			callback(new Error("请输入-10000 ~ 10000数值"));
		}
	}
};
const checkHeight = (rule:any, value:any, callback:any) => {
	if (value * 1 <= form.value.relative_start * 1) {
		callback(new Error("终止高度必须大于起始高度"));
	} else {
		callback();
	}
};
const isEmpty = (rule:any, value:any, callback:any) => {
	if (value.toString().charAt(0) === " " || value.toString().charAt(value.length - 1) === " ") {
		callback(new Error("请输入有效值"));
	} else {
		callback();
	}
};
const checkNameRule = (rule:any, value:any, callback:any) => {
	checkUrlRule(checkTemplateName, {id: form.value.id, name: value}, callback);
};

const rules = {
	name: [
		{required: true, message: "请输入名称", trigger: "blur"},
		{validator: checkNameRule, trigger: "change"},
		{validator: isEmpty, trigger: "blur"},
	],
	area_style: [
		{required: true, message: "请选择区域颜色", trigger: "blur"}
	],
	relative_start: [
		{required: true, message: "请输入起始高度", trigger: "blur"},
		{validator: isNumber, trigger: "blur"}
	],
	relative_end: [
		{required: true, message: "请输入终止高度", trigger: "blur"},
		{validator: isNumber, trigger: "blur"},
		{validator: checkHeight, trigger: "blur"}
	],
};
const offline_time_options = [
	{label: "跟随系统", value: 0},
	{label: "5", value: 5},
	{label: "10", value: 10},
];
const card_vanish_time_option = [
	{label: "跟随系统", value: 0},
	{label: "30", value: 30},
	{label: "60", value: 60},
	{label: "120", value: 120},
];
const location_points_options = [
	{label: "跟随系统", value: 0},
	{label: "1", value: 1},
	{label: "2", value: 2},
];
const custom_error = ref({
	offline_time_error: false,
	detection_time_error: false,
	effective_points_error: false,
	bluetooth_detection_time_error: false,
	bluetooth_effective_points_error: false,
	card_vanish_time_error: false
});

const getDefaultForm = () => {
	return {
		name: "",
		area_style: "rgba(0, 50, 250, 0.43)",
		relative_start: "0",
		relative_end: "4",
		offline_time: 0,
		disappear_time: 0,
		uwb_area_entry_exit_detection_time: 0,
		uwb_area_entry_exit_effective_points: 0,
		bluetooth_area_entry_exit_detection_time: 0,
		bluetooth_area_entry_exit_effective_points: 0
	};
};

const form = ref<{[key:string]:any}>(getDefaultForm());
const edit_form = ref<{[key:string]:any}>({});

const changeSelectCustom = (type:string, value:string) => {
	custom_error.value[type] = checkTimeLimit(value);
};

const checkTimeLimit = (value:string) => {
	return parseInt(value) > 604800;
};

const changeEditMode = () => {
	is_edit.value = !is_edit.value;
};

const cancelEdit = () => {
	form.value = {...edit_form.value};
	changeEditMode();
};

const saveEdit = () => {
	form_ref.value?.validate(async (valid) => {
		if (valid && !Object.values(custom_error.value).find(i => i)) {
			if (form.value.id) {
				const res = await updateAreaTemplate(form.value);
				if (res.data.type === 1) {
					Notification({
						type: "success",
						title: "成功",
						message: res.data.result
					});
					changeEditMode();
				} else {
					Notification({
						type: "error",
						title: "错误",
						message: res.data.result
					});
				}
			} else {
				form.value.id = undefined;
				const res = await addAreaTemplate(form.value);
				if (res.data.type === 1) {
					Notification({
						type: "success",
						title: "成功",
						message: "新增成功"
					});
					form.value.id = res.data.result;
					edit_form.value = {...form.value};
					changeEditMode();
				} else {
					Notification({
						type: "error",
						title: "错误",
						message: res.data.result
					});
				}
			}
		}
	});
};

const closeDialog = () => {
	emits("get-area-template");
};

const emits = defineEmits(["update:visible", "get-area-template"]);

watch(() => props.visible, async (val) => {
	if (val) {
		is_edit.value = props.templateId ? false : true;
		if (!props.templateId) {
			form.value = getDefaultForm();
		} else {
			const res = await queryDetail({id: props.templateId});
			if (res.data.type === 1) {
				const {result} = res.data;
				form.value = result;
				edit_form.value = {...result};
			}
		}
	}
});

</script>

<style lang="scss" scoped>
:deep(.content-body) {
	padding: 16px 16px 0 16px !important;
}
.template-form {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	grid-column-gap: 16px;
	.el-form-item {

		&.el-form-item--small {
			margin-bottom: 20px;
		}

		:deep(.el-form-item__label) {
			line-height: 14px;
			padding-bottom: 8px;
			color: #748ba4;

			.card-vanish-time-label .is-required {
				color: #F56C6C;
				margin-right: 4px;
				display: inline-block;
			}

			.card-vanish-time-label .card-label {
				margin-right: 6px;
			}

			.card-vanish-time-label .hg-icons {
				font-size: 14px;
				color: #A2B2C2;
			}

		}

		:deep(.el-form-item__content) {
			line-height: 0;
			.card-vanish-time-error {
				font-size: 12px;
				padding: 6px 0;
				color: #F56C6C;
			}
		}
	}
}

</style>

