<template>
<div class="shuttle-search">
	<div class="search-wrap">
		<el-select
			:value="search_key"
			size="small"
			@change="handleSelectChange"
		>
			<el-option
				v-for="item in selectOptions"
				:key="item.value"
				:label="item.label"
				:value="item.value"
			/>
		</el-select>
		<el-input
			v-model="search_str"
			clearable
			placeholder="请输入内容进行搜索"
			size="small"
		>
			<template #prefix>
				<i
					class="el-input__icon el-icon-search"
				/>
			</template>
		</el-input>
	</div>
	<el-tabs
		v-loading="loading"
		:value="`${active_tab_key}`"
		@tab-click="handleTabClick"
	>
		<el-tab-pane
			v-for="tab in tabs"
			:key="tab.value"
			:label="tab.label"
			:name="`${tab.value}`"
		>
			<el-tree
				v-show="tree_data_map.get(search_key)?.length"
				ref="tree_refs"
				:tree-id="`${tab.value}`"
				:data="tree_data_map.get(search_key) || []"
				node-key="unique_id"
				:show-checkbox="false"
				:props="treeProps"
				:check-strictly="true"
				:expand-on-click-node="false"
				:check-on-click-node="true"
				@node-click="setCheckedList"
			>
				<template #default="{node}">
					<div
						class="tree-node-item"
						:class="{checked: node.checked}"
					>
						<text-ellipsis style="width: 100%;">
							{{ node.label }}
						</text-ellipsis>
						<fk-icon
							v-if="node.checked"
							style="--text-size: 18px;--text-color: var(--theme-color)"
						>
							<i class="el-icon-check" />
						</fk-icon>
					</div>
				</template>
			</el-tree>
			<div
				v-show="!tree_data_map.get(search_key)?.length"
				class="empty-table"
			>
				<i
					class="hg-icons hg-icon-not-table-data"
					style="font-size: 26px;"
				/>
				<span>暂无数据</span>
			</div>
		</el-tab-pane>
	</el-tabs>
</div>
</template>

<script setup lang="ts">
import {ref, computed, watch, nextTick} from "vue";
import {watchDebounced} from "@vueuse/core";
import type {TabPane as ElTabPane, Tree as ElTree} from "element-ui";

import {useLoading} from "@/composable/useLoading";
import FkIcon from "@/components/ForThink/FkIcon.vue";
import TextEllipsis from "@/components/TextEllipsis.vue";
import {DEBOUNCE_INPUT_WAIT} from "@/utils/js/constant";
import {eachTree} from "@/utils/ts/tree";
import {cleanupExpiredEffect} from "@/utils/js/common";
import type {GetFlatLocationObjectItem, GetLocationObjectItem, GetBranchItem} from "@/api/locationObject/locationObject";

import type {CheckedItem} from "../constant";
import {SHUTTLE_FETCH, SHUTTLE_TYPE} from "../constant";

type ApiResult = GetFlatLocationObjectItem | GetLocationObjectItem | GetBranchItem;

const emits = defineEmits<{
	(event: "update:checkedList", value: ShuttleSearchCheckedItem[]): void,
}>();

export interface SelectOptions {
	label: string,
	value: SHUTTLE_TYPE,
	/** @deprecated v6.3修改为一个搜索项对应一个tab */
	tab_name?: string,
}
interface ShuttleSearchCheckedItem extends CheckedItem {
	unique_id: string,
	search_key?: SHUTTLE_TYPE,
	tab_key?: SHUTTLE_TYPE
}
export interface Props {
	selectOptions: SelectOptions[],
	checkedList: ShuttleSearchCheckedItem[],
	multiple?: boolean,
	treeProps?: ElTree["props"]
}
const props = withDefaults(defineProps<Props>(), {
	multiple: true,
	treeProps: () => ({label: "name", children: "nodes", disabled: "", isLeaf: ""})
});

const search_key = ref<SHUTTLE_TYPE>(SHUTTLE_TYPE.branch);
const search_str = ref("");
const active_tab_key = ref<SHUTTLE_TYPE>(SHUTTLE_TYPE.branch);

type UniqueId = string;
type TreeNode = {
	id: number,
	unique_id: UniqueId,
	pid: number,
	name: string,
	type: GetLocationObjectItem["type"],
	checked: boolean,
	branch_name?: string,
	unit_name?: string,
	nodes?: TreeNode[]
	person_list?: GetBranchItem["person_list"],
}
type TreeInstance = InstanceType<typeof ElTree<UniqueId, TreeNode>>;
const tree_refs = ref<TreeInstance[]>([]);
const tree_data_map = new Map<SHUTTLE_TYPE, TreeNode[]>();
const flat_data_map = new Map<string, TreeNode>();

const fallbackFetch = () => Promise.reject("fetchTreeData不是有效的接口");
let fetchTreeData: Function = fallbackFetch;

const tabs = computed(() => props.selectOptions.filter(({label}) => Boolean(label)));

