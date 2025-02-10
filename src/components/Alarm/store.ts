import {reactive, computed} from "vue";
import {getAlarmConfiguration, type AlarmRuleResponseItem} from "@/api/alarm/configuration";
import {getAlarmLevel} from "@/api/alarm/configuration";
import {groupBy} from "lodash-es";
import {useSystemConfigStore} from "@/store/useSystemConfigStore";

type AlarmConfigStore = {
	data: AlarmRuleResponseItem[] | undefined;
	group: Record<string, AlarmRuleResponseItem[]>;
	update: () => Promise<void>;
}

export const alarm_config_store = reactive<AlarmConfigStore>({
	data: undefined,
	group: {},
	/**
	 * 更新报警配置
	 */
	async update () {
		const resp = await getAlarmConfiguration();
		const data = resp.data.result.data;
		this.data = data;
		this.group = groupBy(this.data, "rule_type_id");
	}
});

export const usePopupConfigStore = () => {
	const system_config_store = useSystemConfigStore();

	const disappear_time = computed(() => system_config_store.getNumberValue("ALARM_WINDOW_VOICE_DISAPPEARING_TIME", 20));
	const display_all = computed(() => system_config_store.getBooleanValue("ALARM_WINDOW_RULE", true));

	async function update() {
		await system_config_store.fetch();
	}

	return reactive({
		disappear_time,
		display_all,
		update
	});
};

type AlarmLevelStore = {
	alarm_level: {
		value: string,
		name: string,
		alias: string,
	}[],
	alarm_level_map: Map<string, string>,
	update(): Promise<void>;
}

export const alarm_level_store = reactive<AlarmLevelStore>({
	alarm_level_map: new Map(),
	alarm_level: [],

	// 更新告警级别
	async update() {
		const res = await getAlarmLevel();
		if (res.data.type === 1) {
			this.alarm_level = res.data.result;
			this.alarm_level_map = new Map(this.alarm_level.map(item => [item.value, item.name]));
		}
	}
});
