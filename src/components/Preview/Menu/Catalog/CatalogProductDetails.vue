<template>
  <section class="catalog-product-details">
    <section class="product-details__image">
      <img
        class="image__element"
        src="#"
        data-testid="product-image"
      />
    </section>

    <section
      class="product-details__content"
      data-testid="product-content"
    >
      <UnnnicIntelligenceText
        class="product-details__title"
        data-testid="product-title"
        color="neutral-dark"
        family="secondary"
        weight="bold"
        size="body-gt"
      >
        {{ product.product }}
      </UnnnicIntelligenceText>

      <UnnnicIntelligenceText
        class="product-details__description"
        data-testid="product-description"
        color="neutral-cloudy"
        family="secondary"
        weight="regular"
        size="body-md"
      >
        {{ product.description }}
      </UnnnicIntelligenceText>

      <ProductPrice
        class="product-details__price"
        data-testid="product-price"
        :currency="product.currency"
        :price="product.price"
        size="title-sm"
      />
    </section>
  </section>
</template>

<script setup>
import ProductPrice from './ProductPrice.vue';

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.catalog-product-details {
  display: flex;
  flex-direction: column;

  .product-details__image {
    width: 100%;
    aspect-ratio: 1/1;

    .image__element {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .product-details__content {
    padding: $unnnic-spacing-sm $unnnic-spacing-md;
    display: flex;
    flex-direction: column;

    .product-details__description {
      margin-top: $unnnic-spacing-xs;
    }

    .product-details__price {
      margin-top: $unnnic-spacing-sm;
    }
  }
}
</style>
