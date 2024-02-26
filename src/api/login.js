import request from '@/utils/request';
import { setToken } from '@/utils/auth';

// 登录方法
export function login(username, password, rememberMe) {
  const data = {
    username,
    password,
    rememberMe
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
    method: 'post',
  });
}

// 退出方法
export function logout() {
  return request({
    url: '/user/logout',
    method: 'post',
  });
}

// 刷新token
export async function refreshToken() {
  await request({
    url: '/user/refreshToken',
    method: 'post',
    _isRefreshTokenRequest: true,
  }).then(res => {
    if (res.data.token) {
      setToken(res.data.token);
    }
  });
}