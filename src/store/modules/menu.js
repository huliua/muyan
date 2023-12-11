import {defineStore} from 'pinia';
import {getAllMenu, getCanVisitedMenu} from '@/api/menu.js';
import router from '../../router';
// 匹配views里面所有的.vue文件
const modules = import.meta.glob('../../view/**/*.vue');

const useMenuStore = defineStore('menu', {
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
      // 已经获取过菜单就不用再次获取
      if (this.treeMenu.length > 0) {
        return new Promise((resolve, reject) => {
          resolve(this.treeMenu);
        });
      }
      // 获取有权访问的菜单列表
      return new Promise((resolve, reject) => {
        getCanVisitedMenu()
          .then((res) => {            
            const canVisitedRoutes = res || [];
            this.canVisitedRoutes = canVisitedRoutes;
            // 先加载组件
            loadView(canVisitedRoutes);       
            this.treeMenu = dealwithTree(canVisitedRoutes);
            // 同步添加到路由中
            this.addRoutes(this.treeMenu);
            resolve(this.treeMenu);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    addRoutes: function(treeMenu) {
      const routes = [];
      treeMenu.forEach(function(item) {
        const dynamicRouter = convertFromMenu(item);
        routes.push(dynamicRouter);
        router.addRoute('index', dynamicRouter);
      });
      this.routes = routes;
    }
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

function loadView(menuList) {
  menuList.forEach(function(menu) {
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
      permission: menuItem.perms
    },
    children: menuItem.children ? menuItem.children.map(convertFromMenu) : []
  };
}

export const doLoadView = (view) => {
  let res;
  for (const path in modules) {
    const dir = path.split('/view')[1].split('.vue')[0];    
    if (dir === view) {
      res = () => modules[path]();
      break;
    }
  }
  return res;
}
export default useMenuStore;