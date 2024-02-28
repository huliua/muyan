<!--菜单页面-->
<script setup>
import { isBlank } from '@/utils/commonUtils';
import { getQuerySetting } from '@/utils/querySettingUtils';
import useDictStore from '@/store/modules/dict.js';
import dictTag from '@/components/DictTag/index.vue';
import { getUserList, updateUser, deleteUser, changePwd } from '@/api/user.js';
import { getRoleList } from '@/api/role';
import { Lock } from '@element-plus/icons-vue';

import $ from 'jquery';

const tableRef = ref(null);
const tableData = ref([]);
const pageSize = ref(10);
const currentPage = ref(1);
const total = ref(0);
const changePwdDialog = ref(false); // 修改密码弹框
const changePwdForm = ref(null); // 修改密码表单
// 字典
const dictStore = useDictStore();
onMounted(() => {
    // 获取表格数据
    getTableData();
    // 初始化字典
    dictStore.initDict('t_dict_status');
    dictStore.initDict('t_dict_sex');
});
const dictStatus = computed(() => dictStore.getDict('t_dict_status'));
const dictSex = computed(() => dictStore.getDict('t_dict_sex'));

// 查询条件模型
const queryParams = ref({
    userName: {
        value: '',
        name: 'user_name',
        builder: 'like'
    },
    nickName: {
        value: '',
        name: 'nick_name',
        builder: 'like'
    },
    createTime: {
        value: '',
        name: 'create_time',
        builder: 'between'
    },
    status: {
        value: '',
        name: 'status',
        builder: 'in'
    },
    sex: {
        value: '',
        name: 'sex',
        builder: 'in'
    }
});

/**
 * 获取表格数据
 */
const getTableData = function () {
    getUserList({
        pageSize: pageSize.value,
        pageNum: currentPage.value,
        order: '+id,-create_time,-update_time',
        querySetting: getQuerySetting([], queryParams.value)
    }).then(res => {
        tableData.value = res.data;
        total.value = res.total;
    });
};

/**
 * 添加
 * @param row
 */
const handleAdd = function (row) {
    title.value = '新增';
    if (isBlank(row)) {
        form.value = {
            status: '1'
        };
    } else {
        form.value = {
            status: '1'
        };
    }

    open.value = true;
};

const batchDel = function () {
    const data = tableRef.value.getSelectionRows();
    if (data.length == 0) {
        ElMessage.warning('请先选择待删除数据！');
        return;
    }
    var ids = [];
    data.forEach(function (item) {
        ids.push(item.id);
    });
    deleteRow({ id: ids.join(',') });
};

/**
 * 修改
 * @param row
 */
const handleEdit = function (row) {
    title.value = '编辑';
    open.value = true;
    form.value = $.extend(true, {}, row);
    // 特殊处理roleId字段
    form.value.roleId = form.value.roleId?.split(',');
};

/**
 * 修改密码
 */
const showChangePwd = function (row) {
    changePwdDialog.value = true;
    form.value = $.extend(true, {}, row);
    // 清空密码
    form.value.password = '';
    changePwdForm.value?.clearValidate();
};
/**
 * 执行密码修改
 */
const doChangePwd = function (formEl) {
    formEl.validate(valid => {
        if (!valid) return;
        const formData = {
            id: form.value.id,
            newPassword: form.value.password
        };
        // 提交表单
        changePwd(formData).then(res => {
            ElMessage.success('修改密码成功！');
            changePwdDialog.value = false;
        });
    });
};

/**
 * 删除用户
 */
const deleteRow = function (row) {
    deleteUser({ id: row.id }).then(res => {
        ElMessage.success('删除成功！');
        getTableData();
    });
};

/**
 * 清空查询条件
 * @param {*} needReload 是否需要重新加载
 */
const resetQuery = function (needReload = false) {
    // 设置queryParams中value为空
    Object.keys(queryParams.value).forEach(key => {
        queryParams.value[key].value = '';
    });
    if (needReload) {
        getTableData();
    }
};

// 表单相关
const title = ref('');
const open = ref(false);
const formRef = ref(null);
const form = ref({});
const validatePassword2 = function (rule, value, callback) {
    // 校验两次输入的密码一样
    if (form.value.password !== value) {
        callback(new Error('两次输入的密码不一致'));
    } else {
        callback();
    }
};
const rules = ref({
    userName: [{ required: true, message: '账号不能为空', trigger: 'blur' }],
    nickName: [{ required: true, message: '昵称不能为空', trigger: 'blur' }],
    password: [
        { required: true, message: '确认密码不能为空', trigger: 'blur' },
        { min: 8, max: 16, message: '密码长度必须为8-16位', trigger: 'blur' }
    ],
    password2: [
        { required: true, message: '确认密码不能为空', trigger: 'blur' },
        { min: 8, max: 16, message: '密码长度必须为8-16位', trigger: 'blur' },
        { validator: validatePassword2, trigger: 'blur' }
    ],
    sex: [{ required: true, message: '性别不能为空', trigger: 'blur' }],
    roleId: [{ required: true, message: '所属角色不能为空', trigger: 'blur' }]
});

watch(open, newVal => {
    if (newVal === false) {
        return;
    }
    // 清除表单校验
    formRef.value?.clearValidate();
    // 初始化角色列表
    getAllRoleList();
});
/**
 * 表单提交
 */
const submitForm = function (formEl) {
    formEl.validate(valid => {
        if (!valid) return;
        const formData = $.extend(true, {}, form.value);
        // 特殊处理roleId、password
        formData.roleId = formData.roleId.join(',');
        if (!isBlank(formData.id)) {
            formData.password = '';
        }
        // 提交表单
        updateUser(formData).then(res => {
            ElMessage.success((isBlank(formData.id) ? '新增' : '更新') + '成功！');
            open.value = false;
            getTableData();
        });
    });
};

