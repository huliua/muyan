<!--登录页面-->
<script setup>
// 登录表单
import { ref } from 'vue';
import { Lock, User } from '@element-plus/icons-vue';
import useUserStore from '@/store/modules/user';
import { useRoute, useRouter } from 'vue-router';

const userStore = useUserStore();
const loginForm = ref({
  userName: '',
  password: '',
  rememberMe: false,
  uuid: ''
});
const loginRules = {
  userName: [
    {
      required: true,
      trigger: 'blur',
      message: '请输入您的账号'
    }
  ],
  password: [
    {
      required: true,
      trigger: 'blur',
      message: '请输入您的密码'
    }
  ]
};
// 是否登录中
const loading = ref(false);
const loginRef = ref(null);
const router = useRouter();
const route = useRoute();

// 解码url
const redirectUrl = ref('');
if (route.params && route.params.redirectUrl) {
  redirectUrl.value = decodeURIComponent(route.params.redirectUrl);
}
if (route.query && route.query.redirectUrl) {
  redirectUrl.value = decodeURIComponent(route.query.redirectUrl);
}
/**
 * 登录处理逻辑
 */
const handleLogin = function () {
  loginRef.value.validate((valid, fields) => {
    if (!valid) {
      return;
    }
    loading.value = true;
    // 执行登录
    userStore
      .login(loginForm.value)
      .then(res => {
        loading.value = false;
        ElNotification({
          title: 'Success',
          message: '登录成功',
          type: 'success'
        });

        // 跳转到首页
        router.push(redirectUrl.value || '/');
      })
      .catch(err => {
        loading.value = false;
      })
      .finally(() => {
        loading.value = false;
      });
  });
};

// 是否开启注册
const register = ref(false);
</script>
<template>
  <div class="login">
    <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
      <h3 class="title">慕言后台管理系统</h3>
      <el-form-item prop="userName">
        <el-input v-model="loginForm.userName" type="text" size="large" auto-complete="off" placeholder="账号">
          <template #prefix>
            <el-icon>
              <User />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="loginForm.password" type="password" size="large" auto-complete="off" placeholder="密码" show-password>
          <template #prefix>
            <el-icon>
              <Lock />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" style="margin: 0px 0px 25px 0px">7天免登录</el-checkbox>
      <el-form-item style="width: 100%">
        <el-button :loading="loading" size="large" type="primary" style="width: 100%" @click.native.prevent="handleLogin">
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
        <div style="float: right" v-if="register">
          <router-link class="link-type" :to="'/register'">立即注册</router-link>
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright ©2018-2023 huliua.asia All Rights Reserved.</span>
    </div>
  </div>
</template>

<style scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url('../../assets/images/login-background.jpg');
  background-size: cover;
}

.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;

  .el-input {
    height: 40px;

    input {
      height: 40px;
    }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
  }
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
</style>
