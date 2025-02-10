<template>
<el-button
	v-bind="$attrs"
	:size="size"
	:type="type"
	:icon="icon"
	:circle="circle"
	:plain="plain"
	:disabled="disabled"
	class="fk-operation-icon"
	@click="clickFn($event)"
>
	<slot />
</el-button>
</template>

<script>
export default {
	name: "FkTableButton",
	props: {
		icon: {
			type: String,
			default() {
				return "";
			}
		},
		type: {
			type: String,
			default() {
				return "";
			}
		},
		size: {
			type: String,
			default() {
				return "";
			}
		},
		circle: {
			type: Boolean,
			default() {
				return false;
			}
		},
		plain: {
			type: Boolean,
			default() {
				return false;
			}
		},
		disabled: {
			type: Boolean,
			default() {
				return false;
			}
		}
	},
	methods: {
		clickFn(e) {
			if (e.target && e.target.parentNode) {
				e.target.blur();
				e.target.parentNode.blur();
			}
			this.$emit("click");
		}
	}
};
</script>

<style scoped>
.fk-operation-icon :deep(svg) {
	display: block;
	margin: 0 auto;
}
</style>
