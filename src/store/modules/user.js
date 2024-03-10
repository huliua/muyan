import { login, logout, getInfo } from '@/api/login';
import { getToken, setToken, removeToken, setRefreshToekn, removeRefreshToken } from '@/utils/auth';
import defAva from '@/assets/images/profile.jpg';
import { defineStore } from 'pinia';

const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    id: '',
    name: '',
    avatar: '',
    roles: [],
    permissions: [],
  }),
  actions: {
    // 登录
    login(userInfo) {
      const userName = userInfo.userName.trim();
      const password = userInfo.password;
      const rememberMe = userInfo.rememberMe;
      return new Promise((resolve, reject) => {
        login(userName, password, rememberMe).then((res) => {
          setToken(res.data.token);
          if (res.data.refreshToken) {
            setRefreshToekn(res.data.refreshToken);
          }
          this.token = res.data.token;
          resolve();
        }).catch((error) => {
          reject(error);
        });
      });
    },
    // 获取用户信息
    getInfo() {
      return new Promise((resolve, reject) => {
        getInfo().then((res) => {
          const user = res.data.user;
          const avatar = user.avatar == '' || user.avatar == null ? defAva : user.avatar;
          // 获取用户身份信息
          if (res.data.roles && res.data.roles.length > 0) {
            this.roles = res.data.roles;
          } else {
            this.roles = [];
          }
          // 获取用户权限信息
          if (res.data.permissions && res.data.permissions.length > 0) {
            this.permissions = res.data.permissions;
          } else {
            this.permissions = [];
          }
          this.id = user.id;
          this.name = user.nickName;
          this.avatar = avatar;
          resolve(res.data);
        }).catch((error) => {
          reject(error);
        });
      });
    },
    // 退出系统
    logOut() {
      return new Promise((resolve, reject) => {
        logout().then(() => {
          // 重置登录用户信息
          this.resetData();
          removeToken();
          removeRefreshToken();
          resolve();
        }).catch((error) => {
          reject(error);
        });
      });
    },
    hasPermission(perms) {
      // 如果权限是所有人都可以访问
      if (perms.includes("all")) {
        return true;
      }
      // 判断用户的权限是否包含了permissions中的一种
      return this.permissions.some(permission => perms == permission);
    },
    resetData() {
      this.id = '';
      this.name = '';
      this.avatar = '';
      this.roles = [];
      this.permissions = [];
      this.token = '';
    }
  },
});

export default useUserStore;
