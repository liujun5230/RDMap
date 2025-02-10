import {shallowRef, computed} from "vue";
import {defineStore} from "pinia";
import {debounce} from "lodash-es";

import {base_url} from "@/Config";
import {getBaseType, type BSTypeInfo} from "@/api/deviceManage/type";
import {getIconList, type GetIconListRow} from "@/api/characterModel/icon";

export const useTypeIconStore = defineStore("type-icon-store", () => {
	const base_type_list = shallowRef<BSTypeInfo[]>([]);
	const tag_icon_list = shallowRef<GetIconListRow[]>([]);

	const device_icon_obj = computed(() => {
		return base_type_list.value.reduce((result, item) => {
			result[`5-${item.id}`] = base_url + item.icon_model_attr.model_2d_url;
			return result;
		}, {} as Record<string, string>);
	});

	const fetch = debounce(async () => {
		const res_base = await getBaseType().catch(() => undefined);
		if (res_base?.data?.type === 1) {
			base_type_list.value = res_base.data.result.data;
		}
	}, 1000, {
		leading: true,
		trailing: false
	});

	const fetchTagIconData = async () => {
		const {data: res} = await getIconList({filter_things_type_list: [6], is_custom: 0}).catch(() => ({data: undefined}));
		if (res?.type === 1) {
			tag_icon_list.value = res.result.data;
		}
	};

	return {
		device_icon_obj,
		tag_icon_list,
		fetch,
		fetchTagIconData
	};
});
