<template>
<div
	ref="timeline_item_ref"
	class="time-line__item"
	:class="{'start': start, 'end': end}"
>
	<div class="item-datetime">
		<div class="item-datetime__content">
			<p class="item-time">
				{{ time }}
			</p>
			<p class="item-date">
				{{ date }}
			</p>
		</div>
		<div class="item-gap" />
	</div>
	<div class="item-line">
		<ring-icon :style="{'--outer-color': icon_color[type]}" />
		<div class="line" />
	</div>
	<div class="item-description">
		<div
			class="item-description__content"
			@click="handleClick"
		>
			<text-ellipsis
				style="width: 100%;"

				:line-clamp="2"
			>
				{{ nameList.join("、") }}
			</text-ellipsis>
			<text-ellipsis style="width: 100%;">
				{{ descriptionList.join("、") }}
			</text-ellipsis>
		</div>
		<div
			v-if="!end"
			class="item-gap"
		/>
	</div>
</div>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import {useDateFormat} from "@vueuse/core";

import TextEllipsis from "@/components/TextEllipsis.vue";

import RingIcon from "./RingIcon.vue";

const emits = defineEmits<{
	(event: "click"): void
}>();

interface Props {
	datetime: number | Date;
	type: "enter" | "out";
	nameList: string[];
	descriptionList: string[],
	start: boolean,
	end: boolean
}
const props = defineProps<Props>();

const icon_color = {
	enter: "#4196F6",
	out: "#A162F7"
} as const;

const timeline_item_ref = ref<HTMLElement | null>(null);

const date = computed(() => useDateFormat(props.datetime, "YYYY-MM-DD").value);
const time = computed(() => useDateFormat(props.datetime, "HH:mm:ss").value);
const item_height = computed(() => {
	const height = timeline_item_ref.value?.clientHeight;
	return height ? `${height}px` : "100%";
});

function handleClick() {
	emits("click");
}
</script>

<style scoped>
.time-line__item {
    display: flex;
    align-items: center;
    column-gap: 10px;

    .item-gap {
        width: 100%;
        height: 10px;
        background-color: #fff;
    }

    .item-datetime {
        flex: none;

        .item-datetime__content {
            position: relative;
            top: -5px;
            padding: 0 2px;
            font-size: 12px;
            line-height: 1;
            text-align: right;

            .item-time {
                color: var(--theme-text-color-gray);
                margin-bottom: 4px;
            }

            .item-date {
                color: var(--theme-text-color-normal);
            }
        }
    }

    .item-line {
        flex: none;
        height: v-bind("item_height");
        width: 12px;
        position: relative;

        .outer-ring {
            position: absolute;
            top: 50%;
            transform: translateY(calc(-50% - 10px));
            z-index: 1;
        }

        .line {
            position: relative;
            left: 5.5px;
            border-left: 1px solid #d1d8e1;
            height: 100%;
        }
    }

    &.start .item-line .line {
        top: calc(50% - 10px);
    }
    &.end .item-line .line {
        bottom: 15px;
    }

    .item-description {
        flex: 1;
        width: 0;

        .item-description__content {
            position: relative;
            top: -5px;
            border-radius: 6px;
            padding: 6px 12px;
            background-color: #F7FAFC;
            font-size: 12px;
            line-height: 20px;

            &:hover {
                cursor: pointer;
                background-color: #E2EEFB;
            }

            .fk-text-ellipsis:first-child {
                color: var(--theme-text-color-gray);
            }

            .fk-text-ellipsis:last-child {
                color: var(--theme-text-color-normal);
            }
        }
    }

    &.start .item-description .item-description__content {
        top: 0;
    }
}
</style>
