import request from "@/utils/js/request";

/**
 * @method updateCharacter
 * 修改人物模型
 * @param {Object}[data = {}]
 * @param {number}[data.model_id] 人物模型id
 * @param {string}[data.model_name = null] 人物模型名称
 * @param {number}[data.model_type = null] 人物模型类别[1员工 2访客]
 * @param {number}[data.model_sex = null] 人物模型性别[0男 1女]
 * @param {number}[data.model_hat = null] 人物模型帽子类别[1无帽子 2普通帽子 3带矿灯的帽子]
 * @param {number}[data.model_hat_color = null] 人物模型帽子颜色[1黄色 2红色 3白色 4橙色 5蓝色]
 * @param {number}[data.model_clothing = null] 人物模型衣服类别[1日常服 2工厂服 3连帽服]
 * @param {number}[data.model_clothing_color = null] 人物模型衣服颜色, 不同类型的衣服有不同的颜色日常服[1黑色 2白色];工厂服[1蓝色 2深蓝色 3灰色 4橙色];连帽服[1蓝色 2白色]
 * @return {Promise}
 */
export function updateCharacter(data) {
	return request({
		url: "/EHCommon/characterModel/character/updateCharacter",
		method: "post",
		data
	});
}

/**
 * @method deleteCharacter
 * 删除人物模型
 * @param {Object}[data = {}]
 * @param {number}[data.model_id] 人物模型id
 * @return {Promise}
 */
export function deleteCharacter(data) {
	return request({
		url: "/EHCommon/characterModel/character/deleteCharacter",
		method: "post",
		data
	});
}

/**
 * @method batchDeleteCharacter
 * 批量删除人物模型
 * @param {Object}[data = {}]
 * @param {number[]}[data.model_id_list] 人物模型id列表
 * @return {Promise}
 */
export function batchDeleteCharacter(data) {
	return request({
		url: "/EHCommon/characterModel/character/batchDeleteCharacter",
		method: "post",
		data
	});
}

/**
 * @method addCharacter
 * 添加人物模型
 * @param {Object}[data = {}]
 * @param {string}[data.model_name] 人物模型名称
 * @param {number}[data.model_type] 人物模型类别[1员工 2访客]
 * @param {number}[data.model_sex] 人物模型性别[0男 1女]
 * @param {number}[data.model_hat] 人物模型帽子类别[1无帽子 2普通帽子 3带矿灯的帽子]
 * @param {number}[data.model_hat_color] 人物模型帽子颜色[1黄色 2红色 3白色 4橙色 5蓝色]
 * @param {number}[data.model_clothing] 人物模型衣服类别[1日常服 2工厂服 3连帽服]
 * @param {number}[data.model_clothing_color] 人物模型衣服颜色, 不同类型的衣服有不同的颜色日常服[1黑色 2白色];工厂服[1蓝色 2深蓝色 3灰色 4橙色];连帽服[1蓝色 2白色]
 * @return {Promise}
 */
export function addCharacter(data) {
	return request({
		url: "/EHCommon/characterModel/character/addCharacter",
		method: "post",
		data
	});
}

/**
 * @method getCharacterList
 * 获取人物模型列表
 * @param {Object}[data = {}]
 * @param {string}[data.model_name] 人物模型名称
 * @param {number}[data.model_sex] 人物模型性别[-1全部 0男 1女]
 * @param {number}[data.page] 页码
 * @param {number}[data.limit] 页码大小
 * @param {number}[data.with_follow_branch] 是否返回 "跟随部门", 员工使用[0不返回 1返回], 默认为0
 * @return {Promise}
 */
export function getCharacterList(data) {
	return request({
		url: "/EHCommon/characterModel/character/getCharacterList",
		method: "post",
		data
	});
}

/**
 * @method getCharacterUrl
 * 获取人物模型地址
 * @param {Object}[data = {}]
 * @param {string}[data.model_sex] 人物模型性别[0男 1女]
 * @param {number}[data.model_hat] 人物模型帽子类别[1无帽子 2普通帽子 3带矿灯的帽子]
 * @param {number}[data.model_hat_color] 人物模型帽子颜色[1黄色 2红色 3白色 4橙色 5蓝色]
 * @param {number}[data.model_clothing] 人物模型衣服类别[1日常服 2工厂服 3连帽服]
 * @param {number}[data.model_clothing_color] 人物模型衣服颜色, 不同类型的衣服有不同的颜色;日常服[1黑色 2白色];工厂服[1蓝色 2深蓝色 3灰色 4橙色];连帽服[1蓝色 2白色]
 * @return {Promise}
 */
export function getCharacterUrl(data) {
	return request({
		url: "/EHCommon/characterModel/character/getCharacterUrl",
		method: "post",
		data
	});
}

/**
 * @method getCharacterDecoration
 * 获取人物模型装饰品
 * @return {Promise}
 */
export function getCharacterDecoration() {
	return request({
		url: "/EHCommon/characterModel/character/getCharacterDecoration",
		method: "post"
	});
}

export function checkModelName(data) {
	return request({
		url: "/EHCommon/characterModel/character/checkName",
		method: "post",
		data
	});
}
