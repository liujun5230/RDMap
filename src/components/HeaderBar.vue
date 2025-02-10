<template>
<header>
	<h3
		class="app-name"
	>
		<img
			v-if="logo_display_mode === '1'"
			alt
			class="logo"
			:src="system_logo"
		>
		<p
			v-if="logo_display_mode === '2'"
			class="logo-name"
		>
			{{ name }}
		</p>
	</h3>
	<div class="header-right-item-container">
		<div
			v-if="flags?.navbar?.displaySosIcon"
			class="header-right-item sos"
		>
			<span
				v-if="show_sos_alarm"
				class="sos-count"
				:class="sos_count > 99 ? 'sos-many' : 'sos-normal'"
			>
				<div class="sos-number">
					{{ sos_count > 99 ? "99+" : sos_count }}
				</div>
			</span>
			<img
				class="sos-icon"
				src="/images/common/sos.svg"
				@click="toHelp"
			>
		</div>
		<el-dropdown
			class="header-right-item theme"
			placement="bottom"
			:show-timeout="100"
		>
			<span class="el-dropdown-link">
				<img
					src="/images/common/theme.png"
					class="theme-icon"
				>
			</span>
			<el-dropdown-menu
				slot="dropdown"
				style="width: 100px;font-size: 12px; padding: 4px; margin-top: -2px;"
				class="theme-menu"
			>
				<el-dropdown-item
					class="theme-menu-item theme-green"
					@mousedown.native="changeTheme('custom-theme-green')"
				>
					<span>浅海绿</span>
				</el-dropdown-item>
				<el-dropdown-item
					class="theme-menu-item theme-blue"
					@mousedown.native="changeTheme('custom-theme-blue')"
				>
					<span>深邃蓝</span>
				</el-dropdown-item>
			</el-dropdown-menu>
		</el-dropdown>
		<el-dropdown
			v-if=" flags?.navbar?.displayAlarmIcon"
			class="header-right-item alarm"
			placement="bottom"
			:show-timeout="100"
		>
			<span class="el-dropdown-link">
				<img
					:src="no_new_alarm ? '/images/common/alarm.png':'/images/common/alarm_active.png'"
					class="alarm-icon"
				>
			</span>
			<el-dropdown-menu
				slot="dropdown"
				style="min-width: 227px;font-size: 12px;padding: 4px 0;"
				class="alarm-menu"
			>
				<div
					v-for="(group, index) in displayed_group"
					:key="index"
				>
					<el-divider v-if="index" />
					<el-dropdown-item
						v-for="alarm in group"
						:key="alarm.type"
						class="alarm-menu-item"
						:command="alarm.type"
						@click.native="handleAlarmJump(alarm.type)"
					>
						<span class="title">{{ alarm.name }}</span>
						<div class="alarm-detail">
							<span class="detail-important">{{ alarm.untreated }}</span>
							<span>条</span>
						</div>
					</el-dropdown-item>
					<el-divider v-if="index === displayed_group.length - 1 && group[0].type !== ALARM_TYPE.SERVER_HOT_STANDBY_OFFLINE && (disk_info || show_disk_tips)" />
				</div>

				<el-dropdown-item
					v-if="no_new_alarm"
					class="alarm-menu-item"
				>
					<span class="title">{{ $t("common.header.alarm.no_new_alarm") }}</span>
				</el-dropdown-item>
				<el-dropdown-item
					v-if="disk_info"
					class="alarm-menu-item"
					@click.native="jumpServer"
				>
					<span class="title">磁盘总大小：</span>
					<span>{{ disk_info.capacity }}MB</span>
				</el-dropdown-item>
				<el-dropdown-item
					v-if="disk_info"
					class="alarm-menu-item"
					@click.native="jumpServer"
				>
					<span class="title">占比：</span>
					<div class="alarm-detail">
						<span>{{ disk_info.max_ratio }}</span>
						<span
							v-if="show_disk_tips"
							class="detail-important"
						> 磁盘空间不足 </span>
					</div>
				</el-dropdown-item>
				<el-dropdown-item
					v-if="authentication"
					class="alarm-menu-item"
				>
					<span class="title">当前为免登录访问，存在安全隐患</span>
				</el-dropdown-item>
				<el-divider v-if="show_browser_warning" />
				<el-dropdown-item
					v-if="show_browser_warning"
					class="alarm-menu-item"
					@click.native="downloadBrowser"
				>
					<span class="title">
						浏览器版本不兼容，点击下载最新版
					</span>
				</el-dropdown-item>
			</el-dropdown-menu>
		</el-dropdown>

		<el-dropdown
			class="header-right-item username"
			trigger="click"
		>
			<span class="el-dropdown-link username"><span>{{ authentication ? "免登录" : header_name }}</span></span>
			<el-dropdown-menu
				slot="dropdown"
				class="user-menu"
			>
				<el-dropdown-item>
					<span>
						<i class="el-icon-user" />{{ authentication ? "免登录" : username }}
					</span>
				</el-dropdown-item>
				<el-dropdown-item>
					<span
						:class="{'span-disabled': authentication}"
						@click="clickModifyPassword"
					>
						<i class="el-icon-edit-outline" />{{ $t("common.header.btn.modify_password") }}
					</span>
				</el-dropdown-item>
				<el-dropdown-item>
					<span
						:class="{'span-disabled': authentication}"
						@click="clickLogout"
					>
						<i class="el-icon-switch-button" />{{ $t("common.header.btn.logout") }}
					</span>
				</el-dropdown-item>
			</el-dropdown-menu>
		</el-dropdown>
	</div>
