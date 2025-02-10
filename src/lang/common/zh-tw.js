const Common = {
	notify: {
		title: {
			success: "成功",
			error: "錯誤",
			add_success: "新增成功",
			update_success: "更新成功",
			save_success: "保存成功",
			delete_success: "删除成功",
			refresh_data: "正在刷新數據",
		},
		message: {
			time_repeat: "时间段不能重复",
			time_same: "起始和結束時間不能相同",
			refresh: "正在刷新數據",
			h265: "瀏覽器不支持H265編碼的視頻播放"
		},
	},
	warning: {
		deletion: "删除後不可恢復，請謹慎執行操作。",
		relogin: "登錄失效",
		message: {
			deletion: "刪除後不可恢復，請謹慎執行操作。<br>是否確定刪除該項？",
			relogin: "登錄信息已經失效，需要重新登錄",
		},
		btn: {
			cancel: "取消",
			login: "重新登錄"
		}
	},
	form: {
		symbol: {
			time_range_separator: "至",
		},
		placeholder: {
			name_or_card: "請輸入姓名或卡號",
			begin: "開始時間",
			end: "結束時間",
			time: "選擇時間範圍",
		},
		validate_error: {
			begin_bigger_end: "起始时间不能超过结束时间",
		},
		btn: {
			quit: "取消",
			save: "確定",
		},
	},
	table: {
		action_tips: {
			detail: "详情",
			edit: "编辑",
			del: "删除",
			location: "定位"
		},
		label: {
			index: "序號",
			action: "操作",
		},
		checkbox: {
			selected: "已選擇",
			item: "項"
		}
	},
	rule: {
		time_is_forever: "永久有效",
		to: "至",
		all_person: "所有人",
		no_handle_person: "無作用人員",
		rule_type: {
			allow_enter: "僅允許進入",
			refuse_enter: "僅拒絕進入",
			allow_leave: "僅允許離開",
			refuse_leave: "僅拒絕離開",
			area_overtime: "區域超時",
			area_static: "區域不動",
			area_disappear: "區域消失",
			gather_alarm: "聚眾報警",
			person_num_limit: "人數限制",
			no_judge: "無判斷",
		},
	},
	text: {
		mon: "星期一",
		tue: "星期二",
		wed: "星期三",
		thu: "星期四",
		fri: "星期五",
		sat: "星期六",
		sun: "星期日",
	},
	change_password_form: {
		header: "修改密碼",
		placeholder: {
			password: "請輸入原密碼",
			new_password: "請輸入新的密碼",
			confirm_new_password: "請再次輸入新的密碼",
		},
		validate_error: {
			password_is_empty: "請輸入原密碼",
			new_password_is_empty: "請輸入新的密碼",
			confirm_new_password_is_empty: "請再次輸入新的密碼",
			password_is_different: "兩次密碼不一致",
		},
		btn: {
			quit: "取消",
			save: "確定",
		},
	},
	header: {
		alarm: {
			no_new_alarm: "沒有新的報警信息",
			alarm: "未處理警示信息",
			help: "SOS記錄",
		},
		btn: {
			modify_password: "修改密碼",
			logout: "退出登錄",
		},
	},
	globalAlarm: {
		strange_card: "陌生卡",
		monitor_to: "監測到",
		video: "視頻",
		location: "定位",
		caution_info: "警示信息",
		sos_record: "SOS記錄",
		low_power_remind: "低電量提醒",
		no_untreated_alarm_info: "無任何未處理報警信息",
		twice_password_diff: "兩次密碼不一致",
		twice_password_same: "兩次密碼一致",
		password_not_empty: "密碼不能為空",
		info: "信息",
		input_old_password_wrong: "輸入原始密碼錯誤",
		personnel: "人員",
		enter: "進入",
		leave: "離開",
		in: "在",
		area_over_man: "區域聚眾",
		area_overtime: "區域超時",
		area_static: "區域不動",
		area_disappear: "區域消失",
		no_escort_group: "無人陪同，陪同組：",
		leave_group: "離群，群組：",
		danger_danger_source: "靠近危險源，危險源：",
		miss_station: "基站掉線，基站ID：",
		help: "求救",
		heart_error: "心率異常",
		blood_error: "血壓異常",
		fall: "跌落",
		dismantle: "強拆",
		area_overmanned: "區域超員",
		no_new_alarm_info: "沒有新的報警信息",
	},
	select_option: {
		select_all: "全部"
	}
};

export default Common;
