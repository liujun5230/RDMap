interface EachTreeOptions {
	children_key: string
}
/**
 * 遍历树形结构转
 */
export function eachTree<T extends Record<string, any>, N extends T = T>(
	tree_data: T[],
	callback?: (node: T | N, parent?: T | N) => T | N,
	options?: EachTreeOptions
) {
	const {children_key = "children"} = options ?? {};

	const expanded = (tree: T[], parent?: T | N) => {
		tree.forEach((node) => {
			const children = node[children_key];
			const new_node = callback?.(node, parent);
			if (Array.isArray(children) && children.length) {
				expanded(children, new_node);
			}
		});
	};

	expanded(tree_data);

	return tree_data as N[];
}
