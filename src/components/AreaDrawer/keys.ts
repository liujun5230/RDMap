import type {InjectionKey, Ref} from "vue";

import type {RuleTypeResultItem} from "@/api/alarm/configuration";

export const RULE_TYPE_KEY : InjectionKey<Ref<RuleTypeResultItem[]>> = Symbol("rule_types");
export const RULE_AUTH_KEY: InjectionKey<Ref<{
	handle: boolean
	check: boolean
	delete: boolean
	all: boolean
}>> = Symbol("auth");

