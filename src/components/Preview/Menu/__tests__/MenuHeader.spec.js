import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import MenuHeader from '../MenuHeader.vue';
import Text from '@/components/unnnic-intelligence/Text.vue';

describe('MenuHeader.vue', () => {
  let wrapper;

  const title = () => wrapper.find('[data-testid="menu-title"]');
  const closeButton = () => wrapper.find('[data-testid="menu-close-button"]');

  const createWrapper = (props = {}) => {
    return shallowMount(MenuHeader, {
      props: {
        title: 'Test Header',
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
      expect(title().exists()).toBe(true);
      expect(closeButton().exists()).toBe(true);
    });

    it('displays the provided title', () => {
      const testTitle = 'Test Header';
      expect(title().text()).toBe(testTitle);
    });

    it('updates title when prop changes', async () => {
      const newTitle = 'New Header Title';
      await wrapper.setProps({ title: newTitle });
      expect(title().text()).toBe(newTitle);
    });
  });

  describe('Events', () => {
    it('emits close event when close button is clicked', async () => {
      await closeButton().trigger('click');

      expect(wrapper.emitted('close')).toBeTruthy();
      expect(wrapper.emitted('close').length).toBe(1);
    });
  });
});
