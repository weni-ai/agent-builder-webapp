<template>
  <section class="catalog">
    <CatalogProductDetails
      v-if="localSelectedProduct"
      data-testid="catalog-product-details"
      :product="localSelectedProduct"
    />
    <section
      v-else
      class="catalog__products"
      data-testid="catalog-products"
    >
      <CatalogProduct
        v-for="(product, index) in products"
        :key="`product-${index}`"
        class="catalog__product"
        data-testid="catalog-product"
        :product="product"
        :quantity="getProductQuantity(product.id)"
        :enableSeeProductDetails="true"
        @click="openProductDetails(product)"
        @update:quantity="updateProductQuantity(product.id, $event)"
      />
    </section>

    <section
      v-if="localSelectedProduct || cartItemsQuantity > 0"
      class="catalog__cart"
      data-testid="catalog-cart"
    >
      <UnnnicButton
        type="primary"
        data-testid="catalog-cart-button"
        :text="cartButtonText"
        @click="handleCartAction"
      />
    </section>

    <CatalogCartModal
      v-model="isCartOpen"
      data-testid="catalog-cart-modal"
      :products="cartItems"
      :subtotal="cartSubtotal"
      @update:quantity="updateProductQuantity"
      @close="closeCart"
      @place-order="placeOrder"
    />
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';

import i18n from '@/utils/plugins/i18n';

import CatalogProduct from './CatalogProduct.vue';
import CatalogProductDetails from './CatalogProductDetails.vue';
import CatalogCartModal from './CatalogCartModal.vue';

const emit = defineEmits([
  'send-message',
  'send-order',
  'update:selectedProduct',
]);

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  selectedProduct: {
    type: Object,
    default: null,
  },
});

const products = computed(() => props.message.catalog_message.products || []);

const localSelectedProduct = computed({
  get: () => props.selectedProduct,
  set: (value) => emit('update:selectedProduct', value),
});

const cartButtonText = computed(() => {
  if (localSelectedProduct.value) {
    return i18n.global.t('router.preview.catalog.add_to_cart');
  }

  return i18n.global.t(
    'router.preview.catalog.view_cart',
    cartItemsQuantity.value,
    {
      quantity: cartItemsQuantity.value,
    },
  );
});

const cartItems = ref([]);
const isCartOpen = ref(false);

const cartItemsQuantity = computed(() =>
  cartItems.value.reduce((acc, item) => acc + item.quantity, 0),
);

const cartSubtotal = computed(() => {
  const subtotal = cartItems.value.reduce(
    (acc, product) => acc + product.price * product.quantity,
    0,
  );

  return subtotal % 1 === 0 ? subtotal : subtotal.toFixed(2);
});

const order = computed(() => ({
  products: cartItems.value,
  productsQuantity: cartItemsQuantity.value,
  subtotal: cartSubtotal.value,
}));

function openProductDetails(product) {
  localSelectedProduct.value = product;
}

function getProductIndex(productId) {
  return cartItems.value.findIndex((product) => product.id === productId);
}

function getProductQuantity(productId) {
  const productInCart = cartItems.value.find(
    (product) => product.id === productId,
  );
  return productInCart?.quantity || 0;
}

function updateProductQuantity(productId, quantity) {
  const productIndex = getProductIndex(productId);

  if (productIndex === -1 && quantity > 0) {
    addNewProductToCart(productId, quantity);
    return;
  }

  if (quantity === 0 && productIndex !== -1) {
    removeProductFromCart(productIndex);
    return;
  }

  if (productIndex !== -1) {
    updateExistingProductQuantity(productIndex, quantity);
  }
}

function addNewProductToCart(productId, quantity) {
  const productToAdd = products.value.find(
    (product) => product.id === productId,
  );

  if (productToAdd) {
    cartItems.value.push({ ...productToAdd, quantity });
  }
}

function removeProductFromCart(productIndex) {
  cartItems.value.splice(productIndex, 1);
}

function updateExistingProductQuantity(productIndex, quantity) {
  cartItems.value[productIndex].quantity = quantity;
}

function addProductToCart(productId) {
  updateProductQuantity(productId, getProductQuantity(productId) + 1);
  localSelectedProduct.value = null;
}

function handleCartAction() {
  if (localSelectedProduct.value) {
    addProductToCart(localSelectedProduct.value.id);
  } else {
    openCart();
  }
}

function openCart() {
  isCartOpen.value = true;
}

function closeCart() {
  isCartOpen.value = false;
}

function placeOrder() {
  emit('send-order', order.value);
}
</script>

<style lang="scss" scoped>
.catalog {
  overflow: hidden;
  height: 100%;
  display: grid;
  grid-template-rows: 1fr auto;

  &__products {
    overflow-y: auto;
  }

  &__cart {
    border-top: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
    padding: $unnnic-spacing-sm $unnnic-spacing-md;
    display: grid;
  }
}
</style>
