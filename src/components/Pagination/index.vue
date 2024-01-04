<script setup>
import { computed } from 'vue';
const emit = defineEmits();
const handleSizeChange = function (val) {
    if (val * page.value > props.total) {
        page.value = 1;
    }
    emit('pagination', { currentPage: page.value, pageSize: val });
};
const handleCurrentChange = function (val) {
    emit('pagination', { currentPage: val, pageSize: size.value });
};
const props = defineProps({
    currentPage: {
        type: Number,
        default: 1,
        required: true
    },
    pageSize: {
        type: Number,
        default: 10,
        required: true
    },
    total: {
        type: Number,
        default: 0,
        required: true
    }
});
const page = computed({
    get() {
        return props.currentPage;
    },
    set(val) {
        emit('update:currentPage', val);
    }
});
const size = computed({
    get() {
        return props.pageSize;
    },
    set(val) {
        emit('update:pageSize', val);
    }
});
</script>
<template>
    <div class="pagination-container">
        <el-pagination v-model:current-page="page" v-model:page-size="size" :background="true" :page-sizes="[10, 20, 50, 100]" :small="true" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
</template>
<style scoped>
.pagination-container {
    position: relative;
    height: 25px;
    margin-bottom: 10px;
    margin-top: 15px;
    padding: 10px 20px !important;
}

.pagination-container .el-pagination {
    right: 0;
    position: absolute
}
</style>