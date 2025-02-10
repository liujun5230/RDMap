import type {InjectionKey, Ref} from "vue";

export const RuleIdProvideKey = Symbol("RuleIdProvideKey") as InjectionKey<Ref<number>>;

export const LocalElFormProvideKey = "elForm" as unknown as InjectionKey<{}>;

export enum TIME_UNIT {
	hour = "时",
	minute = "分",
	second = "秒"
}
