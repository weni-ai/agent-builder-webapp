import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import PreviewMenu from '../index.vue';
import ListMessages from '../ListMessages.vue';
import Catalog from '../Catalog/index.vue';
import Text from '@/components/unnnic-intelligence/Text.vue';

const mockListMessage = {
  interaction_type: 'list',
  list_message: {
    list_items: [{ title: 'Item 1', description: 'Description 1' }],
  },
};

const mockCatalogMessage = {
  catalog_message: {
    products: [
      {
        id: '1',
        product: 'Product 1',
        description: 'Description 1',
        price: 100,
      },
    ],
  },
};

describe('PreviewMenu.vue', () => {
  let wrapper;

  const headerComponent = () =>
    wrapper.findComponent('[data-testid="menu-header"]');
  const content = () => wrapper.find('[data-testid="menu-content"]');
  const contentComponent = () =>
    wrapper.findComponent('[data-testid="menu-content-component"]');

  const createWrapper = (props = {}) => {
    return shallowMount(PreviewMenu, {
      props: {
        title: 'Test Menu',
        modelValue: true,
        message: {},
        ...props,
      },
      global: {
        stubs: {
          UnnnicIntelligenceText: Text,
          MenuHeader: true,
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
    it('does not render content when message is empty', async () => {
      await wrapper.setProps({ message: null });

      expect(contentComponent().exists()).toBe(false);
    });

    it('renders correctly with required props', () => {
      expect(wrapper.exists()).toBe(true);
      expect(headerComponent().exists()).toBe(true);
      expect(content().exists()).toBe(true);
    });

    it('passes the dynamic title to MenuHeader component', async () => {
      const customTitle = 'Custom Menu Title';
      await wrapper.setProps({ title: customTitle });

      expect(headerComponent().props('title')).toBe(customTitle);
    });
  });

  describe('Component resolution', () => {
    it('resolves to ListMessages component for list message type', async () => {
      await wrapper.setProps({ message: mockListMessage });

      expect(wrapper.vm.resolvedComponent).toBe(ListMessages);
    });

    it('resolves to Catalog component for catalog message type', async () => {
      await wrapper.setProps({ message: mockCatalogMessage });

      expect(wrapper.vm.resolvedComponent).toBe(Catalog);
    });

    it('returns null for unsupported message types', async () => {
      const unknownMessage = {
        interaction_type: 'unknown',
      };

      await wrapper.setProps({ message: unknownMessage });

      expect(wrapper.vm.resolvedComponent).toBeNull();
    });
  });

  describe('Events', () => {
    it('emits update:model-value event when close event is triggered from header', async () => {
      await headerComponent().vm.$emit('close');

      expect(wrapper.emitted('update:model-value')).toBeTruthy();
      expect(wrapper.emitted('update:model-value')[0]).toEqual([false]);
    });

    it('forwards send-message event from content component', async () => {
      await wrapper.setProps({ message: mockListMessage });

      await contentComponent().vm.$emit('send-message', 'Test message');

      expect(wrapper.emitted('send-message')).toBeTruthy();
      expect(wrapper.emitted('send-message')[0]).toEqual(['Test message']);
    });

    it('forwards send-order event from content component', async () => {
      await wrapper.setProps({ message: mockCatalogMessage });

      const mockOrder = { products: [{ id: '1', quantity: 2 }], subtotal: 200 };
      await contentComponent().vm.$emit('send-order', mockOrder);

      expect(wrapper.emitted('send-order')).toBeTruthy();
      expect(wrapper.emitted('send-order')[0]).toEqual([mockOrder]);
    });
  });
});
