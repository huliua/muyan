import request from '@/utils/request';

// 登录方法
export function login(username, password) {
  const data = {
    username,
    password,
  };
  return request({
    url: '/user/login',
    headers: {
      needToken: false,
    },
    method: 'post',
    data: data,
  });
}

// 注册方法
export function register(data) {
  return request({
    url: '/user/register',
    headers: {
      needToken: false,
    },
    method: 'post',
    data: data,
  });
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/user/getInfo',
    method: 'get',
  });
}

// 退出方法
export function logout() {
  return request({
    url: '/user/logout',
    method: 'post',
  });
}
