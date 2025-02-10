import {ref} from "vue";
import {setArchiveConfig, getArchiveConfig} from "@/api/archives/archives";
import {resolveCustomText} from "@/store/modules/featureFlags";

export type DisplayDataType = {
	name: string;
	field: string;
	selectable: boolean;
	disabled_drop: boolean;
	is_display: boolean;
}

const allDisplaySettingJson = ref<{[key:number]:DisplayDataType[]}>({});

export function useDisplaySetting() {
	const getAllDisplaySetting = async () => {
		const {data: {type, result}} = await getArchiveConfig();
		if (type === 1) {
			allDisplaySettingJson.value = JSON.parse(result);
		}
	};
	const setDisplaySetting = (setting_data:DisplayDataType[], utype:number) => {
		allDisplaySettingJson.value[utype] = setting_data;
		return setArchiveConfig({config: JSON.stringify(allDisplaySettingJson.value), utype});
	};
	const getDisplaySettingData = (utype:number) => {
		return allDisplaySettingJson.value[utype]?.map(item => {
			if (item.field === "pit_data") item.name = resolveCustomText("pit") + "数据";
			return item;
		});
	};

	return {
		getDisplaySettingData,
		getAllDisplaySetting,
		setDisplaySetting
	};
}
