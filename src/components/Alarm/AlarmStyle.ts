export type AlarmStyle = {
  background_color: string;
  color: string;
}

/**
 * @description 根据报警等级以及告警类型创建告警样式
 * @param rule_type 报警规则类型
 * @param level 报警等级
 * @returns 报警颜色
 */
export function createAlarmLevelStyle(color: string): AlarmStyle {
	const background_color = color;
	return {
		background_color: background_color ?? "#fff",
		color: "#000"
	};
}
