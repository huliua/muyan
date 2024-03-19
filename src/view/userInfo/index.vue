<script setup name="UserInfo">
import Avatar from '@/components/Avatar/index.vue';
import useUserStore from '@/store/modules/user';
import useDictStore from '@/store/modules/dict';
import { updateUser, changePwd } from '@/api/user';
import { Iphone, Medal, Message, Calendar, User } from '@element-plus/icons-vue';
import $ from 'jquery';

const userStore = useUserStore();
// 用户信息展示
const userInfo = ref({});
userInfo.value = Object.assign({}, userStore.user);
// 用户信息修改表单
const formInfo = ref({});
formInfo.value = Object.assign({}, userStore.user);
// 密码修改表单
const formChangePwd = ref({
    id: userInfo.value.id,
    password: '',
    newPassword: '',
    confirmPassword: ''
});
const formInfoRef = ref(null);
// 密码修改表单引用
const formChangePwdRef = ref(null);

// 修改信息tab页默认选中项
const activeTabName = ref('info');

// 字典相关
const dictStore = useDictStore();
dictStore.initDict('t_dict_sex');
const dictSex = computed(() => dictStore.getDict('t_dict_sex'));

// 表单校验
const formRules = ref({
    nickName: [{ required: true, message: '用户名不能为空', trigger: 'blur' }, { min: 1, max: 30, message: '用户名长度必须为1-30位', trigger: 'blur' }],
    phone: [{ required: true, message: '昵称不能为空', trigger: 'blur' }, { pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号码', trigger: ['blur', 'change'] }],
    email: [{ required: true, message: '邮箱不能为空', trigger: 'blur' }, { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }]
});
const changePasswordRules = ref({
    password: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
    newPassword: [
        { validator: validatePass, trigger: 'blur' },
        { required: true, message: '新密码不能为空', trigger: 'blur' },
        { min: 8, max: 16, message: '密码长度必须为8-16位', trigger: 'blur' }
    ],
    confirmPassword: [
        { validator: validatePassfConfirm, trigger: 'blur' },
        { required: true, message: '确认密码不能为空', trigger: 'blur' },
        { min: 8, max: 16, message: '密码长度必须为8-16位', trigger: 'blur' }
    ],
});
function validatePass(rule, value, callback) {
    if (formChangePwd.value.confirmPassword !== '') {
        if (!formChangePwdRef.value) return;
        formChangePwdRef.value.validateField('confirmPassword', () => null);
    }
    callback();
}
function validatePassfConfirm(rule, value, callback) {
    if (value !== formChangePwd.value.newPassword) {
        callback(new Error('两次输入密码不一致！'));
    } else {
        callback();
    }
}

/**
 * 保存用户头像信息
 */
function saveAvatar(url) {
    updateUser({
        id: userInfo.value.id,
        avatar: url
    }).then(res => {
        if (res.code == 200) {
            ElMessage.success("保存成功！");
            userInfo.value.avatar = url;
            userStore.updateUserInfo({ avatar: url });
        } else {
            ElMessage.error("保存失败！");
        }
    });
}

/**
 * 保存用户表单信息
 */
function saveUserInfo() {
    formInfoRef.value.validate((valid) => {
        if (!valid) {
            return false;
        }
        // 保存用户信息的时候，去掉密码保存
        updateUser($.extend(false, formInfo.value, { password: '' })).then(res => {
            if (res.code == 200) {
                ElMessage.success("保存成功！");
                userStore.updateUserInfo(formInfo.value);
            } else {
                ElMessage.error("保存失败！");
            }
        });
    });
}

/**
 * 保存密码信息
 */
function changePassword() {
    formChangePwdRef.value.validate((valid) => {
        if (!valid) {
            return false;
        }
        changePwd({
            id: formChangePwd.value.id,
            password: formChangePwd.value.password,
            newPassword: formChangePwd.value.newPassword
        }).then(res => {
            if (res.code == 200) {
                ElMessage.success("保存成功！");
            } else {
                ElMessage.error("保存失败！");
            }
        });
    });
}

function resetForm() {
    formInfo.value = Object.assign({}, userStore.user);
    formInfoRef.value?.clearValidate();
}
function resetFormChangePwd() {
    formChangePwd.value = ref({
        id: userInfo.value.id,
        password: '',
        newPassword: '',
        confirmPassword: ''
    });
    formChangePwdRef.value?.clearValidate();
}
</script>
<template>
    <div>
        <!-- 左面展示个人基本信息 -->
        <el-row :gutter="20">
            <el-col :span="8">
                <el-card>
                    <template #header>用户信息</template>
                    <el-row justify="center">
                        <avatar v-model:imageUrl="userInfo.avatar" @success="saveAvatar" />
                    </el-row>
                    <el-divider border-style="hidden" />
                    <el-descriptions :column="1" border>
                        <el-descriptions-item>
                            <template #label>
                                <div class="cell-item">
                                    <el-icon>
                                        <User />
                                    </el-icon>
                                    账号
                                </div>
                            </template>
                            {{ userInfo.userName }}
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template #label>
                                <div class="cell-item">
                                    <el-icon>
                                        <Iphone />
                                    </el-icon>
                                    手机号码
                                </div>
                            </template>
                            {{ userInfo.phone }}</el-descriptions-item>
                        <el-descriptions-item>
                            <template #label>
                                <div class="cell-item">
                                    <el-icon>
                                        <Message />
                                    </el-icon>
                                    电子邮箱
                                </div>
                            </template>
                            {{ userInfo.email }}</el-descriptions-item>
                        <el-descriptions-item>
                            <template #label>
                                <div class="cell-item">
                                    <el-icon>
                                        <Medal />
                                    </el-icon>
                                    角色名称
                                </div>
                            </template>
                            <el-tag size="small">{{ userStore.roles.map(item => item.name).join('、') }}</el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template #label>
                                <div class="cell-item">
                                    <el-icon>
                                        <Calendar />
                                    </el-icon>
                                    创建时间
                                </div>
                            </template>
                            {{ userInfo.createTime }}
                        </el-descriptions-item>
                    </el-descriptions>
                </el-card>
            </el-col>
            <el-col :span="16">
                <el-card header="修改信息">
                    <el-tabs v-model="activeTabName">
                        <el-tab-pane label="基本信息" name="info">
                            <el-form ref="formInfoRef" :rules="formRules" :model="formInfo" label-width="100px" label-position="left">
                                <el-row>
                                    <el-col :span="24">
                                        <el-form-item label="账号" prop="userName">
                                            <el-input v-model="formInfo.userName" placeholder="请输入账号" disabled />
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="24">
                                        <el-form-item label="用户名" prop="nickName">
                                            <el-input v-model="formInfo.nickName" placeholder="请输入用户名" />
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="24">
                                        <el-form-item label="性别" prop="sex">
                                            <el-radio-group v-model="formInfo.sex">
                                                <el-radio v-for="dict in dictSex" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
                                            </el-radio-group>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="24">
                                        <el-form-item label="手机号" prop="phone">
                                            <el-input v-model="formInfo.phone" placeholder="请输入手机号" />
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="24">
                                        <el-form-item label="电子邮箱" prop="email">
                                            <el-input v-model="formInfo.email" placeholder="请输入电子邮箱" />
                                        </el-form-item>
                                    </el-col>

                                </el-row>
                            </el-form>
                            <div>
                                <el-button type="primary" size="small" @click="saveUserInfo">确 定</el-button>
                                <el-button type="danger" size="small" @click="resetForm">重置</el-button>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="修改密码" name="changePwd">
                            <el-form ref="formChangePwdRef" :model="formChangePwd" :rules="changePasswordRules" label-width="100px" label-position="left">
                                <el-row>
                                    <el-col :span="24">
                                        <el-form-item label="旧密码" prop="password">
                                            <el-input v-model="formChangePwd.password" placeholder="请输入旧密码" type="password" show-password />
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="24">
                                        <el-form-item label="新密码" prop="newPassword">
                                            <el-input v-model="formChangePwd.newPassword" placeholder="请输入新密码" type="password" show-password />
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="24">
                                        <el-form-item label="确认密码" prop="confirmPassword">
                                            <el-input v-model="formChangePwd.confirmPassword" placeholder="请输入确认密码" type="password" show-password />
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                            </el-form>
                            <div>
                                <el-button type="primary" size="small" @click="changePassword">确 定</el-button>
                                <el-button type="danger" size="small" @click="resetFormChangePwd">重置</el-button>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>