import {useLocalStorage} from "@vueuse/core";

export const LOCATION_KEY = "locations";

export type JumpPayload ={type?: string, result?:Array<{floor_id: number, device_id: string | number | undefined}>}

let locations = useLocalStorage<JumpPayload|null>(LOCATION_KEY, null);

export function useLocationJump() {
	locations = useLocalStorage<JumpPayload|null>(LOCATION_KEY, null);

	const clear = () => {
		locations.value = null;
	};

	return {
		locations,
		clear
	};
}
