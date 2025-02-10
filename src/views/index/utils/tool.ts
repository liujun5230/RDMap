import type {AxiosResponse} from "axios";
import {Notification} from "element-ui";

export function startViewTransition(callback: () => any) {
	// @ts-ignore
	if (!document.startViewTransition) {
		callback();
		return;
	}

	// @ts-ignore
	document.startViewTransition(callback);
}

export type Options = {
  success_title: string
  success_desc: string
  error_desc?: string
  error_title?: string
}

export function notify(resp: AxiosResponse<any>, options: Options) {
	const {
		success_desc,
		success_title,
		error_desc,
		error_title,
	} = options;
	return new Promise((resolve, reject) => {
		if (resp.data.type === 1) {
			Notification.success({
				title: success_title,
				message: success_desc,
			});
			resolve(resp.data);
			return;
		}
		Notification.error({
			title: error_title || "错误",
			message: error_desc || resp.data.result,
		});
		reject(resp.data);
	});
}

export function BooleanFilter<T>(value: T): value is Exclude<T, false | null | undefined | "" | 0> {
	return Boolean(value);
}

export function removeColorAlpha(str: string) {
	if (str.startsWith("rgba")) {
		return str.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/, "rgb($1, $2, $3)");
	}

	if (str.startsWith("hsla")) {
		return str.replace(/hsla\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/, "hsl($1, $2, $3)");
	}

	if (str.startsWith("#")) {
		return str.slice(0, 7);
	}

	return str;
}

export function getAlphaFromColor(color: string) {
	if (color.startsWith("rgba")) {
		const rgba = color.replace("rgba(", "").replace(")", "").replace(" ", "").split(",").map(Number);
		return rgba[3];
	}

	if (color.startsWith("hsla")) {
		const hsla = color.replace("hsla(", "").replace(")", "").replace(" ", "").split(",").map(Number);
		return hsla[3];
	}

	if (color.startsWith("#") && color.length === 9) {
		return color.length === 9 ? parseInt(color.slice(7, 9), 16) / 255 : 255;
	}

	return 1;
}

export function addStatus(current_status: number, new_status: number): number {
	return current_status | new_status;
}

export function removeStatus(current_status: number, status_to_remove: number): number {
	return current_status & ~status_to_remove;
}

export function hasStatus(current_status: number, status_to_check: number): boolean {
	return (current_status & status_to_check) !== 0;
}
