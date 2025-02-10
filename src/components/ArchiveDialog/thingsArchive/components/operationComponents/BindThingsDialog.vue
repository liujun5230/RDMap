<template>
<el-dialog
	:visible.sync="is_show_dialog"
	title="绑定对象"
	width="436px"
	append-to-body
	:close-on-click-modal="false"
	@close="closeDialog"
>
	<el-form
		ref="bind_things_form_ref"
		class="bind-things-form"
		label-position="top"
		size="small"
		:rules="rules"
		:model="form_data"
		@submit.native.prevent
	>
		<el-form-item prop="name">
			<template #label>
				<fk-label
					ref="fk_label_ref"
					v-model="selected_key"
					:options="label_options"
				/>
			</template>
			<el-input
				v-model="form_data.name"
				size="middle"
				placeholder="请输入搜索内容"
				@input="searchTag"
			>
				<i
					slot="prefix"
					class="el-input__icon el-icon-search"
				/>
			</el-input>
		</el-form-item>
	</el-form>
	<div
		v-show="search_things_result.length"
		class="search-things-result"
	>
		<p
			v-for="item in search_things_result"
			:key="item.uuid"
			:class="{'is-bind-card':item.is_bind}"
			@click="selectSearchItem(item)"
		>
			<text-ellipsis class="custom-ellipsis">
				<span>{{ item.name_str }}</span>
				<template #tooltip>
					<span>{{ item.name_str }}</span>
				</template>
			</text-ellipsis>

			<span :class="{'no-bind-card-text':!item.is_bind}">{{ item.is_bind_str }}</span>
		</p>
	</div>
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
			@click="saveBindThings"
		>
			保存
		</el-button>
	</span>
</el-dialog>
</template>
<script setup>
import {ref, watch, computed} from "vue";
import {Notification} from "element-ui";
import FkLabel from "@/components/ForThink/FkLabel.vue";
import {getBindObject} from "@/api/archives/archives";
import {useStore} from "@/store/index";
import TextEllipsis from "@/components/TextEllipsis.vue";

const rules = {
	name: [
		{
			required: true,
			message: "请输入搜索内容",
			whitespace: true,
			trigger: "change"
		},
	],
};

const feature_flags = computed(() => useStore().getters.flags);
const label_options = computed(() => {
	const options = [
		{label: "员工姓名", value: "1"},
	];
	if (feature_flags.value.displayVisitor) options.push({label: "访客姓名", value: "3"});
	if (feature_flags.value.displayContractor) options.push({label: "承包商姓名", value: "6"});
	if (feature_flags.value.car) options.push({label: "车牌号", value: "2"});
	if (feature_flags.value.displayMaterial) options.push({label: "物资编号", value: "5"});
	return options;
});

let search_timer;

const is_show_dialog = ref(false);
const bind_things_form_ref = ref();
const selected_key = ref("");
const fk_label_ref = ref();
const form_data = ref({name: ""});
const form_uuid = ref("");
const search_things_result = ref([]);

const showDialog = () => {
	form_data.value.name = "";
	fk_label_ref.value?.setValue("1");
	search_things_result.value = [];
	is_show_dialog.value = true;
};

const closeDialog = () => {
	bind_things_form_ref?.value.resetFields();
};

const getTagInfo = async (value) => {
	if (value === "") {
		search_things_result.value = [];
		return;
	}
	const param = {
		type: selected_key.value,
		name: value
	};
	const res = await getBindObject(param);
	const {type, result} = res.data;
	if (type === 1) {
		search_things_result.value = result.map(item => {
			let name, name_str;
			if (selected_key.value === "2") {
				name_str = item.licence;
				name = item.licence;
			} else if (selected_key.value === "5") {
				name_str = item.serial_num;
				name = item.serial_num;
			} else {
				name_str = `${item.name}-${item.id_code}`;
				name = item.name;
			}
			return {
				name_str,
				name,
				is_bind: item.is_bind,
				is_bind_str: item.is_bind ? "( 已绑卡 )" : "( 未绑卡 )",
				uuid: item.uuid
			};
		});
	}
};

const searchTag = (value) => {
	if (search_timer) {
		clearTimeout(search_timer);
	}
	search_timer = setTimeout(() => {
		form_uuid.value = "";
		getTagInfo(value);
		clearTimeout(search_timer);
		search_timer = undefined;
	}, 300);
};

const selectSearchItem = (info) => {
	if (info.is_bind) return;
	form_data.value.name = info.name;
	form_uuid.value = info.uuid;
	search_things_result.value = [];
};

const saveBindThings = () => {
	if (!form_uuid.value) {
		Notification({
			type: "error",
			title: "错误",
			message: "请选择未绑卡的对象"
		});
		return;
	}
	emits("save-bind-things", form_uuid.value, selected_key.value);
	is_show_dialog.value = false;
};

watch(() => selected_key.value, (val) => {
	if (val) {
		searchTag(form_data.value.name);
	}
});
const emits = defineEmits(["save-bind-things"]);
defineExpose({showDialog});
</script>

<style scoped lang="scss">
.el-dialog__wrapper {
	display: flex;
	justify-content: center;
	align-items: center;
}

.bind-things-form{
	height: 82px;
	.el-form-item {
		margin-bottom: 4px !important;
	}
}

.search-things-result {
	position:absolute;
	width: 404px;
	margin-top: -20px;
	border-radius: 4px;
    background: #FFF;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.12);
	max-height: 236px;
    overflow-y: auto;
	p {
		display: flex;
		justify-content: space-between;
		margin: 0;
		line-height: 38px;
		padding: 0 16px;
		color: #a2b2c2;
		cursor: default;
		.no-bind-card-text {
			color:#62BF33;
		}
	}
	p:hover {
		background-color: #E2EEFB;
		color: #748BA4;
	}

	.is-bind-card {
		color:#D1D8E1;
		cursor: not-allowed;
	}
	.is-bind-card:hover {
		background-color: #fff;
		color:#D1D8E1;
	}
}

.custom-ellipsis {
	max-width: 250px;
	vertical-align: bottom;
}

:deep( .el-form-item__label) {
	line-height: 14px !important;
	padding: 0 0 8px !important;
}

:deep(.el-input-red) .el-input__inner {
	border-color: #F56C6C;
	margin-bottom: 20px;
}

</style>