const {loading, startLoading, endLoading} = useLoading();

const handleRequest = cleanupExpiredEffect(async (onCleanup: (cb: () => void) => void, name?: string, is_refresh_all?: boolean) => {
	let is_validate = true;
	onCleanup(() => {
		is_validate = false;
	});

	const transformData = (data: GetFlatLocationObjectItem[] | GetLocationObjectItem[] | GetBranchItem[]) => {
		const children_key = props.treeProps.children;
		if (isGetBranchItem(data)) {
			const new_data = eachTree<GetBranchItem, TreeNode>(data, (node) => {
				const assert_node = node as TreeNode;
				const person_list = (assert_node.person_list || []).map((item) => {
					const unique_id = getTreeNodeUniqueId(item);
					const new_item = {
						...item,
						unique_id,
						nodes: [],
						pid: node.id,
						person_list: [],
						checked: false,
					};
					flat_data_map.set(unique_id, {
						...new_item,
						nodes: undefined,
						person_list: undefined
					});
					return new_item;
				});
				const unique_id = getTreeNodeUniqueId(assert_node);
				assert_node.nodes = [...(assert_node.nodes || []), ...person_list];
				assert_node.unique_id = unique_id;
				assert_node.checked = false;
				flat_data_map.set(unique_id, {
					...assert_node,
					nodes: undefined,
					person_list: undefined
				});
				return assert_node;
			}, {children_key});
			return new_data;
		} else {
			const new_data = eachTree<ApiResult, TreeNode>(data, (node) => {
				const assert_node = node as TreeNode;
				const unique_id = getTreeNodeUniqueId(assert_node);
				assert_node.unique_id = unique_id;
				assert_node.checked = false;
				flat_data_map.set(unique_id, {
					...assert_node,
					nodes: undefined,
					person_list: undefined
				});
				return assert_node;
			}, {children_key});
			return new_data;
		}
	};

	try {
		startLoading();
		if (is_refresh_all) {
			const fetch_list = props.selectOptions.flatMap(({value}) => {
				const fetch = SHUTTLE_FETCH[value];
				return search_key.value === value ? [] : fetch;
			});
			fetch_list.unshift(SHUTTLE_FETCH[search_key.value]);
			const [cur_res, ...other_res_list] = await Promise.all(fetch_list.map((fetch) => fetch({})));
			if (!is_validate) return;
			const other_data = other_res_list.flatMap((res) => res.data.type === 1 ? res.data.result : []) as ApiResult[];
			flat_data_map.clear();
			transformData(other_data);
			tree_data_map.set(search_key.value, transformData(cur_res.data.type === 1 ? cur_res.data.result : []));
		} else {
			const {data: res} = await fetchTreeData({name: name || undefined});
			if (!is_validate) return;
			flat_data_map.clear();
			tree_data_map.set(search_key.value, transformData(res.type === 1 ? res.result : []));
		}
		refreshCheckList(Boolean(is_refresh_all), name);
		nextTick(() => {
			updateTreeChecked(props.checkedList);
		});
	} catch (error) {
		console.error(error);
	} finally {
		is_validate && endLoading();
	}
});

// 设置初始选中值
watch(() => props.selectOptions, (new_options) => {
	search_key.value = new_options[0].value;
	new_options.forEach(({value}) => tree_data_map.set(value, []));
}, {
	immediate: true
});
watch(tabs, (new_tabs) => {
	active_tab_key.value = new_tabs[0].value;
}, {
	immediate: true
});

watch(search_key, () => {
	setRequestFn();
	handleRequest(search_str.value);
});
watchDebounced(search_str, () => handleRequest(search_str.value), {debounce: DEBOUNCE_INPUT_WAIT});

function setRequestFn() {
	fetchTreeData = SHUTTLE_FETCH[search_key.value] ?? fallbackFetch;
}

function handleSelectChange(value: SHUTTLE_TYPE) {
	const find_index = tabs.value.findIndex((item) => item.value === value);
	search_key.value = value;
	// 处理员工的下拉选择项和tab项不是一一对应的情况
	active_tab_key.value = find_index > -1 ? value : tabs.value[0].value;
}

function handleTabClick(tab: InstanceType<typeof ElTabPane>) {
	search_key.value = Number(tab.name);
	active_tab_key.value = Number(tab.name);
}

