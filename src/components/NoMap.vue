<template>
<div class="no-map">
	<div>
		<div :class="props.icon" />
		<div class="no-map-text">
			暂无地图！请前往<a
				class="theme-color link"
				@click="jumpToFloorManage"
			>地图管理</a>页面添加地图！
		</div>
	</div>
</div>
</template>

<script setup>
import {Notification} from "element-ui";
import locationJump from "@/utils/js/locationHref";
import {computed} from "vue";
import store from "@/store";

const props = defineProps({
	icon: {
		type: String,
		default: "no-map-bg"
	}
});

const auth = computed(() => store.getters.auth);
const floor_manage_auth = computed(() => auth.value && auth.value["/systemManage#/floorManage"]);

const jumpToFloorManage = () => {
	if (!floor_manage_auth.value) {
		Notification({
			type: "error",
			title: "错误",
			message: "暂无权限"
		});
		return;
	}
	locationJump("/systemManage#/floorManage?target=scene");
};
</script>

<style scoped lang="scss">
.no-map {
	position: absolute;
	left: 0;
	top: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	z-index: 999;
	background-color: #fff;
}

.no-map-bg {
	height: 176px;
}

.no-map-search {
	height: 104px;
}

.no-map-text {
	margin-top: 16px;
}

.link {
	text-decoration: underline;
	cursor: pointer;
}

.custom-theme-blue {
	.theme-color {
		color: #3995FF;
	}

	.no-map-bg {
		background: url("@/assets/images/common/map_default_blue.png") no-repeat center;
	}

	.no-map-search {
		background: url("@/assets/images/common/no_map_blue.png") no-repeat center;
	}
}

.custom-theme-green {
	.theme-color {
		color: #3EB2A9;
	}

	.no-map-bg {
		background: url("@/assets/images/common/map_default_green.png") no-repeat center;
	}

	.no-map-search {
		background: url("@/assets/images/common/no_map_green.png") no-repeat center;
	}
}
</style>
