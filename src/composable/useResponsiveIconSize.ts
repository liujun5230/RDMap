import {computed} from "vue";

import {small} from "@/utils/ts/breakpoints";

type IconType = "circle_icon";
type IconSizeType = "small" | "default";
type IconSizeList = {
  [key in IconType]: number
}
type IconSizeConfig = {
  [key in IconType]: {
    [key in IconSizeType]: number;
  }
}
export function useResponsiveIconSize() {
	return computed(() => {
		const size_list = {
			circle_icon: {
				// small: 16,
				small: 20,
				default: 20
			}
		} satisfies IconSizeConfig;

		const icon_size_list: IconSizeList = {
			circle_icon: size_list.circle_icon.default
		};

		const size_key = small.value ? "small" : "default";
		return Object.entries(size_list).reduce((acc, [key, value]) => {
			acc[key as IconType] = value[size_key as IconSizeType];
			return acc;
		}, icon_size_list);
	});
}
