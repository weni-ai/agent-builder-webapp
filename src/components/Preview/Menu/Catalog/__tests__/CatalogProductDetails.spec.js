import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import CatalogProductDetails from '../CatalogProductDetails.vue';
import Text from '@/components/unnnic-intelligence/Text.vue';

describe('CatalogProductDetails.vue', () => {
  let wrapper;

  const productImage = () => wrapper.find('[data-testid="product-image"]');
  const productTitle = () => wrapper.find('[data-testid="product-title"]');
  const productDescription = () =>
    wrapper.find('[data-testid="product-description"]');
  const productPrice = () => wrapper.find('[data-testid="product-price"]');

  const mockProduct = {
    id: '1',
    product: 'Test Product',
    description: 'Product description here',
    price: 99.99,
    currency: '$',
  };

  const createWrapper = (props = {}) => {
    return shallowMount(CatalogProductDetails, {
      props: {
        product: mockProduct,
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
      expect(wrapper.exists()).toBe(true);
      expect(productImage().exists()).toBe(true);
      expect(productTitle().exists()).toBe(true);
      expect(productDescription().exists()).toBe(true);
      expect(productPrice().exists()).toBe(true);
    });

    it('displays the correct product information', () => {
      expect(productTitle().text()).toBe(mockProduct.product);
      expect(productDescription().text()).toBe(mockProduct.description);
    });

    it('passes correct props to ProductPrice component', () => {
      expect(productPrice().attributes('currency')).toBe(mockProduct.currency);
      expect(productPrice().attributes('price')).toBe(
        mockProduct.price.toString(),
      );
      expect(productPrice().attributes('size')).toBe('title-sm');
    });
  });

  describe('Props validation', () => {
    it('handles different product data', async () => {
      const customProduct = {
        id: '2',
        product: 'Custom Product',
        description: 'Custom description',
        price: 49.99,
        currency: '€',
      };

      await wrapper.setProps({ product: customProduct });

      expect(productTitle().text()).toBe(customProduct.product);
      expect(productDescription().text()).toBe(customProduct.description);
      expect(productPrice().attributes('currency')).toBe(
        customProduct.currency,
      );
      expect(productPrice().attributes('price')).toBe(
        customProduct.price.toString(),
      );
    });
  });
});
