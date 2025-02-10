// 根据动态表单提供的icon_id字段值，确定接口所需要的icon_follow_type值（表单提交时需要）
export function getIconFollowTypeByDynamicIconId(value) {
	const type_map = {
		"-1": 1, // 跟随三维
		"-2": 2, // 跟随部门
		"-3": 3, // 跟随类型
		"-4": 4, // 跟随单位
	};
	if ([-1, -2, -3, -4].includes(+value)) {
		return type_map[value];
	} else {
		return 0; // 不跟随
	}
}

// 根据动态表单提供的model_id字段值，确定接口所需要的model_follow_type值（表单提交时需要）
export function getModelFollowTypeByDynamicModelId(value) {
	const type_map = {
		"-2": 2, // 跟随部门
		"-3": 3, // 跟随类型
		"-4": 4 // 跟随单位
	};
	if ([-2, -3, -4].includes(+value)) {
		return type_map[value];
	} else {
		return 0; // 不跟随
	}
}

// 根据动态表单提供的icon_id字段值，确定接口所需要的icon_id值（表单提交时需要）
export function getIconIdByDynamicIconId(value) {
	if ([-1, -2, -3, -4].includes(+value)) {
		return 0; // 不取具体的值，表示跟随
	} else {
		return value; // 不跟随
	}
}

// 根据动态表单提供的model_id字段值，确定接口所需要的model_id值（表单提交时需要）
export function getModelIdByDynamicModelId(value) {
	if ([-2, -3, -4].includes(+value)) {
		return 0; // 不取具体的值，表示跟随
	} else {
		return value; // 不跟随
	}
}

// 根据接口提供的icon_follow_type字段值，确定动态表单中所需要的icon_id值（生成动态表单时需要）
export function getDynamicIconIdByIconFollowType(icon_follow_type, icon_id) {
	if ([1, 2, 3, 4].includes(+icon_follow_type)) {
		return -icon_follow_type; // 指定的跟随类型
	} else {
		return icon_id; // 不跟随
	}
}

// 根据接口提供的model_follow_type字段值，确定动态表单中所需要的model_id值（生成动态表单时需要）
export function getDynamicModelIdByModelFollowType(model_follow_type, model_id) {
	if ([2, 3, 4].includes(+model_follow_type)) {
		return -model_follow_type; // 指定的跟随类型
	} else {
		return model_id; // 不跟随
	}
}
