<script setup>
import useTagsViewStore from '@/store/modules/tagsView';
import { computed, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Close } from '@element-plus/icons-vue';
import { onClickOutside } from '@vueuse/core';
const target = ref(null);
const route = useRoute();
const router = useRouter();
const tagsViewStore = useTagsViewStore();
const visitedViews = computed(() => tagsViewStore.visitedViews);
const showContexMenu = ref(false);
const selectedTag = ref(null);
const left = ref(0);
const top = ref(0);
function isActive(tag) {
    // 判断当前路由是否与标签的路径匹配
    return tag.path === route.path;
}

function closePage(view) {
    const newView = tagsViewStore.remove(view, isActive(view));
    closeMenu();
    if (isActive(view)) {
        router.push({ path: newView.path, query: newView.query });
    }
}

function openMenu(view, event) {
    left.value = event.clientX + 15; // 菜单应该出现的左侧位置
    top.value = event.clientY;
    selectedTag.value = view;
    showContexMenu.value = true;
}

onClickOutside(target, () => closeMenu());

function closeMenu() {
    showContexMenu.value = false;
}

function canClose() {
    // 如果当前是首页。且没有别的页面，则不能关闭
    return !(isHomeTags() && !hasOtherTags());
}
function isHomeTags() {
    return route.path === '/';
}
// 是否存在其他标签页
function hasOtherTags() {
    return visitedViews.value.length > 1;
}
// 是否是第一个标签页
function isFirstTags() {
    try {
        return selectedTag.value?.path === visitedViews.value[0].path;
    } catch (error) {
        return false;
    }

}
// 是否是最后一个标签页
function isLastTags() {
    try {
        return selectedTag.value?.path === visitedViews.value[visitedViews.value.length - 1].path;
    } catch (error) {
        return false;
    }
}
// 刷新当前标签页
function refreshPage() {
    closeMenu();
    // 先从keepalive中移除
    tagsViewStore.removeCachedView(selectedTag.value);
    if (isActive(selectedTag.value)) {
        router.replace({ path: '/refresh' + selectedTag.value.path, query: selectedTag.value.query });
        return;
    }
    // 再跳转到对应的路由
    router.push({ path: selectedTag.value.path, query: selectedTag.value.query });
}
// 关闭其他标签页
function closeOthersTags() {
    closeMenu();
    router.push({ path: selectedTag.value.path, query: selectedTag.value.query });
    tagsViewStore.removeOthersViews(selectedTag.value);
}
// 关闭左侧标签页
function closeLeftTags() {
    closeMenu();
    tagsViewStore.removeLeftViews(selectedTag.value);
    // 判断当前路由是否存在tagsView中，不存在则跳转到当前路由
    if (!tagsViewStore.exists(route.path)) {
        router.push({ path: selectedTag.value.path, query: selectedTag.value.query });
    }
}
// 关闭右侧标签页
function closeRightTags() {
    closeMenu();
    tagsViewStore.removeRightViews(selectedTag.value);
    // 判断当前路由是否存在tagsView中，不存在则跳转到当前路由
    if (!tagsViewStore.exists(route.path)) {
        router.push({ path: selectedTag.value.path, query: selectedTag.value.query });
    }
}
// 关闭所有标签页
function closeAllTags() {
    closeMenu();
    tagsViewStore.removeAllViews();
    router.push('/');
}
</script>

<template>
    <div class="tagsView">
        <router-link v-for="(tag, index) in visitedViews" :key="tag.path" :to="{ path: tag.path, query: tag.query }" :class="isActive(tag) ? 'active' : ''" class="tagsView-item" @contextmenu.prevent="openMenu(tag, $event)">
            {{ tag.title }}
            <el-icon class="tagsView-item-close" @click.prevent="closePage(tag)" v-if="canClose()">
                <Close />
            </el-icon>
        </router-link>
    </div>
    <ul ref="target" v-show="showContexMenu" :style="{ left: left + 'px', top: top + 'px' }" class="contextMenu">
        <li @click="refreshPage(selectedTag)">
            <refresh-right style="width: 1em; height: 1em;" /> 刷新页面
        </li>
        <li @click="closePage(selectedTag)" v-if="canClose()">
            <close style="width: 1em; height: 1em;" /> 关闭当前
        </li>
        <li @click="closeOthersTags" v-if="hasOtherTags()">
            <circle-close style="width: 1em; height: 1em;" /> 关闭其他
        </li>
        <li @click="closeLeftTags" v-if="!isFirstTags()">
            <back style="width: 1em; height: 1em;" /> 关闭左侧
        </li>
        <li @click="closeRightTags" v-if="!isLastTags()">
            <right style="width: 1em; height: 1em;" /> 关闭右侧
        </li>
        <li @click="closeAllTags(selectedTag)" v-if="canClose()">
            <circle-close style="width: 1em; height: 1em;" /> 全部关闭
        </li>
    </ul>
</template>

<style scoped>
.tagsView {
    height: 40%;
    width: 100%;
    border-bottom: 1px solid var(--el-border-color);
    display: flex;
    align-items: center;
    justify-content: left;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, .12), 0 0 2px 0 rgba(0, 0, 0, .04);
}

.tagsView-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    height: 25px;
    border: 1px solid var(--el-border-color);
    color: var(--el-text-color-regular);
    background: var(--el-info-color);
    padding: 0 8px;
    font-size: 12px;
    margin-left: 5px;
    margin-top: 4px;
}

.tagsView-item.active {
    background-color: var(--el-color-primary);
    color: white;
}

.tagsView-item.active::before {
    content: "";
    background: #fff;
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    position: relative;
    margin-right: 4px;
}

.tagsView-item-close {
    margin-left: 4px;
}

.tagsView-item-close:hover {
    background-color: gray;
    border-radius: 50%;
    color: white;
}

.contextMenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);

    li {
        margin: 0;
        padding: 7px 16px;
        cursor: pointer;

        &:hover {
            background: #eee;
        }
    }
}
</style>
