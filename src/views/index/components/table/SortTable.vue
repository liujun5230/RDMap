<template>
<el-table
	ref="table_ref"
	class="sort-table"
	header-row-class-name="header-row"
	:row-class-name="rowClassName"
	header-cell-class-name="header-cell"
	cell-class-name="body-cell"
	:data="table_data"
	:border="true"
	:row-key="row_key"
	:height="props.maxHeight ? 'auto' : props.height ? props.height : '100%'"
	:max-height="props.maxHeight"
	:indent="0"
	:tree-props="props.treeProps"
	stripe
	default-expand-all
	@expand-change="handleTableStripe(table_ref)"
>
	<template #default>
		<!-- 排序列 -->
		<el-table-column
			v-if="sortable"
			width="34"
			:resizable="false"
		>
			<template #default="{row}">
				<fk-icon
					v-if="!row.disable_drag"
					tip="拖拽"
					class="row-drag text-minor-2 cursor-move"
					size="14"
				>
					<drag-icon />
				</fk-icon>
			</template>
		</el-table-column>
		<!-- 显示/隐藏列 -->
		<el-table-column
			class-name="display-col"
			show-overflow-tooltip
		>
			<template #header>
				<el-checkbox
					class="fk-index-checkbox"
					:value="col_checkbox"
					:indeterminate="col_indeterminate"
					@change="toggleDisplayAll"
				/>
				<span class="ml-[8px]">{{ props.displayColumn.label }}</span>
			</template>
			<template #default="{ row, column }">
				<span class="inline-block w-[14px] mr-[8px]">
					<fk-icon
						v-if="isHasChildren(row)"
						class="text-primary mr-[8px] transition-transform duration-200 hover-icon align-middle text-[16px] cursor-pointer"
						:class="{'-rotate-90': row[expand_key] === false}"
						@click="toggleExpandRow(row)"
					>
						<expand-table-icon />
					</fk-icon>
				</span>
				<span class="inline-block w-[14px] mr-[8px]">
					<el-checkbox
						v-if="!row.disable_display"
						class="fk-index-checkbox"
						:value="!!row[display_key]"
						:indeterminate="row.checkbox_indeterminate"
						@change="toggleDisplayRow(row, $event)"
					/>
				</span>
				<span>{{ formatDisplayCell(row, column) }}</span>
			</template>
		</el-table-column>
		<!-- 其他列 -->
		<slot />

		<!-- 置顶列 -->
		<el-table-column
			v-if="sortable"
			width="60"
			label="置顶"
		>
			<template #default="{ row }">
				<fk-icon
					v-if="isShowPinToTop(row)"
					class="text-primary cursor-pointer hover:text-[#2277e6] align-middle"
					size="20"
					@click="handlePinToTop(row)"
				>
					<pin-top-icon />
				</fk-icon>
			</template>
		</el-table-column>
	</template>
	<template #empty>
		<empty-placeholder />
	</template>
</el-table>
</template>

<script setup>
import {ref, computed, shallowRef, nextTick, onMounted, watch} from "vue";
import Sortable from "sortablejs";
import {throttle, cloneDeep} from "lodash-es";
import PinTopIcon from "~icons/operation/pin-top";
import DragIcon from "~icons/operation/drag";
import ExpandTableIcon from "~icons/operation/expand-table";
import FkIcon from "@/components/ForThink/FkIcon.vue";
import {toTree, toTile, getColumnCheckbox, formatSortData, handleTableStripe, eachTree} from "./utils/common";
import EmptyPlaceholder from "@index/components/EmptyPlaceholder.vue";

const props = defineProps({
	data: {
		type: Array,
		required: true,
		default: () => [],
	},
	rowKey: {
		type: String,
		default: "id",
	},
	height: {
		type: [String, Number],
		default: undefined,
	},
	maxHeight: {
		type: [String, Number],
		default: undefined,
	},
	treeProps: {
		type: Object,
		default: () => ({
			children: "children",
			hasChildren: "hasChildren",
			parent: "pid",
		}),
	},
	displayColumn: {
		type: Object,
		required: true,
	},
	displayKey: {
		type: String,
		default: "is_display",
	},
	/**
	 * strict: 勾选父节点、所有叶子节点全部被勾选；取消勾选父节点、所有叶子节点全部被取消勾选(父、叶子节点半选始终为false)
	 *		  叶子节点勾选数量>0，父节点被勾选(父节点的直接子节点存在勾选但是没有全部勾选或者直接子节点中存在半选，父节点半选为true，否则为false)；叶子节点勾选数量 === 0，父节点不被勾选(父节点的半选为false)
	 * half-strict: 同 strict，区别在于当叶子节点勾选数量 === 0，不影响父节点的状态(包含勾选状态和半选状态)
	 * no-strict: 父、叶子节点各自独立(不会存在半选状态)
	 * strict 和 half-strict 的模式半选表示"显示"
	 */
	displayCascade: {
		type: String,
		default: "strict",
		validator: (value) => ["strict", "half-strict", "no-strict"].includes(value)
	},
	expandKey: {
		type: String,
		default: "is_expand",
	},
	sortable: {
		type: Boolean,
		default: true
	}
});

