import {useDetailDialogStore, DetailDialogCategoryEnum, useAreaStore} from "@index/store";

import type {AreaItem} from "../constant";

export function onAreaDetailDialog(item: AreaItem) {
	const {area_id} = item;

	const {area_group_name, area_type_name, name, area_group_id} = useAreaStore().area_id_info[area_id];
	const {setProps, toggleVisible} = useDetailDialogStore();

	setProps(DetailDialogCategoryEnum.AREA_NAME, {
		title: name,
		direction: "rtl",
		areas: {
			[area_group_id ?? -1]: [area_id]
		},
		area_group_name,
		area_type_name
	});
	toggleVisible(DetailDialogCategoryEnum.AREA_NAME, true);
}
