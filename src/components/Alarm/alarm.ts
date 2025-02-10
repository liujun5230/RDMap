
import {base_url} from "@/Config";
import {type AlarmConfig} from "@/api/alarm/configuration";

import {createAlarmLevelStyle, type AlarmStyle} from "./AlarmStyle";
import {AudioPlayer} from "./audio";
import {Timer} from "./timer";
import type {MQTTAlarmStart} from "./type";

// 定义报警时间结束事件
export interface AlarmEndEvent {
	type: "alarm_end";
	alarm: Alarm;
}

/**
 * 表示一个告警。
 */
export interface Alarm {
	id: number;
	/**
	 * 播放告警。
	 */
	play(): void;

	/**
	 * 暂停告警。
	 */
	pause(): void;

	/**
	 * 当告警结束时触发的事件。
	 */
	onEnd?: (event: AlarmEndEvent) => void;

	/**
	 * 告警的配置。
	 */
	config: AlarmConfig;

	/**
	 * 告警的样式。
	 */
	style: AlarmStyle;

	/**
	 * 告警的内容。
	 */
	content?: string;

	/**
	 * 告警的标题。
	 */
	title: string;

	/**
	 * 告警所在的区域。
	 */
	area_name?: string;

	/**
	 * 告警的优先级。
	 */
	priority: number;

	/**
	 * 是否显示弹出窗口。
	 */
	show_popup: Boolean;

	/**
	 * 告警的持续时间。
	 */
	duration: number;

	/**
	 * 原始的mqtt消息
	 */
	origin_data: MQTTAlarmStart;
}

export type AlarmParams = {
	id: number;
	config: AlarmConfig;
	audio_player: AudioPlayer | null;
	content: string | undefined;
	title: string;
	area_name: string | undefined;
	disappear_time: number;
	origin_data: MQTTAlarmStart;
	color: string
}

export class GlobalAlarm implements Alarm {
	private timer: Timer;
	public readonly config: AlarmConfig;
	private audio_player: AudioPlayer | null;
	public readonly style: AlarmStyle;
	public show_popup: boolean = false;
	public content?: string = "";
	public title: string = "";
	public area_name?: string;
	public onEnd?: (event: AlarmEndEvent) => void = () => {};
	public disappear_time;
	public priority: number;
	public id: number;
	public origin_data: MQTTAlarmStart;

	constructor({id, config, audio_player, content, title, area_name, disappear_time, origin_data, color}: AlarmParams) {
		this.id = id;

		this.config = config;

		this.audio_player = audio_player;

		// 根据告警级别获取报警样式
		this.style = createAlarmLevelStyle(color);

		this.content = content;

		this.title = title;

		this.area_name = area_name;

		this.disappear_time = disappear_time;

		this.priority = config.window_level;

		this.timer = new Timer((duration: number) => {
			if (duration >= this.disappear_time * 1000) {
				this.onEnd?.({type: "alarm_end", alarm: this});
			}
		});

		this.origin_data = origin_data;
	}

	/**
	 * 设置是否显示弹窗
	 * @param show_popup 是否显示弹窗
	 * @returns
	 */
	setShowPopup(show_popup: boolean) {
		if (this.config.window_enable) {
			this.show_popup = show_popup;

			return;
		}

		this.show_popup = false;
	}

	private showAlarmPopup() {
		this.setShowPopup(true);
	}

	private hideAlarmPopup() {
		this.setShowPopup(false);
	}

	play(): void {
		this.showAlarmPopup();

		if (!this.config.video_enable || !this.config.video_file) {
			this.audio_player?.mute();
		} else {
			// 设置音频源
			this.audio_player?.setAudioSource(base_url + this.config.video_file);
			this.audio_player?.play();
		}

		// 设置定时器
		this.timer.start();
	}

	pause(): void {
		this.hideAlarmPopup();
		this.audio_player?.pause();
		this.timer.pause();
	}

	close(): void {
		this.hideAlarmPopup();
		this.audio_player?.pause();
		this.timer.reset();
	}

	/**
	 * 获取已经播放的时间
	 */
	get duration() {
		return this.timer.duration;
	}
}

export class AlarmManager {
	private alarms: Alarm[] = [];
	public current_alarm: Alarm | null = null;
	constructor() {}

	// 暂停当前的告警
	private pauseCurrentAlarm(): void {
		if (this.current_alarm) {
			this.current_alarm.pause();
		}
	}

	// 添加告警
	addAlarm(alarm: Alarm): void {
		this.alarms.push(alarm);

		alarm.onEnd = (event: AlarmEndEvent) => {
			if (event.alarm === this.current_alarm) {
				this.closeAlarm();
				this.playTopAlarm();
			}
		};
	}

	// 关闭当前告警
	closeAlarm() {
		this.pauseCurrentAlarm();
		this.current_alarm = null;
		this.alarms.shift();
	}

	removeAlarm(id: number) {
		// 检查是否当前告警
		if (this.current_alarm?.id === id) {
			this.closeAlarm();
		}

		const index = this.alarms.findIndex((alarm) => alarm.id === id);

		if (index !== -1) {
			this.alarms.splice(index, 1);
		}
	}

	// 展示当前的告警
	playTopAlarm(): void {
		if (this.current_alarm && this.current_alarm !== this.alarms[0]) {
			this.pauseCurrentAlarm();
		}

		this.current_alarm = this.alarms[0] ?? null;
		if (this.current_alarm) {
			this.current_alarm.play();
		}
	}

	private updateCurrentAlarm() {
		const top_alarm = this.alarms?.[0];

		if (this.current_alarm === top_alarm)
			return;

		if (this.current_alarm) {
			this.pauseCurrentAlarm();
		}

		this.current_alarm = top_alarm;

		if (top_alarm) {
			this.playTopAlarm();
		}
	}

	/**
	 * Sorts the alarms based on their priority.
	 *
	 * @remarks
	 * This method modifies the `alarms` array in place.
	 */
	sortAlarms() {
		this.alarms.sort((a, b) => a.priority - b.priority);
		// 需要测试
		this.updateCurrentAlarm();
	}

	/**
	 * Checks if the alarms array is empty.
	 * @returns {boolean} True if the alarms array is empty, false otherwise.
	 */
	get isEmpty() {
		return this.alarms.length === 0;
	}
}
