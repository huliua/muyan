import axios from 'axios';
import { getToken, removeToken, getRefreshToken } from '@/utils/auth';
import errorCode from '@/utils/errorCode';
import { isBlank, tansParams } from '@/utils/commonUtils';
import router from '@/router';
import { refreshToken } from '@/api/login';

// 是否显示重新登录
export let isRelogin = { show: false };
let loadingInstance = null;
let isRefreshToken = false;
axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: import.meta.env.VITE_APP_BASE_API,
  // 超时
  timeout: 10000
});

// request拦截器
service.interceptors.request.use(
  config => {
    // 判断是否是刷新token请求
    isRefreshToken = config?._isRefreshTokenRequest;
    if (isRefreshToken) {
      config.headers['refresh-token'] = getRefreshToken();
    }

    // 是否需要设置 token
    const needToken = (config.headers || {}).needToken;
    if ((isBlank(needToken) || needToken) && getToken()) {
      config.headers['token'] = getToken();
    }
    // 是否需要展示loading
    const needLoading = (config.headers || {}).needLoading;
    if (isBlank(needLoading) || needLoading) {
      loadingInstance = ElLoading.service({
        lock: true,
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.7)'
      });
    }
    // get请求映射params参数
    if (config.method === 'get' && config.params) {
      let url = config.url + '?' + tansParams(config.params);
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }
    return config;
  },
  error => {
    console.log(error);
    Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  async res => {
    // 关闭loading
    if (loadingInstance) {
      loadingInstance.close();
    }
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200;
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode['default'];
    // 二进制数据则直接返回
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
      return res.data;
    }
    if (code === 401) {
      // 如果当前不是刷新token请求，且存在刷新token，则需要执行刷新token方法
      if (!isRefreshToken && !isBlank(getRefreshToken())) {
        // 需要刷新token
        await refreshToken();
        return service(res.config);
      }
      if (!isRelogin.show) {
        isRelogin.show = true;
        ElMessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          isRelogin.show = false;
          // 清除token
          removeToken();
          router.push({
            path: '/login',
            query: {
              redirectUrl: router.currentRoute.value.fullPath
            }
          });
        }).catch(() => {
          isRelogin.show = false;
        });
      }
      return Promise.reject('无效的会话，或者会话已过期，请重新登录。');
    } else if (code === 500) {
      ElMessage({ message: msg, type: 'error' });
      return Promise.reject(new Error(msg));
    } else if (code === 601) {
      ElMessage({ message: msg, type: 'warning' });
      return Promise.reject(new Error(msg));
    } else if (code !== 200) {
      ElNotification.error({ title: msg });
      return Promise.reject('error');
    } else {
      return Promise.resolve(res.data || {});
    }
  },
  error => {
    // 关闭loading
    if (loadingInstance) {
      loadingInstance.close();
    }
    console.log('err' + error);
    let { message } = error;
    if (message == 'Network Error') {
      message = '后端接口连接异常';
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时';
    } else if (message.includes('Request failed with status code')) {
      message = '系统接口' + message.substr(message.length - 3) + '异常';
    }
    ElMessage({ message: message, type: 'error', duration: 5 * 1000 });
    return Promise.reject(error);
  }
);

export default service;
