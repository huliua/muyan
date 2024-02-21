import request from '@/utils/request';

/**
 * 获取角色列表
 */
export function getRoleList(params) {
  return request({
    url: '/role/getList',
    method: 'post',
    data: params
  });
}

export function addRole(params) {
  return request({
    url: '/role/add',
    method: 'post',
    data: params
  });
}

export function updateRole(params) {
  return request({
    url: '/role/update',
    method: 'post',
    data: params
  });
}

export function deleteRole(id) {
  return request({
    url: '/role/delete/' + id,
    method: 'post'
  });
}

export function getRoleMenuPermission(id) {
  return request({
    url: `/role/menuPermission/${id}`,
    method: 'post'
  });
}
