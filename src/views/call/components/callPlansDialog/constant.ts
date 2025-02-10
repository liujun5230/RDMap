import type {InjectionKey, Ref} from "vue";

export const RuleIdProvideKey = Symbol("RuleIdProvideKey") as InjectionKey<Ref<number>>;
