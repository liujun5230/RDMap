import {computed} from "vue";
import {usePageAuth} from "@/utils/js/authentication";

export const useThingsInfoAuth = (url:string) => {
	return {
		things_show_auth: usePageAuth(url).value.check,
		index_show_auth: usePageAuth("/").value.check,
		device_show_auth: usePageAuth("/deviceManage#/status").value.check,
		history_show_auth: usePageAuth("/history#/person").value.check,
		card_handle_auth: usePageAuth("/deviceManage#/setting").value.handle
	};
};

export const useHealthyAuth = () => computed(() => usePageAuth("/healthy#/info").value.handle);

export const useThingsHandleAuth = (url:string) => usePageAuth(url || "/deviceManage#/setting").value.handle;

export const useContractorUnitHandleAuth = () => computed(() => usePageAuth("/contractorManage#/contractorUnit").value.handle);

export const useDeviceInfoAuth = () => {
	return computed(() => ({
		index_show_auth: usePageAuth("/").value.check,
		device_setting_show_auth: usePageAuth("/deviceManage#/setting").value.check,
	}));
};

export const useDeviceHandleAuth = () => computed(() => usePageAuth("/deviceManage#/setting").value.handle);

export const useEmergencyHandleAuth = () => computed(() => usePageAuth("/emergencyManage#/emergencyReport").value.handle);
