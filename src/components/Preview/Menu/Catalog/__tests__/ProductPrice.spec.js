import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import ProductPrice from '../ProductPrice.vue';

describe('ProductPrice.vue', () => {
  let wrapper;

  const priceText = () => wrapper.findComponent('[data-testid="price-text"]');

  const createWrapper = (props = {}) => {
    return mount(ProductPrice, {
      props: {
        price: 100,
        ...props,
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
      expect(priceText().exists()).toBe(true);
    });

    it('formats price with default currency symbol', () => {
      expect(priceText().text()).toBe('$ 100');
    });

    it('formats price with custom currency symbol', async () => {
      await wrapper.setProps({ currency: '€', price: 100 });
      expect(priceText().text()).toBe('€ 100');
    });

    it('handles string prices correctly', async () => {
      await wrapper.setProps({ price: '99.99' });
      expect(priceText().text()).toBe('$ 99.99');
    });

    it('applies the default size prop', () => {
      expect(priceText().props('size')).toBe('body-gt');
    });

    it('applies custom size prop when provided', async () => {
      await wrapper.setProps({ size: 'title-sm' });
      expect(priceText().props('size')).toBe('title-sm');
    });
  });

  describe('Props validation', () => {
    it('uses default currency when currency prop is empty', async () => {
      await wrapper.setProps({ currency: '', price: 100 });
      expect(priceText().text()).toBe('$ 100');
    });

    it('handles null currency correctly', async () => {
      await wrapper.setProps({ currency: null, price: 100 });
      expect(priceText().text()).toBe('$ 100');
    });

    it('handles zero prices correctly', async () => {
      await wrapper.setProps({ price: 0 });
      expect(priceText().text()).toBe('$ 0');
    });
  });
});
