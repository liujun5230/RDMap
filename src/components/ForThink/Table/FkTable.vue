<template>
<el-table
	ref="fk-table"
	:max-height="maxHeight"
	:border="border"
	:height="maxHeight ? undefined : (height ? height : '100%')"
	class="fk-table operate-btn"
	:data="table_data"
	:row-key="rowKey"
	:row-style="rowStyle"
	:tree-props="tree_props"
	:highlight-current-row="highlightCurrentRow"
	header-row-class-name="fk-table-header"
	:row-class-name="disabledDrop"
	:stripe="stripe"
	:span-method="spanMethod"
	v-bind="$attrs"
	@cell-mouse-enter="mouseEnterEvent"
	@cell-mouse-leave="mouseLeaveEvent"
	@cell-click="handleCellClick"
	@selection-change="handleSelectionChange"
	@select="handleSelect"
	@select-all="handleSelectAll"
	@sort-change="handleSortChange"
	@current-change="handleCurrentChange"
	@expand-change="handleExpandChange"
>
	<slot />
	<div
		slot="empty"
		class="empty-table"
	>
		<i class="hg-icons hg-icon-not-table-data" />
		<span>暂无数据</span>
	</div>
</el-table>
</template>

<script>
import "@/utils/css/messageBox.css";
import {printTableData} from "../../../utils/js/tools/table";
import Sortable from "sortablejs";

export default {
	name: "FkTable",
	inheritAttrs: false,
	props: {
		data: {
			type: Array,
			required: true
		},
		rowKey: {
			type: String,
			default() {
				return "";
			}
		},
		treeProps: {
			type: String,
			default() {
				return "";
			}
		},
		height: {
			type: [Number, String],
			default() {
				return 0;
			}
		},
		maxHeight: {
			type: [Number, String, undefined],
			default: undefined
		},
		highlightCurrentRow: {
			type: Boolean,
			default() {
				return false;
			}
		},
		rowStyle: {
			type: [Object, Function],
			default() {
				return {};
			}
		},
		border: {
			type: Boolean,
			default: true
		},
		handleDragClass: { // 指定可拖拽排序的类名
			type: String,
			default: ""
		},
		sortable: {
			type: Boolean,
			default: false
		},
		isFixed: {
			type: Boolean,
			default: false
		},
		stripe: {
			type: Boolean,
			default: true
		},
		spanMethod: {
			type: Function,
			default: undefined
		},
		rowClassName: {
			type: [Function, String],
			default: ""
		}
	},
	data() {
		return {
			table_data: [],
			tree_props: {children: "", hasChildren: "hasChildren"}
		};
	},
	watch: {
		async data() {
			this.table_data = this.data;
			this.$nextTick(() => {
				setTimeout(() => {
					// 不知道为什么一定要在setTimeout中，doLayout才生效，#18444
					this.$refs["fk-table"]?.doLayout();
				}, 100);
			});
		},
		treeProps: {
			handler() {
				this.tree_props.children = this.treeProps;
			},
			immediate: true,
		},

	},
	mounted() {
		this.table_data = this.data;
		if (this.rowKey && this.sortable) {
			this.rowDrop();
		}
	},
	methods: {
		clearSelection() {
			this.$refs["fk-table"].clearSelection();
		},

		handleSelectionChange(val) {
			this.$emit("selection-change", val);
		},
		mouseEnterEvent(row, column, cell, event) {
			this.$emit("cell-mouse-enter", row, column, cell, event);
		},
		mouseLeaveEvent(row, column, cell, event) {
			this.$emit("cell-mouse-leave", row, column, cell, event);
		},
		handleCellClick(row, column, cell, event) {
			this.$emit("cell-click", row, column, cell, event);
		},
		handleSelect(selections, row) {
			this.$emit("select", selections, row);
		},

		handleSelectAll(selections) {
			this.$emit("select", selections);
		},

		handleSortChange(column) {
			this.$emit("sort-change", column);
		},

		handleCurrentChange(column) {
			this.$emit("current-change", column);
		},

		handleExpandChange(row, expanded) {
			this.$emit("expand-change", row, expanded);
		},

		getSelection() {
			return this.$refs["fk-table"].selection;
		},

		toggleRowSelection(data, flag) {
			this.$refs["fk-table"].toggleRowSelection(data, flag);
		},

		setCurrentRow(row) {
			this.$refs["fk-table"].setCurrentRow(row);
		},

		toggleAllSelection() {
			this.$refs["fk-table"].toggleAllSelection();
		},

		toggleRowExpansion(row, flag) {
			this.$refs["fk-table"].toggleRowExpansion(row, flag);
		},

		print(title, is_print_selected, format, ignore_row, options) {
			printTableData(this.$refs["fk-table"], title, is_print_selected, format, ignore_row, options);
		},
		disabledDrop({row, rowIndex}) {
			let name = "fk-table-row ";
			if (row.disabled_drop) {
				name = name + "disabled-drop-elements";
			}
			if (this.rowClassName instanceof Function) {
				name += this.rowClassName({row, rowIndex});
			} else {
				name += this.rowClassName;
			}
			return name;
		},
		rowDrop() {
			const drag_obj = {
				handle: this.handleDragClass,
				animation: 200, // 定义排序动画的时间
				forceFallback: true, // boolean 如果设置为true时，将不使用原生的html5的拖放，可以修改一些拖放中元素的样式等；
				onMove(evt) {
					if (evt.related.className.split(" ").includes("disabled-drop-elements")) return false;
				},
				onEnd: ({newIndex, oldIndex}) => {
					const currRow = this.table_data.splice(oldIndex, 1)[0];
					this.table_data.splice(newIndex, 0, currRow);
					this.$emit("drag-change", this.table_data);
				}
			};

			if (this.isFixed) {
				this.$nextTick(() => {
					const tbody = this.$refs["fk-table"].$el.querySelector(".el-table__fixed-body-wrapper tbody");
					Sortable.create(tbody, drag_obj);
				});
			} else {
				const tbody = this.$refs["fk-table"].$el.querySelector(".el-table__body-wrapper tbody");
				Sortable.create(tbody, drag_obj);
			}
		},
	}
};
</script>