</header>
</template>

<script>
import mqtt from "mqtt";
import {mapGetters} from "vuex";
import {createNamespacedHelpers} from "vuex";
import {ACCIDENT_ALARM, ALARM_TYPE, AREA_ALARM, DEVICE_ALARM, HEALTH_MANAGEMENT, LOCATION_ALARM, ROLL_CALL, WISDOM_INSPECTION} from "@/types/alarm";
import {base_url, mqtt_password, mqtt_user_name, mqtt_ws_url} from "@/Config";
import {getDiskUsage} from "@/api/company/systemSetting";
import {getSos, getAllCount} from "@/api/alarm/alarm";
import {getSystemInfo} from "@/api/configuration/configuration";
import {updateUser} from "@/api/admin/user";
import locationJump from "@/utils/js/locationHref";
import {menu_name_map} from "@/store/useMenuStore";
import {getBrowserCompatibleInfo, startBrowserCheck, downloadBrowser as downloadBrowserApp} from "@/utils/ts/browserDetection";

const DEVICE_TYPE = {
	// 基站
	BASE_STATION: 5,
	// 标签
	TAG: 9,
	// 电源
	POWER: 2,
	// 唯一性检测门
	DOOR: 1,
	// 交换机
	SWITCH: 4,
	// 发卡一体机
	CARD_MACHINE: 6,
	// 服务器
	SERVER: 7,
	// 红绿灯
	TRAFFIC_LIGHT: 10,
	// 声光报警器
	SOUND_AND_LIGHT: 11
};