const emits = defineEmits(["display-change", "sort-change"]);

const table_ref = ref();
const col_checkbox = ref(true);
const col_indeterminate = ref(false);

const row_key = computed(() => props.rowKey);
const children_key = computed(() => props.treeProps.children);
const parent_key = computed(() => props.treeProps.parent);
const display_key = computed(() => props.displayKey);
const expand_key = computed(() => props.expandKey);

const flat_table_data = shallowRef([]);

watch(() => props.data, () => {
	flat_table_data.value = treeToTile(props.data);
}, {
	immediate: true
});

// table_data 的 row 跟 flat_table_data 的 row 是同一个引用
const table_data = computed(() => tileToTree(flat_table_data.value));

let display_setting = undefined;
let sorting_setting = undefined;
watch(flat_table_data, () => {
	display_setting = flat_table_data.value.reduce((result, item) => {
		result[item[row_key.value]] = Boolean(item[display_key.value]);
		return result;
	}, {});
	sorting_setting = formatSortData(flat_table_data.value, {row_key: row_key.value, parent_key: parent_key.value});
	updateColIndeterminate();
}, {
	immediate: true
});

watch(table_data, () => {
	updateTableDataIndeterminate(table_data.value);
}, {immediate: true});

onMounted(() => {
	rowDrag();
});

function rowClassName({row}) {
	return `body-row ${row.disable_drag ? "not-draggable" : ""}`;
}

function isHasChildren(row) {
	const children = row[children_key.value];
	return Array.isArray(children) && !!children.length;
}

function isShowPinToTop(row) {
	if (row.disable_drag) return false;
	// 当前行兄弟元素列表
	const sibling_list = row.parent?.[children_key.value] || flat_table_data.value;
	// 第一可拖拽的元素索引
	const first_drag_index = sibling_list.findIndex((item) => !item.disable_drag);
	// 当前行的索引
	const cur_index = sibling_list.findIndex((item) => row[row_key.value] === item[row_key.value]);
	// 显示当前行不是父级第一个可拖拽的元素
	return cur_index !== first_drag_index;
}

function formatDisplayCell(row, column) {
	const {displayColumn} = props;
	if (typeof displayColumn.formatter === "function") {
		return displayColumn.formatter(row, column, row[displayColumn.prop]);
	}
	return row[displayColumn.prop];
}

function updateTableDataIndeterminate(tree_data) {
	const {displayCascade} = props;
	eachTree(tree_data, (node) => {
		const children_list = toTile(node[children_key.value] ?? [], null, {children_key: children_key.value});
		if (children_list?.length) {
			const {indeterminate, checkbox} = getColumnCheckbox(children_list, display_key.value);
			node.checkbox_indeterminate = indeterminate;
			displayCascade === "strict" && (node[display_key.value] = checkbox);
		}
	}, {children_key: children_key.value});
}

// 更新列头的复选框样式
function updateColIndeterminate() {
	const {checkbox, indeterminate} = getColumnCheckbox(flat_table_data.value, display_key.value);
	col_checkbox.value = checkbox;
	col_indeterminate.value = indeterminate;
}

function toggleDisplayAll(is_checked) {
	display_setting = flat_table_data.value.reduce((result, row) => {
		row[display_key.value] = is_checked;
		row.checkbox_indeterminate = false;
		result[row[row_key.value]] = row.disable_display ? true : Boolean(row[display_key.value]);
		return result;
	}, {});

	col_checkbox.value = is_checked;
	col_indeterminate.value = false;
	emits("display-change", {display_setting, table_data: cloneDeep(table_data.value), flat_data: cloneDeep(flat_table_data.value)});
}

function recursionParent(parent) {
	if (parent) {
		const children = parent[children_key.value] ?? [];
		const display_length = children.filter((node) => node[display_key.value]).length;
		const indeterminate_length = children.filter((node) => node.checkbox_indeterminate).length;
		if (display_length) {
			parent[display_key.value] = true;
			display_setting[parent[row_key.value]] = true;
			if (indeterminate_length || display_length !== children.length) {
				parent.checkbox_indeterminate = true;
			} else {
				parent.checkbox_indeterminate = false;
			}
		} else {
			if (props.displayCascade === "strict") {
				display_setting[parent[row_key.value]] = false;
				parent[display_key.value] = false;
				parent.checkbox_indeterminate = false;
			}
		}
		recursionParent(parent.parent);
	}
}

