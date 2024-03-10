import { defineStore } from 'pinia';
const useTagsViewStore = defineStore('tagsView', {
    state: () => ({
        visitedViews: [],
        cachedViews: [],
        excludedViews: ['/refresh', '/401', '/login']
    }),
    actions: {
        add: function (view) {
            // 排除一些页面
            if (this.excludedViews.some((item) => { return view.path.startsWith(item); })) {
                return;
            }
            if (view.meta.needRecord == false) {
                return;
            }
            if (!this.visitedViews.some(v => v.path === view.path)) {
                this.visitedViews.push(Object.assign({}, view, {
                    title: view.meta.title || 'no-name'
                }));
            }
            if (!this.cachedViews.some(v => v.path === view.path)) {
                this.cachedViews.push(Object.assign({}, view, {
                    title: view.meta.title || 'no-name'
                }));
            }
        },

        remove: function (view, needReturnNewPage) {
            // 获取目标view的下标
            const index = this.visitedViews.findIndex(v => v.path === view.path);
            // 从visitedViews中删除当前view
            this.visitedViews.splice(index, 1);
            this.removeCachedView(view);
            if (!needReturnNewPage) {
                return;
            }
            // 返回active的路由地址
            if (this.visitedViews.length > index) {
                return this.visitedViews[index];
            } else if (this.visitedViews.length > 0) {
                return this.visitedViews[this.visitedViews.length - 1];
            }
            return { path: '/' };
        },

        removeCachedView: function (view) {
            const index = this.cachedViews.findIndex(v => v.path === view.path);
            index >= 0 && this.cachedViews.splice(index, 1);
        },

        // 移除除了目标页面外的所有标签页
        removeOthersViews: function (view) {
            this.visitedViews = this.visitedViews.filter(v => {
                return v.path === view.path;
            });
            this.cachedViews = this.cachedViews.filter(v => {
                return v.path === view.path;
            });
        },

        // 移除目标页左面的标签页
        removeLeftViews: function (view) {
            // 获取目标view的下标
            let index = this.visitedViews.findIndex(v => v.path === view.path);
            // 移除目标view左边的view
            this.visitedViews = this.visitedViews.filter((v, i) => {
                return i >= index;
            });
            // 同步cachedViews
            this.cachedViews = [...this.visitedViews];
        },

        // 移除目标页右面的标签页
        removeRightViews: function (view) {
            let index = this.visitedViews.findIndex(v => v.path === view.path);
            this.visitedViews = this.visitedViews.filter((v, i) => {
                return i <= index;
            });
            this.cachedViews = [...this.visitedViews];
        },

        // 移除所有的标签页
        removeAllViews: function () {
            this.visitedViews = [];
            this.cachedViews = [];
        },

        exists: function (path) {
            return this.visitedViews.some(v => v.path === path);
        }
    }
});

export default useTagsViewStore;
