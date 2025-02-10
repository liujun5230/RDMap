
const store = {
	person: -1,
	truck: -1,
	material: -1,
	unit: -1,
	contractor: -1
};

/**
 * 获取/设置员工、车辆、承包商单位、承包商人员、物资选择的部门/类型 id
 * @param {"person" | "truck" | "material" | "unit" | "contractor"} type
 */
type StoreKeys = keyof typeof store;

export const useSelectedType = (type:StoreKeys) => {
	const getTypeId = () => store[type];

	const setTypeId = (id:number) => {
		store[type] = id;
	};

	return {
		getTypeId,
		setTypeId
	};
};
