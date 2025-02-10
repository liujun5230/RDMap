<template>
<label class="fk-label">
	<el-dropdown
		trigger="click"
		placement="bottom-start"
		@command="handleCommand"
		@visible-change="visibleChange"
	>
		<span class="el-dropdown-link">
			{{ label }}
			<i
				class="arrow-icon"
				:class="props.arrowIcon"
				:style="{transform: 'rotate(' + (is_visible ? 180 : 0) + 'deg)'}"
			/>
		</span>
		<el-dropdown-menu
			slot="dropdown"
			class="label-dropdown"
			:class="props.popperClass"
		>
			<el-dropdown-item
				v-for="item in props.options"
				:key="item.value"
				:command="item.value"
				:class="{selected: props.value === item.value}"
			>
				{{ item.label }}
				<el-tooltip
					v-if="item.tooltip"
					effect="dark"
					:content="item.tooltip"
					placement="top"
				>
					<i class="hg-icons hg-icon-tooltip-question" />
				</el-tooltip>
			</el-dropdown-item>
		</el-dropdown-menu>
	</el-dropdown>
</label>
</template>

<script setup>
import {computed, ref, watch} from "vue";

import {useUserStorage} from "@/utils/js/storageByUser";

const store = useUserStorage();

const props = defineProps({
	options: {
		type: Array,
		required: true
	},
	cacheKey: {
		type: String,
		default: "fk_label"
	},
	useCache: {
		type: Boolean,
		default: true,
	},
	value: {
		type: String,
		required: true
	},
	arrowIcon: {
		type: String,
		default: "el-icon-caret-bottom"
	},
	popperClass: {
		type: String,
		default: ""
	}
});

const is_visible = ref(false);

const current_item = computed(() => {
	const item = props.options.find(i => i.value === props.value);
	return item;
});
const label = computed(() => current_item.value?.label || "");
const wait_key = ref("");

const showCache = (command) => {
	if (!command || wait_key.value) {
		let data = "";
		if (props.options.length) {
			data = props.options[0].value;
		}
		if (props.useCache) {
			const label = store.getItem(props.cacheKey);
			if (props.options.find(i => i.value === label)) { // 可能对应的option还没拿到
				data = label;
			} else {
				wait_key.value = label;
			}
		}
		data && emits("input", data);
	}
};

watch(
	() => props.options,
	() => {
		showCache(props.value);
	},
	{deep: true}
);

watch(
	() => props.cacheKey,
	() => {
		showCache("");
	},
	{immediate: true}
);

const handleCommand = (command) => {
	if (props.useCache) {
		store.setItem(props.cacheKey, command);
	}
	emits("input", command);
};

const visibleChange = (visible) => {
	is_visible.value = visible;
};

const setValue = (data) => {
	wait_key.value = "";
	emits("input", data);
};

const emits = defineEmits(["input"]);
defineExpose({setValue});
</script>

<style scoped lang="scss">
.label-dropdown {
	.el-dropdown-menu__item {
		padding: 0 12px;
	}
	&.el-popper.el-dropdown-menu {
		margin-top: 6px;
		transform: translateX(-12px);
		:deep(.popper__arrow) {
			display: none;
		}
	}
}

.custom-theme-blue {
	.label-dropdown {
		.el-dropdown-menu__item:focus,
		.el-dropdown-menu__item:not(.is-disabled):hover {
			background-color: #E2EEFB;
			color: #748ba4;
		}

		.el-dropdown-menu__item.selected {
			color: #07f !important;
		}
	}
}

.custom-theme-green {
	.label-dropdown {
		.el-dropdown-menu__item:focus,
		.el-dropdown-menu__item:not(.is-disabled):hover {
			background-color: #EBF9F8;
			color: #748ba4;
		}

		.el-dropdown-menu__item.selected {
			color: #3eb2a9 !important;
		}
	}
}
</style>