const roleList = ref([]);
const getAllRoleList = function () {
    if (roleList.value.length > 0) {
        return;
    }
    getRoleList({ paseNumber: 0, querySetting: '[{\"name\":\"status\",\"builder\":\"in\",\"value\":\"1\"}]' }).then(res => {
        roleList.value = res.data;
    });
};
</script>

<template>
    <div>
        <!-- 查询条件 -->
        <el-form :model="queryParams" ref="queryRef" :inline="true">
            <el-form-item label="账号" prop="userName">
                <el-input v-model="queryParams.userName.value" placeholder="请输入账号" clearable style="width: 200px" @keyup.enter="getTableData" />
            </el-form-item>
            <el-form-item label="用户名" prop="nickName">
                <el-input v-model="queryParams.nickName.value" placeholder="请输入用户名" clearable style="width: 200px" @keyup.enter="getTableData" />
            </el-form-item>
            <el-form-item label="性别" prop="sex">
                <el-select multiple v-model="queryParams.sex.value" placeholder="性别" clearable style="width: 200px">
                    <el-option v-for="dict in dictSex" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-select multiple v-model="queryParams.status.value" placeholder="用户状态" clearable style="width: 200px">
                    <el-option v-for="dict in dictStatus" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="创建时间" prop="createTime">
                <el-date-picker v-model="queryParams.createTime.value" is-range format="YYYY/MM/DD" type="daterange" value-format="YYYY-MM-DD" range-separator="-" start-placeholder="开始时间" end-placeholder="结束时间" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="getTableData">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery(true)">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mv8">
            <el-col :span="1.5">
                <el-button type="primary" @click="handleAdd(null)">新增</el-button>
                <el-button type="danger" @click="batchDel">删除</el-button>
            </el-col>
        </el-row>

        <!-- 表格内容 -->
        <el-table ref="tableRef" :data="tableData" style="width: 100%" :stripe="true" row-key="id" border>
            <el-table-column type="selection" width="55" />
            <el-table-column prop="userName" label="账号" />
            <el-table-column prop="nickName" label="用户名" />
            <el-table-column prop="sex" label="性别">
                <template #default="scope">
                    <dict-tag :options="dictSex" :value="scope.row.sex" />
                </template>
            </el-table-column>
            <el-table-column prop="phone" label="手机号" />
            <el-table-column prop="email" label="电子邮箱" />
            <el-table-column prop="status" label="状态">
                <template #default="scope">
                    <dict-tag :options="dictStatus" :value="scope.row.status" />
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="200" />
            <el-table-column fixed="right" label="操作" width="200">
                <template #default="scope">
                    <el-button link type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button link type="warning" size="small" @click="showChangePwd(scope.row)">修改密码</el-button>
                    <el-popconfirm title="确定要删除吗?" @confirm="deleteRow(scope.row)">
                        <template #reference>
                            <el-button link type="danger" size="small">删除</el-button>
                        </template>
                    </el-popconfirm>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页 -->
        <div>
            <pagination v-model:pageSize="pageSize" v-model:currentPage="currentPage" v-model:total="total" @pagination="getTableData()" />
        </div>
        <!-- 添加或修改菜单对话框 -->
        <el-dialog :title="title" v-model="open" width="680px" append-to-body :close-on-click-modal="false" :draggable="true">
            <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="账号" prop="userName">
                            <el-input v-model="form.userName" placeholder="请输入账号" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="用户名" prop="nickName">
                            <el-input v-model="form.nickName" placeholder="请输入用户名" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24" v-if="isBlank(form.id)">
                        <el-form-item label="密码" prop="password">
                            <el-input :prefix-icon="Lock" maxlength="16" v-model="form.password" type="password" placeholder="请输入密码(8-16字符组成)" show-password />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24" v-if="isBlank(form.id)">
                        <el-form-item label="确认密码" prop="password2">
                            <el-input :prefix-icon="Lock" maxlength="16" v-model="form.password2" type="password2" placeholder="请输入确认密码" show-password />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="性别" prop="sex">
                            <el-radio-group v-model="form.sex">
                                <el-radio v-for="dict in dictSex" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="手机号" prop="phone">
                            <el-input v-model="form.phone" placeholder="请输入手机号" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="电子邮箱" prop="email">
                            <el-input v-model="form.email" placeholder="请输入电子邮箱" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="状态" prop="status">
                            <el-radio-group v-model="form.status">
                                <el-radio v-for="dict in dictStatus" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="所属角色" prop="roleId">
                            <el-select v-model="form.roleId" multiple filterable reserve-keyword placeholder="请选择用户角色" style="width: 240px">
                                <el-option v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitForm(formRef)">确 定</el-button>
                    <el-button @click="open = false">取 消</el-button>
                </div>
            </template>
        </el-dialog>
        <!-- 修改密码弹出框 -->
        <el-dialog title="修改密码" v-model="changePwdDialog" width="680px" append-to-body :close-on-click-modal="false" :draggable="true">
            <el-form ref="changePwdForm" :model="form" :rules="rules" label-width="100px">
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="账号" prop="userName">
                            <el-input disabled v-model="form.userName" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="密码" prop="password">
                            <el-input :prefix-icon="Lock" maxlength="16" v-model="form.password" type="password" placeholder="请输入密码(8-16字符组成)" show-password />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="确认密码" prop="password2">
                            <el-input :prefix-icon="Lock" maxlength="16" v-model="form.password2" type="password2" placeholder="请输入确认密码" show-password />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="doChangePwd(changePwdForm)">确 定</el-button>
                    <el-button @click="changePwdDialog = false">取 消</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>
<style scoped>
.mv8 {
    margin: 16px 0;
}
</style>
