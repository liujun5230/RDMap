<template>
<div
	ref="main_content_ref"
	class="main-content"
>
	<el-form
		ref="device_form_ref"
		size="small"
		label-position="top"
		:rules="rules"
		:model="edit_device_panel"
	>
		<div class="base-info">
			<el-form-item
				label="设备id"
				prop="device_no"
			>
				<el-input
					v-model="edit_device_panel.device_no"
					:class="{'smart-id-input':device_type === 6}"
					:disabled="[2,3,8,5].includes(device_type) || edit_device_panel.can_not_edit"
				/>
			</el-form-item>
			<el-form-item
				v-if="device_type === 5"
				label="SN"
				prop="sn"
			>
				<el-input
					v-model="edit_device_panel.sn"
					disabled
				/>
			</el-form-item>
			<el-form-item
				v-else
				label="设备名称"
				prop="name"
			>
				<el-input
					v-model="edit_device_panel.name"
					:disabled="edit_device_panel.can_not_edit || [2,3,8].includes(device_type)"
				/>
			</el-form-item>
		</div>
		<div
			v-if="device_type === 5"
			class="base-info"
		>
			<el-form-item
				label="设备名称"
				prop="name"
			>
				<el-input
					v-model="edit_device_panel.name"
					:disabled="edit_device_panel.can_not_edit"
				/>
			</el-form-item>
			<el-form-item
				label="基站类型更新方式"
				prop="base_type_status"
			>
				<el-select
					v-model="edit_device_panel.base_type_status"
					:disabled="edit_device_panel.can_not_edit"
					placeholder="请选择"
				>
					<el-option
						label="跟随系统判定"
						:value="0"
					/>
					<el-option
						label="自定义"
						:value="1"
					/>
				</el-select>
			</el-form-item>
			<el-form-item
				label="基站类型"
				prop="device_bs_type"
			>
				<el-select
					v-model="edit_device_panel.device_bs_type"
					:disabled="edit_device_panel.base_type_status === 0 || edit_device_panel.can_not_edit"
					placeholder="请选择"
				>
					<el-option
						v-for="item in device_bs_type_options"
						:key="item.id"
						:label="item.name"
						:value="item.id"
					/>
				</el-select>
			</el-form-item>
			<el-form-item
				label="供电电源名称"
			>
				<el-select
					v-model="edit_device_panel.power"
					:disabled="edit_device_panel.can_not_edit"
					clearable
					placeholder="请选择"
				>
					<el-option
						v-for="item in power_options"
						:key="item.value"
						:label="item.label"
						:value="item.value"
					/>
				</el-select>
			</el-form-item>
			<el-form-item
				label="供电电源ID"
			>
				<el-input
					v-model="edit_device_panel.power"
					disabled
				/>
			</el-form-item>
			<el-form-item
				label="备注"
				prop="comment"
			>
				<el-input
					v-model="edit_device_panel.comment"
					:disabled="edit_device_panel.can_not_edit"
				/>
			</el-form-item>
		</div>
		<div
			v-if="[2, 3, 8].includes(device_type)"
			class="base-info"
		>
			<el-form-item
				label="设备类型"
				prop="power_type"
			>
				<el-select
					v-model="edit_device_panel.power_type"
					disabled
					placeholder="请选择"
				>
					<el-option
						label="浇封电源"
						:value="2"
					/>
					<el-option
						label="隔爆电源"
						:value="3"
					/>
				</el-select>
			</el-form-item>
			<el-form-item
				label="通信基站ID"
				prop="bs_id"
			>
				<el-input
					v-model="edit_device_panel.bs_id"
					disabled
				/>
			</el-form-item>
			<el-form-item
				label="通信基站端口"
				prop="port"
			>
				<el-select
					v-model="edit_device_panel.port"
					disabled
					placeholder="请选择"
				>
					<el-option
						label="端口1"
						value="1"
					/>
					<el-option
						label="端口2"
						value="2"
					/>
					<el-option
						label="端口3"
						value="3"
					/>
					<el-option
						label="端口4"
						value="4"
					/>
				</el-select>
			</el-form-item>
			<el-form-item
				label="低电量告警阈值(%)"
				prop="power_threshold"
			>
				<el-input
					v-model="edit_device_panel.power_threshold"
					:disabled="edit_device_panel.can_not_edit"
				/>
			</el-form-item>
		</div>
		<div
			v-if="[4, 6].includes(device_type)"
			class="base-info"
		>
			<el-form-item
				label="IP"
				prop="ip"
			>
				<el-input
					v-model="edit_device_panel.ip"
					:disabled="edit_device_panel.can_not_edit"
				/>
			</el-form-item>
		</div>
	</el-form>
	<div
		v-if="!device_is_del && btn_handle_auth"
		class="handle-btn"
		:class="{'handle-btn-panel':isScrolling || !arrivedState.top}"
	>
		<el-button
			v-show="edit_device_panel.can_not_edit"
			plain
			type="primary"
			@click="startEditDevice"
		>
			编辑
		</el-button>
		<el-button
			v-show="!edit_device_panel.can_not_edit && edit_device_panel.edit_id"
			plain
			@click="cancelEdit"
		>
			取消
		</el-button>
		<el-button
			v-show="!edit_device_panel.can_not_edit"
			v-preventRepeatClick
			type="primary"
			@click="saveDevice"
		>
			保存
		</el-button>
	</div>
