<script setup>
import { Fold, Expand } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import useUserStore from "@/store/modules/user";

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

            <!-- 用户名 -->
            <el-dropdown class="dropdown-menu">
                <span class="el-dropdown-link">
                    <el-avatar class="user-avatar" :size="40" :src="userStore.avatar" />
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
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: nowrap;
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
</style>