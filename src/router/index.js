import { createRouter, createWebHistory } from 'vue-router';
import nProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { isRelogin } from '@/utils/request';
import { getToken, removeToken } from '@/utils/auth';
import { isBlank } from '@/utils/commonUtils';
import useMenuStore from '@/store/modules/menu';
import useUserStore from '@/store/modules/user';
nProgress.configure({ showSpinner: false });

// 静态路由
const constantRoutes = [
    {
        name: 'login',
        path: '/login',
        component: () => import('@/view/login/index.vue'),
        meta: {
            keepAlive: false,
        },
    },
    {
        name: 'index',
        path: '/',
        component: () => import('@/view/index.vue'),
        meta: {
            permission: ["all"],
            keepAlive: false,
        },
    },
    {
        path: '/:pathMatch(.*)*',
        component: () => import('@/view/error/404.vue'),
    }
];
const router = createRouter({
    history: createWebHistory(),
    routes: constantRoutes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { top: 0 };
        }
    },
});

router.beforeEach((to, from, next) => {
    nProgress.start();
    // 如果访问的不是需要权限的页面，直接放行
    if (isBlank(to.meta.permisson) || to.meta.permisson.length === 0) {
        next();
        return;
    }
    // 如果之前没有登录过，跳转到登录页面
    if (isBlank(getToken())) {
        next({ path: '/login', query: { redirectUrl: to.fullPath } });
        return;
    }
    // 如果当前没有菜单数据    
    if (useMenuStore().treeMenu.length === 0) {
        // 请求菜单
        isRelogin.show = true;
        useUserStore().getInfo().then(() => {
            useMenuStore().getCanVisitedMenu().then(() => {
                isRelogin.show = false;
                next({ ...to, replace: true });
            }).catch((err) => {
                // 清除token,并跳转到登录页面
                removeToken();
                ElMessage.error(err);
                next({ path: '/login', query: { redirectUrl: encodeURIComponent(to.fullPath) } });
            });
        }).catch((err) => {
            // 清除token,并跳转到登录页面
            removeToken();
            ElMessage.error(err);
            next({ path: '/login', query: { redirectUrl: encodeURIComponent(to.fullPath) } });
        });
    } else {
        next();
    }
});

router.afterEach(() => {
    nProgress.done();
    isRelogin.show = false;
});
export default router;
