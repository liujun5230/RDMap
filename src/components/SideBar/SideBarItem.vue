<template>
<div v-if="type > 0">
	<el-menu-item
		v-if="children.length === 0"
		:style="{height: isChild?'46px':'56px',lineHeight:isChild?'46px':'56px',paddingLeft:isChild?'54px':'24px',fontSize:isChild?'14px':'16px',fontWeight:isChild?400:700}"
		:index="url"
		:class="{my_color:player}"
		@click="jump(url, subMenuIndex, type)"
	>
		<i :class="[icon, 'hg-icons']" />
		<span slot="title">{{ name }}</span>
	</el-menu-item>

	<el-submenu
		v-else
		:index="url"
	>
		<template #title>
			<i :class="[icon, 'hg-icons']" />
			<span slot="title">{{ name }}</span>
		</template>
		<side-bar-item
			v-for="(page,index) in children"
			:key="index"
			icon=""
			:type="page.type"
			:children="page.children"
			:name="page.menu_name"
			:url="page.access_url"
			:sub-menu-index="url"
			:is-child="true"
		/>
	</el-submenu>
</div>
</template>

<script>
import locationJump from "@/utils/js/locationHref";
import {mapGetters} from "vuex";
import {real_time_route_name} from "@/Config";
import FkMessageBox from "@/components/ForThink/FkMessageBox";

export default {
	name: "SideBarItem",
	props: {
		name: {
			type: String,
			required: true
		},
		url: {
			type: String,
			required: true
		},
		type: {
			type: Number,
			required: true
		},
		icon: {
			type: String,
			required: true
		},
		subMenuIndex: {
			default: "",
			type: String,
			required: false
		},
		children: {
			type: Array,
			default: function () {
				return [];
			}
		},
		isChild: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		...mapGetters([
			"sidebar",
			"user_info",
			"player",
			"video_download",
			"config_page_is_edit"
		]),

	},
	methods: {
		jump(url, sub_menu_index, type) {
			const menu_info = this.user_info.menu.find(item => item.access_url === "/alarm");
			if (url === "/alarm#/door" || (menu_info?.children?.length === 2 && url === "/alarm#/equip")) {
				this.$store.dispatch("app/changePage", {url, sub_menu_index});
				const server = localStorage.getItem("door_web_server") || "http://" + window.location.hostname + ":8002";
				const jump_url = server + (url === "/alarm#/door" ? "/alarm#/" : "/equipFault#/") + "?HJCloud=a9ab35894b21d6dff478a8df598099f1";
				setTimeout(() => {
					const origin_url = window.location.pathname + window.location.hash;
					this.$store.dispatch("app/changePage", {url: origin_url, sub_menu_index: window.location.pathname});
				}, 100);
				window.open(jump_url, 1);
				return;
			}
			if (!sub_menu_index) {
				url = url === "/" ? url : `http://${url}/`;
			}
			if (this.player) {
				this.$msgbox.confirm("是否确定离开当前页面？", "离开提示", {
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					closeOnClickModal: false,
					type: "warning"
				}).then(() => {
					this.$store.dispatch("user/changePlayer", false);
					window.onbeforeunload = null;
					if (type === 1) {
						this.$store.dispatch("app/changePage", {url, sub_menu_index});
						locationJump(url);
					} else {
						this.$store.dispatch("app/changePage", {url, sub_menu_index});
						locationJump("/custom#/embed?url=" + url);
					}
				}).catch(() => {
					this.$store.dispatch("app/changePage", {url: real_time_route_name, sub_menu_index: "/display"});
				});
			} else if (this.video_download) {
				this.$msgbox.confirm("视频下载中，是否终止下载？", "终止下载", {
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					closeOnClickModal: false,
					type: "warning"
				}).then(() => {
					this.$store.dispatch("user/changeVideoDownload", false);
					window.onbeforeunload = null;
					if (type === 1) {
						this.$store.dispatch("app/changePage", {url, sub_menu_index});
						locationJump(url);
					} else {
						this.$store.dispatch("app/changePage", {url, sub_menu_index});
						locationJump("/custom#/embed?url=" + url);
					}
					window.location.reload(); // 解决视频打包完成开始下载后切换至同目录下的二级菜单不会终止下载的问题
				}).catch(() => {
					this.$store.dispatch("app/changePage", {
						url: window.location.pathname + window.location.hash,
						sub_menu_index: window.location.pathname
					});
				});
			} else if (this.config_page_is_edit) {
				this.$store.dispatch("app/changePage", {url, sub_menu_index});
				FkMessageBox.confirm(
					"提示",
					"确定离开此页面?",
					"有更改尚未保存，离开后将丢失当前编辑的内容",
					{
						confirmButtonText: "确定",
						cancelButtonText: "取消",
						closeOnClickModal: false,
						type: "warning",
						dangerouslyUseHTMLString: true
					}).then(() => {
					this.$store.dispatch("user/changeConfigPageStatus", false);
					locationJump(url);
				}).catch(() => {
					this.$store.dispatch("app/changePage", {url: "/systemManage#/systemConfig",
						sub_menu_index: "/systemManage"});
				});
			} else {
				if (type === 1) {
					this.$store.dispatch("app/changePage", {url, sub_menu_index});
					locationJump(url);
				} else {
					this.$store.dispatch("app/changePage", {url, sub_menu_index});
					locationJump("/custom#/embed?url=" + url);
				}
			}
		}
	}
};
</script>

<style scoped>
:deep(.el-submenu__title) {
	font-size: 14px;
	font-weight: 400;
}

.el-submenu .el-menu-item {
	min-width: 159px;
	font-weight: 400;
}

.el-menu-item i {
	padding-right: 8px;
	font-weight: 400;
}

.el-menu-item :deep(.el-tooltip) {
	padding: 0 16px 0 24px !important;
}

.el-menu--vertical .el-menu--popup .el-menu-item {
	padding-left: 15px !important;
}

.my_color:focus {
	background-color: #fff;
}
</style>
