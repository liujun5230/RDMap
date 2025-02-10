<template>
<div>
	你将在<span style="color: teal"> {{ time }} </span>秒后回到登录页面
</div>
</template>

<script>
import locationJump from "@/utils/js/locationHref";

export default {
	name: "LoginTimeOut",
	data() {
		return {
			time: 5
		};
	},
	mounted() {
		this.backLogin();
	},
	methods: {
		backLogin() {
			let url = "/login";
			if (localStorage.getItem("loginType") === "attendanceCheck") {
				url += "?attendanceCheck";
			}
			const time_clear = setInterval(() => {
				this.time = this.time - 1;
				if (this.time === 0) {
					clearInterval(time_clear);
					locationJump(url);
				}
			}, 1000);
		}
	}
};
</script>

<style scoped>

</style>
