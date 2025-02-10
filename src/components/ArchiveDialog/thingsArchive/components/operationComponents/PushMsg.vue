<template>
<el-dialog
	:visible.sync="show_push_panel"
	title="消息下发"
	width="600px"
	append-to-body
	:close-on-click-modal="false"
	:before-close="closePushMsg"
>
	<el-form
		ref="form"
		:model="push_data"
		:rules="rules"
		size="small"
	>
		<el-form-item label="信息类型">
			<el-select
				v-model="push_data.type"
				class="type-select"
			>
				<el-option
					v-for="i in push_data.type_options"
					:key="i.value"
					:label="i.label"
					:value="i.value"
				/>
			</el-select>
		</el-form-item>
		<el-form-item
			label="信息内容"
			prop="content"
		>
			<el-input
				v-model="push_data.content"
				:rows="4"
				type="textarea"
				maxlength="28"
				show-word-limit
				placeholder="请输入下发信息内容"
			/>
		</el-form-item>
		<el-form-item>
			<el-checkbox v-model="push_data.timing">
				设置定时
			</el-checkbox>
			<fk-date-picker
				v-if="push_data.timing"
				v-model="push_data.time"
				:clearable="false"
				type="datetime"
				class="time_picker"
			/>
		</el-form-item>
		<el-form-item>
			<el-checkbox v-model="push_data.shake">
				震动
			</el-checkbox>
			<el-checkbox v-model="push_data.voice">
				声音
			</el-checkbox>
		</el-form-item>
	</el-form>
	<span
		slot="footer"
		class="dialog-footer"
	>
		<el-button
			plain
			size="small"
			@click="closePushMsg"
		>
			取消
		</el-button>
		<el-button
			type="primary"
			size="small"
			@click="savePushMsg"
		>
			确定
		</el-button>
	</span>
</el-dialog>
</template>

<script>
import {publishEink} from "@/api/eink/eink";
import FkDatePicker from "@/components/ForThink/Form/FkDatePicker.vue";

export default {
	name: "PushMsg",
	components: {FkDatePicker},
	data() {
		return {
			show_push_panel: false,
			push_data: {
				type_options: [
					{label: "信息", value: 0},
					{label: "告警", value: 1},
				],
				type: 0,
				content: "",
				timing: false,
				time: new Date(),
				voice: true,
				shake: true,
				card_id: 0
			},
			rules: {
				content: [{required: true, message: "内容不能为空"}],
			},
		};
	},
	methods: {
		openPushPanel(card_id) {
			this.show_push_panel = true;
			this.push_data.type = 0;
			this.push_data.content = "";
			this.push_data.timing = false;
			this.push_data.time = new Date();
			this.push_data.voice = true;
			this.push_data.shake = true;
			this.push_data.card_id = card_id;
		},

		savePushMsg() {
			this.$refs.form.validate((valid) => {
				if (valid) {
					let time;
					if (this.push_data.timing) {
						time = +(Date.parse(this.push_data.time) / 1000);
					}
					if (this.push_data.content.trim() === "") {
						this.$notify.error({
							title: "提示",
							message: "参数错误，请输入下发内容",
						});
						return;
					}
					const data = {
						message: this.push_data.content,
						voice: this.push_data.voice ? 1 : 0,
						shake: this.push_data.shake ? 1 : 0,
						type: this.push_data.type,
						card_id_list: [this.push_data.card_id],
						time,
					};
					publishEink(data).then(res => {
						if (res.data.type === 1) {
							this.$notify({
								title: "成功",
								type: "success",
								message: "下发成功",
							});
							this.show_push_panel = false;
						} else {
							this.$notify({
								title: "失败",
								type: "error",
								message: res.data.result,
							});
						}
					});
				}
			});
		},

		closePushMsg() {
			this.$refs.form.clearValidate();
			this.show_push_panel = false;
		}
	},
};
</script>

<style scoped>
.el-dialog__wrapper {
	display: flex;
	justify-content: center;
	align-items: center;
}

.type-select {
	width: 100%;
}

.time_picker {
	margin-left: 20px;
}
</style>
