import Vue from "vue";
import VueI18n from "vue-i18n";
import store from "@/store";

import cn from "./zh-cn";
import en from "./en-us";
import tw from "./zh-tw";

Vue.use(VueI18n);

const messages = {
	"zh-cn": {common: {...cn}, ...cn},
	"en-us": {common: {...en}, ...en},
	"zh-tw": {common: {...tw}, ...tw}
};

export default new VueI18n({
	// TODO: 暂时不用多语言，会报变量在初始化前使用错误
	locale: store.getters.language,
	messages: messages
});
