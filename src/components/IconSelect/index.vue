<script setup>
import icons from './requireIcons';

const props = defineProps({
  activeIcon: {
    type: String,
    default: ''
  }
});
const iconName = ref('');
const emits = defineEmits(['selected']);
const iconList = ref(icons);
const filterIcons = function () {
  iconList.value = icons;
  if (iconName.value) {
    iconList.value = iconList.value.filter(item => item.indexOf(iconName.value) >= 0);
  }
};

const selectedIcon = function (name) {
  emits('selected', name);
  document.body.click();
};

const reset = function () {
  iconName.value = '';
  filterIcons();
};

// 暴露重置方法
defineExpose({
  reset
});

// 定义组件名称
defineOptions({ name: 'IconSelect' });
</script>
<template>
  <div class="icon-body">
    <el-input v-model="iconName" class="icon-search" clearable placeholder="请输入图标名称" @clear="filterIcons" @input="filterIcons">
      <template #suffix><i class="el-icon-search el-input__icon" /></template>
    </el-input>
    <div class="icon-list">
      <div class="list-container">
        <div v-for="(item, index) in iconList" class="icon-item-wrapper" :key="index" @click="selectedIcon(item)">
          <div :class="['icon-item', { active: activeIcon === item }]">
            <svg-icon :icon-class="item" class-name="icon" style="height: 25px; width: 16px" />
            <span>{{ item }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.icon-list .list-container {
  display: flex;
  justify-content: start;
  flex-wrap: wrap;
  height: 200px;
  overflow: auto;
}

.icon-list .list-container .icon-item-wrapper {
  margin: 8px 0;
}

.icon-list .list-container .icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
}

.icon-list .list-container .icon-item.active {
  background: var(--active-color);
  border-radius: 5px;
}

.icon-list .list-container .icon-item:hover {
  background: var(--active-color);
  border-radius: 5px;
}
</style>
