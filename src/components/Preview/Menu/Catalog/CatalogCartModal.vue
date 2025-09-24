<template>
  <UnnnicModalDialog
    data-testid="modal"
    class="catalog-cart-modal"
    :modelValue="modelValue"
    showCloseIcon
    :title="modalTitle"
    @update:model-value="close"
  >
    <section
      class="catalog-cart-modal__products"
      data-testid="products"
    >
      <CatalogProduct
        v-for="product in products"
        :key="product.id"
        data-testid="product"
        :product="product"
        :quantity="product.quantity"
        :enableUpdateQuantity="enablePlaceOrder"
        :enableRemoveProduct="enablePlaceOrder"
        @update:quantity="$emit('update:quantity', product.id, $event)"
      />
    </section>

    <section class="catalog-cart-modal__subtotal">
      <UnnnicIntelligenceText
        data-testid="subtotal-label"
        tag="p"
        color="neutral-dark"
        family="secondary"
        size="body-lg"
        weight="bold"
      >
        {{ $t('router.preview.catalog.subtotal') }}
      </UnnnicIntelligenceText>

      <UnnnicIntelligenceText
        data-testid="subtotal-value"
        tag="p"
        color="weni-600"
        family="secondary"
        size="title-sm"
        weight="bold"
      >
        {{ formattedSubtotal }}
      </UnnnicIntelligenceText>
    </section>

    <UnnnicButton
      v-if="enablePlaceOrder"
      data-testid="place-order-button"
      class="catalog-cart-modal__place-order"
      :text="$t('router.preview.catalog.place_order')"
      :disabled="!subtotal"
      @click="placeOrder"
    />
  </UnnnicModalDialog>
</template>

<script setup>
import { computed, watch } from 'vue';

import i18n from '@/utils/plugins/i18n';

import CatalogProduct from './CatalogProduct.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  products: {
    type: Array,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  enablePlaceOrder: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([
  'update:modelValue',
  'update:quantity',
  'place-order',
  'close',
]);

const modalTitle = computed(() => {
  return props.enablePlaceOrder
    ? i18n.global.t('router.preview.catalog.your_cart')
    : i18n.global.t('router.preview.catalog.order_details');
});

const formattedSubtotal = computed(() => {
  const currency = props.products[0]?.currency || '$';
  return `${currency} ${props.subtotal}`;
});

function close() {
  emit('update:modelValue', false);
  emit('close');
}

function placeOrder() {
  emit('place-order');
  close();
}

watch(
  () => props.products.length,
  (newProductsLength) => {
    if (newProductsLength === 0) {
      close();
    }
  },
);
</script>

<style lang="scss" scoped>
.catalog-cart-modal {
  :deep(.unnnic-modal-dialog__container__content) {
    padding: 0;
  }

  &__subtotal {
    padding: $unnnic-spacing-sm $unnnic-spacing-md;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: $unnnic-spacing-xs;
    border-bottom: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  }

  &__place-order {
    margin: $unnnic-spacing-sm $unnnic-spacing-md $unnnic-spacing-md
      $unnnic-spacing-md;
    width: calc(100% - ($unnnic-spacing-md * 2));
  }
}
</style>
