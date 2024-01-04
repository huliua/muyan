import request from '@/utils/request';
/**
 * 获取可以访问的菜单列表
 */
export function getCanVisitedMenu() {
  return request({
    url: '/menu/getMenu',
    method: 'post',
  });
}

/**
 * 获取所有的菜单列表
 */
export function getAllMenu() {
  return request({
    url: '/menu/getAllMenu',
    method: 'post',
  });
}

/**
 * 菜单列表数据查询
 */
export function getMenuList(params) {
  return request({
    url: '/menu/getMenuList',
    method: 'post',
    data: params
  });
}