<template>
<div class="file-upload">
	<el-upload
		v-if="!disabled || !hiddenOnDisabled"
		ref="file_uploader"
		:action="base_url + uploadUrl"
		multiple
		:show-file-list="false"
		:with-credentials="true"
		:headers="{'Accept-Language':store.getters.language, 'Authorization': store.getters.token}"
		:before-upload="beforeUpload"
		:on-success="onSuccess"
		:on-error="onError"
		:on-exceed="onExceed"
		:disabled="disabled"
		:limit="upload_limit"
	>
		<label-button
			size="medium"
			:disabled="upload_button_disabled"
			@click="handleUploadButtonClick"
		>
			<template #icon>
				<fk-icon>
					<paperclip-icon />
				</fk-icon>
			</template>
			添加附件
		</label-button>
	</el-upload>
	<div
		class="file-list"
		:style="{'--mt': files?.length ? undefined : 0}"
	>
		<div
			v-for="(file) in files"
			:key="`${file.path}-${file.uid}`"
			class="file-item"
			@click="previewFile(file.path, $event)"
		>
			<div class="file-icon">
				<preview-image
					v-if="file.path && images_file_types.includes(getFileType(file.path))"
					:src="getFileIcon(file.path)"
					:preview-src-list="preview_src_list"
					class="icon"
				/>
				<img
					v-else-if="file.path"
					:src="getFileIcon(file.path)"
					class="icon"
				>
				<img
					v-else
					:src="LoadingIcon"
					class="icon loading-icon"
				>
			</div>
			<div class="file-info">
				<div class="file-name">
					<text-ellipsis>
						{{ file.name }}
					</text-ellipsis>
				</div>
				<div class="file-size">
					{{ formatFileSize(toBit(file.size, fileSizeUnit)) }}
				</div>
			</div>
			<div
				class="handle-panel"
			>
				<el-tooltip
					v-if="file.path"
					content="下载"
					placement="top"
				>
					<i
						class="handle-icon el-icon-download"
						@click.stop="downloadFile(file.path, file.name)"
					/>
				</el-tooltip>
				<el-tooltip
					v-if="!disabled"
					content="删除"
					placement="top"
				>
					<i
						class="handle-icon op-icon-delete"
						@click.stop="delFile(file)"
					/>
				</el-tooltip>
			</div>
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
import {computed, nextTick, ref, shallowRef, watch} from "vue";
import {Notification} from "element-ui";
import type {Upload as ElUpload} from "element-ui";

import store from "@/store";
import {base_url} from "@/Config";
import type {Response} from "@/types/global";
import PdfIcon from "@/assets/images/common/file-pdf.png";
import ExcelIcon from "@/assets/images/common/file-excel.png";
import PptIcon from "@/assets/images/common/file-ppt.png";
import WordIcon from "@/assets/images/common/file-word.png";
import UnknownFile from "@/assets/images/common/file-unknown.png";
import LoadingIcon from "@/assets/images/common/loading.svg";
import TextEllipsis from "@/components/TextEllipsis.vue";
import PreviewImage from "@/components/PreviewImage.vue";
import FkIcon from "@/components/ForThink/FkIcon.vue";
import PaperclipIcon from "~icons/operation/paperclip";
import {downloadStaticFile} from "@/utils/js/common";
import request from "@/utils/js/request";
import LabelButton from "@/components/Button/LabelButton.vue";

const emits = defineEmits<{
	(event: "update:files", value: FileItem[]): void,
	(event: "change"): void,
}>();

type Attachment = {
	uid: number,
	name: string,
	percentage: number,
	response: any,
	size: number,
	status: "success" | "ready" | "uploading" | "fail",
	raw: File
}
type FileItem = {
	name: string,
	size: number,
	path: string,
	// 只有本地新上传的文件具有uid
	uid?: number,
}
type FileSize = "B" | "KB" | "MB" | "GB" | "TB";
export interface Props {
	/** 包含已经保存的文件和临时新上传的文件 */
	uploadUrl: string,
	delTempFileUrl: string,
	files: FileItem[],
	excludeTypes?: string[],
	disabled?: boolean,
	multiple?: boolean,
	/** 限制文件的大小，单位MB */
	maxSize?: number,
	maxSizeUnit?: FileSize,
	/** 禁用时是否隐藏文件上传按钮 */
	hiddenOnDisabled?: boolean,
	/** 上传文件的个数限制 */
	limit?: number,
	fileSizeUnit?: FileSize,
}
const props = withDefaults(defineProps<Props>(), {
	excludeTypes: () => ["exe", "cmd", "bat", "vbs", "js", "ts", "cjs", "mjs", "php", "python", "py"],
	disabled: false,
	multiple: true,
	maxSize: 200,
	maxSizeUnit: "MB",
	hiddenOnDisabled: false,
	limit: Infinity,
	fileSizeUnit: "B"
});

