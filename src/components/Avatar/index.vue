<script setup>
import { Plus } from '@element-plus/icons-vue';
import { getToken, getRefreshToken } from '../../utils/auth';
const props = defineProps({
    imageUrl: {
        type: String,
        default: ''
    }
});
// 是否开启图片上传功能，这里通过此变量控制是否上传还是预览的效果
const disabled = ref(false);
const headers = ref({
    "token": getToken(),
    "refresh-token": getRefreshToken()
});

const emit = defineEmits(['success', 'update:imageUrl']);
function handleAvatarSuccess(response, uploadFile) {
    ElMessage.success("上传成功！");
    emit('update:imageUrl', response.data.data.url);
    emit('success', response.data.data.url);
};
function handleAvatarError() {
    ElMessage.error("上传失败！");
}
function beforeAvatarUpload(rawFile) {
    // 判断上传的是不是图片类型
    if (!rawFile.type.startsWith('image/')) {
        ElMessage.error('上传的头像必须是图片!');
        return false;
    }
    if (rawFile.size / 1024 / 1024 > 10) {
        ElMessage.error('上传的头像大小不能超过10M!');
    }
    return true;
};

function getDisabled() {
    if (props.imageUrl) {
        return disabled.value;
    }
    return false;
}

function changeDisabled(value) {
    setTimeout(() => {
        disabled.value = value;
    }, 200);
}
</script>
<template>
    <el-upload class="avatar-uploader" :disabled="getDisabled()" :headers="headers" action="http://localhost:5173/api/upload/doUpload" :show-file-list="false" :on-error="handleAvatarError" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
        <el-image v-if="props.imageUrl" :src="props.imageUrl" :zoom-rate="1.2" :max-scale="7" :min-scale="0.2" :preview-src-list="[props.imageUrl]" :initial-index="0" fit="cover" class="avatar" :hide-on-click-modal="true" @click.stop="changeDisabled(true)" @close="changeDisabled(false)" />
        <el-icon v-else class="avatar-uploader-icon">
            <Plus />
        </el-icon>
        <div v-if="props.imageUrl" class="buttonDiv">
            <el-button type="primary" size="small" link>更换</el-button>
        </div>
    </el-upload>
</template>

<style scoped>
.avatar-uploader .avatar {
    width: 100px;
    height: 100px;
    display: block;
}

.avatar-uploader:hover {
    .buttonDiv {
        position: absolute;
        bottom: 0;
        display: flex;
        background: var(--el-overlay-color-light);
        justify-content: space-around;
        align-items: center;
        width: 100%;
    }
}

.buttonDiv {
    position: absolute;
    bottom: 0;
    display: none;
    background: var(--el-overlay-color-light);
    justify-content: space-around;
    align-items: center;
    width: 100%;
    height: 25px;
}
</style>

<style>
.avatar-uploader .el-upload {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
    border-color: var(--el-color-primary);

    img.el-image__preview {
        cursor: zoom-in !important;
    }
}

.el-icon.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    text-align: center;
}
</style>