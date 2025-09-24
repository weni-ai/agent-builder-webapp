import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';

import QuickReplies from '../QuickReplies.vue';

describe('QuickReplies.vue', () => {
  let wrapper;

  const quickRepliesContainer = () =>
    wrapper.find('[data-testid="quick-replies"]');
  const replyButtons = () =>
    wrapper.findAll('[data-testid="quick-reply-button"]');

  const mockMessage = {
    quick_replies: ['Option 1', 'Option 2', 'Option 3'],
  };

  beforeEach(() => {
    wrapper = shallowMount(QuickReplies, {
      props: {
        message: mockMessage,
      },
    });
  });

  describe('Component rendering', () => {
    it('renders correctly with required props', () => {
      expect(quickRepliesContainer().exists()).toBe(true);
    });

    it('renders the correct number of reply buttons', () => {
      expect(replyButtons().length).toBe(3);
    });

    it('renders each button with the correct text', () => {
      const buttons = replyButtons();
      expect(buttons[0].attributes('text')).toBe('Option 1');
      expect(buttons[1].attributes('text')).toBe('Option 2');
      expect(buttons[2].attributes('text')).toBe('Option 3');
    });
  });

  describe('User interactions', () => {
    it('emits send-message event with reply text when a button is clicked', async () => {
      const buttons = replyButtons();
      await buttons[1].trigger('click');

      expect(wrapper.emitted('send-message')).toBeTruthy();
      expect(wrapper.emitted('send-message')[0]).toEqual(['Option 2']);
    });

    it('emits send-message events for different buttons', async () => {
      const buttons = replyButtons();

      await buttons[0].trigger('click');
      await buttons[2].trigger('click');

      expect(wrapper.emitted('send-message').length).toBe(2);
      expect(wrapper.emitted('send-message')[0]).toEqual(['Option 1']);
      expect(wrapper.emitted('send-message')[1]).toEqual(['Option 3']);
    });
  });
});
