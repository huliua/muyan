<script setup>
import { Fold, Expand, Moon, Sunny } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import useUserStore from "@/store/modules/user";
import { useDark, useToggle } from '@vueuse/core';
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

const router = useRouter();
const userStore = useUserStore();
const logout = () => {
    ElMessageBox.confirm('确定要退出系统吗?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        userStore.logOut().then(() => {
            router.push({
                path: "/login"
            });
        });
    }).catch(() => {
    });
};

// 黑暗模式切换
const isDark = useDark();
const toggleDark = useToggle(isDark);
/**
 * 判断是否为当前站点
 * @param {*} site 站点
 * @param {*} siteArr 站点数组
 */
const isCurrentSite = (site, siteArr) => {
    return siteArr.some((item) => {
        return item.siteId === site.siteId;
    });
};
</script>
<template>
    <el-row class="mainContent">
        <!-- 左侧菜单 -->
        <div class="left-menu">
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
        </div>

        <!-- 右侧菜单 -->
        <div class="right-menu">
            <!-- 明亮黑暗模式切换 -->
            <el-tooltip :effect="'light'" content="切换明亮/黑暗模式" placement="bottom">
                <el-button text circle class="toggleModel" :icon="Sunny" size="large" v-if="isDark" @click="toggleDark()"></el-button>
                <el-button text circle class="toggleModel" :icon="Moon" size="large" v-else @click="toggleDark()"></el-button>
            </el-tooltip>

            <!-- 用户信息下拉菜单 -->
            <el-dropdown class="dropdown-menu">
                <span class="el-dropdown-link">
                    <el-avatar class="user-avatar" :size="40" :src="userStore.avatar" fit="scale-down" />
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item>
                            <el-button text @click="router.push('/user/info')">个人信息</el-button>
                        </el-dropdown-item>
                        <el-dropdown-item>
                            <el-button text @click="router.push('/user/password')">修改密码</el-button>
                        </el-dropdown-item>
                        <el-dropdown-item>
                            <el-button type="danger" text @click="logout">退出登录</el-button>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </el-row>
</template>
<style scoped>
.mainContent {
    height: 60%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: nowrap;
    box-shadow: 0 1px 1px rgb(14 14 14 / 8%);
}

.collapse-button {
    font-size: 22px;
    border: none;
    background: transparent;
    height: inherit;
}

.left-menu,
.right-menu {
    width: auto;
    display: flex;
    justify-content: center;
    align-items: center;
}

.right-menu {
    margin-left: auto;
    margin-right: 20px;
}

.right-menu .dropdown-menu .el-dropdown-link {
    outline: none;
}

.toggleModel {
    margin: 0 12px;
}
</style>