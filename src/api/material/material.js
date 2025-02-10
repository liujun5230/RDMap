import request from "@/utils/js/request";

/**
 * 获取物资类型
 */
export const getMaterialType = () => request({
	url: "/EHCommon/material/Material/getMaterialType",
	method: "post"
});

// 删除物资类型
export const deleteMaterialType = data => request({
	url: "/EHCommon/material/Material/deleteMaterialType",
	method: "post",
	data
});

// 新增物资类型
export const addMaterialType = data => request({
	url: "/EHCommon/material/Material/addMaterialType",
	method: "post",
	data
});

// 编辑物资类型
export const editMaterialType = data => request({
	url: "/EHCommon/material/Material/editMaterialType",
	method: "post",
	data
});

// 查询物资
export const getMaterial = data => request({
	url: "/EHCommon/material/Material/getMaterial",
	method: "post",
	data
});

// 删除物资
export const deleteMaterial = data => request({
	url: "/EHCommon/material/Material/deleteMaterial",
	method: "post",
	data
});

// 新增物资
export const addMaterial = data => request({
	url: "/EHCommon/material/Material/addMaterial",
	method: "post",
	data
});

// 编辑物资
export const editMaterial = data => request({
	url: "/EHCommon/material/Material/editMaterial",
	method: "post",
	data
});

// 导入物资
export const importMaterial = data => request({
	url: "/EHCommon/material/Material/importMaterial",
	method: "post",
	data
});

// 导出物资
export const exportMaterial = data => request({
	url: "/EHCommon/material/Material/exportMaterial",
	method: "post",
	responseType: "blob",
	data
});

// 编辑物资卡号
export const changeMaterialCard = data => request({
	url: "/EHCommon/material/Material/changeMaterialCard",
	method: "post",
	data
});

// 解绑物资
export const unbindMaterial = data => request({
	url: "/EHCommon/material/Material/unbindMaterial",
	method: "post",
	data
});

// 首页信息详情查询物资
export const getMaterialByCardId = data => request({
	url: "/EHCommon/material/Material/getMaterialByCardId",
	method: "post",
	data
});

// 批量删除物资
export const batchDeleteMaterial = data => request({
	url: "/EHCommon/material/Material/batchDeleteMaterial",
	method: "post",
	data
});

// 批量修改物资类型
export const batchChangeMaterialType = data => request({
	url: "/EHCommon/material/Material/batchChangeMaterialType",
	method: "post",
	data
});

// 物资类型排序
export const orderMaterialType = data => request({
	url: "/EHCommon/material/Material/orderMaterialType",
	method: "post",
	data
});

export const checkMaterialName = data => request({
	url: "/EHCommon/material/Material/checkMaterialName",
	method: "post",
	data
});

export const checkMaterialTypeName = data => request({
	url: "/EHCommon/material/Material/checkMaterialTypeName",
	method: "post",
	data
});
