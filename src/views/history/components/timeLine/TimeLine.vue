<template>
<div
	v-show="visible"
	class="time-line"
>
	<header class="time-line__header">
		<div class="inline-flex items-center">
			<span class="mr-1">时间轴</span>
			<fk-icon tip="显示定位对象进出某楼层的时间点，点击后能够快速跳转到此时间点开始回放轨迹。">
				<icon-header-question />
			</fk-icon>
		</div>
		<fk-icon
			class="close-icon"
			size="14"
			@click="closeDialog"
		>
			<close-icon />
		</fk-icon>
	</header>
	<main
		v-loading="loading"
		class="time-line__content"
	>
		<el-form
			:inline="true"
			size="small"
			class="flex-none"
		>
			<el-form-item
				class="label-form-item"
				label="定位对象"
			>
				<el-select
					v-model="search_data.uuid_list"
					class="uuid-select"
					clearable
					filterable
					multiple
					collapse-tags
					reserve-keyword
					popper-class="uuid-select-dropdown"
					placeholder="请选择定位对象"
					:loading="select_loading"
					:style="{width: '235px', '--ml': search_data.uuid_list.length ? '15px' : '30px'}"
					@change="handleChangeUUID"
				>
					<template #prefix>
						<i
							class="el-input__icon el-icon-search"
						/>
					</template>
					<template #default>
						<el-option
							v-for="item in search_person_list"
							:key="item.uuid"
							:label="item.label"
							:value="item.uuid"
						>
							<text-ellipsis style="max-width: 235px;">
								{{ item.label }}
							</text-ellipsis>
						</el-option>
					</template>
				</el-select>
			</el-form-item>
		</el-form>
		<div class="time-sort">
			<span>时间轴排序</span>
			<div
				class="inline-flex flex-col gap-y-0.5 cursor-pointer"
				@click="handleSort"
			>
				<div
					class="triangle-icon"
					:class="{active: sort === 'asc'}"
				/>
				<div
					class="triangle-icon rotate-180"
					:class="{active: sort === 'desc'}"
				/>
			</div>
		</div>
		<dynamic-scroller
			:items="timeline_list"
			:min-item-size="62"
			key-field="key"
			class="dynamic-scroller"
		>
			<template #default="{ item, index, active }">
				<dynamic-scroller-item
					:item="item"
					:active="active"
					:size-dependencies="[
						item.name_list,
						item.description_list
					]"
					:data-index="index"
				>
					<line-item
						:key="item.key"
						:datetime="item.time"
						:type="item.type"
						:name-list="item.name_list"
						:description-list="item.description_list"
						:start="index === 0"
						:end="index === timeline_list.length - 1"
						@click="handleClick(item)"
					/>
				</dynamic-scroller-item>
			</template>
		</dynamic-scroller>
	</main>
</div>
</template>

<script setup lang="ts">
import {shallowRef, ref, inject, watch, type Ref} from "vue";
import {storeToRefs} from "pinia";
import {throttle} from "lodash-es";
// @ts-ignore
import {DynamicScroller, DynamicScrollerItem} from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

import FkIcon from "@/components/ForThink/FkIcon.vue";
import CloseIcon from "~icons/operation/stroke-close";
import IconHeaderQuestion from "~icons/operation/header-question";
import {getHistoryTimeLine, type TimeLineResult} from "@/api/history/scene";
import {useLoading} from "@/composable";
import {cleanupExpiredEffect} from "@/utils/js/common";

import {useHistoryStore} from "@/views/history/store";
import {REPLAY_WAY} from "@/views/history/constant";
import type {FloorItem} from "@/views/history/type";

import LineItem from "./LineItem.vue";

const FLOOR_OBJ = inject<Ref<Record<number, FloorItem>>>("FLOOR_OBJ", ref({}));

const emits = defineEmits<{
	(event: "click", value: TimelineItem & {
		start: number,
		end: number
	}): void,
	(event: "update:visible", value: boolean): void,
}>();

interface Props {
	visible: boolean,
	startTime: number,
	endTime: number,
	uuidList: number[],
	floorId: number
}
const props = defineProps<Props>();

type TimelineItem = Omit<TimeLineResult["timeline_list"]["0"], "type"> & {
	type: "enter" | "out",
}
const timeline_list = shallowRef<TimelineItem[]>([]);
const search_data = ref<{uuid_list: number[]}>({uuid_list: []});
type PersonOptionItem = {label: string, uuid: number, name: string, card_id: number}
const search_person_list = shallowRef<PersonOptionItem[]>([]);
const select_loading = ref(false);
const sort = ref<"asc" | "desc">();

