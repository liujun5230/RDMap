import {ref} from "vue";
import {getMenu} from "@/api/device/modularCustom";
import {z} from "zod";
import {computed} from "vue";

const menu_schema = z.array(z.object({
	id: z.number(),
	name: z.string(),
	parent_id: z.number(),
	level: z.number(),
	sorting: z.number(),
	type: z.number(),
	is_admin: z.number(),
	access_url: z.string(),
	icon: z.string(),
	is_use: z.number(),
	is_system: z.number(),
}));

export const menu_store = ref<z.infer<typeof menu_schema>>([]);
export const menu_name_map = computed(() => {
	return menu_store.value.reduce((map, item) => {
		map.set(item.access_url, item.name);
		return map;
	}, new Map<string, string>());
});

export async function fetchMenu() {
	const res = await getMenu();
	if (res.data.type === 1) {
		const validate_result = menu_schema.safeParse(res.data.result);
		if (validate_result.success) {
			menu_store.value = validate_result.data;
		} else {
			console.error(validate_result.error.errors);
		}
	}
}
fetchMenu();
