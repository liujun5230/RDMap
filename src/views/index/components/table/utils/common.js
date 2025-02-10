import {nextTick} from "vue";

/**
 * 把平铺结构转换位树形结构
 * @param {*} flat_data
 * @param {*} callback
 * @param {*} options
 */
export const toTree = (flat_data, callback = null, options = {}) => {
	const arr = [];
	const {children_key = "children", parent_key = "pid", row_key = "id"} = options;
	const cb = typeof callback === "function" ? callback : (node) => node;

	flat_data.forEach((node) => {
		node[children_key] = [];
		if (!node[parent_key] || node[parent_key] === "0") {
			arr.push(cb(node));
		} else {
			const parent_item = flat_data.find((item) => item[row_key] === node[parent_key]);
			if (parent_item) {
				parent_item[children_key].push(cb(node));
			}
		}
	});

	return arr;
};

/**
 * 把树形结构转换位平铺结构
 * @param {*[]} tree_data
 * @param {function} callback
 * @param {{children_key: string}} options
 */
export const toTile = (tree_data, callback = null, options = {}) => {
	const arr = [];
	const {children_key = "children"} = options;
	const cb = typeof callback === "function" ? callback : (node) => node;

	const expanded = (tree, parent, result) => {
		tree.forEach((node) => {
			const children = node[children_key];
			const new_node = cb(node, parent);
			result.push(new_node);
			if (children) {
				expanded(children, new_node, result);
			}
		});
	};

	expanded(tree_data, null, arr);

	return arr;
};

/**
 * 遍历树形结构转
 * @param {*[]} tree_data
 * @param {function} callback
 * @param {{children_key: string}} options
 */
export const eachTree = (tree_data, callback = null, options = {}) => {
	const {children_key = "children"} = options;
	const cb = typeof callback === "function" ? callback : (node) => node;

	const expanded = (tree, parent) => {
		tree.forEach((node) => {
			const children = node[children_key];
			cb(node, parent);
			if (children) {
				expanded(children, node);
			}
		});
	};

	expanded(tree_data, null);
};

/**
 * 获取表头复选框勾选状态
 * @param {*[]} flat_table_data
 * @param {string} display_key
 */
export const getColumnCheckbox = (flat_table_data, display_key) => {
	let checkbox = true;
	let indeterminate = false;

	const length = flat_table_data.filter((row) => row[display_key]).length;
	if (length === 0) {
		checkbox = false;
		indeterminate = false;
	} else if (length === flat_table_data.length) {
		checkbox = true;
		indeterminate = false;
	} else {
		checkbox = true;
		indeterminate = true;
	}

	return {
		checkbox,
		indeterminate
	};
};

/**
 * 处理树型表格条纹 监听表格expand-change使用
 * @expand-change="handleTableStripe(table_ref)"
 */
export const handleTableStripe = (table_ref) => {
	nextTick(() => {
		const rows = table_ref.$el.querySelectorAll(".el-table__body .el-table__row");
		let flag = false;
		for (const row of rows) {
			row.classList.remove("el-table__row--striped");
			if (window.getComputedStyle(row).display !== "none") {
				if (flag) {
					row.classList.add("el-table__row--striped");
					flag = false;
				} else {
					flag = true;
				}
			}
		}
	});
};

/**
 * 格式化排序数据
 * ```javascript
 * // 格式化后的数据
 * {
 * 		id: 1,
 * 		pid: 0,
 * 		sorting: 1,
 * 		node: [{
 * 			id: 11,
 * 			pid: 1,
 * 			sorting: 2,
 * 		}]
 * }
 * ```
 * @param {*} data
 * @param {*} options
 */
export const formatSortData = (data, options = {}) => {
	const {row_key = "id", parent_key = "pid"} = options;
	const sort_data = data.map((row, index) => ({
		id: row[row_key],
		pid: row[parent_key],
		sorting: index + 1,
	}));

	return toTree(sort_data, null, {children_key: "node", row_key, parent_key});
};
