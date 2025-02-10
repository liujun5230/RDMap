<template>
<el-cascader
	ref="branch_cascader_ref"
	v-model="branch_id"
	:options="branch_select_data"
	:show-all-levels="false"
	:props="{ checkStrictly: true, expandTrigger:'hover' }"
	popper-class="branch-cascader"
	v-bind="$attrs"
	@visible-change="handleVisibleChange"
>
	<template slot-scope="{ node, data }">
		<el-tooltip
			:content="data.label"
			placement="top-end"
			:disabled="getSpanWidth(data) <= 228"
		>
			<div
				class="tooltip-item"
				@click="selectBrach(node, data)"
			>
				<span>
					{{ data.label }}
				</span>
			</div>
		</el-tooltip>
	</template>
</el-cascader>
</template>

<script>
import {getBranchList} from "@/api/company/branchSetting";
import {getTreeFromBranchData} from "@/utils/js/common";

export default {
	name: "BranchSelect",
	props: {
		showAll: {
			type: Boolean,
			default: true
		},
		branchId: {
			type: Array,
			default: () => []
		},
		reqQuery: {
			type: Object,
			default: () => ({})
		}
	},
	data() {
		return {
			branch_id: "all",
			branch_select_data: []
		};
	},
	watch: {
		branchId: {
			handler(val) {
				if (val.length) {
					this.branch_id = val[val.length - 1];
				} else {
					this.branch_id = "all";
				}
			},
			deep: true,
			immediate: true
		},
		reqQuery: {
			handler() {
				this.getBranchList();
			},
			immediate: true
		},
	},
	methods: {
		getBranchList() {
			getBranchList(this.reqQuery).then(res => {
				this.branch_select_data = [];
				if (res.data.type === 1) {
					const data = res.data.result.data;
					const list = getTreeFromBranchData(data);
					this.branch_select_data.push(...list);
					if (this.showAll) {
						this.branch_select_data.unshift({
							value: "all",
							label: "全部",
						});
					}
				}
			});
		},

		changeBranch() {
			this.$refs.branch_cascader_ref.dropDownVisible = false;
			this.$emit("change-branch", this.branch_id);
		},
		// 员工档案打开档案时需要刷新数据，获取最新数据
		setBranchData(branch_list) {
			this.branch_select_data = [...branch_list];
		},
		resetBranch() {
			this.branch_id = ["all"];
			this.changeBranch();
		},

		selectBrach(node, data) {
			if (data.value == null) return;
			const result = [node.value];
			while (node.parent) {
				node = node.parent;
				result.unshift(node.value);
			}
			this.branch_id = result;
			this.$refs["branch_cascader_ref"].toggleDropDownVisible(false);
			this.changeBranch();
		},

		getSpanWidth(data) {
			const span = document.createElement("span");
			span.innerHTML = data.label;
			document.body.appendChild(span);
			const width = span.getBoundingClientRect().width;
			document.body.removeChild(span);
			return width;
		},

		handleVisibleChange(flag) {
			this.$emit("visible-change", flag);
		}
	},
};
</script>

<style scoped>
.el-scrollbar__wrap {
	overflow-x: hidden;
	margin-bottom: 0 !important;
}

.el-cascader-node.is-selectable.in-active-path {
	color: #a2b2c2;
}

.tooltip-item {
	width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
<style>
.branch-cascader .el-scrollbar__view {
	max-width: 228px;
}

.branch-cascader.el-cascader__dropdown .el-tooltip {
	font-weight: 400;
}

.branch-cascader.el-cascader__dropdown .el-cascader-node__prefix {
	display: none;
}

.branch-cascader.el-cascader__dropdown .el-cascader-menu__list .el-cascader-node {
	padding-left: 2px;
	padding-right: 0;
}

.branch-cascader .el-cascader-menu__wrap .el-radio {
	display: none !important;
}
</style>
