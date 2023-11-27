<script setup>
import {onMounted, ref} from 'vue';
import {useMenuStore} from '../store/modules/menu';
import MenuItem from '@/components/menu/MenuItem.vue';
import logo from '@/assets/logo/logo.svg'

// 菜单相关
const menuStore = useMenuStore();
const menuList = ref([]);
onMounted(() => {
  // 获取菜单
  menuStore.getCanVisitedMenu().then((res) => {
    menuList.value = res || [];
  });
});
</script>
<template>
  <el-container class="main-layout">
    <el-aside width="200px">
      <el-row class="side-menu">
        <el-col :span="24">
          <div class="menu-title">
            <a href="/">
                <img v-if="logo" :src="logo" class="sidebar-logo" />
                <h3>慕言管理系统</h3>
            </a>
        </div>
          
            <el-menu
              default-active="2"
              class="menu-main"
              active-text-color="#ffd04b"
              background-color="#545c64"
              text-color="#d8dce0"
            >
              <template
                v-for="menuItem in menuList"
                :key="menuItem.id"
              >
                <menu-item :item="menuItem"></menu-item>
              </template>
            </el-menu>
        </el-col>
      </el-row>
    </el-aside>
    <el-container>
      <el-header>Header</el-header>
      <el-main>Main</el-main>
    </el-container>
  </el-container>
</template>
<style scoped>
.main-layout {
  height: 100vh;
}

.side-menu {
  height: 100%;
}

.menu-main {
  height: calc(100% - 50px);
}
.menu-title {
    display: flex;
    width: 199px;
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
    margin-right: 12px;
}
.side-menu h3 {
    font-size: 14px;
    display: inline-block;
}

a, a:focus, a:hover {
    cursor: pointer;
    color: inherit;
    text-decoration: none;
    background: transparent;
}
</style>
