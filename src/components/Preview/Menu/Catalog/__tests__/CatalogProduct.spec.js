import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import CatalogProduct from '../CatalogProduct.vue';
import Text from '@/components/unnnic-intelligence/Text.vue';

describe('CatalogProduct.vue', () => {
  let wrapper;

  const catalogProductContainer = () =>
    wrapper.find('[data-testid="catalog-product"]');
  const productImage = () => wrapper.find('[data-testid="product-image"]');
  const productTitle = () => wrapper.find('[data-testid="product-title"]');
  const productDescription = () =>
    wrapper.find('[data-testid="product-description"]');
  const priceComponent = () =>
    wrapper.findComponent('[data-testid="product-price"]');
  const quantityCounter = () =>
    wrapper.findComponent('[data-testid="quantity-counter"]');
  const removeButton = () =>
    wrapper.findComponent('[data-testid="remove-product-button"]');

  const mockProduct = {
    id: '1',
    product: 'Test Product',
    description: 'Product description here',
    price: 99.99,
    currency: '$',
  };

  const createWrapper = (props = {}) => {
    return shallowMount(CatalogProduct, {
      props: {
        product: mockProduct,
        quantity: 2,
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
      expect(catalogProductContainer().exists()).toBe(true);
      expect(productImage().exists()).toBe(true);
      expect(productTitle().exists()).toBe(true);
      expect(productDescription().exists()).toBe(true);
      expect(priceComponent().exists()).toBe(true);
    });

    it('displays the product title', () => {
      expect(productTitle().text()).toBe(mockProduct.product);
    });

    it('displays the product description', () => {
      expect(productDescription().text()).toBe(mockProduct.description);
    });

    it('passes correct props to ProductPrice component', () => {
      expect(priceComponent().attributes('currency')).toBe(
        mockProduct.currency,
      );
      expect(priceComponent().attributes('price')).toBe(`${mockProduct.price}`);
    });

    it('renders QuantityCounter when enableUpdateQuantity is true', () => {
      expect(quantityCounter().attributes('quantity')).toBe('2');
    });

    it('does not render QuantityCounter when enableUpdateQuantity is false', async () => {
      await wrapper.setProps({ enableUpdateQuantity: false });
      expect(quantityCounter().exists()).toBe(false);
    });

    it('renders RemoveProductButton when enableRemoveProduct is true', async () => {
      await wrapper.setProps({ enableRemoveProduct: true });
      expect(removeButton().exists()).toBe(true);
    });

    it('does not render RemoveProductButton when enableRemoveProduct is false', () => {
      expect(removeButton().exists()).toBe(false);
    });
  });

  describe('Computed properties', () => {
    it('displays product name when enableUpdateQuantity is true', () => {
      expect(productTitle().text()).toBe(mockProduct.product);
    });

    it('displays product name with quantity when enableUpdateQuantity is false', async () => {
      await wrapper.setProps({ enableUpdateQuantity: false });
      expect(productTitle().text()).toBe(`${mockProduct.product} (2 items)`);
    });
  });

  describe('Classes and styling', () => {
    it('does not have selectable class by default', () => {
      expect(catalogProductContainer().classes()).not.toContain(
        'catalog-product--selectable',
      );
    });

    it('adds selectable class when enableSeeProductDetails is true', async () => {
      await wrapper.setProps({ enableSeeProductDetails: true });
      expect(catalogProductContainer().classes()).toContain(
        'catalog-product--selectable',
      );
    });
  });

  describe('Events', () => {
    it('emits click event when clicked', async () => {
      await catalogProductContainer().trigger('click');
      expect(wrapper.emitted('click')).toBeTruthy();
      expect(wrapper.emitted('click').length).toBe(1);
    });

    it('emits update:quantity event when quantity counter emits increment', async () => {
      await quantityCounter().vm.$emit('increment');
      expect(wrapper.emitted('update:quantity')).toBeTruthy();
      expect(wrapper.emitted('update:quantity')[0]).toEqual([3]); // 2 + 1
    });

    it('emits update:quantity event when quantity counter emits decrement', async () => {
      await quantityCounter().vm.$emit('decrement');
      expect(wrapper.emitted('update:quantity')).toBeTruthy();
      expect(wrapper.emitted('update:quantity')[0]).toEqual([1]); // 2 - 1
    });

    it('does not decrement quantity below 0', async () => {
      await wrapper.setProps({ quantity: 0 });
      await quantityCounter().vm.$emit('decrement');
      expect(wrapper.emitted('update:quantity')).toBeFalsy();
    });

    it('emits update:quantity with 0 when remove button is clicked', async () => {
      await wrapper.setProps({ enableRemoveProduct: true });
      await removeButton().vm.$emit('click');
      expect(wrapper.emitted('update:quantity')).toBeTruthy();
      expect(wrapper.emitted('update:quantity')[0]).toEqual([0]);
    });
  });
});
