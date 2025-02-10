<template>
<el-dialog
	:visible.sync="is_show_dialog"
	title="解绑"
	width="436px"
	append-to-body
	custom-class="unbind-dialog"
	:close-on-click-modal="false"
>
	<p class="unbind-content">
		<i
			class="el-icon-warning"
		/>
		<span>
			<span class="content-title">确定解绑？</span>
			<br>
			确定后，将对定位标签进行解绑
		</span>
	</p>
	<el-checkbox
		v-if="is_slave_card"
		v-model="is_unbind_truck"
		class="is-unbind-truck"
	>
		同步解绑所有副卡
	</el-checkbox>

	<span
		slot="footer"
	>
		<el-button
			plain
			size="small"
			@click="is_show_dialog = false"
		>
			取消
		</el-button>
		<el-button
			type="primary"
			size="small"
			@click="saveUnbindCard"
		>
			确定
		</el-button>
	</span>
</el-dialog>
</template>
<script setup>
import {ref} from "vue";
import {Notification} from "element-ui";
import {unbindCard} from "@/api/company/personSetting";
import {liftedTruck} from "@/api/truck/truck";
import {unBind} from "@/api/visitor/visitor";
import {unbindMaterial} from "@/api/material/material";
import {unBindContractorCard} from "@/api/contractor/Person";

const is_show_dialog = ref(false);
const is_unbind_truck = ref(false);
const uuid_param = ref(0);

const things_type = ref("");
const is_slave_card = ref(0);
const unbind_truck_card = ref(0);

const showDialog = (uuid, utype, is_slave, card_id) => {
	is_unbind_truck.value = false;
	uuid_param.value = uuid;
	things_type.value = utype;
	is_slave_card.value = is_slave;
	unbind_truck_card.value = card_id;
	is_show_dialog.value = true;
};

const saveUnbindCard = async () => {
	let res;
	if (things_type.value === "person") {
		res = await unbindCard({uuid: uuid_param.value});
	}
	if (things_type.value === "visitor") {
		res = await unBind({uuid: uuid_param.value});
	}
	if (things_type.value === "material") {
		res = await unbindMaterial({uuid: uuid_param.value});
	}
	if (things_type.value === "truck") {
		const delete_flag = is_unbind_truck.value ? 1 : 0;
		const card_id = unbind_truck_card.value || undefined;
		res = await liftedTruck({uuid: uuid_param.value, delete_flag, card_id});
	}

	if (things_type.value === "contractor") {
		res = await unBindContractorCard({uuid: uuid_param.value});
	}

	if (res.data.type === 1) {
		Notification({
			type: "success",
			title: "成功",
			message: "解绑成功"
		});
		if (things_type.value === "truck") {
			emits("save-unbind-card");
		} else {
			emits("save-unbind-card", true);
		}
		is_show_dialog.value = false;
	} else {
		Notification({
			type: "error",
			title: "错误",
			message: res.data.result
		});
	}
};

const emits = defineEmits(["save-unbind-card"]);
defineExpose({showDialog});

</script>

<style>
.unbind-dialog.el-dialog .el-dialog__body {
	padding-bottom: 18px !important;
}
</style>

<style scoped>
.el-dialog__wrapper {
	display: flex;
	justify-content: center;
	align-items: center;
}

p {
	font-size: 14px;
	color: #a2b2c2;
    margin: 0;
}

.unbind-content {
	display: flex;
}

.unbind-content span {
	line-height: 24px;
}

.unbind-content .content-title {
	font-weight: 700;
	color: #748ba4;
}

.el-icon-warning {
	color: #e6a23c;
	padding-right: 8px;
	font-size: 16px;
	line-height: 25px;
}

.is-unbind-truck {
	margin-left: 24px;
    margin-top: 10px;
    color: #a2b2c2;
}

</style>
