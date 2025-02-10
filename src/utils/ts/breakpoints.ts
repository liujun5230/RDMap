import {useMediaQuery} from "@vueuse/core";
export const small = useMediaQuery("(height < 848px)");
export const medium = useMediaQuery("(height >= 848px) and (height < 1204px)");
export const large = useMediaQuery("(height >= 1204px)");