const {mapState} = createNamespacedHelpers("feature");
let mqtt_client;
export default {
	name: "HeaderBar",
	setup() {
		return {
			ALARM_TYPE,
			DEVICE_TYPE
		};
	},
	data() {
		return {
			alarm_group_list: [],
			sos_alarm_list: [],
			system_logo: "",
			logo_display_mode: "",
			base_url,
			menu: [
				{name: "修改密码"},
				{name: "退出登录"},
			],
			disk_info: null,
			header_name: "",
			show_browser_warning: false,
		};
	},
	computed: {
		...mapGetters(["user_info", "name", "version"]),
		...mapState({
			flags: state => state.feature_flags
		}),
		username() {
			this.checkUsername(this.user_info.username);
			return this.user_info.username;
		},
		user_id() {
			return this.user_info.user_id;
		},
		authentication() {
			return this.user_info.authentication;
		},

		displayed_group() {
			return this.alarm_group_list
				.map(item => item.filter(alarm => alarm.untreated > 0))
				.filter(arr => arr.length > 0);
		},

		// 提示磁盘空间不足
		show_disk_tips() {
			return this.alarm_group_list
				.some(arr => arr.find(item => item.type === ALARM_TYPE.DISK_SPACE_INSUFFICIENT && item.untreated > 0));
		},

		no_new_alarm() {
			return this.displayed_group.length === 0 && !this.show_disk_tips;
		},

		show_sos_alarm() {
			return this.sos_count > 0;
		},

		sos_count() {
			return this.sos_alarm_list.reduce((count, item) => count + item.untreated, 0);
		},
	},
	mounted() {
		startBrowserCheck("admin");
		this.getAlarmList();
		this.getSosAlarmList();
		this.getDiskInfo();
		this.getSystemName();
		this.$store.dispatch("app/getKmlMapInfo");
		setInterval(() => {
			this.getSosAlarmList();
			this.getAlarmList();
			this.getDiskInfo();
		}, 120000);
		this.connectMQTT();

		getBrowserCompatibleInfo()
			.then(info => {
				this.show_browser_warning = !info.is_compatible;
			});
	},
	methods: {
		async getAlarmList() {
			const resp = await getAllCount();
			if (resp.data.type === 1) {
				this.alarm_group_list = resp.data.result;
			}
		},

		async getSosAlarmList() {
			const resp = await getSos();
			if (resp.data.type === 1) {
				this.sos_alarm_list = resp.data.result;
			}
		},

		connectMQTT() {
			if (window.WebSocket) {
				const help_topics = ["/pos_business/alarm_inform", "/think_php/sos_change"];
				mqtt_client = mqtt.connect(mqtt_ws_url, {username: mqtt_user_name, password: mqtt_password});
				mqtt_client.subscribe(help_topics);
				mqtt_client.on("message", (topic, payload) => {
					const data = JSON.parse(payload.toString());
					if (topic === "/think_php/sos_change" || topic === "/pos_business/alarm_inform" && data[6]?.length) {
						this.getAlarmList();
					}
				});
			}
		},

		getSystemName() {
			getSystemInfo().then((res) => {
				if (res.data.type === 1) {
					this.system_logo = base_url + res.data.result.system_logo;
					this.logo_display_mode = res.data.result.logo_display_mode;
					this.$store.dispatch("app/getSystemInfo");
					window.document.title = res.data.result.name;
				}
			});
		},

		checkUsername(val) {
			if (/[\u4E00-\u9FA5]/i.test(val.charAt(0))) { // 第一个位中文
				const data = val.split("");
				const last1 = this.checkLetter(data[data.length - 1]);
				const last2 = this.checkLetter(data[data.length - 2]);
				this.header_name = last2 + "" + last1;
			} else {
				this.header_name = this.checkLetter(val.charAt(0));
			}
		},

		checkLetter(value) {
			const val = value.toString().charCodeAt(0);
			if ((val >= 97 && val <= 122) || (val >= 65 && val <= 90)) {
				return value.toUpperCase();
			} else {
				return value;
			}
		},
		clickModifyPassword() {
			if (this.authentication) {
				return;
			}
			this.$emit("change-password");
		},

		clickLogout() {
			if (this.authentication) {
				return;
			}
			this.$store.dispatch("user/logout").then(() => {
				locationJump("/login");
			});
		},

		async getDiskInfo() {
			const result = await getDiskUsage();
			if (result.data.type === 1) {
				this.disk_info = result.data.result;
			}
		},

		async changeTheme(theme) {
			if (!this.authentication) {
				const res = await updateUser({id: this.user_id, theme});
				if (res.data.type === 1) {
					this.$notify.success({
						title: "成功",
						message: "操作成功"
					});
				}
			}
			this.$store.dispatch("user/getUserInfo", theme);
			window.document.body.className = theme;
		},

		// 事故告警
		jumpAccidentAlarm(type) {
			this.jump(`/alarm#/accident?type=${parseInt(type)}&&status=0`, "/alarm");
		},
		// 跳转到定位对象告警
		jumpLocationAlarm(type) {
			this.jump(`/alarm#/alarm?type=${parseInt(type)}&&status=0`, "/alarm");
		},
		// 跳转到区域告警
		jumpAreaAlarm(type) {
			const params = new URLSearchParams();
			params.set("type", type);
			params.set("status", 0);
			this.jump(`/alarm#/area?${params.toString()}`, "/alarm");
		},
		// 跳转到设备告警
		jumpDeviceAlarm(alarm_type) {
			// 设备类型
			let type;
			// 处理状态
			let status = 0;
			// 告警原因
			let reason;
			switch (alarm_type) {
			// 标签低电量
			case ALARM_TYPE.TAG_LOW_BATTERY:
				type = DEVICE_TYPE.TAG;
				status = 0;
				break;
			// 基站离线
			case ALARM_TYPE.BASE_STATION_OFFLINE:
				type = DEVICE_TYPE.BASE_STATION;
				status = 0;
				break;
			// 电源离线
			case ALARM_TYPE.POWER_OFFLINE_36:
				type = DEVICE_TYPE.POWER;
				status = 0;
				reason = "离线";
				break;
			// 电源低电量告警
			case ALARM_TYPE.POWER_LOW_BATTERY_37:
				type = DEVICE_TYPE.POWER;
				status = 0;
				reason = "低电量";
				break;
			// 电源设备故障
			case ALARM_TYPE.POWER_DEVICE_FAILURE_38:
				type = DEVICE_TYPE.POWER;
				status = 0;
				reason = "设备故障";
				break;
			// 电源设备告警
			case ALARM_TYPE.POWER_DEVICE_ALARM_39:
				type = DEVICE_TYPE.POWER;
				status = 0;
				reason = "设备告警";
				break;
			// 交换机离线
			case ALARM_TYPE.SWITCH_OFFLINE:
				type = DEVICE_TYPE.SWITCH;
				reason = "离线";
				status = 0;
				break;
			// 一体机离线
			case ALARM_TYPE.CARD_MACHINE_OFFLINE:
				type = DEVICE_TYPE.CARD_MACHINE;
				status = 0;
				reason = "离线";
				break;
			// 一体机无卡
			case ALARM_TYPE.CARD_MACHINE_NO_CARD:
				type = DEVICE_TYPE.CARD_MACHINE;
				status = 0;
				reason = "无卡";
				break;
			case ALARM_TYPE.TRAFFIC_LIGHT_OFFLINE:
				type = DEVICE_TYPE.TRAFFIC_LIGHT;
				status = 0;
				reason = "离线";
				break;
			case ALARM_TYPE.SOUND_AND_LIGHT_ALARM_OFFLINE:
				type = DEVICE_TYPE.SOUND_AND_LIGHT;
				status = 0;
				reason = "离线";
				break;
			case ALARM_TYPE.SERVER_HOT_STANDBY_OFFLINE:
				type = DEVICE_TYPE.SERVER;
				reason = "双机热备离线";
				status = 0;
				break;
			case ALARM_TYPE.DISK_SPACE_INSUFFICIENT:
				type = DEVICE_TYPE.SERVER;
				reason = "磁盘空间不足";
				status = 0;
				break;
			case ALARM_TYPE.DATABASE_SYNCHRONIZATION_ABNORMAL:
				type = DEVICE_TYPE.SERVER;
				reason = "数据库同步异常";
				status = 0;
				break;
			}

			let url = "/alarm#/equip";

			const params = new URLSearchParams();
			Object.entries({type, status, reason})
				.forEach(([key, value]) => {
					if (value != null) {
						params.set(key, value);
					}
				});

			url += "?" + params.toString();
			this.jump(url, "/alarm");
		},

		// 跳转到电子点名
		jumpRollCall() {
			const params = new URLSearchParams([
				// 未处理
				["status", 0],
				// 异常
				["abnormal_status", 0]
			]);

			this.jump(`/call#/record?${params.toString()}}`, "/call");
		},

		// 跳转到智慧巡检
		jumpInspection(type) {
			// status=-1 代表筛选出全部异常告警
			// dispose_status 代表处理状态, 0 代表未处理
			const params = new URLSearchParams([
				["type", type],
				["active", "record"],
				["status", -1],
				["dispose_status", 0],
				["start_time", 0],
				["end_time", 0]
			]);
			this.jump(`/patrol#/info?${params.toString()}`, "/patrol");
		},

		// 跳转到健康管理
		jumpHealth(type) {
			let check_type = 1;
			let status = 0;
			switch (type) {
			// 心率异常
			case ALARM_TYPE.HEART_RATE_ABNORMAL:
				check_type = 1;
				status = 0;
				break;
			// 血氧异常
			case ALARM_TYPE.BLOOD_OXYGEN_ABNORMAL:
				check_type = 3;
				status = 0;
				break;
			// 体温异常
			case ALARM_TYPE.TEMPERATURE_ABNORMAL:
				check_type = 2;
				status = 0;
				break;
			default:
				break;
			}

			const params = new URLSearchParams([
				["check_type", check_type],
				["status", status]
			]);

			this.jump(`/healthy#/error?${params.toString()}`, "/health");
		},

		jumpServer() {
			this.jump("/deviceManage#/status?device_name=server", "/deviceManage");
		},

		/**
		 * @param {ALARM_TYPE} alarm_type
		 */
		handleAlarmJump(alarm_type) {
			console.log(alarm_type, ": command", typeof alarm_type);
			const type = Number(alarm_type);
			switch (true) {
			// 设备告警
			case DEVICE_ALARM.includes(type):
				this.jumpDeviceAlarm(type);
				break;
			// 定位对象告警
			case LOCATION_ALARM.includes(type) || (ALARM_TYPE.BELOW_GROUND_LACK_OF_PERSONNEL === type || ALARM_TYPE.BELOW_GROUND_OVER_LIMIT === type):
				this.jumpLocationAlarm(type);
				break;
			// 健康管理
			case HEALTH_MANAGEMENT.includes(type):
				this.jumpHealth(type);
				break;
			// 电子点名
			case ROLL_CALL.includes(type):
				this.jumpRollCall(type);
				break;
			// 智慧巡检
			case WISDOM_INSPECTION.includes(type):
				this.jumpInspection(type);
				break;
			// 事故告警
			case ACCIDENT_ALARM.includes(type):
				this.jumpAccidentAlarm(type);
				break;
			case AREA_ALARM.includes(type):
				this.jumpAreaAlarm(type);
				break;
			case type === ALARM_TYPE.SERVER_HOT_STANDBY_OFFLINE:
				this.jumpDeviceAlarm(type);
				break;
			}
		},

		toAlarm(type) {
			this.jump(`/alarm#/alarm?type=${parseInt(type)}`, "/alarm");
		},

		/** 跳转聚集报警页面，筛选未处理
     * @param {number} status 0:未处理 1:已处理
     */
		toGather(status) {
			this.jump(`/alarm#/gather?status=${status}`, "/alarm");
		},

		toHelp() {
			if (this.sos_count > 0) {
				this.jump("/alarm#/help?status=0", "/alarm");
			} else {
				this.jump("/alarm#/help?status=all", "/alarm");
			}
		},

		toBaseStationAlarm() {
			this.jump("/alarm#/equip?type=5&fault=1", "/alarm");
		},

		jump(url, sub_menu_index) {
			const path = url.split("?")[0];
			if (this.user_info.auth[path] === undefined || this.user_info.auth[path] === 0) {
				this.$notify.error({
					title: "错误",
					message: `跳转失败，无${menu_name_map.value.get(path)}页面权限`
				});
				return;
			}

			this.$store.dispatch("app/changePage", {url, sub_menu_index});
			if (window.location.href === window.location.origin + url) {
				window.location.reload();
			} else {
				locationJump(url);
			}
		},
		async downloadBrowser() {
			await downloadBrowserApp();
		},
	},
};
</script>

