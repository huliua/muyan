<template>
    <section class="app-main">
        <router-view v-slot="{ Component, route }">
            <transition name="fade-transform" mode="out-in">
                <div>
                    <keep-alive>
                        <component v-if="route.meta.keepAlive" :is="Component" :key="route.path" />
                    </keep-alive>
                    <component v-if="!route.meta.keepAlive" :is="Component" :key="route.path" />
                </div>
            </transition>
        </router-view>
    </section>
</template>

<script setup></script>

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
