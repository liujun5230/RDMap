<template>
<div
	class="base-info-box"
	v-on="$listeners"
>
	<div
		v-if="props.imgParam"
		class="img-box"
		:class="props.imgParam.imgBoxClass"
	>
		<img
			:src="props.imgParam.src"
			:class="props.imgParam.imgClass"
		>
		<span>{{ props.imgParam.name }}</span>
	</div>
	<div class="list-box">
		<p
			v-for="col in props.columns"
			:key="col.prop"
		>
			<text-ellipsis
				v-if="col.prop === 'areas'"
				class="custom-ellipsis"
			>
				<span class="description-label">{{ col.label }}</span>
				<span
					v-if="!areas_data.length"
					class="general-text"
				>--</span>
				<span v-else>
					<span
						v-for="(item,index) in areas_data"
						:key="item.area_id"
						class="clickable-color"
					><span
						class="clickable-text"
						@click.stop="clickFunction(props.data,col,item)"
					>{{ item.area_name }}</span>{{ (index !== areas_data.length - 1) ? "、" : "" }}</span>
				</span>

				<template #tooltip>
					<span
						v-for="(item,index) in areas_data"
						:key="item.area_id"
						class="tooltip-clickable-color"
					><span
						class="tooltip-clickable-text"
						@click.stop="clickFunction(props.data,col,item)"
					>{{ item.area_name }}</span>{{
						(index !== areas_data.length - 1) ? "、" : ""
					}}</span>
				</template>
			</text-ellipsis>
			<text-ellipsis
				v-else
				class="custom-ellipsis"
			>
				<span class="description-label">{{ col.label }}</span>
				<span
					:class=" {'id-code-gap':col.prop === 'id_code','clickable-text' : getPropClass(props.data,col),'general-text' : !getPropClass(props.data,col)}"
					@click.stop="clickFunction(props.data,col)"
				>{{ formatValue(props.data,col) }}</span>

				<template #tooltip>
					<span>{{ formatValue(props.data,col) }}</span>
				</template>
			</text-ellipsis>

			<slot
				:name="col.prop"
			/>
		</p>
		<slot name="handleBtn" />
	</div>
	<slot name="emergency" />
</div>
</template>
<script setup lang="ts">
import {computed} from "vue";
import TextEllipsis from "@/components/TextEllipsis.vue";

type AreaData = {
	area_id?:number,
	area_name?:string
}

type Column = {
	readonly label: string;
	readonly prop: string;
	readonly is_click?:boolean;
	readonly clickFunction?: (data: Props["data"], area_data?:AreaData) => any;
}
type ImgType = {
	src:string,
	name:string,
	imgBoxClass?:string,
	imgClass?:string
}

type Props = {
	columns: Column[],
	data: Record<string, any>,
	imgParam?: ImgType
}

const props = withDefaults(defineProps<Props>(), {
	imgParam: undefined
});

const areas_data = computed(() => getChainPropValue(props.data, "areas"));

function formatNull(value: any, empty_text: string) {
	return [null, undefined, ""].includes(value) ? empty_text : value;
}

function formatValue(data: Props["data"], col: Column) {
	const origin_val = getChainPropValue(data, col.prop);
	return formatNull(origin_val, "--");
}

function getChainPropValue(data: Props["data"], key: string) {
	const keys = key.split(".");
	return keys.reduce((result: any, key) => {
		try {
			result = result[key];
			return result;
		} catch (error) {
			console.error(error);
			return "";
		}
	}, data);
}

function getPropClass(data: Props["data"], col: Column) {
	return col.is_click && formatValue(data, col) !== "--";
}

function clickFunction(data: Props["data"], col: Column, area_data?:AreaData) {
	if (!col.is_click || formatValue(data, col) === "--") return;
	if (typeof col.clickFunction === "function") col.clickFunction(data, area_data);
}

</script>
<style scoped lang="scss">
.base-info-box {
    display: flex;
	flex-direction: row;
    box-sizing: border-box;
    padding: 16px;
	border-radius: 5px;
	border: 1px solid #E5E9EC;
	background: #FBFDFF;
	color: #a2b2c2;
    margin-bottom: 16px;
}
.img-box {
    position: relative;
	background-color: #EBF2F7;
	margin-right: 16px;
	border-radius: 8px;
	display: flex;
	justify-content: center;
	align-items: center;
	img {
        width: 100%;
        height: 100%;
		border-radius: 8px;
	}
	span {
		padding: 5px 8px;
		position: absolute;
		right: 0;
		bottom: 0;
		background-color: #E1EAF2;
		color:#748BA4;
		font-size:12px;
		border-radius: 5px 0px;
	}
}

.list-box {
    flex:1;
	width: 0;
    p {
		margin-top: 0px;
		margin-bottom: 7px;
	}
    .description-label {
        color: #a2b2c2;
        &::after{
            content: "：";
        }
    }
}

.id-code-gap {
	line-height: 28px;
	display: block;
}

.custom-ellipsis {
	max-width: 100%;
	vertical-align: bottom;
}

.general-text {
	color: #748BA4;
	cursor: context-menu;
}

.custom-theme-blue .clickable-color {
	color: #07F;
}

.custom-theme-green .clickable-color {
	color: #3eb2a9;
}

.custom-theme-blue .tooltip-clickable-text {
	text-decoration: none;
	color: #66ADFF;
	cursor: pointer;
}

.custom-theme-green .tooltip-clickable-text {
	text-decoration: none;
	color: #3EB2A9;
	cursor: pointer;
}

.custom-theme-blue .tooltip-clickable-color{
	color: #66ADFF;
}
.custom-theme-green .tooltip-clickable-color{
	color: #3EB2A9;
}

.tooltip-clickable-text:hover {
	text-decoration: underline;
	text-underline-offset: 2px;
}

</style>
