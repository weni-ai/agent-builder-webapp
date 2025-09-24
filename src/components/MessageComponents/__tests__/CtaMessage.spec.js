import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';

import CtaMessage from '../CtaMessage.vue';

describe('CtaMessage.vue', () => {
  let wrapper;

  const ctaMessage = () => wrapper.find('[data-testid="cta-message"]');
  const ctaButton = () => wrapper.find('[data-testid="cta-button"]');

  const mockMessage = {
    cta_message: {
      url: 'https://example.com',
      display_text: 'Visit Example',
    },
  };

  const mockWindowOpen = vi.fn();
  window.open = mockWindowOpen;

  beforeEach(() => {
    wrapper = shallowMount(CtaMessage, {
      props: {
        message: mockMessage,
      },
    });
  });

  describe('Component rendering', () => {
    it('renders correctly with required props', () => {
      expect(wrapper.exists()).toBe(true);
      expect(ctaMessage().exists()).toBe(true);
    });

    it('renders button with correct text from message prop', () => {
      expect(ctaButton().exists()).toBe(true);
      expect(ctaButton().attributes('text')).toBe(
        mockMessage.cta_message.display_text,
      );
    });
  });

  describe('User interactions', () => {
    it('opens URL in new tab when button is clicked', async () => {
      await ctaButton().trigger('click');

      expect(mockWindowOpen).toHaveBeenCalledTimes(1);
      expect(mockWindowOpen).toHaveBeenCalledWith(
        mockMessage.cta_message.url,
        '_blank',
      );
    });

    it('opens secure URL in new tab when button is clicked', async () => {
      mockMessage.cta_message.url = 'www.relative-path.com';
      await ctaButton().trigger('click');

      expect(mockWindowOpen).toHaveBeenCalledWith(
        `https://${mockMessage.cta_message.url}`,
        '_blank',
      );
    });
  });
});
