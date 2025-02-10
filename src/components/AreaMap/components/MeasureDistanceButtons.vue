<template>
<div
	class="measure-buttons"
>
	<button
		class="basic-button primary-button"
		@click="reMeasure"
	>
		重新绘制
	</button>
	<button
		class="basic-button alert-button"
		@click="exitMeasure"
	>
		退出绘制
	</button>
</div>
</template>

<script setup lang="ts">

function reMeasure() {
	emits("re-measure");
}

function exitMeasure() {
	emits("exit-measure");
}
const emits = defineEmits(["re-measure", "exit-measure"]);
</script>
<style scoped lang="scss">
.measure-buttons{
	display: flex;
	gap: 8px;
	position: absolute;
	bottom: 20px;
	left: 50%;
	transform: translateX(-50%);
	z-index: 200;
}

.basic-button {
	--button-height: calc(2em + var(--button-border-width) * 2);
	--button-icon-size: 1em;
	--button-padding-lr: clamp(8px, calc((1em - 12px) / 2 * 8 + 8px ), 16px);
	--button-border-width: 1px;
	font-family: "DingTalk JinBuTi" , sans-serif;
	font-size: var(--button-font-size, 14px);
	height: calc(var(--button-height) + var(--button-border-width) * 2);
	padding: 8px calc(var(--button-padding-lr) - var(--button-border-width));
	border-radius: 0.25rem;
	cursor: pointer;
}

.alert-button {
	border: #FAD2D7;
	color: var(--button-highlight-color, #F5F9FF);
	background: linear-gradient(139deg, #DB7D83 2.48%, #811A21 52.97%, #B54A51 81.94%);
	&:hover {
		border-color: #FAD2D7;
		color: var(--button-highlight-color, #F5F9FF);
		background: linear-gradient(139deg, #F1A8AD 2.48%, #A32830 52.97%, #E87C83 81.94%);
	}
	&:active {
		border-color: #FAD2D7;
		background: linear-gradient(139deg, #C97E83 2.48%, #892B31 52.97%, #C6525A 81.94%), linear-gradient(139deg, #F1A8AD 2.48%, #A32830 52.97%, #E87C83 81.94%);
	}
}

.primary-button {
	color: var(----text-minor-1, #B2C4DB);
	border: var(--button-border-width) solid #779AC7;
	background: linear-gradient(136deg, #5D7FB2 1.12%, #2B3D5A 41.8%, #162133 57.77%, #5A7CAF 100%);
	&:hover {
		border-color: #8ABDFF;
		color: var(--button-highlight-color, #F5F9FF);
		background: linear-gradient(141deg, #5596E0 -1.98%, #0F3866 54.41%, #5796DE 106.29%);
		&::after {
			width: 100%;
			height: 0.25rem;
			content: "";
			position: absolute;
			left: 0;
			bottom: 0;
			background:  no-repeat url(@/assets/images/index/button-light.svg);
			pointer-events: none;
		}
	}
	&:active {
		border-color: #8ABDFF;
		background: linear-gradient(136deg, #4C7AAD 1.12%, #1E3957 52.11%, #223D5C 60.86%, #4977AB 100%), linear-gradient(136deg, #7BA6D8 1.12%, #0F345E 52.11%, #103763 60.86%, #649FE2 100%);
	}
}

.disabled-button{
	opacity: 0.5;
	cursor: not-allowed;
}
</style>