<style scoped>
header {
	height: 64px;
	box-shadow: 0px 4px 8px rgba(208, 208, 208, 0.7);
}

.custom-theme-blue header {
	background-color: #23488A;
}

.custom-theme-green header {
	background: linear-gradient(90deg, #288F87 0%, #3EB2A9 100%);;
}

.app-name {
	margin: 0;
	height: 64px;
	vertical-align: middle;
	display: inline-block;
}

.logo {
	max-width: 1200px;
	height: 24px;
	margin: 21px 0 0 24px !important;
}

.app-name img {
	margin: 12px 0;
}

.app-name .logo-name {
	margin: 0 0 0 24px;
	font-size: 22px;
	font-weight: 700;
	color: #FFFFFF;
	height: 64px;
	line-height: 64px;
}

.sos .el-dropdown-link,
.alarm .el-dropdown-link,
.theme .el-dropdown-link {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 64px;
	cursor: pointer;
	color: white;
}

.custom-theme-blue .username.el-dropdown-link {
	background: #2B81E5;
}

.custom-theme-green .username.el-dropdown-link {
	background: #269F9B;
}

.username.el-dropdown-link {
	display: inline-block;
	width: 36px;
	height: 36px;
	font-size: 12px;
	color: #FCFCFC;
	border-radius: 18px;
	margin: 14px 24px 0 18px;
	line-height: 36px;
	overflow: hidden;
	cursor: pointer;
	text-align: center;
}

.username.el-dropdown-link span {
	height: 36px;
	width: 26px;
	display: inline-block;
	overflow: hidden;
	margin: 0 5px;
}

.change-lang.el-dropdown-link {
	color: #748BA4;
	height: 32px;
	line-height: 32px;
}

.lang.el-dropdown {
	height: 32px;
	display: flex;
	align-items: center;
}

.lang-menu .el-dropdown-menu__item:hover {
	background-color: #2B81E5;
	color: white;
}

.header-right-item-container {
	float: right;
	height: 64px;
}

.header-right-item {
	font-size: 18px;
	line-height: 64px;
	margin: 0 !important;
}

.alarm {
	margin: 0;
	float: left;
}

.theme {
	margin-right: 20px !important;
	float: left;
}

.sos {
	position: relative;
	margin-right: 20px !important;
	float: left;
	display: grid;
	place-items: center;
}

.header-right-item.username {
	margin-right: 0px;
	height: 64px;
}

i.hg-icons.icon-user {
	display: inline-block;
	height: 36px;
	width: 36px;
	text-align: center;
	vertical-align: middle;
	line-height: 36px;
	border-radius: 18px;
	background-color: #7499F7;
	color: white;
	cursor: pointer;
}

.shake {
	color: white;
}

.custom-theme-blue .el-dropdown-menu__item:hover {
	background: #2B81E5 !important;
	color: #ffffff;
}

.custom-theme-green .el-dropdown-menu__item:hover {
	background-color: #3EB2A9 !important;
	color: #ffffff;
}

.el-dropdown-menu__item:hover span {
	color: white !important;
}

.el-dropdown-menu__item span {
	display: block;
	color: #748BA4;
}

.theme-menu .theme-green:hover {
	background: #3EB2A9 !important;
}

.theme-menu .theme-blue:hover {
	background: #23488A !important;
}

.alarm-menu {
	overflow-y: auto;
	max-height: calc(100vh - 95px);
}

ul.alarm-menu.el-dropdown-menu.el-popper {
	margin-top: -2px;
}

.alarm-menu .el-dropdown-menu__item,
.theme-menu .el-dropdown-menu__item {
	padding: 0 12px;
}

.alarm-menu .alarm-menu-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 14px;
}