</div>
</template>
<script setup>
import {Notification} from "element-ui";
import {ref, inject, watch} from "vue";
import {addDevice, updateDevice, getPowerSupply, checkName} from "@/api/deviceManage/info";
import {checkNameDeny} from "@/api/area/area";
import {getBaseType} from "@/api/deviceManage/type";
import {useScroll, useEventBus} from "@vueuse/core";

const archive_device_info = inject("DEVICE_INFO");
const archive_device_type = inject("DEVICE_TYPE");
const btn_handle_auth = inject("BTN_HANDLE_AUTH");
const archive_device_uuid = inject("ARCHIVE_DEVICE_UUID");
const dialog_key = inject("DIALOG_KEY");

const main_content_ref = ref();
const {isScrolling, arrivedState} = useScroll(main_content_ref);
const device_type = ref(5);
const device_form_ref = ref();
const bs_info = ref({});
const device_is_del = ref(0);
const default_type_id = ref(0);
const all_power_data = ref({});

const getAllUsePower = () => {
	const options = ref([]);
	all_power_data.value = {};
	getPowerSupply().then((res) => {
		if (res.data.type === 1) {
			options.value = res.data.result.map(({power_code, id, name, type}) => {
				all_power_data.value[power_code] = id;
				return {
					label: `${name}(${parseInt(type) === 2 ? "浇封电源" : "隔爆电源"})`,
					value: power_code
				};
			});
		} else {
			Notification.error({
				title: "错误",
				message: res.data.result || "接口错误"
			});
		}
	}).catch(() => undefined);
	return options;
};

const getAllBaseType = () => {
	const options = ref([]);
	getBaseType().then((res) => {
		if (res.data.type === 1) {
			options.value = res.data.result.data;
		} else {
			Notification.error({
				title: "错误",
				message: res.data.result || "接口错误"
			});
		}
	}).catch(() => undefined);
	return options;
};

const power_options = getAllUsePower();

const device_bs_type_options = getAllBaseType();

const checkPowerThresholdMax = (rule, value, callback) => {
	const reg_num = /^[0-9]+$/;
	if (!reg_num.test(value) || parseFloat(value) > 100) return callback(new Error("限制范围0-100，请重新输入"));
	return callback();
};

const validateIp = (rule, value, callback) => {
	const reg = /^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/;
	if (!reg.test(value)) {
		return callback(new Error("IP格式错误"));
	}
	callback();
};

const checkValidName = (rule, value, callback) => {
	if (archive_device_type.value !== 5) return callback();
	checkRepeatFn({name: value}, callback);
};

const checkDeviceNo = (rule, value, callback) => {
	checkRepeatFn({device_no: archive_device_type.value === 6 ? addHexStart(value) : value}, callback);
};

const checkRepeatFn = (param, callback) => {
	const check_data = {
		device_uuid: archive_device_uuid.value,
		type: archive_device_type.value,
		...param
	};
	checkName(check_data).then(res => {
		if (res.data.type === 1) {
			res.data.result.check ? callback() : callback(new Error(res.data.result.msg));
		} else {
			callback(new Error(res.data.result));
		}
	});
};

