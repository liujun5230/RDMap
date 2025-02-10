<template>
<el-dropdown
	trigger="hover"
	placement="bottom-start"
	@visible-change="visibleChange"
>
	<el-button
		plain
		type="primary"
		class="btn_batch"
		size="small"
		style="width: 71px;"
	>
		打印
		<i :class="[show_dropdown_menu ? 'el-icon-arrow-up' : 'el-icon-arrow-down']" />
	</el-button>
	<el-dropdown-menu slot="dropdown">
		<el-dropdown-item
			v-for="(item,index) in printMenu"
			:key="index"
			@click.native="printClick(index)"
		>
			{{ item }}
		</el-dropdown-item>
	</el-dropdown-menu>
</el-dropdown>
</template>

<script>
export default {
	name: "FkPrintButton",
	props: {
		printMenu: {
			type: Array,
			default() {
				return [];
			}
		},
	},
	data() {
		return {
			show_dropdown_menu: false
		};
	},
	methods: {
		printClick(index) {
			this.show_dropdown_menu = false;
			this.$emit("handle-print", index);
		},

		visibleChange(isShow) {
			this.show_dropdown_menu = isShow;
		}
	}
};
</script>

<style scoped>
</style>
