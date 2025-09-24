<template>
  <section class="preview-menu">
    <MenuHeader
      :title="dynamicTitle"
      data-testid="menu-header"
      @close="handleClose"
    />

    <section
      class="preview-menu__content"
      data-testid="menu-content"
    >
      <component
        :is="resolvedComponent"
        v-model:selectedProduct="selectedProduct"
        :message="message"
        data-testid="menu-content-component"
        @send-message="handleSendMessage"
        @send-order="handleSendOrder"
      />
    </section>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';

import i18n from '@/utils/plugins/i18n';

import MenuHeader from './MenuHeader.vue';
import ListMessages from './ListMessages.vue';
import Catalog from './Catalog/index.vue';

const emit = defineEmits(['update:model-value', 'send-message', 'send-order']);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Menu',
  },
  message: {
    type: Object,
    required: true,
  },
});

const selectedProduct = ref(null);

const resolvedComponent = computed(() => {
  if (!props.message) return null;

  if (props.message.interaction_type === 'list' && props.message.list_message) {
    return ListMessages;
  }

  if (props.message.catalog_message) {
    return Catalog;
  }

  return null;
});

const dynamicTitle = computed(() => {
  if (resolvedComponent.value === Catalog && selectedProduct.value) {
    return selectedProduct.value.product;
  }

  if (resolvedComponent.value === Catalog) {
    return i18n.global.t('router.preview.catalog.title');
  }

  return props.title;
});

function handleClose() {
  if (resolvedComponent.value === Catalog && selectedProduct.value) {
    selectedProduct.value = null;
  } else {
    emit('update:model-value', false);
  }
}

function handleSendMessage(message) {
  emit('send-message', message);
}

function handleSendOrder(order) {
  emit('send-order', order);
}
</script>

<style lang="scss" scoped>
.preview-menu {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  &__content {
    overflow-y: auto;
    height: 100%;
  }
}
</style>
