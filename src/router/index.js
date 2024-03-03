import { createRouter, createWebHistory } from 'vue-router';
import nProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { isRelogin } from '@/utils/request';
import { getToken, removeToken } from '@/utils/auth';
import { isBlank } from '@/utils/commonUtils';
import useMenuStore from '@/store/modules/menu';
import useUserStore from '@/store/modules/user';
import useTagsViewStore from '@/store/modules/tagsview';
import Layout from '@/layout/index.vue';
nProgress.configure({ showSpinner: false });

// 静态路由
const constantRoutes = [
    {
        name: 'login',
        path: '/login',
        component: () => import('@/view/login/index.vue'),
        meta: {
            permission: [],
            keepAlive: false,
        },
    },
    {
        name: 'index',
        path: '/',
        component: () => Layout,
        meta: {
            title: '首页',
            permission: [],
            keepAlive: false,
        },
        children: []
    },
    {
        path: '/:pathMatch(.*)*',
        component: () => import('@/view/error/404.vue'),
        meta: {
            permission: []
        }
    },
    {
        path: '/refresh',
        meta: {
            permission: []
        },
        component: Layout,
        children: [{
            path: '/refresh/:path(.*)',
            component: () => import('@/view/refresh/index.vue')
        }]
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
    if (to.path === '/login') {
        next();
        return;
    }

    // 如果之前没有登录过，跳转到登录页面
    if (isBlank(getToken())) {
        next({ path: '/login', query: { redirectUrl: to.fullPath } });
        return;
    }
    // 如果当前没有菜单数据或当前登录用户为空 
    if (useMenuStore().treeMenu.length === 0 || isBlank(useUserStore().id)) {
        // 请求菜单
        isRelogin.show = true;
        useUserStore().getInfo().then(() => {
            useMenuStore().getCanVisitedMenu(true).then(() => {
                isRelogin.show = false;
                next({ ...to, replace: true });
            }).catch((err) => {
                // 清除token,并跳转到登录页面
                removeToken();
                ElMessage.error(err);
                next({ path: '/login', query: { redirectUrl: encodeURIComponent(to.fullPath) } });
                return;
            });
        }).catch((err) => {
            // 清除token,并跳转到登录页面
            removeToken();
            ElMessage.error(err);
            next({ path: '/login', query: { redirectUrl: encodeURIComponent(to.fullPath) } });
            return;
        });
    } else {
        // 如果访问的是不需要权限的页面（即permission为空数组），直接放行
        if (!isBlank(to.meta.permission) && to.meta.permission.length === 0) {
            next();
            return;
        } else if (useUserStore().hasPermission(to.meta.permission)) {
            next();
            return;
        } else {
            ElMessage.error('没有权限');
            next({ path: '/401', replace: true });
            return;
        }
    }
});

router.afterEach((to, from) => {
    useTagsViewStore().add(to);
    nProgress.done();
    isRelogin.show = false;
});
export default router;