const checkValidComment = (rule, value, callback) => {
	checkNameDeny({name: value}).then(res => {
		if (res.data.type === 1) {
			res.data.result.check ? callback() : callback(new Error(res.data.result.msg));
		} else {
			callback(new Error(res.data.result));
		}
	});
};
const checkSmartId = (rule, value, callback) => {
	const reg = /^[0-9a-fA-F]+$/;
	const reg2 = /^[0-9a-zA-Z]+$/;
	if (String(value).length > 10 && [4, 6].includes(device_type.value)) {
		return callback(new Error("设备id限制长度：1-10，请重新输入"));
	}
	if (!reg.test(value) && device_type.value === 6) {
		return callback(new Error("设备ID不符合16进制格式"));
	}
	if (!reg2.test(value) && device_type.value === 4) {
		return callback(new Error("输入仅允许数字和字母"));
	}
	return callback();
};

const rules = {
	device_no: [
		{required: true, message: "请输入设备id", trigger: "blur"},
		{max: 20, message: "设备id限制长度：1-20，请重新输入", trigger: "blur"},
		{validator: checkSmartId, trigger: "blur"},
		{validator: checkDeviceNo, trigger: "blur"}
	],
	name: [
		{required: true, message: "请输入设备名称", trigger: "blur"},
		{max: 20, message: "设备名称限制长度：1-20，请重新输入", trigger: "blur"},
		{validator: checkValidName, trigger: "blur"}
	],
	device_bs_type: [
		{required: true, message: "请输入设备类型", trigger: "blur"}
	],
	base_type_status: [
		{required: true, message: "请输入基站类型更新方式", trigger: "change"}
	],
	sn: [
		{required: true, message: "请输入sn", trigger: "blur"}
	],
	comment: [
		{required: true, message: "请输入备注", trigger: "blur"},
		{max: 50, message: "备注限制长度：1-50，请重新输入", trigger: "blur"},
		{validator: checkValidComment, trigger: "blur"}
	],
	power_type: [
		{required: true, message: "请输入设备类型", trigger: "blur"}
	],
	bs_id: [
		{required: true, message: "请输入通信基站ID", trigger: "blur"}
	],
	port: [
		{required: true, message: "请选择端口", trigger: "blur"}
	],
	power_threshold: [
		{required: true, message: "请输入低电量告警阈值", trigger: "blur"},
		{validator: checkPowerThresholdMax, trigger: "blur"}
	],
	ip: [
		{required: true, message: "请输入ip地址", trigger: "blur"},
		{validator: validateIp, trigger: "blur"}
	],
};

const getDefaultFormData = () => {
	return {
		can_not_edit: false,
		edit_id: null,
		name: "",
		device_no: "",
		device_bs_type: 1,
		power: "",
		sn: "",
		comment: "",
		base_type_status: 0,

		power_type: 2,
		bs_id: "",
		port: "",
		power_threshold: 10,

		ip: ""
	};
};

const edit_device_panel = ref(getDefaultFormData());

const clickAddDevice = () => {
	edit_device_panel.value = getDefaultFormData();
};

const editDevice = (data) => {
	edit_device_panel.value.edit_id = data.device_uuid;
	edit_device_panel.value.can_not_edit = true;
	edit_device_panel.value.device_no = device_type.value === 6 ? data.device_no?.slice(2) : data.device_no;
	edit_device_panel.value.name = data.name;
	if (device_type.value === 5) {
		edit_device_panel.value.power = data.power_code;
		edit_device_panel.value.comment = data.comment;
		edit_device_panel.value.device_bs_type = data.base_type;
		edit_device_panel.value.sn = data.sn;
		edit_device_panel.value.base_type_status = data.base_type_status;
		default_type_id.value = data.default_type_id;
		bs_info.value = data.info;
	}
	if ([2, 3, 8].includes(device_type.value)) {
		edit_device_panel.value.bs_id = data.info.bs_addr;
		edit_device_panel.value.port = data.info.bs_port;
		edit_device_panel.value.power_type = Number(data.type);
		edit_device_panel.value.power_threshold = data.power_threshold;
	}

	if ([4, 6].includes(device_type.value)) {
		edit_device_panel.value.ip = data.info.ip;
	}
};