function toggleDisplayRow(row, is_checked) {
	if (props.displayCascade === "no-strict") {
		row.checkbox_indeterminate = false;
		row[display_key.value] = is_checked;
		display_setting[row[row_key.value]] = is_checked;
	} else {
		if (row.checkbox_indeterminate) {
			row[display_key.value] = true;
			display_setting[row[row_key.value]] = true;
			eachTree(row[children_key.value] ?? [], (node) => {
				node[display_key.value] = true;
				node.checkbox_indeterminate = false;
				display_setting[node[row_key.value]] = true;
			}, {children_key: children_key.value});
		} else {
			row[display_key.value] = is_checked;
			display_setting[row[row_key.value]] = is_checked;
			eachTree(row[children_key.value] ?? [], (node) => {
				node[display_key.value] = is_checked;
				node.checkbox_indeterminate = false;
				display_setting[node[row_key.value]] = is_checked;
			}, {children_key: children_key.value});
		}
		row.checkbox_indeterminate = false;
		recursionParent(row.parent);
	}

	updateColIndeterminate();

	emits("display-change", {display_setting, table_data: cloneDeep(table_data.value), flat_data: cloneDeep(flat_table_data.value)});
}

function toggleExpandRow(row) {
	const is_expand = !row.is_expand;

	row[expand_key.value] = is_expand;
	table_ref.value.toggleRowExpansion(row);
}

// 计算一个节点包含了多少个后代元素
function calculateChildrenNum(node) {
	const children = node[children_key.value];
	if (!children || children.length === 0) {
		return 0;
	}

	let total_children_num = children.length;

	for (const child of children) {
		total_children_num += calculateChildrenNum(child);
	}

	return total_children_num;
}

// 把树形结构转换为扁平结构
function treeToTile(tree_data) {
	const result = toTile(
		tree_data,
		(node, parent) => {
			// 解除对象引用关系，避免热更新导致属性改变触发 watch
			const new_node = {...node};
			new_node.parent = parent;
			new_node.children_num = calculateChildrenNum(new_node);
			new_node[expand_key.value] = isHasChildren(new_node)
				? new_node[expand_key.value] === undefined
					? true
					: new_node[display_key.value]
				: undefined;

			new_node[display_key.value]
				= new_node[display_key.value] === undefined ? true : new_node[display_key.value];
			new_node.checkbox_indeterminate = false;

			return new_node;
		},
		{
			children_key: children_key.value,
		}
	);

	return result;
}

// 把扁平结构转换为树形结构
function tileToTree(flat_data) {
	return toTree(flat_data, null, {
		row_key: row_key.value,
		children_key: children_key.value,
		parent_key: parent_key.value,
	});
}

// 置顶
const handlePinToTop = throttle((row) => {
	const parent_id = row[parent_key.value];
	const sibling_list = row.parent?.[children_key.value] || flat_table_data.value;
	const flat_data = flat_table_data.value.map((row) => ({...row}));
	const old_index = flat_data.findIndex(
		(item) => item[row_key.value] === row[row_key.value]
	);
	const parent_index = flat_data.findIndex(
		(item) => item[row_key.value] === parent_id
	);
	const children_key_index = sibling_list.findIndex((row) => !row.disable_drag);
	const new_index = parent_index + children_key_index + 1;
	if (old_index > -1 && new_index > -1) {
		handleRowDragEnd(old_index, new_index, flat_data);
	}
}, 1000);

// 排序逻辑
function handleRowDragEnd(old_index, new_index, flat_data) {
	console.log("onEnd: ", old_index, new_index);
	const old_row = flat_data[old_index]; // 移动的那个元素
	const new_row = flat_data[new_index]; // 新的元素
	const old_children_num = old_row?.children_num ?? 0;
	const new_children_num = new_row?.children_num ?? 0;
	const change_index = new_index - old_index;
	if (change_index === 0) return;
	if (old_row.disable_drag || new_row.disable_drag) return;
	if (old_index === new_index || old_row[parent_key.value] !== new_row[parent_key.value]) return;

	const delete_list = flat_data.splice(old_index, old_children_num + 1);
	const insert_index = change_index > 0 ? new_index - old_children_num + new_children_num : new_index;
	flat_data.splice(insert_index, 0, ...delete_list);

	console.log("排序后的ids: ", flat_data.map((row) => row[row_key.value]).join(","));

	flat_table_data.value = []; // 先清空数据，否则视图不会更新
	nextTick(() => {
		flat_table_data.value = flat_data;
		sorting_setting = formatSortData(flat_data, {row_key: row_key.value, parent_key: parent_key.value});
		nextTick(() => {
			flat_table_data.value = treeToTile(table_data.value);
			emits("sort-change", {sorting_setting, table_data: cloneDeep(table_data.value), flat_data: cloneDeep(flat_table_data.value)});
		});
	});
}

