<template>
<KeepAlive>
	<el-tabs
		:value="active_name"
		type="card"
	>
		<el-tab-pane
			v-for="item in props.tabComponents"
			:key="item.name"
			:label="item.title"
			:name="item.name"
		>
			<template #label>
				{{ item.title }}
				<el-tooltip
					v-if="item.tips"
					:content="item.tips"
					placement="top"
				>
					<i class="hg-icons hg-icon-tooltip-question" />
				</el-tooltip>
			</template>
			<component :is="item.component" />
		</el-tab-pane>
	</el-tabs>
</KeepAlive>
</template>
<script setup lang="ts">
import {computed} from "vue";
import type {Component} from "vue";

type ArchiveTabComponentItem = {
	name:string,
	title:string,
	tips?:string,
	component:Component
}

type Props = {
	tabComponents: ArchiveTabComponentItem[] | [];
	activeName?:string
}

const props = withDefaults(defineProps<Props>(), {
	activeName: undefined,
	tabComponents: () => [],
});

const active_name = computed(() => props.activeName || props.tabComponents[0]?.name);

</script>
<style scoped lang="scss">
.el-tabs--card :deep(.el-tabs__header) {
	margin-bottom: 0 !important;
}

.el-tabs--card :deep(.el-tabs__header .el-tabs__item) {
	height: 40px;
	line-height: 40px;
	margin: 0;
	color: #A2B2C2;
}

.hg-icon-tooltip-question {
	font-size: 14px;
}

.custom-theme-blue .el-tabs--card :deep(.el-tabs__header .el-tabs__item.is-active) {
	color: #07F;
	background-color: #fbfdff;
}

.custom-theme-green .el-tabs--card :deep(.el-tabs__header .el-tabs__item.is-active) {
	color: #3eb2a9;
	background-color: #fbfdff;
}

.el-tabs--card :deep(.el-tabs__content) {
	border: 1px solid #eff3f6;
	border-top: none;
	border-radius: 0px 0px 5px 5px;
	background: #FBFDFF;
}

:deep(.el-tabs__content > .el-tab-pane > div) {
	height: calc(100vh - 494px);
}

@media screen and (height >=980px) {
	:deep(.el-tabs__content > .el-tab-pane > div) {
		height: 494px;
	}
}
</style>
