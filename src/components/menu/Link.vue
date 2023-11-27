<template>
    <component :is="type" v-bind="linkProps()">
        <slot />
    </component>
</template>
  
<script setup>
import {computed} from 'vue';
const props = defineProps({
    to: {
        type: [String, Object],
        required: true
    }
})

const isExt = computed(() => {
    return isExternal(props.to)
})

const type = computed(() => {
    if (isExt.value) {
        return 'a'
    }
    return 'router-link'
})

function linkProps() {    
    if (isExt.value) {
        return {
            href: props.to,
            target: '_blank',
            rel: 'noopener'
        }
    }
    return {
        to: props.to
    }
}

/**
 * 判断是否为外链
 * @param {*} path 路径
 */
function isExternal(path) {
    return /^(https?:|mailto:|tel:)/.test(path);
}
</script>
  