// import {HEX_REG1, HEX_REG2, RGB_REG} from "@/utils/js/constant";

/**
 * 生成随机颜色
 * @param mode light-生成浅色，dark-生成深色
 * @param threshold 阈值
 */
export function getRandomColor(mode: "light" | "dark", threshold = 100) {
	// 生成随机的 R、G、B 分量
	let r = Math.floor(Math.random() * 256);
	let g = Math.floor(Math.random() * 256);
	let b = Math.floor(Math.random() * 256);

	// 计算颜色的亮度，值越大越接近白色
	let brightness = 0.299 * r + 0.587 * g + 0.114 * b;

	const checkBrightness = () => mode === "light" ? brightness < threshold : brightness > threshold;

	// 如果颜色的亮度超过阈值，则重新生成颜色
	while (checkBrightness()) {
		r = Math.floor(Math.random() * 256);
		g = Math.floor(Math.random() * 256);
		b = Math.floor(Math.random() * 256);
		brightness = 0.299 * r + 0.587 * g + 0.114 * b;
	}

	// 返回生成的颜色
	return `rgb(${r},${g},${b})`;
}

export function getUniqueColor(mode: "light" | "dark", existing_colors: string[] | number[][], threshold = 100) {
	let new_color: string = "";
	let is_equal_color = false;

	do {
		new_color = getRandomColor(mode, threshold);
		is_equal_color = existing_colors.some((existing_color) => {
			const real_existing_color = Array.isArray(existing_color) ? existing_color.join(",") : existing_color;
			return new_color === real_existing_color;
		});
	} while (is_equal_color);

	return new_color;
}

// export function getRandomColorWithDifference(mode: "light" | "dark", existing_colors: string[] | number[][], min_difference: number, threshold = 100) {
// 	let new_color: string = "";
// 	let is_different_enough = false;

// 	do {
// 		new_color = getRandomColor(mode, threshold);
// 		is_different_enough = existing_colors.every((color) => calculateColorDifference(new_color, color) >= min_difference);
// 	} while (!is_different_enough);

// 	return new_color;
// }

// export function calculateColorDifference(color1: string | number[], color2: string | number[]) {
// 	const array_color1 = Array.isArray(color1) ? [...color1] : transformColorToArray(color1);
// 	const array_color2 = Array.isArray(color2) ? [...color2] : transformColorToArray(color2);

// 	// 将颜色转换为Lab色彩空间
// 	const lab1 = rgbToLab(array_color1);
// 	const lab2 = rgbToLab(array_color2);

// 	// 计算CIE76差异度
// 	const diff = Math.sqrt(
// 		Math.pow(lab2[0] - lab1[0], 2) + Math.pow(lab2[1] - lab1[1], 2) + Math.pow(lab2[2] - lab1[2], 2)
// 	);

// 	return diff;
// }

// export function rgbToLab(rgb: number[]) {
// 	let r = rgb[0] / 255;
// 	let g = rgb[1] / 255;
// 	let b = rgb[2] / 255;

// 	r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
// 	g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
// 	b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

// 	r *= 100;
// 	g *= 100;
// 	b *= 100;

// 	let x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
// 	let y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
// 	let z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;

// 	x /= 95.047;
// 	y /= 100;
// 	z /= 108.883;

// 	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (903.3 * x + 16) / 116;
// 	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (903.3 * y + 16) / 116;
// 	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (903.3 * z + 16) / 116;

// 	const L = Math.max(0, 116 * y - 16);
// 	const A = (x - y) * 500;
// 	const B = (y - z) * 200;

// 	return [L, A, B];
// }

// export function transformColorToArray(color: string) {
// 	if (HEX_REG1.test(color) || HEX_REG2.test(color)) {
// 		// 去除可能包含的井号（#）
// 		color = color.replace(/^#/, "");

// 		// 将十六进制颜色代码转换为RGB值
// 		const bigint = parseInt(color, 16);
// 		const r = (bigint >> 16) & 255;
// 		const g = (bigint >> 8) & 255;
// 		const b = bigint & 255;

// 		// 返回RGB数组
// 		return [r, g, b];
// 	}

// 	if (RGB_REG.test(color)) {
// 		return color.match(/\d+/g)!.map((val) => parseInt(val));
// 	}

// 	console.error(`无效的十六进制或rgb颜色${color}`);
// 	return [];
// }
