import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import CatalogCartModal from '../CatalogCartModal.vue';
import Text from '@/components/unnnic-intelligence/Text.vue';
import i18n from '@/utils/plugins/i18n';

describe('CatalogCartModal.vue', () => {
  let wrapper;

  const modal = () => wrapper.findComponent('[data-testid="modal"]');
  const productsSection = () => wrapper.find('[data-testid="products"]');
  const catalogProducts = () =>
    wrapper.findAllComponents('[data-testid="product"]');
  const subtotalLabel = () => wrapper.find('[data-testid="subtotal-label"]');
  const subtotalValue = () => wrapper.find('[data-testid="subtotal-value"]');
  const placeOrderButton = () =>
    wrapper.findComponent('[data-testid="place-order-button"]');

  const mockProducts = [
    {
      id: '1',
      product: 'Product 1',
      description: 'Description 1',
      price: 100,
      quantity: 2,
      currency: '$',
    },
    {
      id: '2',
      product: 'Product 2',
      description: 'Description 2',
      price: 50,
      quantity: 1,
      currency: '$',
    },
  ];

  const createWrapper = (props = {}) => {
    return shallowMount(CatalogCartModal, {
      props: {
        modelValue: true,
        products: mockProducts,
        subtotal: 250,
        enablePlaceOrder: true,
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
    it('renders correctly with required props', () => {
      expect(modal().exists()).toBe(true);
      expect(productsSection().exists()).toBe(true);
      expect(subtotalLabel().exists()).toBe(true);
      expect(subtotalValue().exists()).toBe(true);
    });

    it('renders all products in the cart', () => {
      expect(catalogProducts()).toHaveLength(mockProducts.length);
    });

    it('renders place order button when enablePlaceOrder is true', () => {
      expect(placeOrderButton().exists()).toBe(true);
    });

    it('does not render place order button when enablePlaceOrder is false', async () => {
      await wrapper.setProps({ enablePlaceOrder: false });
      expect(placeOrderButton().exists()).toBe(false);
    });

    it('passes the correct props to CatalogProduct components', () => {
      const productComponents = catalogProducts();

      expect(productComponents[0].props('product')).toEqual(mockProducts[0]);
      expect(productComponents[0].props('quantity')).toBe(
        mockProducts[0].quantity,
      );
      expect(productComponents[0].props('enableUpdateQuantity')).toBe(true);
      expect(productComponents[0].props('enableRemoveProduct')).toBe(true);

      expect(productComponents[1].props('product')).toEqual(mockProducts[1]);
    });

    it('disables update and remove when enablePlaceOrder is false', async () => {
      await wrapper.setProps({ enablePlaceOrder: false });

      const productComponents = catalogProducts();
      expect(productComponents[0].props('enableUpdateQuantity')).toBe(false);
      expect(productComponents[0].props('enableRemoveProduct')).toBe(false);
    });
  });

  describe('Computed properties', () => {
    it('sets correct modal title when enablePlaceOrder is true', () => {
      expect(modal().props('title')).toBe(
        i18n.global.t('router.preview.catalog.your_cart'),
      );
    });

    it('sets correct modal title when enablePlaceOrder is false', async () => {
      await wrapper.setProps({ enablePlaceOrder: false });
      expect(modal().props('title')).toBe(
        i18n.global.t('router.preview.catalog.order_details'),
      );
    });

    it('formats subtotal correctly with currency', () => {
      expect(subtotalValue().text()).toBe('$ 250');
    });

    it('uses first product currency for formatted subtotal', async () => {
      const euroProducts = [
        { ...mockProducts[0], currency: '€' },
        { ...mockProducts[1], currency: '€' },
      ];

      await wrapper.setProps({ products: euroProducts });
      const subtotalValueText = subtotalValue();
      expect(subtotalValueText.text()).toBe('€ 250');
    });

    it('uses default currency if products array is empty', async () => {
      await wrapper.setProps({ products: [] });
      const subtotalValueText = subtotalValue();
      expect(subtotalValueText.text()).toBe('$ 250');
    });
  });

  describe('Events', () => {
    it('emits update:quantity event when product quantity changes', async () => {
      const productComponent = catalogProducts()[0];
      await productComponent.vm.$emit('update:quantity', 3);

      expect(wrapper.emitted('update:quantity')).toBeTruthy();
      expect(wrapper.emitted('update:quantity')[0]).toEqual([
        mockProducts[0].id,
        3,
      ]);
    });

    it('emits update:modelValue and close events when modal is closed', async () => {
      await modal().vm.$emit('update:model-value', false);

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('emits place-order, update:modelValue and close events when place order button is clicked', async () => {
      await placeOrderButton().trigger('click');

      expect(wrapper.emitted('place-order')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
      expect(wrapper.emitted('close')).toBeTruthy();
    });
  });

  describe('Watchers', () => {
    it('calls close when products array becomes empty', async () => {
      await wrapper.setProps({ products: [] });

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
      expect(wrapper.emitted('close')).toBeTruthy();
    });
  });
});
