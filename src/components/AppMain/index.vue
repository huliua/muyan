<template>
    <section class="app-main">
        <router-view v-slot="{ Component, route }">
            <Transition name="el-fade-in" mode="out-in">
                <keep-alive :include="cachedViews">
                    <component :is="Component" :key="route.path" />
                </keep-alive>
            </Transition>
        </router-view>
    </section>
</template>

<script setup>
import useTagsViewStore from '@/store/modules/tagsView';
import { computed } from 'vue';

const tagsViewStore = useTagsViewStore();
const cachedViews = computed(() => tagsViewStore.cachedViews.map((item) => { return item.name; }));
</script>

<style scoped>
.app-main {
    /* 50= navbar  50  */
    min-height: calc(100vh - 50px);
    width: 100%;
    position: relative;
    overflow: hidden;
}

.fixed-header+.app-main {
    padding-top: 50px;
}

.hasTagsView {
    .app-main {
        min-height: calc(100vh - 84px);
    }

    .fixed-header+.app-main {
        padding-top: 84px;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>

<style>
.el-popup-parent--hidden {
    .fixed-header {
        padding-right: 6px;
    }
}

::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

::-webkit-scrollbar-track {
    background-color: #f1f1f1;
}

::-webkit-scrollbar-thumb {
    background-color: #c0c0c0;
    border-radius: 3px;
}
</style>
