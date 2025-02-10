import Vue from "vue";
import {PiniaVuePlugin, createPinia} from "pinia";
import {VueJsonp} from "vue-jsonp";
import ElementLocale from "element-ui/lib/locale";
import {
	MessageBox,
	Message,
	Notification,
	Menu,
	Submenu,
	MenuItem,
	Dropdown,
	DropdownMenu,
	DropdownItem,
	Scrollbar,
	Popover,
	Slider,
	Button,
	Table,
	TableColumn,
	Input,
	Select,
	Option,
	DatePicker,
	Link,
	Divider,
	Switch,
	Image,
	Checkbox,
	Progress,
	Dialog,
	Form,
	FormItem,
	Autocomplete,
	Tooltip,
	Cascader,
	TimeSelect,
	Pagination,
	CheckboxGroup,
	Loading,
	Tag
} from "element-ui";

import i18n from "@/lang/history";
import store from "@/store";
import "@/utils/js/directive/preventRepeatClick";

import "./style/index.css";
import App from "./History.vue";
import router from "./router.js";

Vue.use(VueJsonp);
Vue.use(Menu);
Vue.use(Submenu);
Vue.use(MenuItem);
Vue.use(Dropdown);
Vue.use(DropdownMenu);
Vue.use(DropdownItem);
Vue.use(Scrollbar);
Vue.use(Popover);
Vue.use(DatePicker);
Vue.use(Input);
Vue.use(Button);
Vue.use(Slider);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Select);
Vue.use(Option);
Vue.use(Link);
Vue.use(Divider);
Vue.use(Switch);
Vue.use(Image);
Vue.use(CheckboxGroup);
Vue.use(Checkbox);
Vue.use(Progress);
Vue.use(Dialog);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Autocomplete);
Vue.use(Tooltip);
Vue.use(Cascader);
Vue.use(TimeSelect);
Vue.use(Pagination);
Vue.use(Loading);
Vue.use(Tag);
Vue.use(PiniaVuePlugin);

Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$message = Message;
Vue.prototype.$notify = Notification;
// 自定义指令，v-drag拖动元素
Vue.directive("drag", {
	bind(element) {
		const drag_box = element; // 获取当前元素
		drag_box.onmousedown = (e) => {
			if (drag_box.dataset.full === 1) {
				return;
			}
			const container = drag_box.parentNode;
			container.style.zIndex = 2000;
			e.stopPropagation();
			// 算出鼠标相对元素的位置
			const dis_x = e.clientX - container.offsetLeft;
			const dis_y = e.clientY - container.offsetTop;

			document.onmousemove = (e) => {
				// 用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
				const left = e.clientX - dis_x;
				const top = e.clientY - dis_y;

				// 移动当前元素
				container.style.left = left + "px";
				container.style.top = top + "px";
			};

			document.onmouseup = () => {
				// 鼠标弹起来的时候不再移动
				document.onmousemove = null;
				// 预防鼠标弹起来后还会循环（即预防鼠标放上去的时候还会移动）
				document.onmouseup = null;
			};
		};
	},
});

ElementLocale.i18n((key, value) => i18n.t(key, value));
i18n.locale = store.getters.language;
const pinia = createPinia();

new Vue({
	i18n,
	el: "#app",
	router,
	store,
	pinia,
	render: h => h(App)
});
