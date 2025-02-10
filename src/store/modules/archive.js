const state = {
	archive_type: "",
	archive_uuid: 0,
	archive_card: 0,
	archive_device_uuid: "",
	all_archive_status: [],
	archive_add_type: ""
};

function setArchivesStatus(key, value) {
	if (state.all_archive_status.length) {
		const obj = state.all_archive_status[state.all_archive_status.length - 1];
		obj[key] = value;
	}
}

const mutations = {
	SET_ARCHIVE_ADD_TYPE: (state, value) => {
		state.archive_add_type = value;
	},
	SET_ARCHIVE_TYPE: (state, value) => {
		state.archive_type = value;
	},
	SET_ARCHIVE_UUID: (state, value) => {
		state.archive_uuid = value;
	},
	SET_ARCHIVE_CARD: (state, value) => {
		state.archive_card = value;
	},
	SET_ARCHIVE_DEVICE_UUID: (state, value) => {
		state.archive_device_uuid = value;
	},

};

const actions = {
	setArchiveAddType({commit}, type) {
		commit("SET_ARCHIVE_ADD_TYPE", type);
		setArchivesStatus("archive_add_type", type);
	},
	setArchiveType({commit}, type) {
		commit("SET_ARCHIVE_TYPE", type);
		setArchivesStatus("archive_type", type);
	},
	setArchiveUuid({commit}, uuid) {
		commit("SET_ARCHIVE_UUID", uuid);
		setArchivesStatus("archive_uuid", uuid);
	},
	setArchiveCard({commit}, card) {
		commit("SET_ARCHIVE_CARD", card);
		setArchivesStatus("archive_card", card);
	},
	setArchiveDeviceUuid({commit}, uuid) {
		commit("SET_ARCHIVE_DEVICE_UUID", uuid);
		setArchivesStatus("archive_device_uuid", uuid);
	},
	pushArchivesStatus() {
		const {archive_type, archive_add_type, archive_uuid, archive_card, archive_device_uuid} = state;
		state.all_archive_status.push({archive_type, archive_add_type, archive_uuid, archive_card, archive_device_uuid});
	},
	popArchivesStatus({commit}) {
		state.all_archive_status.pop();
		const {archive_type, archive_uuid, archive_add_type, archive_card, archive_device_uuid} = state.all_archive_status.length ? state.all_archive_status[state.all_archive_status.length - 1] : {};
		commit("SET_ARCHIVE_ADD_TYPE", archive_add_type);
		commit("SET_ARCHIVE_TYPE", archive_type);
		commit("SET_ARCHIVE_UUID", archive_uuid);
		commit("SET_ARCHIVE_CARD", archive_card);
		commit("SET_ARCHIVE_DEVICE_UUID", archive_device_uuid);
	}
};

export default {
	namespaced: true,
	state,
	mutations,
	actions
};
