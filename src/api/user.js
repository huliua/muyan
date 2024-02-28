import request from '@/utils/request';

// 获取用户列表
export function getUserList(params) {
    return request({
        url: '/user/list',
        method: 'post',
        data: params
    });
}

// 更新或新增用户信息
export function updateUser(params) {
    return request({
        url: '/user/update',
        method: 'post',
        data: params
    });
}

// 删除用户信息
export function deleteUser(params) {
    return request({
        url: '/user/delete',
        method: 'post',
        data: params
    });
}

// 修改用户密码
export function changePwd(params) {
    return request({
        url: '/user/changePwd',
        method: 'post',
        data: params
    });
}