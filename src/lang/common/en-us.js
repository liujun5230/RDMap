const Common = {
	notify: {
		title: {
			success: "Success",
			error: "Error",
			add_success: "Added successfully",
			update_success: "Update completed",
			save_success: "Saved successfully",
			delete_success: "Deleted successfully",
		},
		message: {
			time_repeat: "Time can not repeat",
			time_same: "The start and end time cannot be the same",
			refresh: "Now renew data",
			h265: "Browser does not support H265 encoded video playback"
		},
	},
	warning: {
		deletion: "Unrecoverable after deletion. Please operate carefully.",
		relogin: "Confirm logout",
		message: {
			deletion: "It cannot be recovered after deletion, please be careful. <br> Are you sure you want to delete this item?",
			relogin: "You have been logged out,Please log in again",
		},
		btn: {
			cancel: "Cancel",
			login: "Re-Login"
		}
	},
	form: {
		symbol: {
			time_range_separator: "To",
		},
		placeholder: {
			name_or_card: "Please enter name or card id",
			begin: "start time",
			end: "end Time",
			time: "Please select time frame",
		},
		validate_error: {
			begin_bigger_end: "The start time cannot exceed the end time",
		},
		btn: {
			quit: "Cancel",
			save: "OK",
		},
	},
	table: {
		action_tips: {
			detail: "detail",
			edit: "edit",
			del: "delete",
			location: "location"
		},
		label: {
			index: "#",
			action: "Action",
		},
		checkbox: {
			selected: "Selected ",
			item: " items"
		}
	},
	rule: {
		time_is_forever: "Forever",
		to: "To",
		all_person: "All",
		no_handle_person: "No person",
		rule_type: {
			allow_enter: "Entrance is allowed only",
			refuse_enter: "Entrance is refused only",
			allow_leave: "Exit is allowed only",
			refuse_leave: "Exit is refused only",
			area_overtime: "Area Timeout",
			area_static: "Area Still",
			area_disappear: "Area Disappeared",
			gather_alarm: "Gathering Alarm",
			person_num_limit: "Limit of person number",
			no_judge: "No judgement",
		},
	},
	text: {
		mon: "Mon",
		tue: "Tue",
		wed: "Wed",
		thu: "Thu",
		fri: "Fri",
		sat: "Sat",
		sun: "Sun",
	},
	change_password_form: {
		header: "Change Password",
		placeholder: {
			password: "Please enter the original password",
			new_password: "Please enter a new password",
			confirm_new_password: "Please enter the new password again",
		},
		validate_error: {
			password_is_empty: "Please enter the original password",
			new_password_is_empty: "Please enter a new password",
			confirm_new_password_is_empty: "Please enter the new password again",
			password_is_different: "The two passwords did not match",
		},
		btn: {
			quit: "Cancel",
			save: "OK",
		},
	},
	header: {
		alarm: {
			no_new_alarm: "No new alarm info",
			alarm: "unprocessed warning info",
			help: "SOS records",
		},
		btn: {
			modify_password: "Modify Password",
			logout: "Logout",
		},
	},
	globalAlarm: {
		strange_card: "Stranger Card",
		monitor_to: "Monitored ",
		video: "Video",
		location: "Location",
		caution_info: "Warning Information",
		sos_record: "SOS Record",
		low_power_remind: "Low battery reminder",
		no_untreated_alarm_info: "No unprocessed alarm information",
		twice_password_diff: "Two passwords are inconsistent",
		twice_password_same: "Two passwords are consistent",
		password_not_empty: "Password cannot be empty",
		info: "Information",
		input_old_password_wrong: "Wrong input original password",
		personnel: "Personnel",
		enter: " enter ",
		leave: " leave ",
		in: " in ",
		area_over_man: " regional gathering",
		area_overtime: " area timeout",
		area_static: " area does not move",
		area_disappear: "area disappears",
		no_escort_group: " unaccompanied, accompanying group:",
		leave_group: " outlier, group:",
		danger_danger_source: " close to danger source, danger source:",
		miss_station: "Base station dropped, base station ID:",
		help: " help",
		heart_error: "Abnormal heart rate",
		blood_error: "Abnormal blood pressure",
		fall: " fall",
		dismantle: " forcible demolition",
		area_overmanned: " area exceed the number limit",
		no_new_alarm_info: "No new alarm information",
	},
	select_option: {
		select_all: "全部"
	}
};

export default Common;
