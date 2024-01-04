<template>
  <div>
    <template v-if="matched">
      <el-tag :disable-transitions="true" :type="isBlank(matchedItem?.tagType) ? '' : matchedItem.tagType">{{ matchedItem.label }}</el-tag>
    </template>
    <template v-if="!matched && alwaysShowValue">
      {{ value }}
    </template>
  </div>
</template>

<script setup>
import { isBlank } from '@/utils/commonUtils';
const matchedItem = computed(() => {
  return props.options.filter(item => item.value === props.value)[0];
});
const matched = computed(() => {
  return !isBlank(matchedItem.value);
});
const props = defineProps({
  // 数据
  options: {
    type: Array,
    default: null
  },
  // 当前的值
  value: {
    type: String,
    default: null
  },
  // 当未找到匹配的数据时，显示value
  alwaysShowValue: {
    type: Boolean,
    default: true
  }
});
// 定义组件名称
defineOptions({ name: 'DictTag' });
</script>

<style scoped></style>
