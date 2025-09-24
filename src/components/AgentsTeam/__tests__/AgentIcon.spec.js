import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import AgentIcon from '../AgentIcon.vue';

vi.mock('@/utils/agentIconService', () => ({
  agentIcons: {
    Manager: '/path/to/manager-icon.svg',
    ExchangeIcon1: '/path/to/exchange-icon.svg',
    CustomIcon1: '/path/to/custom-icon.svg',
  },
}));

describe('AgentIcon.vue', () => {
  const createWrapper = (props = {}) => {
    return mount(AgentIcon, {
      props,
    });
  };

  const iconElement = (wrapper) => wrapper.find('[data-testid="agent-icon"]');

  describe('rendering', () => {
    it('renders nothing when no icon prop is provided', () => {
      const wrapper = createWrapper();
      expect(iconElement(wrapper).exists()).toBe(false);
    });

    it('renders nothing when an unknown icon is provided', () => {
      const wrapper = createWrapper({ icon: 'NonExistentIcon' });
      expect(iconElement(wrapper).exists()).toBe(false);
    });

    it('renders the icon when a valid icon name is provided', () => {
      const wrapper = createWrapper({ icon: 'Manager' });

      expect(iconElement(wrapper).exists()).toBe(true);
      expect(iconElement(wrapper).attributes('src')).toBe(
        '/path/to/manager-icon.svg',
      );
    });
  });

  describe('prop handling', () => {
    it('uses the correct icon from agentIcons based on prop', () => {
      const wrapper = createWrapper({ icon: 'ExchangeIcon1' });
      expect(iconElement(wrapper).attributes('src')).toBe(
        '/path/to/exchange-icon.svg',
      );
    });

    it('handles empty icon prop', () => {
      const wrapper = createWrapper({ icon: '' });
      expect(iconElement(wrapper).exists()).toBe(false);
    });

    it('handles null icon prop', () => {
      const wrapper = createWrapper({ icon: null });
      expect(iconElement(wrapper).exists()).toBe(false);
    });

    it('handles undefined icon prop', () => {
      const wrapper = createWrapper({ icon: undefined });
      expect(iconElement(wrapper).exists()).toBe(false);
    });
  });

  describe('element attributes', () => {
    it('has proper CSS class', () => {
      const wrapper = createWrapper({ icon: 'CustomIcon1' });
      expect(iconElement(wrapper).classes()).toContain('content__icon');
    });

    it('has correct data-testid attribute', () => {
      const wrapper = createWrapper({ icon: 'CustomIcon1' });
      expect(iconElement(wrapper).attributes('data-testid')).toBe('agent-icon');
    });
  });
});
