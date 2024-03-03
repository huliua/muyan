<template>
    <div></div>
</template>
<script setup>
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();
const { params, query } = route;
const { path } = params;

router.replace({ path: '/' + path, query });
</script>