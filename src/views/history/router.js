import Vue from "vue";
import VueRouter from "vue-router";

import HistoryPerson from "./person/index.vue";
import HistoryArea from "./area/index.vue";
import HistoryReplay from "./historyReplay/index.vue";
import authentication from "@/utils/js/authentication";
import {prerequest} from "@/utils/js/prerequest";

Vue.use(VueRouter);

const routes = [
	{
		path: "/person",
		component: HistoryPerson,
	},
	{
		path: "/area",
		component: HistoryArea,
	},
	{
		path: "/historyReplay",
		component: HistoryReplay,
	}
];

const router = new VueRouter({
	routes // (缩写) 相当于 routes: routes
});
authentication(router);
prerequest(router);

export default router;
