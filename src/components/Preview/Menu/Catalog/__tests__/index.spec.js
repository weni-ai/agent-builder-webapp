import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import CatalogComponent from '../index.vue';
import Text from '@/components/unnnic-intelligence/Text.vue';
import i18n from '@/utils/plugins/i18n';

describe('Catalog', () => {
  let wrapper;

  const catalogProducts = () =>
    wrapper.findAllComponents('[data-testid="catalog-product"]');
  const catalogProductDetails = () =>
    wrapper.findComponent('[data-testid="catalog-product-details"]');
  const catalogCartModal = () =>
    wrapper.findComponent('[data-testid="catalog-cart-modal"]');
  const productsSection = () =>
    wrapper.find('[data-testid="catalog-products"]');
  const cartButton = () =>
    wrapper.findComponent('[data-testid="catalog-cart-button"]');
  const cartSection = () => wrapper.find('[data-testid="catalog-cart"]');

  const mockMessage = {
    catalog_message: {
      products: [
        {
          id: '1',
          product: 'Product 1',
          description: 'Description 1',
          price: 100,
          currency: '$',
        },
        {
          id: '2',
          product: 'Product 2',
          description: 'Description 2',
          price: 50,
          currency: '$',
        },
      ],
    },
  };

  const createWrapper = (props = {}) => {
    return shallowMount(CatalogComponent, {
      props: {
        message: mockMessage,
        selectedProduct: null,
        ...props,
      },
      global: {
        stubs: {
          UnnnicIntelligenceText: Text,
        },
      },
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders products section with products', () => {
      expect(productsSection().exists()).toBe(true);
      expect(catalogProducts()).toHaveLength(2);
      expect(catalogProductDetails().exists()).toBe(false);
    });

    it('renders product details when a product is selected', async () => {
      const product = mockMessage.catalog_message.products[0];
      await wrapper.setProps({ selectedProduct: product });

      expect(productsSection().exists()).toBe(false);
      expect(catalogProductDetails().exists()).toBe(true);
      expect(catalogProductDetails().props('product')).toEqual(product);
    });

    it('does not render cart section initially', () => {
      expect(cartSection().exists()).toBe(false);
    });

    it('renders cart section when a product is selected', async () => {
      const product = mockMessage.catalog_message.products[0];
      await wrapper.setProps({ selectedProduct: product });

      expect(cartSection().exists()).toBe(true);
      expect(cartButton().exists()).toBe(true);
      expect(cartButton().props('text')).toBe('Add to cart');
    });

    it('renders cart modal but initially hidden', () => {
      expect(catalogCartModal().exists()).toBe(true);
      expect(catalogCartModal().props('modelValue')).toBe(false);
    });
  });

  describe('Product interaction', () => {
    it('sets selected product when a product is clicked', async () => {
      const product = mockMessage.catalog_message.products[0];
      await catalogProducts()[0].vm.$emit('click');

      expect(wrapper.emitted('update:selectedProduct')).toBeTruthy();
      expect(wrapper.emitted('update:selectedProduct')[0][0]).toEqual(product);
    });

    it('opens product details when a product is clicked', async () => {
      const product = mockMessage.catalog_message.products[0];
      await wrapper.setProps({ selectedProduct: product });

      expect(catalogProductDetails().exists()).toBe(true);
    });
  });

  describe('Cart operations', () => {
    it('adds product to cart when cart button is clicked in product details', async () => {
      const product = mockMessage.catalog_message.products[0];
      await wrapper.setProps({ selectedProduct: product });

      await cartButton().vm.$emit('click');

      expect(wrapper.vm.cartItems).toHaveLength(1);
      expect(wrapper.vm.cartItems[0].id).toBe(product.id);
      expect(wrapper.vm.cartItems[0].quantity).toBe(1);

      expect(wrapper.emitted('update:selectedProduct')).toBeTruthy();
      expect(wrapper.emitted('update:selectedProduct')[0][0]).toBeNull();
    });

    it('updates quantity when a product already in cart is added again', async () => {
      const product = mockMessage.catalog_message.products[0];

      await wrapper.setProps({ selectedProduct: product });
      await cartButton().vm.$emit('click');

      await wrapper.setProps({ selectedProduct: product });
      await cartButton().vm.$emit('click');

      expect(wrapper.vm.cartItems).toHaveLength(1);
      expect(wrapper.vm.cartItems[0].quantity).toBe(2);
    });

    it('opens cart modal when view cart button is clicked', async () => {
      const product = mockMessage.catalog_message.products[0];

      wrapper.vm.updateProductQuantity(product.id, 1);
      await wrapper.vm.$nextTick();

      await cartButton().vm.$emit('click');

      expect(wrapper.vm.isCartOpen).toBe(true);
      expect(catalogCartModal().props('modelValue')).toBe(true);
    });

    it('closes cart modal when close event is emitted', async () => {
      wrapper.vm.isCartOpen = true;
      await wrapper.vm.$nextTick();

      await catalogCartModal().vm.$emit('close');

      expect(wrapper.vm.isCartOpen).toBe(false);
    });

    it('emits send-order event when place-order is emitted from modal', async () => {
      const product = mockMessage.catalog_message.products[0];
      wrapper.vm.updateProductQuantity(product.id, 2);
      await wrapper.vm.$nextTick();

      await catalogCartModal().vm.$emit('place-order');

      expect(wrapper.emitted('send-order')).toBeTruthy();
      const emittedOrder = wrapper.emitted('send-order')[0][0];
      expect(emittedOrder.products).toHaveLength(1);
      expect(emittedOrder.products[0].id).toBe(product.id);
      expect(emittedOrder.productsQuantity).toBe(2);
      expect(emittedOrder.subtotal).toBe(200); // 2 * $100
    });
  });

  describe('Computed properties', () => {
    it('calculates cart items quantity correctly', async () => {
      wrapper.vm.updateProductQuantity('1', 2);
      wrapper.vm.updateProductQuantity('2', 3);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.cartItemsQuantity).toBe(5);
    });

    it('calculates subtotal correctly', async () => {
      wrapper.vm.updateProductQuantity('1', 2); // 2 * $100 = $200
      wrapper.vm.updateProductQuantity('2', 3); // 3 * $50 = $150
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.cartSubtotal).toBe(350); // $200 + $150
    });

    it('formats decimal subtotal with two decimals', async () => {
      const decimalProduct = {
        id: '3',
        product: 'Product 3',
        description: 'Description 3',
        price: 10.99,
        currency: '$',
      };
      const mockMessageWithDecimal = {
        catalog_message: {
          products: [...mockMessage.catalog_message.products, decimalProduct],
        },
      };

      wrapper = createWrapper({ message: mockMessageWithDecimal });
      wrapper.vm.updateProductQuantity('3', 2); // 2 * $10.99 = $21.98
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.cartSubtotal).toBe('21.98');
    });

    it('sets correct cart button text', async () => {
      const product = mockMessage.catalog_message.products[0];
      await wrapper.setProps({ selectedProduct: product });
      expect(wrapper.vm.cartButtonText).toBe(
        i18n.global.t('router.preview.catalog.add_to_cart'),
      );

      await wrapper.setProps({ selectedProduct: null });
      wrapper.vm.updateProductQuantity('1', 2);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.cartButtonText).toBe(
        i18n.global.t(
          'router.preview.catalog.view_cart',
          mockMessage.catalog_message.products.length,
          { quantity: mockMessage.catalog_message.products.length },
        ),
      );
    });
  });

  describe('Cart item management', () => {
    it('adds a new product to cart', async () => {
      wrapper.vm.updateProductQuantity('1', 1);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.cartItems).toHaveLength(1);
      expect(wrapper.vm.cartItems[0].id).toBe('1');
      expect(wrapper.vm.cartItems[0].quantity).toBe(1);
    });

    it('updates quantity of existing product', async () => {
      wrapper.vm.updateProductQuantity('1', 1);
      await wrapper.vm.$nextTick();

      wrapper.vm.updateProductQuantity('1', 3);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.cartItems).toHaveLength(1);
      expect(wrapper.vm.cartItems[0].quantity).toBe(3);
    });

    it('removes product when quantity is zero', async () => {
      wrapper.vm.updateProductQuantity('1', 1);
      await wrapper.vm.$nextTick();

      wrapper.vm.updateProductQuantity('1', 0);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.cartItems).toHaveLength(0);
    });

    it('does nothing when trying to update non-existing product with zero quantity', async () => {
      wrapper.vm.updateProductQuantity('999', 0);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.cartItems).toHaveLength(0);
    });
  });
});
