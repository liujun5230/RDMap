<template>
<el-dropdown
	placement="bottom-start"
	trigger="hover"
	class="export-dropdown"
	@visible-change="visibleChange"
>
	<el-button
		plain
		type="primary"
		class="btn_batch el-dropdown-link"
		size="small"
		style="width: 71px;"
		@click="show_dropdown_menu = true"
	>
		导出
		<i :class="[show_dropdown_menu ? 'el-icon-arrow-up' : 'el-icon-arrow-down']" />
	</el-button>
	<el-dropdown-menu slot="dropdown">
		<el-dropdown-item
			v-for="(item,index) in exportMenu"
			:key="index"
			@click.native="exportClick(index)"
		>
			{{ item }}
		</el-dropdown-item>
	</el-dropdown-menu>
</el-dropdown>
</template>

<script>
export default {
	name: "FkExportButton",
	props: {
		exportMenu: {
			type: Array,
			default() {
				return [];
			}
		}
	},
	data() {
		return {
			show_dropdown_menu: false
		};
	},
	methods: {
		exportClick(index) {
			this.show_dropdown_menu = false;
			this.$emit("handle-export", index);
		},

		visibleChange(isShow) {
			this.show_dropdown_menu = isShow;
		}
	}
};
</script>

<style scoped>
.export-dropdown.el-dropdown {
	font-size: 12px;
}

</style>
