<script setup>
import { ref } from 'vue';
import { Fold, Expand } from '@element-plus/icons-vue';
const props = defineProps({
    isCollapse: {
        type: Boolean,
        required: true,
    },
    currentSiteArr: {
        type: Array,
        required: true,
    }
});
const emit = defineEmits(["collapse"]);
const changeCollapse = (isCollapse) => {
    emit("collapse", isCollapse);
};
</script>
<template>
    <el-row class="mainContent">
        <el-button class="collapse-button" v-if="isCollapse" size="large" @click="changeCollapse(!isCollapse)">
            <slot name="icon">
                <el-icon>
                    <Expand />
                </el-icon>
            </slot>
        </el-button>
        <el-button class="collapse-button" v-else :icon="Fold" size="large" @click="changeCollapse(!isCollapse)" />

        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-for="(item, index) in currentSiteArr" :key="index">{{ item.name }}</el-breadcrumb-item>
        </el-breadcrumb>
    </el-row>
</template>
<style scoped>
.mainContent {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
}

.collapse-button {
    font-size: 22px;
    border: none;
    background: transparent;
    height: inherit;
}
</style>