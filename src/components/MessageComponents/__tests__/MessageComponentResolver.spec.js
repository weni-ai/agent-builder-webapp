import { shallowMount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';

import MessageComponentResolver from '../MessageComponentResolver.vue';
import QuickRepliesComponent from '../QuickReplies.vue';
import ListMessageComponent from '../ListMessage.vue';
import CtaMessageComponent from '../CtaMessage.vue';
import CatalogComponent from '../Catalog.vue';

describe('MessageComponentResolver.vue', () => {
  let wrapper;

  const messageComponent = () =>
    wrapper.find('[data-testid="message-component"]');

  const setupWrapper = (message) => {
    wrapper = shallowMount(MessageComponentResolver, {
      props: {
        message,
      },
    });
  };

  describe('Component rendering', () => {
    it('does not render any component when message is null', () => {
      setupWrapper(null);
      expect(messageComponent().exists()).toBe(false);
    });

    it('does not render any component when message is invalid', () => {
      setupWrapper({ invalid: 'data' });
      expect(messageComponent().exists()).toBe(false);
    });

    it('renders QuickRepliesComponent when message has quick_replies', () => {
      const message = {
        quick_replies: ['Option 1', 'Option 2'],
      };
      setupWrapper(message);

      expect(messageComponent().exists()).toBe(true);
      expect(wrapper.findComponent(QuickRepliesComponent).exists()).toBe(true);
    });

    it('renders ListMessageComponent when message has interaction_type="list"', () => {
      const message = {
        interaction_type: 'list',
        list_message: { items: [] },
      };
      setupWrapper(message);

      expect(messageComponent().exists()).toBe(true);
      expect(wrapper.findComponent(ListMessageComponent).exists()).toBe(true);
    });

    it('renders CtaMessageComponent when message has interaction_type="cta_url"', () => {
      const message = {
        interaction_type: 'cta_url',
        cta_message: {
          url: 'https://example.com',
          display_text: 'Visit Example',
        },
      };
      setupWrapper(message);

      expect(messageComponent().exists()).toBe(true);
      expect(wrapper.findComponent(CtaMessageComponent).exists()).toBe(true);
    });

    it('renders CatalogComponent when message has catalog_message', () => {
      const message = {
        catalog_message: {
          action_button_text: 'View Catalog',
          products: [{ id: '1', product: 'Product 1' }],
        },
      };
      setupWrapper(message);

      expect(messageComponent().exists()).toBe(true);
      expect(wrapper.findComponent(CatalogComponent).exists()).toBe(true);
    });

    it('renders CatalogComponent when message has header and catalog_message', () => {
      const message = {
        header: { text: 'Catalog Header' },
        catalog_message: {
          action_button_text: 'View Catalog',
          products: [{ id: '1', product: 'Product 1' }],
        },
      };
      setupWrapper(message);

      expect(messageComponent().exists()).toBe(true);
      expect(wrapper.findComponent(CatalogComponent).exists()).toBe(true);
    });

    it('does not render simple text messages', () => {
      const message = {
        text: 'Hello world',
      };
      setupWrapper(message);

      expect(messageComponent().exists()).toBe(false);
    });
  });

  describe('Event handling', () => {
    it('forwards send-message events from child components', async () => {
      const message = {
        quick_replies: ['Option 1', 'Option 2'],
      };

      setupWrapper(message);

      await wrapper
        .findComponent(QuickRepliesComponent)
        .vm.$emit('send-message', 'Option 1');

      expect(wrapper.emitted('send-message')).toBeTruthy();
      expect(wrapper.emitted('send-message')[0]).toEqual(['Option 1']);
    });

    it('forwards open-preview-menu events from child components', async () => {
      const message = {
        quick_replies: ['Option 1', 'Option 2'],
      };

      setupWrapper(message);

      await wrapper
        .findComponent(QuickRepliesComponent)
        .vm.$emit('open-preview-menu');

      expect(wrapper.emitted('open-preview-menu')).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('handles messages with empty quick_replies array', () => {
      const message = {
        quick_replies: [],
      };
      setupWrapper(message);

      expect(messageComponent().exists()).toBe(false);
    });

    it('handles malformed message objects gracefully', () => {
      const message = 'not an object';
      setupWrapper(message);

      expect(messageComponent().exists()).toBe(false);
    });

    it('handles message data that throws error during parsing', () => {
      const message = {};
      Object.defineProperty(message, 'problematic', {
        get: () => {
          throw new Error('Error accessing property');
        },
      });

      setupWrapper(message);
      expect(messageComponent().exists()).toBe(false);
    });
  });
});
