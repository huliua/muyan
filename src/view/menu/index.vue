<!--菜单页面-->
<script setup>
import { getMenuList } from '@/api/menu';
import { buildTreeData } from '@/utils/treeUtils';
import { getQuerySetting } from '@/utils/querySettingUtils';
import useDictStore from '@/store/modules/dict.js';
import dictTag from '@/components/DictTag/index.vue';
const tableData = ref([]);
const pageSize = ref(-1);
const currentPage = ref(1);

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
 * 删除菜单项
 * @param {string} id 菜单唯一标识
 */
const deleteRow = function (row) {
  console.log('row', row);
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

    <!-- 表格内容 -->
    <el-table :data="tableData" style="width: 100%" :stripe="true" row-key="id" border :tree-props="{ children: 'children' }">
      <el-table-column prop="menuName" label="菜单名称" />
      <el-table-column prop="icon" label="图标" />
      <el-table-column prop="orderNum" label="排序" />
      <el-table-column prop="perms" label="权限标识" />
      <el-table-column prop="component" label="组件路径" />
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <dict-tag :options="dictStatus" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column fixed="right" label="操作" width="120">
        <template #default="scope">
          <el-button link type="danger" size="small" @click.prevent="deleteRow(scope.row)"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <!--    <div>-->
    <!--      <pagination v-model:pageSize="pageSize" v-model:currentPage="currentPage" :total="total" @pagination="getTableData()" />-->
    <!--    </div>-->
  </div>
</template>
<style scoped></style>
