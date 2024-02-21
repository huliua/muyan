<template>
    <component :is="type" v-bind="linkProps()">
        <slot />
    </component>
</template>
  
<script setup>
import { computed } from 'vue';
const props = defineProps({
    to: {
        type: [String, Object],
        required: true
    },
    isLink: {
        type: Boolean,
        default: false
    }
});

const isExt = computed(() => {
    return isExternal(props);
});

const type = computed(() => {
    if (isExt.value) {
        return 'a';
    }
    return 'router-link';
});

function linkProps() {
    if (isExt.value) {
        return {
            href: props.to,
            target: '_blank',
            rel: 'noopener'
        };
    }
    return {
        to: props.to
    };
}

/**
 * 判断是否为外链
 * @param {*} path 路径
 */
function isExternal(props) {
    return props.hasOwnProperty("isLink") ? props.isLink : /^(https?:|mailto:|tel:)/.test(path);
}
</script>
  