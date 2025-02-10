import {watch, ref, computed, shallowRef} from "vue";

import type {TableSortOrder} from "@/types/global";

export type UseTablePageOptions = {
	init_page?: number,
	init_limit?: number,
	init_total?: number
}
/**
 * 使用该api，应避免在ElPagination组件使用sync修饰符
 * @param fetch 请求数据方法
 */
export function useTablePage(fetch: (...args: any[]) => any, options?: UseTablePageOptions) {
	const {init_page = 1, init_limit = 20, init_total = 0} = options ?? {};
	const pages = ref({
		page: init_page,
		limit: init_limit,
		total: init_total
	});

	const changePage = (page: number) => {
		pages.value.page = page;
		fetch();
	};

	const changeLimit = (limit: number) => {
		pages.value.limit = limit;
	};

	// 处理当前页码大于总的页码
	const handlePageShrink = (total: number, limit: number) => {
		const new_page = Math.ceil(total / limit) || 1;
		if (pages.value.page > new_page) {
			pages.value.page = new_page;
			fetch();
			return true;
		}
		return false;
	};

	watch(() => pages.value.total, (new_total) => {
		handlePageShrink(new_total, pages.value.limit);
	});
	watch(() => pages.value.limit, (new_limit) => {
		const is_page_shrink = handlePageShrink(pages.value.total, new_limit);
		if (!is_page_shrink) fetch();
	});

	return {
		pages,
		changePage,
		changeLimit
	};
}

type UseTableSort = {
	asc_value?: string,
	desc_value?: string
}
export function useTableSort(fetch: (...args: any[]) => any, options?: UseTableSort) {
	const {asc_value = "ASC", desc_value = "DESC"} = options ?? {};
	const sort = shallowRef<TableSortOrder>({
		prop: "",
		order: null
	});

	const sort_field = computed(() => {
		return {
			field: sort.value.order ? sort.value.prop : undefined,
			order: sort.value.order ? sort.value.order === "ascending" ? asc_value : desc_value : undefined
		};
	});

	const changeSort = ({prop, order}: TableSortOrder) => {
		sort.value = {prop, order};
		fetch();
	};

	return {
		sort_field,
		changeSort
	};
}
