<!--菜单页面-->
<script setup>
import { isBlank } from '@/utils/commonUtils';
import { getQuerySetting } from '@/utils/querySettingUtils';
import { getRoleList, updateRole, deleteRole, getRoleMenuPermission } from '@/api/role';
import useDictStore from '@/store/modules/dict.js';
import dictTag from '@/components/DictTag/index.vue';
import $ from 'jquery';
import useMenuStore from '@/store/modules/menu';

const tableRef = ref(null);
const tableData = ref([]);
const pageSize = ref(10);
const currentPage = ref(1);
const total = ref(0);
const treeRef = ref(null); // 树形组件
const menuDefaultCheckedKeys = ref([]); // 菜单树默认选中的节点

// 字典
const dictStore = useDictStore();
onMounted(() => {
  // 获取表格数据
  getTableData();
  // 初始化字典
  dictStore.initDict('t_dict_status');
});
const dictStatus = computed(() => dictStore.getDict('t_dict_status'));

// 查询条件模型
const queryParams = ref({
  name: {
    value: '',
    name: 'name',
    builder: 'like'
  },
  roleKey: {
    value: '',
    name: 'role_key',
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
  }
});

/**
 * 获取表格数据
 */
const getTableData = function () {
  getRoleList({
    pageSize: pageSize.value,
    pageNum: currentPage.value,
    order: '+order_num,-create_time,-update_time',
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
};

/**
 * 修改
 * @param row
 */
const handleEdit = function (row) {
  title.value = '编辑';
  open.value = true;
  form.value = $.extend(true, {}, row);
  menuDefaultCheckedKeys.value = [];
  // 设置菜单权限
  setMenuPermission(form.value.id);
};
/**
 * 根据roleId获取菜单权限
 * @param {*} roleId 角色id
 */
const setMenuPermission = function (roleId) {
  getRoleMenuPermission(roleId).then(res => {
    menuDefaultCheckedKeys.value = (res.data.menuIdList || []).map(item => { return item.menuId; });
  });
};
/**
 * 删除菜单项
 */
const deleteRow = function (row) {
  deleteRole(row.id).then(res => {
    ElMessage.success('删除成功！');
    getTableData();
  });
};

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
const rules = ref({
  name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
  roleKey: [{ required: true, message: '权限字符不能为空', trigger: 'blur' }],
  orderNum: [{ required: true, message: '角色排序不能为空', trigger: 'blur' }],
  menuIds: [{ required: true, message: '菜单授权不能为空', trigger: 'blur' }]
});
const menuOptions = ref([]);
const menuStore = useMenuStore();
watch(open, newVal => {
  if (newVal === false) {
    return;
  }
  // 清除表单校验
  formRef.value?.clearValidate();
  // 获取菜单数据
  menuStore.getAllMenu().then(res => {
    menuOptions.value = res || [];
  });
});

/**
 * 表单提交
 */
const submitForm = function (formEl) {
  // 获取选中的菜单
  const menuIds = treeRef.value.getCheckedKeys(false);
  // 获取半选中的菜单
  // 注意：这里需要使用getHalfCheckedKeys方法，因为getCheckedKeys方法只能获取到叶子节点的key
  const halfMenuIds = treeRef.value.getHalfCheckedKeys();
  // 把两个数组的数据合并
  const menuAllIds = [...menuIds, ...halfMenuIds];
  // 初始化menuIds数组
  form.value.menuIds = [];
  // 遍历menuAllIds数组，把每个key添加到menuIds数组中
  menuAllIds.forEach(key => {
    form.value.menuIds.push(key);
  });

  formEl.validate(valid => {
    if (!valid) return;
    // 提交表单
    updateRole(form.value).then(res => {
      ElMessage.success((isBlank(form.value.id) ? '新增' : '更新') + '成功！');
      open.value = false;
      getTableData();
    });
  });
};
</script>

<template>
  <div>
    <!-- 查询条件 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="queryParams.name.value" placeholder="请输入角色名称" clearable style="width: 200px" @keyup.enter="getTableData" />
      </el-form-item>
      <el-form-item label="权限字符" prop="roleKey">
        <el-input v-model="queryParams.roleKey.value" placeholder="请输入权限字符" clearable style="width: 200px" @keyup.enter="getTableData" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status.value" placeholder="菜单状态" clearable style="width: 200px">
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
      <el-table-column prop="id" label="角色编号" />
      <el-table-column prop="name" label="角色名称" />
      <el-table-column prop="roleKey" label="权限字符" />
      <el-table-column prop="orderNum" label="显示顺序" />
      <el-table-column prop="remark" label="备注" />
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <dict-tag :options="dictStatus" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="200" />
      <el-table-column fixed="right" label="操作" width="200">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="handleEdit(scope.row)"> 编辑</el-button>
          <el-popconfirm title="确定要删除吗?" @confirm="deleteRow(scope.row)">
            <template #reference>
              <el-button link type="danger" size="small"> 删除</el-button>
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
            <el-form-item label="角色名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入角色名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权限字符" prop="roleKey">
              <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示顺序" prop="orderNum">
              <el-input-number v-model="form.orderNum" :min="0" />
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
            <el-form-item label="菜单授权" prop="menuIds">
              <el-tree ref="treeRef" class="tree-border" :check-strictly="true" :default-checked-keys="menuDefaultCheckedKeys" show-checkbox default-expand-all node-key="id" highlight-current :data="menuOptions" :props="{ label: 'menuName', children: 'children' }" placeholder="选择上级菜单" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" :rows="2" type="textarea"></el-input>
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
  </div>
</template>
<style scoped>
.mv8 {
  margin: 16px 0;
}

.el-form-item__content .el-select {
  flex-grow: 1;
}

.tree-border {
  margin-top: 5px;
  border: 1px solid #e5e6e7;
  background: #fff none;
  border-radius: 4px;
  width: 100%;
}
</style>
