<template>
<div :class="[{'is-active': isActive}, 'sidebar-bottom']">
	<span :class="[{'is-active': isActive}, 'app-version']">
		<span
			:title="custom_version || version"
			@click="copy(custom_version || version)"
		>{{ custom_version || version }}</span>
		<fk-icon
			v-if="custom_version && version"
			:tip="version_tip"
		>
			<icon-header-question />
		</fk-icon>
	</span>
	<el-button
		:class="[{'is-active': isActive}, 'sidebar-button']"
		size="small"
		type="text"
		@click="toggleClick"
	>
		<i
			class="hg-icons"
			:class="{'hg-icon-left':!isActive,'hg-icon-right':isActive}"
		/>
	</el-button>
</div>
</template>

<script>
import {mapGetters} from "vuex";
import IconHeaderQuestion from "~icons/operation/header-question";
import {useClipboard} from "@vueuse/core";

import FkIcon from "../ForThink/FkIcon.vue";

export default {
	name: "SideBarButton",
	components: {
		FkIcon,
		IconHeaderQuestion
	},
	props: {
		isActive: {
			type: Boolean,
			default: true
		}
	},

	setup() {
		const {copy} = useClipboard({legacy: true});
		return {
			copy
		};
	},

	computed: {
		...mapGetters(["version"]),
		...mapGetters(["custom_version"]),
		version_tip() {
			return this.version ? `基于 ${this.version} 分支` : "";
		}
	},
	watch: {
		version: {
			handler() {
				console.debug(`定制: ${this.custom_version}
通用: ${this.version}`);
			},
			immediate: true
		}
	},
	methods: {
		toggleClick() {
			this.$emit("toggle-click");
		}
	}
};
</script>

<style scoped>
.sidebar-bottom {
	display: flex;
	justify-content: space-between;
	height: 38px;
	box-sizing: border-box;
}

.sidebar-bottom.is-active {
	justify-content: center;
}

.sidebar-button.el-button {
	width: 40px;
	height: 30px;
	color: #A2B2C2;
	margin: 4px 6px 4px 0 !important;
	padding: 0 !important;
	box-shadow: none;
	transition: all ease-in-out 0.3s;
}

.sidebar-button.el-button i {
	font-size: 12px;
}

.is-active.sidebar-button {
	margin-right: 0 !important;
	transition: all 0.3s;
}

.app-version {
	font-size: 14px;
	margin-left: 20px;
	color: #A2B2C2;
	align-self: center;
	line-height: 1.5;
	text-align: center;
	vertical-align: baseline;
	overflow: hidden;

	span {
		cursor: copy;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	display: flex;
	align-items: center;
}

.app-version.is-active {
	display: none;
}

.sidebar-bottom .el-button.is-active, .el-button.is-plain:active {
	border: none;
}
</style>
