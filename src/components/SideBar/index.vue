<template>
<div :class="[{'is-collapse': isCollapse}, 'app-side-bar']">
	<el-scrollbar
		class="global-scrollbar"
		style="height: calc(100% - 39px);"
	>
		<el-menu
			:collapse="isCollapse"
			class="sidebar-menu"
			:unique-opened="true"
			:default-active="active"
			:default-openeds="opened_submenu"
			style="height: 100%;"
		>
			<side-bar-item
				v-for="(page,index) in menu"
				:key="index"
				:type="page.type"
				:children="page.children"
				:icon="page.icon"
				:name="page.menu_name"
				:url="page.access_url"
			/>
		</el-menu>
	</el-scrollbar>
	<side-bar-button
		:is-active="isCollapse"
		class="toggle-sidebar-button"
		@toggle-click="toggleSideBar"
	/>
</div>
</template>

<script>
import {mapGetters} from "vuex";
import {getDoorServer} from "@/api/configuration/sysConfig";
import SideBarButton from "./SideBarButton.vue";
import SideBarItem from "./SideBarItem.vue";
import "@/utils/css/iconFonts/menuIcon.css";
import "@/utils/css/customThemes/blue.css";
import "@/utils/css/customThemes/green.css";

export default {
	name: "SideBar",
	components: {
		SideBarItem,
		SideBarButton
	},
	computed: {
		...mapGetters([
			"sidebar",
			"user_info",
			"player"
		]),
		isCollapse() {
			return !this.sidebar.open;
		},
		menu() {
			return this.user_info ? this.user_info.menu : undefined;
		},
		active() {
			return this.sidebar.active;
		},
		opened_submenu() {
			return this.sidebar.opened_submenu;
		}
	},

	mounted() {
		document.getElementsByClassName("global-scrollbar")[0].addEventListener("mousewheel", () => {
			setTimeout(() => {
				const position_y = document.getElementsByClassName("global-scrollbar")[0].children[2].children[0].style.transform;
				const scroll_top = document.getElementsByClassName("el-scrollbar__wrap")[0].scrollTop;
				localStorage.setItem("position_y", String(position_y));
				localStorage.setItem("scroll_top", String(scroll_top));
			}, 100);
		});
		document.getElementsByClassName("el-scrollbar__thumb")[1].addEventListener("mouseup", () => {
			const position_y = document.getElementsByClassName("global-scrollbar")[0].children[2].children[0].style.transform;
			const scroll_top = document.getElementsByClassName("el-scrollbar__wrap")[0].scrollTop;
			localStorage.setItem("position_y", String(position_y));
			localStorage.setItem("scroll_top", String(scroll_top));
		});

		if (localStorage.getItem("position_y") && localStorage.getItem("scroll_top")) {
			document.getElementsByClassName("global-scrollbar")[0].children[2].children[0].style.transform = localStorage.getItem("position_y");
			document.getElementsByClassName("el-scrollbar__wrap")[0].scrollTop = Number(localStorage.getItem("scroll_top"));
		}

		// 需要处理页面刷新等情况，进入页面，要设置相关菜单状态
		if (location.pathname + location.hash.split("?")[0] !== "/history#/alarm") {
			this.changeMenu();
		}
		getDoorServer().then(res => {
			if (res.data.type === 1) {
				const door_web_server = res.data.result.only_door_web_server;
				localStorage.setItem("door_web_server", door_web_server);
			}
		});

		window.addEventListener("popstate", () => {
			this.changeMenu();
		}, false);
	},
	methods: {
		getParentMenuFromAccessUrl(url) {
			for (const i in this.menu) {
				if (this.menu[i].children === undefined) continue;

				for (const m in this.menu[i].children) {
					if (this.menu[i].children[m].access_url === url) {
						return this.menu[i].access_url;
					}
				}
			}
		},

		getMenuInfo() {
			if (location.pathname === "/custom") {
				const path = decodeURIComponent(location.hash);
				const access_url = path.substring(path.search("=") + 1);
				return {url: access_url, sub_menu_index: this.getParentMenuFromAccessUrl(access_url)};
			} else {
				const url = location.pathname + location.hash.split("?")[0];
				const sub_menu_index = location.pathname;
				return {url, sub_menu_index};
			}
		},

		toggleSideBar() {
			this.$store.dispatch("app/toggleSideBar");
		},

		changeMenu() {
			if (!this.player) {
				this.$store.dispatch("app/changePage", this.getMenuInfo());
			}
		}
	},
};
</script>

<style>
@import "@/utils/css/customThemes/variables.css";

.app-side-bar {
	width: 216px;
	height: 100%;
	max-height: 100%;
	background-color: #fff;
	transition: width 0.3s;
}

.global-scrollbar .el-scrollbar__wrap {
	overflow: auto;
	margin-bottom: -17px !important;
	margin-right: -17px !important;
}

.el-scrollbar__wrap.default-scrollbar__wrap {
	overflow-x: auto;
}

.is-collapse.app-side-bar {
	width: 68px;
	transition: width ease-in-out 0.3s;
}

.sidebar-menu:not(.el-menu--collapse) {
	width: 216px;
}

.toggle-sidebar-button {
	border-top: 1px solid #EFF3F6;
}

/* 因为自动生成sidebar-item，破坏了element ui菜单的一些结构，多添加了一层div，故将原来的一些子选择器改为后代选择器*/
.el-menu--collapse .el-menu-item .el-submenu__icon-arrow, .el-menu--collapse .el-submenu .el-submenu__title .el-submenu__icon-arrow {
	display: none;
}

.sidebar-menu.el-menu--collapse.el-menu {
	width: 68px;
}

.el-menu--collapse .el-menu-item span,
.el-menu--collapse .el-submenu .el-submenu__title span {
	height: 0;
	width: 0;
	overflow: hidden;
	visibility: hidden;
	display: inline-block;
}

.el-submenu__title i,
.el-submenu__title,
.el-menu-item,
.el-menu-item i,
.el-submenu {
	color: var(--menu-text-color) !important;
}

.el-submenu__title {
	padding: 0 16px 0 24px !important;
}

.el-menu-item i,
.el-submenu__title i {
	padding-right: 8px;
	color: var(--menu-text-color);
}

.el-menu-item.is-active,
.el-submenu.is-active .el-submenu__title span,
.el-submenu.is-active .el-submenu__title i {
	color: var(--theme-color) !important;
}

.custom-theme-blue .el-menu-item:focus,
.custom-theme-green .el-menu-item:focus {
	background-color: #F5F8FA !important;
}

.el-menu-item.is-active,
.el-submenu.is-active .el-submenu__title span,
.el-submenu.is-active .el-submenu__title i {
	padding-right: 8px;
}

.el-menu-item.is-active {
	border-left: 3px solid var(--theme-color);
}

.el-menu-item.is-active {
	background-color: #F5F8FA;
}

.el-submenu .el-menu-item.is-active {
	padding-left: 38px !important;
}

.el-submenu .el-menu-item {
	padding-left: 41px !important; /* 减去3px的border */
}

.el-submenu.is-opened > .el-submenu__title .el-submenu__icon-arrow {
	padding-left: 8px;
}

.el-dropdown-menu {
	padding: 4px 0;
}

.el-menu--popup {
	min-width: 146px !important;
}
</style>