const startEditDevice = () => {
	edit_device_panel.value.can_not_edit = false;
};

const cancelEdit = () => {
	if (!edit_device_panel.value.edit_id) return;
	device_form_ref.value?.clearValidate();
	device_type.value = archive_device_info.value.type;
	editDevice(archive_device_info.value);
	edit_device_panel.value.can_not_edit = true;
};

const addHexStart = (hex) => {
	if (!(hex.startsWith("0x") || hex.startsWith("0X"))) {
		return "0x" + hex;
	}
	return hex;
};

const saveDevice = () => {
	device_form_ref.value?.validate(async (valid) => {
		if (valid) {
			const device_no = device_type.value === 6 ? addHexStart(edit_device_panel.value.device_no) : edit_device_panel.value.device_no;
			const base_param = device_type.value === 5 ? {
				comment: edit_device_panel.value.comment,
				power_id: all_power_data.value[edit_device_panel.value.power],
				base_type_status: edit_device_panel.value.base_type_status,
				base_type_id: edit_device_panel.value.device_bs_type
			} : {};
			const data = {
				type: [2, 3, 8].includes(device_type.value) ? edit_device_panel.value.power_type : device_type.value,
				device_no: device_no.trim(),
				name: edit_device_panel.value.name.trim(),
				power_threshold: [2, 3, 8].includes(device_type.value) ? edit_device_panel.value.power_threshold : undefined,
				...base_param,
				info: device_type.value === 5 ? bs_info.value : {
					ip: [4, 6].includes(device_type.value) ? edit_device_panel.value.ip : undefined,
					bs_addr: [2, 3, 8].includes(device_type.value) ? addHexStart(edit_device_panel.value.bs_id) : undefined,
					bs_port: [2, 3, 8].includes(device_type.value) ? edit_device_panel.value.port : undefined,
				}
			};
			if (edit_device_panel.value.edit_id) {
				data.device_uuid = edit_device_panel.value.edit_id;
				const {floor_id, x, y, relative_h} = archive_device_info.value;
				data.floor_id = floor_id;
				data.x = x;
				data.y = y;
				data.z = relative_h;
				const res = await updateDevice(data);
				if (res.data.type === 1) {
					Notification({
						type: "success",
						title: "成功",
						message: "修改成功"
					});
				} else {
					Notification({
						type: "error",
						title: "错误",
						message: res.data.result
					});
				}
				useEventBus("update_device_info_" + dialog_key).emit(data.device_uuid);
			} else {
				const res = await addDevice(data);
				if (res.data.type === 1) {
					Notification({
						type: "success",
						title: "成功",
						message: "新增成功"
					});
					useEventBus("update_device_info_" + dialog_key).emit(res.data.result);
				} else {
					Notification({
						type: "error",
						title: "错误",
						message: res.data.result
					});
				}
			}
		} else {
			console.log("验证失败");
		}
	});
};

watch(() => edit_device_panel.value.base_type_status, (value) => {
	if (!value && device_type.value === 5) {
		edit_device_panel.value.device_bs_type = default_type_id.value;
	}
});

watch(() => archive_device_uuid.value, (value) => {
	if (!value && !archive_device_info.value) {
		device_type.value = archive_device_type.value;
		clickAddDevice();
	}
}, {
	immediate: true
});

watch(() => archive_device_info.value, (value) => {
	if (value) {
		device_type.value = archive_device_info.value.type;
		device_is_del.value = archive_device_info.value.is_delete;
		editDevice(archive_device_info.value);
	}
}, {
	immediate: true
});

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

:deep( .el-form-item__label) {
	line-height: 14px !important;
	padding: 0 0 8px !important;
}
:deep(.el-form-item--mini.el-form-item),
.el-form-item--small.el-form-item {
	margin-bottom: 20px;
}

:deep(.el-select) {
	width: 100%;
}
.smart-id-input::before {
	content: "0x";
    position: absolute;
    top: 0;
    left: 15px;
	color: #a2b2c2;
}
.smart-id-input :deep(.el-input__inner){
	padding-left: 28px;
}

.smart-id-input.is-disabled::before{
	color: #d1d8e1;
}
</style>
