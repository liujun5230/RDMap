export function judgeTextLong(val) {
	if (val.length) {
		let len = 0;
		const length = val.length;
		for (let i = 0; i < length; i++) {
			if (/[\u4E00-\u9FA5]/.test(val[i]) || /[A-Z]/.test(val[i])) {
				len += 2;
			} else {
				if (/[0-9]/.test(val[i])) {
					len += 1.2;
				} else if (/w/.test(val[i])) {
					len += 1.6;
				} else if (/m/.test(val[i])) {
					len += 1.8;
				} else if (/i|j|l/.test(val[i])) {
					len += 0.6;
				} else {
					len++;
				}
			}
			if (len > 14) {
				return {
					omit: true,
					len: i
				};
			}
		}
		return {omit: false};
	}
}

/**
 *
 * @param id
 * @param branch_data
 * @param branch_list 不传
 * @returns {*[]}
 */
export function transTreeBranch(id, branch_data, branch_list = []) {
	branch_list.unshift(id);
	if (!branch_data[id] || branch_data[id].pid === 0 || branch_data[id].pid === -1) {
		return branch_list;
	} else {
		return transTreeBranch(branch_data[id].pid, branch_data, branch_list);
	}
}

export function isOverflow(className) {
	const ele = document.getElementsByClassName(className)[0];
	if (ele) {
		return ele.scrollWidth > ele.clientWidth;
	} else {
		return false;
	}
}

/**
 * 根据年月日算年龄
 * @param {string} birthday - 格式：'2023-01-01'
 * @returns {number[]} - 格式：[24, 3, 4] 24岁3月4天
 */
export function calcAge(birthday) {
	const birthday_arr = birthday.split("-");
	const date = new Date();
	const today = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
	const age = today.map((val, index) => {
		return val - birthday_arr[index];
	});

	if (age[2] < 0) {
		const lastMonth = new Date(today[0], today[1], 0);
		age[1]--;
		age[2] += lastMonth.getDate();
	}
	if (age[1] < 0) {
		age[0]--;
		age[1] += 12;
	}

	return age;
}
