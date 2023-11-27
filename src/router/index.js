import {createRouter, createWebHistory} from 'vue-router';
import {getToken} from '@/utils/auth';
import {isBlank} from '@/utils/commonUtils';
// 静态路由
const constantRoutes = [
    {
        path: '/login',
        component: () => import("@/view/login/index.vue"),
        meta: {
            keepAlive: false
        }
    }, {
        path: '/',
        component: () => import("@/view/index.vue"),
        meta: {
            keepAlive: false
        }
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

router.beforeEach(
    (to, from, next) => {
        if (to.path === '/login') {
            next();
        } else {
            if (!isBlank(getToken())) {
                next();
            } else {
                next('/login');
            }
        }
    }
);
export default router;