const images_file_types = ["jpg", "jpeg", "png", "svg"];
const world_file_types = ["doc", "docm", "docx", "dotm", "dotx"];
const excel_file_types = ["xls", "xlsb", "xlsx", "xlt", "xltx", "xlw"];
const ppt_file_types = ["pot", "potm", "potx", "ppa", "ppam", "pps", "ppsm", "ppsx", "ppt", "pptm", "pptx"];
const pdf_file_types = ["pdf"];

const file_size_unit_map = {
	B: 1,
	KB: 1024,
	MB: Math.pow(1024, 2),
	GB: Math.pow(1024, 3),
	TB: Math.pow(1024, 4)
};
const toBit = (size: number, unit: FileSize) => size * file_size_unit_map[unit];
const formatBit = (size: number, unit: FileSize) => size / file_size_unit_map[unit];

const temp_file_list = shallowRef<FileItem[]>([]);
const file_uploader = ref<InstanceType<typeof ElUpload>>();
const preview_src_list = ref<string[]>([]);

const upload_button_disabled = computed(() => {
	const disabled_one = props.disabled || props.files.length >= 6;
	// 某一批次正在上传中暂时禁用上传功能
	const disabled_two = props.files.some((file) => !file.path);
	return disabled_one || disabled_two;
});
const upload_limit = computed(() => props.limit - props.files.length);

watch(
	temp_file_list,
	() => {
		if (!temp_file_list.value.length) return;
		emits("update:files", [...props.files, ...temp_file_list.value]);
		temp_file_list.value = [];
	}
);

const getFileType = (name_with_suffix: string) => {
	const str_arr = name_with_suffix.split(".");
	const type = str_arr.slice(-1)[0] || "txt";
	return type.toLocaleLowerCase();
};

const handleUploadButtonClick = () => {
	// 每次上传时清空文件列表，#20250
	file_uploader.value?.clearFiles();
};

const beforeUpload = (file: Attachment) => {
	const {excludeTypes, maxSize, maxSizeUnit, fileSizeUnit} = props;
	const type = getFileType(file.name);
	const is_exclude_type = excludeTypes.includes(type);
	const is_in_limit = file.size <= toBit(maxSize, maxSizeUnit);

	if (is_exclude_type) {
		Notification({
			type: "error",
			title: "错误",
			message: "上传文件格式不支持"
		});
		return false;
	}
	if (!is_in_limit) {
		Notification({
			type: "error",
			title: "错误",
			message: `文件大小超过${maxSize}MB，无法上传`
		});
		return false;
	}
	temp_file_list.value = [
		...temp_file_list.value,
		{
			name: file.name,
			size: formatBit(file.size, fileSizeUnit),
			uid: file.uid,
			path: "",
		}
	];
	return true;
};

const onSuccess = (res: Awaited<Response<string>>["data"], file: Attachment) => {
	if (res.type === 1) {
		// 更新path
		const file_list = props.files.map((item) => {
			const new_item = {...item};
			if (item.uid === file.uid) {
				new_item.path = res.result;
			}
			return new_item;
		});
		emits("update:files", file_list);
		emits("change");
	}
};

const onError = (err: any, file: Attachment) => {
	setTimeout(() => {
		Notification({
			type: "error",
			title: "错误",
			message: `${file.name}上传失败`
		});
		const file_list = props.files.filter((item) => item.uid !== file.uid);
		emits("update:files", file_list);
		emits("change");
	}, 200);
};

const onExceed = () => {
	Notification({
		type: "error",
		title: "错误",
		message: `仅支持上传${props.limit}个附件`
	});
};

const downloadFile = (url: string, file_name: string) => {
	downloadStaticFile(base_url + url, file_name);
};

