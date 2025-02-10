import {z} from "zod";
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {getEvacuateStat} from "@/api/realtime/realTime";
import {useAsyncState, useThrottleFn, useEventBus} from "@vueuse/core";
import {getEvacuateRecordId} from "@/api/realtime/Evacuate";
import {EVACUATE_UPDATE_PROGRESS_KEY} from "@/events";

const EmergencyObjScheme = z.object({
	evacuate_rate: z.number(),
	evacuate_start_time: z.number(),
	server_time: z.number(),
	evacuate_end_time: z.number().nullable(),
	total_obj_count: z.number(),
	accident_obj_count: z.number(),
	accident_obj_uuids: z.array(z.number()),
	evacuate_obj_count: z.number(),
	evacuate_obj_uuids: z.array(z.number()),
	security_obj_count: z.number(),
	security_obj_uuids: z.array(z.number()),
	accident_area_ids: z.array(z.number()),
	accident_scene_ids: z.array(z.number()),
	accident_is_all_map: z.number(),
	evacuate_area_ids: z.array(z.number()),
	evacuate_scene_ids: z.array(z.number()),
	evacuate_is_all_map: z.number(),
	security_area_ids: z.array(z.number()),
	security_area_stat: z.array(z.object({
		area_id: z.number(),
		area_name: z.string(),
		count: z.number()
	})),
	evacuate_dynamic: z.array(z.object({
		name: z.string().optional(),
		card_id: z.number().optional(),
		uuid: z.number(),
		utype: z.number(),
		related_info: z.string().optional(),
		dynamic: z.object({
			id: z.number(),
			name: z.string(),
			type: z.number(),
			content: z.string().optional(),
		})
	}))
});

type EmergencyObj = z.infer<typeof EmergencyObjScheme>;

// 获取疏散计划种的疏散对象
export async function fetchData(): Promise<EmergencyObj> {
	const resp = await getEvacuateStat();
	if (resp.data.type === 1) {
		const validate_result = EmergencyObjScheme.safeParse(resp.data.result);
		if (validate_result.success) {
			return validate_result.data;
		}
		console.error(validate_result.error.errors);
	}
	return {} as EmergencyObj;
}

export const useEmergencyStore = defineStore("emergency", () => {
	const state = useAsyncState(fetchData, undefined, {immediate: false, shallow: true, resetOnExecute: false});
	const update = useThrottleFn(async () => {
		state.execute();
		useEventBus(EVACUATE_UPDATE_PROGRESS_KEY).emit();
	}, 1000, true, false,);

	const data = computed(() => state.state.value);
	const apply_obj = computed(() => {
		return new Set([
			...(data.value?.security_obj_uuids || []),
			...(data.value?.accident_obj_uuids || []),
			...(data.value?.evacuate_obj_uuids || [])
		]);
	});

	const security_obj = computed(() => new Set(data.value?.security_obj_uuids));

	const accident_obj = computed(() => new Set(data.value?.accident_obj_uuids));

	const evacuate_obj = computed(() => new Set(data.value?.evacuate_obj_uuids));

	const security_area_stat = computed(() => data.value?.security_area_stat);

	const security_area_ids = computed(() => {
		return new Set(data.value?.security_area_ids);
	});

	const accident_area_ids = computed(() => {
		return new Set(data.value?.accident_area_ids);
	});

	const evacuate_area_ids = computed(() => {
		return new Set(data.value?.evacuate_area_ids);
	});

	const total_obj_count = computed(() => data.value?.total_obj_count ?? 0);

	const accident_obj_count = computed(() => data.value?.accident_obj_count ?? 0);

	const security_obj_count = computed(() => data.value?.security_obj_count ?? 0);

	const evacuate_rate = computed(() => data.value?.evacuate_rate ?? 0);

	const evacuate_start_time = computed(() => data.value?.evacuate_start_time ? data.value.evacuate_start_time * 1000 : undefined);
	const server_time = computed(() => data.value?.server_time ? data.value.server_time * 1000 : undefined);
	const evacuate_end_time = computed(() => data.value?.evacuate_end_time ? data.value?.evacuate_end_time * 1000 : undefined);

	const isEmergencyArea = (area_id: number) => {
		return data.value?.accident_area_ids?.includes(area_id) || data.value?.evacuate_area_ids?.includes(area_id) || data.value?.security_area_ids?.includes(area_id);
	};

	const evacuate_dynamic = computed(() => data.value?.evacuate_dynamic);

	// 当前撤离的应急报告id
	const emergency_record_id = ref(0);
	const fetchEvacuateRecordId = async () => {
		const {data: res} = await getEvacuateRecordId().catch(() => ({data: undefined}));
		if (res?.type === 1) {
			emergency_record_id.value = res.result.id;
		}
	};
	return {
		apply_obj,
		update,
		security_obj,
		accident_obj,
		evacuate_obj,
		security_area_stat,
		security_area_ids,
		accident_area_ids,
		evacuate_area_ids,
		evacuate_rate,
		total_obj_count,
		accident_obj_count,
		security_obj_count,
		evacuate_start_time,
		server_time,
		evacuate_end_time,
		isEmergencyArea,
		evacuate_dynamic,
		emergency_record_id,
		fetchEvacuateRecordId,

		then: state.then,
		isLoading: state.isLoading,
	};
});
