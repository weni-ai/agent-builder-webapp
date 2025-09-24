import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import QuantityCounter from '../QuantityCounter.vue';
import Text from '@/components/unnnic-intelligence/Text.vue';

describe('QuantityCounter.vue', () => {
  let wrapper;

  const container = () => wrapper.find('[data-testid="quantity-counter"]');
  const quantityValue = () =>
    wrapper.find('[data-testid="quantity-counter-value"]');
  const decrementButton = () =>
    wrapper.find('[data-testid="quantity-counter-decrement-button"]');
  const incrementButton = () =>
    wrapper.find('[data-testid="quantity-counter-increment-button"]');

  const createWrapper = (props = {}) => {
    return shallowMount(QuantityCounter, {
      props: {
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
      expect(wrapper.exists()).toBe(true);
      expect(quantityValue().exists()).toBe(true);
      expect(decrementButton().exists()).toBe(true);
      expect(incrementButton().exists()).toBe(true);
    });

    it('displays the provided quantity value', () => {
      expect(quantityValue().text()).toBe('2');
    });

    it('updates display when quantity prop changes', async () => {
      await wrapper.setProps({ quantity: 5 });
      expect(quantityValue().text()).toBe('5');
    });
  });

  describe('Events', () => {
    it('emits decrement event when decrement button is clicked', async () => {
      await decrementButton().trigger('click');

      expect(wrapper.emitted('decrement')).toBeTruthy();
      expect(wrapper.emitted('decrement').length).toBe(1);
    });

    it('emits increment event when increment button is clicked', async () => {
      await incrementButton().trigger('click');

      expect(wrapper.emitted('increment')).toBeTruthy();
      expect(wrapper.emitted('increment').length).toBe(1);
    });

    it('prevents event propagation with @click.stop on container', async () => {
      const stopPropagation = vi.fn();
      await container().trigger('click', { stopPropagation });

      expect(stopPropagation).toHaveBeenCalled();
    });

    it('prevents event propagation when buttons are clicked', async () => {
      const stopPropagation = vi.fn();

      await decrementButton().trigger('click', { stopPropagation });
      await incrementButton().trigger('click', { stopPropagation });

      expect(stopPropagation).toHaveBeenCalled();
      expect(stopPropagation.mock.calls.length).toBe(4); // 2 from buttons and 2 from container
    });
  });
});