const delFile = async (file: FileItem) => {
	if (file.uid) {
		// 删除临时的上传文件
		if (file.path) {
			await deleteTemporaryFile({path: file.path});
		}
		// 当网速差的情况，正在上传的文件被删除
		abortUpload(file);
		const file_list = props.files.filter((item) => item.uid !== file.uid);
		emits("update:files", file_list);
		emits("change");
	} else {
		// 删除已保存在服务上的文件
		await deleteTemporaryFile({path: file.path});
		const new_files = props.files.filter((item) => item.path !== file.path);
		emits("update:files", new_files);
		emits("change");
	}
};

const getFileIcon = (url: string) => {
	const type = getFileType(url);
	if (images_file_types.includes(type)) return base_url + url;
	if (world_file_types.includes(type)) return WordIcon;
	if (excel_file_types.includes(type)) return ExcelIcon;
	if (ppt_file_types.includes(type)) return PptIcon;
	if (pdf_file_types.includes(type)) return PdfIcon;
	return UnknownFile;
};

const formatFileSize = (size: number, i = 0) => {
	const unit = ["B", "KB", "MB", "GB", "TB"];
	if (size >= 1024) {
		return formatFileSize(size / 1024, ++i);
	} else {
		if (size.toString().indexOf(".") !== -1 && size.toString().length - size.toString().indexOf(".") > 3) {
			return size.toFixed(2) + unit[i];
		}
		return size + unit[i];
	}
};

const previewFile = async (url: string, event: MouseEvent) => {
	const type = getFileType(url);
	if (url && images_file_types.includes(type)) {
		preview_src_list.value = [base_url + url];
		await nextTick();
		((event.currentTarget as HTMLElement)?.querySelector(".el-image__inner.el-image__preview") as HTMLElement)?.click();
	} else {
		preview_src_list.value = [];
	}
};

const deleteTemporaryFile = (data: {path: string}): Response<string> => {
	return request({
		url: props.delTempFileUrl,
		data,
		method: "post",
	});
};

const getApiParams = () => props.files.map((item) => ({name: item.name, size: item.size, path: item.path}));

const isAllFilesUploaded = () => props.files.every((file) => Boolean(file.path));

const abortUpload = (file: FileItem) => file_uploader.value?.abort({uid: file.uid} as unknown as any); // hack写法，el-upload的abort只用到了file.uid属性

defineExpose({
	getApiParams,
	isAllFilesUploaded,
	abortUpload
});
</script>

<style scoped>
@keyframes loading {
    100% {
        transform: rotate(360deg);
    }
}

.file-upload {
	--columns: 3;
	--gap: 8px 10px;
	--mt: 8px;
}

.file-list {
    display: grid;
	grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
	gap: var(--gap);
    margin-top: var(--mt);

    .file-item {
        display: flex;
        background-color: #F5F8FA;
        border-radius: 4px;
        cursor: pointer;

		.file-icon {
			padding: 10px;
			line-height: 1;

			.icon {
				width: 36px;
				height: 36px;
			}

			.loading-icon {
                color: #07f;
                animation: loading 1s linear infinite;
            }
		}

        .file-info {
            flex: 1;
            min-width: 0;
            padding: 8px 10px 8px 0;
            line-height: 20px;

            .file-name {
                color: #748BA4;
                font-size: 14px;
            }

            .file-size {
                color: #A2B2C2;
                font-size: 12px;
            }
        }

        .handle-panel {
            display: none;
            padding: 16px 8px;

            .handle-icon {
                font-size: 20px;
                padding: 2px 6px;
                background-color: #fff;
                border-radius: 2px;

                &:not(:first-child) {
                    margin-left: 6px;
                }
            }

            .el-icon-download {
                color: #1A85FF;

                &:hover {
                    color: #1160BB;
                }

                &:active {
                    color: #23488A;
                }
            }

            .op-icon-delete {
                color: #F56C6C;

                &:hover {
                    color: #CF5757;
                }

                &:active {
                    color: #A94242;
                }
            }
        }

        &:hover {
            .handle-panel {
                display: block;
                line-height: 20px;
            }
        }
    }
}

:deep(.fk-text-ellipsis) {
    width: 100%;
    vertical-align: middle;
}

:deep(.op-icon-paperclip) {
    margin-right: 6px;
}
</style>
<style>
.loading {
    .el-loading-mask {
        background-color: #F5F8FA;
    }
}
</style>
