<template>
  <section
    class="catalog-product"
    data-testid="catalog-product"
    :class="{ 'catalog-product--selectable': enableSeeProductDetails }"
    @click="$emit('click')"
  >
    <section class="product__image">
      <img
        class="image__element"
        src="#"
        data-testid="product-image"
      />
    </section>

    <section class="product__content">
      <header class="content__header">
        <UnnnicIntelligenceText
          color="neutral-dark"
          family="secondary"
          weight="bold"
          size="body-gt"
          data-testid="product-title"
          class="header__title"
        >
          {{ titleText }}
        </UnnnicIntelligenceText>

        <UnnnicIntelligenceText
          class="header__description"
          color="neutral-cloudy"
          family="secondary"
          weight="regular"
          size="body-md"
          data-testid="product-description"
        >
          {{ product.description }}
        </UnnnicIntelligenceText>

        <RemoveProductButton
          v-if="enableRemoveProduct"
          data-testid="remove-product-button"
          @click="removeProduct"
        />
      </header>

      <footer class="content__footer">
        <ProductPrice
          :currency="product.currency"
          :price="product.price"
          data-testid="product-price"
        />

        <QuantityCounter
          v-if="enableUpdateQuantity"
          :quantity="quantity"
          data-testid="quantity-counter"
          @increment="incrementQuantity"
          @decrement="decrementQuantity"
        />
      </footer>
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import ProductPrice from './ProductPrice.vue';
import QuantityCounter from './QuantityCounter.vue';
import RemoveProductButton from './RemoveProductButton.vue';
import i18n from '@/utils/plugins/i18n';

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  enableSeeProductDetails: {
    type: Boolean,
    default: false,
  },
  enableUpdateQuantity: {
    type: Boolean,
    default: true,
  },
  enableRemoveProduct: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['click', 'update:quantity']);

const titleText = computed(() => {
  if (props.enableUpdateQuantity) {
    return props.product.product;
  }

  return `${props.product.product} (${props.quantity} ${i18n.global.tc('router.preview.catalog.items', props.quantity)})`;
});

function updateQuantity(quantity) {
  emit('update:quantity', quantity);
}

function incrementQuantity() {
  updateQuantity(props.quantity + 1);
}

function decrementQuantity() {
  if (props.quantity > 0) {
    updateQuantity(props.quantity - 1);
  }
}

function removeProduct() {
  updateQuantity(0);
}
</script>

<style lang="scss" scoped>
.catalog-product {
  border-bottom: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  padding: $unnnic-spacing-sm $unnnic-spacing-md;
  display: grid;
  grid-template-columns: 1fr 4fr;
  gap: $unnnic-spacing-xs;
  align-items: center;

  &--selectable {
    cursor: pointer;

    &:hover {
      background-color: $unnnic-color-neutral-lightest;
    }
  }

  .product__image {
    border-radius: $unnnic-border-radius-sm;
    overflow: hidden;
    width: 100%;
    aspect-ratio: 1/1;

    .image__element {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .product__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-xs;
    overflow: hidden;

    .content__header {
      display: grid;
      grid-template-columns: 1fr auto;
      grid-template-rows: auto auto;
      grid-template-areas:
        'title remove'
        'description description';
      gap: $unnnic-spacing-nano;

      .header__title {
        grid-area: title;
      }

      .header__description {
        grid-area: description;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }

    .content__footer {
      display: flex;
      justify-content: space-between;
      gap: $unnnic-spacing-xs;
    }
  }
}
</style>
