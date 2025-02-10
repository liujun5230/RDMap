<template>
<div
	ref="alarm_container"
	class="alarm-panel"
>
	<div
		v-show="!manager.isEmpty"
		class="blink-panel"
		:class="{ 'alarm-flash': current_alarm?.config.shake_screen_enable }"
	/>
	<div class="alarm-panel__container">
		<transition name="bounce">
			<alarm-popup
				v-if="current_alarm && current_alarm?.show_popup"
				:title="current_alarm?.title"
				:area-name="current_alarm.area_name"
				:flash="!!current_alarm?.config.shake_screen_enable"
				:level-text="current_level_text"
				:content="current_alarm?.content"
				:popup-style="current_alarm?.style"
				:trigger-object="current_alarm.origin_data.trigger_object"
				:btn="btn"
				@close="closeAlarm"
				@view="handleView(current_alarm)"
				@locate="current_alarm && locate(current_alarm.origin_data)"
			/>
		</transition>
	</div>

	<audio ref="audio_element" />
</div>
</template>

<script setup lang="ts">
import {MessageBox, Notification} from "element-ui";
import {debounce} from "lodash-es";
import {computed, onMounted, ref, h} from "vue";

import {ALARM_TYPE} from "@/types/alarm";
import {ENCRYPTION_ALARM, ALARM_START_TOPIC, LOGIN_FAILURE_TOPIC, REFRESH_ALARM_RULE_CONFIG} from "@/Config";
import {getAlarmColor} from "@/utils/ts/alarmColor";
import locationJump from "@/utils/js/locationHref";
import LoginTimeOut from "@/components/SideBar/LoginTimeOut.vue";
import vuex_store from "@/store";

import {GlobalAlarm, AlarmManager, type Alarm} from "./alarm";
import AlarmPopup, {type FnButton} from "./AlarmPopup.vue";
import {AudioPlayer} from "./audio";
import {matchTopic, useMQTT} from "./mqtt";
import {alarm_config_store, alarm_level_store, usePopupConfigStore} from "./store";
import type {AlarmConfig, MQTTAlarmStart} from "./type";
import {usePopupJump} from "./usePopupJump";
import {useSystemConfigStore} from "@/store/useSystemConfigStore";
import "@/utils/css/iconFonts/operationIcon.css";

const alarm_container = ref<HTMLDivElement>();
const audio_element = ref<HTMLAudioElement>();
const {view, locate} = usePopupJump();
const popup_config_store = usePopupConfigStore();
const system_config_store = useSystemConfigStore();

const checkEncryptionNotification = debounce(() => Notification.error({title: "错误", message: "请检查加密狗"}), 5000);

function handleAlarm(alarms: MQTTAlarmStart[]) {
	for (const alarm of alarms) {
		const alarm_data: AlarmData = {
			trigger_area: alarm.trigger_area,
			content: alarm.pop_info,
			trigger_object: alarm.trigger_object,
			rule_type_id: alarm.rule_type,
			title: alarm.rule_name,
			id: alarm.id,
			origin_data: alarm,
		};

		const global_alarm = createGlobalAlarm(alarm_data);

		if (global_alarm) {
			manager.value.addAlarm(global_alarm);
		} else {
			console.error("告警创建失败");
		}
	}

	if (popup_config_store.display_all) {
		manager.value.sortAlarms();
	}

	manager.value.playTopAlarm();
}

function loginFailure() {
	MessageBox({
		title: "你的登录信息已经失效",
		message: h(LoginTimeOut),
		showClose: false,
		confirmButtonText: "立即返回",
		closeOnClickModal: false,
		beforeClose: action => {
			if (action === "confirm") {
				locationJump("/login.html");
			}
		},
	});
}

function handleLoginFailure(data: any) {
	const user_ids = data.user_ids;
	const current_user_info = vuex_store.getters.user_info;
	const current_user_id = current_user_info.user_id;
	if (user_ids.includes(current_user_id)) {
		loginFailure();
	}
}

function handleConfigRefresh() {
	alarm_config_store.update();
	alarm_level_store.update();
}

useMQTT({
	topics: [
		ALARM_START_TOPIC,
		LOGIN_FAILURE_TOPIC,
		ENCRYPTION_ALARM,
		REFRESH_ALARM_RULE_CONFIG
	],

	onMessage(topic, message) {
		console.debug("收到告警", topic, message);

		switch (true) {
		case matchTopic(ALARM_START_TOPIC, topic):
			handleAlarm(message as MQTTAlarmStart[]);
			break;
		case matchTopic(LOGIN_FAILURE_TOPIC, topic):
			handleLoginFailure(message);
			break;
		case matchTopic(ENCRYPTION_ALARM, topic):
			checkEncryptionNotification();
			break;
		case matchTopic(REFRESH_ALARM_RULE_CONFIG, topic):
			handleConfigRefresh();
			break;
		default: console.warn("未知的MQTT消息", topic, message);
		}
	}
});

