<!--菜单页面-->
<script setup>
import { isBlank } from '@/utils/commonUtils';
import { addMenu, deleteMenu, getMenuList, updateMenu } from '@/api/menu';
import { buildTreeData } from '@/utils/treeUtils';
import { getQuerySetting } from '@/utils/querySettingUtils';
import useDictStore from '@/store/modules/dict.js';
import useMenuStore from '@/store/modules/menu.js';
import dictTag from '@/components/DictTag/index.vue';
import $ from 'jquery';

const tableData = ref([]);
const pageSize = ref(-1);
const currentPage = ref(1);
const menuStore = useMenuStore();

// 字典
const dictStore = useDictStore();
onMounted(() => {
  // 获取表格数据
  getTableData();
  // 初始化字典
  dictStore.initDict('t_dict_status', 't_dict_visible');
});
const dictStatus = computed(() => dictStore.getDict('t_dict_status'));
const dictVisible = computed(() => dictStore.getDict('t_dict_visible'));

// 查询条件模型
const queryParams = ref({
  menuName: {
    value: '',
    name: 'menu_name',
    builder: 'like'
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
  getMenuList({
    pageSize: pageSize.value,
    pageNum: currentPage.value,
    order: '+parent_id,+order_num',
    querySetting: getQuerySetting([], queryParams.value)
  }).then(res => {
    tableData.value = buildTreeData(res.data, {
      childrenProp: 'children',
      parentIdProp: 'parentId'
    });
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
      type: 'D',
      visible: '1',
      status: '1',
      isLink: '0'
    };
  } else {
    form.value = {
      type: 'M',
      parentId: row.id,
      visible: '1',
      status: '1',
      isLink: '0'
    };
  }

  open.value = true;
};

/**
 * 修改
 * @param row
 */
const handleEdit = function (row) {
  title.value = '新增';
  open.value = true;
  form.value = $.extend(true, {}, row);
};
/**
 * 删除菜单项
 */
const deleteRow = function (row) {
  deleteMenu(row.id).then(res => {
    ElMessage.success('删除成功！');
    menuStore.setNeedRefreshAllMenu();
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
const menuRef = ref(null);
const form = ref({});
const rules = ref({
  menuName: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
  orderNum: [{ required: true, message: '菜单顺序不能为空', trigger: 'blur' }],
  path: [{ required: true, message: '路由地址不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '请选择菜单类型', trigger: 'blur' }]
});
const menuOptions = ref([]);
watch(open, newVal => {
  if (newVal === false) {
    return;
  }
  menuStore.getAllMenu().then(res => {
    menuOptions.value = res || [];
  });
});

const showChooseIcon = ref(false);
const iconSelectRef = ref(null);
const showSelectIcon = function () {
  iconSelectRef.value.reset();
  showChooseIcon.value = true;
};

const chosenIcon = function (iconName) {
  form.value.icon = iconName;
  showChooseIcon.value = false;
};

/**
 * 表单提交
 */
const submitForm = function (formEl) {
  formEl.validate(valid => {
    if (!valid) return;
    form.value.children = [];
    // 提交表单
    (isBlank(form.value.id) ? addMenu : updateMenu)(form.value).then(res => {
      ElMessage.success((isBlank(form.value.id) ? '新增' : '更新') + '成功！');
      open.value = false;
      // 设置加载菜单数据时不从缓存中取
      menuStore.setNeedRefreshAllMenu();
      getTableData();
    });
  });
};
</script>

<template>
  <div>
    <!-- 查询条件 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="菜单名称" prop="menuName">
        <el-input v-model="queryParams.menuName.value" placeholder="请输入菜单名称" clearable style="width: 200px" @keyup.enter="getTableData" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status.value" placeholder="菜单状态" clearable style="width: 200px">
          <el-option v-for="dict in dictStatus" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="getTableData">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery(true)">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mv8">
      <el-col :span="1.5">
        <el-button type="primary" @click="handleAdd(null)">新增</el-button>
      </el-col>
    </el-row>

    <!-- 表格内容 -->
    <el-table :data="tableData" style="width: 100%" :stripe="true" row-key="id" border :tree-props="{ children: 'children' }">
      <el-table-column prop="menuName" label="菜单名称" />
      <el-table-column prop="icon" label="图标" align="center">
        <template #default="scope">
          <svg-icon :icon-class="scope.row.icon" />
        </template>
      </el-table-column>
      <el-table-column prop="orderNum" label="排序" />
      <el-table-column prop="perms" label="权限标识" />
      <el-table-column prop="component" label="组件路径" />
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <dict-tag :options="dictStatus" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column fixed="right" label="操作" width="150">
        <template #default="scope">
          <el-button link type="primary" size="small" @click.prevent="handleEdit(scope.row)"> 编辑</el-button>
          <el-button link type="primary" size="small" @click.prevent="handleAdd(scope.row)"> 新增</el-button>
          <el-popconfirm title="确定要删除吗?" @confirm="deleteRow(scope.row)">
            <template #reference>
              <el-button link type="danger" size="small"> 删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <!--    <div>-->
    <!--      <pagination v-model:pageSize="pageSize" v-model:currentPage="currentPage" :total="total" @pagination="getTableData()" />-->
    <!--    </div>-->
    <!-- 添加或修改菜单对话框 -->
    <el-dialog :title="title" v-model="open" width="680px" append-to-body :close-on-click-modal="false">
      <el-form ref="menuRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级菜单">
              <el-tree-select v-model="form.parentId" :data="menuOptions" :props="{ value: 'id', label: 'menuName', children: 'children' }" value-key="id" placeholder="选择上级菜单" clearable check-strictly />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="type">
              <el-radio-group v-model="form.type">
                <el-radio label="D">目录</el-radio>
                <el-radio label="M">菜单</el-radio>
                <el-radio label="B">按钮</el-radio>
                <el-radio label="O">其他</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="form.type == 'D' || form.type == 'M'">
            <el-form-item label="菜单图标" prop="icon">
              <el-popover placement="bottom-start" :width="540" v-model:visible="showChooseIcon" trigger="click" @show="showSelectIcon">
                <template #reference>
                  <el-input v-model="form.icon" placeholder="点击选择图标" readonly>
                    <template #prefix>
                      <svg-icon v-if="form.icon" :icon-class="form.icon" class="el-input__icon" style="height: 32px; width: 16px" />
                      <el-icon v-else style="height: 32px; width: 16px">
                        <search />
                      </el-icon>
                    </template>
                  </el-input>
                </template>
                <icon-select ref="iconSelectRef" @selected="chosenIcon" :active-icon="form.icon" />
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="menuName">
              <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type == 'D' || form.type == 'M'">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                    <el-icon><question-filled /></el-icon> </el-tooltip>是否外链
                </span>
              </template>
              <el-radio-group v-model="form.isLink">
                <el-radio label="0">否</el-radio>
                <el-radio label="1">是</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type == 'D' || form.type == 'M'">
            <el-form-item prop="path">
              <template #label>
                <span>
                  <el-tooltip content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头" placement="top">
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  路由地址
                </span>
              </template>
              <el-input v-model="form.path" placeholder="请输入路由地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type == 'M'">
            <el-form-item prop="component">
              <template #label>
                <span>
                  <el-tooltip content="访问的组件路径，如：`/menu/index`，默认在`view`目录下" placement="top">
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  组件路径
                </span>
              </template>
              <el-input v-model="form.component" placeholder="请输入组件路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type != 'D'">
            <el-form-item>
              <el-input v-model="form.perms" placeholder="请输入权限标识" maxlength="100" />
              <template #label>
                <span>
                  <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@hasPermi('system:user:list')`)" placement="top">
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  权限字符
                </span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type == 'M'">
            <el-form-item>
              <el-input v-model="form.queryParam" placeholder="请输入路由参数" maxlength="255" />
              <template #label>
                <span>
                  <el-tooltip content='访问路由的默认传递参数，如：`{"id": 1, "name": "ry"}`' placement="top">
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  路由参数
                </span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type == 'D' || form.type == 'M'">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问" placement="top">
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  显示状态
                </span>
              </template>
              <el-radio-group v-model="form.visible">
                <el-radio v-for="dict in dictVisible" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip content="选择停用则路由将不会出现在侧边栏，也不能被访问" placement="top">
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  菜单状态
                </span>
              </template>
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in dictStatus" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm(menuRef)">确 定</el-button>
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
</style>
