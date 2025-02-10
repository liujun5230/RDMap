import Vue from "vue";
import VueI18n from "vue-i18n";
import enLocale from "element-ui/lib/locale/lang/en";
import zhLocale from "element-ui/lib/locale/lang/zh-CN";
import twLocale from "element-ui/lib/locale/lang/zh-TW";
import enPage from "./en-us";
import zhPage from "./zh-cn";
import twPage from "./zh-tw";

Vue.use(VueI18n);

const messages = {
	"en-us": Object.assign(enPage, enLocale),
	"zh-cn": Object.assign(zhPage, zhLocale),
	"zh-tw": Object.assign(twPage, twLocale)
};

export default new VueI18n({
	locale: "zh-cn",
	fallbackLocale: "zh-cn",
	messages: messages
});