type AlarmData = {
	content?: string, // 内容
	trigger_object?: string, // 触发对象
	rule_type_id: number // 告警规则类型Id
	title: string // 规则名称
	trigger_area?: string // 所在区域
	id: number // 告警Id
	origin_data: MQTTAlarmStart // 原始数据
}

/**
 * 创建全局告警
 */
function createGlobalAlarm(alarm_data: AlarmData): GlobalAlarm | undefined {
	if (audio_element.value == null) {
		throw new Error("alarm_container or audio_element is null");
	}

	const config = getAlarmConfig(alarm_data.rule_type_id, alarm_data.origin_data.level);

	if (config) {
		const {content, title, trigger_area: area_name, rule_type_id} = alarm_data;
		const id = alarm_data.id;
		const color = getAlarmColor(rule_type_id, config.alarm_level_value, system_config_store.data);

		return new GlobalAlarm({
			id,
			config,
			audio_player: new AudioPlayer(audio_element.value),
			content,
			title,
			area_name,
			disappear_time: popup_config_store.disappear_time,
			origin_data: alarm_data.origin_data,
			color
		});
	} else {
		console.error(alarm_data.rule_type_id, "报警不存在对应告警配置");
	}
}

function getAlarmConfig(rule_type_id: number, level?: string): AlarmConfig | undefined {
	const configs = alarm_config_store.group[rule_type_id];

	if (!level) {
		return configs?.[0]?.configuration;
	}

	return configs?.find(config => config.configuration.alarm_level_value === level)
		?.configuration;
}

const manager = ref(new AlarmManager());

const current_alarm = computed(() => manager.value.current_alarm);
const btn = computed(() => {
	const {floor_id, scene_id, building_id} = current_alarm.value?.origin_data ?? {};

	const config: FnButton[] = ["view", "close"];

	/**
	 * 安全区域告警查看跳转到首页，无定位按钮 #17686
	 */
	if (current_alarm.value?.origin_data.rule_type !== ALARM_TYPE.SAFE_AREA) {
		if (floor_id || building_id || scene_id) {
			config.unshift("locate");
		}
	} else {
		if (!floor_id && !building_id && !scene_id) {
			config.shift();
		}
	}

	return config;
});

function handleView(alarm: Alarm | null) {
	if (!alarm)
		return;

	if (alarm.origin_data.rule_type === ALARM_TYPE.SAFE_AREA) {
		locate(alarm.origin_data);
	} else {
		view(alarm.origin_data);
	}
}

// 报警级别文案
const current_level_text = computed(() => current_alarm.value?.config.alarm_level_alias || current_alarm.value?.config.alarm_level_name || "");

/**
 * 关闭当前告警
 */
async function closeAlarm() {
	manager.value.closeAlarm();
	manager.value.playTopAlarm();
}

onMounted(async () => {
	await Promise.all([
		// 系统配置获取
		system_config_store,
		// 后台告警规则配置
		alarm_config_store.update(),
		// 报警级别文案
		alarm_level_store.update()
	]);
});
</script>

<style scoped>
  .alarm-panel {
    width: 100vw;
    height: 100vh;
    background-color: transparent;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 9990;

    display: flex;
    justify-content: center;
    pointer-events: none;
  }

  .alarm-panel__container {
    width: 100%;
    height: fit-content;
    display: flex;
    flex-direction: row;
    align-items: center;
		place-content: center;
    pointer-events: none;
		margin-top: 50px;
  }

	.blink-panel {
		position: absolute;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		pointer-events: none;
		z-index: 9999;
    background-color: transparent;
	}

  .alarm-flash {
    animation: alarm-blink .3s infinite;
	}
/* box-shadow 过渡动画性能极差 */
@keyframes alarm-blink  {
	0% {
		box-shadow: 0 0 1px 0 v-bind("current_alarm?.style.background_color") inset;
	}

	50% {
		box-shadow: 0 0 80px 0 v-bind("current_alarm?.style.background_color") inset;
	}

	100% {
		box-shadow: 0 0 1px 0 v-bind("current_alarm?.style.background_color") inset;
	}
}

.bounce-enter-active {
	animation: bounce-fade-enter 300ms ease-in-out;
}

.bounce-leave-active {
	animation: bounce-fade-enter 300ms ease-in-out reverse;
}

@keyframes bounce-fade-enter {
	0% {
		opacity: 0;
		transform: translateY(-40px);
	}

	100% {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
