import {defineStore} from 'pinia';
import {getAllMenu, getCanVisitedMenu} from '@/api/menu.js';

export const useMenuStore = defineStore('menu', {
  state: () => ({
    routes: [], // 所有的菜单列表
    canVisitedRoutes: [], // 有权访问的路由列表
    treeMenu: [], // 树形结构的菜单列表
  }),
  actions: {
    getAllMenu: function () {
      // 获取所有的菜单列表
    },
    getCanVisitedMenu: function () {
      // 获取有权访问的菜单列表
      return new Promise((resolve, reject) => {
        getCanVisitedMenu()
          .then((res) => {            
            const canVisitedRoutes = res || [];
            this.canVisitedRoutes = canVisitedRoutes;            
            this.treeMenu = dealwithTree(canVisitedRoutes);
            resolve(this.treeMenu);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
  },

  getters: {
    /**
     * 返回可以访问的菜单（包含目录和菜单）
     */
    canVisitedMenu(state) {
        return state.canVisitedRoutes.filter((item)=> {
            return item.type !== 'B';
        });
    },
  }
});

function dealwithTree(data) {
  // 处理树形结构
  const tree = [];
  const map = {};
  data.forEach((item) => {
    map[item.id] = item;
  });
  data.forEach((item) => {
    const parent = map[item.parentId];
    if (parent) {
      (parent.children || (parent.children = [])).push(item);
    } else {
      tree.push(item);
    }
  });
  return tree;
}
