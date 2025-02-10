const Common = {
	notify: {
		title: {
			success: "成功",
			error: "错误",
			add_success: "新增成功",
			update_success: "更新成功",
			save_success: "保存成功",
			delete_success: "删除成功",
		},
		message: {
			time_repeat: "时间段不能重复",
			time_same: "起始和结束时间不能相同",
			refresh: "正在刷新数据",
			h265: "浏览器不支持H265编码的视频播放"
		},
	},
	warning: {
		deletion: "删除",
		relogin: "登录失效",
		message: {
			deletion: "删除后不可恢复，请谨慎执行操作。<br>是否确定删除该项？",
			relogin: "长时间未操作，需要重新登录",
		},
		btn: {
			cancel: "取消",
			login: "重新登录"
		}
	},
	form: {
		symbol: {
			time_range_separator: "至",
		},
		placeholder: {
			name_or_card: "请输入姓名或卡号",
			begin: "开始时间",
			end: "结束时间",
			time: "选择时间范围",
		},
		validate_error: {
			begin_bigger_end: "起始时间不能超过结束时间",
		},
		btn: {
			quit: "取消",
			save: "确定",
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
			index: "序号",
			action: "操作",
		},
		checkbox: {
			selected: "已选择",
			item: "项"
		}
	},
	rule: {
		time_is_forever: "永久有效",
		to: "至",
		all_person: "所有人",
		no_handle_person: "无作用人员",
		rule_type: {
			allow_enter: "仅允许进入",
			refuse_enter: "仅拒绝进入",
			allow_leave: "仅允许离开",
			refuse_leave: "仅拒绝离开",
			area_overtime: "区域超时",
			area_static: "区域不动",
			area_disappear: "区域消失",
			gather_alarm: "聚集报警",
			person_num_limit: "人数限制",
			no_judge: "无判断",
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
		header: "修改密码",
		placeholder: {
			password: "请输入原密码",
			new_password: "请输入新的密码",
			confirm_new_password: "请再次输入新的密码",
		},
		validate_error: {
			password_is_empty: "请输入原密码",
			new_password_is_empty: "请输入新的密码",
			confirm_new_password_is_empty: "请再次输入新的密码",
			password_is_different: "两次密码不一致",
		},
		btn: {
			quit: "取消",
			save: "确定",
		},
	},
	header: {
		alarm: {
			no_new_alarm: "没有新的报警信息",
			alarm: "未处理警示信息",
			help: "SOS记录",
		},
		btn: {
			modify_password: "修改密码",
			logout: "退出登录",
		},
	},
	globalAlarm: {
		strange_card: "陌生卡",
		monitor_to: "监测到",
		video: "视频",
		location: "定位",
		caution_info: "警示信息",
		sos_record: "SOS记录",
		low_power_remind: "低电量提醒",
		no_untreated_alarm_info: "无任何未处理报警信息",
		twice_password_diff: "两次密码不一致",
		twice_password_same: "两次密码一致",
		password_not_empty: "密码不能为空",
		info: "信息",
		input_old_password_wrong: "输入原始密码错误",
		personnel: "人员",
		enter: "进入",
		leave: "离开",
		in: "在",
		area_over_man: "区域聚集",
		area_overtime: "区域超时",
		area_static: "区域不动",
		area_disappear: "区域消失",
		no_escort_group: "无人陪同，陪同组：",
		leave_group: "离群，群组：",
		danger_danger_source: "靠近危险源，危险源：",
		miss_station: "基站掉线，基站ID：",
		help: "求救",
		heart_error: "心率异常",
		blood_error: "血压异常",
		fall: "跌落",
		dismantle: "强拆",
		area_overmanned: "区域超员",
		no_new_alarm_info: "没有新的报警信息",
	},
	select_option: {
		select_all: "全部"
	}
};

export default Common;
