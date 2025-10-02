<template>
  <section class="order-summary">
    <header
      class="order-summary__header"
      data-testid="order-summary-header"
    >
      <UnnnicIcon
        icon="shopping_bag"
        size="avatar-nano"
        scheme="neutral-white"
        data-testid="order-summary-icon"
      />
      <UnnnicIntelligenceText
        tag="h2"
        color="neutral-white"
        family="secondary"
        size="body-gt"
        weight="bold"
        data-testid="order-summary-title"
      >
        {{ $t('router.preview.catalog.order_summary') }}
      </UnnnicIntelligenceText>
    </header>

    <section
      class="order-summary__content"
      data-testid="order-summary-content"
    >
      <UnnnicIntelligenceText
        tag="p"
        color="neutral-white"
        family="secondary"
        size="body-md"
        data-testid="order-summary-items-text"
      >
        {{ itemsText }}
      </UnnnicIntelligenceText>

      <UnnnicIntelligenceText
        tag="p"
        color="neutral-white"
        family="secondary"
        size="body-md"
        weight="bold"
        data-testid="order-summary-subtotal-text"
      >
        {{ subtotalText }}
      </UnnnicIntelligenceText>
    </section>

    <UnnnicButton
      class="order-summary__view-details"
      data-testid="order-summary-view-details"
      type="primary"
      :text="$t('router.preview.catalog.view_order_details')"
      size="small"
      @click="handleViewOrderDetails"
    />

    <CatalogCartModal
      v-model="isOrderDetailsOpen"
      data-testid="order-summary-cart-modal"
      :products="order.products"
      :subtotal="order.subtotal"
      :enablePlaceOrder="false"
      @close="handleCloseOrderDetails"
    />
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';

import CatalogCartModal from '@/components/Preview/Menu/Catalog/CatalogCartModal.vue';

import i18n from '@/utils/plugins/i18n';

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['view-details', 'close-order-details']);

const isOrderDetailsOpen = ref(false);

const itemsText = computed(() => {
  return `${props.order.productsQuantity} ${i18n.global.t('router.preview.catalog.items', props.order.productsQuantity)}`;
});

const subtotalText = computed(() => {
  const currency = getCurrencySymbol();
  return `${i18n.global.t('router.preview.catalog.subtotal')}: ${currency} ${props.order.subtotal}`;
});

function getCurrencySymbol() {
  return props.order.products[0]?.currency || '$';
}

function handleViewOrderDetails() {
  isOrderDetailsOpen.value = true;
  emit('view-details');
}

function handleCloseOrderDetails() {
  isOrderDetailsOpen.value = false;
  emit('close-order-details');
}
</script>

<style lang="scss" scoped>
.order-summary {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-xs;

  &__header {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-nano;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-nano;
    padding-bottom: $unnnic-spacing-ant;
    border-bottom: $unnnic-border-width-thinner solid $unnnic-color-weni-300;
  }

  &__view-details.unnnic-button {
    width: 100%;
    padding-left: $unnnic-spacing-xl;
    padding-right: $unnnic-spacing-xl;
  }
}
</style>
