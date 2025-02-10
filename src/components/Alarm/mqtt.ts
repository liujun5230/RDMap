import {
	mqtt_ws_url,
	mqtt_user_name,
	mqtt_password,
} from "@/Config";
import type {MaybeRefOrGetter} from "@vueuse/core";

import mqtt from "mqtt";
import {onScopeDispose} from "vue";
import {toValue} from "@vueuse/core";

type MQTTConfig = {
	topics: MaybeRefOrGetter<string[]>;
	onMessage(topic: string, message: unknown): void;
}

export function matchTopic(topic: string, target: string) {
	if (topic.includes("#")) {
		return target.startsWith(topic.split("#")[0]);
	}

	if (topic.includes("+")) {
		const topic_arr = topic.split("+");
		return target.startsWith(topic_arr[0]) && target.endsWith(topic_arr[1]);
	}

	return topic === target;
}

export function useMQTT({
	topics,
	onMessage
}: MQTTConfig
) {
	const client = mqtt.connect(mqtt_ws_url, {
		username: mqtt_user_name,
		password: mqtt_password
	});

	client.on("connect", function (granted) {
		console.debug("connected", granted);
		client.subscribe(toValue(topics));
	});

	client.on("message", (topic, payload) => {
		onMessage?.(topic, JSON.parse(payload.toString()));
	});

	onScopeDispose(() => {
		client.end();
	});

	const stop = () => {
		client.end();
	};

	return stop;
}