// 更新当前tab下el-tree的状态
function setCheckedList(data: TreeNode, node: any) {
	const {multiple, checkedList} = props;
	data.checked = node.checked;

	let copy_checked_list = checkedList.map((node) => ({...node}));
	if (multiple) {
		const find_index = copy_checked_list.findIndex(({unique_id}) => unique_id === data.unique_id);
		if (find_index > -1) {
			data.checked || copy_checked_list.splice(find_index, 1);
		} else {
			data.checked && copy_checked_list.push({
				id: data.id,
				unique_id: data.unique_id,
				name: data.name,
				type: data.type,
				branch_name: data.branch_name,
				unit_name: data.unit_name
			});
		}
	} else {
		copy_checked_list = [];
		data.checked && copy_checked_list.push({
			id: data.id,
			unique_id: data.unique_id,
			name: data.name,
			type: data.type,
			branch_name: data.branch_name,
			unit_name: data.unit_name
		});
	}
	updateTreeChecked(copy_checked_list);
	emits("update:checkedList", [...copy_checked_list]);
}
function updateTreeChecked(checked_list: ShuttleSearchCheckedItem[]) {
	const cur_tree_ref = tree_refs.value.find((component) => component.$attrs["tree-id"] === String(active_tab_key.value));
	const checked_id_list = checked_list.map(({unique_id}) => unique_id);
	// 更新数据状态
	eachTree(tree_data_map.get(search_key.value) || [], (data) => {
		data.checked = checked_id_list.includes(data.unique_id);
		return data;
	}, {
		children_key: props.treeProps.children
	});
	// 更新el-tree视图状态
	cur_tree_ref!.setCheckedKeys(checked_id_list);
}

// 其他用户导致数据修改或删除
function refreshCheckList(is_refresh_all: boolean, search_name?: string) {
	const checked_list = props.checkedList.flatMap((item) => {
		if (is_refresh_all) {
			const new_item = flat_data_map.get(item.unique_id);
			if (new_item) {
				return {
					...item,
					name: new_item.name,
					branch_name: new_item.branch_name,
					unit_name: new_item.unit_name
				};
			}
			return [];
		} else {
			const [shuttle_type] = item.unique_id.split("-").map(Number);
			if (
				search_key.value === shuttle_type
				|| shuttle_type === SHUTTLE_TYPE.person
				|| shuttle_type === SHUTTLE_TYPE.truck
				|| shuttle_type === SHUTTLE_TYPE.visitor
				|| shuttle_type === SHUTTLE_TYPE.material
				|| shuttle_type === SHUTTLE_TYPE.contractor
			) {
				const new_item = flat_data_map.get(item.unique_id);
				if (new_item) {
					return {
						...item,
						name: new_item.name,
						branch_name: new_item.branch_name,
						unit_name: new_item.unit_name
					};
				}
				return search_name ? item : [];
			} else {
				return item;
			}
		}
	});
	emits("update:checkedList", checked_list);
}

function isGetBranchItem(data: GetFlatLocationObjectItem[] | GetLocationObjectItem[] | GetBranchItem[]): data is GetBranchItem[] {
	if (data.length === 0) return true;
	return "nodes" in data[0] && "person_list" in data[0];
}

function getTreeNodeUniqueId(node: {
	type: SHUTTLE_TYPE,
	id: number,
	[key: string]: any
}) {
	return `${node.type}-${node.id}`;
}

function fetchRequest(is_refresh_all = false) {
	setRequestFn();
	return handleRequest("", is_refresh_all);
}

function clearSearchStr() {
	search_str.value = "";
}

defineExpose({
	updateTreeChecked,
	fetchRequest,
	clearSearchStr
});
</script>

<style lang="scss" scoped>
.shuttle-search {
	display: flex;
	flex-direction: column;
	height: 100%;

	.el-tabs {
		height: 0;
		flex: 1 1 100%;
		display: flex;
		flex-direction: column;

		:deep(.el-tabs__header) {
			margin-bottom: 10px !important;

			.el-tabs__item {
				padding: 0 14px;
				color: var(--theme-text-color-normal);

				&:nth-child(2) {
					padding-left: 0;
				}

				&:last-child {
					padding-right: 0;
				}

				&.is-active {
					color: var(--theme-color);
				}
			}
		}

		:deep(.el-tabs__content) {
			overflow: auto;
			height: 0;
			flex: 1 1 100%;
		}

		:deep(.el-tab-pane) {
			height: 100%;
		}

		:deep(.el-tabs__nav-wrap.is-scrollable) {
			padding: 0;
		}
	}

	.el-tree {
		:deep(.el-tree-node__content) {
			height: 32px;
		}
	}

	.search-wrap {
		margin-bottom: 16px;
		display: flex;

		:deep(.el-select .el-input) {
			.el-input__inner {
				border-top-right-radius: 0;
				border-bottom-right-radius: 0;
				border-right: none;
			}

			.is-focus .el-input__inner,
			.el-input__inner:focus {
				border-color: var(--table-border-color);
			}
		}

		:deep(.el-input) {
			.el-input__inner {
				border-top-left-radius: 0;
				border-bottom-left-radius: 0;
			}

			.is-focus .el-input__inner,
			.el-input__inner:focus {
				border-color: var(--table-border-color);
			}
		}
	}

	.tree-node-item {
		width: calc(100% - 24px);
		padding-right: 8px;
		color: var(--theme-text-color-gray);
		display: flex;
		justify-content: space-between;

		&.checked {
			color: var(--theme-color);
		}
	}

	.empty-table {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		font-size: 14px;
		color: #d1d8e1;
	}
}
</style>
