<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import useMenuStore from '../store/modules/menu';
import MenuItem from '@/components/menu/MenuItem.vue';
import logo from '@/assets/logo/logo.svg';
import AppMain from '@/components/AppMain/index.vue';
import router from '@/router/index.js';
import MyHeader from '@/components/Header/index.vue';
// 菜单相关
const menuStore = useMenuStore();
const menuList = ref([]);
onMounted(() => {
  // 获取菜单
  menuStore.getCanVisitedMenu().then((res) => {
    menuList.value = res || [];
  });
});
// 修改当前菜单选中项为当前路由的路径值
const currentPath = computed(
  () => {
    return router.currentRoute.value.path;
  }
);
// 获取当前路径对应的面包屑
const currentSiteArr = ref([]);
watch(currentPath, () => {
  currentSiteArr.value = menuStore.getRouterTree(currentPath.value);
}, {
  immediate: true
});

// 左侧菜单收缩
const isCollapse = ref(false);
const changeCollapse = function (newValue) {
  isCollapse.value = newValue;
};
</script>
<template>
  <el-container class="main-layout">
    <el-aside class="sidebar">
      <el-row class="side-menu">
        <el-col :span="24">
          <div class="menu-title">
            <a href="/">
              <div style="height: 100%;line-height: 50px;">
                <img v-if="logo" :src="logo" class="sidebar-logo" />
                <el-icon v-else class="sidebar-logo">
                  <MagicStick />
                </el-icon>
                <h3 v-show="!isCollapse" class="system-name">慕言管理系统</h3>
              </div>
            </a>

          </div>

          <el-menu :default-active="currentPath" class="menu-main" :class="isCollapse ? 'collapsed-menu' : ''" active-text-color="#ffd04b" background-color="#545c64" text-color="#d8dce0" :collapse="isCollapse" :collapse-transition="false">
            <template v-for="menuItem in menuList" :key="menuItem.id">
              <menu-item :item="menuItem"></menu-item>
            </template>
          </el-menu>
        </el-col>
      </el-row>
    </el-aside>
    <el-container class="right-container">
      <el-header class="header">
        <my-header :isCollapse="isCollapse" :currentSiteArr="currentSiteArr" @collapse="changeCollapse" />
      </el-header>
      <el-main class="main-container">
        <app-main />
      </el-main>
    </el-container>
  </el-container>
</template>
<style scoped>
.main-layout {
  height: 100vh;
}

.sidebar {
  overflow: hidden;
  top: 0;
  height: 100%;
  width: auto;
}

.side-menu {
  height: 100%;
}

.menu-main {
  border: none;
  height: calc(100% - 50px);
}

.menu-main:not(.el-menu--collapse) {
  width: 200px;
}

.menu-title {
  display: flex;
  height: 50px;
  background-color: #545c64;
  justify-content: center;
  align-items: center;
  color: white;
}

.menu-title a {
  display: inline-block;
  width: 100%;
  height: 100%;
  text-align: center;
  color: white;
}

.sidebar-logo {
  width: 24px;
  height: 24px;
  vertical-align: middle;
}

.system-name {
  margin-left: 12px;
}

.side-menu h3 {
  font-size: 14px;
  display: inline-block;
}

a,
a:focus,
a:hover {
  cursor: pointer;
  color: inherit;
  text-decoration: none;
  background: transparent;
}

.right-container {
  overflow: auto;
}

.main-container {
  background-color: aqua;
  overflow: initial;
}

.header {
  padding: 0;
}
</style>
