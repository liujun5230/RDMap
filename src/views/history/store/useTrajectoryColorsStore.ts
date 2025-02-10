import {shallowRef} from "vue";
import {defineStore} from "pinia";

import {getUniqueColor} from "@/utils/js/tools/color";

type TrajectoryColors = Record<number, string>;

export const useTrajectoryColorsStore = defineStore("trajectory-colors-store", () => {
	let existing_colors: string[] = [];
	const trajectory_colors = shallowRef<TrajectoryColors>({});

	const setTrajectoryColors = (uuid_list: number[]) => {
		existing_colors = [];
		trajectory_colors.value = uuid_list.reduce((result: TrajectoryColors, uuid) => {
			const color = getUniqueColor("dark", existing_colors);
			existing_colors.push(color);
			result[uuid] = color;
			return result;
		}, {} as TrajectoryColors);
	};

	return {
		trajectory_colors,
		setTrajectoryColors
	};
});
