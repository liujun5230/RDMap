<template>
<div class="dialog-loading">
	<img
		class="loading-img"
		:src="theme === 'blue' ? LoadingBlue : LoadingGreen"
		alt="加载中"
	>
	<span :class="theme === 'blue' ? 'blue-text' : 'green-text'">加载中...</span>
</div>
</template>
<script setup>
import store from "@/store/index";
import LoadingBlue from "@/assets/images/common/loading_blue.png";
import LoadingGreen from "@/assets/images/common/loading_green.png";

const theme = store.getters.user_info.theme === "custom-theme-blue" ? "blue" : "green";

</script>
<style scoped>
@keyframes loading {
	100% {
		transform: rotate(360deg);
	}
}
.dialog-loading {
    height: calc(100vh - 202px);
    display: flex;
    flex-direction: column;
	justify-content: center;
	align-items: center;
    gap: 8px;
}

@media screen and (height >=930px) {
	.dialog-loading{
		height: 728px;
	}
}

.loading-img {
    width: 24px;
	height: 24px;
	margin-right: 10px;
	color: #a2b2c2;
	animation: loading 3s linear infinite;
}
.blue-text {
    color:#3995FF;
}

.green-text {
    color:#3EB2A9;
}
</style>
