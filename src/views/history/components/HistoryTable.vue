<template>
<div id="table-history-card">
	<el-button
		id="btn-expand-history"
		size="mini"
		circle
		@click="toggleTable()"
	>
		<fk-icon
			tip="历史列表"
			size="22"
			placement="right"
		>
			<history-table-icon />
		</fk-icon>
	</el-button>
	<div
		v-show="show_table"
		class="history-table-container"
	>
		<header class="table-header">
			<div :style="{color: '#748ba4'}">
				历史列表
				<el-tooltip
					content="轨迹回放为真实定位数据，不包括离线后的位置信息，与【进出区域统计】等统计页面存在时间差"
					placement="top"
				>
					<i
						class="el-icon-warning-outline"
						style="color: #a2b2c2;transform: rotateZ(180deg);"
					/>
				</el-tooltip>
			</div>
			<i
				class="hg-icons hg-icon-left"
				:style="{color: THEME_COLOR[theme]}"
				@click="toggleTable(false)"
			/>
		</header>
		<main class="table-main">
			<fk-table
				ref="history_list_table"
				v-loading="loading"
				:data="props.historyList"
				height="256px"
				:cell-style="highlightCurrentRow"
			>
				<el-table-column
					prop="start_str"
					:label="$t('table.start_time')"
					min-width="140"
					show-overflow-tooltip
				/>
				<el-table-column
					prop="end_str"
					:label="$t('table.end_time')"
					min-width="140"
					show-overflow-tooltip
				/>
				<el-table-column
					prop="floor_str"
					:label="$t('table.map')"
					class-name="direction-rtl"
					min-width="160"
					show-overflow-tooltip
				/>
				<el-table-column
					prop="name"
					label="名称"
					min-width="100"
					show-overflow-tooltip
				/>
				<el-table-column
					:label="$t('table.operation')"
					width="94"
				>
					<template #default="{row}">
						<el-tooltip
							v-for="item in row.links"
							:key="item.index"
							effect="dark"
							:content="TABLE_OPERATION_TOOLTIP_CONTENT_MAP[item.type]"
							placement="top"
						>
							<fk-table-button
								type="success"
								class="handle-icon-btn"
								circle
								plain
								size="mini"
								@click="
									startPlayBackHistory(
										item.type,
										row,
									)
								"
							>
								<history-object v-if="item.type === 'truck'" />
								<heat-map v-else-if="item.type === 'heatMap'" />
								<video-icon v-else />
							</fk-table-button>
						</el-tooltip>
					</template>
				</el-table-column>
			</fk-table>
		</main>
	</div>
</div>
</template>

<script setup>
import {ref, watch, inject} from "vue";

import {THEME_COLOR} from "@/Config";
import FkTable from "@/components/ForThink/Table/FkTable.vue";
import FkIcon from "@/components/ForThink/FkIcon.vue";
import HistoryTableIcon from "~icons/operation/history-table";
import "@/utils/css/iconFonts/operationIcon.css";
import FkTableButton from "@/components/ForThink/Table/FkTableButton.vue";
import HeatMap from "~icons/operation/heat-map";
import HistoryObject from "~icons/operation/history-object";
import VideoIcon from "~icons/operation/video";

const theme = inject("THEME");

const props = defineProps({
	historyList: {
		type: Array,
		required: true
	},
	tableCurIdx: {
		type: Number,
		default: -1
	},
	loading: {
		type: Boolean,
		default: false
	}
});

const emits = defineEmits(["play-back-history", "update:tableCurIdx"]);

const TABLE_OPERATION_TOOLTIP_CONTENT_MAP = {
	truck: "查看轨迹",
	heatMap: "查看热力图",
	video: "查看视频"
};
const show_table = ref(true);
const history_list_table = ref(null);

watch(() => props.historyList, () => {
	show_table.value = true;
});

function highlightCurrentRow({rowIndex}) {
	if (rowIndex === props.tableCurIdx) {
		// 高亮当前播放的楼层数据
		return {background: theme.value === "custom-theme-green" ? "#ebf9f8" : "#e2eefb"};
	}
}

function toggleTable(is_expand) {
	if (is_expand === undefined) {
		show_table.value = !show_table.value;
	} else {
		show_table.value = is_expand;
	}
}

function startPlayBackHistory(type, row) {
	emits("play-back-history", {...row, type});
	emits("update:tableCurIdx", row.index);
}

function playOtherData(flag) {
	show_table.value || (show_table.value = true);
	let table_cur_idx = props.tableCurIdx;
	if (flag === "pre") {
		if (table_cur_idx <= 0) return;
		table_cur_idx -= 1;
	} else if (flag === "next") {
		if (table_cur_idx >= props.historyList.length - 1) return;
		table_cur_idx += 1;
	}
	const row = props.historyList[table_cur_idx];
	startPlayBackHistory(row.links[0].type, row);
	history_list_table.value?.setCurrentRow(row);
}

defineExpose({
	playOtherData
});
</script>

<style lang="scss" scoped>
#table-history-card {
	width: 682px;
	border-radius: 4px;
	text-align: center;
	position: absolute;
	z-index: 1003;

	.hg-icons {
		font-size: 10px;
		margin-left: 8px;
	}
}

.history-table-container {
	background-color: #fff;
	border: 1px solid #eff3f6;
	position: absolute;
	top: 0;
	left: 44px;

	.table-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 16px;
		height: 36px;
		background-color: #f6f7fc;
		font-size: 14px;

		.hg-icons {
			cursor: pointer;
		}
	}

	.table-main {
		padding: 16px;
	}
}

#btn-expand-history {
	float: left;
	margin-left: 6px;
}
</style>
