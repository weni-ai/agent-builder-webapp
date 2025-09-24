import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import RemoveProductButton from '../RemoveProductButton.vue';
import Text from '@/components/unnnic-intelligence/Text.vue';

describe('RemoveProductButton.vue', () => {
  let wrapper;

  const button = () => wrapper.find('[data-testid="remove-product-button"]');
  const buttonText = () =>
    wrapper.findComponent('[data-testid="remove-product-button-text"]');
  const icon = () =>
    wrapper.findComponent('[data-testid="remove-product-button-icon"]');

  const createWrapper = () => {
    return shallowMount(RemoveProductButton, {
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
    it('renders correctly', () => {
      expect(wrapper.exists()).toBe(true);
      expect(button().exists()).toBe(true);
      expect(buttonText().exists()).toBe(true);
      expect(icon().exists()).toBe(true);
    });

    it('displays the correct text from i18n', () => {
      expect(buttonText().text()).toBe('Remove');
    });

    it('has the correct icon', () => {
      expect(icon().attributes('icon')).toBe('delete');
      expect(icon().attributes('scheme')).toBe('neutral-cloudy');
      expect(icon().attributes('size')).toBe('sm');
    });
  });

  describe('Events', () => {
    it('emits click event when button is clicked', async () => {
      await button().trigger('click');

      expect(wrapper.emitted('click')).toBeTruthy();
      expect(wrapper.emitted('click').length).toBe(1);
    });

    it('prevents event propagation with @click.stop', async () => {
      const stopPropagation = vi.fn();
      await button().trigger('click', { stopPropagation });

      expect(stopPropagation).toHaveBeenCalled();
    });
  });
});
