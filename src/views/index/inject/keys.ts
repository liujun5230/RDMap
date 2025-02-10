import type {InjectionKey, Ref} from "vue";

export const EVACUATION_STATE_KEY: InjectionKey<Ref<{evacuation: boolean, evacuation_over: boolean}>> = Symbol("EvacuationState");
export const BTN_HANDLE_AUTH_KEY: InjectionKey<Ref<boolean>> = Symbol("btn_handle_auth");
