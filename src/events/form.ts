import {type EventBusKey} from "@vueuse/core";
export type FK_FORM_ITEM = {
	type: "reset",
	el: any;
}

export const ADD_FK_FORM_ITEM: EventBusKey<FK_FORM_ITEM> = Symbol("add fk form item inside fk form");
