import Vue, {getCurrentScope, onScopeDispose} from "vue";
import type {EffectScope} from "vue";

import HGPlayer from "@/libs/video/player";

import LiveVideo from "@index/components/liveVideo/Index.vue";
import type {Props as LiveVideoProps} from "@index/components/liveVideo/Index.vue";

interface VideoProps extends LiveVideoProps {
	width?: number,
	height?: number
}

interface VideoEmitsOptions {
	close?: (event: "close") => void,
	fullscreen?: (event: "fullscreen", value: boolean) => void,
	videoInfo?: (event: "video-info", value: {data: any, player: HGPlayer}) => void,
	videoOpen?: (event: "video-open", value: {data: any, player: HGPlayer}) => void,
	videoError?: (event: "video-error", value: {data: any, player: HGPlayer}) => void,
}

interface VideoListeners {
    on?: VideoEmitsOptions,
    native?: Record<string, (event: any) => void>
}

interface VideoDialogOptions {
	auto_destroy?: boolean
}

const scope_map = new WeakMap<EffectScope, (() => void)[]>();

function setVideoDialogStyle(el: HTMLElement) {
	el.style.position = "absolute";
	el.style.top = "0";
	el.style.right = "0";
	el.style.bottom = "0";
	el.style.left = "0";
	el.style.margin = "auto";
	el.style.borderRadius = "4px";
	el.style.border = "1px solid #0dd3ff";
	el.style.boxShadow = "0px 4px 46px 0px rgba(0, 0, 0, 0.60)";
}

function setFullscreen(el: HTMLElement, is_fullscreen: boolean) {
	if (is_fullscreen) {
		el.style.width = "100vw";
		el.style.height = "100vh";
		el.style.top = "0";
		el.style.right = "0";
		el.style.bottom = "0";
		el.style.left = "0";
	} else {
		el.style.width = el.dataset.width!;
		el.style.height = el.dataset.height!;
		if (el.dataset.top && el.dataset.left) {
			el.style.right = "";
			el.style.bottom = "";
			el.style.top = el.dataset.top;
			el.style.left = el.dataset.left;
		} else {
			el.style.top = "0";
			el.style.right = "0";
			el.style.bottom = "0";
			el.style.left = "0";
		}
	}
}

export function useVideoDialog(options?: VideoDialogOptions) {
	const {auto_destroy = true} = options || {};
	const scope = getCurrentScope();

	const createVideo = (props: VideoProps, listeners?: VideoListeners) => {
		let instance: InstanceType<typeof LiveVideo> | null;

		const {on, native} = listeners || {};

		const setNativeEventListener = (is_subscribe: boolean) => {
			if (native && instance) {
				// 取消原生事件订阅
				Object.keys(native).forEach((event_name) => {
					if (is_subscribe) {
						instance!.$nextTick(() => {
							instance!.$el.addEventListener(event_name, native[event_name]);
						});
					} else {
						instance!.$el.removeEventListener(event_name, native[event_name]);
					}
				});
			}
		};

		const destroy = () => {
			if (!instance) return;
			setNativeEventListener(false);
			instance.destroyVideo();
			instance.$off();
			instance.$destroy();
			document.body.removeChild(instance.$el);
			instance = null;
		};

		const video_constructor = Vue.extend(LiveVideo as any);
		instance = new video_constructor({
			propsData: {
				...props,
				useSystemConfig: true,
				draggable: true,
				stretchable: true
			},
		}) as InstanceType<typeof LiveVideo>;

		// 订阅事件
		if (on) {
			Object.keys(on).forEach((name) => {
				if (!instance) return;
				const event_name = name as keyof VideoEmitsOptions;
				instance.$on(event_name, on[event_name]!);
			});
		}
		setNativeEventListener(true);

		// 处理全屏事件
		instance.$on("fullscreen", (is_fullscreen: boolean) => {
			if (!instance) return;
			const el = instance.$el as HTMLElement;
			setFullscreen(el, is_fullscreen);
		});

		// 处理关闭事件
		instance.$on("close", () => {
			destroy();
		});

		// 收集组件内的视频弹窗
		if (scope) {
			const destroy_fn_list = scope_map.get(scope) || [];
			destroy_fn_list.push(destroy);
			scope_map.set(scope, destroy_fn_list);
		}

		instance.$mount();
		setVideoDialogStyle(instance.$el as HTMLElement);
		document.body.appendChild(instance.$el);

		return destroy;
	};

	if (scope) {
		onScopeDispose(() => {
			if (auto_destroy) {
				const destroy_fn_list = scope_map.get(scope) || [];
				destroy_fn_list.forEach((destroy) => destroy());
				scope_map.delete(scope);
			}
		});
	}

	return {
		createVideo
	};
}
