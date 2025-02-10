// 回调函数列表
/**
 * no_data_callback 无数据
 * data_end_callback 播放结束
 * long_search_callback 过长搜索
 * update_card_callback 更新点位
 * get_play_data 获取数据
 * update_nowTime 更新视图层时间
 * history_request_null_callback 数据空时
 *
 */

import {MAP_LOAD_STATUS, useHistoryStore} from "@/views/history/store";

const GET_DATA_MIN_TIME = 1000;

const GET_DATA_MAX_TIME = 100000;
// 间隔时间
const INTERVAL_TIME = 6000;
// 最长搜索时间
const LONG_SEARCH_TIME = 2592000000;

let GET_HISTORY_DATA_SUCCESS = false;

/**
 * 有关时间的单位均为 毫秒
 *
 * data 内部数据
 *
 *
 *
 * play() 按下播放
 * pause() 按下暂停
 * changeSpeed() 倍速
 * handleDrag() 拖拽
 * mapData() 具体播放逻辑
 *
 */
export class Replay {
	constructor(params, callbackObj) {
		this.callbackObj = callbackObj;
		this.data = {
			nowTime: 0, // 当前时间
			minTime: 0, // 永远为0 从0开始
			maxTime: 0, // 接口返回最后一个数据的时间减去最开始时间
			speed: 1000, // 1000为1s 500为2倍速 250为四倍速 2000为0.5倍速
			player: null, // 定时器
			start: 0, // 点位开始时间戳
			end: 0, // 点位结束时间戳

			historyPointer: 0, // 数据指针
			historyData: null, // 当前数据
			isPlayEnd: false, // 播放结束flag
			dataLastTime: 0, // 数据最后一个时间
		};
		this.init(params);
	}

	// data-----start-------
	init(params) {
		const {
			start,
			end,
			speed,
			history_type
		} = params;
		this.data.maxTime = end - start;
		this.data.start = start;
		this.data.end = end;
		this.data.speed = speed;
		this.data.history_type = history_type;
		this.getData(start, end);
	}

	// data-----end-------

	play() {
		clearInterval(this.data.player);
		this.data.player = setInterval(this.mapData.bind(this), this.data.speed);
	}

	pause() {
		clearInterval(this.data.player);
		this.data.player = null;
	}

	changeSpeed(speed) {
		this.data.speed = speed;
		clearInterval(this.data.player);
		this.data.player = setInterval(this.mapData.bind(this), this.data.speed);
	}

	handleDrag(nowTime) {
		this.pause();
		this.data.historyPointer = 0;
		this.data.historyData = null;
		this.data.isPlayEnd = false;
		// 外部主动变化 更新内部nowtime
		this.data.nowTime = nowTime;
		const start = this.data.start + this.data.nowTime;
		this.getData(start, this.data.end);
		this.play();
	}

	destroy() {
		clearInterval(this.data.player);
		this.data = {
			nowTime: 0,
			minTime: 0,
			maxTime: 0,
			speed: 1000,
			player: null,
			start: 0,
			end: 0,

			historyPointer: 0,
			historyData: null,
			isPlayEnd: false,
			dataLastTime: 0,
		};
	}

	mapData() {
		if (!this.data.historyData?.length) return;
		if (this.data.nowTime >= this.data.maxTime || this.data.historyPointer >= this.data.historyData.length) {
			this.data.isPlayEnd = true;
			this.pause();
			this.callbackObj.data_end_callback();
			return;
		}

		if (this.data.dataLastTime - this.data.nowTime > GET_DATA_MIN_TIME && this.data.dataLastTime - this.data.nowTime < GET_DATA_MAX_TIME && GET_HISTORY_DATA_SUCCESS && !this.data.isPlayEnd) {
			const start = this.data.historyData[this.data.historyData.length - 1].time;
			GET_HISTORY_DATA_SUCCESS = false;
			this.getData(start, this.data.end);
		}
		this.data.nowTime += 1000;
		this.callbackObj.update_nowTime(); // 向外界发出更新nowtime指令

		if (this.data.historyPointer < this.data.historyData.length) {
			// 根据定位频率更新坐标点数
			for (this.data.historyPointer; this.data.historyData[this.data.historyPointer].relative_time < this.data.nowTime; this.data.historyPointer++) {
				const item = this.data.historyData[this.data.historyPointer];
				this.callbackObj.update_card_callback(item);
				if (this.data.historyPointer === this.data.historyData.length - 1) {
					this.data.historyPointer++;
					break;
				}
			}

			// 数据间断超过 6s
			if (this.data.historyData[this.data.historyPointer]?.relative_time - this.data.nowTime > INTERVAL_TIME) {
				this.data.nowTime = (Math.floor(this.data.historyData[this.data.historyPointer].relative_time / 1000) - 1) * 1000;
				this.callbackObj.change_nowTime(this.data.nowTime); // nowTime跳跃更新
			}
		}
	}

	async getData(start, end, is_invoke_end_callback = true) {
		if (parseInt(start) >= parseInt(end)) {
			this.data.isPlayEnd = true;
			is_invoke_end_callback && this.callbackObj.data_end_callback();
			this.pause();
			return;
		}

		if (parseInt(end) - parseInt(start) > LONG_SEARCH_TIME) {
			this.callbackObj.long_search_callback();
			return;
		}

		// 获取数据
		const {
			data
		} = await this.callbackObj.get_play_data(start, end);
		if (data.type === 1) {
			if (data.result.length > 0) {
				const last_index_map = new Map(this.data.history_type === "area" ? data.result.map(({card_id}, index) => [card_id, index]) : []);
				const new_data = data.result.map(({card_id, time, ...rest}, index) => {
					const last_index = last_index_map.get(card_id);
					const is_last_point = last_index === index;
					return {
						...rest,
						card_id,
						time,
						relative_time: time - this.data.start,
						is_last_point,
					};
				});
				this.data.dataLastTime = new_data[new_data.length - 1].relative_time;

				if (!this.data.historyData?.length) {
					this.data.historyData = new_data;
				} else {
					this.data.historyData = this.data.historyData.concat(new_data);
				}
				GET_HISTORY_DATA_SUCCESS = true;

				if (start === new_data[new_data.length - 1].time) {
					// #12392
					this.pause();
					this.getData(parseInt(start) + 1000, end, false).then(() => {
						if (useHistoryStore().map_load_status === MAP_LOAD_STATUS.completed) { // WTD00272
							this.play();
						}
					});
					return;
				}
			} else if (data.result?.length === 0 && !this.data.historyData?.length) {
				this.callbackObj.history_request_null_callback();
				this.pause();
				this.data.isPlayEnd = true;
			} else {
				this.data.isPlayEnd = true;
			}
		}
	}
}
