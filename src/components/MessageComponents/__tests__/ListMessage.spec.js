import { shallowMount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';

import ListMessage from '../ListMessage.vue';

describe('ListMessage.vue', () => {
  let wrapper;

  const listMessage = () => wrapper.find('[data-testid="list-message"]');
  const listButton = () => wrapper.find('[data-testid="list-button"]');

  const mockMessage = {
    list_message: {
      button_text: 'View List',
    },
  };

  beforeEach(() => {
    wrapper = shallowMount(ListMessage, {
      props: {
        message: mockMessage,
      },
    });
  });

  describe('Component rendering', () => {
    it('renders correctly with required props', () => {
      expect(wrapper.exists()).toBe(true);
      expect(listMessage().exists()).toBe(true);
    });

    it('renders button with correct text from message prop', () => {
      expect(listButton().exists()).toBe(true);
      expect(listButton().attributes('text')).toBe(
        mockMessage.list_message.button_text,
      );
    });
  });

  describe('User interactions', () => {
    it('emits open-preview-menu event when button is clicked', async () => {
      await listButton().trigger('click');

      expect(wrapper.emitted('open-preview-menu')).toBeTruthy();
      expect(wrapper.emitted('open-preview-menu').length).toBe(1);
    });
  });
});
