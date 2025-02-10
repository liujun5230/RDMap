import request from "@/utils/js/request";

/**
 * 获取物资字典
 *
 * 提示：如果该接口还没有field字段，调用获取到数据后增加一个field字段，参考 MaterialDictPage 组件
 */
export const getMaterialDict = (data) => request({
	url: "/EHCommon/material/MaterialDict/getMaterialDict",
	method: "post",
	data
});

/**
 * 删除物资字典
 * @param {{id: number}} data 请求参数
 */
export const deleteMaterialDict = (data) => request({
	url: "/EHCommon/material/MaterialDict/deleteMaterialDict",
	method: "post",
	data
});

/**
 * 新增物资字典
 * @param {{
 *  name: number,
 *  sort_number: number,
 *  is_display: 0 | 1,
 *  is_require: 0 | 1,
 *  type: 1 | 2 | 3 | 4 | 5 | 6,
 *  length: number,
 *  name_is_change: 0 | 1,
 *  display_is_change: 0 | 1,
 *  require_is_change: 0 | 1,
 *  type_is_change: 0 | 1,
 *  options: string[]
 * }} data 请求参数
 * @param {number} data.type 字段类型，1-文本，2-图片，3-时间，4-日期，5-单选，6-多选
 * @param {number} data.length 字段限制的长度，-1 表示无限制
 */
export const addMaterialDict = (data) => request({
	url: "/EHCommon/material/MaterialDict/addMaterialDict",
	method: "post",
	data
});

/**
* 编辑物资字典
* @param {{
*  id: number,
*  name: number,
*  is_display: 0 | 1,
*  is_require: 0 | 1,
*  type: 1 | 2 | 3 | 4 | 5 | 6,
*  length: number,
*  name_is_change: 0 | 1,
*  display_is_change: 0 | 1,
*  require_is_change: 0 | 1,
*  type_is_change: 0 | 1,
*  options: {id: number, name: string, sort_number: number}[]
* }} data 请求参数
* @param {number} data.type 字段类型，1-文本，2-图片，3-时间，4-日期，5-单选，6-多选
* @param {number} data.length 字段限制的长度，-1 表示无限制
*/
export const editMaterialDict = (data) => request({
	url: "/EHCommon/material/MaterialDict/editMaterialDict",
	method: "post",
	data
});

/**
 * 调整物资字典位置
 * @param {{order: object}} data 请求参数
 * @param data.order 字典 id 对应的排序号 sort_number 组成的对象
 */
export const sortMaterialDict = (data) => request({
	url: "/EHCommon/material/MaterialDict/order",
	method: "post",
	data
});

export const checkMaterialDictName = (data) => request({
	url: "/EHCommon/material/MaterialDict/checkDictName",
	method: "post",
	data
});