const {replay_way} = storeToRefs(useHistoryStore());
const {loading, startLoading, endLoading} = useLoading();

const fetchTimelineData = cleanupExpiredEffect(async (onCleanup: (cb: () => void) => void, uuid_list = search_data.value.uuid_list, is_init = false) => {
	let is_validate = true;
	onCleanup(() => {
		is_validate = false;
	});
	const {startTime, endTime, floorId} = props;
	startLoading();
	const {data: res} = await getHistoryTimeLine({
		floor_id: replay_way.value === REPLAY_WAY.floor ? floorId : undefined,
		scene_id: replay_way.value === REPLAY_WAY.floor ? undefined : FLOOR_OBJ.value[floorId].scene_id,
		order: sort.value,
		begin: startTime,
		end: endTime,
		uuid_list,
	}).catch(() => ({data: undefined}));
	endLoading();
	if (!is_validate) return;
	if (res?.type === 1) {
		timeline_list.value = res.result.timeline_list.map((item, index) => {
			return {
				...item,
				type: item.type === 0 ? "enter" : "out",
				time: item.time * 1000,
				key: `${item.time}-${index}`
			};
		});
		if (is_init) {
			search_person_list.value = res.result.location_objects.map((item) => {
				return {
					...item,
					label: formatOptionLabel(item),
				};
			});
			search_data.value.uuid_list = res.result.location_objects.map(({uuid}) => uuid);
		}
	} else {
		timeline_list.value = [];
	}
});

const handleChangeUUID = throttle(() => {
	fetchTimelineData();
}, 800);

watch(() => props.visible, () => {
	if (props.visible) {
		fetchTimelineData(props.uuidList, true);
	}
}, {immediate: true});

function formatOptionLabel(item: TimeLineResult["location_objects"]["0"]) {
	return [item.name, item.card_id].filter(Boolean).join("-");
}

function handleSort() {
	switch (sort.value) {
	case undefined:
		sort.value = "asc";
		break;
	case "asc":
		sort.value = "desc";
		break;
	case "desc":
		sort.value = undefined;
		break;
	}
	fetchTimelineData();
}

function handleClick(item: TimelineItem) {
	emits("click", {
		...item,
		start: props.startTime * 1000,
		end: props.endTime * 1000
	});
}

function closeDialog() {
	emits("update:visible", false);
}
</script>

<style scoped>
.time-line {
    --position: absolute;
    --width: 348px;
    --top: 108px;
    --right: 20px;
    --bottom: 106px;
	--z-index: 799;

    border-radius: 5px;
    overflow: hidden;
    box-sizing: border-box;
    position: var(--position);
    width: var(--width);
    top: var(--top);
    right: var(--right);
    bottom: var(--bottom);
	z-index: var(--z-index);
    display: flex;
    flex-direction: column;

    .time-line__header {
        flex: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 9px 16px;
        background-color: var(--dialog-header-background);
        color: var(--text-color-gray-dark);
        font-size: 14px;
        line-height: 22px;

        .close-icon {
            color: #305CAB;

            &:hover {
                cursor: pointer;
            }
        }
    }

    .time-line__content {
        flex: 1;
        padding: 12px 0;
        background-color: #fff;
        display: flex;
        flex-direction: column;
        gap: 10px 0;
        overflow: auto;
        color: var(--theme-text-color-normal);

        .el-form {
			padding: 0 16px;

            .el-form-item {
                height: 32px;
                margin-bottom: 0;
                margin-right: 0;
            }

            :deep(.el-form-item__label) {
                height: 32px;
                line-height: 32px;
                border: 1px solid #dcdfe6;
                border-radius: 4px 0 0 4px;
                border-right: none;
                background-color: #fff;
                color: #748ba4;
                padding: 0 12px;
            }

            .uuid-select.el-select {
                --ml: 30px;

                :deep(.el-select__input) {
                    margin-left: var(--ml);
                    color: #a2b2c2;
                }

				:deep(.el-input__inner) {
					border-radius: 0 4px 4px 0;
				}

                :deep(.el-tag) {
                    max-width: 132px;
                    border-radius: 12px;
                }

                :deep(.el-tag__close) {
                    background-color: transparent;
                }

                :deep(.el-tag__close:hover) {
                    color: #fff !important;
                    background-color: #07f;
                }
            }
        }

        .time-sort {
			padding: 0 16px;
            flex: none;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            column-gap: 6px;
            font-size: 14px;

            .triangle-icon {
                border: 6px solid transparent;
                border-bottom-color: var(--theme-text-color-normal);

                &.active {
                    border-bottom-color: var(--theme-color);
                }
            }
        }

		.dynamic-scroller {
			padding: 0 16px;
		}
    }
}
</style>
