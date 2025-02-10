<template>
<el-dialog
	:visible.sync="is_show"
	:title="$t('common.change_password_form.header')"
	:with-header="false"
	:close-on-click-modal="false"
	:before-close="handleClose"
	width="436px"
>
	<el-form
		ref="password-form"
		:model="form_data"
		class="fk-dialog-form"
		:rules="rules"
		size="medium"
		status-icon
	>
		<el-form-item
			prop="password"
			label="原密码"
		>
			<el-input
				v-model="form_data.password"
				type="password"
				:placeholder="$t('common.change_password_form.placeholder.password')"
				show-password
				clearable
			/>
		</el-form-item>
		<el-form-item
			prop="new_password"
			label="新密码"
		>
			<el-input
				v-model="form_data.new_password"
				type="password"
				:placeholder="$t('common.change_password_form.placeholder.new_password')"
				show-password
				clearable
			/>
		</el-form-item>
		<el-form-item
			prop="confirm"
			label="再次输入新密码"
		>
			<el-input
				v-model="form_data.confirm"
				type="password"
				:placeholder="$t('common.change_password_form.placeholder.confirm_new_password')"
				show-password
				clearable
			/>
		</el-form-item>
	</el-form>

	<div slot="footer">
		<el-button
			size="small"
			plain
			@click="clickQuitChangePassword"
		>
			{{ $t("common.change_password_form.btn.quit") }}
		</el-button>
		<el-button
			type="primary"
			size="small"
			:loading="is_loading"
			@click="clickSavePassword"
		>
			{{ $t("common.change_password_form.btn.save") }}
		</el-button>
	</div>
</el-dialog>
</template>

<script>
import {changePassword} from "@/api/admin/user";
import md5 from "crypto-js/md5";
import "@/utils/css/dialog.css";
import {validatePassword} from "@/views/index/utils/utils";

export default {
	name: "FormChangePassword",
	props: {
		isShow: {
			type: Boolean,
			required: true
		}
	},
	data() {
		const checkPassword = (rule, value, callback) => {
			if (value === "" || value === undefined) {
				callback(new Error("新密码不能为空"));
			} else {
				const pwd_level = validatePassword(value);
				if (pwd_level > 1) {
					if (this.form_data.confirm !== "") {
						this.$refs["password-form"].validateField("confirm");
					}
					callback();
				} else {
					callback(new Error("密码应至少包含数字、字母或特殊字符"));
				}
			}
		};
		const validateConfirm = (rule, value, callback) => {
			if (value === "" || value === undefined) {
				callback(new Error("确认密码不能为空"));
			} else if (value !== this.form_data.new_password) {
				callback(new Error("两次密码不一致"));
			} else {
				callback();
			}
		};
		return {
			is_show: false,
			form_data: {
				password: "",
				new_password: "",
				confirm: ""
			},
			is_loading: false,
			rules: {
				password: [
					{
						required: true,
						message: this.$t("common.change_password_form.validate_error.password_is_empty"),
						trigger: "blur"
					},
				],
				new_password: [
					{
						required: true,
						message: "新密码不能为空",
						trigger: "blur"
					},
					{
						min: 8,
						max: 16,
						message: "密码长度应为8-16位",
						trigger: "blur"
					},
					{
						validator: checkPassword,
						trigger: "blur"
					}
				],
				confirm: [
					{
						required: true,
						message: "确认密码不能为空",
						trigger: "blur"
					},
					{
						validator: validateConfirm,
						trigger: "blur"
					}
				]
			}
		};
	},
	watch: {
		isShow(value) {
			this.is_show = value;
		},
		is_show(value) {
			this.$emit("update:isShow", value);
		}
	},
	methods: {
		clickSavePassword() {
			this.$refs["password-form"].validate((valid) => {
				if (valid) {
					this.is_loading = true;
					const data = {
						old_password: md5(this.form_data.password).toString(),
						new_password: md5(this.form_data.new_password).toString(),
						again_password: md5(this.form_data.confirm).toString(),
					};

					changePassword(data).then(response => {
						const {type, result} = response.data;
						if (type === 1) {
							this.$notify.success({
								title: this.$t("common.notify.title.success"),
								message: result
							});
							this.$emit("quit-change-password");
						} else {
							this.$notify.error({
								title: this.$t("common.notify.title.error"),
								message: result
							});
						}
						this.is_loading = false;
					});
					this.clearValidate();
				}
			});
		},

		clearValidate() {
			this.form_data = {
				password: "",
				new_password: "",
				confirm: ""
			};
			this.$refs["password-form"].resetFields();
		},

		handleClose() {
			this.clickQuitChangePassword();
		},

		clickQuitChangePassword() {
			this.$emit("quit-change-password");
			this.clearValidate();
		}
	}
};
</script>

<style scoped>
.el-dialog__wrapper .el-dialog__body {
	color: red;
}
</style>