// 拖拽排序
function rowDrag() {
	const tbody = table_ref.value.$el.querySelector("tbody");
	let flat_data = [];
	Sortable.create(tbody, {
		handle: ".row-drag",
		filter: ".not-draggable",
		disabled: !props.sortable,
		animation: 200, // 定义排序动画的时间
		forceFallback: true, // boolean 如果设置为true时，将不使用原生的html5的拖放，可以修改一些拖放中元素的样式等；
		onStart: () => {
			flat_data = flat_table_data.value.map((row) => ({...row}));
		},
		onMove: ({dragged, related}) => {
			const old_row = flat_data[dragged.rowIndex]; // 移动的那个元素
			const new_row = flat_data[related.rowIndex]; // 新的元素
			if (old_row.disable_drag || new_row.disable_drag) return false;
			if (old_row[parent_key.value] !== new_row[parent_key.value]) {
				// 移动的元素与新元素父级id不相同
				return false; // 不允许跨级拖动
			}
		},
		onEnd: (e) => {
			const {oldIndex: old_index, newIndex: new_index} = e;
			handleRowDragEnd(old_index, new_index, flat_data);
		},
	});
}

defineExpose({
	getDisplaySetting: () => ({...display_setting}),
	getSortingSetting: () => cloneDeep(sorting_setting),
	doLayout: () => table_ref.value.doLayout()
});
</script>

<style scoped>
.sort-table.el-table {
	font-family: 'DingTalk JinBuTi';
	font-size: 14px;
	border: none;
	background-color: transparent;
	color: var(--text-main-1);
}

.sort-table.el-table::before,
.sort-table.el-table::after {
	width: 0;
	height: 0;
}

.sort-table.el-table :deep(.el-table__header-wrapper) {
	border-top: 1px solid;
	border-bottom: 1px solid;
	border-image: linear-gradient(90deg, rgba(178, 208, 255, 0) 0%, #B3D0FF 48.44%, rgba(178, 208, 255, 0) 100%) 1;
}

.sort-table.el-table :deep(.header-row) {
	color: var(--text-minor-2);
	background-color: rgba(86, 98, 122, 0.21);
}

.sort-table.el-table :deep(.header-row th.el-table__cell.gutter:last-of-type) {
	border-bottom: none;
}

.sort-table.el-table :deep(.el-table__cell) {
	padding: 5px 0;
	border: none;
	font-weight: 400;
	background-color: transparent;
}

.sort-table.el-table :deep(.header-row .el-table__cell .cell) {
	line-height: 22px;
	border-right: 1px solid #5A6B85;
}

.sort-table.el-table :deep(.el-table__body-wrapper .cell) {
	line-height: 30px;
	background-color: transparent;
}

.sort-table.el-table :deep(.body-row) {
	background-color: transparent;
}

.sort-table.el-table :deep(.body-row.el-table__row--striped .body-cell) {
	background: rgba(71, 82, 104, 0.5);
}

.sort-table.el-table :deep(.body-row:hover) {
	background: rgba(32, 55, 90, 0.8);
}

.sort-table.el-table :deep(.body-row:hover .body-cell) {
	background-color: transparent;
}

.sort-table.el-table :deep([class*='el-table__row--level'] .el-table__expand-icon) {
	display: none;
}

.sort-table.el-table :deep(.el-table__placeholder) {
	display: none;
}
.sort-table.el-table :deep(.header-row .display-col) {
	padding-left: 21px;
}
/* 设置显示/隐藏列一级 expand按钮缩进 */
.sort-table.el-table :deep(.body-row.el-table__row--level-1 .display-col .cell) {
	padding-left: 30px;
}

/* 设置显示/隐藏列二级 expand按钮缩进 */
.sort-table.el-table :deep(.body-row.el-table__row--level-2 .display-col .cell) {
	padding-left: 60px;
}

/* 设置显示/隐藏列三级 expand按钮缩进 */
.sort-table.el-table :deep(.body-row.el-table__row--level-3 .display-col .cell) {
	padding-left: 90px;
}

/* 设置显示/隐藏列四级 expand按钮缩进 */
.sort-table.el-table :deep(.body-row.el-table__row--level-4 .display-col .cell) {
	padding-left: 120px;
}

/* 设置显示/隐藏列五级 expand按钮缩进 */
.sort-table.el-table :deep(.body-row.el-table__row--level-5 .display-col .cell) {
	padding-left: 150px;
}
</style>
