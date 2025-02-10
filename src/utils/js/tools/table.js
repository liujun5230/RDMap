// 打印表格数据
export function printTable(tableDom) {
	const newWin = window.open("");
	newWin.document.write(tableDom);
	newWin.document.close();
	newWin.focus();
	newWin.print();
	newWin.onafterprint = () => {
		newWin.close();
	};
}

// 将table的排序字符串转为服务器接口需要的
export function transOrderString(order) {
	switch (order) {
	case "ascending":
		return "asc";
	case "descending":
		return "desc";
	default:
		return null;
	}
}

// 表头文字过长显示省略号-tooltip提示
export function renderHeader(h, data) {
	return h("span", [
		h("el-tooltip", {
			attrs: {
				class: "item",
				effect: "dark",
				content: data.column.label,
				placement: "top"
			}
		}, [
			h("span", data.column.label)
		])
	]);
}

// 判断当前页数最多能有多少页
export function getMaxPageNumer(total, page_size) {
	total = total ? total : 0;
	page_size = page_size ? page_size : 1;
	const max_page = Math.ceil(total / page_size);
	if (max_page === 0) return 1;
	return max_page;
}

// 表格空数据格式化
export function formatNull(row, col, val) {
	return val !== "" && val !== null && val !== undefined ? val : "--";
}

function treeToArray(tree, key) {
	let res = [];
	for (const item of tree) {
		const {[key]: children, ...i} = item;
		res.push(i);
		if (children && children.length) {
			res = res.concat(treeToArray(children, key));
		}
	}
	return res;
}

function getElTableColumn(VNode) { // 目前只有一层 没有递归
	if (!VNode?.tag) return {};
	if (VNode.tag.includes("ElTableColumn")) return VNode;
	const {isComment, componentOptions} = VNode.child.$children[0].$vnode;
	return {
		isComment,
		componentOptions: {...componentOptions, ...VNode.data.attrs}
	};
}
/**
 * 打印表格
 * @param table_ref 表格引用
 * @param title 标题
 * @param print_type 打印全部0 打印所选1 打印指定2
 * @param format 处理使用template进行格式化的内容
 * @param {string[]} [ignore_row] 忽略列
 * @param options options.tree_key 树型表格children字段名
 * @param options options.data 打印指定的数据
 * @param options options.index_key 自定义序号key
 * 【注意】：如发现某列打印不出来，检查el-table-column中是否定义label属性
 */
export function printTableData(table_ref, title, print_type = 0, format, ignore_row = ["操作"], options) {
	const header = [];
	let body_data;
	if (print_type) { // 兼容以前传布尔值的写法
		if (print_type === 2 && options?.data && options?.data instanceof Array) {
			body_data = options.data;
		} else {
			body_data = table_ref.selection;
		}
	} else {
		body_data = options.data;
		if (options?.tree_key) { // 打印当页需要自行扁平化处理
			body_data = treeToArray(body_data, options.tree_key);
		}
	}

	// 标题 条数
	const top_content = `<div style="display: flex;justify-content: space-between;margin-bottom: 20px;">
							<span style="visibility: hidden">占位</span>
							<span>${title}</span>
							<span>共：${body_data.length}条</span>
						</div>`;

	table_ref.$scopedSlots.default().forEach((VNode) => {
		const {isComment, componentOptions} = getElTableColumn(VNode);
		const propsData = componentOptions?.propsData;
		if (propsData && !isComment && propsData.label && !ignore_row.includes(propsData.label)) {
			header.push({
				...propsData,
				handler: format && format[propsData.prop] || propsData.formatter || null
			});
		}
	});

	let table = "<table style=\"width:100%;text-align:left\"><tr>";
	header.map(item => {
		table += `<td>${item.label}</td>`;
	});
	table += "</tr>";

	body_data.map((row, x) => {
		table += "<tr>";
		header.map(col => {
			if (col.label === "序号") {
				const index = options?.index_key ? (row[options.index_key] || "") : x + 1;
				table += `<td>${index}</td>`;
			} else {
				// 格式化内容
				table += `<td style="max-width: 600px;">${col.handler ? col.handler(row, col, row[col.prop]) : row[col.prop] || ""}</td>`;
			}
		});
		table += "</tr>";
	});
	table += "</table>";

	const content = top_content + table;
	printTable(content);
}
