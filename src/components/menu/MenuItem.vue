<script setup>
import AppLink from './Link.vue';
const props = defineProps({
    item: {
        type: Object,
        required: true,
    }
});
</script>
<template>
    <!-- 如果是带有子菜单的 -->
    <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.path">
        <template #title>
            <svg-icon :icon-class="item.icon" />
            <span>{{ item.menuName }}</span>
        </template>

        <menu-item v-for="child in item.children" :key="child.path" :item="child" />
    </el-sub-menu>
    <app-link v-else :to="item.path" :isLink="item.isLink == '1'" class="app-link">
        <el-menu-item :index="item.path">
            <template #title>
                <svg-icon :icon-class="item.icon" />
                <span>{{ item.menuName }}</span>
            </template>
        </el-menu-item>
    </app-link>
</template>

<style scoped>
.el-sub-menu .svg-icon {
    margin-right: 16px;
}

.app-link .svg-icon {
    margin-right: 16px;
}
</style>