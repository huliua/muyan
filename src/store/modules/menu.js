import { defineStore } from 'pinia';
import { getCanVisitedMenu, getAllMenu } from '@/api/menu.js';
import { buildTreeData } from '@/utils/treeUtils';
import router from '../../router';
// 匹配views里面所有的.vue文件
const modules = import.meta.glob('../../view/**/*.vue');

const useMenuStore = defineStore('menu', {
  state: () => ({
    allMenu: [], // 所有的菜单列表
    allTreeMenu: [], // 树形结构的所有菜单列表
    routes: [], // 所有的菜单列表
    canVisitedRoutes: [], // 有权访问的路由列表
    treeMenu: [] // 树形结构的菜单列表
  }),
  actions: {
    getAllMenu: function (needReload = false) {
      // 已经获取过菜单就不用再次获取
      if (!needReload && this.allMenu.length > 0) {
        return new Promise((resolve, reject) => {
          resolve(this.allTreeMenu);
        });
      }
      return new Promise((resolve, reject) => {
        // 获取所有的菜单列表
        getAllMenu().then(res => {
          this.allMenu = res.data || [];
          this.allTreeMenu = buildTreeData(this.allMenu);
          resolve(this.allTreeMenu);
        });
      });
    },
    getCanVisitedMenu: function (needReload = false) {
      // 已经获取过菜单就不用再次获取
      if (!needReload && this.treeMenu.length > 0) {
        return new Promise((resolve, reject) => {
          resolve(this.treeMenu);
        });
      }
      // 获取有权访问的菜单列表
      return new Promise((resolve, reject) => {
        getCanVisitedMenu()
          .then(res => {
            const canVisitedRoutes = res.data || [];
            this.canVisitedRoutes = canVisitedRoutes;
            // 先加载组件
            loadView(canVisitedRoutes);
            this.treeMenu = buildTreeData(canVisitedRoutes);
            // 同步添加到路由中
            this.addRoutes(this.treeMenu);
            resolve(this.treeMenu);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    addRoutes: function (treeMenu) {
      const routes = [];
      treeMenu.forEach(function (item) {
        const dynamicRouter = convertFromMenu(item);
        routes.push(dynamicRouter);
        router.addRoute('index', dynamicRouter);
      });
      this.routes = routes;
    },

    getRouterTree: function (path) {
      return deepFind(this.treeMenu, path);
    }
  },

  getters: {
    /**
     * 返回可以访问的菜单（包含目录和菜单）
     */
    canVisitedMenu(state) {
      return state.canVisitedRoutes.filter(item => {
        return item.type !== 'B';
      });
    }
  }
});

function loadView(menuList) {
  menuList.forEach(function (menu) {
    if (menu.component) {
      menu.component = doLoadView(menu.component);
    }
  });
}

/**
 * 把菜单元素转成路由对象
 * @param {Object} menuItem 菜单元素
 */
function convertFromMenu(menuItem) {
  return {
    path: menuItem.path,
    component: menuItem.component,
    meta: {
      title: menuItem.menuName,
      permission: menuItem.perms.split(',')
    },
    children: menuItem.children ? menuItem.children.map(convertFromMenu) : []
  };
}

/**
 * 根据目标路径path获取对应的路径地址数组
 * @param {Array} tree 树形菜单数组
 * @param {String} path 待查找的路径地址
 * @returns 返回目标path对应的路径数组
 */
function deepFind(tree, path) {
  var res = [];
  if (path === '/') {
    return res;
  }
  for (let index = 0; index < tree.length; index++) {
    res = [];
    if (deepFindPath(tree[index], path, res, 0)) {
      break;
    }
  }
  return res;
}

function deepFindPath(routers, path, res, deep) {
  // 先添加到已访问的路径
  res[deep] = {
    id: routers.path,
    name: routers.menuName
  };
  if (routers.path === path) {
    // 移除数组deep之后的数据
    res.splice(deep + 1);
    return true;
  }
  if (routers.children) {
    for (let index = 0; index < routers.children.length; index++) {
      if (deepFindPath(routers.children[index], path, res, deep + 1)) {
        return true;
      }
    }
  }
  return false;
}

export const doLoadView = view => {
  let res;
  for (const path in modules) {
    const dir = path.split('/view')[1].split('.vue')[0];
    if (dir === view) {
      res = () => modules[path]();
      break;
    }
  }
  return res;
};
export default useMenuStore;
