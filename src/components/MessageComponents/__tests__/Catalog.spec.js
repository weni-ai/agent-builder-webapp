import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import Catalog from '../Catalog.vue';

describe('MessageComponents/Catalog.vue', () => {
  let wrapper;

  const catalogContainer = () => wrapper.find('[data-testid="catalog"]');
  const catalogButton = () =>
    wrapper.findComponent('[data-testid="catalog-button"]');

  const mockMessage = {
    catalog_message: {
      action_button_text: 'View Catalog',
      products: [
        {
          id: '1',
          product: 'Product 1',
          description: 'Description 1',
          price: 100,
        },
        {
          id: '2',
          product: 'Product 2',
          description: 'Description 2',
          price: 150,
        },
      ],
    },
  };

  const createWrapper = (props = {}) => {
    return shallowMount(Catalog, {
      props: {
        message: mockMessage,
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
    it('renders the catalog component correctly', () => {
      expect(catalogContainer().exists()).toBe(true);
      expect(catalogButton().exists()).toBe(true);
    });

    it('renders button with correct text from message prop', () => {
      expect(catalogButton().props('text')).toBe(
        mockMessage.catalog_message.action_button_text,
      );
    });

    it('renders button with correct size and type', () => {
      expect(catalogButton().props('size')).toBe('large');
      expect(catalogButton().props('type')).toBe('secondary');
    });

    it('adds the correct class to the button', () => {
      expect(catalogButton().classes()).toContain('catalog__button');
    });
  });

  describe('Events', () => {
    it('emits open-preview-menu event when button is clicked', async () => {
      await catalogButton().trigger('click');

      expect(wrapper.emitted('open-preview-menu')).toBeTruthy();
      expect(wrapper.emitted('open-preview-menu').length).toBe(1);
    });
  });

  describe('Props validation', () => {
    it('handles message with missing action_button_text', async () => {
      const incompleteMessage = {
        catalog_message: {
          products: mockMessage.catalog_message.products,
        },
      };

      await wrapper.setProps({ message: incompleteMessage });

      expect(catalogButton().props('text')).toBe('');
      expect(wrapper.exists()).toBe(true);
    });
  });
});