.theme-green {
	background-color: #3EB2A9;
	text-align: center;
}

.theme-green > span {
	color: #3EB2A9;
}

.theme-blue {
	background-color: #23488A;
	text-align: center;
}

.theme-blue > span {
	color: #23488A;

}

.alarm-menu-item .number{
	color: #EC3737;
}

.alarm-detail {
	display: inline-flex;
	justify-content: center;

	.detail-important {
		margin-left: 4px;
		color: #F56C6C;
	}
}

ul.user-menu.el-dropdown-menu.el-popper {
	width: 140px;
	padding: 4px 0;
	margin-top: -2px;
}

.user-menu .el-dropdown-menu__item {
	padding-left: 20px;
	height: 36px;
}

.user-menu .el-dropdown-menu__item i {
	margin-right: 8px;
	font-size: 14px;
}

.user-menu .el-dropdown-menu__item span {
	font-size: 14px;
	line-height: 36px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.sos-icon,
.alarm-icon,
.theme-icon {
	width: 24px;
	height: 24px;
}

.lang-menu .el-dropdown-menu__item {
	height: 32px;
	color: #748BA4;
	font-size: 12px;
	line-height: 32px;
}

.el-dropdown-menu__item .span-disabled {
	cursor: not-allowed;
	color: #D1D8E1;
}

.sos-count {
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	padding: 4px;
	box-sizing: border-box;
	position: absolute;
	min-width: 20px;
	height: 20px;
	transform: translate(13px);
	background: #F56C6C;
	border-radius: 50px;
	color: #FFFFFF;
}

.sos-icon {
	margin-top: 21px;
	cursor: pointer;
}

.sos-normal {
	width: 20px;
}

.sos-many {
	width: 29px;
}

.sos-number {
	font-family: 'Roboto';
	font-size: 12px;
	line-height: 12px;
}

.alarm-menu .el-divider {
	margin: 6px 0;
}

.special-group {
	display: inline-flex;
	flex-flow:nowrap column;
	align-items: flex-start;

}
</style>
