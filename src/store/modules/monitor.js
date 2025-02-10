import {getEnum} from "@/api/monitor/device";

const state = {
	operator_enum: [],
	cmd_enum: [],
};

const mutations = {
	SET_OPERATOR_ENUM: (state, value) => {
		state.operator_enum = value;
	},
	SET_CMD_ENUM: (state, value) => {
		state.cmd_enum = value;
	},
};

const actions = {
	async setEnum({commit}) {
		const resp = await getEnum();
		if (resp.data.type === 1) {
			const {operator, cmd} = resp.data.result;
			commit("SET_OPERATOR_ENUM", operator);
			commit("SET_CMD_ENUM", cmd);
		}
	}
};

export default {
	namespaced: true,
	state,
	mutations,
	actions
};