<style scoped>
.fk-table.el-table {
	color: #748BA4;;
	margin-top: 0;
	font-size: 12px;
}

:deep(.fk-table-header) {
	color: #A2B2C2;;
	font-size: 14px;
}

:deep(.fk-table-header) th {
	background-color: #F5F8FA;
	padding: 0 !important;
	height: 32px !important;
	border-bottom: none !important;
}

.fk-table .el-tooltip__popper {
	background: #303133 !important; /*背景色  !important优先级*/
	color: #FFFFFF !important; /*字体颜色*/
	max-width: 200px !important;
	min-height: 15px !important;
	max-height: 95px !important;
	line-height: 20px !important;
}

.fk-table :deep(button.el-button.is-plain.is-plain) {
	width: 30px !important;
	height: 30px !important;
	padding: 0 !important;
}

.fk-table :deep(button.el-button.el-button--primary.is-plain.is-circle) {
	background-color: rgba(65, 150, 246, 0.1);
	border: 1px solid #4196F6;
}

.fk-table :deep(button.el-button.el-button--primary.is-plain.is-disabled.is-circle) {
	border: 1px solid rgba(65, 150, 246, 0.5);
	color: rgba(65, 150, 246, 0.5);
}

.fk-table :deep(button.el-button.el-button--primary.is-plain.is-circle svg) {
	color: #4196F6;
}

.fk-table :deep(button.el-button.el-button--danger.is-plain.is-circle) {
	background-color: rgba(255, 77, 79, 0.1);
	border: 1px solid rgba(245, 108, 108, 0.5);
	color: #F56C6C;
}

.fk-table :deep(button.el-button.el-button--danger.is-plain.is-disabled.is-circle) {
	background-color: rgba(255, 77, 79, 0.1);
	color: rgba(245, 108, 108, 0.5);
}

.fk-table :deep(button.el-button.el-button--success.is-plain.is-circle) {
	background-color: rgba(80, 195, 23, 0.1);
	border: 1px solid rgba(82, 196, 26, 0.5);
	color: #52C41A;
}

.fk-table :deep(button.el-button.el-button--success.is-plain.is-disabled.is-circle) {
	background-color: rgba(82, 196, 26, 0.1);
	color: rgba(82, 196, 26, 0.5);
}

.fk-table :deep(button.el-button.el-button--primary.is-plain.is-circle:hover) {
	background-color: #4196F6;
}

.fk-table :deep(button.el-button.el-button--primary.is-plain.is-circle:hover svg) {
	color: #fff;
}

.fk-table :deep(button.el-button.el-button--danger.is-plain.is-circle:hover) {
	background-color: #F56C6C;
	color: #fff;
}

.fk-table :deep(button.el-button.el-button--success.is-plain.is-circle:hover) {
	background-color: #67C23A;
	color: #fff;
}

.fk-table :deep(button.el-button.el-button--success.is-plain.is-circle.btn-checked) {
	background-color: #58A632;
	color: #fff;
}

.fk-table.el-table :deep(.caret-wrapper) {
	height: 32px;
}

.fk-table.el-table :deep(.sort-caret.ascending) {
	top: 4px;
}

.fk-table.el-table :deep(.sort-caret.descending) {
	bottom: 6px;
}
.empty-table {
	display: flex;
	flex-direction: column;
	font-size: 14px;
	color: #D1D8E1;
}

:deep(.el-table__empty-text) {
	line-height: initial !important;
	min-height: 80px;
	margin-top: 20px;
}

.hg-icon-not-table-data {
	font-size: 26px;
	margin-bottom: 20px;
}
</style>

<style>
.el-tooltip__popper[x-placement=top] {
	max-width: 656px;
	min-height: 15px;
	line-height: 18px !important;
}
</style>
