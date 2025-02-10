<template>
<div>
	<el-image
		class="preview-image"
		:src="props.src"
		:preview-src-list="preview_src_list"
		:fit="props.fit"
		@click="addDownloadIcon"
	/>
	<span
		v-show="download_icon_show"
		ref="icon_download_ref"
		class="el-image-viewer__btn el-image-viewer__download"
		@click="downloadImage"
	>
		<i class="el-icon-download" />
	</span>
</div>
</template>
<script setup lang="ts">
import {ref, nextTick, computed} from "vue";
import {getDateTimeStr} from "@/utils/js/tools/time";
interface Props {
	src: string,
	previewSrcList?:string[],
	fit?:string
}
const props = withDefaults(defineProps<Props>(), {
	fit: "contain",
	previewSrcList: undefined
});
const icon_download_ref = ref();
const download_icon_show = ref(false);
const preview_src_list = computed(() => props.previewSrcList || [props.src]);

const addDownloadIcon = () => {
	download_icon_show.value = true;
	nextTick(() => {
		document.querySelector(".el-image-viewer__wrapper")?.appendChild(icon_download_ref.value);
	});
};

const downloadImage = () => {
	const {date, time} = getDateTimeStr({});
	const xhr = new XMLHttpRequest();
	xhr.open("get", props.src, true);
	xhr.responseType = "blob";
	xhr.onload = () => {
		if (xhr.status === 200) {
			const type = xhr.response?.type?.split("/")[1];
			const name = `图片${date}${time}.${type}`;
			const url = window.URL.createObjectURL(xhr.response);
			const a = document.createElement("a");
			a.href = url;
			a.download = name;
			a.click();
		}
	};
	xhr.send();
};

</script>
<style lang="scss">
.el-image-viewer__wrapper {
	.el-image-viewer__mask{
		opacity: .6 !important;
	}
	.el-image-viewer__actions{
		background-color: rgba(0,0,0,0.3) !important;
	}
    .el-image-viewer__actions__inner{
        i{
            padding: 11px 10px 10px;
            &:hover{
                background-color: rgba(0,0,0,0.25) !important;
            }
        }
        .el-image-viewer__actions__divider {
            padding: 0;
            margin: 6px;
        }
    }
    .el-image-viewer__download {
        top: 70px;
        right: 96px;
        width: 40px;
        height: 40px;
        font-size: 24px;
        color: #fff;
        background-color: rgba(0,0,0,0.3);
    }
	.el-image-viewer__close {
		top: 70px !important;
		background-color: rgba(0,0,0,0.3) !important;
	}
	.el-image-viewer__next,
	.el-image-viewer__prev{
		background-color: rgba(0,0,0,0.3) !important;
	}
    .el-image-viewer__download:hover,
    .el-image-viewer__close:hover,
	.el-image-viewer__next:hover,
	.el-image-viewer__prev:hover {
        background-color: rgba(0,0,0,0.55) !important;
    }

}
</style>
<style scoped>
.preview-image {
    width: 100%;
    height: 100%;
}
</style>
